// const btn = document.getElementById("custom-color-btn");

// // القيم الابتدائية أو المحفوظة
// let hue = parseFloat(localStorage.getItem("userHue")) || 0;
// let lightness = parseFloat(localStorage.getItem("userLightness")) || 40;
// let saturation = 100;

// const minLight = 15;
// const maxLight = 60;

// applyColor();

// // 🖱️ التعامل مع العجلة (للماوس واللاب)
// btn.addEventListener(
//   "wheel",
//   (event) => {
//     event.preventDefault();
//     handleMove(event.deltaX, event.deltaY);
//   },
//   { passive: false }
// );

// // 📱 التعامل مع اللمس (للموبايل)
// let startX = 0;
// let startY = 0;

// btn.addEventListener("touchstart", (e) => {
//   const touch = e.touches[0];
//   startX = touch.clientX;
//   startY = touch.clientY;
// });

// btn.addEventListener("touchmove", (e) => {
//   const touch = e.touches[0];
//   const deltaX = touch.clientX - startX;
//   const deltaY = touch.clientY - startY;
//   handleMove(deltaX * 0.6, deltaY * 0.6); // حساسية أقل شوية للمس
//   startX = touch.clientX;
//   startY = touch.clientY;
// });

// // 🧠 الدالة المشتركة لتحريك اللون حسب الاتجاه
// function handleMove(deltaX, deltaY) {
//   const absX = Math.abs(deltaX);
//   const absY = Math.abs(deltaY);

//   if (absX > absY) {
//     // الاتجاه أفقي = تغيير اللون (Hue)
//     hue += deltaX > 0 ? 8 : -8;
//   } else {
//     // الاتجاه رأسي = تغيير السطوع (Lightness)
//     lightness += deltaY > 0 ? -2 : 2;
//   }

//   // الحدود
//   if (hue < 0) hue += 360;
//   if (hue >= 360) hue -= 360;
//   if (lightness < minLight) lightness = minLight;
//   if (lightness > maxLight) lightness = maxLight;

//   applyColor(true);
// }

// // 🎨 تطبيق اللون وتخزينه
// function applyColor(triggerTheme = false) {
//   const color = `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(
//     lightness
//   )}%)`;
//   btn.style.background = color;

//   localStorage.setItem("userHue", hue);
//   localStorage.setItem("userLightness", lightness);
//   localStorage.setItem("userCustomColorPreferenceValue", color);

//   if (triggerTheme && typeof changeTheme === "function") {
//     changeTheme({ target: btn });
//   }
// }

const btn = document.getElementById("custom-color-btn");

// الحالة
let hue = parseFloat(localStorage.getItem("userHue")) || 0;
let lightness = parseFloat(localStorage.getItem("userLightness")) || 40;
let saturation = 100;

const minLight = 15;
const maxLight = 60;

// متغيرات اللمس والتحكم
let isActive = false; // هل الزر في وضع التحكم؟
let lastX = 0;
let lastY = 0;

applyColor();

// لما المستخدم يضغط على الزر (يفعّل الوضع)
btn.addEventListener(
  "touchstart",
  (e) => {
    const touch = e.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
    isActive = true;
    btn.classList.add("active-control");
  },
  { passive: true }
);

// لما المستخدم يحرّك صباعه (حتى بعيد عن الزر)
window.addEventListener(
  "touchmove",
  (e) => {
    if (!isActive) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastX;
    const deltaY = touch.clientY - lastY;
    lastX = touch.clientX;
    lastY = touch.clientY;

    // تحديد الاتجاه المسيطر
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      // حركة أفقية = تغيير اللون
      hue += deltaX > 0 ? 8 : -8;
    } else {
      // حركة رأسية = تغيير السطوع
      lightness += deltaY > 0 ? -2 : 2;
    }

    // ضبط الحدود
    if (hue < 0) hue += 360;
    if (hue >= 360) hue -= 360;
    if (lightness < minLight) lightness = minLight;
    if (lightness > maxLight) lightness = maxLight;

    applyColor(true);
  },
  { passive: false }
);

// لما المستخدم يرفع صباعه → يوقف التحكم
window.addEventListener("touchend", () => {
  if (isActive) {
    isActive = false;
    btn.classList.remove("active-control");
  }
});

// تطبيق اللون
function applyColor(triggerTheme = false) {
  const color = `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(
    lightness
  )}%)`;
  btn.style.background = color;
  localStorage.setItem("userHue", hue);
  localStorage.setItem("userLightness", lightness);
  localStorage.setItem("userCustomColorPreferenceValue", color);

  if (triggerTheme && typeof changeTheme === "function") {
    changeTheme({ target: btn });
  }
}
