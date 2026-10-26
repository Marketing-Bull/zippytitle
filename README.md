# ZippyTitle

Static site for zippytitle.com, served by a Cloudflare Worker (static assets plus the contact form). No build step.

```
public/        site files (HTML, CSS, JS, _headers, _redirects)
src/worker.js  Worker: POST /api/contact (emailed via Resend)
wrangler.jsonc
```

## Deploy (Git integration, recommended)

1. Cloudflare dashboard > Workers & Pages > Create > Import a repository, pick this repo.
2. Project name `zippytitle`. Build command: *(empty)*. Deploy command: `npx wrangler deploy`.
3. Settings > Variables and Secrets, for the contact form:
   - `RESEND_API_KEY` (secret). `CONTACT_TO` and `CONTACT_FROM` are already set in `wrangler.jsonc`.
   - `CONTACT_FROM` must be on a domain verified in Resend.
4. Settings > Domains & Routes > add `zippytitle.com` and `www.zippytitle.com`. The domain's DNS must be on Cloudflare; the records are created for you.

Every push to `main` redeploys. Pushes to other branches only upload a preview version and leave the live site unchanged.

## Deploy (CLI)

```
npm install
npx wrangler deploy
npx wrangler secret put RESEND_API_KEY   # or set it in the dashboard
```

## Local dev

```
npm install
printf 'RESEND_API_KEY=...\nCONTACT_TO=you@example.com\nCONTACT_FROM=ZippyTitle <noreply@getmarketingbull.com>\n' > .dev.vars
npm run dev
```
