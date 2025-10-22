function expand(expandBtnId, expandContentId) {
  // انتظر حتى يتم تحميل كل عناصر الصفحة
  document.addEventListener("DOMContentLoaded", () => {
    // 1. حدد الزر والـ div الخاص بالمحتوى
    const toggleBtn = document.getElementById(expandBtnId);
    const contentWrapper = document.getElementById(expandContentId);
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
}

expand("expand-support", "support-wrapper");
expand("expand-info", "info-wrapper");

/////////////////////////////////////////////////////////////////////////////////////////////////////
//SOUND EFFECT
document.addEventListener("contentLoaded", () => {
  // 1. جلب العناصر
  const wordCountDisplay = document.getElementById("word-count");
  const paragraph = document.getElementById("chapter-text");

  // 2. التأكد من وجود العنصر الأساسي
  if (!paragraph) {
    console.error("Element with id 'chapter-text' not found.");
    return;
  }

  // --- (الجزء الجديد) تحويل التأثيرات الصوتية إلى Strong ---
  try {
    // هذا التعبير النمطي (RegEx) يبحث عن أي نص يبدأ بـ * وينتهي بـ *
    const soundEffectRegex = /\*.*?\*/g;

    // $& تعني "النص الكامل الذي تم العثور عليه"
    // سيقوم بلف أي شيء مثل *قعقعة* ليصبح <strong>*قعقعة*</strong>
    paragraph.innerHTML = paragraph.innerHTML.replace(
      soundEffectRegex,
      "<strong>$&</strong>"
    );
  } catch (error) {
    console.error("Error processing sound effects:", error);
  }
  // --- نهاية الجزء الجديد ---

  // --- كود عداد الكلمات (كما هو) ---
  if (wordCountDisplay) {
    // 3. Get the text content
    const textContent = paragraph.textContent;

    // 4. Calculate the words
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word !== "");

    // 5. Get the count
    const wordCount = words.length;

    // 6. Display the count + the word "كلمة"
    wordCountDisplay.innerText = wordCount + " كلمة";
  } else {
    if (!wordCountDisplay)
      console.error("Element with id 'word-count' not found.");
  }
});
