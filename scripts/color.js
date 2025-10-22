// Wait for the HTML page to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Setup ---
  const colorSelector = document.getElementById("color-selector");

  // Create a new <style> tag to hold our dynamic theme rules
  const themeStyleTag = document.createElement("style");
  themeStyleTag.id = "dynamic-theme-rules";
  document.head.appendChild(themeStyleTag);

  // --- 2. The Main Function ---
  function changeTheme(event) {
    // Find the specific button that was clicked
    const clickedButton = event.target.closest("button");

    // If the click was not on a button, do nothing
    if (!clickedButton) {
      return;
    }

    // --- A. Get the new color ---
    const newColor = window.getComputedStyle(clickedButton).backgroundColor;

    // --- B. Update H1 and STRONG font color ---
    const elementsToChange = document.querySelectorAll("h1, strong");
    elementsToChange.forEach((element) => {
      element.style.color = newColor;
    });

    // --- C. Update .active class on the color picker ---
    const allColorButtons = colorSelector.querySelectorAll("button");
    allColorButtons.forEach((btn) => {
      btn.classList.remove("active");
    });
    clickedButton.classList.add("active");

    // --- D. Update hover/active for ALL other buttons ---
    // We do this by writing CSS rules into our new <style> tag.
    const dynamicCSS = `
            /* Header Search Button */
            .search-btn:hover,
            .search-btn:active {
                background-color: ${newColor};
            }

            /* Header Nav Buttons */
            .main-nav li:hover,
            .main-nav li:active {
                background-color: ${newColor};
            }

            /* Chapter Prev/Next Buttons */
            .next:hover,
            .next:active,
            .previous:hover,
            .previous:active {
                background-color: ${newColor};
                color: white; /* Change text color */
            }
            .next:hover svg,
            .next:active svg,
            .previous:hover svg,
            .previous:active svg {
                fill: white; /* Change SVG icon color */
            }

            /* Font-Size Buttons */
            #increase-font-size:hover,
            #increase-font-size:active,
            #decrease-font-size:hover,
            #decrease-font-size:active {
                background-color: ${newColor};
                fill: white; /* Change the SVG color */
            }
            
            /* Font Selector Buttons (Active state and Hover) */
            #font-selector button:hover,
            #font-selector button.active {
                background-color: ${newColor};
                color: white; /* Make text readable on dark color */
            }

            
            
            /* Card Info Gradient (the "shadow") */
            .card .card-info {
                background: linear-gradient(to top, ${newColor}, transparent);
            }
            
            /* --- UPDATED THIS RULE --- */
            /* Color Selector Active Button (the glowing ring) */
            #color-selector button.active {
                width: 60px; /* <-- ADDED THIS LINE */
                border-color: ${newColor};
                /* 'aa' at the end adds 66% transparency */
                box-shadow: 0 0 8px ${newColor}aa;
            }

            /*outline zeus*/
            .zeus{
            outline: 1px solid ${newColor};
            }    
            
            /* Text Selection Highlight Color */
            ::selection {
                background-color: ${newColor};
                color: white;
            }
        `;

    // Apply the new rules
    themeStyleTag.innerHTML = dynamicCSS;
  }

  // --- 3. Attach the Listener ---
  // Add ONE click listener to the parent container
  if (colorSelector) {
    colorSelector.addEventListener("click", changeTheme);

    // Optional: Trigger the function once on load
    // to apply the default active color
    const defaultActive = colorSelector.querySelector(".active");
    if (defaultActive) {
      changeTheme({ target: defaultActive });
    }
  }
});
