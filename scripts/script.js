// انتظر حتى يتم تحميل كل عناصر الصفحة
document.addEventListener("DOMContentLoaded", () => {
  // 1. حدد الزر والـ div الخاص بالمحتوى
  const toggleBtn = document.getElementById("toggle-btn");
  const contentWrapper = document.getElementById("content-wrapper");
  const btnText = toggleBtn.querySelector(".text"); // الجزء الخاص بالنص

  // 2. احفظ الارتفاع الأولي (الذي كتبته في CSS)
  const initialMaxHeight = "40px";

  // 3. أضف "مستمع" لضغطة الزر
  toggleBtn.addEventListener("click", () => {
    // 4. افحص: هل الـ div مفتوح حالياً؟
    if (contentWrapper.classList.contains("expanded")) {
      // --- نعم، هو مفتوح (قم بإغلاقه) ---
      contentWrapper.classList.remove("expanded"); // احذف كلاس التمدد
      toggleBtn.classList.remove("active"); // احذف كلاس السهم (ليدور)
      contentWrapper.style.maxHeight = initialMaxHeight; // أعد الارتفاع للوضع الأولي
      //   btnText.textContent = "إظهار المزيد"; // غيّر النص
    } else {
      // --- لا، هو مغلق (قم بفتحه) ---
      contentWrapper.classList.add("expanded"); // أضف كلاس التمدد
      toggleBtn.classList.add("active"); // أضف كلاس السهم (ليدور)

      // النقطة الأهم:
      // اجعل الارتفاع الأقصى = الارتفاع الفعلي لكل المحتوى الداخلي
      contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";

      //   btnText.textContent = "إخفاء";
    }
  });
});
