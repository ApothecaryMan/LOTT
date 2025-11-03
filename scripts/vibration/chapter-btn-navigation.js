// --- START OF FILE: scripts/chapter-navigation.js (Updated) ---

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Define Global Variables ---
  window.currentChapterNumber = 1766;
  window.hasNextChapter = true;
  window.hasPrevChapter = true;

  // --- Helper function to get novel title and chapter number from URL ---
  function getNovelAndChapterInfo() {
    const pathParts = window.location.pathname.split('/');
    const chaptersIndex = pathParts.indexOf('chapters');
    if (chaptersIndex > -1 && chaptersIndex + 2 < pathParts.length) {
      const novelTitle = pathParts[chaptersIndex + 1];
      const chapterFileName = pathParts[chaptersIndex + 2];
      const chapterNumber = parseInt(chapterFileName.replace('.html', ''), 10);
      return { novelTitle, chapterNumber };
    }
    return { novelTitle: null, chapterNumber: null };
  }

  // --- Function to mark chapter as read ---
  function markChapterAsRead(novelTitle, chapterNumber) {
    if (novelTitle && chapterNumber) {
      const key = `read_chapter_${novelTitle}_${chapterNumber}`;
      localStorage.setItem(key, Date.now().toString());
      console.log(`Chapter ${chapterNumber} of ${novelTitle} marked as read.`);
    }
  }

  // --- Mark chapter as read after 1 minute ---
  const { novelTitle, chapterNumber } = getNovelAndChapterInfo();
  if (novelTitle && chapterNumber) {
    setTimeout(() => {
      markChapterAsRead(novelTitle, chapterNumber);
    }, 60 * 1000); // 1 minute in milliseconds
  }

  // --- Get DOM Elements ---
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".previous");
  const chapterTitle = document.getElementById("chapter-title");
  const paragraphContainer = document.getElementById("chapter-text");
  const preNexContainer = document.querySelector(".pre-nex");

  // --- Chapter Navigation and Loading Functions ---

  async function checkChapterExists(chapterNumber) {
    try {
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

  window.updateButtonVisibility = async () => {
    window.hasNextChapter = await checkChapterExists(
      window.currentChapterNumber + 1
    );
    window.hasPrevChapter = await checkChapterExists(
      window.currentChapterNumber - 1
    );

    if (preNexContainer) {
      preNexContainer.classList.toggle("next-hidden", !window.hasNextChapter);
      preNexContainer.classList.toggle("prev-hidden", !window.hasPrevChapter);
    }

    if (typeof window.updateGearDisplay === "function") {
      window.updateGearDisplay(window.currentChapterNumber);
    }
  };

  async function initializeReader() {
    if (typeof window.loadChapter === "function") {
      await window.loadChapter(window.currentChapterNumber);
      await window.updateButtonVisibility();
    } else {
      console.error("loadChapter function is not defined globally.");
    }
  }

  // --- Next/Previous Button Event Listeners ---
  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      if (!window.hasNextChapter) return;

      // VIBRATION: Trigger strong navigation haptic
      if (window.vibrationManager) {
        window.vibrationManager.navigate();
      }

      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));

      await window.loadChapter(window.currentChapterNumber + 1);
      window.currentChapterNumber++;

      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");

      await window.updateButtonVisibility();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", async () => {
      if (!window.hasPrevChapter) return;

      // VIBRATION: Trigger strong navigation haptic
      if (window.vibrationManager) {
        window.vibrationManager.navigate();
      }

      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));

      await window.loadChapter(window.currentChapterNumber - 1);
      window.currentChapterNumber--;

      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");

      await window.updateButtonVisibility();
    });
  }

  // --- Start the Reader ---
  initializeReader();
});
