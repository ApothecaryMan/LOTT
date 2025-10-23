// // -نسخه فايبريشن

// // Helper function to trigger vibration if supported
// function triggerVibration(pattern) {
//   if (navigator.vibrate) {
//     navigator.vibrate(pattern);
//   }
// }

// // (The rgbToHsl function remains the same, no changes needed there)
// function rgbToHsl(rgbString) {
//     let [r, g, b] = rgbString.match(/\d+/g).map(Number);
//     r /= 255; g /= 255; b /= 255;
//     const max = Math.max(r, g, b), min = Math.min(r, g, b);
//     let h, s, l = (max + min) / 2;
//     if (max === min) { h = s = 0; } else {
//         const d = max - min;
//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//         switch (max) {
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }
//     return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
// }

// const COLOR_KEY = 'userColorPreference';

// function changeTheme(event, isLongPressActivation = false) {
//     const clickedButton = event.target.closest("button");
//     if (!clickedButton) return;

//     // --- HAPTIC FEEDBACK: ACTIVATION & BOUNCE ---
//     if (!isLongPressActivation) {
//         // Normal click activation
//         triggerVibration(30); // Satisfying "click"
//     }
//     // Bounce animation haptic feedback
//     setTimeout(() => triggerVibration([50, 30, 20]), 50); // Mimics the bounce effect

//     localStorage.setItem(COLOR_KEY, clickedButton.id);

//     const newColor = window.getComputedStyle(clickedButton).backgroundColor;
//     const themeStyleTag = document.getElementById("dynamic-theme-rules");
//     const isLightTheme = document.body.classList.contains("light-theme");

//     document.querySelectorAll("strong").forEach((element) => {
//         element.style.color = newColor;
//     });

//     const colorSelector = document.getElementById("color-selector");
//     colorSelector.querySelectorAll("button").forEach((btn) => {
//         btn.classList.remove("active");
//     });
//     clickedButton.classList.add("active");

//     let dynamicCSS = `/* CSS rules from color.js */`; // (The long CSS string remains the same)
//     // --- The big dynamicCSS string from the previous version goes here ---
//     dynamicCSS = `
//     .next:hover, .next:active, .previous:hover, .previous:active,
//     body.light-theme .next:hover, body.light-theme .next:active,
//     body.light-theme .previous:hover, body.light-theme .previous:active,
//     #increase-font-size:hover, #increase-font-size:active,
//     #decrease-font-size:hover, #decrease-font-size:active,
//     body.light-theme #increase-font-size:hover, body.light-theme #increase-font-size:active,
//     body.light-theme #decrease-font-size:hover, body.light-theme #decrease-font-size:active,
//     #font-selector button:hover, body.light-theme #font-selector button:hover,
//     #list:hover, #list:active, body.light-theme #list:hover, body.light-theme #list:active,
//     .carousel-item#font-selector button.active,
//     body.light-theme .carousel-item#font-selector button.active,
//     .carousel-item button#list.active,
//     body.light-theme .carousel-item button#list.active {
//         background-color: ${newColor};
//     }
//     .next:hover, .next:active, .previous:hover, .previous:active,
//     body.light-theme .next:hover, body.light-theme .next:active,
//     body.light-theme .previous:hover, body.light-theme .previous:active,
//     #increase-font-size:hover, #increase-font-size:active,
//     #decrease-font-size:hover, #decrease-font-size:active,
//     body.light-theme #increase-font-size:hover, body.light-theme #increase-font-size:active,
//     body.light-theme #decrease-font-size:hover, body.light-theme #decrease-font-size:active,
//     #font-selector button:hover, body.light-theme #font-selector button:hover,
//     #list:hover, #list:active, body.light-theme #list:hover, body.light-theme #list:active,
//     .carousel-item#font-selector button.active,
//     body.light-theme .carousel-item#font-selector button.active,
//     .carousel-item button#list.active,
//     body.light-theme .carousel-item button#list.active {
//         color: white;
//     }
//     .next:hover svg, .next:active svg, .previous:hover svg, .previous:active svg,
//     body.light-theme .next:hover svg, body.light-theme .next:active svg,
//     body.light-theme .previous:hover svg, body.light-theme .previous:active svg,
//     #increase-font-size:hover svg, #increase-font-size:active svg,
//     #decrease-font-size:hover svg, #decrease-font-size:active svg,
//     body.light-theme #increase-font-size:hover svg, body.light-theme #increase-font-size:active svg,
//     body.light-theme #decrease-font-size:hover svg, body.light-theme #decrease-font-size:active svg,
//     #list:hover svg, #list:active svg, body.light-theme #list:hover svg, body.light-theme #list:active svg,
//     .carousel-item button#list.active svg,
//     body.light-theme .carousel-item button#list.active svg {
//         fill: white;
//     }
//     .card .card-info { background: linear-gradient(to top, ${newColor}, transparent); }
//     #color-selector button.active { border-color: ${newColor}; box-shadow: 0 0 8px ${newColor}aa; }
//     .zeus { outline: 1px solid ${newColor}; }
//     ::selection { background-color: ${newColor}; color: white; }
//     #chapter-title { color: ${newColor}; }
//     #chapter-list-container h3 { color: ${newColor}; }
//     #chapter-list button:hover, #chapter-list button:focus { border-color: ${newColor}; color: ${newColor}; }
//     #chapter-list button:hover .chapter-number,
//     #chapter-list button:focus .chapter-number,
//     #chapter-list button:hover .chapter-title-in-list,
//     #chapter-list button:focus .chapter-title-in-list {
//        color: ${newColor};
//     }
//     `;

