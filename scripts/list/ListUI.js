/**
 * @module ListUI
 * مسؤول عن واجهة المستخدم لفتح وإغلاق قائمة الفصول والتحكم في حجمها.
 */

export class ListUI {
  /**
   * @param {string} toggleSelector - الزر الذي يتحكم في عرض القائمة.
   * @param {string} containerSelector - حاوية القائمة نفسها.
   */
  constructor(
    toggleSelector = "#title-btn",
    containerSelector = "#chapter-list-container"
  ) {
    this.toggleButton = document.querySelector(toggleSelector);
    this.container = document.querySelector(containerSelector);
    this.body = document.body;
    this.isAnimating = false;
    this.lastTouchY = null;
  }

  /**
   * تهيئة واجهة المستخدم.
   */
  init() {
    if (!this.toggleButton || !this.container) {
      console.error("❌ لم يتم العثور على الزر أو الحاوية الخاصة بالقائمة.");
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

    const chapterList = this.container.querySelector("#chapter-list");
    if (!chapterList) return;

    const isAtTop = chapterList.scrollTop === 0;
    const isAtBottom =
      chapterList.scrollTop >=
      chapterList.scrollHeight - chapterList.clientHeight;

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

    const chapterList = this.container.querySelector("#chapter-list");
    if (!chapterList) return;

    const isAtTop = chapterList.scrollTop === 0;
    const isAtBottom =
      chapterList.scrollTop >=
      chapterList.scrollHeight - chapterList.clientHeight;

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

    // Hide novel list if it's open
    if (window.novelListUI && window.novelListUI._hideList) {
      window.novelListUI._hideList();
    }

    // 🚫 تعطيل الكاروسيل الذكية عند فتح القائمة
    if (window.smartCarouselScroll) {
      window.smartCarouselScroll.disabled = true;
    }

    if (window.vibrationManager) window.vibrationManager.listOpen();

    this.toggleButton.classList.add("active");

    // 🚫 منع الاسكرول في الموقع عند فتح القائمة
    this.body.style.overflow = "hidden";

    const carouselContainer = document.querySelector(".carousel-container");
    if (carouselContainer) {
      carouselContainer.scrollIntoView({ behavior: "smooth", block: "start" });
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
    this.body.style.overflow = "";

    // ✅ تفعيل الكاروسيل الذكية عند إغلاق القائمة
    if (window.smartCarouselScroll) {
      window.smartCarouselScroll.disabled = false;
      window.smartCarouselScroll.showCarousel();
    }

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
