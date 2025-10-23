/**
 * يقوم بجلب محتوى فصل معين من ملف HTML خارجي وحقنه في الصفحة.
 * كما يقوم بتحديث العنوان الرئيسي.
 * @param {string | number} chapterNumber - رقم الفصل المراد تحميله (مثل "1766").
 */
async function loadChapter(chapterNumber) {
  // 1. جلب العناصر الأساسية من الصفحة
  const paragraphContainer = document.getElementById("chapter-text");
  const titleElement = document.getElementById("chapter-title");

  if (!paragraphContainer || !titleElement) {
    console.error("Chapter containers not found!");
    return;
  }

  try {
    // 2. جلب المحتوى (أصبح الآن ديناميكياً)
    const response = await fetch(`chapters/${chapterNumber}.html`);

    if (!response.ok) {
      throw new Error(
        `Failed to load chapter ${chapterNumber}: ${response.status}`
      );
    }

    // 3. الحصول على النص كـ HTML
    const chapterHtml = await response.text();

    // 4. --- (الجزء الذكي) ---
    // إنشاء حاوية وهمية (غير مرئية) في الذاكرة
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = chapterHtml;

    // 5. البحث عن العنوان الجديد داخل الحاوية الوهمية
    const newTitleElement = tempDiv.querySelector("#chapter-title-data");
    let newTitleText = `الفصل ${chapterNumber}`; // عنوان افتراضي

    if (newTitleElement) {
      newTitleText = newTitleElement.textContent; // استخراج نص العنوان
      newTitleElement.remove(); // (هام) حذف العنوان من المحتوى
    }

    // 6. حقن العناصر في الصفحة
    titleElement.textContent = newTitleText; // حقن العنوان الجديد

    let chapterNameOnly = newTitleText;
    if (newTitleText.includes(" – ")) {
      chapterNameOnly = newTitleText.split(" – ")[1];
    }
    document.getElementById("title-btn").textContent = chapterNameOnly;

    paragraphContainer.innerHTML = tempDiv.innerHTML; // حقن باقي المحتوى

    // 7. إعلان أن المحتوى قد اكتمل تحميله
    // هذا "يوقظ" السكربتات الأخرى (مثل font.js و script.js)
    const event = new CustomEvent("contentLoaded");
    document.dispatchEvent(event);

    return true;
  } catch (error) {
    console.error(error);
    paragraphContainer.innerHTML = `<p>خطأ في تحميل الفصل ${chapterNumber}. المرجو تحديث الصفحة.</p>`;
    titleElement.textContent = "خطأ";
    return false;
  }
}
