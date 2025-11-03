document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".card-container");
  const card = document.querySelector(".card");

  const maxRotate = 15;
  const maxTranslate = 8;

  let touchStartX = 0;
  let isSwiping = false;

  // ----- 1. دالة موحدة لحساب وتطبيق الحركة -----
  function handleMove(e) {
    if (isSwiping) return;
    // منع سلوك المتصفح الافتراضي (مثل التمرير) عند اللمس
    if (e.type === "touchmove") {
      e.preventDefault();
    }

    const rect = container.getBoundingClientRect();

    // تحديد مصدر الإحداثيات (لمس أو ماوس)
    const pointerX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const pointerY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    const x = pointerX - rect.left;
    const y = pointerY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * maxRotate;
    const rotateY = -((x - centerX) / centerX) * maxRotate;
    const translateX = ((x - centerX) / centerX) * maxTranslate;
    const translateY = ((y - centerY) / centerY) * maxTranslate;

    card.style.transform = `
                    perspective(1500px) 
                    rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                    scale3d(1.05, 1.05, 1.05)
                    translateX(${translateX}px) translateY(${translateY}px)
                `;
    card.style.transition = "transform 0.05s linear, box-shadow 0.05s linear"; // حركة أسرع للاستجابة الفورية

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }

  // ----- 2. دالة لإعادة الكرت لوضعه الطبيعي -----
  function handleLeave() {
    if (isSwiping) return;
    card.style.transition = "transform 0.5s ease-out, box-shadow 0.5s ease-out";
    card.style.transform = `
                    perspective(1500px) 
                    rotateX(0deg) rotateY(0deg) 
                    scale3d(1, 1, 1)
                    translateX(0px) translateY(0px)
                `;
  }

  // ----- 3. ربط الأحداث -----

  // أحداث الماوس
  container.addEventListener("mousemove", handleMove);
  container.addEventListener("mouseleave", handleLeave);

  // أحداث اللمس (الإضافة الجديدة)
  container.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      isSwiping = false;
      handleMove({
        type: "touchmove",
        touches: e.touches,
        preventDefault: () => {},
      });
    },
    { passive: false }
  );

  container.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        const touchCurrentX = e.touches[0].clientX;
        if (Math.abs(touchCurrentX - touchStartX) > 10) { // Swipe detected
            isSwiping = true;
        }
    }
    handleMove(e);
  }, { passive: false });

  container.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > 100) { // Swipe threshold
      if (swipeDistance > 0) {
        window.novelSwitcher.switchToPreviousNovel();
      } else {
        window.novelSwitcher.switchToNextNovel();
      }
    }
    isSwiping = false;
    handleLeave();
  });

  container.addEventListener("touchcancel", () => {
      isSwiping = false;
      handleLeave();
  }); // في حال تمت مقاطعة اللمس
});
