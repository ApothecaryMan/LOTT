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
    const response = await fetch("partials/chapter-list.html");
    if (!response.ok) {
      throw new Error(`Failed to load chapter list: ${response.status}`);
    }
    const listHtml = await response.text();

    // 2. Inject the fetched HTML into its container.
    listContainer.innerHTML = listHtml;

    // 3. Use event delegation to handle clicks on any chapter button inside the list.
    listContainer.addEventListener("click", async (event) => {
      // Find the chapter item that was clicked
      const chapterItem = event.target.closest("a.chapter-item");

      // If the click wasn't on a chapter item, do nothing.
      if (!chapterItem) {
        return;
      }

      const listContainer = document.getElementById("chapter-list-container");
      const body = document.body;
      const listToggleButton = document.getElementById("title-btn");
      if (listContainer && body) {
        listContainer.style.maxHeight = "0";
        listContainer.classList.remove("visible");
        body.classList.remove("list-is-open");
        if (listToggleButton) listToggleButton.classList.remove("active");
      }

      const chapterToLoad = chapterItem.dataset.chapterId;
      const novelId = chapterItem.dataset.novelId;
      if (chapterToLoad && novelId) {
        // Call the loadChapter function with novelId and chapterId
        window.loadChapter(novelId, chapterToLoad);
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
  const listToggleButton = document.getElementById("title-btn");
  const listContainer = document.getElementById("chapter-list-container");
  const body = document.body;

  if (!listToggleButton || !listContainer) {
    console.error(
      "List toggle button (#title-btn) or container (#chapter-list-container) not found."
    );
    return;
  }

  listToggleButton.addEventListener("click", () => {
    const isVisible = listContainer.classList.contains("visible");

    if (isVisible) {
      // --- HIDE THE LIST ---
      // VIBRATION: Trigger the "close" haptic
      if (window.vibrationManager) {
        window.vibrationManager.listClose();
      }

      listToggleButton.classList.remove("active");
      listContainer.style.maxHeight = "0";
      listContainer.classList.remove("visible");
      body.classList.remove("list-is-open");
    } else {
      // --- SHOW THE LIST ---
      // VIBRATION: Trigger the "open" haptic
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

  // Add a listener to recalculate the list's height if the browser window is resized.
  // This ensures the list doesn't get cut off or have too much empty space.
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
});
