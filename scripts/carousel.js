// Wait for the page to be loaded
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (!carousel || !prevBtn || !nextBtn) {
    console.error("Carousel elements NOT FOUND.");
    return;
  }

  const scrollAmount = 300; // The distance to scroll

  /**
   * The "smart" function, corrected for RTL
   */
  function checkButtonVisibility() {
    // We use Math.round to handle decimal numbers
    const currentScroll = Math.round(carousel.scrollLeft);
    const visibleWidth = Math.round(carousel.clientWidth);
    const totalWidth = Math.round(carousel.scrollWidth);

    // A 10px buffer for safety
    const buffer = 10;

    // --- RTL Logic ---

    // (isAtStart) means at the far RIGHT (scroll position 0)
    const isAtStart = currentScroll >= -buffer;

    // (isAtEnd) means at the far LEFT
    // (Total width - visible width) as a negative number
    const maxNegativeScroll = -(totalWidth - visibleWidth);
    const isAtEnd = currentScroll <= maxNegativeScroll + buffer;

    // --- THIS IS THE FIX ---

    // Hide the RIGHT arrow (next-btn) when at the START
    nextBtn.classList.toggle("hidden", isAtStart);

    // Hide the LEFT arrow (prev-btn) when at the END
    prevBtn.classList.toggle("hidden", isAtEnd);

    // --- END OF FIX ---
  }

  // nextBtn (RIGHT arrow) moves content RIGHT (towards start)
  nextBtn.addEventListener("click", () => {
    carousel.scrollBy({
      left: scrollAmount, // Positive to scroll towards the start
      behavior: "smooth", // Restored smooth behavior
    });
  });

  // prevBtn (LEFT arrow) moves content LEFT (towards end)
  prevBtn.addEventListener("click", () => {
    carousel.scrollBy({
      left: -scrollAmount, // Negative to scroll towards the end
      behavior: "smooth",
    });
  });

  // This listener works when scrolling with the mouse
  carousel.addEventListener("scroll", checkButtonVisibility);

  // Initial check on page load
  checkButtonVisibility();
});
