// --- START OF FILE: scripts/vibration-manager.js (Rebuilt with Pointer Events) ---

document.addEventListener("DOMContentLoaded", () => {
  if (!("vibrate" in navigator)) {
    console.log("Vibration API not supported.");
    return;
  }

  // --- 1. Haptic Patterns Library ---
  // A library of named vibration patterns for consistency.
  const hapticPatterns = {
    press: 15, // A very light, instant tap for press-down feedback.
    confirm: 40, // A solid thump for confirming a successful click.
    bounce: [40, 50, 15], // The complex pattern for the bounce/shake animation.
    dragTick: 10, // An extremely light tick when dragging over an item.
    longPress: 100, // A longer buzz to confirm a long press.
    navigate: [100, 30, 100], // The strong, double-tap for chapter navigation.
    gearTick: 15, // The original crisp tick for the gear.
  };

  // --- 2. Global Vibration Manager ---
  // Expose a clean API to other parts of the application.
  window.vibrationManager = {
    press: () => navigator.vibrate(hapticPatterns.press),
    confirm: () => navigator.vibrate(hapticPatterns.confirm),
    bounce: () => navigator.vibrate(hapticPatterns.bounce),
    dragTick: () => navigator.vibrate(hapticPatterns.dragTick),
    longPress: () => navigator.vibrate(hapticPatterns.longPress),
    navigate: () => navigator.vibrate(hapticPatterns.navigate),
    gearTick: () => navigator.vibrate(hapticPatterns.gearTick),
  };

  // --- 3. Gesture Recognition Logic for Color Selector ---
  function initializeColorSelectorHaptics() {
    const colorSelector = document.getElementById("color-selector");
    if (!colorSelector) return;

    let isPointerDown = false;
    let isDragging = false;
    let longPressTimer = null;
    let startX = 0;
    let lastHoveredButton = null;
    const dragThreshold = 10; // Pixels to move before it's considered a drag

    const onPointerDown = (e) => {
      // Only respond to the primary button (left mouse click, single touch)
      if (e.button !== 0 && e.pointerType === "mouse") return;

      isPointerDown = true;
      isDragging = false;
      startX = e.clientX;

      // HAPTIC 1: Instant "Press Down" feedback
      window.vibrationManager.press();

      longPressTimer = setTimeout(() => {
        window.vibrationManager.longPress();
        isPointerDown = false; // End interaction after long press
      }, 500);
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;

      // Check if it's a drag
      if (!isDragging && Math.abs(e.clientX - startX) > dragThreshold) {
        isDragging = true;
        clearTimeout(longPressTimer); // It's a drag, not a long press
      }

      if (isDragging) {
        const button = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest("button");
        if (
          button &&
          button.parentElement.id === "color-selector" &&
          button !== lastHoveredButton
        ) {
          lastHoveredButton = button;
          // HAPTIC 2: "Drag Tick" feedback
          window.vibrationManager.dragTick();
        }
      }
    };

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      clearTimeout(longPressTimer);

      // HAPTIC 3: "Confirmation" feedback, but only if it was a valid click (not a drag)
      if (!isDragging) {
        window.vibrationManager.confirm();
      }

      isPointerDown = false;
      isDragging = false;
      lastHoveredButton = null;
    };

    // Use modern Pointer Events for unified input
    colorSelector.addEventListener("pointerdown", onPointerDown);
    colorSelector.addEventListener("pointermove", onPointerMove);
    colorSelector.addEventListener("pointerup", onPointerUp);
    colorSelector.addEventListener("pointerleave", onPointerUp); // Treat leaving as pointer up
    colorSelector.addEventListener("pointercancel", onPointerUp); // Handle cancelled events
  }

  initializeColorSelectorHaptics();
});
