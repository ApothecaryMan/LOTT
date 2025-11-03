/**
 * @module ListLoader
 * مسؤول عن تحميل قائمة الفصول من ملف HTML خارجي وتهيئة التفاعل معها.
 */

export class ListLoader {
  /**
   * @param {string} containerSelector - المعرف (ID أو Class) الخاص بمكان عرض القائمة.
   * @param {string} listUrl - رابط ملف الـ HTML الذي يحتوي على القائمة.
   */
  constructor(
    containerSelector = "#chapter-list-container",
    listUrl = "partials/chapter-list.html"
  ) {
    this.container = document.querySelector(containerSelector);
    this.listUrl = listUrl;
  }

  /**
   * تحميل قائمة الفصول وحقنها في الصفحة.
   */
  async init() {
    if (!this.container) {
      console.error("❌ لم يتم العثور على الحاوية الخاصة بالقائمة.");
      return;
    }

    try {
      const response = await fetch(this.listUrl);
      if (!response.ok)
        throw new Error(`فشل تحميل القائمة: ${response.status}`);

      const html = await response.text();
      this.container.innerHTML = html;

      this._bindEvents();
    } catch (error) {
      console.error("❌ خطأ أثناء تحميل أو إعداد القائمة:", error);
      this.container.innerHTML = `<p style="color:white;text-align:center;">خطأ في تحميل قائمة الفصول.</p>`;
    }
  }

  /**
   * ربط الأحداث داخل القائمة (مثل الضغط على الفصول).
   * @private
   */
  _bindEvents() {
    this.container.addEventListener("click", (event) => {
      const chapterItem = event.target.closest("a.chapter-item");
      if (!chapterItem) return;

      const { chapterId, novelId } = chapterItem.dataset;
      if (chapterId && novelId) {
        // غلق القائمة بعد الاختيار
        document.body.classList.remove("list-is-open");
        this.container.classList.remove("visible");
        this.container.style.maxHeight = "0";

        const listToggleButton = document.getElementById("title-btn");
        if (listToggleButton) listToggleButton.classList.remove("active");

        // استدعاء الدالة المسؤولة عن تحميل الفصل
        if (window.loadChapter) {
          window.loadChapter(novelId, chapterId);
        }
      }
    });
  }
}
