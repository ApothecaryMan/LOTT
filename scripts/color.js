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

  // document.querySelectorAll("strong").forEach((element) => {
  //   element.style.color = newColor;
  // });

  const colorSelector = document.getElementById("color-selector");
  colorSelector.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active");
  });
  clickedButton.classList.add("active");

  let dynamicCSS = `
    /* ACCENT COLOR RULES (INTERACTIVE BUTTONS ONLY) */
    #increase-font-size:hover, #increase-font-size:active,
    #decrease-font-size:hover, #decrease-font-size:active,
    body.light-theme #increase-font-size:hover, body.light-theme #increase-font-size:active,
    body.light-theme #decrease-font-size:hover, body.light-theme #decrease-font-size:active,
    #font-selector button:hover, body.light-theme #font-selector button:hover,
    #align-formate button:hover, body.light-theme #align-formate button:hover,
    #list:hover, #list:active, body.light-theme #list:hover, body.light-theme #list:active, #comments-btn:hover, #comments-btn:active,#comments-btn.active,
    .auth-submit-btn, .auth-prompt-btn, .edit-submit-btn, .comment-submit-btn, .reply-submit-btn {
        background-color: ${newColor};
    }
    .carousel-item#font-selector button.active,
    body.light-theme .carousel-item#font-selector button.active,
    .carousel-item#align-formate button.active,
    body.light-theme .carousel-item#align-formate button.active,
    .carousel-item button#list.active,
    body.light-theme .carousel-item button#list.active,body.light-theme #comments-btn:hover {
        background-color: ${newColor};
    }
    #increase-font-size:hover, #increase-font-size:active,
    #decrease-font-size:hover, #decrease-font-size:active,
    body.light-theme #increase-font-size:hover, body.light-theme #increase-font-size:active,
    body.light-theme #decrease-font-size:hover, body.light-theme #decrease-font-size:active,
    #font-selector button:hover, body.light-theme #font-selector button:hover,
    #align-formate button:hover, body.light-theme #align-formate button:hover,
    #list:hover, #list:active, body.light-theme #list:hover, body.light-theme #list:active,
    .carousel-item#font-selector button.active,
    body.light-theme .carousel-item#font-selector button.active,
    .carousel-item#align-formate button.active,
    body.light-theme .carousel-item#align-formate button.active,
    .carousel-item button#list.active,
    body.light-theme .carousel-item button#list.active 
    {
        color: white;
    }
    #increase-font-size:hover svg, #increase-font-size:active svg,
    #decrease-font-size:hover svg, #decrease-font-size:active svg,
    body.light-theme #increase-font-size:hover svg, body.light-theme #increase-font-size:active svg,
    body.light-theme #decrease-font-size:hover svg, body.light-theme #decrease-font-size:active svg,
    #list:hover svg, #list:active svg, body.light-theme #list:hover svg, body.light-theme #list:active svg,
    #align-formate button:hover svg, body.light-theme #align-formate button:hover svg,
    .carousel-item#align-formate button.active svg,
    body.light-theme .carousel-item#align-formate button.active svg,
    .carousel-item button#list.active svg,
    body.light-theme .carousel-item button#list.active svg,body.light-theme #comments-btn.active svg, #comments-btn:hover svg
    {
        fill: white;
    }
    #color-selector button.active { border-color: ${newColor}; box-shadow: 0 0 8px ${newColor}aa; }
    .zeus { outline: 1px solid ${newColor}; }
    ::selection { background-color: ${newColor}; color: white; }
    #chapter-title { color: ${newColor}; }
    #chapter-list-container h3 { color: ${newColor}; }
    .chapter-item .chapter-number { color: ${newColor}; }
    #chapter-list button:hover, #chapter-list button:focus { border-color: ${newColor}; color: ${newColor}; }
    #chapter-list button:hover .chapter-number,
    #chapter-list button:focus .chapter-number,
    #chapter-list button:hover .chapter-title-in-list,
    #chapter-list button:focus .chapter-title-in-list, .comment-author, body.light-theme .auth-modal-content h3, body.light-theme .auth-modal-close,
    h2
     {
       color: ${newColor};
    }
    .like-btn.liked svg { fill: ${newColor}; }
    .author-image{ outline: 2px solid ${newColor}; }
    .toggle-replies-btn { color: ${newColor}; }
    .toggle-replies-btn svg { fill: ${newColor}; }
    .toggle-replies-btn:hover, .reply-btn:hover { background-color: ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.1)")}; }
    .comment-textarea:focus, .reply-textarea:focus, .edit-textarea:focus { border-color: ${newColor}; }
    .auth-tab.active { color: ${newColor}; }
    .auth-tab.active::after { background-color: ${newColor}; }
    .form-group input:focus { border-color: ${newColor}; }
    .sort-by-btn .current-sort-value { color: ${newColor}; }
    .sort-option:hover { background-color: ${newColor}; color: #0f0f0f; }
    .sort-option.active { background-color: ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.2)")}; }
      body.light-theme .card{ background-color: ${newColor
        .replace("rgb", "rgba")
        .replace(")", ", 0.8)")}; }
      .spinner{
        border-top-color: ${newColor};           
      }
    `;

  if (isLightTheme) {
    // =================================================================
    // قسم الثيم الفاتح
    // =================================================================
    if (clickedButton.id !== "default") {
      const [h, s, l] = rgbToHsl(newColor);
      const safeS = s < 10 ? 0 : 50;
      // القيم الأصلية التي كانت لديك
      const bodyBgColor = `hsl(${h}, ${safeS}%, 88%)`;
      const containerBgColor = `hsl(${h}, ${safeS - 5}%, 97%)`;
      const hoverBgColor = `hsl(${h}, ${safeS - 5}%, 92%)`; // Lighter hover for light theme

      dynamicCSS += `
            body.light-theme { background-color: ${bodyBgColor}; }
            body.light-theme .body { background-color: ${bodyBgColor}; box-shadow: none; }
            body.light-theme .carousel-wrapper .carousel-nav-btn { background-color: ${bodyBgColor}; }
            body.light-theme .chapter, body.light-theme #info-wrapper,body.light-theme .main-header-container, 
            body.light-theme #chapter-list-container, body.light-theme #comments-panel, 
            body.light-theme .auth-modal-content, body.light-theme input, body.light-theme .auth-modal-close:hover {
                background-color: ${containerBgColor};
            }
            body.light-theme .carousel-item button, 
            body.light-theme .chapter-item { background-color: ${containerBgColor}; }
            body.light-theme .chapter-item:hover { background-color: ${hoverBgColor}; }
            body.light-theme .novel-title { color: #333; }
            body.light-theme .chapter-title-in-list, body.light-theme .dash { color: #555; }
             body.light-theme .auth-modal-content{
             background-color: ${bodyBgColor}}
            .spinner{
              border: 4px solid ${containerBgColor}; 
              border-top-color: ${newColor};         
            }
            `;
    }
  } else {
    // =================================================================
    //قسم الثيم الداكن ح
    // =================================================================
    if (clickedButton.id !== "default") {
      const [h, s, l] = rgbToHsl(newColor);
      const safeS = s < 20 ? s / 2 : 20;
      const bodyBgColor = `hsl(${h}, ${safeS}%, 10%)`;
      const containerBgColor = `hsl(${h}, ${safeS}%, 15%)`;
      const hoverBgColor = `hsl(${h}, ${safeS}%, 20%)`; // Lighter hover for dark theme

      dynamicCSS += `
            body { background-color: ${bodyBgColor}; }
            .body, .carousel-wrapper .carousel-nav-btn { background-color: ${bodyBgColor}; }
            .chapter, #info-wrapper , .main-header-container, #chapter-list-container, 
            #comments-panel, .auth-modal-content, .chapter-item {
                background-color: ${containerBgColor};
            }
            .chapter-item:hover { background-color: ${hoverBgColor}; }
            .novel-title { color: #e0e0e0; }
            .chapter-title-in-list, .dash { color: #b0b0b0; }
            .spinner{
              border: 4px solid ${containerBgColor}; 
              border-top-color: ${newColor};         
            }
            `;
    }
  }

  themeStyleTag.innerHTML = dynamicCSS;
}

