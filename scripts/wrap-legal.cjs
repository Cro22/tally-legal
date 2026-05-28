// One-off transform: take the Termly-generated legal fragments at the repo root
// and wrap them in the Tally-styled shell, writing the result into public/.
//
// What it strips:
//   - the leading Termly <style> block (we restyle data-custom-class in tally.css)
//   - the Termly base64 logo <span>
// What it rewrites:
//   - old GitHub Pages cross-links -> clean Cloudflare paths (/privacy, /terms)
//
// Run from the repo root:  node scripts/wrap-legal.cjs
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public");

const HEADER = `  <header class="site-header">
    <a class="brand" href="/">
      <svg width="34" height="34" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="14" width="4" height="36" fill="#B08D57"/>
        <rect x="20" y="14" width="4" height="36" fill="#B08D57"/>
        <rect x="30" y="14" width="4" height="36" fill="#B08D57"/>
        <rect x="40" y="14" width="4" height="36" fill="#B08D57"/>
        <rect x="8" y="30" width="48" height="4" fill="#B08D57" transform="rotate(-20 32 32)"/>
      </svg>
      <span class="brand-name">Tally</span>
    </a>
    <nav class="site-nav">
      <a href="/support">Support</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </header>`;

const FOOTER = `  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="14" width="4" height="36" fill="#B08D57"/>
          <rect x="20" y="14" width="4" height="36" fill="#B08D57"/>
          <rect x="30" y="14" width="4" height="36" fill="#B08D57"/>
          <rect x="40" y="14" width="4" height="36" fill="#B08D57"/>
          <rect x="8" y="30" width="48" height="4" fill="#B08D57" transform="rotate(-20 32 32)"/>
        </svg>
        <span class="brand-name">Tally</span>
      </div>
      <nav class="footer-nav">
        <a href="/support">Support</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </nav>
      <p class="footer-tagline">Tally · Personal budgeting with discipline</p>
      <p class="footer-legal">© 2026 Tally. All rights reserved.</p>
    </div>
  </footer>`;

function shell(title, desc, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · Tally</title>
  <meta name="description" content="${desc}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/tally.css">
</head>
<body>
${HEADER}
  <main class="legal">
    <div class="legal-card">
${body}
    </div>
  </main>
${FOOTER}
</body>
</html>
`;
}

function clean(src) {
  let s = fs.readFileSync(src, "utf8");
  // Drop the leading Termly typography <style> block (first occurrence only).
  s = s.replace(/^\s*<style>[\s\S]*?<\/style>\s*/i, "");
  // Drop the Termly base64 logo span.
  s = s.replace(/<span style="display: block;[\s\S]*?<\/span>\s*/i, "");
  // Repoint old GitHub Pages cross-links to the clean Cloudflare paths.
  s = s.replace(/https?:\/\/cro22\.github\.io\/tally-legal\/privacy-policy\.html/gi, "/privacy");
  s = s.replace(/https?:\/\/cro22\.github\.io\/tally-legal\/term-of-service\.html/gi, "/terms");
  return s.trim();
}

const jobs = [
  {
    in: "privacy-policy.html",
    out: "privacy.html",
    title: "Privacy Policy",
    desc: "How Tally collects, uses, and protects your information.",
  },
  {
    in: "term-of-service.html",
    out: "terms.html",
    title: "Terms of Service",
    desc: "The terms governing your use of Tally.",
  },
];

for (const j of jobs) {
  const body = clean(path.join(ROOT, j.in));
  fs.writeFileSync(path.join(OUT, j.out), shell(j.title, j.desc, body));
  console.log(`wrote public/${j.out} (${body.length} chars of content)`);
}
