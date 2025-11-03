/**
 * @module NovelListLoader
 * مسؤول عن تحميل قائمة الروايات من ملف HTML خارجي وتهيئة التفاعل معها.
 */

export class NovelListLoader {
  /**
   * @param {string} containerSelector - المعرف (ID أو Class) الخاص بمكان عرض القائمة.
   * @param {string} listUrl - رابط ملف الـ HTML الذي يحتوي على القائمة.
   */
  constructor(
    containerSelector = "#novel-list-container",
    listUrl = "partials/novel-list.html"
  ) {
    this.container = document.querySelector(containerSelector);
    this.listUrl = listUrl;
  }

  /**
   * تحميل قائمة الروايات وحقنها في الصفحة.
   */
  async init() {
    if (!this.container) {
      console.error("❌ لم يتم العثور على الحاوية الخاصة بقائمة الروايات.");
      return;
    }

    try {
      const response = await fetch(this.listUrl);
      if (!response.ok)
        throw new Error(`فشل تحميل قائمة الروايات: ${response.status}`);

      const html = await response.text();
      this.container.innerHTML = html;

      this._bindEvents();
    } catch (error) {
      console.error("❌ خطأ أثناء تحميل أو إعداد قائمة الروايات:", error);
      this.container.innerHTML = `<p style="color:white;text-align:center;">خطأ في تحميل قائمة الروايات.</p>`;
    }
  }

  /**
   * ربط الأحداث داخل القائمة (مثل الضغط على الروايات).
   * @private
   */
  _bindEvents() {
    this.container.addEventListener("click", (event) => {
      const novelItem = event.target.closest("a.novel-item");
      if (!novelItem) return;

      const { novelId } = novelItem.dataset;
      if (novelId) {
        // Close the list after selection (if applicable, similar to chapter list)
        // document.body.classList.remove("list-is-open");
        // this.container.classList.remove("visible");
        // this.container.style.maxHeight = "0";

        // const listToggleButton = document.getElementById("title-btn"); // Assuming a common toggle button
        // if (listToggleButton) listToggleButton.classList.remove("active");

        // Call the function responsible for loading the novel
        if (window.loadNovel) {
          window.loadNovel(novelId);
        }
      }
    });
  }
}
