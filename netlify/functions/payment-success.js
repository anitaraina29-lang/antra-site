/* ANTRA — Pay4U success return (Netlify serverless function).
   Verifies Pay4U's reply hash before showing success, so a fake
   success URL can't be trusted. Confirm the reverse-hash sequence
   with Pay4U's docs if needed. */
const crypto = require("crypto");

exports.handler = async (event) => {
  const SALT = process.env.PAY4U_SALT;
  const KEY = process.env.PAY4U_KEY;
  const b = Object.fromEntries(new URLSearchParams(event.body || ""));

  // Reverse hash (PayU-style):
  // salt|status|||||udf5..1|email|firstname|productinfo|amount|txnid|key
  let verified = false;
  try {
    const seq = [SALT, b.status, "", "", "", "", "", "", "", "", "",
      b.email, b.firstname, b.productinfo, b.amount, b.txnid, KEY].join("|");
    const expected = crypto.createHash("sha512").update(seq).digest("hex");
    verified = b.hash && expected === b.hash && b.status === "success";
  } catch (e) { verified = false; }

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
    ? page("Thank you", "Your Antra order is confirmed. We’ll email you the details and begin hand-blending your ritual.", "✅")
    : page("Payment could not be verified", "If money was deducted, it will be refunded automatically. Please contact us before re-ordering.", "⚠️");

  return { statusCode: 200, headers: { "Content-Type": "text/html" }, body };
};
