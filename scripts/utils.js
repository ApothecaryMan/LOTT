/**
 * Utility functions for managing read chapters in localStorage.
 */

const READ_CHAPTERS_KEY_PREFIX = "readChapters_";

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
 * Marks a specific chapter as read for a given novel and saves it to localStorage.
 * @param {string} novelId - The ID of the novel.
 * @param {string} chapterId - The ID of the chapter to mark as read.
 */
export function markChapterAsRead(novelId, chapterId) {
  const readChapters = getReadChapters(novelId);
  if (!readChapters.has(chapterId)) {
    readChapters.add(chapterId);
    const key = `${READ_CHAPTERS_KEY_PREFIX}${novelId}`;
    localStorage.setItem(key, JSON.stringify(Array.from(readChapters)));
    console.log(`Chapter ${chapterId} of novel ${novelId} marked as read.`);
  }
}
