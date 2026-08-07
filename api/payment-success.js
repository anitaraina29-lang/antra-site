/* ANTRA — PayU success return (Vercel serverless function).
   1) Friendly "Thank you" on status=success. 2) Server-to-server confirm via PayU
   Verify API, then auto-create the Shiprocket order. Best-effort; never blocks the page.
   Mirror of netlify/functions/payment-success.js. */
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// ---- Email (direct Gmail SMTP) — customer confirmation + owner notification.
//   Uses the owner's Gmail + a Google "App Password" (env GMAIL_USER / GMAIL_APP_PASSWORD).
//   No domain/DNS needed; mail is sent straight from antra.fem@gmail.com.
let _transporter = null;
function transporter() {
  if (_transporter) return _transporter;
  const USER = process.env.GMAIL_USER;
  const PASS = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, ""); // Google shows it with spaces
  if (!USER || !PASS) return null;
  _transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: USER, pass: PASS },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 8000,
  });
  return _transporter;
}
async function sendEmail(to, subject, html) {
  const USER = process.env.GMAIL_USER;
  const t = transporter();
  if (!t || !to) { console.log("EMAIL_SKIP", to || "(no-creds/to)"); return; }
  const FROM = process.env.ORDER_FROM || ('"Antra Botanicals" <' + USER + '>');
  const info = await t.sendMail({ from: FROM, to, replyTo: USER, subject, html });
  console.log("EMAIL_SENT", to, info && info.messageId);
}

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

async function sendOrderEmails(b, td, verified) {
  const OWNER = process.env.OWNER_EMAIL || process.env.GMAIL_USER || "antra.fem@gmail.com";
  const pick = (k) => esc(b[k] || (td && td[k]) || "");
  const name = pick("firstname") || "Customer";
  const email = (b.email || (td && td.email) || "").trim();
  const phone = pick("phone");
  const amount = pick("amount");
  const product = pick("productinfo") || "Antra order";
  const fullAddr = [pick("address1"), pick("city"), pick("state"), pick("zipcode")].filter(Boolean).join(", ");
  const txnid = pick("txnid");
  const logo = "https://www.antrabotanicals.com/assets/img/logo.png";

  // ----- owner notification (always, so no order is missed) -----
  const row = (k, v) => `<tr><td style="padding:7px 0;color:#8a8175;width:34%">${k}</td><td style="padding:7px 0;color:#222">${v || "—"}</td></tr>`;
  const ownerHtml =
    `<div style="max-width:580px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;border:1px solid #e2ddd2;border-radius:10px;overflow:hidden">
      <div style="background:${verified ? "#1a7a45" : "#b26a00"};color:#fff;padding:16px 22px">
        <div style="font-size:18px;font-weight:bold">${verified ? "🛍️ New Antra order received" : "⚠️ Payment received — verify in PayU"}</div>
      </div>
      <div style="padding:22px">
        ${verified ? "" : `<p style="color:#b26a00;margin:0 0 14px">Auto-verification did not confirm this payment. Check the PayU dashboard before shipping.</p>`}
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Customer", name)}${row("Email", esc(email))}${row("Phone", phone)}
          ${row("Product", product)}${row("Amount", "₹" + amount)}
          ${row("Ship to", fullAddr)}${row("Order ref", txnid)}
        </table>
      </div>
      <div style="background:#efe6d7;padding:12px;text-align:center;color:#8a8175;font-size:11px">Antra Botanicals · order notification</div>
    </div>`;
  await sendEmail(OWNER, (verified ? "🛍️ New order — ₹" : "⚠️ Payment (verify) — ₹") + amount + " — " + name, ownerHtml);

  // ----- customer confirmation (only when server-verified, to avoid spoofed sends) -----
  if (verified && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const custHtml =
      `<div style="max-width:520px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#2a2320;background:#fdfaf5;border:1px solid #e7ddca;border-radius:12px;overflow:hidden">
        <div style="background:#efe6d7;padding:22px;text-align:center;border-bottom:1px solid #e2d6bf">
          <img src="${logo}" alt="Antra Botanicals" style="height:58px;max-width:80%">
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
    await sendEmail(email, "Your Antra order is confirmed ✨", custHtml);
  }
}

module.exports = async function handler(req, res) {
  // PayU normally returns a POST body, but a redirect hop can turn it into a GET with
  // query params — accept BOTH so the Thank-you page still renders either way.
  const q = (req.query && typeof req.query === "object") ? req.query : {};
  const bodyObj = (req.body && typeof req.body === "object")
    ? req.body
    : Object.fromEntries(new URLSearchParams(typeof req.body === "string" ? req.body : ""));
  const b = Object.assign({}, q, bodyObj);
  const status = String(b.status || "").toLowerCase();
  const paid = status === "success";

  if (paid) {
    let verified = false, td = null;
    try { const v = await verifyWithPayU(b.txnid); verified = v.ok; td = v.td; }
    catch (e) { console.log("VERIFY_ERROR", String(e)); }
    try { if (verified) await createShiprocketOrder(b, td); }
    catch (e) { console.log("SHIPROCKET_ERROR", String(e)); }
    try { await sendOrderEmails(b, td, verified); }
    catch (e) { console.log("EMAIL_ERROR", String(e)); }
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
