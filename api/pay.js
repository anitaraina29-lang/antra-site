/* =========================================================
   ANTRA — payment initiation (Vercel serverless function)
   Prefers CASHFREE when enabled (CASHFREE_ENABLED=true + keys set);
   otherwise falls back to PayU. Keeping the fallback means the live
   site never loses payments while Cashfree is being switched on.
   ========================================================= */
const crypto = require("crypto");

function timeoutSignal(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }

function cfConfig() {
  const APP_ID = process.env.CASHFREE_APP_ID;
  const SECRET = process.env.CASHFREE_SECRET_KEY;
  const ENABLED = process.env.CASHFREE_ENABLED === "true";
  const MODE = process.env.CASHFREE_MODE === "production" ? "production" : "sandbox";
  const base = MODE === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  return { APP_ID, SECRET, ENABLED, MODE, base, on: !!(APP_ID && SECRET && ENABLED) };
}

async function payWithCashfree(b, res) {
  const cf = cfConfig();
  const SUCCESS_URL = process.env.SUCCESS_URL || "https://www.antrabotanicals.com/payment-success";
  const amount = Number(String(b.amount || "").trim());
  const orderId = "ANTRA" + Date.now() + Math.floor(Math.random() * 1000);
  const payload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: "cust" + Date.now(),
      customer_name: String(b.firstname || "Customer").trim(),
      customer_email: String(b.email || "").trim(),
      customer_phone: String(b.phone || "").trim(),
    },
    order_meta: { return_url: SUCCESS_URL + "?order_id={order_id}" },
    // Address + product stashed as tags so /payment-success can rebuild the
    // Shiprocket order and emails from the server-verified order (Cashfree's
    // return only carries order_id).
    order_tags: {
      address: String(b.address || "").trim().slice(0, 250),
      city: String(b.city || "").trim().slice(0, 60),
      state: String(b.state || "").trim().slice(0, 60),
      pincode: String(b.pincode || "").trim().slice(0, 12),
      productinfo: String(b.productinfo || "Antra order").trim().slice(0, 250),
    },
    order_note: String(b.productinfo || "Antra order").trim().slice(0, 200),
  };

  let session = null, errMsg = "";
  try {
    const r = await fetch(cf.base + "/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": cf.APP_ID,
        "x-client-secret": cf.SECRET,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
      signal: timeoutSignal(9000),
    });
    const j = await r.json();
    session = j && j.payment_session_id;
    if (!session) errMsg = (j && (j.message || JSON.stringify(j))) || "No payment session returned";
  } catch (e) { errMsg = String((e && e.message) || e); }

  if (!session) {
    console.log("CF_CREATE_FAIL", errMsg);
    // Safety net: if Cashfree can't start (e.g. account not yet activated) but PayU
    // is still configured, fall back to PayU so the buyer can always pay.
    if (process.env.PAY4U_KEY && process.env.PAY4U_SALT) { payWithPayU(b, res); return; }
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:48px">
      <h2>Payment could not start</h2>
      <p>Sorry, something went wrong starting your payment. Please try again, or contact us on WhatsApp.</p>
      <a href="/" style="color:#9c7836">← Back to Antra</a></body>`);
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!doctype html><html><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script></head>
    <body onload="go()" style="font-family:sans-serif;text-align:center;padding:48px">
    <p>Redirecting you to secure payment…</p>
    <script>
      function go(){
        try{
          var cashfree = Cashfree({ mode: ${JSON.stringify(cf.MODE)} });
          cashfree.checkout({ paymentSessionId: ${JSON.stringify(session)}, redirectTarget: "_self" });
        }catch(e){
          document.body.innerHTML = "<p>Could not open the payment page. Please try again.</p><a href='/'>Back to Antra</a>";
        }
      }
    </script></body></html>`);
}

function payWithPayU(b, res) {
  const KEY = process.env.PAY4U_KEY;
  const SALT = process.env.PAY4U_SALT;
  const ENDPOINT = process.env.PAY4U_ENDPOINT || "https://secure.payu.in/_payment";
  const SUCCESS_URL = process.env.SUCCESS_URL || "https://www.antrabotanicals.com/payment-success";
  const FAILURE_URL = process.env.FAILURE_URL || "https://www.antrabotanicals.com/payment-failure";

  const amount = String(b.amount || "").trim();
  const productinfo = String(b.productinfo || "Antra order").trim();
  const firstname = String(b.firstname || "Customer").trim();
  const email = String(b.email || "").trim();
  const phone = String(b.phone || "").trim();
  const address = String(b.address || "").trim();
  const city = String(b.city || "").trim();
  const state = String(b.state || "").trim();
  const pincode = String(b.pincode || "").trim();

  const txnid = "ANTRA" + Date.now() + Math.floor(Math.random() * 1000);
  const seq = [KEY, txnid, amount, productinfo, firstname, email,
    "", "", "", "", "", "", "", "", "", "", SALT].join("|");
  const hash = crypto.createHash("sha512").update(seq).digest("hex");

  const fields = {
    key: KEY, txnid, amount, productinfo, firstname, email, phone,
    address1: address, city, state, zipcode: pincode, country: "India",
    surl: SUCCESS_URL, furl: FAILURE_URL, hash,
  };
  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`)
    .join("\n");

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!doctype html><html><body onload="document.forms[0].submit()">
    <p style="font-family:sans-serif">Redirecting you to secure payment…</p>
    <form method="post" action="${ENDPOINT}">${inputs}</form>
  </body></html>`);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).send("Method not allowed"); return; }
  const b = (req.body && typeof req.body === "object")
    ? req.body
    : Object.fromEntries(new URLSearchParams(typeof req.body === "string" ? req.body : ""));

  if (!String(b.amount || "").trim() || !String(b.email || "").trim()) {
    res.status(400).send("amount and email are required");
    return;
  }

  if (cfConfig().on) { await payWithCashfree(b, res); return; }
  payWithPayU(b, res);
};
