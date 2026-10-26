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
3. The contact form sends via Resend. `CONTACT_TO` and `CONTACT_FROM` live in `wrangler.jsonc`; add the secret in Settings > Variables and Secrets:
   - `RESEND_API_KEY` (secret)
   - `CONTACT_FROM` must be on a domain verified in Resend.
4. Settings > Domains & Routes > add `zippytitle.com` and `www.zippytitle.com`. The domain's DNS must be on Cloudflare; the records are created for you.

Every push to `main` redeploys (Cloudflare Workers Builds, deploy command `npx wrangler deploy`). Build logs are under Workers & Pages > `zippytitle` > Deployments.

## Deploy (CLI)

```
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put RESEND_API_KEY
```

`CONTACT_TO` and `CONTACT_FROM` are set under `vars` in `wrangler.jsonc`, so every deploy keeps them.

## Local dev

```
npm install
printf 'RESEND_API_KEY=...\nCONTACT_TO=you@example.com\nCONTACT_FROM=ZippyTitle <noreply@getmarketingbull.com>\n' > .dev.vars
npm run dev
```
