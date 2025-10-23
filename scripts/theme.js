// --- START: Updated theme.js ---

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("toggle-theme-btn");
  const body = document.body;
  const themeKey = "theme-preference";

  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M576-96q-78.72 0-148.8-30.24-70.08-30.24-122.4-82.56-52.32-52.32-82.56-122.4Q192-401.28 192-480q0-79.68 30.24-149.28T304.8-751.2q52.32-52.32 122.4-82.56Q497.28-864 576-864q51.23 0 99.62 12.5Q724-839 768-812.67 680-759 628-671q-52 88-52 191t52 191q52 88 140 141.67-44 26.33-92.38 38.83Q627.23-96 576-96Z"/></svg>`;
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M479.77-288Q400-288 344-344.23q-56-56.22-56-136Q288-560 344.23-616q56.22-56 136-56Q560-672 616-615.77q56 56.22 56 136Q672-400 615.77-344q-56.22 56-136 56ZM216-444H48v-72h168v72Zm696 0H744v-72h168v72ZM444-744v-168h72v168h-72Zm0 696v-168h72v168h-72ZM269-642 166-742l51-55 102 104-50 51Zm474 475L642-268l49-51 103 101-51 51ZM640-691l102-101 51 49-100 103-53-51ZM163-217l105-99 49 47-98 104-56-52Z"/></svg>`;

  const applyTheme = (theme) => {
    if (theme === "light") {
      body.classList.add("light-theme");
      themeToggleBtn.innerHTML = sunIcon;
      themeToggleBtn.classList.add("active");
    } else {
      body.classList.remove("light-theme");
      themeToggleBtn.innerHTML = moonIcon;
      themeToggleBtn.classList.remove("active");
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
