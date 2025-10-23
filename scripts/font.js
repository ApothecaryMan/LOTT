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
  let currentBaseSize = 16;
  let currentActiveFontFamily = "Alexandria, sans-serif";
  let currentActiveFontId = "font-alexandria"; // Default active font button ID

  // --- 3. Core Functions ---

  function applyFontSize() {
    if (!paragraph) return;
    if (currentActiveFontFamily.includes("Naskh")) {
      paragraph.style.fontSize = "30px";
      supportText.style.fontSize = "17px";
      infoText.style.fontSize = "17px";
      chapterTitle.style.fontSize = "50px";
      if (sizeDisplay) sizeDisplay.innerText = "ثابت";
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = true;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = true;
    } else {
      const newSize = currentBaseSize + "px";
      paragraph.style.fontSize = newSize;
      supportText.style.fontSize = newSize;
      infoText.style.fontSize = newSize;
      chapterTitle.style.fontSize = "";
      if (sizeDisplay) sizeDisplay.innerText = currentBaseSize;
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = false;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = false;
    }
  }

  function applyFontFamily() {
    if (paragraph) paragraph.style.fontFamily = currentActiveFontFamily;
    if (chapterTitle) chapterTitle.style.fontFamily = currentActiveFontFamily;
    applyFontSize();
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
      currentActiveFontId = settings.fontId || "font-playpen";
    }

    // Apply the loaded (or default) settings to the UI
    const allFontButtons = fontContainer.querySelectorAll("button");
    allFontButtons.forEach((btn) => btn.classList.remove("active"));

    const activeBtn = document.getElementById(currentActiveFontId);
    if (activeBtn) {
      activeBtn.classList.add("active");
      currentActiveFontFamily = window.getComputedStyle(activeBtn).fontFamily;
    }
  }

  function increaseFontSize() {
    currentBaseSize += 1;
    applyFontSize();
    saveFontSettings();
  }

  function decreaseFontSize() {
    currentBaseSize -= 1;
    if (currentBaseSize < 8) currentBaseSize = 8;
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
        saveFontSettings();
      });
    }
  }

  // --- 4. Text Alignment ---
  const alignContainer = document.getElementById("align-formate");
  const ltrBtn = document.getElementById("ltr-btn");
  const middleBtn = document.getElementById("middle-btn");
  const rtlBtn = document.getElementById("rtl-btn");

  const TEXT_ALIGN_KEY = "userTextAlign";
  let currentTextAlign = "right"; // Default

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
        dateContainer.style.justifyContent = "flex-end"; // flex-end is left in RTL
      } else if (currentTextAlign === "center") {
        dateContainer.style.justifyContent = "center";
      } else {
        // right
        dateContainer.style.justifyContent = "flex-start"; // flex-start is right in RTL
      }
    }

    const preNexContainer = document.querySelector(".pre-nex");
    if (preNexContainer) {
      if (currentTextAlign === "left") {
        preNexContainer.style.justifyContent = "flex-end"; // flex-end is left in RTL
      } else if (currentTextAlign === "center") {
        preNexContainer.style.justifyContent = "center";
      } else { // right
        preNexContainer.style.justifyContent = "flex-start"; // flex-start is right in RTL
      }
    }

    if (alignContainer) {
      const allAlignButtons = alignContainer.querySelectorAll("button");
      allAlignButtons.forEach((btn) => btn.classList.remove("active"));

      if (currentTextAlign === "left") {
        ltrBtn.classList.add("active");
      } else if (currentTextAlign === "center") {
        middleBtn.classList.add("active");
      } else {
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
  loadFontSettings(); // Load saved settings first
  loadTextAlign();

  // The contentLoaded event will trigger the initial application of styles
  document.addEventListener("contentLoaded", () => {
    applyFontFamily(); // Apply loaded settings when content is ready
    applyTextAlign();
  });

  // Attach other listeners
  if (increaseFontSizeBtn)
    increaseFontSizeBtn.addEventListener("click", increaseFontSize);
  if (decreaseFontSizeBtn)
    decreaseFontSizeBtn.addEventListener("click", decreaseFontSize);
  setupFontSelection();
  setupAlignmentSelection();
});

// document.addEventListener("contentLoaded", () => {
//   // --- 1. Get Elements ---
//   const paragraph = document.getElementById("chapter-text");
//   const chapterTitle = document.getElementById("chapter-title");
//   const supportText = document.getElementById("support-wrapper");
//   const infoText = document.getElementById("info-wrapper");
//   const sizeDisplay = document.getElementById("font-size");
//   const increaseFontSizeBtn = document.getElementById("increase-font-size");
//   const decreaseFontSizeBtn = document.getElementById("decrease-font-size");
//   const fontContainer = document.getElementById("font-selector");

