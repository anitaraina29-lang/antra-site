/* TEMPORARY preview — sends the REAL customer + owner order emails (with sample
   data) to the owner address only, so the English templates can be reviewed in the
   inbox without a real payment. Recipient is fixed from env (cannot be abused).
   DELETE this file after reviewing. */
const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  const USER = process.env.GMAIL_USER;
  const PASS = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");
  const OWNER = process.env.OWNER_EMAIL || USER;
  res.setHeader("Content-Type", "application/json");
  if (!USER || !PASS) { res.status(200).send(JSON.stringify({ ok: false, reason: "GMAIL env vars missing" })); return; }

  // ---- sample order ----
  const name = "Asha Verma";
  const email = "asha@example.com";
  const phone = "9876543210";
  const amount = "950";
  const product = "Luna Celeste — Radiant Face Oil x1";
  const fullAddr = "12 MG Road, Vasant Vihar, New Delhi, Delhi, 110057";
  const txnid = "ANTRA-SAMPLE-1234";
  const logo = "https://www.antrabotanicals.com/assets/img/logo.png";

  const row = (k, v) => `<tr><td style="padding:7px 0;color:#8a8175;width:34%">${k}</td><td style="padding:7px 0;color:#222">${v || "—"}</td></tr>`;
  const ownerHtml =
    `<div style="max-width:580px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;border:1px solid #e2ddd2;border-radius:10px;overflow:hidden">
      <div style="background:#1a7a45;color:#fff;padding:16px 22px">
        <div style="font-size:18px;font-weight:bold">🛍️ New Antra order received</div>
      </div>
      <div style="padding:22px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Customer", name)}${row("Email", email)}${row("Phone", phone)}
          ${row("Product", product)}${row("Amount", "₹" + amount)}
          ${row("Ship to", fullAddr)}${row("Order ref", txnid)}
        </table>
      </div>
      <div style="background:#efe6d7;padding:12px;text-align:center;color:#8a8175;font-size:11px">Antra Botanicals · order notification</div>
    </div>`;

  const custHtml =
    `<div style="max-width:520px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#2a2320;background:#fdfaf5;border:1px solid #e7ddca;border-radius:12px;overflow:hidden">
      <div style="background:#0c0a0f;padding:24px;text-align:center">
        <img src="${logo}" alt="Antra Botanicals" style="height:52px;max-width:80%">
      </div>
      <div style="padding:28px">
        <h1 style="font-size:22px;color:#9c7836;margin:0 0 8px;font-weight:normal">Thank you, ${name} ✨</h1>
        <p style="line-height:1.65;color:#514a41;margin:0 0 16px">Your Antra order is confirmed. We’ll begin hand-blending your ritual and ship it to you soon.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
          <tr><td style="padding:6px 0;color:#8a8175">Order</td><td style="padding:6px 0;text-align:right">${product}</td></tr>
          <tr><td style="padding:6px 0;color:#8a8175">Amount paid</td><td style="padding:6px 0;text-align:right;font-weight:bold">₹${amount}</td></tr>
          <tr><td style="padding:6px 0;color:#8a8175">Order ref</td><td style="padding:6px 0;text-align:right">${txnid}</td></tr>
          <tr><td style="padding:6px 0;color:#8a8175;vertical-align:top">Shipping to</td><td style="padding:6px 0;text-align:right">${fullAddr}</td></tr>
        </table>
        <p style="line-height:1.6;color:#514a41;font-size:13.5px;margin:0">Any questions? Just reply to this email and we’ll help.</p>
        <div style="text-align:center;margin-top:24px">
          <a href="https://www.antrabotanicals.com" style="display:inline-block;background:#c9a86a;color:#1a1208;text-decoration:none;padding:11px 28px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px">Visit Antra</a>
        </div>
      </div>
      <div style="background:#efe6d7;padding:14px;text-align:center;color:#8a8175;font-size:11px;font-family:Arial,sans-serif">Antra Botanicals · Handcrafted in small batches · India</div>
    </div>`;

  try {
    const t = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: USER, pass: PASS },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 8000,
    });
    const from = '"Antra Botanicals" <' + USER + '>';
    const r1 = await t.sendMail({ from, to: OWNER, replyTo: USER, subject: "[PREVIEW — customer's copy] Your Antra order is confirmed ✨", html: custHtml });
    const r2 = await t.sendMail({ from, to: OWNER, replyTo: USER, subject: "[PREVIEW — your copy] 🛍️ New order — ₹" + amount + " — " + name, html: ownerHtml });
    res.status(200).send(JSON.stringify({ ok: true, sentTo: OWNER, customer: r1 && r1.messageId, owner: r2 && r2.messageId }));
  } catch (e) {
    res.status(200).send(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
  }
};
