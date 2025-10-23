document.addEventListener("DOMContentLoaded", () => {
  // --- Gear Button Logic ---
  const gear = document.getElementById("gear");
  const paragraphContainer = document.getElementById("chapter-text");
  const chapterTitle = document.getElementById("chapter-title");

  // Check if gear button exists
  if (!gear) {
    return;
  }

  // --- State Variables ---
  let currentValue = 1;
  let longPressTimer = null;
  const longPressDuration = 2000;
  let isLongPress = false;
  let gearInput = null;
  let tapTimer = null;
  // --- Touch/Mouse Handling Variables ---
  let touchStartY = 0;
  let moved = false;

  // --- Helper Functions ---

  /** Gets the maximum chapter number from window object */
  function getMaxChapter() {
    return window.maxChapterNumber || window.totalChapters || 1767;
  }

  /** Creates or gets the input element */
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

  /** Switches the view from button to input field */
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

  /** Handles Enter key press in the input */
  function handleInputKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmInputAndLoad();
    }
  }

  /** Hides input, shows button, updates value, and loads chapter */
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

  // --- Gear Event Handlers ---

  /** Handles mouse wheel scrolling - stops at limits */
  function handleGearScroll(event) {
    event.preventDefault();
    const maxChapter = getMaxChapter();

    if (event.deltaY < 0) {
      // Scrolling UP - Increment but stop at max
      if (currentValue < maxChapter) {
        currentValue++;
        gear.textContent = currentValue;
      }
    } else {
      // Scrolling DOWN - Decrement but stop at 1
      if (currentValue > 1) {
        currentValue--;
        gear.textContent = currentValue;
      }
    }
  }

  /** Records touch start position and starts long press timer */
  function handleTouchStart(event) {
    if (event.touches && event.touches.length > 0) {
      touchStartY = event.touches[0].clientY;
    } else {
      touchStartY = event.clientY;
    }
    moved = false;
    isLongPress = false;
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(transformToInput, longPressDuration);
  }

  /** Handles touch movement - stops at limits */
  function handleTouchMove(event) {
    event.preventDefault();
    clearTimeout(longPressTimer);

    const currentY = event.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    const maxChapter = getMaxChapter();

    if (Math.abs(deltaY) > 5) {
      moved = true;
    }

    if (deltaY < -10) {
      // Swiping UP - Increment but stop at max
      if (currentValue < maxChapter) {
        currentValue++;
        gear.textContent = currentValue;
        touchStartY = currentY;
      }
    } else if (deltaY > 10) {
      // Swiping DOWN - Decrement but stop at 1
      if (currentValue > 1) {
        currentValue--;
        gear.textContent = currentValue;
        touchStartY = currentY;
      }
    }
  }

  /** Handles click or tap end, clears timers, triggers load if not long press/swipe */
  async function handleTapOrClickEnd() {
    clearTimeout(longPressTimer); // Clear long press timer

    // If it was a long press or a swipe, do nothing more
    if (isLongPress || moved) {
      moved = false;
      isLongPress = false;
      return;
    }

    // --- ADD DELAY FOR TAP ---
    clearTimeout(tapTimer); // Clear previous tap timer if any
    tapTimer = setTimeout(async () => {
      // Start a short timer (e.g., 200ms)
      // This code runs ONLY if no other action (like scroll) cancels it

      const chapterToLoad = parseInt(gear.textContent);
      if (isNaN(chapterToLoad)) return;

      // --- Chapter Loading Logic ---
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      // Scroll happens before loading now
      chapterTitle.scrollIntoView({ behavior: "auto", block: "start" });
      await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for fade

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
        await window.updateButtonVisibility();
      }
    }, 200); // <-- مدة الانتظار (150ms), يمكنك تعديلها
    // --- END TAP DELAY ---
  }

  /** Clears timer if mouse leaves the button */
  function handleMouseLeave() {
    clearTimeout(longPressTimer);
  }

  // --- Add Event Listeners ---
  gear.addEventListener("wheel", handleGearScroll);
  gear.addEventListener("mousedown", handleTouchStart);
  gear.addEventListener("mouseup", handleTapOrClickEnd);
  gear.addEventListener("mouseleave", handleMouseLeave);
  gear.addEventListener("touchstart", handleTouchStart, { passive: false });
  gear.addEventListener("touchmove", handleTouchMove, { passive: false });
  gear.addEventListener("touchend", handleTapOrClickEnd);
  gear.addEventListener("touchcancel", handleMouseLeave);

  // --- Sync Gear Display ---
  window.updateGearDisplay = (chapterNumber) => {
    currentValue = chapterNumber;
    if (gear) {
      gear.textContent = currentValue;
    }
    if (gearInput && gear) {
      gearInput.style.display = "none";
      gear.style.display = "flex";
    }
  };

  // Initial sync after the first chapter loads
  document.addEventListener("contentLoaded", () => {
    if (window.currentChapterNumber) {
      updateGearDisplay(window.currentChapterNumber);
    }
  });
});