//   // --- 2. State Variables ---
//   let currentBaseSize = 16;
//   let currentActiveFontFamily = "Alexandria, sans-serif"; // Default

//   // --- 3. Initialize State on Page Load ---

//   if (paragraph) {
//     currentBaseSize = parseFloat(window.getComputedStyle(paragraph).fontSize);
//   }
//   const defaultActiveButton = fontContainer.querySelector(".active");
//   if (defaultActiveButton) {
//     currentActiveFontFamily =
//       window.getComputedStyle(defaultActiveButton).fontFamily;
//   }

//   // --- 4. Core Functions ---

//   /**
//    * (تم التعديل)
//    * هذه الدالة هي المسؤولة عن تطبيق الأحجام
//    * وهي تتحقق من الخط النشط "قبل" تطبيق أي حجم
//    */
//   function applyFontSize() {
//     if (!paragraph) return;

//     // Check if "Naskh" is the active font
//     if (currentActiveFontFamily.includes("Naskh")) {
//       // --- Naskh Font Logic ---
//       const naskhSize = "30px";
//       const naskhTitleSize = "50px";

//       paragraph.style.fontSize = naskhSize;
//       supportText.style.fontSize = 17; // Corrected: Added "px"
//       infoText.style.fontSize = 17; // Corrected: Added "px"
//       chapterTitle.style.fontSize = naskhTitleSize;

//       // Disable buttons and update display
//       if (sizeDisplay) sizeDisplay.innerText = "ثابت";
//       if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = true;
//       if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = true;
//     } else {
//       // --- Other Fonts Logic ---
//       const newSize = currentBaseSize + "px"; // Calculate the size WITH "px"

//       // Apply font size to elements
//       paragraph.style.fontSize = newSize;
//       supportText.style.fontSize = newSize;
//       infoText.style.fontSize = newSize;
//       chapterTitle.style.fontSize = ""; // Reset title size

//       // Enable buttons and update display
//       if (sizeDisplay) {
//         // --- THIS IS THE CHANGE ---
//         sizeDisplay.innerText = currentBaseSize; // Display only the number
//         // --- END OF CHANGE ---
//       }
//       if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = false;
//       if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = false;
//     }
//   }

//   /**
//    * (تم التعديل)
//    * هذه الدالة الآن مسؤولة "فقط" عن تغيير عائلة الخط
//    */
//   function applyFontFamily() {
//     if (paragraph) {
//       paragraph.style.fontFamily = currentActiveFontFamily;
//     }
//     if (chapterTitle) {
//       chapterTitle.style.fontFamily = currentActiveFontFamily;
//     }

//     applyFontSize();
//   }

//   /**
//    * Increases font size by a standard amount (1px).
//    */
//   function increaseFontSize() {
//     const increment = 1;
//     currentBaseSize += increment;
//     applyFontSize(); // استدعاء الدالة الذكية
//   }

//   /**
//    * Decreases font size by a standard amount (1px).
//    */
//   function decreaseFontSize() {
//     const decrement = 1;
//     currentBaseSize -= decrement;
//     if (currentBaseSize < 8) {
//       currentBaseSize = 8;
//     }
//     applyFontSize(); // استدعاء الدالة الذكية
//   }

//   /**
//    * Function to manage font selection (Event Delegation)
//    */
//   function setupFontSelection() {
//     if (fontContainer) {
//       fontContainer.addEventListener("click", (event) => {
//         const clickedButton = event.target.closest("button");
//         if (!clickedButton) return;

//         // 1. Remove "active" from all buttons
//         const allFontButtons = fontContainer.querySelectorAll("button");
//         allFontButtons.forEach((btn) => {
//           btn.classList.remove("active");
//         });

//         // 2. Add "active" to the clicked button
//         clickedButton.classList.add("active");

//         // 3. Update the current font and apply it
//         currentActiveFontFamily =
//           window.getComputedStyle(clickedButton).fontFamily;

//         // (تم التعديل)
//         // استدعاء دالة تغيير الخط (التي ستستدعي دالة تغيير الحجم)
//         applyFontFamily();
//       });
//     }
//   }

//   // --- 5. Attach Event Listeners ---
//   if (increaseFontSizeBtn) {
//     increaseFontSizeBtn.addEventListener("click", increaseFontSize);
//   }
//   if (decreaseFontSizeBtn) {
//     decreaseFontSizeBtn.addEventListener("click", decreaseFontSize);
//   }
//   setupFontSelection();

//   // --- 6. Initial Application on Page Load ---
//   applyFontFamily();
// });
