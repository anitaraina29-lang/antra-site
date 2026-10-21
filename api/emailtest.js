/* TEMPORARY diagnostic — verifies Gmail SMTP by sending ONE test email to the
   owner address only. Returns the exact error if auth fails. DELETE after use. */
const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  const USER = process.env.GMAIL_USER;
  const RAW = process.env.GMAIL_APP_PASSWORD || "";
  const PASS = RAW.replace(/\s/g, "");
  const OWNER = process.env.OWNER_EMAIL || USER;
  res.setHeader("Content-Type", "application/json");
  const diag = { hasUser: !!USER, userValue: USER || null, hasPass: !!RAW, passLen: PASS.length };
  if (!USER || !PASS) { res.status(200).send(JSON.stringify({ ok: false, reason: "GMAIL env var missing", diag })); return; }
  try {
    const t = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: USER, pass: PASS },
      connectionTimeout: 9000, greetingTimeout: 9000, socketTimeout: 9000,
    });
    const info = await t.sendMail({
      from: '"Antra Botanicals" <' + USER + '>', to: OWNER, replyTo: USER,
      subject: "Antra SMTP diagnostic " + new Date().toISOString(),
      html: "<div style='font-family:Arial'>SMTP diagnostic OK.</div>",
    });
    res.status(200).send(JSON.stringify({ ok: true, sentTo: OWNER, messageId: info && info.messageId, diag }));
  } catch (e) {
    res.status(200).send(JSON.stringify({ ok: false, error: String((e && e.message) || e), code: e && e.code, diag }));
  }
};
