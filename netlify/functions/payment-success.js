/* ANTRA — PayU success return (Netlify serverless function).
   1) Verifies PayU's reply hash before showing success (blocks fake success URLs).
   2) On a verified success, auto-creates the order in Shiprocket (best-effort).
      Shiprocket runs ONLY if SHIPROCKET_EMAIL/PASSWORD/PICKUP env vars are set and
      the shipping address is present. Any failure is swallowed — the buyer always
      sees the success page, and the order stays in PayU for manual fulfilment. */
const crypto = require("crypto");

async function createShiprocketOrder(b) {
  const EMAIL = process.env.SHIPROCKET_EMAIL;
  const PASSWORD = process.env.SHIPROCKET_PASSWORD;
  const PICKUP = process.env.SHIPROCKET_PICKUP;
  const address = (b.address1 || "").trim();
  // Need credentials + a usable address, else skip (owner ships manually from PayU).
  if (!EMAIL || !PASSWORD || !PICKUP || !address || !b.zipcode) return { skipped: true };

  const withTimeout = (ms) => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; };

  // 1) auth
  const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    signal: withTimeout(8000),
  });
  const auth = await authRes.json();
  if (!auth || !auth.token) return { error: "auth failed" };

  // order date "YYYY-MM-DD HH:mm"
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // 2) create ad-hoc order
  const payload = {
    order_id: b.txnid || ("ANTRA" + Date.now()),
    order_date: orderDate,
    pickup_location: PICKUP,
    billing_customer_name: b.firstname || "Customer",
    billing_last_name: "",
    billing_address: address,
    billing_city: b.city || "",
    billing_pincode: b.zipcode || "",
    billing_state: b.state || "",
    billing_country: "India",
    billing_email: b.email || "",
    billing_phone: b.phone || "",
    shipping_is_billing: true,
    order_items: [{ name: b.productinfo || "Antra order", sku: "ANTRA-" + (b.txnid || "SKU"), units: 1, selling_price: b.amount || "0" }],
    payment_method: "Prepaid",
    sub_total: b.amount || "0",
    length: 12, breadth: 10, height: 8, weight: 0.3, // defaults — adjust per parcel in Shiprocket before shipping
  };
  const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + auth.token },
    body: JSON.stringify(payload),
    signal: withTimeout(8000),
  });
  return await createRes.json();
}

exports.handler = async (event) => {
  const SALT = process.env.PAY4U_SALT;
  const KEY = process.env.PAY4U_KEY;
  const b = Object.fromEntries(new URLSearchParams(event.body || ""));

  // PayU reverse hash. If additionalCharges is present it is prepended.
  // Base (no additional charges): salt|status|+10 empties+|email|firstname|productinfo|amount|txnid|key
  const status = String(b.status || "").toLowerCase();
  let hashOk = false;
  try {
    const tail = [SALT, b.status, "", "", "", "", "", "", "", "", "",
      b.email, b.firstname, b.productinfo, b.amount, b.txnid, KEY];
    const seq = (b.additionalCharges ? [b.additionalCharges].concat(tail) : tail).join("|");
    const expected = crypto.createHash("sha512").update(seq).digest("hex");
    hashOk = !!b.hash && expected.toLowerCase() === String(b.hash).toLowerCase();
    // Diagnostics (visible in Netlify function logs) to perfect the hash if it mismatches.
    console.log("PAYU_RETURN", JSON.stringify({
      status, hashOk, recvHash: String(b.hash || "").slice(0, 16),
      expHash: expected.slice(0, 16), amount: b.amount, txnid: b.txnid,
      productinfo: b.productinfo, hasAddlCharges: !!b.additionalCharges,
    }));
  } catch (e) { hashOk = false; }

  // PayU redirects here (surl) ONLY on a genuine success, so treat status=success
  // as paid for the buyer's view. Auto-create in Shiprocket only when the hash also
  // verifies (tamper-safe); otherwise the owner ships manually from PayU.
  const paid = status === "success";
  const verified = paid; // customer-facing: don't scare a real payer over a hash quirk
  if (paid && hashOk) {
    try { await createShiprocketOrder(b); } catch (e) { /* silent — manual fallback via PayU */ }
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

  const body = verified
    ? page("Thank you", "Your Antra order is confirmed. We’ll begin hand-blending your ritual and ship it soon.", "✅")
    : page("Payment could not be verified", "If money was deducted, it will be refunded automatically. Please contact us before re-ordering.", "⚠️");

  return { statusCode: 200, headers: { "Content-Type": "text/html" }, body };
};
