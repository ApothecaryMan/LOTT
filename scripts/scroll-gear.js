// --- START: Updated scroll-gear.js with Vibration ---

document.addEventListener("DOMContentLoaded", () => {
  // --- Gear Button Logic ---
  const gear = document.getElementById("gear");
  const paragraphContainer = document.getElementById("chapter-text");
  const chapterTitle = document.getElementById("chapter-title");

  if (!gear) return;

  // --- State Variables ---
  let currentValue = 1;
  let longPressTimer = null;
  const longPressDuration = 1000;
  let isLongPress = false;
  let gearInput = null;
  let tapTimer = null;
  let touchStartY = 0;
  let moved = false;

  // --- Helper Functions ---

  function getMaxChapter() {
    return window.maxChapterNumber || window.totalChapters || 1767;
  }

  function getOrCreateInput() {
    if (!gearInput) {
      gearInput = document.createElement("input");
      gearInput.type = "number";
      gearInput.id = "gear-input";
      gearInput.min = "1";
      gearInput.max = getMaxChapter().toString();
      gearInput.addEventListener("keydown", handleInputKeydown);
      gearInput.addEventListener("blur", confirmInputAndLoad);
      gear.parentNode.insertBefore(gearInput, gear.nextSibling);
    }
    return gearInput;
  }

  function transformToInput() {
    isLongPress = true;
    console.log("Long press detected! Transforming to input.");
    const input = getOrCreateInput();
    input.value = currentValue;
    gear.style.display = "none";
    input.style.display = "inline-block";
    input.focus();
    input.select();
  }

  function handleInputKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmInputAndLoad();
    }
  }

  async function confirmInputAndLoad() {
    const input = getOrCreateInput();
    const chapterToLoad = parseInt(input.value);
    const maxChapter = getMaxChapter();
    input.style.display = "none";
    gear.style.display = "flex";
    if (
      isNaN(chapterToLoad) ||
      chapterToLoad < 1 ||
      chapterToLoad > maxChapter
    ) {
      console.error("Invalid chapter number entered:", input.value);
      gear.textContent = window.currentChapterNumber;
      currentValue = window.currentChapterNumber;
      return;
    }
    currentValue = chapterToLoad;
    gear.textContent = currentValue;
    paragraphContainer.classList.add("is-loading");
    chapterTitle.classList.add("is-loading");
    await new Promise((resolve) => setTimeout(resolve, 300));
    const success = await window.loadChapter(chapterToLoad);
    if (success) {
      window.currentChapterNumber = chapterToLoad;
      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");
      await window.updateButtonVisibility();
    } else {
      console.error(`Failed to load chapter ${chapterToLoad}`);
      currentValue = window.currentChapterNumber;
      gear.textContent = window.currentChapterNumber;
      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");
    }
  }

  // --- Gear Event Handlers (with Vibration added) ---

  function handleTouchStart(event) {
    touchStartY =
      event.touches && event.touches.length > 0
        ? event.touches[0].clientY
        : event.clientY;
    moved = false;
    isLongPress = false;
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(transformToInput, longPressDuration);
  }

  async function handleTapOrClickEnd() {
    clearTimeout(longPressTimer);
    if (isLongPress || moved) {
      moved = false;
      isLongPress = false;
      return;
    }
    clearTimeout(tapTimer);
    tapTimer = setTimeout(async () => {
      const chapterToLoad = parseInt(gear.textContent);
      if (isNaN(chapterToLoad) || chapterToLoad === window.currentChapterNumber)
        return;
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));
      const success = await window.loadChapter(chapterToLoad);
      if (success) {
        window.currentChapterNumber = chapterToLoad;
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
        await window.updateButtonVisibility();
      } else {
        console.error(`Failed to load chapter ${chapterToLoad}`);
        currentValue = window.currentChapterNumber;
        gear.textContent = window.currentChapterNumber;
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
      }
    }, 200);
  }

  function handleMouseLeave() {
    clearTimeout(longPressTimer);
  }

  // --- Add Event Listeners ---
  gear.addEventListener("mousedown", handleTouchStart);
  gear.addEventListener("mouseup", handleTapOrClickEnd);
  gear.addEventListener("mouseleave", handleMouseLeave);
  gear.addEventListener("touchstart", handleTouchStart, { passive: false });
  gear.addEventListener("touchend", handleTapOrClickEnd);
  gear.addEventListener("touchcancel", handleMouseLeave);

  // --- Sync Gear Display ---
  window.updateGearDisplay = (chapterNumber) => {
    currentValue = chapterNumber;
    if (gear) gear.textContent = currentValue;
    if (gearInput && gear) {
      gearInput.style.display = "none";
      gear.style.display = "flex";
    }
  };

  document.addEventListener("contentLoaded", () => {
    if (window.currentChapterNumber) {
      updateGearDisplay(window.currentChapterNumber);
    }
  });
});
