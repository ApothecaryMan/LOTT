/**
 * @file color.js
 * @description هذا الملف مسؤول عن إدارة وتطبيق ثيمات الألوان الديناميكية للموقع.
 * يتضمن الوظائف التالية:
 * 1. تحويل الألوان من صيغة RGB إلى HSL.
 * 2. تغيير ثيم الموقع بناءً على اللون الذي يختاره المستخدم.
 * 3. حفظ واسترجاع تفضيلات اللون للمستخدم باستخدام localStorage.
 * 4. التعامل مع منتقي الألوان المخصص (Custom Color Picker).
 */

// ===================================================================================
// الثوابت والمتغيرات العامة (Constants & Global Variables)
// ===================================================================================

// مفاتيح تُستخدم لحفظ الإعدادات في LocalStorage لضمان عدم تضاربها مع بيانات أخرى.
const COLOR_KEY = "userColorPreference";
const CUSTOM_COLOR_VALUE_KEY = "userCustomColorPreferenceValue";

// ===================================================================================
// الوظائف المساعدة (Utility Functions)
// ===================================================================================

/**
 * يحول سلسلة لون بصيغة RGB (مثل "rgb(255, 100, 80)") إلى مصفوفة HSL.
 * @param {string} rgbString - سلسلة اللون بصيغة RGB.
 * @returns {Array<number>} مصفوفة تحتوي على قيم [H, S, L] (Hue, Saturation, Lightness).
 */
