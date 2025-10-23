document.addEventListener("DOMContentLoaded", async () => {
  // The main container where the list will be loaded
  const listContainer = document.getElementById("chapter-list-container");
  // The div where individual chapter buttons will reside (loaded externally)
  const chapterListDivId = "chapter-list";

  if (!listContainer) {
    console.error(
      "Chapter list container (#chapter-list-container) not found!"
    );
    return;
  }

  try {
    // 1. Fetch the chapter list HTML content
    const response = await fetch("partials/chapter-list.html");
    if (!response.ok) {
      throw new Error(`Failed to load chapter list: ${response.status}`);
    }
    const listHtml = await response.text();

    // 2. Inject the HTML into the main container
    listContainer.innerHTML = listHtml;

    // --- UPDATED EVENT LISTENER ---
    // 3. Add a single event listener to the list container
    //    (We listen on the outer container in case the inner div isn't loaded yet)
    listContainer.addEventListener("click", async (event) => {
      // Find the closest BUTTON with the class 'list-item' that was clicked
      const button = event.target.closest("button.list-item");

      // If the click wasn't on a chapter button, do nothing
      if (!button) {
        return;
      }

      // Get the chapter number from the BUTTON's ID
      const chapterToLoad = button.id;

      // --- Chapter Loading Logic (Remains mostly the same) ---
      const paragraphContainer = document.getElementById("chapter-text");
      const chapterTitle = document.getElementById("chapter-title");

      if (!paragraphContainer || !chapterTitle) return;

      // Fade out current content
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for fade

      // Load the new chapter using the global function
      const success = await window.loadChapter(chapterToLoad);

      if (success) {
        window.currentChapterNumber = parseInt(chapterToLoad); // Update global number
        // Fade in new content
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
        // Update next/prev buttons and gear display using global function
        if (typeof window.updateButtonVisibility === "function") {
          await window.updateButtonVisibility();
        }
      } else {
        console.error(`Failed to load chapter ${chapterToLoad} from list.`);
        // Revert loading state if failed
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
      }
      // --- End Chapter Loading Logic ---
    });
  } catch (error) {
    console.error("Error loading or setting up chapter list:", error);
    if (listContainer) {
      // Check again in case it failed before injection
      listContainer.innerHTML = "<p>خطأ في تحميل قائمة الفصول.</p>";
    }
  }
});

//CHAPTER LIST BUTTON
document.addEventListener("DOMContentLoaded", () => {
  const listToggleButton = document.getElementById("list");
  const listContainer = document.getElementById("chapter-list-container");

  if (listToggleButton && listContainer) {
    listToggleButton.addEventListener("click", () => {
      // Check if the container is currently visible (has the class)
      const isVisible = listContainer.classList.contains("visible");

      if (isVisible) {
        // --- Hide it ---
        // 1. Set max-height to 0 to start animation
        listContainer.style.maxHeight = "0";
        // 2. Remove the class (triggers opacity/margin/padding transitions)
        listContainer.classList.remove("visible");
      } else {
        // --- Show it ---
        // 1. Add the class first (sets opacity/margin/padding targets)
        listContainer.classList.add("visible");
        // 2. Set max-height to the actual content height to trigger slide animation
        listContainer.style.maxHeight = listContainer.scrollHeight + "px";
      }
    });

    // Optional: Recalculate max-height if window resizes while list is open
    // This prevents content from being cut off if height changes
    window.addEventListener("resize", () => {
      if (listContainer.classList.contains("visible")) {
        listContainer.style.maxHeight = listContainer.scrollHeight + "px";
      }
    });
  } else {
    if (!listToggleButton)
      console.error("List toggle button (#list) not found.");
    if (!listContainer)
      console.error(
        "Chapter list container (#chapter-list-container) not found."
      );
  }
});
