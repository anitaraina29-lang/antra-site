/* ANTRA — PayU success return (Netlify serverless function).
   Flow on the surl redirect from PayU:
   1) Show the buyer a friendly "Thank you" whenever status=success (PayU only
      redirects here on a genuine success).
   2) Confirm the payment SERVER-TO-SERVER via PayU's Verify Payment API
      (reliable, un-fakeable) — and only then auto-create the order in Shiprocket.
   Everything is best-effort: any failure is swallowed and the order still sits in
   PayU (with the shipping address) for manual fulfilment. */
const crypto = require("crypto");

function timeoutSignal(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }

// Server-to-server confirmation with PayU (does not rely on the response hash).
async function verifyWithPayU(txnid) {
  const KEY = process.env.PAY4U_KEY, SALT = process.env.PAY4U_SALT;
  if (!KEY || !SALT || !txnid) return false;
  const command = "verify_payment";
  const hash = crypto.createHash("sha512").update(KEY + "|" + command + "|" + txnid + "|" + SALT).digest("hex");
  const body = new URLSearchParams({ key: KEY, command, var1: txnid, hash }).toString();
  const res = await fetch("https://info.payu.in/merchant/postservice.php?form=2", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: timeoutSignal(8000),
  });
  const j = await res.json();
  const td = j && j.transaction_details && j.transaction_details[txnid];
  const ok = !!(td && String(td.status).toLowerCase() === "success");
  console.log("PAYU_VERIFY", JSON.stringify({ txnid, ok, tdStatus: td && td.status }));
  return { ok, td };
}

async function createShiprocketOrder(b, td) {
  const EMAIL = process.env.SHIPROCKET_EMAIL;
  const PASSWORD = process.env.SHIPROCKET_PASSWORD;
  const PICKUP = process.env.SHIPROCKET_PICKUP;
  // Prefer address echoed in the redirect; fall back to PayU verify details.
  const address = (b.address1 || (td && td.address1) || "").trim();
  const pincode = (b.zipcode || (td && td.zipcode) || "").trim();
  if (!EMAIL || !PASSWORD || !PICKUP || !address || !pincode) {
    console.log("SHIPROCKET_SKIP", JSON.stringify({ hasCreds: !!(EMAIL && PASSWORD && PICKUP), hasAddress: !!address, hasPincode: !!pincode }));
    return { skipped: true };
  }

  const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }), signal: timeoutSignal(8000),
  });
  const auth = await authRes.json();
  if (!auth || !auth.token) { console.log("SHIPROCKET_AUTH_FAIL"); return { error: "auth" }; }

  const d = new Date(); const pad = (n) => String(n).padStart(2, "0");
  const orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const payload = {
    order_id: b.txnid || ("ANTRA" + Date.now()),
    order_date: orderDate,
    pickup_location: PICKUP,
    billing_customer_name: b.firstname || (td && td.firstname) || "Customer",
    billing_last_name: "",
    billing_address: address,
    billing_city: b.city || (td && td.city) || "",
    billing_pincode: pincode,
    billing_state: b.state || (td && td.state) || "",
    billing_country: "India",
    billing_email: b.email || (td && td.email) || "",
    billing_phone: b.phone || (td && td.phone) || "",
    shipping_is_billing: true,
    order_items: [{ name: b.productinfo || "Antra order", sku: "ANTRA-" + (b.txnid || "SKU"), units: 1, selling_price: b.amount || (td && td.amount) || "0" }],
    payment_method: "Prepaid",
    sub_total: b.amount || (td && td.amount) || "0",
    length: 12, breadth: 10, height: 8, weight: 0.3,
  };
  const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + auth.token },
    body: JSON.stringify(payload), signal: timeoutSignal(8000),
  });
  const result = await createRes.json();
  console.log("SHIPROCKET_CREATE", JSON.stringify({ order_id: result && result.order_id, status: result && result.status, message: result && result.message }));
  return result;
}

exports.handler = async (event) => {
  const b = Object.fromEntries(new URLSearchParams(event.body || ""));
  const status = String(b.status || "").toLowerCase();
  const paid = status === "success"; // PayU redirects to surl only on success

  console.log("PAYU_RETURN", JSON.stringify({
    status, txnid: b.txnid, amount: b.amount, productinfo: b.productinfo,
    hasAddress: !!b.address1, city: b.city, zipcode: b.zipcode,
  }));

  // Confirm with PayU server-to-server, then auto-create the Shiprocket order.
  if (paid) {
    try {
      const v = await verifyWithPayU(b.txnid);
      if (v && v.ok) { await createShiprocketOrder(b, v.td); }
    } catch (e) { console.log("POST_PAY_ERROR", String(e)); }
  }

  const page = (title, msg, tone) => `<!doctype html><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <body style="margin:0;background:#0c0a0f;color:#ece6df;font-family:Georgia,serif;
      display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">
      <div style="max-width:460px;padding:40px">
        <div style="font-size:52px;margin-bottom:14px">${tone}</div>
        <h1 style="font-weight:400;color:#c9a86a;margin:0 0 12px">${title}</h1>
        <p style="color:#a89f93;line-height:1.6">${msg}</p>
        <a href="/" style="display:inline-block;margin-top:26px;color:#0c0a0f;background:#c9a86a;
          text-decoration:none;padding:12px 26px;border-radius:10px">Back to Antra</a>
      </div></body>`;

  const body = paid
    ? page("Thank you", "Your Antra order is confirmed. We’ll begin hand-blending your ritual and ship it soon.", "✅")
    : page("Payment not completed", "No confirmed payment was found. If money was deducted it will be refunded automatically.", "⚠️");

  return { statusCode: 200, headers: { "Content-Type": "text/html" }, body };
};