//     if (isLightTheme) {
//         if (clickedButton.id !== "default") {
//             const [h, s, l] = rgbToHsl(newColor);
//             const bodyBgColor = `hsl(${h}, 50%, 88%)`;
//             const containerBgColor = `hsl(${h}, 45%, 97%)`;
//             dynamicCSS += `
//             body.light-theme { background-color: ${bodyBgColor}; }
//             body.light-theme .body { background-color: ${bodyBgColor}; box-shadow: none; }
//             body.light-theme .carousel-wrapper .carousel-nav-btn { background-color: ${bodyBgColor}; }
//             body.light-theme .chaper, body.light-theme .support, body.light-theme .info,
//             body.light-theme .main-header-container, body.light-theme #chapter-list-container {
//                 background-color: ${containerBgColor};
//             }
//             body.light-theme .carousel-item button { background-color: ${containerBgColor}; }
//             body.light-theme .next, body.light-theme .previous { background-color: ${bodyBgColor}; }
//             `;
//         }
//     }

//     themeStyleTag.innerHTML = dynamicCSS;
// }

// function loadColorSetting() {
//     const savedColorId = localStorage.getItem(COLOR_KEY) || 'orange';
//     const buttonToActivate = document.getElementById(savedColorId);
//     if (buttonToActivate) {
//         setTimeout(() => { changeTheme({ target: buttonToActivate }); }, 0);
//     }
// }

// document.addEventListener("DOMContentLoaded", () => {
//     const colorSelector = document.getElementById("color-selector");
//     if (!document.getElementById("dynamic-theme-rules")) {
//         const themeStyleTag = document.createElement("style");
//         themeStyleTag.id = "dynamic-theme-rules";
//         document.head.appendChild(themeStyleTag);
//     }

//     // --- NEW: ADVANCED HAPTICS LOGIC ---
//     let longPressTimer = null;
//     let isLongPress = false;
//     let lastVibratedButton = null;

//     const startPress = (event) => {
//         isLongPress = false;
//         clearTimeout(longPressTimer);
//         longPressTimer = setTimeout(() => {
//             isLongPress = true;
//             // HAPTIC FEEDBACK: LONG PRESS START
//             triggerVibration(75);
//         }, 500); // 500ms for long press
//     };

//     const endPress = (event) => {
//         clearTimeout(longPressTimer);
//         // If it was not a long press, it was a regular click.
//         if (!isLongPress) {
//             changeTheme(event);
//         }
//         isLongPress = false;
//         lastVibratedButton = null;
//     };

//     const movePress = (event) => {
//         if (!isLongPress) return;

//         // Prevent page scroll while dragging on colors
//         event.preventDefault();

//         let currentTarget;
//         if (event.touches) { // For Touch events
//             const touch = event.touches[0];
//             currentTarget = document.elementFromPoint(touch.clientX, touch.clientY);
//         } else { // For Mouse events
//             currentTarget = event.target;
//         }

//         const button = currentTarget ? currentTarget.closest("#color-selector button") : null;