function loadColorSetting() {
  const savedColorId = localStorage.getItem(COLOR_KEY) || "gray"; //default color
  const savedCustomColor = localStorage.getItem(
    "userCustomColorPreferenceValue"
  );

  const buttonToActivate = document.getElementById(savedColorId);
  if (buttonToActivate) {
    if (savedColorId === "custom-color-btn" && savedCustomColor) {
      buttonToActivate.style.background = savedCustomColor;
    }
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

  const customColorBtn = document.getElementById("custom-color-btn");
  const colorPicker = document.getElementById("color-picker");

  if (customColorBtn && colorPicker) {
    customColorBtn.addEventListener("click", (event) => {
      // Prevent changeTheme from firing on the button click itself
      if (event.target.closest("button").id === "custom-color-btn") {
        event.stopPropagation();
        colorPicker.click();
      }
    });

    colorPicker.addEventListener("input", (event) => {
      const hexColor = event.target.value;
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const rgbColor = `rgb(${r}, ${g}, ${b})`;

      customColorBtn.style.background = rgbColor;
      localStorage.setItem("userCustomColorPreferenceValue", rgbColor);
      // Manually trigger the theme change now
      changeTheme({ target: customColorBtn });
    });
  }

  loadColorSetting();
});

document.addEventListener("contentLoaded", () => {
  const activeColorButton = document.querySelector("#color-selector .active");
  if (activeColorButton) {
    changeTheme({ target: activeColorButton });
  }
});
