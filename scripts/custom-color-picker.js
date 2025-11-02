const btn = document.getElementById("custom-color-btn");

// القيم الابتدائية أو المحفوظة
let hue = parseFloat(localStorage.getItem("userHue")) || 0;
let lightness = parseFloat(localStorage.getItem("userLightness")) || 40;
let saturation = 100;

const minLight = 15;
const maxLight = 60;

applyColor();

// 🖱️ التعامل مع العجلة (للماوس واللاب)
btn.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    handleMove(event.deltaX, event.deltaY);
  },
  { passive: false }
);

// 📱 التعامل مع اللمس (للموبايل)
let startX = 0;
let startY = 0;

btn.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
});

btn.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;
  handleMove(deltaX * 0.6, deltaY * 0.6); // حساسية أقل شوية للمس
  startX = touch.clientX;
  startY = touch.clientY;
});

// 🧠 الدالة المشتركة لتحريك اللون حسب الاتجاه
function handleMove(deltaX, deltaY) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX > absY) {
    // الاتجاه أفقي = تغيير اللون (Hue)
    hue += deltaX > 0 ? 8 : -8;
  } else {
    // الاتجاه رأسي = تغيير السطوع (Lightness)
    lightness += deltaY > 0 ? -2 : 2;
  }

  // الحدود
  if (hue < 0) hue += 360;
  if (hue >= 360) hue -= 360;
  if (lightness < minLight) lightness = minLight;
  if (lightness > maxLight) lightness = maxLight;

  applyColor(true);
}

// 🎨 تطبيق اللون وتخزينه
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
