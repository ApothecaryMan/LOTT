/**
 * Utility functions for managing read chapters in localStorage.
 */

const READ_CHAPTERS_KEY_PREFIX = "readChapters_";
const READ_TIME_THRESHOLD_MS = 60 * 1000; // 1 minute

// Stores active timers for chapters
const chapterTimers = {};
let currentActiveChapterKey = null; // Format: novelId_chapterId

/**
 * Retrieves the set of read chapter IDs for a given novel from localStorage.
 * @param {string} novelId - The ID of the novel.
 * @returns {Set<string>} A Set containing the IDs of read chapters.
 */
export function getReadChapters(novelId) {
  const key = `${READ_CHAPTERS_KEY_PREFIX}${novelId}`;
  const storedData = localStorage.getItem(key);
  try {
    const chapterIds = storedData ? JSON.parse(storedData) : [];
    return new Set(chapterIds);
  } catch (e) {
    console.error("Error parsing read chapters from localStorage:", e);
    return new Set();
  }
}

/**
 * Internal function to actually mark a chapter as read and save to localStorage.
 * @param {string} novelId - The ID of the novel.
 * @param {string} chapterId - The ID of the chapter to mark as read.
 */
function _markChapterAsRead(novelId, chapterId) {
  const readChapters = getReadChapters(novelId);
  if (!readChapters.has(chapterId)) {
    readChapters.add(chapterId);
    const key = `${READ_CHAPTERS_KEY_PREFIX}${novelId}`;
    localStorage.setItem(key, JSON.stringify(Array.from(readChapters)));
    console.log(`Chapter ${chapterId} of novel ${novelId} marked as read.`);
  }
}

/**
 * Starts a timer to mark a chapter as read after a certain threshold.
 * If a new chapter becomes active, the previous timer is cleared.
 * @param {string} novelId - The ID of the novel.
 * @param {string} chapterId - The ID of the chapter to potentially mark as read.
 */
export function startChapterReadTimer(novelId, chapterId) {
  const chapterKey = `${novelId}_${chapterId}`;

  // If the chapter is already marked as read, no need to start a timer
  if (getReadChapters(novelId).has(chapterId)) {
    // console.log(`Chapter ${chapterKey} is already read.`);
    return;
  }

  // If we are already tracking this chapter, do nothing
  if (currentActiveChapterKey === chapterKey && chapterTimers[chapterKey]) {
    return;
  }

  // Clear any existing timer for the previously active chapter
  if (currentActiveChapterKey && chapterTimers[currentActiveChapterKey]) {
    clearTimeout(chapterTimers[currentActiveChapterKey]);
    delete chapterTimers[currentActiveChapterKey];
    // console.log(`Cleared timer for ${currentActiveChapterKey}`);
  }

  // Set the new active chapter
  currentActiveChapterKey = chapterKey;

  // Start a new timer for the current chapter
  chapterTimers[chapterKey] = setTimeout(() => {
    _markChapterAsRead(novelId, chapterId);
    delete chapterTimers[chapterKey]; // Clean up the timer reference
    if (currentActiveChapterKey === chapterKey) {
      currentActiveChapterKey = null; // No longer actively tracking this chapter's timer
    }
  }, READ_TIME_THRESHOLD_MS);

  console.log(`Started read timer for chapter ${chapterKey}.`);
}
