// --- START: New carousel.js content ---

// This function can initialize any carousel on the page
function initializeCarousel(carouselId, prevBtnId, nextBtnId) {
  const carousel = document.getElementById(carouselId);
  const nextBtn = document.getElementById(prevBtnId);
  const prevBtn = document.getElementById(nextBtnId);

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
  let bounceTimeout;

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

  //Vibration
  function triggerBounce(button) {
    // VIBRATION: Call the bounce vibration from the manager
    if (window.vibrationManager) {
      window.vibrationManager.bounce();
    }

    clearTimeout(bounceTimeout);
    const carouselToShake = document.getElementById("carousel");
    carouselToShake.classList.remove("is-shaking");

    requestAnimationFrame(() => {
      carouselToShake.classList.add("is-shaking");
      bounceTimeout = setTimeout(() => {
        carouselToShake.classList.remove("is-shaking");
      }, 300);
    });
  }
  // Next Button Click
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

  // Previous Button Click
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

  // NOTE: The word count logic was moved out of this file as it's not related to carousels.
  // It's better to keep it in a more general script file like `script.js` or its own file.
});

//>>>>>>>>>>>>>>>>>>>>>>>>> WORD COUNT (Now separate) >>>>>>>>>>>>>>
document.addEventListener("contentLoaded", () => {
  const wordCountBtn = document.getElementById("word-count");
  const paragraph = document.getElementById("chapter-text");

  if (wordCountBtn && paragraph) {
    const textContent = paragraph.textContent;
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word !== "");
    const wordCount = words.length;
    wordCountBtn.innerText = wordCount + " كلمة ";
  } else {
    if (!wordCountBtn) console.error("Element with id 'word-count' not found.");
    if (!paragraph) console.error("Element with id 'chapter-text' not found.");
  }
});
