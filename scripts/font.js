// --- START: Updated font.js with Integrated Discrete Slider ---

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Get Elements ---
  const paragraph = document.getElementById("chapter-text");
  const chapterTitle = document.getElementById("chapter-title");
  const supportText = document.getElementById("support-wrapper");
  const infoText = document.getElementById("info-wrapper");
  const fontContainer = document.getElementById("font-selector");

  // *** عناصر التحكم الجديدة بالحجم ***
  const sizeToggleBtn = document.getElementById("size-toggle-btn");
  const sizeSlider = document.getElementById("size-slider");
  const collapsedText = sizeToggleBtn
    ? sizeToggleBtn.querySelector(".collapsed-text")
    : null;

  // --- 2. State Variables & Storage Keys ---
  const FONT_SETTINGS_KEY = "userFontSettings";
  const TEXT_ALIGN_KEY = "userTextAlign";

  // نقاط التوقف الثابتة (0=Small, 3=XL)
  const SIZE_MAP = {
    0: 15, // S
    1: 18, // M
    2: 22, // L
    3: 25, // XL
  };

  let currentBaseSize = 16;
  let currentActiveFontFamily = "Alexandria, sans-serif";
  let currentActiveFontId = "font-alexandria";
  let TitleFont = "Lalezar";
  let currentTextAlign = "right";

  // --- 3. Core Functions ---

  // تحويل حجم الخط (بالبكسل) إلى مؤشر السلايدر (0-3)
  function sizeToSliderIndex(size) {
    let index = 1; // Default to M (index 1 = 18px, closest to 16px default)

    // البحث عن أقرب نقطة توقف
    let minDiff = Infinity;
    for (const key in SIZE_MAP) {
      const diff = Math.abs(SIZE_MAP[key] - size);
      if (diff < minDiff) {
        minDiff = diff;
        index = parseInt(key);
      }
    }
    return index;
  }

  function applyFontSize() {
    if (!paragraph) return;

    // A. منطق خط النسخ (Fixed Size Logic)
    if (currentActiveFontFamily.includes("Naskh")) {
      paragraph.style.fontSize = "30px";
      if (infoText) infoText.style.fontSize = "17px";

      if (sizeSlider) sizeSlider.disabled = true;
      if (sizeToggleBtn) {
        sizeToggleBtn.classList.remove("expanded");
        if (collapsedText) collapsedText.textContent = "ثابت";
      }
    } else {
      // B. منطق الخطوط القابلة للتعديل (Scalable Size Logic)
      const newSize = currentBaseSize + "px";

      paragraph.style.fontSize = newSize;
      if (infoText) infoText.style.fontSize = newSize;
      if (chapterTitle) chapterTitle.style.fontSize = "";

      // تحديث حالة السلايدر وقيمة النص المصغر
      if (sizeSlider) {
        // تحديث قيمة السلايدر لتعكس الحجم الحالي
        sizeSlider.value = sizeToSliderIndex(currentBaseSize);
        sizeSlider.disabled = false;
      }
      if (collapsedText) {
        // عرض الحجم الحالي (مثلاً 18) أو كلمة حجم الخط
        collapsedText.textContent = currentBaseSize + "px";
      }
    }
  }

  function applyFontFamily() {
    if (paragraph) paragraph.style.fontFamily = currentActiveFontFamily;
    if (chapterTitle) chapterTitle.style.fontFamily = TitleFont;
  }

  function saveFontSettings() {
    const settings = {
      size: currentBaseSize,
      fontId: currentActiveFontId,
    };
    localStorage.setItem(FONT_SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadFontSettings() {
    const savedSettings = localStorage.getItem(FONT_SETTINGS_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      currentBaseSize = settings.size || 16;
      currentActiveFontId = settings.fontId || "font-alexandria";
    }

    const allFontButtons = fontContainer
      ? fontContainer.querySelectorAll("button")
      : [];
    allFontButtons.forEach((btn) => btn.classList.remove("active"));

    const activeBtn = document.getElementById(currentActiveFontId);
    if (activeBtn) {
      activeBtn.classList.add("active");
      currentActiveFontFamily = window.getComputedStyle(activeBtn).fontFamily;
    }
  }

  // --- Dynamic Visual Anchor (Updated for CSS Transitions) ---
  function maintainScrollPosition(changeFunction) {
    const viewportCenterY = window.innerHeight / 2;
    const container = paragraph; // The scrolling container

    if (!container) {
      changeFunction();
      return;
    }

    // 1. Find the element to anchor to
    let elementAtCenter = document.elementFromPoint(
      window.innerWidth / 2,
      viewportCenterY
    );

    // If the very center is not within our text container, don't anchor
    if (!container.contains(elementAtCenter)) {
      elementAtCenter = null;
    }

    const initialTop = elementAtCenter
      ? elementAtCenter.getBoundingClientRect().top
      : null;

    // 2. Apply the font change
    changeFunction();

    // If we don't have an anchor, we're done
    if (!elementAtCenter || initialTop === null) {
      return;
    }

    // 3. Wait for the change to be rendered
    const transitionDuration = 300; // Must match the CSS transition duration
    let transitionendFired = false;

    const onTransitionEnd = (event) => {
      // We only care about the font-size transition on our specific container
      if (event.target !== container || event.propertyName !== "font-size") {
        return;
      }
      transitionendFired = true;
      container.removeEventListener("transitionend", onTransitionEnd);

      // 4. Adjust scroll position
      const newTop = elementAtCenter.getBoundingClientRect().top;
      const topDifference = newTop - initialTop;
      window.scrollBy(0, topDifference);
    };

    container.addEventListener("transitionend", onTransitionEnd);

    // Fallback: If transitionend doesn't fire (e.g., no actual style change, or font-family change without transition)
    setTimeout(() => {
      if (!transitionendFired) {
        container.removeEventListener("transitionend", onTransitionEnd);
        const newTop = elementAtCenter.getBoundingClientRect().top;
        const topDifference = newTop - initialTop;
        if (topDifference !== 0) {
          window.scrollBy(0, topDifference);
        }
      }
    }, transitionDuration + 50); // A safety margin
  }

  function setupFontSizeSlider() {
    if (sizeToggleBtn && sizeSlider) {
      // Function to close the slider and update the text
      const closeSlider = () => {
        sizeToggleBtn.classList.remove("expanded");
        if (collapsedText) {
          collapsedText.textContent = currentBaseSize + "px";
        }
      };

      // 1. فتح وإغلاق الزر/السلايدر
      sizeToggleBtn.addEventListener("click", (e) => {
        // If the click is inside the expanded slider content, prevent toggling the button state
        if (
          sizeToggleBtn.classList.contains("expanded") &&
          e.target.closest(".expanded-slider-content")
        ) {
          e.stopPropagation();
          return;
        }

        // إذا كان خط النسخ مفعّلاً، لا تسمح بالفتح
        if (currentActiveFontFamily.includes("Naskh")) {
          closeSlider(); // Close if Naskh font is active
          return;
        }

        const isExpanded = sizeToggleBtn.classList.toggle("expanded");

        // عند الفتح، تأكد من تحديث قيمة السلايدر لتعكس الحجم الحالي
        if (isExpanded) {
          sizeSlider.value = sizeToSliderIndex(currentBaseSize);
        } else {
          // عند الإغلاق، نحدث النص المصغر
          if (collapsedText) collapsedText.textContent = currentBaseSize + "px";
        }
      });

      // Add a global listener to close the slider when clicking outside sizeToggleBtn
      document.addEventListener("click", (e) => {
        if (
          sizeToggleBtn.classList.contains("expanded") &&
          !sizeToggleBtn.contains(e.target)
        ) {
          closeSlider();
        }
      });
    }

    // 2. تحديث الحجم عند تغيير نقطة التوقف
    if (sizeSlider) {
      // نستخدم 'input' ليتم التحديث أثناء السحب
      sizeSlider.addEventListener("input", (event) => {
        const sliderIndex = parseInt(event.target.value);
        currentBaseSize = SIZE_MAP[sliderIndex];

        maintainScrollPosition(() => {
          applyFontSize();
        });

        saveFontSettings();
      });

      // تحديث قيمة السلايدر الافتراضية عند التحميل
      sizeSlider.value = sizeToSliderIndex(currentBaseSize);
    }
  }

  function setupFontSelection() {
    if (fontContainer) {
      fontContainer.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");
        if (!clickedButton) return;

        fontContainer
          .querySelectorAll("button")
          .forEach((btn) => btn.classList.remove("active"));
        clickedButton.classList.add("active");

        currentActiveFontId = clickedButton.id;
        currentActiveFontFamily =
          window.getComputedStyle(clickedButton).fontFamily;

        maintainScrollPosition(() => {
          applyFontFamily();
          applyFontSize();
        });

        // إغلاق السلايدر إذا تم اختيار خط النسخ
        if (currentActiveFontFamily.includes("Naskh") && sizeToggleBtn) {
          sizeToggleBtn.classList.remove("expanded");
        }

        saveFontSettings();
      });
    }
  }

  // --- 4. Text Alignment (كما هو) ---
  const alignContainer = document.getElementById("align-formate");
  const ltrBtn = document.getElementById("ltr-btn");
  const middleBtn = document.getElementById("middle-btn");
  const rtlBtn = document.getElementById("rtl-btn");

  function applyTextAlign() {
    const elementsToAlign = [paragraph, chapterTitle, supportText, infoText];

    elementsToAlign.forEach((el) => {
      if (el) {
        el.style.textAlign = currentTextAlign;
      }
    });

    const dateContainer = document.querySelector(
      ".main-header-container .date"
    );
    if (dateContainer) {
      if (currentTextAlign === "left") {
        dateContainer.style.justifyContent = "flex-end";
      } else if (currentTextAlign === "center") {
        dateContainer.style.justifyContent = "center";
      } else {
        dateContainer.style.justifyContent = "flex-start";
      }
    }

    const preNexContainer = document.querySelector(".pre-nex");
    if (preNexContainer) {
      if (currentTextAlign === "left") {
        preNexContainer.style.justifyContent = "flex-end";
      } else if (currentTextAlign === "center") {
        preNexContainer.style.justifyContent = "center";
      } else {
        preNexContainer.style.justifyContent = "flex-start";
      }
    }

    if (alignContainer) {
      const allAlignButtons = alignContainer.querySelectorAll("button");
      allAlignButtons.forEach((btn) => btn.classList.remove("active"));

      if (currentTextAlign === "left" && ltrBtn) {
        ltrBtn.classList.add("active");
      } else if (currentTextAlign === "center" && middleBtn) {
        middleBtn.classList.add("active");
      } else if (rtlBtn) {
        rtlBtn.classList.add("active");
      }
    }
  }

  function saveTextAlign() {
    localStorage.setItem(TEXT_ALIGN_KEY, currentTextAlign);
  }

  function loadTextAlign() {
    const savedAlign = localStorage.getItem(TEXT_ALIGN_KEY);
    if (savedAlign) {
      currentTextAlign = savedAlign;
    }
  }

  function setupAlignmentSelection() {
    if (alignContainer) {
      alignContainer.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");
        if (!clickedButton) return;

        if (clickedButton.id === "ltr-btn") {
          currentTextAlign = "left";
        } else if (clickedButton.id === "middle-btn") {
          currentTextAlign = "center";
        } else {
          currentTextAlign = "right";
        }
        applyTextAlign();
        saveTextAlign();
      });
    }
  }

  // --- 5. Initialization ---

  loadFontSettings();
  loadTextAlign();

  applyFontFamily();
  setupFontSizeSlider();
  applyFontSize();
  applyTextAlign();

  setupFontSelection();
  setupAlignmentSelection();

  document.addEventListener("contentLoaded", () => {
    applyFontFamily();
    applyFontSize();
    applyTextAlign();
  });
});
