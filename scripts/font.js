// Font size controls
const increaseFontSizeBtn = document.getElementById("increase-font-size");
const decreaseFontSizeBtn = document.getElementById("decrease-font-size");
const sizeDisplay = document.getElementById("font-size");

// Font family buttons
const fontAlexandriaBtn = document.getElementById("font-alexandria");
const fontElMessiriBtn = document.getElementById("font-el-messiri");
const fontPlaypenBtn = document.getElementById("font-playpen");
const fontLalezarBtn = document.getElementById("font-lalezar");
const fontBeirutiBtn = document.getElementById("font-beiruti");

// The paragraph to change (I am assuming its ID is "chapter-text" from our last conversation)
const paragraph = document.getElementById("chapter-text");
const chapterTitle = document.getElementById("chapter-title");
const fontContainer = document.getElementById("font-selector");

// --- Define Action Functions ---

function increaseFontSize() {
  if (!paragraph) return; // Safety check
  const computedStyle = window.getComputedStyle(paragraph);
  let currentSizeNumber = parseFloat(computedStyle.fontSize);
  let newSize = currentSizeNumber + 2;
  paragraph.style.fontSize = newSize + "px";

  // Update the display text
  sizeDisplay.innerText = newSize + "px";
}

function decreaseFontSize() {
  if (!paragraph) return; // Safety check
  const computedStyle = window.getComputedStyle(paragraph);
  let currentSizeNumber = parseFloat(computedStyle.fontSize);
  let newSize = currentSizeNumber - 2;
  paragraph.style.fontSize = newSize + "px";

  // Update the display text
  sizeDisplay.innerText = newSize + "px";
}
function radiusContainer() {
  if (fontContainer) {
    fontContainer.addEventListener("click", (event) => {
      // 4. Find the button that was *actually* clicked
      // "event.target" might be the SVG, so we use .closest()
      // to find the nearest parent <button> element.
      const clickedButton = event.target.closest("button");

      // 5. If the click wasn't on a button, do nothing
      if (!clickedButton) {
        return;
      }

      // 6. Remove 'active' from all buttons INSIDE this container
      const allFontButtons = fontContainer.querySelectorAll("button");
      allFontButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      // 7. Add 'active' to the one that was clicked
      clickedButton.classList.add("active");

      // 8. Apply the font style
      const newFontFamily = window.getComputedStyle(clickedButton).fontFamily;
      if (paragraph) {
        paragraph.style.fontFamily = newFontFamily;
      }
    });
  }
}

/**
 * A general function to change the font family
 * @param {string} fontFamily - The CSS font-family value
 */
function changeFont(fontFamily) {
  if (!paragraph) return; // Safety check
  paragraph.style.fontFamily = fontFamily;
  chapterTitle.style.fontFamily = fontFamily;
}

// --- Attach Event Listeners ---

// Check if the elements exist before adding listeners
if (increaseFontSizeBtn) {
  increaseFontSizeBtn.addEventListener("click", increaseFontSize);
}

if (decreaseFontSizeBtn) {
  decreaseFontSizeBtn.addEventListener("click", decreaseFontSize);
}

// Add listeners for all your font buttons
if (fontAlexandriaBtn) {
  fontAlexandriaBtn.addEventListener("click", () => {
    changeFont("Alexandria, sans-serif");
    radiusContainer();
  });
}

if (fontElMessiriBtn) {
  fontElMessiriBtn.addEventListener("click", () => {
    changeFont("'El Messiri', sans-serif");
    radiusContainer();
  });
}

if (fontPlaypenBtn) {
  fontPlaypenBtn.addEventListener("click", () => {
    // Note: You had a CSS typo 'stylr=' in your HTML for this button
    changeFont("'Playpen Sans Arabic', cursive");
    radiusContainer();
  });
}

if (fontLalezarBtn) {
  fontLalezarBtn.addEventListener("click", () => {
    changeFont("'Lalezar', sans-serif");
    radiusContainer();
  });
}

if (fontBeirutiBtn) {
  fontBeirutiBtn.addEventListener("click", () => {
    changeFont("'Beiruti', sans-serif");
    radiusContainer();
  });
}
