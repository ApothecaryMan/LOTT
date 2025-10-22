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

  let isAtStart = true;
  let isAtEnd = false;
  let bounceTimeout; // Timer for the bounce

  /**
   * The "smart" function, corrected for RTL
   */
  function checkButtonVisibility() {
    const currentScroll = Math.round(carousel.scrollLeft);
    const visibleWidth = Math.round(carousel.clientWidth);
    const totalWidth = Math.round(carousel.scrollWidth);
    const buffer = 10; // 10px buffer

    isAtStart = currentScroll >= -buffer;
    const maxNegativeScroll = -(totalWidth - visibleWidth);
    isAtEnd = currentScroll <= maxNegativeScroll + buffer;

    nextBtn.classList.toggle("hidden", isAtStart);
    prevBtn.classList.toggle("hidden", isAtEnd);
  }

  /**
   * --- الدالة الجديدة "الذكية" للاهتزاز (باستخدام requestAnimationFrame) ---
   */
  function triggerBounce() {
    // --- رسالة تصحيح ---
    console.log("BOUNCE triggered!");
    // --------------------

    clearTimeout(bounceTimeout);
    carousel.classList.remove("is-shaking");

    // نستخدم requestAnimationFrame لضمان أن المتصفح "رأى" الحذف
    requestAnimationFrame(() => {
      // الآن نضيف الكلاس مرة أخرى لبدء الأنيميشن
      carousel.classList.add("is-shaking");

      // تعيين مؤقت لحذف الكلاس بعد 300ms
      bounceTimeout = setTimeout(() => {
        carousel.classList.remove("is-shaking");
      }, 300); // يجب أن يتطابق هذا الرقم مع مدة الأنيميشن في CSS
    });
  }

  // --- مستمع زر "التالي" (السهم الأيمن) ---
  nextBtn.addEventListener("click", () => {
    if (isAtStart) {
      triggerBounce();
    } else {
      carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  });

  // --- مستمع زر "السابق" (السهم الأيسر) ---
  prevBtn.addEventListener("click", () => {
    if (isAtEnd) {
      triggerBounce();
    } else {
      carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  });

  // This listener works when scrolling with the mouse
  carousel.addEventListener("scroll", checkButtonVisibility);

  // Initial check on page load
  checkButtonVisibility();
});

//>>>>>>>>>>>>>>>>>>>>>>>>> WORD COUNT >>>>>>>>>>>>>>
document.addEventListener("contentLoaded", () => {
  // 1. Get the elements
  const wordCountBtn = document.getElementById("word-count");
  const paragraph = document.getElementById("chapter-text");

  if (wordCountBtn && paragraph) {
    const textContent = paragraph.textContent;

    const words = textContent
      .trim() // Remove whitespace from start/end
      .split(/\s+/) // Split by spaces or newlines
      .filter((word) => word !== ""); // Remove empty strings

    const wordCount = words.length;

    wordCountBtn.innerText = wordCount + " كلمة ";
  } else {
    if (!wordCountBtn) console.error("Element with id 'word-count' not found.");
    if (!paragraph) console.error("Element with id 'chapter-text' not found.");
  }
});
