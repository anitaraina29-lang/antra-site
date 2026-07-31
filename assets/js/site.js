/* =========================================================
   ANTRA — site behaviour
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.ANTRA_CONFIG || {};
  var PRODUCTS = window.ANTRA_PRODUCTS || [];
  var byId = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };
  var fmt = function (n) { return (CFG.currency || "₹") + Number(n).toLocaleString("en-IN"); };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var qs = function (k) { return new URLSearchParams(location.search).get(k); };

  /* ---------- brand logo (SVG wordmark + lily) ---------- */
  // If you drop the official logo at assets/img/logo.png, set USE_IMG = true.
  var USE_IMG = true;
  var LOGO = USE_IMG
    ? '<img class="antra-logo" src="assets/img/logo.png" alt="Antra Botanicals">'
    : '<svg class="antra-logo" viewBox="0 0 300 112" role="img" aria-label="Antra Botanicals" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="4" y="76" font-family="\'Dancing Script\',cursive" font-weight="600" font-size="88" fill="currentColor">antra</text>' +
        '<text x="128" y="101" font-family="\'Jost\',sans-serif" font-size="15" letter-spacing="8" fill="currentColor">BOTANICALS</text>' +
        '<g transform="translate(262,36)" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M0,6 C-8,-9 -5,-30 0,-37 C5,-30 8,-9 0,6 Z"/>' +
          '<path d="M0,6 C-8,-9 -5,-30 0,-37 C5,-30 8,-9 0,6 Z" transform="rotate(60)"/>' +
          '<path d="M0,6 C-8,-9 -5,-30 0,-37 C5,-30 8,-9 0,6 Z" transform="rotate(-60)"/>' +
          '<path d="M0,6 C-7,-7 -5,-22 0,-27 C5,-22 7,-7 0,6 Z" transform="rotate(30)"/>' +
          '<path d="M0,6 C-7,-7 -5,-22 0,-27 C5,-22 7,-7 0,6 Z" transform="rotate(-30)"/>' +
          '<path d="M0,5 L0,-16 M0,5 L-7,-12 M0,5 L7,-12" stroke-width="1.5"/>' +
          '<circle cx="0" cy="-17" r="1.6" fill="currentColor"/><circle cx="-7" cy="-13" r="1.6" fill="currentColor"/><circle cx="7" cy="-13" r="1.6" fill="currentColor"/>' +
        '</g>' +
      '</svg>';

  /* ---------- order links ---------- */
  function orderLinks(p) {
    var subject = "Order enquiry — Antra: " + p.name;
    var body = "Hello Antra,\n\nI would love to order:\n\n• " + p.name + " (" + p.size + ") — " + fmt(p.price) +
               "\n\nPlease let me know how to proceed.\n\nThank you.";
    var links = [];
    if (CFG.pay4u && CFG.pay4u.enabled) {
      links.push('<button type="button" class="btn solid block" onclick="ANTRA_pay(\'' + p.id + '\')">Pay Now · ' + fmt(p.price) + '</button>');
    }
    if (CFG.whatsapp) {
      var wtext = encodeURIComponent("Hello Antra! I'd love to order the " + p.name + " (" + fmt(p.price) + "). Is it available?");
      links.push('<a class="btn btn-wa block" target="_blank" rel="noopener" href="https://wa.me/' + CFG.whatsapp + '?text=' + wtext + '">Order on WhatsApp</a>');
    }
    links.push('<a class="btn solid block" href="mailto:' + CFG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '">Order by Email</a>');
    if (CFG.instagram) {
      links.push('<a class="btn block" target="_blank" rel="noopener" href="https://instagram.com/' + CFG.instagram + '">Message on Instagram</a>');
    }
    return links.join("");
  }

  /* ---------- Pay4U checkout ---------- */
  // Collects buyer details, then POSTs to the backend which signs + forwards to Pay4U.
  window.ANTRA_pay = function (productId) {
    // Take the buyer to the professional checkout page.
    window.location.href = "checkout.html?id=" + encodeURIComponent(productId);
  };

  /* ---------- header / footer ---------- */
  function nav(active) {
    var items = [
      ["index.html", "Home"],
      ["shop.html", "Shop"],
      ["about.html", "Our Story"],
      ["rituals.html", "Rituals"],
      ["gifting.html", "Gifting"],
      ["contact.html", "Contact"]
    ];
    return items.map(function (i) {
      return '<a href="' + i[0] + '"' + (i[0] === active ? ' class="active"' : '') + '>' + i[1] + '</a>';
    }).join("");
  }

  /* ---------- theme (day / night) ---------- */
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4.1"/><path d="M12 2.6v2.1M12 19.3v2.1M3.3 12h2.1M18.6 12h2.1M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.8A8.2 8.2 0 0 1 9.2 3.5 6.7 6.7 0 1 0 20.5 14.8z"/></svg>';
  function curTheme() { return document.documentElement.getAttribute("data-theme") === "day" ? "day" : "night"; }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("antra-theme", t); } catch (e) {}
    var b = document.querySelector(".theme-toggle");
    if (b) { b.innerHTML = t === "day" ? MOON : SUN; b.setAttribute("aria-label", t === "day" ? "Switch to night" : "Switch to day"); b.setAttribute("title", t === "day" ? "Night" : "Day"); }
  }

  function buildHeader(active) {
    var el = document.getElementById("site-header");
    if (!el) return;
    el.className = "site-header";
    el.innerHTML =
      '<a class="brand-mark" href="index.html" aria-label="Antra home">' + LOGO + '</a>' +
      '<div class="header-right">' +
        '<nav class="nav">' + nav(active) +
          '<a class="nav-cta" href="shop.html">Shop the Ritual</a>' +
        '</nav>' +
        '<button class="theme-toggle" type="button" aria-label="Toggle day or night"></button>' +
        '<button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '</div>';

    // theme toggle
    applyTheme(curTheme());
    el.querySelector(".theme-toggle").addEventListener("click", function () {
      applyTheme(curTheme() === "day" ? "night" : "day");
    });

    var backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);

    var burger = el.querySelector(".burger");
    var navEl = el.querySelector(".nav");
    function toggle(open) {
      navEl.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      backdrop.classList.toggle("show", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () { toggle(!navEl.classList.contains("open")); });
    backdrop.addEventListener("click", function () { toggle(false); });
    navEl.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });

    // scroll-progress bar (lives inside the header; one rAF serves both jobs)
    var prog = document.createElement("div");
    prog.className = "scroll-progress";
    prog.setAttribute("aria-hidden", "true");
    prog.innerHTML = "<i></i>";
    el.appendChild(prog);
    var bar = prog.firstChild, ticking = false;

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        el.classList.toggle("scrolled", window.scrollY > 30);
        var h = document.documentElement;
        var p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1);
        bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var ig = CFG.instagram ? '<a target="_blank" rel="noopener" href="https://instagram.com/' + CFG.instagram + '">Instagram</a>' : '';
    el.className = "site-footer";
    el.innerHTML =
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<div class="foot-brand">' +
            '<span class="brand-mark">' + LOGO + '</span>' +
            '<p>We craft more than products—we channel ancient energy. 100% natural perfume oils & ritual skincare, blended in small batches to reawaken the goddess within.</p>' +
          '</div>' +
          '<div class="foot-col"><h4>Collections</h4>' +
            '<a href="shop.html#vero">The Vero Collection</a>' +
            '<a href="shop.html#grove">Goddess Grove</a>' +
            '<a href="product.html?id=initiation">The Initiation Set</a>' +
            '<a href="gifting.html">Gifting & Ceremony</a>' +
          '</div>' +
          '<div class="foot-col"><h4>The House</h4>' +
            '<a href="about.html">Our Story</a>' +
            '<a href="rituals.html">Rituals & Lore</a>' +
            '<a href="about.html#transparency">Transparency</a>' +
            '<a href="contact.html">Contact</a>' +
          '</div>' +
          '<div class="foot-col"><h4>Connect</h4>' +
            '<a href="mailto:' + CFG.email + '">' + CFG.email + '</a>' +
            ig +
            '<p>' + (CFG.location || '') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="foot-bottom">' +
          '<span>© <span class="yr"></span> Antra Botanicals · All rites reserved.</span>' +
          '<span class="socials">' + (CFG.instagram ? '<a target="_blank" rel="noopener" href="https://instagram.com/' + CFG.instagram + '">Instagram</a>' : '') +
            '<a href="mailto:' + CFG.email + '">Email</a></span>' +
        '</div>' +
      '</div>';
    var yr = el.querySelector(".yr");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- product card ---------- */
  function card(p, idx) {
    var d = (idx % 4) + 1;
    return '<article class="card reveal d' + d + '" style="--accent:' + p.accent + '">' +
      '<div class="card-media"><img loading="lazy" src="' + p.image + '" alt="' + esc(p.name) + '"></div>' +
      '<div class="card-body">' +
        '<span class="card-eyebrow">' + esc(p.type) + '</span>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="desc">' + esc(p.short) + '</p>' +
        '<div class="card-foot">' +
          '<span class="price">' + fmt(p.price) + '</span>' +
          '<span class="view">Discover <span class="arr">→</span></span>' +
        '</div>' +
      '</div>' +
      '<a class="card-link" href="product.html?id=' + p.id + '" aria-label="' + esc(p.name) + '"></a>' +
    '</article>';
  }

  function renderGrid(elId, list) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = list.map(card).join("");
  }

  /* ---------- reveal on scroll ---------- */
  function observeReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- product detail ---------- */
  function ing(p) {
    if (!p.ingredients) return "";
    var g = p.ingredients, h = "";
    h += '<span class="lbl">' + esc(g.carrier || "Ingredients") + '</span><ul>';
    (g.essentials || []).forEach(function (e) { h += "<li>" + esc(e) + "</li>"; });
    h += "</ul>";
    if (g.infusions) h += '<span class="lbl">Solar infusions</span><p>' + esc(g.infusions) + "</p>";
    if (g.compounds) h += '<span class="lbl">Naturally occurring compounds</span><p>' + esc(g.compounds) + "</p>";
    if (g.zero) h += '<span class="lbl">Zero</span><p>' + esc(g.zero) + "</p>";
    return h;
  }

  function notesBlock(p) {
    if (!p.notes) return "";
    return '<div class="notes">' +
      '<div class="row"><span class="k">Top Notes</span><span class="v">' + esc(p.notes.top) + '</span></div>' +
      '<div class="row"><span class="k">Heart Notes</span><span class="v">' + esc(p.notes.middle) + '</span></div>' +
      '<div class="row"><span class="k">Base Notes</span><span class="v">' + esc(p.notes.base) + '</span></div>' +
    '</div>';
  }

  function renderProduct() {
    var host = document.getElementById("product-root");
    if (!host) return;
    var p = byId(qs("id")) || PRODUCTS[0];
    document.title = p.name + " · Antra";
    document.documentElement.style.setProperty("--accent", p.accent);

    var collName = p.collection === "vero" ? "The Vero Collection" : "Goddess Grove";
    var collHash = p.collection === "vero" ? "vero" : "grove";

    var thumbs = p.gallery.map(function (g, i) {
      return '<button class="' + (i === 0 ? "active" : "") + '" data-src="' + g + '"><img src="' + g + '" alt="' + esc(p.name) + ' view ' + (i + 1) + '"></button>';
    }).join("");

    var extra = "";
    if (p.notes) extra += notesBlock(p);
    if (p.contents) {
      extra += '<div class="contents-list">' + p.contents.map(function (c) {
        return '<div class="ci"><b>' + esc(c.name) + '</b><span>' + esc(c.notes) + '</span></div>';
      }).join("") + '</div>';
    }
    if (p.bullets) extra += '<ul class="bullets">' + p.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>";

    var acc = "";
    if (p.ingredients) {
      acc += '<details><summary>Full Ingredients <span class="ico">+</span></summary><div class="acc-body">' + ing(p) + '</div></details>';
    }
    acc += '<details><summary>How to Wear <span class="ico">+</span></summary><div class="acc-body"><p>' +
      (p.collection === "vero"
        ? 'Give each scent time to unfold from top, to heart, to base. Apply generously to pulse points, hair, or the back of the neck. Without synthetics, our scents are intimate and alive, lasting 4–6 hours depending on your skin chemistry.'
        : 'Warm 3–5 drops between clean palms and press into damp skin, morning or night. A little goes far. Follow with your moisturiser if desired.') +
      '</p></div></details>';
    acc += '<details><summary>Safety <span class="ico">+</span></summary><div class="acc-body"><p>Always patch test before first use. For external use only; avoid contact with eyes. Discontinue use if irritation occurs.' +
      (p.shelfLife ? ' <br><br><strong>Shelf life:</strong> ' + esc(p.shelfLife) : '') +
      ' If you are pregnant or nursing, please reach out and we will gladly guide you to the safest blends.</p></div></details>';

    host.innerHTML =
      '<div class="wrap pd">' +
        '<div class="pd-grid">' +
          '<div class="pd-gallery reveal">' +
            '<div class="pd-main"><img id="pd-main-img" src="' + p.gallery[0] + '" alt="' + esc(p.name) + '"></div>' +
            (p.gallery.length > 1 ? '<div class="pd-thumbs">' + thumbs + '</div>' : '') +
          '</div>' +
          '<div class="pd-info reveal d1">' +
            '<div class="crumb"><a href="shop.html">Shop</a> &nbsp;/&nbsp; <a href="shop.html#' + collHash + '">' + collName + '</a></div>' +
            '<span class="eyebrow">' + esc(p.eyebrow || p.type) + '</span>' +
            '<h1>' + esc(p.name) + '</h1>' +
            '<span class="pd-type">' + esc(p.type) + ' · ' + esc(p.size) + '</span>' +
            '<div class="pd-price">' + fmt(p.price) + ' <small>incl. of all taxes</small></div>' +
            '<p class="pd-story">' + esc(p.story) + '</p>' +
            (p.quote ? '<p class="pd-quote">“' + esc(p.quote) + '”</p>' : '') +
            extra +
            '<div class="pd-order">' + orderLinks(p) +
              '<p class="hint">Hand-blended to order in small batches · ships across India</p>' +
            '</div>' +
            '<div class="acc">' + acc + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // gallery switch
    var mainImg = document.getElementById("pd-main-img");
    host.querySelectorAll(".pd-thumbs button").forEach(function (b) {
      b.addEventListener("click", function () {
        host.querySelectorAll(".pd-thumbs button").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        mainImg.src = b.getAttribute("data-src");
      });
    });

    // related
    var rel = document.getElementById("related-grid");
    if (rel) {
      var others = PRODUCTS.filter(function (x) { return x.collection === p.collection && x.id !== p.id; }).slice(0, 3);
      if (others.length < 3) others = PRODUCTS.filter(function (x) { return x.id !== p.id; }).slice(0, 3);
      rel.innerHTML = others.map(card).join("");
    }
  }

  /* ---------- shop page ---------- */
  function renderShop() {
    if (!document.getElementById("shop-vero")) return;
    renderGrid("shop-vero", PRODUCTS.filter(function (p) { return p.collection === "vero"; }));
    renderGrid("shop-grove", PRODUCTS.filter(function (p) { return p.collection === "grove"; }));
  }

  /* ---------- The Antra Oracle ("Find your goddess") ---------- */
  var ORACLE = [
    { q: "What stirs in you tonight?", o: [
      { b: "Mystery", s: "the shadow, the unspoken", g: "lilith" },
      { b: "Sovereignty", s: "to reign, unapologetic", g: "hera" },
      { b: "Allure", s: "to draw the world close", g: "siren" },
      { b: "Rebirth", s: "to rise from the dark", g: "persephone" }
    ]},
    { q: "Which landscape calls to you?", o: [
      { b: "A moonlit garden", s: "lotus under midnight", g: "lilith" },
      { b: "A throne of storm", s: "cloud, cedar, command", g: "hera" },
      { b: "A wild coastline", s: "salt, jasmine, tide", g: "siren" },
      { b: "The underworld bloom", s: "pomegranate & rose", g: "persephone" }
    ]},
    { q: "How do you wish to be remembered?", o: [
      { b: "Untamed", s: "“too much” — and proud", g: "lilith" },
      { b: "Commanding", s: "the room bends to you", g: "hera" },
      { b: "Magnetic", s: "impossible to look away", g: "siren" },
      { b: "Unbreakable", s: "you survived, then bloomed", g: "persephone" }
    ]}
  ];
  var ORACLE_ORDER = ["lilith", "persephone", "siren", "hera"]; // deterministic tie-break

  function renderOracle() {
    var stage = document.getElementById("oracle-stage");
    if (!stage) return;
    var step, scores, locked = false;
    var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function reset() { step = 0; scores = { lilith: 0, persephone: 0, siren: 0, hera: 0 }; }
    reset();

    function bindStage() {
      stage.querySelectorAll("[data-g]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (locked) return;                 // ignore taps during the swap (no double-count)
          locked = true;
          scores[btn.getAttribute("data-g")] += 1;
          step++;
          if (step < ORACLE.length) renderStep(true); else renderResult(winner(), true);
        });
      });
      var again = stage.querySelector(".or-again, .or-begin");
      if (again) again.addEventListener("click", function () { if (locked) return; locked = true; reset(); renderStep(true); });
    }

    function swap(html, focus) {
      stage.classList.add("is-leaving");
      setTimeout(function () {
        stage.innerHTML = html;
        stage.className = "oracle-stage is-entering";
        requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.add("in"); }); });
        bindStage();
        locked = false;
        if (focus) {                          // keep keyboard users oriented after the swap
          var f = stage.querySelector(".or-option") || stage.querySelector(".or-result h3");
          if (f) { try { f.focus(); } catch (e) {} }
        }
      }, RM ? 0 : 220);
    }

    function renderStep(focus) {
      var Q = ORACLE[step];
      var opts = Q.o.map(function (o) {
        return '<button class="or-option" type="button" data-g="' + o.g + '"><b>' + esc(o.b) + '</b><span>' + esc(o.s) + '</span></button>';
      }).join("");
      var pct = ((step + 1) / ORACLE.length) * 100;
      swap('<div class="or-rail"><i style="width:' + pct + '%"></i></div>' +
           '<p class="or-q">' + esc(Q.q) + '</p>' +
           '<div class="or-options">' + opts + '</div>', focus);
    }

    function winner() {
      var best = ORACLE_ORDER[0], bestScore = -1;
      ORACLE_ORDER.forEach(function (id) { if (scores[id] > bestScore) { bestScore = scores[id]; best = id; } });
      return best;
    }

    function renderResult(id, focus) {
      var p = byId(id);
      try { localStorage.setItem("antra-goddess", id); } catch (e) {}
      swap('<div class="or-result" style="--accent:' + p.accent + '">' +
        '<div class="or-media"><img src="' + p.image + '" alt="' + esc(p.name) + '"></div>' +
        '<p class="or-tag">She is yours</p>' +
        '<h3 tabindex="-1">' + esc(p.name) + '</h3>' +
        '<p class="or-line">' + esc(p.archetypeLine || p.short) + '</p>' +
        '<p class="or-price">' + fmt(p.price) + '</p>' +
        '<div class="or-actions">' +
          '<a class="btn solid" href="product.html?id=' + p.id + '">' + esc(p.ctaLine || "Meet her") + '</a>' +
          '<button class="btn or-again" type="button">Cast again</button>' +
        '</div>' +
      '</div>', focus);
    }

    // initial: gently recall the last result if we have one
    var saved; try { saved = localStorage.getItem("antra-goddess"); } catch (e) {}
    var sp = saved && byId(saved);
    if (sp) {
      stage.innerHTML =
        '<div class="or-recall">' +
          '<p>Last time, <b>' + esc(sp.name) + '</b> called to you.</p>' +
          '<div class="or-recall-actions">' +
            '<a class="btn solid" href="product.html?id=' + sp.id + '">Return to her →</a>' +
            '<button class="btn or-begin" type="button">Begin anew →</button>' +
          '</div>' +
        '</div>';
      stage.className = "oracle-stage";
      bindStage();
    } else {
      renderStep(false);   // first paint on load — don't steal focus / jump-scroll
    }
  }

  /* ---------- home page ---------- */
  function renderHome() {
    renderGrid("home-vero", PRODUCTS.filter(function (p) { return p.collection === "vero"; }));
    renderGrid("home-grove", PRODUCTS.filter(function (p) { return p.collection === "grove"; }));
    renderOracle();
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildHeader(document.body.getAttribute("data-page") || "");
    buildFooter();
    renderHome();
    renderShop();
    renderProduct();
    observeReveals();
  });
})();

