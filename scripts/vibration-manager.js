// --- START OF FILE: scripts/vibration-manager.js ---

/**
 * Manages all haptic feedback (vibration) for the application.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Exit immediately if the Vibration API is not supported
  if (!("vibrate" in navigator)) {
    console.log("Vibration API not supported on this browser.");
    return;
  }

  // --- 1. Core Vibration Functions ---

  function triggerVibration(pattern) {
    navigator.vibrate(pattern);
  }

  // Define vibration patterns as globally accessible functions
  window.vibrationManager = {
    confirm: () => triggerVibration(50), // A solid "thump" for confirmation
    tick: () => triggerVibration(10), // A very light "tick" for dragging
    longPress: () => triggerVibration(100), // A longer buzz for long press
    bounce: () => triggerVibration([40, 50, 15]), // Strong -> pause -> weak, for bounce effect
    gearTick: () => triggerVibration(15), // A crisp tick for the gear scroll
  };

  // --- 2. Event Listeners for Specific Elements ---

  /**
   * Initializes advanced haptics (drag, long-press) for the color selector.
   */
  function initializeColorSelectorHaptics() {
    const colorSelector = document.getElementById("color-selector");
    if (!colorSelector) return;

    let isMouseDown = false;
    let longPressTimer = null;
    let lastHoveredButton = null;

    const handlePointerDown = () => {
      isMouseDown = true;
      longPressTimer = setTimeout(() => {
        if (window.vibrationManager) window.vibrationManager.longPress();
        isMouseDown = false;
      }, 500);
    };

    const handlePointerMove = (e) => {
      if (!isMouseDown) return;
      clearTimeout(longPressTimer);

      const target =
        e.type === "touchmove"
          ? document.elementFromPoint(
              e.touches[0].clientX,
              e.touches[0].clientY
            )
          : e.target;
      const button = target ? target.closest("button") : null;

      if (
        button &&
        button.parentElement.id === "color-selector" &&
        button !== lastHoveredButton
      ) {
        lastHoveredButton = button;
        if (window.vibrationManager) window.vibrationManager.tick();
      }
    };

    const handlePointerUp = () => {
      clearTimeout(longPressTimer);
      isMouseDown = false;
      lastHoveredButton = null;
    };

    colorSelector.addEventListener("mousedown", handlePointerDown);
    colorSelector.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    colorSelector.addEventListener("mouseleave", handlePointerUp);

    colorSelector.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    colorSelector.addEventListener("touchmove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("touchend", handlePointerUp);
  }

  // Initialize the listeners
  initializeColorSelectorHaptics();
});
