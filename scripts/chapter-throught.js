// انتظر تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. تعريف المتغيرات ---
  let currentChapterNumber = 1766; // رقم الفصل الحالي لهذه الصفحة

  //////////////////GEAR/////////////////////////
  // --- (الكود الخاص بزر الترس - يدعم الماوس واللمس) ---
  const gear = document.getElementById("gear");
  if (gear) {
    // 1. القيمة الأولية
    let currentValue = currentChapterNumber;
    gear.textContent = currentValue;

    // --- متغيرات اللمس ---
    let touchStartY = 0;
    let moved = false;

    // --- دوال التعامل ---

    // 2. دالة التعامل مع السكرول (للماوس)
    function handleGearScroll(event) {
      event.preventDefault();

      if (event.deltaX > 0) {
        //لعكس السكرول اكسل العلامة  //انا خليتها اكس علشان تسكرول في محصور اكس
        currentValue++;
      } else {
        currentValue--;
      }
      gear.textContent = currentValue;
    }

    // 3. دالة التعامل مع بداية اللمس
    function handleTouchStart(event) {
      touchStartY = event.touches[0].clientY;
      moved = false;
    }

    // 4. دالة التعامل مع حركة اللمس
    function handleTouchMove(event) {
      event.preventDefault();

      const currentY = event.touches[0].clientY;
      const deltaY = currentY - touchStartY;

      if (deltaY < -10) {
        // تحرك للأعلى
        currentValue++;
        touchStartY = currentY;
        moved = true;
      } else if (deltaY > 10) {
        // تحرك للأسفل
        currentValue--;
        touchStartY = currentY;
        moved = true;
      }
      gear.textContent = currentValue;
    }

    // 5. دالة التعامل مع الضغط (Click) أو نهاية اللمس (Tap)
    async function handleGearTapOrClick() {
      // إذا كان المستخدم قد قام بالتمرير (Swipe)، لا تعتبرها ضغطة
      if (moved) return;

      const chapterToLoad = parseInt(gear.textContent);
      if (isNaN(chapterToLoad)) return;

      // --- كود التحميل (كما هو) ---
      paragraphContainer.classList.add("is-loading");
      chapterTitle.classList.add("is-loading");
      await new Promise((resolve) => setTimeout(resolve, 300));
      const success = await loadChapter(chapterToLoad);
      if (success) {
        currentChapterNumber = chapterToLoad;
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
        await updateButtonVisibility();
      } else {
        console.error(`Failed to load chapter ${chapterToLoad}`);
        gear.textContent = currentChapterNumber;
        paragraphContainer.classList.remove("is-loading");
        chapterTitle.classList.remove("is-loading");
      }
      // --- نهاية كود التحميل ---
    }

    // 6. إضافة مستمعات الأحداث (القديمة + الجديدة)
    gear.addEventListener("wheel", handleGearScroll); // <<<=== للماوس
    gear.addEventListener("touchstart", handleTouchStart); // <<<=== بداية اللمس
    gear.addEventListener("touchmove", handleTouchMove); // <<<=== حركة اللمس
    gear.addEventListener("click", handleGearTapOrClick); // <<<=== للضغط بالماوس أو النقر باللمس
  }
  // --- نهاية الإضافة ---
  //////////////////GEAR/////////////////////////

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