/* =========================================================
   PREMIUM 3D TILT — cards follow the cursor with subtle depth
   (delegated so it works on dynamically-rendered grids too)
   ========================================================= */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // desktop / mouse only — skip entirely on touch (big perf win on mobile)
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
  var SEL = '.card, .ritual-card, .moon-card, .archetype';
  var MAX = 9; // degrees
  var last = null, pending = null, ticking = false;

  function reset(el) {
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  // throttle to one style write per animation frame (pointermove can fire 100s/sec)
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest ? e.target.closest(SEL) : null;
    if (last && last !== el) reset(last);
    last = el;
    if (!el) { pending = null; return; }
    pending = { el: el, x: e.clientX, y: e.clientY };
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (!pending) return;
      var r = pending.el.getBoundingClientRect();
      var px = (pending.x - r.left) / r.width - 0.5;
      var py = (pending.y - r.top) / r.height - 0.5;
      pending.el.style.setProperty('--rx', (px * MAX).toFixed(2) + 'deg');
      pending.el.style.setProperty('--ry', (-py * MAX).toFixed(2) + 'deg');
    });
  }, { passive: true });

  document.addEventListener('pointerleave', function () { reset(last); last = null; }, true);
  window.addEventListener('blur', function () { reset(last); last = null; });
})();

