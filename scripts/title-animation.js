document.addEventListener("DOMContentLoaded", () => {
  const chapterTitle = document.getElementById("chapter-title");
  const titleBtn = document.getElementById("title-btn");

  if (!chapterTitle || !titleBtn) {
    return;
  }

  let isAnimating = false; // Animation flag

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Check if the title is leaving the screen at the top
        const isLeavingScreen = !entry.isIntersecting && entry.boundingClientRect.top < 0;

        if (isLeavingScreen) {
          if (!isAnimating && !titleBtn.classList.contains("visible")) {
            handleAnimation();
          }
        } else if (entry.isIntersecting) {
          // Title is coming back into view
          titleBtn.classList.remove("visible");
          chapterTitle.classList.remove("hidden");
          isAnimating = false; // Reset flag when visible
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 0.1, // A threshold array can be more precise
    }
  );

  function handleAnimation() {
    isAnimating = true;

    const sourceRect = chapterTitle.getBoundingClientRect();
    const destRect = titleBtn.getBoundingClientRect();

    const clone = document.createElement("div");
    clone.textContent = chapterTitle.textContent;

    const sourceStyle = window.getComputedStyle(chapterTitle);
    clone.style.position = "fixed";
    clone.style.top = `${sourceRect.top}px`;
    clone.style.left = `${sourceRect.left}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.color = sourceStyle.color;
    clone.style.font = sourceStyle.font;
    clone.style.textAlign = sourceStyle.textAlign;
    clone.style.zIndex = "9999";
    clone.style.margin = "0";
    clone.style.pointerEvents = "none"; // Prevent interaction

    document.body.appendChild(clone);

    chapterTitle.classList.add("hidden");
    titleBtn.classList.add("visible");

    const deltaX = destRect.left + destRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = destRect.top + destRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    
    // Ensure we don't divide by zero if the source width is 0
    const scale = sourceRect.width > 0 ? titleBtn.offsetWidth / sourceRect.width : 0;

    const animation = clone.animate(
      [
        {
          transformOrigin: "center center",
          transform: `translate(0, 0) scale(1)`,
          opacity: 1,
        },
        {
          transformOrigin: "center center",
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale})`,
          opacity: 0,
        },
      ],
      {
        duration: 400, // Slightly faster
        easing: "cubic-bezier(0.4, 0, 0.75, 0.1)", // Ease-in curve
        fill: "forwards",
      }
    );

    animation.onfinish = () => {
      clone.remove();
      isAnimating = false; // Reset flag
    };
  }

  observer.observe(chapterTitle);
});