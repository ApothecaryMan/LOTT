/**
 * =======================================================================
 * 📘 نظام قراءة الرواية - نسخة 3.2 (الأذكى والأدق)
 * =======================================================================
 * التحسينات:
 * ✅ نظام تتبع ذكي يستخدم IntersectionRatio لتحديد الفصل الأكثر ظهوراً
 * ✅ إصلاح مشكلة التحميل اليدوي من القائمة
 * ✅ تتبع دقيق حتى مع التمرير السريع جداً
 * ✅ أداء محسّن بدون throttle معقد
 * =======================================================================
 */

// ========== الحالة العامة ==========
const state = {
  chapters: [],
  currentChapterId: null,
  isLoading: false,
  reachedEnd: false,
  observers: {
    infinite: null,
    tracking: null,
  },
};

// ========== جلب وتحليل الفصول ==========
async function fetchChapter(chapterId) {
  const response = await fetch(`chapters/${chapterId}.html`);
  if (!response.ok) throw new Error(`فشل تحميل الفصل ${chapterId}`);
  return response.text();
}

function parseChapter(html, chapterId) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  temp.querySelector("#chapter-title-data")?.remove();

  const chapter = state.chapters.find((c) => c.id === chapterId);
  return {
    title: chapter?.title || `الفصل ${chapterId}`,
    content: temp.innerHTML,
  };
}

// ========== تحديث الواجهة ==========
function createChapterElement(chapterId, title, content) {
  const wrapper = document.createElement("div");
  wrapper.className = "chapter-block";
  wrapper.dataset.chapterId = chapterId;
  wrapper.innerHTML = `
    <h2 id="chapter-title-${chapterId}" class="chapter-title">
      ${chapterId} – ${title}
    </h2>
    ${content}
  `;
  return wrapper;
}

function updateUI(chapterId, title, content, append = false) {
  const container = document.getElementById("chapter-text");
  if (!container) return;

  const element = createChapterElement(chapterId, title, content);

  if (append) {
    container.appendChild(element);
  } else {
    container.innerHTML = "";
    container.appendChild(element);
  }
}

function updateTitleButton(chapterId) {
  const btn = document.getElementById("title-btn");
  if (!btn) return;

  const chapter = state.chapters.find((c) => c.id === chapterId);
  if (chapter) {
    btn.textContent = `${chapter.id} – ${chapter.title}`;
    btn.classList.add("visible");
  }
}

function updateStoryDescription(chapterId) {
  const container = document.getElementById("story-description-container");
  if (!container) return;

  const isFirstChapter = chapterId === state.chapters[0]?.id;
  container.style.display = isFirstChapter ? "block" : "none";
}

function updateComments(chapterId) {
  if (window.CommentsSystem?.setChapter) {
    window.CommentsSystem.setChapter(`chapter-${chapterId}`);
  }
}

// دالة مركزية لتحديث الفصل الحالي
function setCurrentChapter(chapterId) {
  if (chapterId === state.currentChapterId) return;

  state.currentChapterId = chapterId;

  updateTitleButton(chapterId);
  updateComments(chapterId);
  updateWordCount(chapterId);

  updateStoryDescription(chapterId);
  updateMainHeaderVisibility(chapterId);

  localStorage.setItem("lastReadChapter", chapterId);

  console.log(`📖 الفصل الحالي: ${chapterId}`);
}

// ========== تحميل الفصول ==========
async function loadChapter(chapterId, append = false) {
  if (state.isLoading) return false;

  try {
    state.isLoading = true;

    const html = await fetchChapter(chapterId);
    const { title, content } = parseChapter(html, chapterId);

    updateUI(chapterId, title, content, append);

    if (!append) {
      // 🔧 إصلاح: تحديث الفصل الحالي فوراً عند التحميل اليدوي
      setCurrentChapter(chapterId);
      window.currentChapterNumber = parseInt(chapterId, 10);

      // إعادة تهيئة الأنظمة
      resetInfiniteScroll();

      // الانتقال للأعلى بسلاسة
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.dispatchEvent(new CustomEvent("contentUpdated"));
    return true;
  } catch (error) {
    console.error(`خطأ في تحميل الفصل ${chapterId}:`, error);
    if (append) {
      state.reachedEnd = true;
      document.getElementById("loading-spinner").style.display = "none";
    }
    return false;
  } finally {
    state.isLoading = false;
  }
}

async function loadInitialChapter() {
  try {
    const response = await fetch("chapters.json");
    state.chapters = await response.json();
    window.chapterList = state.chapters;

    let chapterId = localStorage.getItem("lastReadChapter");

    if (chapterId && !state.chapters.some((c) => c.id === chapterId)) {
      chapterId = null;
    }

    chapterId = chapterId || state.chapters[0]?.id;

    if (chapterId) {
      await loadChapter(chapterId);
    } else {
      console.error("لا توجد فصول متاحة");
    }
  } catch (error) {
    console.error("فشل في تحميل الفصول:", error);
  }
}

// ========== التمرير اللانهائي ==========
function initInfiniteScroll() {
  const sentinel = document.getElementById("scroll-end-sentinel");
  const spinner = document.getElementById("loading-spinner");
  if (!sentinel || !spinner) return;

  state.observers.infinite = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting || state.isLoading || state.reachedEnd) {
        return;
      }

      spinner.style.display = "block";

      const currentIndex = state.chapters.findIndex(
        (c) => c.id === String(window.currentChapterNumber)
      );
      const nextChapter = state.chapters[currentIndex + 1];

      if (nextChapter) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const success = await loadChapter(nextChapter.id, true);
        if (success) {
          window.currentChapterNumber = parseInt(nextChapter.id, 10);
        }
      } else {
        state.reachedEnd = true;
      }

      spinner.style.display = "none";
    },
    { threshold: 1.0 }
  );

  state.observers.infinite.observe(sentinel);
}

