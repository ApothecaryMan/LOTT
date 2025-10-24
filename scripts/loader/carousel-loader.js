// Loads carousel partials from `partials/carousel/` and injects them into #carousel
// This script is loaded with `defer` and registers a DOMContentLoaded listener
// so it injects the partials before other scripts' DOMContentLoaded handlers run.

document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const partials = [
    "partials/carousel/1-title.html",
    "partials/carousel/2-controls.html",
    "partials/carousel/3-fontsize.html",
    "partials/carousel/4-align.html",
    "partials/carousel/5-fonts.html",
    "partials/carousel/6-colors.html",
    "partials/carousel/7-wordcount.html",
    "partials/carousel/8-mode.html",
  ];

  // Simple sessionStorage cache to avoid re-fetching during the same page session
  const CACHE_PREFIX = "carousel_partial_";

  for (const path of partials) {
    try {
      // Use cached content when available
      const cacheKey = CACHE_PREFIX + path;
      let html = sessionStorage.getItem(cacheKey);

      if (!html) {
        const res = await fetch(path);
        if (!res.ok) {
          console.error(
            `Failed to load carousel partial ${path}: ${res.status}`
          );
          // Insert a lightweight placeholder slide so the carousel doesn't break
          const placeholder = `\n<div class="carousel-item placeholder">\n  <div style="padding:12px;color:#fff;background:rgba(0,0,0,.4);">محتوى غير متوفر: ${path}</div>\n</div>\n`;
          carousel.insertAdjacentHTML("beforeend", placeholder);
          continue;
        }
        html = await res.text();
        try {
          sessionStorage.setItem(cacheKey, html);
        } catch (e) {
          // Ignore storage failures (e.g., quota)
        }
      }

      // Append the partial's markup to the carousel
      carousel.insertAdjacentHTML("beforeend", html);
    } catch (err) {
      console.error(`Error fetching ${path}:`, err);
      const placeholder = `\n<div class="carousel-item placeholder">\n  <div style="padding:12px;color:#fff;background:rgba(0,0,0,.4);">خطأ في تحميل جزء: ${path}</div>\n</div>\n`;
      carousel.insertAdjacentHTML("beforeend", placeholder);
    }
  }

  // Optional: dispatch an event after carousel items are inserted
  const ev = new CustomEvent("carouselLoaded");
  document.dispatchEvent(ev);
});
