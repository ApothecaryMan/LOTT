/**
 * =======================================================================
 * 📘 نظام قراءة الرواية - نسخة 3.0 (تتبع ذكي ثنائي الاتجاه)
 * =======================================================================
 * المميزات:
 * ✅ تحميل تدريجي للفصول (Infinity Scroll).
 * ✅ نظام تتبع ذكي يكتشف اتجاه التمرير لتحديث أكثر منطقية.
 *    - عند النزول: التحديث عند ظهور عنوان الفصل الجديد.
 *    - عند الصعود: التحديث فور دخول محتوى الفصل السابق.
 * ✅ تحديث فوري لزر العنوان (title-btn) والتعليقات وآخر فصل مقروء.
 * ✅ إعادة تهيئة النظام تلقائيًا عند الانتقال اليدوي لفصل جديد.
 * =======================================================================
 */

// متغيرات عامة لإدارة الحالة
let chapterList = [];
let isLoading = false;
let reachedEnd = false;
let infiniteScrollObserver;
let chapterTrackingObserver;
let currentlyTrackedChapterId = null; // لمنع التحديثات المتكررة
let lastScrollY = window.scrollY; // لتحديد اتجاه التمرير

/**
 * جلب محتوى HTML لفصل معين.
 * @param {string} chapterNumber رقم الفصل
 * @returns {Promise<string>} محتوى الفصل
 */
async function fetchChapterHtml(chapterNumber) {
  const response = await fetch(`chapters/${chapterNumber}.html`);
  if (!response.ok) {
    throw new Error(`فشل تحميل الفصل ${chapterNumber}: ${response.status}`);
  }
  return await response.text();
}

/**
 * تحليل محتوى الفصل واستخراج العنوان من قائمة الفصول.
 * @param {string} chapterHtml محتوى الفصل
 * @param {string} chapterNumber رقم الفصل
 * @returns {{title: string, content: string}}
 */
function parseChapter(chapterHtml, chapterNumber) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = chapterHtml;

  const oldTitle = tempDiv.querySelector("#chapter-title-data");
  if (oldTitle) oldTitle.remove();

  const chapterData = chapterList.find((c) => c.id === chapterNumber);
  const title = chapterData ? chapterData.title : `الفصل ${chapterNumber}`;

  return { title, content: tempDiv.innerHTML };
}

/**
 * تحديث واجهة المستخدم بالفصل الجديد.
 * @param {string} title عنوان الفصل
 * @param {string} content محتوى الفصل
 * @param {boolean} append هل يتم إلحاق الفصل أم استبدال المحتوى
 * @param {string} chapterNumber رقم الفصل
 */
function updateChapterInDom(title, content, append = false, chapterNumber) {
  const paragraphContainer = document.getElementById("chapter-text");
  if (!paragraphContainer) return;

  const fullTitle = `الفصل ${chapterNumber} – ${title}`;

  const chapterWrapper = document.createElement("div");
  chapterWrapper.className = "chapter-block";
  chapterWrapper.setAttribute("data-chapter-id", chapterNumber);
  chapterWrapper.innerHTML = `
    <h2 id="chapter-title-${chapterNumber}" class="chapter-title">${fullTitle}</h2>
    ${content}
  `;

  if (append) {
    paragraphContainer.appendChild(chapterWrapper);
  } else {
    paragraphContainer.innerHTML = "";
    paragraphContainer.appendChild(chapterWrapper);
  }
}

/**
 * إظهار أو إخفاء وصف القصة (يظهر فقط مع الفصل الأول).
 * @param {string} chapterNumber رقم الفصل
 */
async function handleStoryDescriptionVisibility(chapterNumber) {
  const storyContainer = document.getElementById("story-description-container");
  if (!storyContainer) return;

  const firstChapterId = chapterList[0]?.id;
  storyContainer.style.display =
    chapterNumber === firstChapterId ? "block" : "none";
}

/**
 * تحديث نظام التعليقات بالاعتماد على رقم الفصل.
 * @param {string} chapterNumber رقم الفصل
 */
function updateCommentsSystem(chapterNumber) {
  if (
    window.CommentsSystem &&
    typeof window.CommentsSystem.setChapter === "function"
  ) {
    const chapterId = `chapter-${chapterNumber}`;
    window.CommentsSystem.setChapter(chapterId);
    console.log(`💬 تم تحديث التعليقات للفصل: ${chapterId}`);
  }
}

/**
 * تحميل فصل معين وتحديث الصفحة وكل الأنظمة التابعة له.
 * @param {string} chapterNumber رقم الفصل للتحميل
 * @param {boolean} append هل هو تحميل إضافي (للتمرير اللانهائي)
 * @returns {Promise<boolean>}
 */
async function loadChapter(chapterNumber, append = false) {
  try {
    const chapterHtml = await fetchChapterHtml(chapterNumber);
    const { title, content } = parseChapter(chapterHtml, chapterNumber);

    updateChapterInDom(title, content, append, chapterNumber);

    if (!append) {
      await handleStoryDescriptionVisibility(chapterNumber);
      localStorage.setItem("lastReadChapter", chapterNumber);
      window.currentChapterNumber = parseInt(chapterNumber, 10);
      resetInfiniteScroll();
    }

    document.dispatchEvent(new CustomEvent("contentUpdated"));

    return true;
  } catch (error) {
    console.error(`خطأ في تحميل الفصل ${chapterNumber}:`, error);
    if (append) {
      reachedEnd = true;
      document.getElementById("loading-spinner").style.display = "none";
    }
    return false;
  }
}

