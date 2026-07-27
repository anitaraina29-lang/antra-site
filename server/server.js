/* =========================================================
   ANTRA — Pay4U payment backend
   ---------------------------------------------------------
   Why this exists:
   Pay4U signs each payment request with a secret "salt".
   That salt must stay on a SERVER — never in the browser.
   This tiny server:
     1. serves the Antra website,
     2. receives a "Pay Now" click,
     3. builds + signs the payment request,
     4. auto-forwards the customer to Pay4U.

   NOTE: The hash formula and endpoint below follow the common
   PayU-style key|salt model. Confirm the EXACT hash sequence
   and payment URL from Pay4U's own integration docs and adjust
   buildHash() / PAY4U_ENDPOINT if they differ.
   ========================================================= */
import express from "express";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, ".."); // the antra-site folder

const {
  PAY4U_KEY,
  PAY4U_SALT,
  PAY4U_ENDPOINT,
  SUCCESS_URL,
  FAILURE_URL,
  PORT = 8787,
} = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---- serve the static website ----
app.use(express.static(SITE_DIR));

/* Build the PayU/Pay4U-style SHA-512 hash.
   Standard sequence:
   key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt  */
function buildHash({ txnid, amount, productinfo, firstname, email }) {
  const seq = [
    PAY4U_KEY, txnid, amount, productinfo, firstname, email,
    "", "", "", "", "",            // udf1..udf5 (unused)
    "", "", "", "", "",            // reserved blanks
    PAY4U_SALT,
  ].join("|");
  return crypto.createHash("sha512").update(seq).digest("hex");
}

// simple readable order id (no random needed: time-agnostic counter)
let counter = 0;
function makeTxnId() {
  counter += 1;
  return "ANTRA" + Date.now() + counter;
}

/* ---- create a payment: returns an auto-submitting form ---- */
app.post("/api/pay", (req, res) => {
  const amount = String(req.body.amount || "").trim();
  const productinfo = String(req.body.productinfo || "Antra order").trim();
  const firstname = String(req.body.firstname || "Customer").trim();
  const email = String(req.body.email || "").trim();
  const phone = String(req.body.phone || "").trim();

  if (!amount || !email) {
    return res.status(400).send("amount and email are required");
  }

  const txnid = makeTxnId();
  const hash = buildHash({ txnid, amount, productinfo, firstname, email });

  const fields = {
    key: PAY4U_KEY,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl: SUCCESS_URL,
    furl: FAILURE_URL,
    hash,
  };

  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`)
    .join("\n");

  // auto-submits to Pay4U the instant it loads
  res.send(`<!doctype html><html><body onload="document.forms[0].submit()">
    <p style="font-family:sans-serif">Redirecting you to secure payment…</p>
    <form method="post" action="${PAY4U_ENDPOINT}">${inputs}</form>
  </body></html>`);
});

/* ---- landing pages Pay4U redirects back to ---- */
app.post("/payment-success", (req, res) => {
  res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:60px">
    <h1>✅ Payment received</h1><p>Thank you for your Antra order.</p>
    <a href="/">Back to Antra</a></body>`);
});
app.post("/payment-failure", (req, res) => {
  res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:60px">
    <h1>Payment not completed</h1><p>No money was taken. Please try again.</p>
    <a href="/">Back to Antra</a></body>`);
});

app.listen(PORT, () => {
  console.log(`Antra + Pay4U server running:  http://localhost:${PORT}`);
  if (!PAY4U_KEY || !PAY4U_SALT) {
    console.warn("⚠  PAY4U_KEY / PAY4U_SALT missing — copy .env.example to .env and fill them in.");
  }
});
