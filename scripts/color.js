// --- 1. تعريف الدالة الرئيسية ---
// (جعلناها "عالمية" في نطاق الملف ليراها المستمعان)
function changeTheme(event) {
  // Find the specific button that was clicked
  const clickedButton = event.target.closest("button");

  // If the click was not on a button, do nothing
  if (!clickedButton) {
    return;
  }

  // --- A. Get the new color ---
  const newColor = window.getComputedStyle(clickedButton).backgroundColor;
  const themeStyleTag = document.getElementById("dynamic-theme-rules");

  // --- B. Update STRONG font color ---
  // (هذا هو تعديلك الصحيح)
  const elementsToChange = document.querySelectorAll("strong");
  elementsToChange.forEach((element) => {
    element.style.color = newColor;
  });

  // --- C. Update .active class on the color picker ---
  const colorSelector = document.getElementById("color-selector");
  const allColorButtons = colorSelector.querySelectorAll("button");
  allColorButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  clickedButton.classList.add("active");

  // --- D. Update hover/active for ALL other buttons ---
  // (لقد أخذت كل تعديلاتك وأصلحت خطأ "card-info" وأضفت "moz-selection")
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
                color: white;
            }
            .next:hover svg,
            .next:active svg,
            .previous:hover svg,
            .previous:active svg {
                fill: white;
            }

            /* Font-Size Buttons */
            #increase-font-size:hover,
            #increase-font-size:active,
            #decrease-font-size:hover,
            #decrease-font-size:active {
                background-color: ${newColor};
                fill: white;
            }
            
            /* Font Selector Buttons (Active state and Hover) */
            #font-selector button:hover,
            #font-selector button.active {
                background-color: ${newColor};
                color: white;
            }
            
            
            /* (تم إصلاح هذا الخطأ - الكلاس هو "info" فقط) */
            .card .card-info {
                background: linear-gradient(to top, ${newColor}, transparent);
            }
            
            /* Color Selector Active Button (the glowing ring) */
            #color-selector button.active {
                width: 60px;
                border-color: ${newColor};
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
            

            #chapter-title{
                color: ${newColor};
            }

            #gear:hover,
            #gear:active{
                background-color: ${newColor};
                color: white;
            
        `;

  // Apply the new rules
  if (themeStyleTag) {
    themeStyleTag.innerHTML = dynamicCSS;
  }
}

// --- 2. الإعداد عند تحميل الصفحة (DOMContentLoaded) ---
// (هذا الجزء يعمل فوراً)
document.addEventListener("DOMContentLoaded", () => {
  // --- Setup ---
  const colorSelector = document.getElementById("color-selector");

  // Create a new <style> tag to hold our dynamic theme rules
  const themeStyleTag = document.createElement("style");
  themeStyleTag.id = "dynamic-theme-rules";
  document.head.appendChild(themeStyleTag);

  // --- Attach the Click Listener ---
  // (هذا آمن، لأن الدالة لن تعمل إلا "عند الضغط" - أي بعد تحميل كل شيء)
  if (colorSelector) {
    colorSelector.addEventListener("click", changeTheme);
  }
});

// --- 3. تطبيق الثيم الافتراضي (contentLoaded) ---
// (هذا الجزء "ينتظر" حتى ينتهي "content-loader.js" من تحميل الفصل)
document.addEventListener("contentLoaded", () => {
  const colorSelector = document.getElementById("color-selector");

  // Trigger the function once on load to apply the default active color
  // (الآن هو آمن، لأن عناصر <strong> موجودة بالفعل في الصفحة)
  const defaultActive = colorSelector.querySelector(".active");
  if (defaultActive) {
    changeTheme({ target: defaultActive });
  }
});
