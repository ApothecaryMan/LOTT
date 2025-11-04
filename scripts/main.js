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
});
