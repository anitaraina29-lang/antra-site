/* TEMPORARY diagnostic — verifies Gmail SMTP by sending ONE test email to the
   owner address only (recipient is fixed from env, so it can't be abused to
   spam anyone else). DELETE this file after confirming email works. */
const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  const USER = process.env.GMAIL_USER;
  const PASS = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");
  const OWNER = process.env.OWNER_EMAIL || USER;
  res.setHeader("Content-Type", "application/json");
  if (!USER || !PASS) {
    res.status(200).send(JSON.stringify({ ok: false, reason: "GMAIL_USER / GMAIL_APP_PASSWORD env var missing on this deployment" }));
    return;
  }
  try {
    const t = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: USER, pass: PASS },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 8000,
    });
    const info = await t.sendMail({
      from: '"Antra Botanicals" <' + USER + '>',
      to: OWNER, replyTo: USER,
      subject: "✅ Antra email test — it works!",
      html: "<div style='font-family:Arial,sans-serif;font-size:15px;color:#222'>Agar ye email aapko mili — iska matlab order confirmation emails ab bilkul kaam kar rahi hain. 🎉<br><br>— Antra Botanicals</div>",
    });
    res.status(200).send(JSON.stringify({ ok: true, sentTo: OWNER, messageId: info && info.messageId }));
  } catch (e) {
    res.status(200).send(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
  }
};
