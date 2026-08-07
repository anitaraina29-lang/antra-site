/* =========================================================
   ANTRA — PayU signing (Vercel serverless function)
   Signs the payment request server-side (salt never in browser)
   and auto-forwards the buyer to PayU. Mirror of netlify/functions/pay.js.
   ========================================================= */
const crypto = require("crypto");

module.exports = function handler(req, res) {
  if (req.method !== "POST") { res.status(405).send("Method not allowed"); return; }

  const KEY = process.env.PAY4U_KEY;
  const SALT = process.env.PAY4U_SALT;
  const ENDPOINT = process.env.PAY4U_ENDPOINT || "https://secure.payu.in/_payment";
  // NOTE: must be the PRIMARY host (www) — the apex antrabotanicals.com issues a 308
  // redirect to www, and PayU's return POST to surl/furl can break across that hop.
  const SUCCESS_URL = process.env.SUCCESS_URL || "https://www.antrabotanicals.com/payment-success";
  const FAILURE_URL = process.env.FAILURE_URL || "https://www.antrabotanicals.com/payment-failure";

  // Vercel parses urlencoded/json bodies into req.body; fall back to raw parse.
  const b = (req.body && typeof req.body === "object")
    ? req.body
    : Object.fromEntries(new URLSearchParams(typeof req.body === "string" ? req.body : ""));

  const amount = String(b.amount || "").trim();
  const productinfo = String(b.productinfo || "Antra order").trim();
  const firstname = String(b.firstname || "Customer").trim();
  const email = String(b.email || "").trim();
  const phone = String(b.phone || "").trim();
  const address = String(b.address || "").trim();
  const city = String(b.city || "").trim();
  const state = String(b.state || "").trim();
  const pincode = String(b.pincode || "").trim();

  if (!amount || !email) { res.status(400).send("amount and email are required"); return; }

  const txnid = "ANTRA" + Date.now() + Math.floor(Math.random() * 1000);
  // key|txnid|amount|productinfo|firstname|email|+10 empties+|salt
  const seq = [KEY, txnid, amount, productinfo, firstname, email,
    "", "", "", "", "", "", "", "", "", "", SALT].join("|");
  const hash = crypto.createHash("sha512").update(seq).digest("hex");

  // address fields are NOT in the hash — sent as extras (show in PayU txn, used for Shiprocket)
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
};
