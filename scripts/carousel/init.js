// Initialize a scrollable carousel with prev/next buttons and bounce feedback.
// Exposes `initializeCarousel` on `window` so other scripts can call it.
(function () {
  function initializeCarousel(carouselId, prevBtnId, nextBtnId) {
    const carousel = document.getElementById(carouselId);
    const nextBtn = document.getElementById(prevBtnId);
    const prevBtn = document.getElementById(nextBtnId);

    if (!carousel || !prevBtn || !nextBtn) {
      return;
    }

    const scrollAmount =
      carouselId === "card-carousel"
        ? (carousel.querySelector(".card") || { offsetWidth: 280 })
            .offsetWidth + 15
        : 300;

    let isAtStart = true;
    let isAtEnd = false;
    let bounceTimeout;

    function checkButtonVisibility() {
      const currentScroll = Math.round(carousel.scrollLeft);
      const maxScroll = Math.round(carousel.scrollWidth - carousel.clientWidth);
      const buffer = 10;
      const isRTL = getComputedStyle(carousel).direction === "rtl";

      if (isRTL) {
        isAtStart = currentScroll <= -maxScroll + buffer;
        isAtEnd = currentScroll >= -buffer;
      } else {
        isAtStart = currentScroll <= buffer;
        isAtEnd = currentScroll >= maxScroll - buffer;
      }

      if (isRTL) {
        prevBtn.classList.toggle("hidden", isAtEnd);
        nextBtn.classList.toggle("hidden", isAtStart);
      } else {
        prevBtn.classList.toggle("hidden", isAtStart);
        nextBtn.classList.toggle("hidden", isAtEnd);
      }
    }

    function triggerBounce(button) {
      if (window.vibrationManager) {
        window.vibrationManager.bounce();
      }

      clearTimeout(bounceTimeout);
      carousel.classList.remove("is-shaking");
      requestAnimationFrame(() => {
        carousel.classList.add("is-shaking");
        bounceTimeout = setTimeout(() => {
          carousel.classList.remove("is-shaking");
        }, 300);
      });
    }

    nextBtn.addEventListener("click", () => {
      const isRTL = getComputedStyle(carousel).direction === "rtl";
      if (isRTL ? isAtStart : isAtEnd) {
        triggerBounce(nextBtn);
      } else {
        carousel.scrollBy({
          left: isRTL ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    });

    prevBtn.addEventListener("click", () => {
      const isRTL = getComputedStyle(carousel).direction === "rtl";
      if (isRTL ? isAtEnd : isAtStart) {
        triggerBounce(prevBtn);
      } else {
        carousel.scrollBy({
          left: isRTL ? scrollAmount : -scrollAmount,
          behavior: "smooth",
        });
      }
    });

    carousel.addEventListener("scroll", checkButtonVisibility);
    window.addEventListener("resize", checkButtonVisibility);
    checkButtonVisibility();
  }

  window.initializeCarousel = initializeCarousel;
})();
