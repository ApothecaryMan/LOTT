const CACHE_NAME = "lott-static-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/css/main.css",
  "/css/general.css",
  "/css/theme.css",
  "/scripts/main.js",
  "/scripts/script.js",
  "/img/icon-512.jpg",
  "/img/55.jpg",
  "/img/pic1.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((networkResp) => {
          // Cache a copy for future visits (best-effort)
          return caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, networkResp.clone());
            } catch (e) {
              // ignore opaque responses or cross-origin issues
            }
            return networkResp;
          });
        })
        .catch(() => {
          // If request is for a navigation, serve offline page
          if (
            event.request.mode === "navigate" ||
            (event.request.headers.get("accept") || "").includes("text/html")
          ) {
            return caches.match("/offline.html");
          }
        });
    })
  );
});
