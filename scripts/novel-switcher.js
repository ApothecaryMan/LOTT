document.addEventListener("DOMContentLoaded", async () => {
  let novels = [];
  let currentNovelIndex = 0;

  async function initialize() {
    try {
      const response = await fetch("chapters.json");
      if (!response.ok) {
        throw new Error(`Failed to load novels data: ${response.status}`);
      }
      novels = await response.json();
      await loadNovel(novels[currentNovelIndex].id);
    } catch (error) {
      console.error("Error initializing novel switcher:", error);
    }
  }

  async function loadNovel(novelId) {
    if (window.resetReaderState) {
      window.resetReaderState();
    }

    try {
      const novelDataPath = novels.find(n => n.id === novelId).path;
      const response = await fetch(novelDataPath);
      if (!response.ok) {
        throw new Error(`Failed to load novel data: ${response.status}`);
      }
      const novelData = await response.json();

      window.currentNovelId = novelId;
      window.currentNovelChapters = novelData.chapters;

      // Update card
      const cardImg = document.querySelector(".card-img");
      const cardTitle = document.querySelector(".card-title");
      if (cardImg) cardImg.src = novelData.novel.image;
      if (cardTitle) cardTitle.textContent = novelData.novel.title;

      // Update story description
      const storyDescription = document.getElementById("story-description-text");
      if (storyDescription) {
        storyDescription.textContent = novelData.novel.description;
      }

      // Update chapter list
      const chapterListDiv = document.getElementById("chapter-list");
      if (chapterListDiv) {
        chapterListDiv.innerHTML = ""; // Clear existing chapters
        novelData.chapters.forEach((chapter) => {
          const chapterItem = document.createElement("a");
          chapterItem.href = "#";
          chapterItem.className = "chapter-item";
          chapterItem.dataset.chapterId = chapter.id;
          chapterItem.dataset.novelId = novelId; // Add novelId for loading chapter

          chapterItem.innerHTML = `
            <img class="chapter-item-img" src="${novelData.novel.image}" alt="Chapter Image">
            <div class="chapter-item-details">
              <div class="chapter-item-header">
                <p class="novel-title">${novelData.novel.title}</p>
              </div>
              <div class="chapter-item-body">
                <span class="chapter-number">${chapter.id}</span>
                <span class="dash">-</span>
                <span class="chapter-title-in-list">${chapter.title}</span>
              </div>
            </div>
          `;
          chapterListDiv.appendChild(chapterItem);
        });
      }

      // Determine chapter to load
      let chapterToLoad = localStorage.getItem(`lastReadChapter_${novelId}`);
      if (!chapterToLoad || !novelData.chapters.some(c => c.id === chapterToLoad)) {
        chapterToLoad = novelData.chapters[0]?.id;
      }

      if (chapterToLoad) {
        await window.loadChapter(novelId, chapterToLoad);
      }

    } catch (error) {
      console.error(`Error loading novel ${novelId}:`, error);
    }
  }

  function switchToNextNovel() {
    currentNovelIndex = (currentNovelIndex + 1) % novels.length;
    loadNovel(novels[currentNovelIndex].id);
  }

  function switchToPreviousNovel() {
    currentNovelIndex = (currentNovelIndex - 1 + novels.length) % novels.length;
    loadNovel(novels[currentNovelIndex].id);
  }

  window.novelSwitcher = {
    switchToNextNovel,
    switchToPreviousNovel,
  };

  await initialize();
});
