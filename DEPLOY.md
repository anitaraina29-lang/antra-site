# Antra — Deploy to antrabotanicals.com (Vercel + GoDaddy DNS)

FAST + FREE. The website loads from Vercel's global CDN (never sleeps),
and the Pay4U signing runs as a Vercel serverless function.
The GoDaddy **domain** is pointed to Vercel via DNS.

---

## Step 1 — Put the code on GitHub
1. Create a free account at https://github.com
2. New repository → name it `antra-site` → Private → Create.
3. Upload the whole `antra-site` folder (drag-drop on GitHub, or GitHub Desktop).
   - `.gitignore` already excludes `node_modules` and `.env` (secrets stay safe).

## Step 2 — Deploy on Vercel
1. Sign up at https://vercel.com with the GitHub account.
2. **Add New → Project** → import the `antra-site` repo → Deploy.
   (No build settings needed — static site + `api/` functions are auto-detected.)
3. Go to **Project → Settings → Environment Variables** and add:
   - `PAY4U_KEY`      = (from Pay4U dashboard)
   - `PAY4U_SALT`     = (from Pay4U dashboard)
   - `PAY4U_ENDPOINT` = (the REAL Pay4U payment URL from their docs)
   - `SUCCESS_URL`    = https://antrabotanicals.com/payment-success
   - `FAILURE_URL`    = https://antrabotanicals.com/payment-failure
4. Redeploy (Deployments → ⋯ → Redeploy) so the variables take effect.
   Vercel gives a URL like `https://antra-site.vercel.app` — test it.

## Step 3 — Connect the GoDaddy domain
1. In Vercel → Project → **Settings → Domains** → add `antrabotanicals.com`
   (and `www.antrabotanicals.com`). Vercel shows the DNS records.
2. In GoDaddy → **Domains → antrabotanicals.com → DNS**, set them exactly:
   - `A` record  `@`   → `76.76.21.21`  (Vercel's IP — confirm in Vercel)
   - `CNAME`     `www` → `cname.vercel-dns.com`
3. Wait 15 min – a few hours for DNS. Vercel adds HTTPS automatically.

## Done
Live at https://antrabotanicals.com — fast, free, always on.

> Payment works only once `PAY4U_ENDPOINT` is the REAL Pay4U URL and the
> hash format in `api/pay.js` matches Pay4U's docs.

---

## Local testing (on this laptop)
The `server/` folder runs the same thing locally with Express:
```
cd server && npm install && npm start
```
Then open http://localhost:8787
(Vercel uses the `api/` folder; local uses `server/` — both do the same job.)
