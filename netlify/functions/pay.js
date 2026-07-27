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

  const KEY = process.env.PAY4U_KEY;
  const SALT = process.env.PAY4U_SALT;
  const ENDPOINT = process.env.PAY4U_ENDPOINT;
  const SUCCESS_URL = process.env.SUCCESS_URL;
  const FAILURE_URL = process.env.FAILURE_URL;

  const b = Object.fromEntries(new URLSearchParams(event.body || ""));
  const amount = String(b.amount || "").trim();
  const productinfo = String(b.productinfo || "Antra order").trim();
  const firstname = String(b.firstname || "Customer").trim();
  const email = String(b.email || "").trim();
  const phone = String(b.phone || "").trim();

  if (!amount || !email) {
    return { statusCode: 400, body: "amount and email are required" };
  }

  const txnid = "ANTRA" + Date.now() + Math.floor(Math.random() * 1000);

  // key|txnid|amount|productinfo|firstname|email|udf1..5|||||salt
  const seq = [KEY, txnid, amount, productinfo, firstname, email,
    "", "", "", "", "", "", "", "", "", "", SALT].join("|");
  const hash = crypto.createHash("sha512").update(seq).digest("hex");

  const fields = {
    key: KEY, txnid, amount, productinfo, firstname, email, phone,
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
