// انتظر تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. تعريف المتغيرات ---
  let currentChapterNumber = 1766; // رقم الفصل الحالي لهذه الصفحة

  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".previous");
  const chapterTitle = document.getElementById("chapter-title");
  const paragraphContainer = document.getElementById("chapter-text");
  const preNexContainer = document.querySelector(".pre-nex");

  /**
   * (دالة جديدة)
   * تتحقق من وجود ملف الفصل (بدون تحميله بالكامل)
   * @param {string | number} chapterNumber
   * @returns {Promise<boolean>}
   */
  async function checkChapterExists(chapterNumber) {
    try {
      // نستخدم 'HEAD' لأنه أسرع (يطلب الرأس فقط، وليس المحتوى)
      const response = await fetch(`chapters/${chapterNumber}.html`, {
        method: "HEAD",
      });
      return response.ok; // true (200) or false (404)
    } catch (error) {
      console.error("Check error:", error);
      return false; // فشل في الاتصال
    }
  }

  /**
   * (دالة جديدة)
   * تقوم بتحديث إظهار/إخفاء الأزرار بناءً على الفصول المجاورة
   */
  async function updateButtonVisibility() {
    const hasNext = await checkChapterExists(currentChapterNumber + 1);
    const hasPrev = await checkChapterExists(currentChapterNumber - 1);

    preNexContainer.classList.toggle("next-hidden", !hasNext);
    preNexContainer.classList.toggle("prev-hidden", !hasPrev);
  }

  /**
   * (دالة جديدة)
   * لتشغيل الكود عند فتح الصفحة
   */
  async function initializeReader() {
    await loadChapter(currentChapterNumber); // 1. تحميل الفصل الأولي
    await updateButtonVisibility(); // 2. فحص وإخفاء/إظهار الأزرار
  }

  // --- 3. إضافة مستمع لزر "التالي" (تم تعديله) ---
  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      // 1. (فحص أولاً) هل يوجد فصل تالٍ؟
      const hasNext = await checkChapterExists(currentChapterNumber + 1);

      if (!hasNext) {
        // لا يوجد فصل تالٍ، لا تفعل شيئاً
        // (الزر يجب أن يكون مخفياً أصلاً، هذا فقط للأمان)
        return;
      }

      // 2. إخفاء المحتوى والسكرول
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. تحميل الفصل (نحن نعلم أنه موجود)
      await loadChapter(currentChapterNumber + 1);
      currentChapterNumber++; // تحديث الرقم

      // 4. إظهار المحتوى الجديد
      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");

      // 5. فحص الأزرار مرة أخرى (للفصل الجديد)
      await updateButtonVisibility();
    });
  }

  // --- 4. إضافة مستمع لزر "السابق" (تم تعديله) ---
  if (prevBtn) {
    prevBtn.addEventListener("click", async () => {
      // 1. (فحص أولاً) هل يوجد فصل سابق؟
      const hasPrev = await checkChapterExists(currentChapterNumber - 1);

      if (!hasPrev) {
        return; // لا يوجد فصل سابق
      }

      // 2. إخفاء المحتوى والسكرول
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. تحميل الفصل
      await loadChapter(currentChapterNumber - 1);
      currentChapterNumber--; // تحديث الرقم

      // 4. إظهار المحتوى الجديد
      paragraphContainer.classList.remove("is-loading");
      chapterTitle.classList.remove("is-loading");

      // 5. فحص الأزرار مرة أخرى
      await updateButtonVisibility();
    });
  }

  // --- 5. بدء تشغيل القارئ ---
  initializeReader();
});
