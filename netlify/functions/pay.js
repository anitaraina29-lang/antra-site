/* =========================================================
   ANTRA — Pay4U signing (Netlify serverless function)
   Fast + free, never sleeps. The secret salt stays here on the
   server — never in the browser.

   NOTE: hash sequence + endpoint follow the common PayU-style
   key|salt model. Confirm the EXACT sequence and payment URL from
   Pay4U's own docs and adjust below if they differ.
   ========================================================= */
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // PayU credentials — set PAY4U_KEY and PAY4U_SALT in Netlify env vars.
  const KEY = process.env.PAY4U_KEY;
  const SALT = process.env.PAY4U_SALT;
  // Sensible defaults so only key+salt need to be configured.
  // Live: https://secure.payu.in/_payment  ·  Test: https://test.payu.in/_payment
  const ENDPOINT = process.env.PAY4U_ENDPOINT || "https://secure.payu.in/_payment";
  const SUCCESS_URL = process.env.SUCCESS_URL || "https://antrabotanicals.com/payment-success";
  const FAILURE_URL = process.env.FAILURE_URL || "https://antrabotanicals.com/payment-failure";

  const b = Object.fromEntries(new URLSearchParams(event.body || ""));
  const amount = String(b.amount || "").trim();
  const productinfo = String(b.productinfo || "Antra order").trim();
  const firstname = String(b.firstname || "Customer").trim();
  const email = String(b.email || "").trim();
  const phone = String(b.phone || "").trim();
  const address = String(b.address || "").trim(); // shipping address (shown in PayU txn, used for Shiprocket)
  const city = String(b.city || "").trim();
  const state = String(b.state || "").trim();
  const pincode = String(b.pincode || "").trim();

  if (!amount || !email) {
    return { statusCode: 400, body: "amount and email are required" };
  }

  const txnid = "ANTRA" + Date.now() + Math.floor(Math.random() * 1000);

  // key|txnid|amount|productinfo|firstname|email|udf1..5|||||salt
  const seq = [KEY, txnid, amount, productinfo, firstname, email,
    "", "", "", "", "", "", "", "", "", "", SALT].join("|");
  const hash = crypto.createHash("sha512").update(seq).digest("hex");

  // address1 is NOT part of the PayU hash, so it can be sent as an extra field.
  // It appears in the PayU transaction details — the owner uses it for Shiprocket.
  // Address fields are NOT part of the PayU hash, so they can be sent as extras.
  // They appear in the PayU transaction details — the owner uses them for Shiprocket.
  const fields = {
    key: KEY, txnid, amount, productinfo, firstname, email, phone,
    address1: address, city: city, state: state, zipcode: pincode, country: "India",
    surl: SUCCESS_URL, furl: FAILURE_URL, hash,
  };
  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`)
    .join("\n");

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `<!doctype html><html><body onload="document.forms[0].submit()">
      <p style="font-family:sans-serif">Redirecting you to secure payment…</p>
      <form method="post" action="${ENDPOINT}">${inputs}</form>
    </body></html>`,
  };
};
