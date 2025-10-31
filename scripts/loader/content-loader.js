/**
 * Fetches the HTML content of a specific chapter.
 * @param {string | number} chapterNumber - The chapter to fetch.
 * @returns {Promise<string>} - The HTML content of the chapter.
 */
async function fetchChapterHtml(chapterNumber) {
  const response = await fetch(`chapters/${chapterNumber}.html`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chapter ${chapterNumber}: ${response.status}`);
  }
  return await response.text();
}

/**
 * Parses the chapter HTML to extract the title and content.
 * @param {string} chapterHtml - The HTML content of the chapter.
 * @param {string | number} chapterNumber - The chapter number.
 * @returns {{title: string, content: string}} - The chapter title and content.
 */
function parseChapter(chapterHtml, chapterNumber) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = chapterHtml;

  const newTitleElement = tempDiv.querySelector("#chapter-title-data");
  let title = `الفصل ${chapterNumber}`;
  if (newTitleElement) {
    title = newTitleElement.textContent;
    newTitleElement.remove();
  }
  return { title, content: tempDiv.innerHTML };
}

/**
 * Updates the DOM with the new chapter title and content.
 * @param {string} title - The new chapter title.
 * @param {string} content - The new chapter content.
 */
function updateChapterInDom(title, content) {
  const titleElement = document.getElementById("chapter-title");
  const paragraphContainer = document.getElementById("chapter-text");
  if (titleElement) titleElement.textContent = title;
  if (paragraphContainer) paragraphContainer.innerHTML = content;
}

/**
 * Shows or hides the story description based on the chapter number.
 * @param {string | number} chapterNumber - The current chapter number.
 */
async function handleStoryDescriptionVisibility(chapterNumber) {
  const storyContainer = document.getElementById("story-description-container");
  if (!storyContainer) return;

  try {
    const chaptersResponse = await fetch("chapters.json");
    const chapters = await chaptersResponse.json();
    const firstChapter = Math.min(...chapters.map(c => parseInt(c.id, 10)));

    if (parseInt(chapterNumber, 10) === firstChapter) {
      storyContainer.style.display = "block";
    } else {
      storyContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error handling story description visibility:", error);
  }
}

/**
 * Updates the comments system with the current chapter ID.
 * @param {string | number} chapterNumber - The current chapter number.
 */
function updateCommentsSystem(chapterNumber) {
  if (window.CommentsSystem && typeof window.CommentsSystem.setChapter === "function") {
    const chapterId = `chapter-${chapterNumber}`;
    window.CommentsSystem.setChapter(chapterId);
    console.log(`🚀 Comments system updated for chapter: ${chapterId}`);
  }
}

/**
 * Loads a chapter, updates the DOM, and handles related side effects.
 * @param {string | number} chapterNumber - The chapter to load.
 * @returns {Promise<boolean>} - True if the chapter was loaded successfully, false otherwise.
 */
async function loadChapter(chapterNumber) {
  try {
    const chapterHtml = await fetchChapterHtml(chapterNumber);
    const { title, content } = parseChapter(chapterHtml, chapterNumber);
    updateChapterInDom(title, content);

    await handleStoryDescriptionVisibility(chapterNumber);
    updateCommentsSystem(chapterNumber);

    document.dispatchEvent(new CustomEvent("contentLoaded"));
    return true;
  } catch (error) {
    console.error(`Error loading chapter ${chapterNumber}:`, error);
    return false;
  }
}

/**
 * Fetches the list of chapters and loads the first one by default.
 */
async function loadInitialChapter() {
  try {
    const res = await fetch('chapters.json');
    const chapters = await res.json();

    const firstChapter = chapters.reduce((first, chapter) => {
      const chapterId = parseInt(chapter.id, 10);
      return chapterId < (first ? parseInt(first.id, 10) : Infinity) ? chapter : first;
    }, null);

    if (firstChapter) {
      await loadChapter(firstChapter.id);
      window.currentChapterNumber = parseInt(firstChapter.id, 10);
      if (typeof window.updateButtonVisibility === "function") {
        window.updateButtonVisibility();
      }
    }
  } catch (error) {
    console.error("Failed to load initial chapter data:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadInitialChapter);
