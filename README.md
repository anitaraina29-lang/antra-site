# Antra — website

A self-contained static website for **Antra Botanicals** (botanical perfume oils & ritual skincare).
Plain HTML / CSS / JS — no build step, no dependencies. Just open or host the `antra-site` folder.

## Pages
| File | Page |
|------|------|
| `index.html` | Home |
| `shop.html` | Shop (The Vero Collection + Goddess Grove) |
| `product.html?id=…` | Single product (data-driven) |
| `about.html` | Our Story + Transparency |
| `rituals.html` | Rituals & Lore |
| `gifting.html` | Gifting & Ceremony |
| `contact.html` | Contact |

## Where the content lives
- **Products & copy:** `assets/js/products.js` — every product, price, notes and ingredient list. Edit here to change anything in the shop.
- **Contact / ordering links:** `assets/js/config.js` — see below.
- **Look & feel:** `assets/css/styles.css` (colours are CSS variables at the top).
- **Photos:** `assets/img/` (already optimised for web).

## ⚠️ Set these before going live — `assets/js/config.js`
```js
instagram: "antra.fem",   // ← CONFIRM this is the real handle (guessed from the email)
whatsapp:  "",            // ← ADD WhatsApp number, e.g. "919876543210" — then an
                          //    "Order on WhatsApp" button appears on every product
email:     "antra.fem@gmail.com"
```
Until a WhatsApp number is added, products show **Order by Email** + **Message on Instagram** only.

## How to preview locally
From this folder, run any static server, e.g.:
```
python -m http.server 4173
```
then open http://localhost:4173

(Opening `index.html` directly by double-click also works.)

## How to publish (free options)
- **Netlify Drop** — drag the `antra-site` folder onto https://app.netlify.com/drop
- **Vercel** / **Cloudflare Pages** / **GitHub Pages** — point them at this folder.

No server code is needed; it's fully static.

## Day / Night mode
- A sun/moon toggle sits in the header. **Night** = the signature dark "midnight apothecary" look;
  **Day** = a soft warm-cream theme. The choice is saved per browser (`localStorage` key `antra-theme`).
- First visit follows the visitor's device setting (light OS → day, otherwise night). No flash on load.
- The big photo bands (hero, page headers, the "spell" quote) stay cinematic-dark in both modes by design,
  so the moody product imagery always reads well.
- All theme colours are CSS variables at the top of `assets/css/styles.css` (`:root` = night,
  `:root[data-theme="day"]` = day). Edit there to retune either palette.

## Notes
- Ordering is "enquiry-based" (WhatsApp / Email / Instagram). If you later want a real cart
  with online payment (Razorpay/UPI), that can be added.
- Original full-resolution photos are untouched in the parent folders
  (`Vero Collection/`, `Face Oils/`, etc.). The web copies in `assets/img/` were resized.
