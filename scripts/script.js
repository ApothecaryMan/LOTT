function expand(expandBtnId, expandContentId) {
  // انتظر حتى يتم تحميل كل عناصر الصفحة
  document.addEventListener("DOMContentLoaded", () => {
    // 1. حدد الزر والـ div الخاص بالمحتوى
    const toggleBtn = document.getElementById(expandBtnId);
    const contentWrapper = document.getElementById(expandContentId);
    const btnText = toggleBtn.querySelector(".text"); // الجزء الخاص بالنص

    // 2. احفظ الارتفاع الأولي (الذي كتبته في CSS)
    const initialMaxHeight = "40px";

    // 3. أضف "مستمع" لضغطة الزر
    toggleBtn.addEventListener("click", () => {
      // 4. افحص: هل الـ div مفتوح حالياً؟
      if (contentWrapper.classList.contains("expanded")) {
        // --- نعم، هو مفتوح (قم بإغلاقه) ---
        contentWrapper.classList.remove("expanded"); // احذف كلاس التمدد
        toggleBtn.classList.remove("active"); // احذف كلاس السهم (ليدور)
        contentWrapper.style.maxHeight = initialMaxHeight; // أعد الارتفاع للوضع الأولي
        //   btnText.textContent = "إظهار المزيد"; // غيّر النص
      } else {
        // --- لا، هو مغلق (قم بفتحه) ---
        contentWrapper.classList.add("expanded"); // أضف كلاس التمدد
        toggleBtn.classList.add("active"); // أضف كلاس السهم (ليدور)

        // النقطة الأهم:
        // اجعل الارتفاع الأقصى = الارتفاع الفعلي لكل المحتوى الداخلي
        contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";

        //   btnText.textContent = "إخفاء";
      }
    });
  });
}

expand("expand-info", "info-wrapper");

/////////////////////////////////////////////////////////////////////////////////////////////////////
//SOUND EFFECT
document.addEventListener("contentLoaded", () => {
  // 1. جلب العناصر
  const wordCountDisplay = document.getElementById("word-count");
  const paragraph = document.getElementById("chapter-text");

  // 2. التأكد من وجود العنصر الأساسي
  if (!paragraph) {
    console.error("Element with id 'chapter-text' not found.");
    return;
  }

  // --- (الجزء الجديد) تحويل التأثيرات الصوتية إلى Strong ---
  try {
    // هذا التعبير النمطي (RegEx) يبحث عن أي نص يبدأ بـ * وينتهي بـ *
    const soundEffectRegex = /\*.*?\*/g;

    // $& تعني "النص الكامل الذي تم العثور عليه"
    // سيقوم بلف أي شيء مثل *قعقعة* ليصبح <strong>*قعقعة*</strong>
    paragraph.innerHTML = paragraph.innerHTML.replace(
      soundEffectRegex,
      "<strong>$&</strong>"
    );
  } catch (error) {
    console.error("Error processing sound effects:", error);
  }
  // --- نهاية الجزء الجديد ---

  // --- كود عداد الكلمات (كما هو) ---
  if (wordCountDisplay) {
    // 3. Get the text content
    const textContent = paragraph.textContent;

    // 4. Calculate the words
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word !== "");

    // 5. Get the count
    const wordCount = words.length;

    // 6. Display the count + the word "كلمة"
    wordCountDisplay.innerText = wordCount + " كلمة";
  } else {
    if (!wordCountDisplay)
      console.error("Element with id 'word-count' not found.");
  }
});

/* ========================================================================== */
/* == AUTO-HIDE STICKY CAROUSEL ON SCROLL                                 == */
/* ========================================================================== */
/**
 * Implements auto-hide behavior for the sticky carousel based on scroll direction.
 *
 * Features:
 * - Hides carousel when scrolling down
 * - Shows carousel when scrolling up
 * - Remains visible at page top
 * - Debounced for performance optimization
 *
 * @module CarouselAutoHide
 * @requires DOM: .body (carousel container)
 */

(function initCarouselAutoHide() {
  "use strict";

  // ========================================================================
  // Configuration
  // ========================================================================
  const CONFIG = {
    carouselSelector: ".body",
    hiddenClass: "carousel-hidden",
    scrollThreshold: 0,
    debounceDelay: 10, // ms - balance between smoothness and performance
  };

  // ========================================================================
  // State Management
  // ========================================================================
  const state = {
    lastScrollY: window.scrollY,
    isHidden: false,
    ticking: false,
  };

  // ========================================================================
  // DOM References
  // ========================================================================
  const elements = {
    carousel: null,
  };

  // ========================================================================
  // Core Functions
  // ========================================================================

  /**
   * Initializes the carousel auto-hide feature
   * @returns {boolean} Success status
   */
  function init() {
    // Cache DOM element
    elements.carousel = document.querySelector(CONFIG.carouselSelector);

    // Validate carousel element exists
    if (!elements.carousel) {
      console.error(
        `[CarouselAutoHide] Initialization failed: Element "${CONFIG.carouselSelector}" not found.`
      );
      return false;
    }

    // Attach scroll listener
    attachScrollListener();

    console.info("[CarouselAutoHide] Initialized successfully.");
    return true;
  }

  /**
   * Attaches optimized scroll event listener using requestAnimationFrame
   */
  function attachScrollListener() {
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  /**
   * Handles scroll events with RAF optimization
   */
  function handleScroll() {
    if (!state.ticking) {
      window.requestAnimationFrame(updateCarouselVisibility);
      state.ticking = true;
    }
  }

  /**
   * Updates carousel visibility based on scroll direction
   */
  function updateCarouselVisibility() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - state.lastScrollY;

    // At page top - always show
    if (currentScrollY <= CONFIG.scrollThreshold) {
      showCarousel();
    }
    // Scrolling down - hide
    else if (scrollDelta > 0 && !state.isHidden) {
      hideCarousel();
    }
    // Scrolling up - show
    else if (scrollDelta < 0 && state.isHidden) {
      showCarousel();
    }

    // Update state
    state.lastScrollY = currentScrollY;
    state.ticking = false;
  }

  /**
   * Hides the carousel with proper state management
   */
  function hideCarousel() {
    if (!state.isHidden) {
      elements.carousel.classList.add(CONFIG.hiddenClass);
      state.isHidden = true;
    }
  }

  /**
   * Shows the carousel with proper state management
   */
  function showCarousel() {
    if (state.isHidden) {
      elements.carousel.classList.remove(CONFIG.hiddenClass);
      state.isHidden = false;
    }
  }

  // ========================================================================
  // Public API (optional - if you need external control)
  // ========================================================================
  window.CarouselAutoHide = {
    show: showCarousel,
    hide: hideCarousel,
    getState: () => ({ ...state }),
  };

  // ========================================================================
  // Initialization
  // ========================================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
