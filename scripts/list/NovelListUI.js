/**
 * @module NovelListUI
 * مسؤول عن واجهة المستخدم لفتح وإغلاق قائمة الروايات والتحكم في حجمها.
 */

export class NovelListUI {
  /**
   * @param {string} toggleSelector - الزر الذي يتحكم في عرض القائمة.
   * @param {string} containerSelector - حاوية القائمة نفسها.
   */
  constructor(
    toggleSelector = "#logo",
    containerSelector = "#novel-list-container"
  ) {
    this.toggleButton = document.querySelector(toggleSelector);
    this.container = document.querySelector(containerSelector);
    this.body = document.body;
  }

  /**
   * تهيئة واجهة المستخدم.
   */
  init() {
    if (!this.toggleButton || !this.container) {
      console.error("❌ لم يتم العثور على الزر أو الحاوية الخاصة بقائمة الروايات.");
      return;
    }

    this.toggleButton.addEventListener("click", () => this._toggleList());
    window.addEventListener("resize", () => this._adjustHeight());
  }

  /**
   * تبديل حالة القائمة (فتح / إغلاق).
   * @private
   */
  _toggleList() {
    const isVisible = this.container.classList.contains("visible");

    if (isVisible) {
      this._hideList();
    } else {
      this._showList();
    }
  }

  /**
   * عرض القائمة.
   * @private
   */
  _showList() {
    if (window.vibrationManager) window.vibrationManager.listOpen();

    this.toggleButton.classList.add("active");

    const carouselContainer = document.querySelector(".carousel-container");
    if (carouselContainer) {
      carouselContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      this.container.classList.add("visible");
      this._adjustHeight();
      this.body.classList.add("list-is-open");
    }, 150);
  }

  /**
   * إخفاء القائمة.
   * @private
   */
  _hideList() {
    if (window.vibrationManager) window.vibrationManager.listClose();

    this.toggleButton.classList.remove("active");
    this.container.classList.remove("visible");
    this.container.style.maxHeight = "0";
    this.body.classList.remove("list-is-open");
  }

  /**
   * ضبط ارتفاع القائمة عند تغيير حجم النافذة.
   * @private
   */
  _adjustHeight() {
    if (this.container.classList.contains("visible")) {
      const carouselContainer = document.querySelector(".carousel-container");
      const carouselHeight = carouselContainer
        ? carouselContainer.offsetHeight
        : 50;
      const maxHeight = window.innerHeight - carouselHeight - 22;
      this.container.style.maxHeight = `${maxHeight}px`;
    }
  }
}
