// --- START OF FILE content-loader.js (Corrected) ---

/**
 * يقوم بجلب محتوى فصل معين من ملف HTML خارجي وحقنه في الصفحة.
 * كما يقوم بتحديث العنوان الرئيسي.
 * @param {string | number} chapterNumber - رقم الفصل المراد تحميله (مثل "1766").
 */
async function loadChapter(chapterNumber) {
  // ... (your existing code is fine)
  const paragraphContainer = document.getElementById("chapter-text");
  const titleElement = document.getElementById("chapter-title");

  // ... (your existing code is fine)

  try {
    // ... (your existing code is fine)
    const response = await fetch(`chapters/${chapterNumber}.html`);
    // ... (your existing code is fine)
    const chapterHtml = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = chapterHtml;
    // ... (your existing code is fine)
    const newTitleElement = tempDiv.querySelector("#chapter-title-data");
    let newTitleText = `الفصل ${chapterNumber}`;
    if (newTitleElement) {
      newTitleText = newTitleElement.textContent;
      newTitleElement.remove();
    }
    titleElement.textContent = newTitleText;
    // ... (your existing code is fine)
    paragraphContainer.innerHTML = tempDiv.innerHTML;

    // =================================================================
    //  ✅ THE MISSING LINK - ADD THIS CODE!
    // =================================================================
    // Notify the comments system that a new chapter has loaded.
    // We use a "chapter-" prefix to create a unique ID.
    if (
      window.CommentsSystem &&
      typeof window.CommentsSystem.setChapter === "function"
    ) {
      const chapterId = `chapter-${chapterNumber}`;
      window.CommentsSystem.setChapter(chapterId);
      console.log(`🚀 Comments system updated for chapter: ${chapterId}`);
    }
    // =================================================================

    // ... (your existing code is fine)
    const event = new CustomEvent("contentLoaded");
    document.dispatchEvent(event);

    return true;
  } catch (error) {
    // ... (your existing code is fine)
  }
}
