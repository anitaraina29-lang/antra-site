/* =========================================================
   ANTRA — checkout page logic
   Reads ?id= (and optional ?qty=), renders an order summary +
   billing form, validates, and POSTs to the Pay4U backend.
   ========================================================= */
(function () {
  var CFG = window.ANTRA_CONFIG || {};
  var CUR = CFG.currency || "₹";
  var fmt = function (n) { return CUR + Number(n).toLocaleString("en-IN"); };
  var qs = function (k) { return new URLSearchParams(location.search).get(k); };

  var root = document.getElementById("checkout-body");
  var id = qs("id");
  var product = (window.ANTRA_PRODUCTS || []).filter(function (p) { return p.id === id; })[0];

  if (!product) {
    root.innerHTML =
      '<div class="co-empty"><p>No item selected for checkout.</p>' +
      '<p><a href="shop.html">← Return to the shop</a></p></div>';
    return;
  }

  var qty = Math.max(1, parseInt(qs("qty"), 10) || 1);
  var SHIP_FREE_OVER = 999; // free shipping threshold
  var SHIP_FLAT = 60;

  function totals() {
    var sub = product.price * qty;
    var ship = sub >= SHIP_FREE_OVER ? 0 : SHIP_FLAT;
    return { sub: sub, ship: ship, grand: sub + ship };
  }

  function render() {
    var t = totals();
    root.innerHTML =
      '<div class="co-grid">' +
        /* ---- left: billing form ---- */
        '<form id="pay-form" class="co-card" novalidate>' +
          '<h2>Billing details</h2>' +
          '<div class="fld" id="f-name"><label>Full name</label>' +
            '<input name="firstname" autocomplete="name" placeholder="Your name">' +
            '<div class="err">Please enter your name.</div></div>' +
          '<div class="row2">' +
            '<div class="fld" id="f-email"><label>Email</label>' +
              '<input name="email" type="email" autocomplete="email" placeholder="you@email.com">' +
              '<div class="err">Please enter a valid email.</div></div>' +
            '<div class="fld" id="f-phone"><label>Phone</label>' +
              '<input name="phone" type="tel" autocomplete="tel" placeholder="10-digit mobile">' +
              '<div class="err">Please enter a valid 10-digit number.</div></div>' +
          '</div>' +
          '<div class="fld" id="f-addr"><label>Shipping address</label>' +
            '<textarea name="address" autocomplete="street-address" placeholder="House / street, area, city, state, PIN"></textarea>' +
            '<div class="err">Please enter your shipping address.</div></div>' +
          '<div class="notice">You will be redirected to Pay4U’s secure gateway to complete payment. ' +
            'Antra never sees or stores your card / UPI details.</div>' +
        '</form>' +

        /* ---- right: order summary ---- */
        '<div class="co-card">' +
          '<h2>Order summary</h2>' +
          '<div class="sum-item">' +
            '<img src="' + (product.image || "") + '" alt="' + product.name + '">' +
            '<div><div class="nm">' + product.name + '</div>' +
              '<div class="sz">' + (product.size || product.type || "") + '</div>' +
              '<div class="qty"><button type="button" id="q-minus">−</button>' +
                '<span id="q-val">' + qty + '</span>' +
                '<button type="button" id="q-plus">+</button></div>' +
            '</div></div>' +
          '<div class="sum-line"><span>Subtotal</span><span id="s-sub">' + fmt(t.sub) + '</span></div>' +
          '<div class="sum-line"><span>Shipping</span><span id="s-ship">' +
            (t.ship === 0 ? "Free" : fmt(t.ship)) + '</span></div>' +
          '<div class="sum-total"><span class="lbl">Total</span>' +
            '<span class="amt" id="s-grand">' + fmt(t.grand) + '</span></div>' +
          '<button type="submit" form="pay-form" class="pay-btn" id="pay-btn">Pay ' + fmt(t.grand) + ' securely</button>' +
          '<div class="secure">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' +
            '<span>256-bit encrypted payment via Pay4U</span></div>' +
          '<div class="pay-methods"><span>UPI</span><span>Cards</span><span>Net Banking</span><span>Wallets</span></div>' +
        '</div>' +
      '</div>';

    wire();
  }

  function refreshTotals() {
    var t = totals();
    document.getElementById("q-val").textContent = qty;
    document.getElementById("s-sub").textContent = fmt(t.sub);
    document.getElementById("s-ship").textContent = t.ship === 0 ? "Free" : fmt(t.ship);
    document.getElementById("s-grand").textContent = fmt(t.grand);
    document.getElementById("pay-btn").textContent = "Pay " + fmt(t.grand) + " securely";
  }

  function setInvalid(fieldId, bad) {
    document.getElementById(fieldId).classList.toggle("invalid", bad);
  }

  function wire() {
    document.getElementById("q-minus").addEventListener("click", function () {
      if (qty > 1) { qty--; refreshTotals(); }
    });
    document.getElementById("q-plus").addEventListener("click", function () {
      if (qty < 20) { qty++; refreshTotals(); }
    });

    var form = document.getElementById("pay-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.firstname.value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.replace(/\D/g, "");
      var addr = form.address.value.trim();

      var okName = name.length >= 2;
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var okPhone = phone.length === 10;
      var okAddr = addr.length >= 8;

      setInvalid("f-name", !okName);
      setInvalid("f-email", !okEmail);
      setInvalid("f-phone", !okPhone);
      setInvalid("f-addr", !okAddr);
      if (!(okName && okEmail && okPhone && okAddr)) {
        form.querySelector(".invalid input, .invalid textarea").focus();
        return;
      }

      var t = totals();
      var btn = document.getElementById("pay-btn");
      btn.disabled = true; btn.textContent = "Redirecting to secure payment…";

      // Order reference so the captured order can be matched to the PayU transaction
      var orderRef = "ANTRA-" + Date.now();

      // Build the PayU redirect form (backend signs + forwards)
      var post = document.createElement("form");
      post.method = "POST";
      post.action = (CFG.pay4u && CFG.pay4u.endpoint) || "/api/pay";
      var fields = {
        amount: t.grand,
        productinfo: product.name + " x" + qty + " [" + orderRef + "]",
        firstname: name,
        email: email,
        phone: phone,
        address: addr
      };
      Object.keys(fields).forEach(function (k) {
        var i = document.createElement("input");
        i.type = "hidden"; i.name = k; i.value = fields[k];
        post.appendChild(i);
      });
      document.body.appendChild(post);

      // Capture the full order (incl. shipping address) to Netlify Forms so the
      // owner receives it for Shiprocket fulfilment — THEN continue to PayU.
      var sent = false;
      function goToPayU() { if (sent) return; sent = true; post.submit(); }
      var orderData = new URLSearchParams({
        "form-name": "antra-orders",
        "order-ref": orderRef,
        product: product.name + " (" + (product.size || "") + ")",
        qty: String(qty),
        amount: String(t.grand),
        name: name,
        email: email,
        phone: phone,
        address: addr
      });
      try {
        fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: orderData.toString() })
          .then(goToPayU, goToPayU);
        setTimeout(goToPayU, 2500); // safety: never block the buyer
      } catch (e) { goToPayU(); }
    });
  }

  render();
})();
