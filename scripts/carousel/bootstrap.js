// Bootstrap file that wires up carousels on DOMContentLoaded using the
// `initializeCarousel` function provided by init.js

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.initializeCarousel !== "function") return;

  // Top control bar carousel
  window.initializeCarousel("carousel", "prev-btn", "next-btn");

  // Card carousel
  window.initializeCarousel("card-carousel", "card-prev-btn", "card-next-btn");
});
