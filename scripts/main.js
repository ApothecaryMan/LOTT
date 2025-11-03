import { ListLoader } from "./list/ListLoader.js";
import { NovelListLoader } from "./list/NovelListLoader.js";
import { ListUI } from "./list/ListUI.js";
import { NovelListUI } from "./list/NovelListUI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const listLoader = new ListLoader();
  const novelListLoader = new NovelListLoader();
  const listUI = new ListUI();
  window.novelListUI = new NovelListUI();

  await listLoader.init();
  await novelListLoader.init();
  listUI.init();
  novelListUI.init();
});
