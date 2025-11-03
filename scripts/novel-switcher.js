function createChapterListItem(chapter, novelData, novelId) {
  const chapterItem = document.createElement("a");
  chapterItem.href = "#";
  chapterItem.className = "chapter-item";
  chapterItem.dataset.chapterId = chapter.id;
  chapterItem.dataset.novelId = novelId;

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
  return chapterItem;
}

function renderChapterList(novelData, novelId) {
  const chapterListDiv = document.getElementById("chapter-list");
  if (chapterListDiv) {
    chapterListDiv.innerHTML = ""; // Clear existing chapters
    novelData.chapters.forEach((chapter) => {
      const chapterItem = createChapterListItem(chapter, novelData, novelId);
      chapterListDiv.appendChild(chapterItem);
    });
  }
}

  document.addEventListener("DOMContentLoaded", async () => {
    let novels = [];
    let currentNovelIndex = 0;

    async function initialize() {
      try {
        const response = await fetch("novels.json");
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

      // Update logo titles
      const logoTitle = document.querySelector(".header .title");
      const carouselLogoTitle = document.getElementById("logo");
      if (logoTitle) logoTitle.textContent = novelData.novel.title;
      if (carouselLogoTitle) carouselLogoTitle.textContent = novelData.novel.title;

      // Update story description
      const storyDescription = document.getElementById("story-description-text");
      if (storyDescription) {
        storyDescription.textContent = novelData.novel.description;
      }

      // Update chapter list
      renderChapterList(novelData, novelId);

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

  async function populateNovelListContent() {
    console.log("populateNovelListContent called.");
    const novelListContainer = document.getElementById("novel-list");
    if (!novelListContainer) {
      console.error("❌ novelListContainer (#novel-list) not found.");
      return;
    }
    console.log("✅ novelListContainer (#novel-list) found.");

    if (novels.length === 0) {
      console.log("novels array is empty, attempting to fetch novels.json...");
      try {
        const response = await fetch("novels.json");
        if (!response.ok) {
          throw new Error(`Failed to load novels data: ${response.status}`);
        }
        novels = await response.json();
        console.log("✅ novels.json fetched successfully. Novels:", novels);
      } catch (error) {
        console.error("❌ Error loading novels for list:", error);
        return;
      }
    } else {
      console.log("novels array already populated. Novels:", novels);
    }

    novelListContainer.innerHTML = ""; // Clear existing list
    if (novels.length === 0) {
      console.log("No novels to display after fetch.");
      return;
    }

    console.log(`Fetching chapter counts for ${novels.length} novels.`);
    const novelDataPromises = novels.map(async (novel) => {
      try {
        const response = await fetch(novel.path);
        if (!response.ok) {
          console.warn(`Failed to load chapter data for ${novel.title}: ${response.status}`);
          return { ...novel, chapterCount: 0 }; // Return novel with 0 chapters on error
        }
        const data = await response.json();
        return { ...novel, chapterCount: data.chapters.length };
      } catch (error) {
        console.error(`Error fetching chapter data for ${novel.title}:`, error);
        return { ...novel, chapterCount: 0 }; // Return novel with 0 chapters on error
      }
    });

    const novelsWithChapterCounts = await Promise.all(novelDataPromises);
    console.log(`Populating ${novelsWithChapterCounts.length} novel items with chapter counts.`);

    novelsWithChapterCounts.forEach(novel => {
      const novelItem = document.createElement("a");
      novelItem.href = "#";
      novelItem.className = "chapter-item"; // Reusing chapter-item class for styling
      novelItem.dataset.novelId = novel.id;

      novelItem.innerHTML = `
        <img class="chapter-item-img" src="${novel.image}" alt="${novel.title}">
        <div class="chapter-item-details">
          <div class="chapter-item-header">
            <p class="novel-title">${novel.title}</p>
          </div>
          <div class="chapter-item-body">
            <span class="novel-chapter-count">${novel.chapterCount} فصول</span>
          </div>
        </div>
      `;
      novelItem.addEventListener("click", async () => {
        await loadNovel(novel.id);
        // The NovelListUI will handle hiding the list
        if (window.novelListUI && window.novelListUI._hideList) {
          window.novelListUI._hideList();
        }
      });
      novelListContainer.appendChild(novelItem);
      console.log(`Appended novel: ${novel.title} with ${novel.chapterCount} chapters.`);
    });
  }

  await initialize();

  window.populateNovelListContent = populateNovelListContent;
  window.loadNovel = loadNovel;
});
