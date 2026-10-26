# ZippyTitle

Static site for zippytitle.com, built for Cloudflare Pages. No build step.

```
public/      site files (HTML, CSS, JS, _headers, _redirects)
functions/   Pages Functions (POST /api/contact)
wrangler.toml
```

## Deploy (Git integration, recommended)

1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git, pick this repo.
2. Framework preset: **None**. Build command: *(empty)*. Build output directory: `public`.
3. Settings > Variables and Secrets (Production), for the contact form:
   - `RESEND_API_KEY` (secret). `CONTACT_TO` and `CONTACT_FROM` are already set in `wrangler.toml`.
   - `CONTACT_FROM` must be on a domain verified in Resend.
4. Custom domains > add `zippytitle.com` and `www.zippytitle.com`. If the domain's DNS is on Cloudflare, records are created automatically.

## Deploy (CLI)

```
npm install
npx wrangler pages deploy
```

## Local dev

```
npm install
printf 'RESEND_API_KEY=...\nCONTACT_TO=you@example.com\nCONTACT_FROM=ZippyTitle <noreply@getmarketingbull.com>\n' > .dev.vars
npm run dev
```
