document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Define Global Variables ---
  // We use 'window.' to make them accessible to gear-control.js
  window.currentChapterNumber = 1766; // Current chapter number for this page
  window.hasNextChapter = true; // Assume next chapter exists initially
  window.hasPrevChapter = true; // Assume previous chapter exists initially

  // --- Get DOM Elements ---
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".previous");
  const chapterTitle = document.getElementById("chapter-title");
  const paragraphContainer = document.getElementById("chapter-text");
  const preNexContainer = document.querySelector(".pre-nex");

  // --- Chapter Navigation and Loading Functions ---

  /**
   * Checks if a chapter file exists using a fast HEAD request.
   * @param {string | number} chapterNumber
   * @returns {Promise<boolean>} - True if chapter exists, false otherwise.
   */
  async function checkChapterExists(chapterNumber) {
    try {
      // Chapter 0 or negative doesn't exist
      if (chapterNumber < 1) return false;
      const response = await fetch(`chapters/${chapterNumber}.html`, {
        method: "HEAD",
      });
      return response.ok;
    } catch (error) {
      console.error("Check error:", error);
      return false;
    }
  }

  /**
   * Updates the global flags and hides/shows the Next/Previous buttons.
   * Made global using 'window.'
   */
  window.updateButtonVisibility = async () => {
    // Check existence of adjacent chapters
    window.hasNextChapter = await checkChapterExists(
      window.currentChapterNumber + 1
    );
    window.hasPrevChapter = await checkChapterExists(
      window.currentChapterNumber - 1
    );

    // Toggle CSS classes to show/hide buttons and adjust shape
    if (preNexContainer) {
      preNexContainer.classList.toggle("next-hidden", !window.hasNextChapter);
      preNexContainer.classList.toggle("prev-hidden", !window.hasPrevChapter);
    }

    // Call the gear update function if it exists
    if (typeof window.updateGearDisplay === "function") {
      window.updateGearDisplay(window.currentChapterNumber);
    }
  };

  /**
   * Loads the initial chapter and sets up button visibility.
   */
  async function initializeReader() {
    // Use the global loadChapter from content-loader.js
    if (typeof window.loadChapter === "function") {
      await window.loadChapter(window.currentChapterNumber);
      await window.updateButtonVisibility(); // Check and update buttons
    } else {
      console.error("loadChapter function is not defined globally.");
    }
  }

  // --- Next/Previous Button Event Listeners ---
  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      if (!window.hasNextChapter) return;

      // Fade out, scroll up
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Load next chapter (use global function)
      await window.loadChapter(window.currentChapterNumber + 1);
      window.currentChapterNumber++;

      // Fade in
      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");

      // Update buttons
      await window.updateButtonVisibility();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", async () => {
      if (!window.hasPrevChapter) return;

      // Fade out, scroll up
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Load previous chapter (use global function)
      await window.loadChapter(window.currentChapterNumber - 1);
      window.currentChapterNumber--;

      // Fade in
      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");

      // Update buttons
      await window.updateButtonVisibility();
    });
  }

  // --- Start the Reader ---
  initializeReader();
}); // End DOMContentLoaded for chapter-navigation.js
