// --- START OF FILE: scripts/vibration-manager.js (Updated) ---

document.addEventListener("DOMContentLoaded", () => {
  if (!("vibrate" in navigator)) {
    console.log("Vibration API not supported.");
    return;
  }

  // --- 1. Haptic Patterns Library ---
  const hapticPatterns = {
    // General UI Actions
    press: 15, // A very light, instant tap for press-down feedback.
    confirm: 40, // A solid thump for confirming a successful click.
    bounce: [40, 50, 15], // The complex pattern for the bounce/shake animation.

    // Color Selector Specific
    dragTick: 10, // An extremely light tick when dragging over an item.
    longPress: 100, // A longer buzz to confirm a long press.

    // Chapter List Specific (NEW)
    listOpen: [10, 40, 60], // A ramping up, "unlocking" feeling for opening the list.
    listClose: 50, // A solid "thump" for closing the list, similar to confirm.

    // Navigation
    navigate: [100, 30, 100], // The strong, double-tap for chapter navigation.
    gearTick: 15, // The original crisp tick for the gear.
  };

  // --- 2. Global Vibration Manager ---
  window.vibrationManager = {
    press: () => navigator.vibrate(hapticPatterns.press),
    confirm: () => navigator.vibrate(hapticPatterns.confirm),
    bounce: () => navigator.vibrate(hapticPatterns.bounce),
    dragTick: () => navigator.vibrate(hapticPatterns.dragTick),
    longPress: () => navigator.vibrate(hapticPatterns.longPress),
    listOpen: () => navigator.vibrate(hapticPatterns.listOpen), // NEW
    listClose: () => navigator.vibrate(hapticPatterns.listClose), // NEW
    navigate: () => navigator.vibrate(hapticPatterns.navigate),
    gearTick: () => navigator.vibrate(hapticPatterns.gearTick),
  };

  // --- 3. Gesture Recognition Logic for Color Selector ---
  // (This part remains the same, no changes needed here)
  function initializeColorSelectorHaptics() {
    const colorSelector = document.getElementById("color-selector");
    if (!colorSelector) return;
    let isPointerDown = false,
      isDragging = false,
      longPressTimer = null,
      startX = 0,
      lastHoveredButton = null;
    const dragThreshold = 10;
    const onPointerDown = (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isPointerDown = true;
      isDragging = false;
      startX = e.clientX;
      window.vibrationManager.press();
      longPressTimer = setTimeout(() => {
        window.vibrationManager.longPress();
        isPointerDown = false;
      }, 500);
    };
    const onPointerMove = (e) => {
      if (!isPointerDown) return;
      if (!isDragging && Math.abs(e.clientX - startX) > dragThreshold) {
        isDragging = true;
        clearTimeout(longPressTimer);
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
          window.vibrationManager.dragTick();
        }
      }
    };
    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      clearTimeout(longPressTimer);
      if (!isDragging) {
        window.vibrationManager.confirm();
      }
      isPointerDown = false;
      isDragging = false;
      lastHoveredButton = null;
    };
    colorSelector.addEventListener("pointerdown", onPointerDown);
    colorSelector.addEventListener("pointermove", onPointerMove);
    colorSelector.addEventListener("pointerup", onPointerUp);
    colorSelector.addEventListener("pointerleave", onPointerUp);
    colorSelector.addEventListener("pointercancel", onPointerUp);
  }

  initializeColorSelectorHaptics();
});

// document.addEventListener("DOMContentLoaded", () => {
//   if (!("vibrate" in navigator)) {
//     console.log("Vibration API not supported.");
//     return;
//   }

//   // --- 1. Haptic Patterns Library ---
//   const hapticPatterns = {
//     // General UI Actions
//     press: 15, // A very light, instant tap for press-down feedback.
//     confirm: 40, // A solid thump for confirming a successful click.
//     bounce: [40, 50, 15], // The complex pattern for the bounce/shake animation.

//     // Color Selector Specific
//     dragTick: 10, // An extremely light tick when dragging over an item.
//     longPress: 100, // A longer buzz to confirm a long press.

//     // Chapter List Specific (NEW)
//     listOpen: [10, 40, 60], // A ramping up, "unlocking" feeling for opening the list.
//     listClose: 50, // A solid "thump" for closing the list, similar to confirm.

//     // Navigation
//     navigate: [100, 30, 100], // The strong, double-tap for chapter navigation.
//     gearTick: 15, // The original crisp tick for the gear.
//   };

//   // --- 2. Global Vibration Manager ---
//   window.vibrationManager = {
//     press: () => navigator.vibrate(hapticPatterns.press),
//     confirm: () => navigator.vibrate(hapticPatterns.confirm),
//     bounce: () => navigator.vibrate(hapticPatterns.bounce),
//     dragTick: () => navigator.vibrate(hapticPatterns.dragTick),
//     longPress: () => navigator.vibrate(hapticPatterns.longPress),
//     listOpen: () => navigator.vibrate(hapticPatterns.listOpen), // NEW
//     listClose: () => navigator.vibrate(hapticPatterns.listClose), // NEW
//     navigate: () => navigator.vibrate(hapticPatterns.navigate),
//     gearTick: () => navigator.vibrate(hapticPatterns.gearTick),
//   };

//   // --- 3. Gesture Recognition Logic for Color Selector ---
//   // (This part remains the same, no changes needed here)
//   function initializeColorSelectorHaptics() {
//     const colorSelector = document.getElementById("color-selector");
//     if (!colorSelector) return;
//     let isPointerDown = false,
//       isDragging = false,
//       longPressTimer = null,
//       startX = 0,
//       lastHoveredButton = null;
//     const dragThreshold = 10;
//     const onPointerDown = (e) => {
//       if (e.button !== 0 && e.pointerType === "mouse") return;
//       isPointerDown = true;
//       isDragging = false;
//       startX = e.clientX;
//       window.vibrationManager.press();
//       longPressTimer = setTimeout(() => {
//         window.vibrationManager.longPress();
//         isPointerDown = false;
//       }, 500);
//     };
//     const onPointerMove = (e) => {
//       if (!isPointerDown) return;
//       if (!isDragging && Math.abs(e.clientX - startX) > dragThreshold) {
//         isDragging = true;
//         clearTimeout(longPressTimer);
//       }
//       if (isDragging) {
//         const button = document
//           .elementFromPoint(e.clientX, e.clientY)
//           ?.closest("button");
//         if (
//           button &&
//           button.parentElement.id === "color-selector" &&
//           button !== lastHoveredButton
//         ) {
//           lastHoveredButton = button;
//           window.vibrationManager.dragTick();
//         }
//       }
//     };
//     const onPointerUp = (e) => {
//       if (!isPointerDown) return;
//       clearTimeout(longPressTimer);
//       if (!isDragging) {
//         window.vibrationManager.confirm();
//       }
//       isPointerDown = false;
//       isDragging = false;
//       lastHoveredButton = null;
//     };
//     colorSelector.addEventListener("pointerdown", onPointerDown);
//     colorSelector.addEventListener("pointermove", onPointerMove);
//     colorSelector.addEventListener("pointerup", onPointerUp);
//     colorSelector.addEventListener("pointerleave", onPointerUp);
//     colorSelector.addEventListener("pointercancel", onPointerUp);
//   }

//   initializeColorSelectorHaptics();
// });