//         if (button && button !== lastVibratedButton) {
//             // HAPTIC FEEDBACK: DRAG/SWIPE OVER A BUTTON
//             triggerVibration(15); // A sharp "tick"
//             changeTheme({ target: button }, true); // Activate color without click vibration
//             lastVibratedButton = button;
//         }
//     };

//     if (colorSelector) {
//         // Use mousedown/touchstart to detect the start of a press
//         colorSelector.addEventListener("mousedown", startPress);
//         colorSelector.addEventListener("touchstart", startPress, { passive: false });

//         // Use mouseup/touchend to detect the end of a press
//         colorSelector.addEventListener("mouseup", endPress);
//         colorSelector.addEventListener("touchend", endPress);

//         // Use mousemove/touchmove to detect dragging
//         colorSelector.addEventListener("mousemove", movePress);
//         colorSelector.addEventListener("touchmove", movePress, { passive: false });

//         // Handle cases where the press is cancelled
//         colorSelector.addEventListener("mouseleave", () => clearTimeout(longPressTimer));
//         colorSelector.addEventListener("touchcancel", () => clearTimeout(longPressTimer));
//     }

//     loadColorSetting();
// });

// document.addEventListener("contentLoaded", () => {
//     const activeColorButton = document.querySelector("#color-selector .active");
//     if (activeColorButton) {
//         changeTheme({ target: activeColorButton });
//     }
// });
/////////////////////////////////////////////////////////////////////////////////////////////////////
// (The rgbToHsl function remains the same, no changes needed there)
function rgbToHsl(rgbString) {
  let [r, g, b] = rgbString.match(/\d+/g).map(Number);
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const COLOR_KEY = "userColorPreference";

function changeTheme(event) {
  const clickedButton = event.target.closest("button");
  if (!clickedButton) return;

  // Save the ID of the clicked color button
  localStorage.setItem(COLOR_KEY, clickedButton.id);

  const newColor = window.getComputedStyle(clickedButton).backgroundColor;
  const themeStyleTag = document.getElementById("dynamic-theme-rules");
  const isLightTheme = document.body.classList.contains("light-theme");

  document.querySelectorAll("strong").forEach((element) => {
    element.style.color = newColor;
  });

  const colorSelector = document.getElementById("color-selector");
  colorSelector.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
  clickedButton.classList.add("active");

  let dynamicCSS = `/* CSS rules generated by color.js */`; // (The long CSS string remains the same)
  // --- The big dynamicCSS string from the previous version goes here ---
  // For brevity, I'm not re-pasting the giant string. Just make sure the logic below is correct.
  dynamicCSS = `
    /* ACCENT COLOR RULES (INTERACTIVE BUTTONS ONLY) */
    .next:hover, .next:active, .previous:hover, .previous:active,
    body.light-theme .next:hover, body.light-theme .next:active,
    body.light-theme .previous:hover, body.light-theme .previous:active,
    #increase-font-size:hover, #increase-font-size:active,
    #decrease-font-size:hover, #decrease-font-size:active,
    body.light-theme #increase-font-size:hover, body.light-theme #increase-font-size:active,
    body.light-theme #decrease-font-size:hover, body.light-theme #decrease-font-size:active,
    #font-selector button:hover, body.light-theme #font-selector button:hover,
    #list:hover, #list:active, body.light-theme #list:hover, body.light-theme #list:active {
        background-color: ${newColor};
    }
    .carousel-item#font-selector button.active,
    body.light-theme .carousel-item#font-selector button.active,
    .carousel-item button#list.active,
    body.light-theme .carousel-item button#list.active {
        background-color: ${newColor};
    }
    .next:hover, .next:active, .previous:hover, .previous:active,
    body.light-theme .next:hover, body.light-theme .next:active,
    body.light-theme .previous:hover, body.light-theme .previous:active,
    #increase-font-size:hover, #increase-font-size:active,
    #decrease-font-size:hover, #decrease-font-size:active,
    body.light-theme #increase-font-size:hover, body.light-theme #increase-font-size:active,
    body.light-theme #decrease-font-size:hover, body.light-theme #decrease-font-size:active,
    #font-selector button:hover, body.light-theme #font-selector button:hover,
    #list:hover, #list:active, body.light-theme #list:hover, body.light-theme #list:active,
    .carousel-item#font-selector button.active,
    body.light-theme .carousel-item#font-selector button.active,
    .carousel-item button#list.active,
    body.light-theme .carousel-item button#list.active {
        color: white;
    }
    .next:hover svg, .next:active svg, .previous:hover svg, .previous:active svg,
    body.light-theme .next:hover svg, body.light-theme .next:active svg,
    body.light-theme .previous:hover svg, body.light-theme .previous:active svg,
    #increase-font-size:hover svg, #increase-font-size:active svg,
    #decrease-font-size:hover svg, #decrease-font-size:active svg,
    body.light-theme #increase-font-size:hover svg, body.light-theme #increase-font-size:active svg,
    body.light-theme #decrease-font-size:hover svg, body.light-theme #decrease-font-size:active svg,
    #list:hover svg, #list:active svg, body.light-theme #list:hover svg, body.light-theme #list:active svg,
    .carousel-item button#list.active svg,
    body.light-theme .carousel-item button#list.active svg {
        fill: white;
    }
    .card .card-info { background: linear-gradient(to top, ${newColor}, transparent); }
    #color-selector button.active { border-color: ${newColor}; box-shadow: 0 0 8px ${newColor}aa; }
    .zeus { outline: 1px solid ${newColor}; }
    ::selection { background-color: ${newColor}; color: white; }
    #chapter-title { color: ${newColor}; }
    #chapter-list-container h3 { color: ${newColor}; }
    #chapter-list button:hover, #chapter-list button:focus { border-color: ${newColor}; color: ${newColor}; }
    #chapter-list button:hover .chapter-number,
    #chapter-list button:focus .chapter-number,
    #chapter-list button:hover .chapter-title-in-list,
    #chapter-list button:focus .chapter-title-in-list {
       color: ${newColor};
    }
    `;

  if (isLightTheme) {
    if (clickedButton.id !== "default") {
      const [h, s, l] = rgbToHsl(newColor);
      const bodyBgColor = `hsl(${h}, 50%, 88%)`;
      const containerBgColor = `hsl(${h}, 45%, 97%)`;
      dynamicCSS += `
            body.light-theme { background-color: ${bodyBgColor}; }
            body.light-theme .body { background-color: ${bodyBgColor}; box-shadow: none; }
            body.light-theme .carousel-wrapper .carousel-nav-btn { background-color: ${bodyBgColor}; }
            body.light-theme .chaper, body.light-theme .support, body.light-theme .info,
            body.light-theme .main-header-container, body.light-theme #chapter-list-container {
                background-color: ${containerBgColor};
            }
            body.light-theme .carousel-item button {
                background-color: ${containerBgColor};
            }
            body.light-theme .next, body.light-theme .previous {
                background-color: ${bodyBgColor};
            }
            `;
    }
  }

  themeStyleTag.innerHTML = dynamicCSS;
}

function loadColorSetting() {
  const savedColorId = localStorage.getItem(COLOR_KEY) || "orange"; // Default to orange
  const buttonToActivate = document.getElementById(savedColorId);
  if (buttonToActivate) {
    // Use a timeout to ensure the DOM is fully ready and other scripts have run
    setTimeout(() => {
      changeTheme({ target: buttonToActivate });
    }, 0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const colorSelector = document.getElementById("color-selector");
  if (!document.getElementById("dynamic-theme-rules")) {
    const themeStyleTag = document.createElement("style");
    themeStyleTag.id = "dynamic-theme-rules";
    document.head.appendChild(themeStyleTag);
  }
  if (colorSelector) {
    colorSelector.addEventListener("click", changeTheme);
  }

  // Load the color setting when the DOM is ready.
  loadColorSetting();
});

// This listener is a fallback for when content is loaded dynamically
document.addEventListener("contentLoaded", () => {
  // The initial load is now handled by DOMContentLoaded,
  // but we can re-apply if needed, especially after theme changes.
  const activeColorButton = document.querySelector("#color-selector .active");
  if (activeColorButton) {
    changeTheme({ target: activeColorButton });
  }
});

///////////////////////////////////////////////////////////////////////////////////////
// // --- 1. تعريف الدالة الرئيسية ---
// // (جعلناها "عالمية" في نطاق الملف ليراها المستمعان)
// function changeTheme(event) {
//   // Find the specific button that was clicked
//   const clickedButton = event.target.closest("button");

//   // If the click was not on a button, do nothing
//   if (!clickedButton) {
//     return;
//   }

//   // --- A. Get the new color ---
//   const newColor = window.getComputedStyle(clickedButton).backgroundColor;
//   const themeStyleTag = document.getElementById("dynamic-theme-rules");

//   // --- B. Update STRONG font color ---
//   const elementsToChange = document.querySelectorAll("strong");
//   elementsToChange.forEach((element) => {
//     element.style.color = newColor;
//   });

//   // --- C. Update .active class on the color picker ---
//   const colorSelector = document.getElementById("color-selector");
//   const allColorButtons = colorSelector.querySelectorAll("button");
//   allColorButtons.forEach((btn) => {
//     btn.classList.remove("active");
//   });
//   clickedButton.classList.add("active");

//   // --- D. Update hover/active for ALL other buttons ---
//   // (لقد أخذت كل تعديلاتك وأصلحت خطأ "card-info" وأضفت "moz-selection")
//   const dynamicCSS = `
//             /* Chapter Prev/Next Buttons */
//             .next:hover,
//             .next:active,
//             .previous:hover,
//             .previous:active,
//             body.light-theme .next:hover,
//             body.light-theme .next:active,
//             body.light-theme .previous:hover,
//             body.light-theme .previous:active {
//                 background-color: ${newColor};
//                 color: white;
//             }

//             .next:hover svg,
//             .next:active svg,
//             .previous:hover svg,
//             .previous:active svg,
//             body.light-theme .next:hover svg,
//             body.light-theme .next:active svg,
//             body.light-theme .previous:hover svg,
//             body.light-theme .previous:active svg {
//                 fill: white;
//             }

//             /* Font-Size Buttons */
//             #increase-font-size:hover,
//             #increase-font-size:active,
//             #decrease-font-size:hover,
//             #decrease-font-size:active {
//                 background-color: ${newColor};
//                 fill: white;
//             }

//             /* Font Selector Buttons (Active state and Hover) */
//             #font-selector button:hover,
//             #font-selector button.active {
//                 background-color: ${newColor};
//                 color: white;
//             }

//             /* (تم إصلاح هذا الخطأ - الكلاس هو "info" فقط) */
//             .card .card-info {
//                 /*background: linear-gradient(to top, ${newColor}, transparent);*/
//                 background-color: ${newColor};

//             }

//             /* Color Selector Active Button (the glowing ring) */
//             #color-selector button.active {
//                 width: 60px;
//                 border-color: ${newColor};
//                 box-shadow: 0 0 8px ${newColor}aa;
//             }

//             /*outline zeus*/
//             .zeus{
//             outline: 1px solid ${newColor};
//             }

//             /* Text Selection Highlight Color */
//             ::selection {
//                 background-color: ${newColor};
//                 color: white;
//             }

//             #chapter-title{
//                 color: ${newColor};
//             }

//             #gear:active{
//                 background-color: ${newColor};
//                 color: white;
//             }

//             #list:hover,
//             #list.active,
//             #list:active{
//                 background-color: ${newColor};
//             }

//             #list:hover svg,
//             #list.active svg,
//             #list:active svg{
//                 fill: white;
//             }

//             body.light-theme h3,
//             #chapter-list-container h3{
//                 color: ${newColor};
//             }

//             #chapter-list button:hover,
//             #chapter-list button:focus {
//                 border-color: ${newColor};
//                 color: white;
//             }

//             #chapter-list button:hover .chapter-number,
//             #chapter-list button:focus .chapter-number,
//             #chapter-list button:hover .chapter-title-in-list,
//             #chapter-list button:focus .chapter-title-in-list {
//                color: white;
//             }
//         `;

//   // Apply the new rules
//   if (themeStyleTag) {
//     themeStyleTag.innerHTML = dynamicCSS;
//   }
// }

// // --- 2. الإعداد عند تحميل الصفحة (DOMContentLoaded) ---
// // (هذا الجزء يعمل فوراً)
// document.addEventListener("DOMContentLoaded", () => {
//   // --- Setup ---
//   const colorSelector = document.getElementById("color-selector");

//   // Create a new <style> tag to hold our dynamic theme rules
//   const themeStyleTag = document.createElement("style");
//   themeStyleTag.id = "dynamic-theme-rules";
//   document.head.appendChild(themeStyleTag);

//   // --- Attach the Click Listener ---
//   // (هذا آمن، لأن الدالة لن تعمل إلا "عند الضغط" - أي بعد تحميل كل شيء)
//   if (colorSelector) {
//     colorSelector.addEventListener("click", changeTheme);
//   }
// });

// // --- 3. تطبيق الثيم الافتراضي (contentLoaded) ---
// // (هذا الجزء "ينتظر" حتى ينتهي "content-loader.js" من تحميل الفصل)
// document.addEventListener("contentLoaded", () => {
//   const colorSelector = document.getElementById("color-selector");

//   // Trigger the function once on load to apply the default active color
//   // (الآن هو آمن، لأن عناصر <strong> موجودة بالفعل في الصفحة)
//   const defaultActive = colorSelector.querySelector(".active");
//   if (defaultActive) {
//     changeTheme({ target: defaultActive });
//   }
// });

//             /* Font Selector Buttons (Active state and Hover) */
//             #font-selector button:hover,
//             #font-selector button.active {
//                 background-color: ${newColor};
//                 color: white;
//             }

//             /* (تم إصلاح هذا الخطأ - الكلاس هو "info" فقط) */
//             .card .card-info {
//                 /*background: linear-gradient(to top, ${newColor}, transparent);*/
//                 background-color: ${newColor};

//             }

//             /* Color Selector Active Button (the glowing ring) */
//             #color-selector button.active {
//                 width: 60px;
//                 border-color: ${newColor};
//                 box-shadow: 0 0 8px ${newColor}aa;
//             }

//             /*outline zeus*/
//             .zeus{
//             outline: 1px solid ${newColor};
//             }

//             /* Text Selection Highlight Color */
//             ::selection {
//                 background-color: ${newColor};
//                 color: white;
//             }

//             #chapter-title{
//                 color: ${newColor};
//             }

//             #gear:active{
//                 background-color: ${newColor};
//                 color: white;
//             }

//             #list:hover,
//             #list.active,
//             #list:active{
//                 background-color: ${newColor};
//             }

//             #list:hover svg,
//             #list.active svg,
//             #list:active svg{
//                 fill: white;
//             }

//             body.light-theme h3,
//             #chapter-list-container h3{
//                 color: ${newColor};
//             }

//             #chapter-list button:hover,
//             #chapter-list button:focus {
//                 border-color: ${newColor};
//                 color: white;
//             }

//             #chapter-list button:hover .chapter-number,
//             #chapter-list button:focus .chapter-number,
//             #chapter-list button:hover .chapter-title-in-list,
//             #chapter-list button:focus .chapter-title-in-list {
//                color: white;
//             }
//         `;

//   // Apply the new rules
//   if (themeStyleTag) {
//     themeStyleTag.innerHTML = dynamicCSS;
//   }
// }

// // --- 2. الإعداد عند تحميل الصفحة (DOMContentLoaded) ---
// // (هذا الجزء يعمل فوراً)
// document.addEventListener("DOMContentLoaded", () => {
//   // --- Setup ---
//   const colorSelector = document.getElementById("color-selector");

//   // Create a new <style> tag to hold our dynamic theme rules
//   const themeStyleTag = document.createElement("style");
//   themeStyleTag.id = "dynamic-theme-rules";
//   document.head.appendChild(themeStyleTag);

//   // --- Attach the Click Listener ---
//   // (هذا آمن، لأن الدالة لن تعمل إلا "عند الضغط" - أي بعد تحميل كل شيء)
//   if (colorSelector) {
//     colorSelector.addEventListener("click", changeTheme);
//   }
// });

// // --- 3. تطبيق الثيم الافتراضي (contentLoaded) ---
// // (هذا الجزء "ينتظر" حتى ينتهي "content-loader.js" من تحميل الفصل)
// document.addEventListener("contentLoaded", () => {
//   const colorSelector = document.getElementById("color-selector");

//   // Trigger the function once on load to apply the default active color
//   // (الآن هو آمن، لأن عناصر <strong> موجودة بالفعل في الصفحة)
//   const defaultActive = colorSelector.querySelector(".active");
//   if (defaultActive) {
//     changeTheme({ target: defaultActive });
//   }
// });