function resetInfiniteScroll() {
  state.isLoading = false;
  state.reachedEnd = false;
  state.observers.infinite?.disconnect();
  initInfiniteScroll();
}

// ========== 🎯 النظام الذكي لتتبع الفصول ==========
/**
 * الطريقة الأذكى: استخدام intersectionRatio لتحديد الفصل الأكثر ظهوراً
 * بدلاً من الاعتماد على اتجاه التمرير فقط
 */
function initChapterTracking() {
  state.observers.tracking?.disconnect();

  // خريطة لحفظ نسبة الظهور لكل فصل
  const visibilityMap = new Map();

  state.observers.tracking = new IntersectionObserver(
    (entries) => {
      // تحديث خريطة الظهور
      entries.forEach((entry) => {
        const chapterId = entry.target.dataset.chapterId;
        if (entry.isIntersecting) {
          visibilityMap.set(chapterId, entry.intersectionRatio);
        } else {
          visibilityMap.delete(chapterId);
        }
      });

      // إيجاد الفصل الأكثر ظهوراً
      if (visibilityMap.size > 0) {
        let maxRatio = 0;
        let mostVisibleChapter = null;

        visibilityMap.forEach((ratio, chapterId) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleChapter = chapterId;
          }
        });

        // تحديث الفصل الحالي
        if (mostVisibleChapter) {
          setCurrentChapter(mostVisibleChapter);
        }
      }
    },
    {
      // منطقة مراقبة محسّنة للتمرير السريع
      rootMargin: "0px 0px -30% 0px",
      // نسب متعددة لدقة أعلى
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
    }
  );

  // مراقبة جميع الفصول
  document.querySelectorAll(".chapter-block").forEach((block) => {
    state.observers.tracking.observe(block);
  });
}

// ========== التهيئة ==========
document.addEventListener("DOMContentLoaded", async () => {
  await loadInitialChapter();
  initChapterTracking();
});

document.addEventListener("contentUpdated", initChapterTracking);

// تعريض الدوال للاستخدام الخارجي
window.loadChapter = loadChapter;

/**
 * @param {string} chapterId رقم الفصل
 */
function updateWordCount(chapterId) {
  // --- خطوة تصحيح 1: هل يتم استدعاء الدالة؟ ---
  console.log(`[عداد الكلمات] محاولة تحديث الفصل: ${chapterId}`);

  const wordCountBtn = document.getElementById("word-count");
  if (!wordCountBtn) {
    console.error("[عداد الكلمات] خطأ: لم يتم العثور على عنصر #word-count.");
    return;
  }

  // بناء الـ selector للعثور على عنصر الفصل المحدد
  const selector = `.chapter-block[data-chapter-id="${chapterId}"]`;
  const chapterBlock = document.querySelector(selector);

  // --- خطوة تصحيح 2: هل تم العثور على عنصر الفصل؟ ---
  if (chapterBlock) {
    console.log(`[عداد الكلمات] ✔️ تم العثور على العنصر:`, chapterBlock);

    // استخراج النص وحساب الكلمات
    const textContent = chapterBlock.textContent || "";
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;

    // --- خطوة تصحيح 3: ما هو عدد الكلمات المحسوب؟ ---
    console.log(`[عداد الكلمات] عدد الكلمات المحسوب: ${wordCount}`);

    wordCountBtn.innerText = wordCount + " كلمة";
  } else {
    // هذه هي الرسالة الأهم إذا كان هناك خطأ
    console.warn(
      `[عداد الكلمات] ⚠️ فشل: لم يتم العثور على العنصر بالـ selector التالي: ${selector}`
    );
    wordCountBtn.innerText = "--- كلمة"; // عرض قيمة افتراضية عند الفشل
  }
}
/**
 * إخفاء/إظهار الهيدر الرئيسي بناءً على الفصل الحالي.
 * يظهر الهيدر فقط عند عرض الفصل الأول.
 * @param {string} chapterId - رقم الفصل الحالي.
 */
function updateMainHeaderVisibility(chapterId) {
  const headerContainer = document.getElementById("main-header-container");
  if (!headerContainer) return;

  // التحقق مما إذا كان الفصل الحالي هو الفصل الأول في الرواية
  const isFirstChapter = chapterId === state.chapters[0]?.id;

  // تطبيق النمط: 'block' للفصل الأول, 'none' لباقي الفصول
  headerContainer.style.display = isFirstChapter ? "block" : "none";
}
