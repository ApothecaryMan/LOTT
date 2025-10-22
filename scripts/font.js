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
   * Applies the currentBaseSize to the paragraph.
   */
  function applyFontSize() {
    if (!paragraph) return;

    // Apply the base size directly
    paragraph.style.fontSize = currentBaseSize + "px";
    supportText.style.fontSize = currentBaseSize + "px";
    infoText.style.fontSize = currentBaseSize + "px";

    // Show the base size in the display
    if (sizeDisplay) {
      sizeDisplay.innerText = currentBaseSize + "px";
    }
  }

  /**
   * Function to change the font
   */
  function applyFontFamily() {
    if (currentActiveFontFamily.includes("Naskh")) {
      // --- Naskh Font is Active ---
      const naskhSize = "28px";
      const naskhTitleSize = "55px";

      // Apply fixed sizes
      paragraph.style.fontSize = naskhSize;
      supportText.style.fontSize = 17;
      infoText.style.fontSize = 17;
      chapterTitle.style.fontSize = naskhTitleSize;

      // Update display and disable buttons
      if (sizeDisplay) {
        sizeDisplay.innerText = "ثابت"; // Show fixed size
      }
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = true;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = true;
    } else {
      // --- Any Other Font is Active ---
      const newSize = currentBaseSize + "px";

      // Apply the user-controlled base size
      paragraph.style.fontSize = newSize;
      supportText.style.fontSize = newSize;
      infoText.style.fontSize = newSize;
      chapterTitle.style.fontSize = ""; // Reset title size to CSS default

      // Update display and enable buttons
      if (sizeDisplay) {
        sizeDisplay.innerText = newSize;
      }
      if (increaseFontSizeBtn) increaseFontSizeBtn.disabled = false;
      if (decreaseFontSizeBtn) decreaseFontSizeBtn.disabled = false;
    }

    if (paragraph) {
      paragraph.style.fontFamily = currentActiveFontFamily;
    }
    if (chapterTitle) {
      chapterTitle.style.fontFamily = currentActiveFontFamily;
    }
    // No longer need to call applyFontSize() here
  }

  /**
   * Increases font size by a standard amount (1px).
   */
  function increaseFontSize() {
    const increment = 1; // Standard increment for all fonts
    currentBaseSize += increment;
    applyFontSize();
  }

  /**
   * Decreases font size by a standard amount (1px).
   */
  function decreaseFontSize() {
    const decrement = 1; // Standard decrement for all fonts
    currentBaseSize -= decrement;

    if (currentBaseSize < 8) {
      currentBaseSize = 8;
    }
    applyFontSize();
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
  applyFontSize();
}); // --- End of DOMContentLoaded ---
