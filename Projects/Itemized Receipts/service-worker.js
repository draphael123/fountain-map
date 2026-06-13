// service-worker.js — Fountain Vitality Itemized Receipt Generator
// Caches the app shell + pdf-lib + Libre Franklin so the tool works offline
// after the first successful load.
const CACHE_VERSION = "fv-receipt-v67-2026-06-13";
const CACHE_NAME = CACHE_VERSION;
// One-sentence summary of the most recent change — shown in the page header.
// Update this string alongside CACHE_VERSION on every deploy.
const LAST_CHANGE = "Added Superbill mode — a Document Type toggle at the top of the form switches between Itemized Receipt and Superbill, automatically enabling NPI and relabeling the PDF header and filename.";

const APP_SHELL = [
  "./",
  "./index.html",
  "./cost-engine.js",
  "./fv-shared.js",
  "./bg.js",
  "./bg-image.js",
  "./auth.js",
  "./cpt-lines.js",
  "./detail-lines.js",
  "./detail-lines-pdf.js",
  "./shortcuts.js",
  "./print-preview.js",
  "./multi-receipt.js",
  "./visual-polish.js",
  "./med-selector.js",
  "./ui-enhancements.js",
  "./ui-extras.js",
  "./visual-upgrade.js",
  "./ui-pack.js",
  "./operator-ux.js",
  "./stripe-import.js",
  "./tabs.js",
  "./fountain-config.js",
  "./sentry-init.js",
];

const CDN_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com", "framerusercontent.com"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map((url) => cache.add(url).catch((err) => console.warn("[sw] skip:", url, err && err.message))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCdn = CDN_HOSTS.some((h) => url.hostname.endsWith(h));
  if (url.hostname === "api.github.com") return;

  if (sameOrigin) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;
        const fallback = await caches.match("./index.html");
        if (fallback) return fallback;
        throw err;
      }
    })());
    return;
  }

  if (isCdn) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh && (fresh.ok || fresh.type === "opaque")) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        throw err;
      }
    })());
    return;
  }
});
