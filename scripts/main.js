import { ListLoader } from "./list/ListLoader.js";
import { NovelListLoader } from "./list/NovelListLoader.js";
import { ListUI } from "./list/ListUI.js";
import { NovelListUI } from "./list/NovelListUI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const listLoader = new ListLoader();
  const novelListLoader = new NovelListLoader();
  window.chapterListUI = new ListUI(); // Expose globally
  window.novelListUI = new NovelListUI();

  await listLoader.init();
  await novelListLoader.init();
  window.chapterListUI.init(); // Use global reference
  window.novelListUI.init();

  // Disable right-click and long-press context menu
  window.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
    },
    false
  );

  // Register Service Worker for PWA (if supported)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) =>
          console.log("Service Worker registered with scope:", reg.scope)
        )
        .catch((err) =>
          console.warn("Service Worker registration failed:", err)
        );
    });
  }
});