function rgbToHsl(rgbString) {
  // تحقق أولي للتأكد من أن القيمة المُدخلة صالحة لتجنب الأخطاء.
  if (!rgbString || !rgbString.match(/\d+/g)) {
    console.error("Invalid RGB string provided:", rgbString);
    return [0, 0, 0]; // إرجاع قيمة افتراضية (أسود) في حالة الخطأ.
  }

  let [r, g, b] = rgbString.match(/\d+/g).map(Number);
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    // إذا كانت الألوان متساوية، فهذا يعني أنه لون رمادي (achromatic).
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

  // إرجاع القيم كأرقام صحيحة (0-360 لـ H، و 0-100 لـ S و L).
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// ===================================================================================
// الوظائف الأساسية (Core Functions)
// ===================================================================================

/**
 * الوظيفة الرئيسية التي تقوم بتغيير ألوان الثيم بناءً على الزر الذي تم النقر عليه.
 * @param {Event} event - كائن الحدث (event object) الناتج عن النقر.
 */
function changeTheme(event) {
  const clickedButton = event.target.closest("button");
  if (!clickedButton) return; // إذا لم يكن النقر على زر، لا تفعل شيئًا.

  // الخطوة 1: حفظ تفضيل المستخدم في LocalStorage.
  localStorage.setItem(COLOR_KEY, clickedButton.id);

  // الخطوة 2: الحصول على العناصر الأساسية من DOM.
  const newColor = window.getComputedStyle(clickedButton).backgroundColor;
  const themeStyleTag = document.getElementById("dynamic-theme-rules");
  const isLightTheme = document.body.classList.contains("light-theme");
  const colorSelector = document.getElementById("color-selector");

  // الخطوة 3: تحديث الحالة النشطة (active) لأزرار الألوان.
  colorSelector
    .querySelectorAll("button")
    .forEach((btn) => btn.classList.remove("active"));
  clickedButton.classList.add("active");

  // الخطوة 4: بناء سلسلة CSS الديناميكية.
  // تم تقسيمها لسهولة القراءة والصيانة.

  // 4.1: قواعد اللون التمييزي (Accent Color) للعناصر التفاعلية.
  const accentColorRules = `
    /* ACCENT COLOR RULES (INTERACTIVE ELEMENTS) */
    .auth-submit-btn, .auth-prompt-btn, .edit-submit-btn, .comment-submit-btn, .reply-submit-btn,
    #increase-font-size:hover, #increase-font-size:active,
    #decrease-font-size:hover, #decrease-font-size:active,
    #title-btn:hover, #title-btn:active, #comments-btn:hover, #comments-btn:active, #comments-btn.active,
    .carousel-item #font-selector button.active,
    .carousel-item #align-formate button.active,
    .carousel-item button#title-btn.active,
    #size-slider {
        background-color: ${newColor};
        color: white; /* غالبًا ما يكون اللون الأبيض هو الأفضل فوق خلفية ملونة */
    }

    /* تغيير لون أيقونات SVG داخل الأزرار التفاعلية إلى الأبيض عند التفعيل */
    #increase-font-size:hover svg, #decrease-font-size:hover svg, #title-btn:hover svg,
    #align-formate button:hover svg,
    .carousel-item #align-formate button.active svg,
    .carousel-item button #title-btn.active svg, .carousel-btn-middle:hover svg {
        fill: white;
    }
  `;

  // 4.2: قواعد خاصة بالنصوص، التحديد (selection)، والعناوين.
  const typographyAndSelectionRules = `
    ::selection { background-color: ${newColor}; color: white; }
    #chapter-title, #chapter-list-container h3, .chapter-item ,
    .comment-author, h2, #novel-list-container h3, .toggle-replies-btn, .auth-tab.active, .sort-by-btn .current-sort-value {
        color: ${newColor};
    }
  `;

  // 4.3: قواعد خاصة بالحدود (Borders)، الظلال (Shadows)، والمؤثرات البصرية الأخرى.
  const bordersAndEffectsRules = `
    #color-selector button.active { border-color: ${newColor}; box-shadow: 0 0 8px ${newColor}aa; }
    .zeus { outline: 1px solid ${newColor}; }
    #chapter-list button:hover, #chapter-list button:focus { border-color: ${newColor}; color: ${newColor}; }
    .author-image { outline: 2px solid ${newColor}; }
    .comment-textarea:focus, .reply-textarea:focus, .edit-textarea:focus { border-color: ${newColor}; }
    .form-group input:focus { border-color: ${newColor}; }
    .auth-tab.active::after { background-color: ${newColor}; }
    .spinner { border-top-color: ${newColor}; }
  `;

  // 4.4: قواعد خاصة بحالات Hover وتأثيرات أخرى.
  const hoverAndMiscRules = `
    .like-btn.liked svg, .toggle-replies-btn svg,  { fill: ${newColor}; }
    .toggle-replies-btn:hover, .reply-btn:hover { background-color: ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.1)")}; }
    .sort-option:hover, #font-panel-btn:hover { background-color: ${newColor}; color: #0f0f0f; }
    .sort-option.active { background-color: ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.2)")}; }
    /*.body, .font-tools-content button.active { background-color: ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.1)")};
      box-shadow: 0 0px 10px ${newColor
        .replace("rgb", "rgba")
        .replace(")", ", 0.1)")};
    }*/
    
  `;

  // تجميع كل قواعد CSS في متغير واحد.
  let dynamicCSS =
    accentColorRules +
    typographyAndSelectionRules +
    bordersAndEffectsRules +
    hoverAndMiscRules;

  // الخطوة 5: إضافة قواعد خاصة بالثيم الفاتح أو الداكن.
  if (isLightTheme) {
    // ================== قسم الثيم الفاتح (Light Theme) ==================
    const [h, s, l] = rgbToHsl(newColor);
    const safeS = s < 10 ? 0 : 50; // تقليل تشبع اللون ليتناسب مع الخلفية الفاتحة.

    const bodyBgColor = `hsl(${h}, ${safeS}%, 88%)`;
    const containerBgColor = `hsl(${h}, ${safeS - 5}%, 97%)`;
    const hoverBgColor = `hsl(${h}, ${safeS - 5}%, 92%)`;

    dynamicCSS += `
  body.light-theme { background-color: ${bodyBgColor}; }

  body.light-theme .body,.font-tools-popup, body.light-theme .card, body.light-theme #quote-options-panel {
    background-color: ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.05)")};
    box-shadow: 0 0px 10px ${newColor
      .replace("rgb", "rgba")
      .replace(")", ", 0.05)")};
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .carousel-nav-btn {
    background-color: ${bodyBgColor};
  }
  body.light-theme .chapter,
  body.light-theme #info-wrapper,
  body.light-theme .main-header-container,
  body.light-theme #comments-panel,
  body.light-theme .auth-modal-content,
  body.light-theme input,
  body.light-theme .auth-modal-close:hover,
  body.light-theme .carousel-item button {
    background-color: ${containerBgColor};
  }

  .spinner {
    border: 3px solid ${containerBgColor};
    border-top-color: ${newColor};
  }

  body.light-theme .font-tools-popup svg { fill: #222; }
  body.light-theme #comments-btn svg, body.light-theme #quote-options-panel svg { fill: #000; }
  body.light-theme #comments-btn:hover svg,
  body.light-theme #comments-btn.active svg { fill: white; }
  body.light-theme .card-title { color: ${newColor}; }
  body.light-theme .chapter-item .novel-chapter-count p{ color: white; }
  body.light-theme .font-tools-content button.active{ background-color: ${newColor};  }
  body.light-theme .font-tools-content button.active svg { fill: white; }
  .generated-quote { background-color: ${containerBgColor}; }
`;
  } else {
    // ================== قسم الثيم الداكن (Dark Theme) ==================
    const [h, s, l] = rgbToHsl(newColor);
    const safeS = s < 20 ? s / 2 : 20; // تقليل حاد لتشبع اللون ليتناسب مع الخلفية الداكنة.

    const bodyBgColor = `hsl(${h}, ${safeS}%, 10%)`;
    const containerBgColor = `hsl(${h}, ${safeS}%, 15%)`;
    const hoverBgColor = `hsl(${h}, ${safeS}%, 20%)`;

    dynamicCSS += `
      body { background-color: ${bodyBgColor}; }
      .carousel-container .carousel-nav-btn { background-color: ${bodyBgColor}; }
      .chapter, #info-wrapper, .main-header-container,
 
      #comments-panel, .auth-modal-content {
          background-color: ${l === 0 ? "rgb(0, 0, 0)" : containerBgColor};
      }
      .spinner { border: 3px solid ${containerBgColor}; border-top-color: ${newColor}; }
      .font-tools-popup svg { fill: #eee; }
      .font-tools-popup button{color: white; }
      .font-tools-popup h4, .font-tools-popup h5 { color: white; }
      #comments-btn svg, #title-btn, #font-panel-btn svg, #word-count{
      fill: white;
      color: white;
      }
      .generated-quote { background-color: ${containerBgColor}; }
    `;
  }

  // الخطوة 6: تطبيق كل قواعد CSS الجديدة على الصفحة.
  themeStyleTag.innerHTML = dynamicCSS;
}

/**
 * تقوم بتحميل إعدادات اللون المحفوظة للمستخدم عند تحميل الصفحة.
 */
function loadColorSetting() {
  const savedColorId = localStorage.getItem(COLOR_KEY) || "gray"; // اللون الافتراضي هو الرمادي.
  const savedCustomColor = localStorage.getItem(CUSTOM_COLOR_VALUE_KEY);

  const buttonToActivate = document.getElementById(savedColorId);
  if (buttonToActivate) {
    // إذا كان اللون المحفوظ هو اللون المخصص، قم بتعيين لونه من القيمة المحفوظة.
    if (savedColorId === "custom-color-btn" && savedCustomColor) {
      buttonToActivate.style.background = savedCustomColor;
    }
    // نستخدم setTimeout لضمان أن كل شيء في DOM قد تم تحميله بالكامل قبل تطبيق الثيم.
    setTimeout(() => {
      changeTheme({ target: buttonToActivate });
    }, 0);
  }
}

// ===================================================================================
// إعداد مستمعي الأحداث والتهيئة (Event Listeners & Initialization)
// ===================================================================================

/**
 * إعداد الوظائف الخاصة بمنتقي الألوان المخصص (Custom Color Picker).
 */
function setupCustomColorPicker() {
  const customColorBtn = document.getElementById("custom-color-btn");
  const colorPicker = document.getElementById("color-picker");

  if (customColorBtn && colorPicker) {
    // عند النقر على زر اللون المخصص، افتح منتقي الألوان.
    customColorBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // منع إطلاق حدث changeTheme مرتين.
      colorPicker.click();
    });

    // عند تغيير قيمة منتقي الألوان.
    colorPicker.addEventListener("input", (event) => {
      const hexColor = event.target.value;
      // تحويل اللون من HEX إلى RGB.
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const rgbColor = `rgb(${r}, ${g}, ${b})`;

      // تحديث لون الزر، حفظ القيمة، ثم تطبيق الثيم الجديد.
      customColorBtn.style.background = rgbColor;
      localStorage.setItem(CUSTOM_COLOR_VALUE_KEY, rgbColor);
      changeTheme({ target: customColorBtn });
    });
  }
}

