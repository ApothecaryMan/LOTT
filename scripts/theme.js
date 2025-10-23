document.addEventListener("DOMContentLoaded", () => {
  const themeToggleButton = document.getElementById("toggle-theme-btn");
  const body = document.body;

  if (!themeToggleButton) {
    console.error("Theme toggle button not found!");
    return;
  }

  // Icons for the button
  const moonIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M560-80q-83 0-156-31.5T277-197q-54-54-85.5-127T160-480q0-83 31.5-156T277-763q54-54 127-85.5T560-880q35 0 70 7t67 21q12 5 18 15.5t6 21.5q0 9-3.5 17T706-784q-70 55-108 135t-38 169q0 90 37 170t108 134q8 6 11.5 14.5T720-144q0 11-6 21.5T696-107q-32 14-66.5 20.5T560-80Z"/></svg>`;
  const sunIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="24px" fill="#212529">
        <path d="M480-360q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm0 80q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280ZM80-440q-17 0-28.5-11.5T40-480q0-17 11.5-28.5T80-520h80q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440H80Zm720 0q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520h80q17 0 28.5 11.5T920-480q0 17-11.5 28.5T880-440h-80ZM480-760q-17 0-28.5-11.5T440-800v-80q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v80q0 17-11.5 28.5T480-760Zm0 720q-17 0-28.5-11.5T440-80v-80q0-17 11.5-28.5T480-200q17 0 28.5 11.5T520-160v80q0 17-11.5 28.5T480-40ZM226-678l-56-56q-11-11-11-28t11-28q11-11 28-11t28 11l56 56q11 11 11 28t-11 28q-11 11-28 11t-28-11Zm494 494-56-56q-11-11-11-28t11-28q11-11 28-11t28 11l56 56q11 11 11 28t-11 28q-11 11-28 11t-28-11Zm-56-494q-11-11-11-28t11-28l56-56q11-11 28-11t28 11q11 11 11 28t-11 28l-56 56q-11 11-28 11t-28-11Zm-494 494q-11-11-11-28t11-28l56-56q11-11 28-11t28 11q11 11 11 28t-11 28l-56 56q-11 11-28 11t-28-11Z"/>
    </svg>`;

  // Function to apply the theme and update the icon
  const applyTheme = (theme) => {
    if (theme === "light") {
      body.classList.add("light-mode");
      themeToggleButton.innerHTML = moonIcon; // Show moon icon to switch back to dark
    } else {
      body.classList.remove("light-mode");
      themeToggleButton.innerHTML = sunIcon; // Show sun icon to switch to light
    }
    // Save the user's preference to local storage
    localStorage.setItem("theme", theme);
  };

  // On page load, check for a saved theme preference
  const savedTheme = localStorage.getItem("theme") || "dark"; // Default to dark mode
  applyTheme(savedTheme);

  // Add the click event listener to toggle the theme
  themeToggleButton.addEventListener("click", () => {
    // Check current theme by looking for the class on the body
    const currentTheme = body.classList.contains("light-mode")
      ? "light"
      : "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
  });
});
