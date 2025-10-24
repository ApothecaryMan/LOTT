// This part handles fetching the list content and loading chapters when an item is clicked.
document.addEventListener("DOMContentLoaded", async () => {
  // The container where the list will be injected
  const listContainer = document.getElementById("chapter-list-container");

  if (!listContainer) {
    console.error(
      "Chapter list container (#chapter-list-container) not found!"
    );
    return;
  }

  try {
    // 1. Fetch the chapter list HTML content from the external file.
    // Make sure 'chapter-list.html' is in the correct path relative to index.html.
    const response = await fetch("partials/chapter-list.html");
    if (!response.ok) {
      throw new Error(`Failed to load chapter list: ${response.status}`);
    }
    const listHtml = await response.text();

    // 2. Inject the fetched HTML into its container.
    listContainer.innerHTML = listHtml;

    // 3. Use event delegation to handle clicks on any chapter button inside the list.
    // This is more efficient than adding a listener to every single button.
    listContainer.addEventListener("click", async (event) => {
      // Find the button that was clicked, even if the user clicked a span inside it.
      const button = event.target.closest("button.list-item");

      // If the click wasn't on a chapter button, do nothing.
      if (!button) {
        return;
      }

      const listContainer = document.getElementById("chapter-list-container");
      const body = document.body;
      const listToggleButton = document.getElementById("list");
      if (listContainer && body) {
        listContainer.style.maxHeight = "0";
        listContainer.classList.remove("visible");
        body.classList.remove("list-is-open");
        if (listToggleButton) listToggleButton.classList.remove("active");
      }

      // --- Chapter Loading Logic ---
      const chapterToLoad = button.id; // Get the chapter number from the button's ID
      const paragraphContainer = document.getElementById("chapter-text");
      const chapterTitle = document.getElementById("chapter-title");

      if (!paragraphContainer || !chapterTitle) return;

      // Fade out current content for a smooth transition
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for fade animation

      // Use the global function to load the new chapter content
      const success = await window.loadChapter(chapterToLoad);

      if (success) {
        window.currentChapterNumber = parseInt(chapterToLoad, 10); // Update global chapter number

        // Fade in new content
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");

        // Update the visibility of next/previous buttons if the function exists
        if (typeof window.updateButtonVisibility === "function") {
          await window.updateButtonVisibility();
        }
      } else {
        console.error(`Failed to load chapter ${chapterToLoad} from list.`);
        // Revert loading state if the chapter failed to load
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
      }
    });
  } catch (error) {
    console.error("Error loading or setting up chapter list:", error);
    if (listContainer) {
      listContainer.innerHTML =
        '<p style="color: white; text-align: center;">خطأ في تحميل قائمة الفصول.</p>';
    }
  }
});

// This part handles the UI for opening and closing the chapter list container.
function setupListToggle() {
  const listToggleButton = document.getElementById("list");
  const listContainer = document.getElementById("chapter-list-container");
  const body = document.body;

  if (!listToggleButton || !listContainer) {
    // Not an error here — carousel may not have been injected yet. Return false
    // so the caller can decide to wait for `carouselLoaded`.
    return false;
  }

  listToggleButton.addEventListener("click", () => {
    const isVisible = listContainer.classList.contains("visible");

    if (isVisible) {
      // --- HIDE THE LIST ---
      if (window.vibrationManager) {
        window.vibrationManager.listClose();
      }

      listToggleButton.classList.remove("active");
      listContainer.style.maxHeight = "0";
      listContainer.classList.remove("visible");
      body.classList.remove("list-is-open");
    } else {
      // --- SHOW THE LIST ---
      if (window.vibrationManager) {
        window.vibrationManager.listOpen();
      }

      listToggleButton.classList.add("active");
      const carouselContainer = document.querySelector(".carousel-container");

      if (carouselContainer) {
        carouselContainer.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      setTimeout(() => {
        listContainer.classList.add("visible");
        const carouselHeight = carouselContainer
          ? carouselContainer.offsetHeight
          : 50;
        const calculatedMaxHeight = window.innerHeight - carouselHeight - 22;
        listContainer.style.maxHeight = `${calculatedMaxHeight}px`;
        body.classList.add("list-is-open");
      }, 150);
    }
  });

  // Recalculate height on resize when visible
  window.addEventListener("resize", () => {
    if (listContainer.classList.contains("visible")) {
      const carouselContainer = document.querySelector(".carousel-container");
      const carouselHeight = carouselContainer
        ? carouselContainer.offsetHeight
        : 50;
      const calculatedMaxHeight = window.innerHeight - carouselHeight - 22;
      listContainer.style.maxHeight = `${calculatedMaxHeight}px`;
    }
  });

  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  // Try to set up the list toggle immediately. If the carousel partials
  // haven't been injected yet (so `#list` is missing), wait for
  // `carouselLoaded` which is dispatched by `carousel-loader.js`.
  const ok = setupListToggle();
  if (!ok) {
    const onCarouselLoaded = () => {
      setupListToggle();
      document.removeEventListener("carouselLoaded", onCarouselLoaded);
    };
    document.addEventListener("carouselLoaded", onCarouselLoaded);
  }
});
