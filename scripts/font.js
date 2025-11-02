// --- START: Updated font.js with Integrated Discrete Slider + Dynamic Visual Anchor ---

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired in font.js"); // Debug log

  // --- 1. Get Elements ---
  const paragraph = document.getElementById("chapter-text");
  const chapterTitle = document.getElementById("chapter-title");
  const supportText = document.getElementById("support-wrapper");
  const infoText = document.getElementById("info-wrapper");
  const fontContainer = document.getElementById("font-selector");

  // *** عناصر التحكم الجديدة بالحجم ***
  const sizeSlider = document.getElementById("size-slider");

  // --- 2. State Variables & Storage Keys ---
  const FONT_SETTINGS_KEY = "userFontSettings";
  const TEXT_ALIGN_KEY = "userTextAlign";

  // نقاط التوقف الثابتة (0=Small, 3=XL)
  const SIZE_MAP = {
    0: 15, // XS
    1: 16, // S
    2: 18, // M
    3: 20, // L
    4: 22, // XL
    5: 23, // XXL
    6: 24, // XXXL
    7: 25, // XXXXL
  };

  let currentBaseSize = 16;
  let currentActiveFontFamily = "Alexandria, sans-serif";
  let currentActiveFontId = "font-alexandria";
  let TitleFont = "Lalezar";
  let currentTextAlign = "right";

  // --- 3. Core Functions ---

  // تحويل حجم الخط (بالبكسل) إلى مؤشر السلايدر (0-3)
  function sizeToSliderIndex(size) {
    let index = 1; // Default to M
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

  // ✅ هنا ندمج طريقة "المرجع البصري الديناميكي"
  function applyFontSize() {
    if (!paragraph) return;

    // --- 1. تحديد نقطة المرجع البصري قبل تغيير الحجم ---
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const anchorElement = document.elementFromPoint(
      viewportCenterX,
      viewportCenterY
    );
    const oldRect = anchorElement
      ? anchorElement.getBoundingClientRect()
      : null;

    // --- 2. تطبيق التغيير في الحجم ---
    if (currentActiveFontFamily.includes("Naskh")) {
      paragraph.style.fontSize = "30px";
      if (infoText) infoText.style.fontSize = "17px";

      if (sizeSlider) sizeSlider.disabled = true;
    } else {
      const newSize = currentBaseSize + "px";

      paragraph.style.fontSize = newSize;
      if (infoText) infoText.style.fontSize = newSize;
      if (chapterTitle) chapterTitle.style.fontSize = "";

      if (sizeSlider) {
        sizeSlider.value = sizeToSliderIndex(currentBaseSize);
        sizeSlider.disabled = false;
      }
    }

    // --- 3. بعد إعادة رسم الصفحة نعيد ضبط التمرير ---
    if (oldRect && anchorElement) {
      requestAnimationFrame(() => {
        const newRect = anchorElement.getBoundingClientRect();
        const deltaY = newRect.top - oldRect.top;
        window.scrollBy(0, deltaY);
      });
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

  function setupFontSizeSlider() {
    if (sizeSlider) {
      // دالة مشتركة لتطبيق التغييرات
      const handleSliderChange = (event) => {
        // نستخدم event.target للحصول على السلايدر نفسه
        const sliderIndex = parseInt(event.target.value);
        currentBaseSize = SIZE_MAP[sliderIndex];
        applyFontSize();
        // الحفظ يتم فقط عند انتهاء الحركة لتجنب الكتابة المستمرة على localStorage
      };

      const saveSettingsOnEnd = () => {
        saveFontSettings();
      };

      // يستجيب للحركة المستمرة على الكمبيوتر واللمس
      sizeSlider.addEventListener("input", handleSliderChange);

      // يستجيب لانتهاء الحركة (عند رفع الفأرة أو الإصبع) ليقوم بالحفظ
      sizeSlider.addEventListener("change", saveSettingsOnEnd);
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

        applyFontFamily();
        applyFontSize();

        saveFontSettings();
      });
    }
  }

  // --- 4. Text Alignment ---
  const alignContainer = document.getElementById("align-formate");
  const ltrBtn = document.getElementById("ltr-btn");
  const middleBtn = document.getElementById("middle-btn");
  const rtlBtn = document.getElementById("rtl-btn");

  function applyTextAlign() {
    const elementsToAlign = [paragraph, chapterTitle, supportText, infoText];

    elementsToAlign.forEach((el) => {
      if (el) el.style.textAlign = currentTextAlign;
    });

    const dateContainer = document.querySelector(
      ".main-header-container .date"
    );
    if (dateContainer) {
      if (currentTextAlign === "left")
        dateContainer.style.justifyContent = "flex-end";
      else if (currentTextAlign === "center")
        dateContainer.style.justifyContent = "center";
      else dateContainer.style.justifyContent = "flex-start";
    }

    const preNexContainer = document.querySelector(".pre-nex");
    if (preNexContainer) {
      if (currentTextAlign === "left")
        preNexContainer.style.justifyContent = "flex-end";
      else if (currentTextAlign === "center")
        preNexContainer.style.justifyContent = "center";
      else preNexContainer.style.justifyContent = "flex-start";
    }

    if (alignContainer) {
      const allAlignButtons = alignContainer.querySelectorAll("button");
      allAlignButtons.forEach((btn) => btn.classList.remove("active"));

      if (currentTextAlign === "left" && ltrBtn) ltrBtn.classList.add("active");
      else if (currentTextAlign === "center" && middleBtn)
        middleBtn.classList.add("active");
      else if (rtlBtn) rtlBtn.classList.add("active");
    }
  }

  function saveTextAlign() {
    localStorage.setItem(TEXT_ALIGN_KEY, currentTextAlign);
  }

  function loadTextAlign() {
    const savedAlign = localStorage.getItem(TEXT_ALIGN_KEY);
    if (savedAlign) currentTextAlign = savedAlign;
  }

  function setupAlignmentSelection() {
    if (alignContainer) {
      alignContainer.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");
        if (!clickedButton) return;

        if (clickedButton.id === "ltr-btn") currentTextAlign = "left";
        else if (clickedButton.id === "middle-btn") currentTextAlign = "center";
        else currentTextAlign = "right";

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

  // --- Font Tools Pop-up Logic ---
  const fontPanelBtn = document.getElementById("font-panel-btn");
  const fontToolsPopup = document.getElementById("font-tools-popup");
  const closeFontToolsBtn = document.getElementById("close-font-tools-btn");

  if (fontPanelBtn && fontToolsPopup && closeFontToolsBtn) {
    fontPanelBtn.addEventListener("click", (event) => {
      // Stop the click from bubbling up to the document
      event.stopPropagation();
      // Toggle the 'show' class to open/close the popup
      fontToolsPopup.classList.toggle("show");
    });

    closeFontToolsBtn.addEventListener("click", () => {
      fontToolsPopup.classList.remove("show");
    });

    // Prevent clicks inside the popup from closing it
    fontToolsPopup.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    // Add a listener to the whole document to close the popup when clicking outside
    document.addEventListener("click", () => {
      if (fontToolsPopup.classList.contains("show")) {
        fontToolsPopup.classList.remove("show");
      }
    });
  }
});
