import { ListLoader } from "./list/ListLoader.js";
import { ListUI } from "./list/ListUI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const listLoader = new ListLoader();
  const listUI = new ListUI();

  await listLoader.init();
  listUI.init();
});
