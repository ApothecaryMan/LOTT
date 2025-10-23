// --- START: Updated theme.js ---

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("toggle-theme-btn");
  const body = document.body;
  const themeKey = "theme-preference";

  const applyTheme = (theme) => {
    if (theme === "light") {
      body.classList.add("light-theme");
    } else {
      body.classList.remove("light-theme");
    }

    // After changing the theme, re-apply the saved color preference.
    // This ensures the custom backgrounds in light mode are correctly applied.
    if (typeof loadColorSetting === "function") {
      // loadColorSetting is now defined in color.js
      loadColorSetting();
    }
  };

  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme) {
    // Apply saved theme, which will also trigger re-applying the color
    applyTheme(savedTheme);
  } else {
    // Apply default theme, which will also trigger applying the default color
    applyTheme("dark");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isLightTheme = body.classList.contains("light-theme");
      const newTheme = isLightTheme ? "dark" : "light";
      localStorage.setItem(themeKey, newTheme); // Save first
      applyTheme(newTheme); // Then apply
    });
  } else {
    console.error("Theme toggle button NOT FOUND.");
  }
});

/////////////////////////////////////////////////////////////////////////////////////
// // --- START: Updated theme.js ---

// document.addEventListener("DOMContentLoaded", () => {
//   const themeToggleBtn = document.getElementById("toggle-theme-btn");
//   const body = document.body;
//   const themeKey = "theme-preference";

//   /**
//    * Resets any dynamic color styles to default.
//    */
//   function resetDynamicColors() {
//     const themeStyleTag = document.getElementById("dynamic-theme-rules");
//     if (themeStyleTag) {
//       themeStyleTag.innerHTML = ""; // Clear all dynamic rules
//     }
//     // Re-apply the accent color for the *current* active button
//     setTimeout(() => {
//       const defaultActive = document.querySelector("#color-selector .active");
//       if (defaultActive && typeof changeTheme === "function") {
//         changeTheme({ target: defaultActive });
//       }
//     }, 50); // Small delay to ensure theme class is applied
//   }

//   const applyTheme = (theme) => {
//     if (theme === "light") {
//       body.classList.add("light-theme");
//     } else {
//       body.classList.remove("light-theme");
//     }
//     // When theme is changed, reset custom backgrounds
//     resetDynamicColors();
//   };

//   const savedTheme = localStorage.getItem(themeKey);
//   if (savedTheme) {
//     applyTheme(savedTheme);
//   } else {
//     applyTheme("dark");
//   }

//   if (themeToggleBtn) {
//     themeToggleBtn.addEventListener("click", () => {
//       const isLightTheme = body.classList.contains("light-theme");
//       const newTheme = isLightTheme ? "dark" : "light";
//       applyTheme(newTheme);
//       localStorage.setItem(themeKey, newTheme);
//     });
//   } else {
//     console.error("Theme toggle button NOT FOUND.");
//   }
// });
// ////////////////////////////////////////////////////////////////////////////////////////////
// // // --- START OF FILE theme.js ---

// // document.addEventListener("DOMContentLoaded", () => {
// //   const themeToggleBtn = document.getElementById("toggle-theme-btn");
// //   const body = document.body;
// //   const themeKey = "theme-preference"; // المفتاح لحفظ الثيم في ذاكرة المتصفح

// //   // 1. دالة لتطبيق الثيم المحدد
// //   const applyTheme = (theme) => {
// //     if (theme === "light") {
// //       body.classList.add("light-theme");
// //     } else {
// //       body.classList.remove("light-theme");
// //     }
// //   };

// //   // 2. عند تحميل الصفحة، تحقق من وجود ثيم محفوظ
// //   const savedTheme = localStorage.getItem(themeKey);
// //   if (savedTheme) {
// //     applyTheme(savedTheme); // طبق الثيم المحفوظ
// //   } else {
// //     // إذا لم يكن هناك ثيم محفوظ، يمكنك تعيين الثيم الداكن كافتراضي
// //     applyTheme("dark");
// //   }

// //   // 3. مستمع لزر تبديل الثيم
// //   if (themeToggleBtn) {
// //     themeToggleBtn.addEventListener("click", () => {
// //       // تحقق من الثيم الحالي وقم بعكسه
// //       const isLightTheme = body.classList.contains("light-theme");

// //       if (isLightTheme) {
// //         // إذا كان فاتحاً، حوله إلى داكن
// //         applyTheme("dark");
// //         localStorage.setItem(themeKey, "dark"); // احفظ الاختيار
// //       } else {
// //         // إذا كان داكناً، حوله إلى فاتح
// //         applyTheme("light");
// //         localStorage.setItem(themeKey, "light"); // احفظ الاختيار
// //       }
// //     });
// //   } else {
// //     console.error("Theme toggle button NOT FOUND.");
// //   }
// // });
