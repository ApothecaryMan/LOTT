document.addEventListener("DOMContentLoaded", () => {
  const titleBtn = document.getElementById("title-btn");
  if (!titleBtn) return;

  let currentChapterId = null;
  let isAnimating = false;

  // دالة لتحديث العنوان
  function setTitle(newTitle) {
    if (titleBtn.textContent.trim() !== newTitle.trim()) {
      titleBtn.textContent = newTitle;
    }
  }

  // الأنيميشن عند التبديل بين العنوان والزر
  function animateTitleChange(newTitle) {
    if (isAnimating) return;
    const mainTitle = document.getElementById("chapter-title");
    if (!mainTitle) return;

    const oldTitle = mainTitle.textContent.trim();
    if (oldTitle === newTitle) return;

    isAnimating = true;
    const sourceRect = mainTitle.getBoundingClientRect();
    const destRect = titleBtn.getBoundingClientRect();

    const clone = document.createElement("div");
    clone.textContent = oldTitle;

    const sourceStyle = window.getComputedStyle(mainTitle);
    Object.assign(clone.style, {
      position: "fixed",
      top: `${sourceRect.top}px`,
      left: `${sourceRect.left}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      color: sourceStyle.color,
      font: sourceStyle.font,
      textAlign: sourceStyle.textAlign,
      zIndex: "9999",
      pointerEvents: "none",
    });

    document.body.appendChild(clone);
    titleBtn.textContent = newTitle;
    titleBtn.classList.add("visible");

    const deltaX =
      destRect.left +
      destRect.width / 2 -
      (sourceRect.left + sourceRect.width / 2);
    const deltaY =
      destRect.top +
      destRect.height / 2 -
      (sourceRect.top + sourceRect.height / 2);
    const scale =
      sourceRect.width > 0 ? titleBtn.offsetWidth / sourceRect.width : 1;

    const animation = clone.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale})`,
          opacity: 0,
        },
      ],
      { duration: 350, easing: "ease-out", fill: "forwards" }
    );

    animation.onfinish = () => {
      clone.remove();
      mainTitle.classList.remove("hidden");
      isAnimating = false;
    };
  }

  // المراقب الأساسي — يراقب العناوين الجديدة والفصول السابقة
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const chapterTitleEl = entry.target;
        const chapterId = chapterTitleEl.id?.replace("chapter-", "");
        const chapterTitle = chapterTitleEl.textContent.trim();

        if (entry.isIntersecting) {
          // ✅ لما العنوان يدخل في الشاشة (فصل جديد)
          if (currentChapterId !== chapterId) {
            currentChapterId = chapterId;
            animateTitleChange(chapterTitle);
          }
        } else {
          // ✅ لما يخرج العنوان من الشاشة من فوق (نرجع للفصل السابق)
          if (entry.boundingClientRect.top > 0) {
            const prevChapter = getPreviousChapter(chapterTitleEl);
            if (prevChapter && prevChapter.id !== currentChapterId) {
              currentChapterId = prevChapter.id.replace("chapter-", "");
              animateTitleChange(prevChapter.textContent.trim());
            }
          }
        }
      });
    },
    {
      rootMargin: "-10% 0px -80% 0px", // حساسية التبديل للأمام والخلف
      threshold: [0, 1],
    }
  );

  // 🔁 وظيفة تساعد على جلب الفصل السابق في DOM
  function getPreviousChapter(currentEl) {
    const all = Array.from(document.querySelectorAll(".chapter-title"));
    const idx = all.indexOf(currentEl);
    return idx > 0 ? all[idx - 1] : null;
  }

  // 🎯 مراقبة كل العناوين الجديدة عند تحميل الفصول
  function observeAllChapters() {
    document
      .querySelectorAll(".chapter-title")
      .forEach((el) => observer.observe(el));
  }

  observeAllChapters();

  document.addEventListener("contentLoaded", () => {
    observeAllChapters();
  });
});

// داخل نفس الملف title-animation.js — ضع هذا عند نهاية الملف أو بعد دوال الأنيميشن
document.addEventListener("chapterChanged", (e) => {
  const { chapterNumber, title } = e.detail || {};
  const titleBtn = document.getElementById("title-btn");
  if (!titleBtn) return;

  const titleOnly =
    (title || "").split("–")[1]?.trim() || title || `الفصل ${chapterNumber}`;
  // لو عايز أنيميشن استخدم handleAnimation أو animateTitleChange إن كانت معرفة
  // هنا نعمل تحديث فوري للزر بدون انتظار الـ observer
  if (titleBtn.textContent.trim() !== titleOnly) {
    // لو عاوز أنيميشن: animateTitleChange(titleOnly);
    titleBtn.textContent = titleOnly;
    titleBtn.classList.add("visible");
  }
});
