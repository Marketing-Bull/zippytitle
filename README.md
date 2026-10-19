# ZippyTitle

Static site for zippytitle.com, hosted on Cloudflare Workers (static assets). No build step.

```
public/          site files (HTML, CSS, JS, _headers, _redirects)
src/worker.js    handles POST /api/contact (everything else is served as static assets)
wrangler.jsonc
```

## Deploy (Git integration, recommended)

1. Cloudflare dashboard > Workers & Pages > Create > Import a repository, pick this repo.
2. Project name `zippytitle`. Build command: *(empty)*. Deploy command: `npx wrangler deploy`.
3. Settings > Variables and Secrets, for the contact form:
   - `RESEND_API_KEY` (secret), `CONTACT_TO`, `CONTACT_FROM`
   - `CONTACT_FROM` must be on a domain verified in Resend.
4. Settings > Domains & Routes > add `zippytitle.com` and `www.zippytitle.com`. The domain's DNS must be on Cloudflare; the records are created for you.

Every push to `main` redeploys.

## Deploy (CLI)

```
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put RESEND_API_KEY
```

Set `CONTACT_TO` and `CONTACT_FROM` as plain variables in the dashboard (or add them under `vars` in `wrangler.jsonc`).

## Local dev

```
npm install
printf 'RESEND_API_KEY=...\nCONTACT_TO=you@example.com\nCONTACT_FROM=ZippyTitle <noreply@zippytitle.com>\n' > .dev.vars
npm run dev
```
