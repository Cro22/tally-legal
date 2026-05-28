# Tally — site, legal & email templates

Marketing landing page, legal pages, and Supabase auth email templates for the
**Tally** budgeting app. Deployed to **Cloudflare Workers + static assets** via Wrangler.

## Structure

```
public/                 ← everything served by Cloudflare (the asset directory)
  index.html            landing page
  support.html          support / contact / FAQ
  privacy.html          Privacy Policy   (generated — see below)
  terms.html            Terms of Service (generated — see below)
  404.html              not-found page
  tally.css             shared design system (cream / ink / bronze)
  favicon.svg           Tally tally-mark
  emails/               Supabase auth email templates (not routed; copy/paste source)
    confirm.html
    reset-password.html
    magic-link.html

privacy-policy.html     ← raw Termly export (SOURCE, not served)
term-of-service.html    ← raw Termly export (SOURCE, not served)
scripts/wrap-legal.cjs  ← wraps the Termly sources into public/{privacy,terms}.html
wrangler.jsonc          Cloudflare config
```

### Legal pages are generated

`public/privacy.html` and `public/terms.html` are **built** from the raw Termly
exports at the repo root. The script strips Termly's `<style>` block and logo,
repoints old GitHub Pages links to clean paths, and wraps the content in the Tally
shell. If you re-export from Termly, overwrite the root files and rebuild:

```sh
node scripts/wrap-legal.cjs
```

## Develop locally

```sh
npm install
npm run dev          # wrangler dev — serves public/ at http://localhost:8787
```

Clean URLs are handled by Cloudflare's `html_handling`: `/privacy` serves
`privacy.html`, and `/privacy.html` redirects to `/privacy`.

## Deploy

```sh
npx wrangler login   # one time — opens the browser to authorize Cloudflare
npm run deploy       # wrangler deploy
```

The first deploy creates a `tally-legal.<your-subdomain>.workers.dev` URL. To use a
custom domain, add a route in the Cloudflare dashboard or a `routes` entry in
`wrangler.jsonc`.

## Email templates (Supabase)

The files in `public/emails/` are **source** to paste into Supabase, not pages the
app links to. In the Supabase dashboard go to **Authentication → Emails → Templates**
and paste the matching file's HTML:

| File                  | Supabase template            |
| --------------------- | ---------------------------- |
| `confirm.html`        | Confirm signup               |
| `reset-password.html` | Reset password               |
| `magic-link.html`     | Magic Link                   |

They use Supabase's `{{ .ConfirmationURL }}` variable for the action button/link.
