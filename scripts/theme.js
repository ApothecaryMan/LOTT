// --- START OF FILE theme.js ---

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("toggle-theme-btn");
  const body = document.body;
  const themeKey = "theme-preference"; // المفتاح لحفظ الثيم في ذاكرة المتصفح

  // 1. دالة لتطبيق الثيم المحدد
  const applyTheme = (theme) => {
    if (theme === "light") {
      body.classList.add("light-theme");
    } else {
      body.classList.remove("light-theme");
    }
  };

  // 2. عند تحميل الصفحة، تحقق من وجود ثيم محفوظ
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme) {
    applyTheme(savedTheme); // طبق الثيم المحفوظ
  } else {
    // إذا لم يكن هناك ثيم محفوظ، يمكنك تعيين الثيم الداكن كافتراضي
    applyTheme("dark");
  }

  // 3. مستمع لزر تبديل الثيم
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      // تحقق من الثيم الحالي وقم بعكسه
      const isLightTheme = body.classList.contains("light-theme");

      if (isLightTheme) {
        // إذا كان فاتحاً، حوله إلى داكن
        applyTheme("dark");
        localStorage.setItem(themeKey, "dark"); // احفظ الاختيار
      } else {
        // إذا كان داكناً، حوله إلى فاتح
        applyTheme("light");
        localStorage.setItem(themeKey, "light"); // احفظ الاختيار
      }
    });
  } else {
    console.error("Theme toggle button NOT FOUND.");
  }
});
