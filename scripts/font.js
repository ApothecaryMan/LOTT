document.addEventListener("contentLoaded", () => {
  // --- 1. Get Elements ---
  const paragraph = document.getElementById("chapter-text");
  const chapterTitle = document.getElementById("chapter-title");
  const supportText = document.getElementById("support-wrapper");
  const infoText = document.getElementById("info-wrapper");

  const sizeDisplay = document.getElementById("font-size");
  const increaseFontSizeBtn = document.getElementById("increase-font-size");
  const decreaseFontSizeBtn = document.getElementById("decrease-font-size");
  const fontContainer = document.getElementById("font-selector");

  // --- 2. State Variables ---
  let currentBaseSize = 16;
  let currentActiveFontFamily = "Alexandria, sans-serif"; // Default

  // --- 3. Initialize State on Page Load ---

  if (paragraph) {
    currentBaseSize = parseFloat(window.getComputedStyle(paragraph).fontSize);
  }
  const defaultActiveButton = fontContainer.querySelector(".active");
  if (defaultActiveButton) {
    currentActiveFontFamily =
      window.getComputedStyle(defaultActiveButton).fontFamily;
  }

  // --- 4. Core Functions ---

  /**
   * (تم التعديل)
   * هذه الدالة هي المسؤولة عن تطبيق الأحجام
   * وهي تتحقق من الخط النشط "قبل" تطبيق أي حجم
   */
  function applyFontSize() {
    if (!paragraph) return;

    // التحقق إذا كان "Naskh" هو الخط النشط
    if (currentActiveFontFamily.includes("Naskh")) {
      // --- (منطق خط النسخ) ---
      const naskhSize = "30px";
      const naskhTitleSize = "50px";

      paragraph.style.fontSize = naskhSize;
      supportText.style.fontSize = 17; // (كان خطأ: 17)
      infoText.style.fontSize = 17; // (كان خطأ: 17)
      chapterTitle.style.fontSize = naskhTitleSize;

      // تعطيل الأزرار
      if (sizeDisplay) sizeDisplay.innerText = "ثابت";
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = true;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = true;
    } else {
      // --- (منطق الخطوط الأخرى) ---
      const newSize = currentBaseSize + "px";

      paragraph.style.fontSize = newSize;
      supportText.style.fontSize = newSize;
      infoText.style.fontSize = newSize;
      chapterTitle.style.fontSize = ""; // إرجاع العنوان لوضعه الافتراضي

      // تمكين الأزرار
      if (sizeDisplay) sizeDisplay.innerText = newSize;
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = false;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = false;
    }
  }

  /**
   * (تم التعديل)
   * هذه الدالة الآن مسؤولة "فقط" عن تغيير عائلة الخط
   */
  function applyFontFamily() {
    if (paragraph) {
      paragraph.style.fontFamily = currentActiveFontFamily;
    }
    if (chapterTitle) {
      chapterTitle.style.fontFamily = currentActiveFontFamily;
    }

    // (هام جداً)
    // بعد تغيير الخط، يجب استدعاء دالة الحجم
    // لتطبيق القواعد الخاصة بـ "Naskh" أو إزالتها
    applyFontSize();
  }

  /**
   * Increases font size by a standard amount (1px).
   */
  function increaseFontSize() {
    const increment = 1;
    currentBaseSize += increment;
    applyFontSize(); // استدعاء الدالة الذكية
  }

  /**
   * Decreases font size by a standard amount (1px).
   */
  function decreaseFontSize() {
    const decrement = 1;
    currentBaseSize -= decrement;
    if (currentBaseSize < 8) {
      currentBaseSize = 8;
    }
    applyFontSize(); // استدعاء الدالة الذكية
  }

  /**
   * Function to manage font selection (Event Delegation)
   */
  function setupFontSelection() {
    if (fontContainer) {
      fontContainer.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");
        if (!clickedButton) return;

        // 1. Remove "active" from all buttons
        const allFontButtons = fontContainer.querySelectorAll("button");
        allFontButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

        // 2. Add "active" to the clicked button
        clickedButton.classList.add("active");

        // 3. Update the current font and apply it
        currentActiveFontFamily =
          window.getComputedStyle(clickedButton).fontFamily;

        // (تم التعديل)
        // استدعاء دالة تغيير الخط (التي ستستدعي دالة تغيير الحجم)
        applyFontFamily();
      });
    }
  }

  // --- 5. Attach Event Listeners ---
  if (increaseFontSizeBtn) {
    increaseFontSizeBtn.addEventListener("click", increaseFontSize);
  }
  if (decreaseFontSizeBtn) {
    decreaseFontSizeBtn.addEventListener("click", decreaseFontSize);
  }
  setupFontSelection();

  // --- 6. Initial Application on Page Load ---
  // (تم التعديل)
  // تطبيق الخط أولاً، ثم تطبيق الحجم (لضمان عمل "Naskh" عند الريفرش)
  applyFontFamily();
});
