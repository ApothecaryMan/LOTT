// --- START: Improved carousel.js ---

/**
 * This function can initialize any carousel on the page
 * @param {string} carouselId - ID of the carousel container
 * @param {string} prevBtnId - ID of the previous button
 * @param {string} nextBtnId - ID of the next button
 */
function initializeCarousel(carouselId, prevBtnId, nextBtnId) {
  const carousel = document.getElementById(carouselId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!carousel || !prevBtn || !nextBtn) {
    // It's okay if a carousel doesn't exist, just log a note and exit.
    // console.error(`Carousel elements NOT FOUND for: ${carouselId}`);
    return;
  }

  // Use the card's width for scrolling the card carousel, otherwise a fixed amount
  const scrollAmount =
    carouselId === "card-carousel"
      ? carousel.querySelector(".card").offsetWidth + 15 // Card width + gap
      : 300;

  let isAtStart = true;
  let isAtEnd = false;
  let isScrolling = false;

  /**
   * Checks button visibility based on scroll position.
   * Corrected for both LTR and RTL directions.
   */
  function checkButtonVisibility() {
    // Round values to avoid floating point inaccuracies
    const currentScroll = Math.round(carousel.scrollLeft);
    const maxScroll = Math.round(carousel.scrollWidth - carousel.clientWidth);
    const buffer = 10; // 10px buffer for precision

    // Check for RTL environment
    const isRTL = getComputedStyle(carousel).direction === "rtl";

    if (isRTL) {
      // In RTL, scrollLeft is negative. 0 is the end.
      isAtStart = currentScroll <= -maxScroll + buffer;
      isAtEnd = currentScroll >= -buffer;
    } else {
      // In LTR, scrollLeft is positive. 0 is the start.
      isAtStart = currentScroll <= buffer;
      isAtEnd = currentScroll >= maxScroll - buffer;
    }

    // In RTL, "next" is left and "prev" is right.
    // In this UI, nextBtn is always right arrow, prevBtn is always left arrow.
    // So we adjust based on direction.
    if (isRTL) {
      prevBtn.classList.toggle("hidden", isAtEnd);
      nextBtn.classList.toggle("hidden", isAtStart);
    } else {
      prevBtn.classList.toggle("hidden", isAtStart);
      nextBtn.classList.toggle("hidden", isAtEnd);
    }
  }

  /**
   * Trigger bounce animation and haptic feedback
   * @param {HTMLElement} button - The button that triggered the bounce
   */
  function triggerBounce(button) {
    // VIBRATION: Trigger the bounce haptic from the manager
    if (window.vibrationManager) {
      window.vibrationManager.bounce();
    }

    // If the animation is already running, don't do anything
    if (carousel.classList.contains("shake")) {
      return;
    }

    carousel.classList.add("shake");

    carousel.addEventListener(
      "animationend",
      () => {
        carousel.classList.remove("shake");
      },
      { once: true }
    );
  }

  /**
   * Smooth scroll with debouncing to prevent rapid clicks
   * @param {number} direction - Direction to scroll (positive = right, negative = left)
   */
  function smoothScroll(direction) {
    if (isScrolling) return; // منع التمرير السريع المتكرر

    isScrolling = true;

    const isRTL = getComputedStyle(carousel).direction === "rtl";
    const scrollLeft = isRTL ? -direction : direction;

    carousel.scrollBy({
      left: scrollLeft,
      behavior: "smooth",
    });

    // إزالة العلم بعد انتهاء التمرير
    setTimeout(() => {
      isScrolling = false;
    }, 600);
  }

  // Next Button Click
  nextBtn.addEventListener("click", () => {
    const isRTL = getComputedStyle(carousel).direction === "rtl";
    if (isRTL ? isAtStart : isAtEnd) {
      triggerBounce(nextBtn);
    } else {
      smoothScroll(scrollAmount);
    }
  });

  // Previous Button Click
  prevBtn.addEventListener("click", () => {
    const isRTL = getComputedStyle(carousel).direction === "rtl";
    if (isRTL ? isAtEnd : isAtStart) {
      triggerBounce(prevBtn);
    } else {
      smoothScroll(-scrollAmount);
    }
  });

  // Listen for scroll events (e.g., manual scrolling)
  carousel.addEventListener("scroll", checkButtonVisibility);

  // Also check when the window is resized
  window.addEventListener("resize", checkButtonVisibility);

  // Initial check on page load
  checkButtonVisibility();
}

// Wait for the page to be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the top control bar carousel
  initializeCarousel("carousel", "prev-btn", "next-btn");

  // Initialize the new card carousel
  initializeCarousel("card-carousel", "card-prev-btn", "card-next-btn");
});

//>>>>>>>>>>>>>>>>>>>>>>>>> END CAROUSEL >>>>>>>>>>>>>>>>>>>>>
