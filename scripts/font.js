// --- START: Updated font.js with localStorage ---

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Get Elements ---
  const paragraph = document.getElementById("chapter-text");
  const chapterTitle = document.getElementById("chapter-title");
  const supportText = document.getElementById("support-wrapper");
  const infoText = document.getElementById("info-wrapper");
  const sizeDisplay = document.getElementById("font-size");
  const increaseFontSizeBtn = document.getElementById("increase-font-size");
  const decreaseFontSizeBtn = document.getElementById("decrease-font-size");
  const fontContainer = document.getElementById("font-selector");

  // --- 2. State Variables & Storage Keys ---
  const FONT_SETTINGS_KEY = "userFontSettings";
  const TEXT_ALIGN_KEY = "userTextAlign";

  let currentBaseSize = 16;
  let currentActiveFontFamily = "Alexandria, sans-serif";
  let currentActiveFontId = "font-alexandria"; // Default active font button ID
  let TitleFont = "Lalezar";
  let currentTextAlign = "right"; // Default alignment

  // --- 3. Core Functions ---

  function applyFontSize() {
    if (!paragraph) return;

    // A. منطق خط النسخ (Fixed Size Logic)
    if (currentActiveFontFamily.includes("Naskh")) {
      paragraph.style.fontSize = "30px";
      if (infoText) infoText.style.fontSize = "17px";

      if (sizeDisplay) sizeDisplay.innerText = "ثابت";
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = true;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = true;
    } else {
      // B. منطق الخطوط القابلة للتعديل (Scalable Size Logic)
      // يستخدم القيمة المخزنة في currentBaseSize
      const newSize = currentBaseSize + "px";

      paragraph.style.fontSize = newSize;
      if (infoText) infoText.style.fontSize = newSize;
      if (chapterTitle) chapterTitle.style.fontSize = ""; // Reset title size if needed

      if (sizeDisplay) sizeDisplay.innerText = currentBaseSize;
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = false;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = false;
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

    // Apply the loaded (or default) settings to the UI controls
    const allFontButtons = fontContainer.querySelectorAll("button");
    allFontButtons.forEach((btn) => btn.classList.remove("active"));

    const activeBtn = document.getElementById(currentActiveFontId);
    if (activeBtn) {
      activeBtn.classList.add("active");
      // Update font family variable based on the loaded ID
      currentActiveFontFamily = window.getComputedStyle(activeBtn).fontFamily;
    }
  }

  function increaseFontSize() {
    // لا يمكن التعديل إذا كان الخط المستخدم هو النسخ
    if (currentActiveFontFamily.includes("Naskh")) return;

    currentBaseSize += 1;
    if (currentBaseSize > 25) currentBaseSize = 25;
    applyFontSize();
    saveFontSettings();
  }

  function decreaseFontSize() {
    // لا يمكن التعديل إذا كان الخط المستخدم هو النسخ
    if (currentActiveFontFamily.includes("Naskh")) return;

    currentBaseSize -= 1;
    if (currentBaseSize < 15) currentBaseSize = 15;
    applyFontSize();
    saveFontSettings();
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

        // *** Fix: استدعاء applyFontSize هنا لضمان تطبيق الحجم الصحيح (ثابت أو متغير) ***
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

  // 1. Load settings from localStorage
  loadFontSettings();
  loadTextAlign();

  // 2. Apply initial styles immediately (Crucial for sizeDisplay fix)
  applyFontFamily();
  applyFontSize(); // *** FIX: يطبق الحجم المحفوظ أو الثابت ويعرض القيمة في sizeDisplay ***
  applyTextAlign();

  // 3. Attach listeners
  if (increaseFontSizeBtn)
    increaseFontSizeBtn.addEventListener("click", increaseFontSize);
  if (decreaseFontSizeBtn)
    decreaseFontSizeBtn.addEventListener("click", decreaseFontSize);

  setupFontSelection();
  setupAlignmentSelection();

  // If you still rely on the custom contentLoaded event for asynchronous content
  document.addEventListener("contentLoaded", () => {
    // If the elements (paragraph, chapterTitle) are loaded after DOMContentLoaded,
    // these functions ensure styles are reapplied to the newly loaded content.
    applyFontFamily();
    applyFontSize();
    applyTextAlign();
  });
});