/**
 * تحميل الفصل الأول أو آخر فصل تمت قراءته عند فتح الصفحة.
 */
async function loadInitialChapter() {
  try {
    const res = await fetch("chapters.json");
    chapterList = await res.json();
    window.chapterList = chapterList;

    const lastReadChapter = localStorage.getItem("lastReadChapter");
    let chapterToLoadId = lastReadChapter;

    if (chapterToLoadId && !chapterList.some((c) => c.id === chapterToLoadId)) {
      chapterToLoadId = null;
    }

    if (!chapterToLoadId) {
      chapterToLoadId = chapterList[0]?.id;
    }

    if (chapterToLoadId) {
      await loadChapter(chapterToLoadId);
    } else {
      console.error("لا توجد فصول متاحة للتحميل.");
    }
  } catch (error) {
    console.error("فشل في تحميل بيانات الفصول الأولية:", error);
  }
}

/**
 * إعادة تهيئة نظام التمرير اللانهائي (عند الانتقال اليدوي).
 */
function resetInfiniteScroll() {
  isLoading = false;
  reachedEnd = false;
  if (infiniteScrollObserver) infiniteScrollObserver.disconnect();
  initInfiniteScroll();
}

/**
 * نظام التمرير اللانهائي لتحميل الفصول التالية.
 */
function initInfiniteScroll() {
  const sentinel = document.getElementById("scroll-end-sentinel");
  const spinner = document.getElementById("loading-spinner");
  if (!sentinel || !spinner) return;

  infiniteScrollObserver = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting && !isLoading && !reachedEnd) {
        isLoading = true;
        spinner.style.display = "block";

        const currentChapterIndex = chapterList.findIndex(
          (c) => c.id === String(window.currentChapterNumber)
        );
        const nextChapter = chapterList[currentChapterIndex + 1];

        if (nextChapter) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const success = await loadChapter(nextChapter.id, true);
          if (success) {
            window.currentChapterNumber = parseInt(nextChapter.id, 10);
          }
        } else {
          reachedEnd = true;
        }

        spinner.style.display = "none";
        isLoading = false;
      }
    },
    { threshold: 1.0 }
  );
  infiniteScrollObserver.observe(sentinel);
}

/**
 * ✨ [الحل المحسّن] ✨
 * نظام تتبع الفصول الظاهرة على الشاشة مع كشف اتجاه التمرير.
 */
function initChapterTracking() {
  const titleBtn = document.getElementById("title-btn");
  if (!titleBtn) return;

  if (chapterTrackingObserver) chapterTrackingObserver.disconnect();

  chapterTrackingObserver = new IntersectionObserver(
    (entries) => {
      // تحديد اتجاه التمرير
      const isScrollingDown = window.scrollY > lastScrollY;
      lastScrollY = window.scrollY;

      // فلترة العناصر التي تتقاطع مع منطقة العرض
      const intersectingEntries = entries.filter((e) => e.isIntersecting);
      if (intersectingEntries.length === 0) return;

      // اختيار الفصل المستهدف بناءً على اتجاه التمرير
      let targetEntry;
      if (isScrollingDown) {
        // عند النزول، نختار آخر فصل في القائمة (الأحدث ظهورًا)
        targetEntry = intersectingEntries[intersectingEntries.length - 1];
      } else {
        // عند الصعود، نختار أول فصل في القائمة
        targetEntry = intersectingEntries[0];
      }

      const chapterId = targetEntry.target.getAttribute("data-chapter-id");

      if (chapterId && chapterId !== currentlyTrackedChapterId) {
        currentlyTrackedChapterId = chapterId;
        console.log(`الفصل الحالي على الشاشة: ${chapterId}`);

        const chapterData = chapterList.find((c) => c.id === chapterId);
        if (chapterData) {
          // 1. تحديث زر العنوان
          titleBtn.textContent = `${chapterData.id} – ${chapterData.title}`;
          titleBtn.classList.add("visible");
        }
        // 2. تحديث نظام التعليقات
        updateCommentsSystem(chapterId);
        // 3. تحديث آخر فصل تمت قراءته
        localStorage.setItem("lastReadChapter", chapterId);
      }
    },
    {
      // هذا الهامش يحدد "خط" أفقي في أعلى الشاشة (عند 20% من الأعلى)
      // يتم تفعيل المراقبة عندما يتجاوز العنصر هذا الخط
      rootMargin: "0px 0px -80% 0px",
      threshold: 0,
    }
  );

  // مراقبة كل حاويات الفصول الموجودة في الصفحة
  const chapterBlocks = document.querySelectorAll(".chapter-block");
  chapterBlocks.forEach((block) => chapterTrackingObserver.observe(block));
}

// =======================================================
// تشغيل الأنظمة عند تحميل الصفحة
// =======================================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadInitialChapter();
  initChapterTracking();
});

document.addEventListener("contentUpdated", () => {
  initChapterTracking();
});

// تعريض دالة تحميل الفصل عالميًا للملفات الأخرى
window.loadChapter = loadChapter;
