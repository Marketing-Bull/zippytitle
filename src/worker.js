// Cloudflare Worker: serves /public as static assets (handled by the platform)
// and handles POST /api/contact, which emails the contact form via Resend
// (https://resend.com).
//
// Required variables (Workers > zippytitle > Settings > Variables and Secrets):
//   RESEND_API_KEY  (secret)  API key from Resend
//   CONTACT_TO                inbox that receives enquiries, e.g. leads@getmarketingbull.com
//   CONTACT_FROM              verified sender, e.g. "ZippyTitle <noreply@getmarketingbull.com>"
//   TURNSTILE_SECRET_KEY (secret)  secret key of the Cloudflare Turnstile widget on the form

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Checks the Cloudflare Turnstile token the widget adds to the form.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const result = await res.json();
    if (!result.success) console.warn('Turnstile failed', result['error-codes']);
    return result.success === true;
  } catch (err) {
    console.error('Turnstile error', err);
    return false;
  }
}

async function handleContact(request, env) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: bots fill this in, people don't. Pretend success.
  if (data.website) return json({ ok: true });

  if (!(await verifyTurnstile(data['cf-turnstile-response'], request, env))) {
    return json({ error: 'Please complete the security check and try again.' }, 403);
  }

  const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const first = clean(data.first, 100);
  const last = clean(data.last, 100);
  const email = clean(data.email, 200);
  const phone = clean(data.phone, 50);
  const message = clean(data.message, 5000);

  if (!first || !last || !email || !phone || !message) {
    return json({ error: 'Please fill in all fields.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json({ error: 'The contact form is not configured yet. Please try again later.' }, 503);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `New ZippyTitle enquiry from ${first} ${last}`,
      html: `<p><strong>Name:</strong> ${esc(first)} ${esc(last)}</p>
<p><strong>Email:</strong> ${esc(email)}</p>
<p><strong>Phone:</strong> ${esc(phone)}</p>
<p><strong>Message:</strong></p><p>${esc(message).replace(/\n/g, '<br>')}</p>`,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ error: 'We could not send your message. Please try again.' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return handleContact(request, env);
    // Only /api/* reaches the Worker (see run_worker_first); anything else is a safety net.
    return env.ASSETS.fetch(request);
  },
};