/* =========================================================
   DELUXE — custom product cursor + glass-glare tracking
   ========================================================= */
(function () {
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;

  var aura = document.createElement('div'); aura.className = 'cursor-aura';
  var dot = document.createElement('div'); dot.className = 'cursor-dot';
  document.body.appendChild(aura); document.body.appendChild(dot);

  // static aura colour set ONCE (no per-frame gradient repaint — that was the main jank source)
  aura.style.background = 'radial-gradient(circle, rgba(201,168,106,.5), transparent 70%)';

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var ax = mx, ay = my;
  var HOVER = 'a,button,summary,input,textarea,select,.theme-toggle,.card,.card-link';
  var glareTick = false, glare = null;

  document.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    if (e.target.closest && e.target.closest(HOVER)) aura.classList.add('hover');
    else aura.classList.remove('hover');
    // glass glare — throttled to one write per frame
    var card = e.target.closest && e.target.closest('.card');
    if (card) {
      glare = { card: card, x: e.clientX, y: e.clientY };
      if (!glareTick) {
        glareTick = true;
        requestAnimationFrame(function () {
          glareTick = false;
          if (!glare) return;
          var r = glare.card.getBoundingClientRect();
          glare.card.style.setProperty('--gx', ((glare.x - r.left) / r.width * 100).toFixed(1) + '%');
          glare.card.style.setProperty('--gy', ((glare.y - r.top) / r.height * 100).toFixed(1) + '%');
        });
      }
    }
  }, { passive: true });

  // position-only loop (compositor-cheap; no paint)
  (function loop() {
    ax += (mx - ax) * 0.18; ay += (my - ay) * 0.18;
    aura.style.transform = 'translate(' + ax + 'px,' + ay + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseleave', function () { dot.style.opacity = 0; aura.style.opacity = 0; });
  document.addEventListener('mouseenter', function () { dot.style.opacity = 1; aura.style.opacity = 1; });
})();

/* colourful aurora background layer (all devices) */
(function () {
  var a = document.createElement('div');
  a.className = 'antra-aurora';
  a.setAttribute('aria-hidden', 'true');
  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertBefore(a, document.body.firstChild);
  });
})();

/* ensure the script logo font is ready before the header paints */
(function () {
  try { if (document.fonts && document.fonts.load) document.fonts.load("600 88px 'Dancing Script'"); } catch (e) {}
})();
