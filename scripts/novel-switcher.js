import { getReadChapters } from "./utils.js";

function createChapterListItem(chapter, novelData, novelId, readChapters) {
  const chapterItem = document.createElement("a");
  chapterItem.href = "#";
  chapterItem.className = "chapter-item";
  chapterItem.dataset.chapterId = chapter.id;
  chapterItem.dataset.novelId = novelId;

  if (readChapters.has(chapter.id)) {
    chapterItem.classList.add("read-chapter");
  }

  chapterItem.innerHTML = `
    <div class="chapter-item-details">
      <div class="chapter-item-header">
      </div>
      <div class="chapter-item-body">
        <span class="chapter-number">${chapter.id}</span>
        <span class="dash">-</span>        
        <span class="chapter-title-in-list">${chapter.title}</span>
        <span class="chapter-read-icon">
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="17px" height="17px" fill="green" viewBox="0 0 347 355"><path d="M131.6 39.5c-6.2 1.6-10 5.4-19.6 19.5-9.4 13.8-12.7 17-20.6 19.9-3.2 1.2-6.6 2.4-7.4 2.8-1.5.6-1.9.7-7.8 1.8-5.7 1-15.5 5.7-19 8.9-5.1 4.8-6.3 10.5-6 29.7.2 19.9-.6 22.5-10.8 35.5-11.8 14.9-13.8 18.6-13.9 26.4 0 6.7 2.4 11.6 10.4 21.5 7.6 9.4 11.9 16.2 13.3 21 .8 2.5 1.1 9.8 1 19.7-.4 22.1 1.3 27.1 11.1 32.7 2.8 1.6 9.5 4.1 14.7 5.4 16.9 4.5 19.8 5.9 26.7 13.4 3.5 3.7 6.3 7 6.3 7.4 0 1.2 8.9 14 11.8 17.2 1.4 1.5 4.6 3.7 7 4.8 5.6 2.7 13.8 2.2 23.2-1.6 10.1-4.1 22-7.5 26.1-7.5 2.1 0 9.1 1.8 15.6 4.1 21.7 7.5 26.2 8.2 32.7 5.5 4.8-2 9.3-6.9 17.6-19.2 9-13.4 13.2-17 24.9-21 7.4-2.5 8.8-3.3 7.8-4.4-1-1.2-.9-1.2.4-.2 2.2 1.7 7.1.6 14.9-3.4 11.3-5.6 13.9-12.5 12.6-33.3-1.1-19 .8-24.3 16.2-42.9 4.3-5.4 6.4-8.9 7.6-13 2.7-9.8.4-16-11.2-30.3-3.8-4.8-8.2-11.3-9.8-14.5-2.9-5.9-2.9-6-2.9-24.9 0-17.5-.2-19.3-2.1-23-1.2-2.2-3-4.7-4-5.6-3.7-3.2-15.4-8.1-22.4-9.3-1.4-.2-6.2-1.8-10.7-3.5-9.6-3.7-13-7-22.7-21.8-5.7-8.7-12.6-16.9-12.6-15 0 .4-.9-.2-2-1.3-3-3-13.4-3-21 0-27 10.6-30.5 10.7-55.5.9-7.6-2.9-14.5-3.8-19.9-2.4m102 88.1c13.3 10.8 15.4 12.6 15.4 13.3 0 .4-3 4.3-6.6 8.6-10.3 12.6-10.8 13.2-13.4 16.6-2.1 2.8-10.3 12.7-17 20.7-1.1 1.3-2 2.6-2 2.8s-3.2 4.1-7.1 8.7c-3.9 4.5-9.2 10.9-11.7 14.2s-4.9 6.2-5.2 6.5c-.9.9-14.5 17.4-18 22-1.9 2.5-3.7 4.4-4 5s-2.3 2.6-4.4 5.3c-4.4 5.3-4.5 5.3-11.6-1.3-5.2-4.9-41.8-38.1-45.4-41.2l-3.1-2.6 3.7-3.9c9.5-9.9 13.8-14.9 13.8-16 0-.6.9-1.5 2.1-1.8 1.5-.5 3 .1 5.3 2.3 3.6 3.4 12.4 11.5 20.4 18.9 3.1 2.9 6.2 5.3 6.7 5.3.9 0 9.5-9.3 9.5-10.3 0-.2 1.3-1.9 3-3.8 3.4-3.9 37.7-45.9 48.9-59.9 9.5-11.9 12.2-15 13.1-15 .4 0 3.8 2.5 7.6 5.6"/></svg>
        </span>
      </div>
    </div>
  `;
  return chapterItem;
}

