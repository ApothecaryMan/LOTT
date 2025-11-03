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

  function hideNovelList() {
    const novelListContainer = document.getElementById("novel-list-container");
    const mainContentWrapper = document.querySelector(".main-content-wrapper");
    if (novelListContainer) {
      novelListContainer.style.maxHeight = '0';
      novelListContainer.style.opacity = '0';
      novelListContainer.classList.remove('visible');
      setTimeout(() => {
        novelListContainer.style.display = "none";
      }, 500); // Match the transition duration
    }
    if (mainContentWrapper) {
      mainContentWrapper.style.display = "block";
    }
    document.body.classList.remove('list-is-open');
  }

  async function renderNovelList() {
    const novelListContainer = document.getElementById("novel-list-container");
    const mainContentWrapper = document.querySelector(".main-content-wrapper");

    if (!novelListContainer || !mainContentWrapper) return;

    novelListContainer.innerHTML = "<h3>قائمة الروايات</h3>"; // Clear existing list and add title
    novelListContainer.style.display = "block";
    novelListContainer.style.maxHeight = '1000px'; // Set a large enough max-height for the transition
    novelListContainer.style.opacity = '1';
    novelListContainer.classList.add('visible');
    mainContentWrapper.style.display = "none";
    document.body.classList.add('list-is-open');

    if (novels.length === 0) {
      try {
        const response = await fetch("novels.json");
        if (!response.ok) {
          throw new Error(`Failed to load novels data: ${response.status}`);
        }
        novels = await response.json();
      } catch (error) {
        console.error("Error loading novels for list:", error);
        return;
      }
    }

    novels.forEach(novel => {
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
            <span class="chapter-title-in-list">${novel.title}</span>
          </div>
        </div>
      `;
      novelItem.addEventListener("click", async () => {
        await loadNovel(novel.id);
        hideNovelList();
      });
      novelListContainer.appendChild(novelItem);
    });
  }

  const titleFontElement = document.getElementById("title-font");
  if (titleFontElement) {
    titleFontElement.style.cursor = "pointer"; // Indicate it's clickable
    titleFontElement.addEventListener("click", renderNovelList);
  }

  await initialize();
});


