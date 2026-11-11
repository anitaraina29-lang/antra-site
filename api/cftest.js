/* TEMPORARY diagnostic — calls Cashfree create-order and returns the raw response
   so we can see the exact error. Reveals only the secret's non-sensitive prefix.
   DELETE after use. */
module.exports = async function handler(req, res) {
  const APP_ID = process.env.CASHFREE_APP_ID;
  const SECRET = process.env.CASHFREE_SECRET_KEY;
  const MODE = process.env.CASHFREE_MODE === "production" ? "production" : "sandbox";
  const base = MODE === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  res.setHeader("Content-Type", "application/json");
  const diag = {
    hasApp: !!APP_ID, appLen: (APP_ID || "").length,
    hasSecret: !!SECRET, secretLen: (SECRET || "").length, secretPrefix: (SECRET || "").slice(0, 13),
    mode: MODE, enabled: process.env.CASHFREE_ENABLED, base,
  };
  if (!APP_ID || !SECRET) { res.status(200).send(JSON.stringify({ ok: false, reason: "missing keys", diag })); return; }
  try {
    const r = await fetch(base + "/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": APP_ID, "x-client-secret": SECRET, "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_amount: 100, order_currency: "INR",
        customer_details: { customer_id: "cust1", customer_name: "Test", customer_email: "test@example.com", customer_phone: "9876543210" },
      }),
    });
    const text = await r.text();
    res.status(200).send(JSON.stringify({ ok: r.ok, status: r.status, body: text.slice(0, 700), diag }));
  } catch (e) {
    res.status(200).send(JSON.stringify({ ok: false, error: String((e && e.message) || e), diag }));
  }
};