function renderChapterList(novelData, novelId) {
  const chapterListDiv = document.getElementById("chapter-list");
  if (chapterListDiv) {
    chapterListDiv.innerHTML = ""; // Clear existing chapters
    const readChapters = getReadChapters(novelId);
    novelData.chapters.forEach((chapter) => {
      const chapterItem = createChapterListItem(
        chapter,
        novelData,
        novelId,
        readChapters
      );
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
      window.allNovels = novels; // Expose novels globally

      const lastOpenNovelId = localStorage.getItem("lastOpenNovelId");
      const novelToLoad =
        novels.find((n) => n.id === lastOpenNovelId)?.id || novels[0].id;

      await loadNovel(novelToLoad);
    } catch (error) {
      console.error("Error initializing novel switcher:", error);
    }
  }
  async function loadNovel(novelId) {
    if (window.resetReaderState) {
      window.resetReaderState();
    }

    try {
      const novelDataPath = novels.find((n) => n.id === novelId).path;
      const response = await fetch(novelDataPath);
      if (!response.ok) {
        throw new Error(`Failed to load novel data: ${response.status}`);
      }
      const novelData = await response.json();

      localStorage.setItem("lastOpenNovelId", novelId); // SAVE CURRENT NOVEL

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
      if (carouselLogoTitle)
        carouselLogoTitle.textContent = novelData.novel.title;

      // Update story description
      const storyDescription = document.getElementById(
        "story-description-text"
      );
      if (storyDescription) {
        storyDescription.textContent = novelData.novel.description;
      }

      // Update chapter list
      renderChapterList(novelData, novelId);

      // Determine chapter to load
      let chapterToLoad = localStorage.getItem(`lastReadChapter_${novelId}`);
      if (
        !chapterToLoad ||
        !novelData.chapters.some((c) => c.id === chapterToLoad)
      ) {
        chapterToLoad = novelData.chapters[0]?.id;
      }

      if (chapterToLoad) {
        await window.loadChapter(novelId, chapterToLoad);
      }

      // Show the main content and hide the loader
      const loader = document.getElementById("global-loader");
      const mainContent = document.querySelector(".main-content-wrapper");
      if (loader) loader.style.display = "none";
      if (mainContent) mainContent.style.visibility = "visible";
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
          console.warn(
            `Failed to load chapter data for ${novel.title}: ${response.status}`
          );
          return { ...novel, chapterCount: 0 }; // Return novel with 0 chapters on error
        }
        const data = await response.json();
        return {
          ...novel,
          chapterCount: data.chapters.length,
          description: data.novel.description,
        };
      } catch (error) {
        console.error(`Error fetching chapter data for ${novel.title}:`, error);
        return { ...novel, chapterCount: 0 }; // Return novel with 0 chapters on error
      }
    });

    const novelsWithChapterCounts = await Promise.all(novelDataPromises);
    console.log(
      `Populating ${novelsWithChapterCounts.length} novel items with chapter counts.`
    );

    novelsWithChapterCounts.forEach((novel) => {
      const novelItem = document.createElement("a");
      novelItem.href = "#";
      novelItem.className = "novel-item"; // Reusing chapter-item class for styling
      novelItem.dataset.novelId = novel.id;

      novelItem.innerHTML = `
  <img 
    class="novel-item-img lazy" 
    data-src="${novel.image}" 
    alt="${novel.title}" 
    src="img/pic1.webp"
  >
  <div class="novel-item-details">
    <div class="novel-item-header">
      <p class="novel-title">${novel.title}</p>
    </div>
    <div class="novel-item-body">
      <span class="novel-chapter-count">
        ${getReadChapters(novel.id).size}/${novel.chapterCount}
      </span>
    </div>
  </div>
  <div class="novel-item-description">
    <p>${novel.description}</p>
  </div>
`;

      novelItem.addEventListener("mousedown", startPress);
      novelItem.addEventListener("mouseup", endPress);
      novelItem.addEventListener("mouseleave", endPress);
      novelItem.addEventListener("touchstart", startPress);
      novelItem.addEventListener("touchend", endPress);
      novelItem.addEventListener("touchcancel", endPress);

      novelItem.addEventListener("click", async (event) => {
        // Only load novel if it's not expanded
        if (!novelItem.classList.contains("expanded")) {
          await loadNovel(novel.id);
          if (window.novelListUI && window.novelListUI._hideList) {
            window.novelListUI._hideList();
          }
        }
      });

      function startPress() {
        pressTimer = window.setTimeout(() => {
          const currentlyExpanded = document.querySelector(
            ".novel-item.expanded"
          );
          if (currentlyExpanded && currentlyExpanded !== novelItem) {
            currentlyExpanded.classList.remove("expanded");
          }
          novelItem.classList.toggle("expanded");
        }, 500); // 500ms for long press
      }

      function endPress() {
        clearTimeout(pressTimer);
      }
      novelListContainer.appendChild(novelItem);
      console.log(
        `Appended novel: ${novel.title} with ${novel.chapterCount} chapters.`
      );
    });

    const lazyImages = novelListContainer.querySelectorAll(".lazy");
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  }

  await initialize();

  window.populateNovelListContent = populateNovelListContent;
  window.loadNovel = loadNovel;
});
