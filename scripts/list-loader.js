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
document.addEventListener("DOMContentLoaded", () => {
  const listToggleButton = document.getElementById("list");
  const listContainer = document.getElementById("chapter-list-container");
  const body = document.body;

  if (!listToggleButton || !listContainer) {
    console.error(
      "List toggle button (#list) or container (#chapter-list-container) not found."
    );
    return;
  }

  listToggleButton.addEventListener("click", () => {
    const isVisible = listContainer.classList.contains("visible");

    if (isVisible) {
      // --- HIDE THE LIST ---
      listToggleButton.classList.remove("active");
      listContainer.style.maxHeight = "0"; // Triggers CSS transition to slide up
      listContainer.classList.remove("visible");
      body.classList.remove("list-is-open"); // Re-enables scrolling on the main page
    } else {
      // --- SHOW THE LIST ---
      listToggleButton.classList.add("active");
      const carouselContainer = document.querySelector(".carousel-container");

      // 1. Smoothly scroll the page so the control bar is at the top of the screen.
      // This creates a consistent position regardless of where the user is on the page.
      if (carouselContainer) {
        carouselContainer.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      // 2. IMPORTANT: Use a short timeout. This allows the scroll animation to start
      //    *before* we lock the body's scroll, preventing the animation from being cancelled.
      setTimeout(() => {
        // 3. Make the list container visible.
        listContainer.classList.add("visible");

        // 4. Calculate the maximum height for the list so it fits on the screen and becomes scrollable.
        const carouselHeight = carouselContainer
          ? carouselContainer.offsetHeight
          : 50; // Use a fallback height
        const calculatedMaxHeight = window.innerHeight - carouselHeight - 28; // 20px for bottom padding
        listContainer.style.maxHeight = `${calculatedMaxHeight}px`; // Triggers CSS transition to slide down

        // 5. Lock the main page scroll so only the list can be scrolled.
        body.classList.add("list-is-open");
      }, 150); // 150ms delay is usually sufficient for the scroll to begin.
    }
  });

  // Add a listener to recalculate the list's height if the browser window is resized.
  // This ensures the list doesn't get cut off or have too much empty space.
  window.addEventListener("resize", () => {
    if (listContainer.classList.contains("visible")) {
      const carouselContainer = document.querySelector(".carousel-container");
      const carouselHeight = carouselContainer
        ? carouselContainer.offsetHeight
        : 50;
      const calculatedMaxHeight = window.innerHeight - carouselHeight - 28;
      listContainer.style.maxHeight = `${calculatedMaxHeight}px`;
    }
  });
});