/**
 * دالة التهيئة الرئيسية التي تعمل عند اكتمال تحميل DOM.
 */
function initializeTheme() {
  // إنشاء وسم <style> ديناميكي إذا لم يكن موجودًا.
  if (!document.getElementById("dynamic-theme-rules")) {
    const themeStyleTag = document.createElement("style");
    themeStyleTag.id = "dynamic-theme-rules";
    document.head.appendChild(themeStyleTag);
  }

  // إضافة مستمع النقر إلى حاوية أزرار الألوان (استخدام تفويض الأحداث).
  const colorSelector = document.getElementById("color-selector");
  if (colorSelector) {
    colorSelector.addEventListener("click", changeTheme);
  }

  // إعداد وظائف منتقي الألوان المخصص.
  setupCustomColorPicker();

  // تحميل إعدادات اللون التي حفظها المستخدم سابقًا.
  loadColorSetting();
}

// نقطة انطلاق الكود: يتم تشغيل دالة التهيئة عند اكتمال تحميل محتوى الصفحة.
document.addEventListener("DOMContentLoaded", initializeTheme);

/*
// ملاحظة هامة: تم التعليق على هذا الجزء لأنه يستخدم حدثًا غير قياسي ('contentLoaded').
// المتصفحات لا تطلق هذا الحدث تلقائيًا. يجب أن يتم إطلاقه يدويًا من مكان آخر في الكود
// (على سبيل المثال، بعد تحميل محتوى ديناميكي عبر AJAX) إذا كنت تحتاج لإعادة تطبيق الثيم.
// إذا لم تكن تستخدمه، فمن الأفضل إزالته.
document.addEventListener("contentLoaded", () => {
  const activeColorButton = document.querySelector("#color-selector .active");
  if (activeColorButton) {
    changeTheme({ target: activeColorButton });
  }
});
*/
