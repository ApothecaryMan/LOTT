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
    this.isAnimating = false;
  }

  /**
   * تهيئة واجهة المستخدم.
   */
  init() {
    if (!this.toggleButton || !this.container) {
      console.error(
        "❌ لم يتم العثور على الزر أو الحاوية الخاصة بقائمة الروايات."
      );
      return;
    }

    this.toggleButton.addEventListener("click", () => this._toggleList());
    window.addEventListener("resize", () => this._adjustHeight());

    // 🚫 منع الاسكرول الخلفي عند فتح القائمة
    this.container.addEventListener("wheel", (e) => this._handleWheel(e), {
      passive: false,
    });
    this.container.addEventListener(
      "touchmove",
      (e) => this._handleTouchMove(e),
      {
        passive: false,
      }
    );
  }

  /**
   * منع انتشار أحداث الماوس عند التمرير داخل القائمة
   * @private
   */
  _handleWheel(e) {
    if (!this.container.classList.contains("visible")) return;

    const novelList = this.container.querySelector("#novel-list");
    if (!novelList) return;

    const isAtTop = novelList.scrollTop === 0;
    const isAtBottom =
      novelList.scrollTop >= novelList.scrollHeight - novelList.clientHeight;

    // إذا كنا في الأعلى والتمرير للأعلى، أوقف الحدث
    if (isAtTop && e.deltaY < 0) {
      e.preventDefault();
    }

    // إذا كنا في الأسفل والتمرير للأسفل، أوقف الحدث
    if (isAtBottom && e.deltaY > 0) {
      e.preventDefault();
    }
  }

  /**
   * منع انتشار أحداث اللمس عند التمرير داخل القائمة
   * @private
   */
  _handleTouchMove(e) {
    if (!this.container.classList.contains("visible")) return;

    const novelList = this.container.querySelector("#novel-list");
    if (!novelList) return;

    const isAtTop = novelList.scrollTop === 0;
    const isAtBottom =
      novelList.scrollTop >= novelList.scrollHeight - novelList.clientHeight;

    const touch = e.touches[0];
    const scrollDirection = this.lastTouchY
      ? touch.clientY - this.lastTouchY
      : 0;

    this.lastTouchY = touch.clientY;

    // منع الاسكرول الخلفي
    if (
      (isAtTop && scrollDirection > 0) ||
      (isAtBottom && scrollDirection < 0)
    ) {
      e.preventDefault();
    }
  }

  /**
   * تبديل حالة القائمة (فتح / إغلاق).
   * @private
   */
  _toggleList() {
    if (this.isAnimating) return; // منع التبديل السريع

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
    this.isAnimating = true;

    // Hide chapter list if it's open
    if (window.chapterListUI && window.chapterListUI._hideList) {
      window.chapterListUI._hideList();
    }

    if (window.vibrationManager) window.vibrationManager.listOpen();

    this.toggleButton.classList.add("active");

    // 🚫 منع الاسكرول في الموقع عند فتح القائمة
    this.body.style.overflow = "hidden";

    if (window.populateNovelListContent) {
      window.populateNovelListContent();
    }

    setTimeout(() => {
      this.container.classList.add("visible");
      this._adjustHeight();
      this.isAnimating = false;
    }, 150);
  }

  /**
   * إخفاء القائمة.
   * @private
   */
  _hideList() {
    this.isAnimating = true;

    if (window.vibrationManager) window.vibrationManager.listClose();

    this.toggleButton.classList.remove("active");
    this.container.classList.remove("visible");
    this.container.style.maxHeight = "0";

    // ✅ استعادة الاسكرول في الموقع
    this.body.style.overflow = "auto";

    setTimeout(() => {
      this.isAnimating = false;
      this.lastTouchY = null;
    }, 300);
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
