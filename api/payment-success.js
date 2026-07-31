/* ANTRA — PayU success return (Vercel serverless function).
   1) Friendly "Thank you" on status=success. 2) Server-to-server confirm via PayU
   Verify API, then auto-create the Shiprocket order. Best-effort; never blocks the page.
   Mirror of netlify/functions/payment-success.js. */
const crypto = require("crypto");

function timeoutSignal(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }

async function verifyWithPayU(txnid) {
  const KEY = process.env.PAY4U_KEY, SALT = process.env.PAY4U_SALT;
  if (!KEY || !SALT || !txnid) return { ok: false };
  const command = "verify_payment";
  const hash = crypto.createHash("sha512").update(KEY + "|" + command + "|" + txnid + "|" + SALT).digest("hex");
  const body = new URLSearchParams({ key: KEY, command, var1: txnid, hash }).toString();
  const r = await fetch("https://info.payu.in/merchant/postservice.php?form=2", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, signal: timeoutSignal(8000),
  });
  const j = await r.json();
  const td = j && j.transaction_details && j.transaction_details[txnid];
  return { ok: !!(td && String(td.status).toLowerCase() === "success"), td };
}

async function createShiprocketOrder(b, td) {
  const EMAIL = process.env.SHIPROCKET_EMAIL, PASSWORD = process.env.SHIPROCKET_PASSWORD, PICKUP = process.env.SHIPROCKET_PICKUP;
  const address = (b.address1 || (td && td.address1) || "").trim();
  const pincode = (b.zipcode || (td && td.zipcode) || "").trim();
  if (!EMAIL || !PASSWORD || !PICKUP || !address || !pincode) { console.log("SHIPROCKET_SKIP"); return; }
  const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }), signal: timeoutSignal(8000),
  });
  const auth = await authRes.json();
  if (!auth || !auth.token) { console.log("SHIPROCKET_AUTH_FAIL"); return; }
  const d = new Date(); const pad = (n) => String(n).padStart(2, "0");
  const orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const payload = {
    order_id: b.txnid || ("ANTRA" + Date.now()), order_date: orderDate, pickup_location: PICKUP,
    billing_customer_name: b.firstname || "Customer", billing_last_name: "",
    billing_address: address, billing_city: b.city || "", billing_pincode: pincode,
    billing_state: b.state || "", billing_country: "India", billing_email: b.email || "", billing_phone: b.phone || "",
    shipping_is_billing: true,
    order_items: [{ name: b.productinfo || "Antra order", sku: "ANTRA-" + (b.txnid || "SKU"), units: 1, selling_price: b.amount || "0" }],
    payment_method: "Prepaid", sub_total: b.amount || "0", length: 12, breadth: 10, height: 8, weight: 0.3,
  };
  const cr = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + auth.token },
    body: JSON.stringify(payload), signal: timeoutSignal(8000),
  });
  const result = await cr.json();
  console.log("SHIPROCKET_CREATE", JSON.stringify({ order_id: result && result.order_id, status: result && result.status }));
}

module.exports = async function handler(req, res) {
  const b = (req.body && typeof req.body === "object")
    ? req.body
    : Object.fromEntries(new URLSearchParams(typeof req.body === "string" ? req.body : ""));
  const status = String(b.status || "").toLowerCase();
  const paid = status === "success";

  if (paid) {
    try { const v = await verifyWithPayU(b.txnid); if (v.ok) await createShiprocketOrder(b, v.td); }
    catch (e) { console.log("POST_PAY_ERROR", String(e)); }
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

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(paid
    ? page("Thank you", "Your Antra order is confirmed. We’ll begin hand-blending your ritual and ship it soon.", "✅")
    : page("Payment not completed", "No confirmed payment was found. If money was deducted it will be refunded automatically.", "⚠️"));
};
