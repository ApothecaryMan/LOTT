// const carousel = document.getElementById("carousel");
// const prevBtn = document.getElementById("prevBtn");
// const nextBtn = document.getElementById("nextBtn");

// const itemWidth = 155; // 150px width + 15px gap
// const visibleItems = 4;
// const totalItems = carousel.children.length;
// const maxScroll = (totalItems - visibleItems) * itemWidth;

// let currentPosition = 0;

// function updateCarousel() {
//   carousel.scrollLeft = currentPosition;
//   updateButtons();
// }

// function updateButtons() {
//   prevBtn.disabled = currentPosition <= 0;
//   nextBtn.disabled = currentPosition >= maxScroll;
// }

// prevBtn.addEventListener("click", () => {
//   currentPosition -= itemWidth * visibleItems;
//   if (currentPosition < 0) currentPosition = 0;
//   updateCarousel();
// });

// nextBtn.addEventListener("click", () => {
//   currentPosition += itemWidth * visibleItems;
//   if (currentPosition > maxScroll) currentPosition = maxScroll;
//   updateCarousel();
// });

// function handleClick(btnNum) {
//   alert(`Button ${btnNum} clicked!`);
// }

// // Initialize
// updateCarousel();
