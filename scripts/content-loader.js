/**
 * يقوم بجلب محتوى فصل معين من ملف HTML خارجي وحقنه في الصفحة.
 * @param {string | number} chapterNumber - رقم الفصل المراد تحميله (مثل "1766").
 */
async function loadChapter(chapterNumber) {
  const paragraph = document.getElementById("chapter-text");

  if (!paragraph) {
    console.error("Chapter text container not found!");
    return;
  }

  // وضع رسالة "جاري التحميل" مؤقتاً
  paragraph.innerHTML = "<p>...جاري تحميل الفصل...</p>";

  try {
    // 1. جلب المحتوى (أصبح الآن ديناميكياً)
    const response = await fetch(`chapters/${chapterNumber}.html`);

    // التحقق من العثور على الملف
    if (!response.ok) {
      throw new Error(
        `Failed to load chapter ${chapterNumber}: ${response.status}`
      );
    }

    // 2. الحصول على النص من الاستجابة
    const chapterHtml = await response.text();

    // 3. حقن المحتوى في الـ div الفارغ
    paragraph.innerHTML = chapterHtml;

    // 4. (هام جداً) إعلان أن المحتوى قد اكتمل تحميله
    // هذا "يوقظ" السكربتات الأخرى (مثل font.js و script.js)
    const event = new CustomEvent("contentLoaded");
    document.dispatchEvent(event);
  } catch (error) {
    console.error(error);
    paragraph.innerHTML = `<p>خطأ في تحميل الفصل ${chapterNumber}. المرجو تحديث الصفحة.</p>`;
  }
}
