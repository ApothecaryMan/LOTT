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

// =======================================================================
// 1. إدارة الحالة العامة (Global State)
// -----------------------------------------------------------------------
// هذا الكائن هو "عقل" النظام، حيث يتم تخزين كل المعلومات الحيوية
// مثل قائمة الفصول، الفصل الحالي، وحالة التحميل.
// =======================================================================

const state = {
  chapters: [], // قائمة بكل فصول الرواية
  currentChapterId: null, // الفصل النشط حالياً على الشاشة
  isLoading: false, // لمنع التحميل المتعدد في نفس الوقت
  reachedEnd: false, // لمعرفة الوصول لآخر فصل
  reachedStart: false, // لمعرفة الوصول لأول فصل
  observers: {
    infinite: null, // مراقب التمرير اللانهائي
    infiniteUp: null, // مراقب التمرير للأعلى
    tracking: null, // مراقب تتبع الفصول الذكي
  },
};

// =======================================================================
// 2. جلب وتحليل محتوى الفصول (Data Fetching & Parsing)
// -----------------------------------------------------------------------
// دوال مسؤولة عن طلب ملفات الفصول من الخادم، ثم معالجتها
// وتنظيفها لتكون جاهزة للعرض في الصفحة.
// =======================================================================

/**
 * جلب محتوى فصل معين من الخادم.
 * @param {string} chapterId - رقم الفصل المطلوب.
 * @returns {Promise<string>} - محتوى الفصل بصيغة HTML.
 */
async function fetchChapter(chapterId) {
  const response = await fetch(`chapters/${chapterId}.html`);
  if (!response.ok) throw new Error(`فشل تحميل الفصل ${chapterId}`);
  return response.text();
}

/**
 * تحليل محتوى الفصل (HTML) واستخراج العنوان والمحتوى النظيف.
 * @param {string} html - محتوى الفصل الخام.
 * @param {string} chapterId - رقم الفصل للمعالجة.
 * @returns {{title: string, content: string}} - كائن يحتوي على العنوان والمحتوى.
 */
function parseChapter(html, chapterId) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  // إزالة أي عناصر غير مرغوب فيها، مثل عنوان مكرر
  temp.querySelector("#chapter-title-data")?.remove();

  const chapter = state.chapters.find((c) => c.id === chapterId);
  return {
    title: chapter?.title || `الفصل ${chapterId}`,
    content: temp.innerHTML,
  };
}

// =======================================================================
// 3. تحديث واجهة المستخدم (UI Updates)
// -----------------------------------------------------------------------
// مجموعة دوال متخصصة في تعديل عناصر الصفحة لعرض المعلومات
// الجديدة للمستخدم، مثل إضافة فصل، تحديث الأزرار، وإظهار/إخفاء أقسام.
// =======================================================================

/**
 * إنشاء عنصر HTML جديد للفصل.
 * @param {string} chapterId - رقم الفصل.
 * @param {string} title - عنوان الفصل.
 * @param {string} content - محتوى الفصل.
 * @returns {HTMLElement} - عنصر div جاهز للإضافة للصفحة.
 */
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

/**
 * تحديث واجهة المستخدم بإضافة محتوى الفصل.
 * @param {string} chapterId - رقم الفصل.
 * @param {string} title - عنوان الفصل.
 * @param {string} content - محتوى الفصل.
 * @param {boolean} [append=false] - إذا كانت true، سيتم إلحاق الفصل الجديد بدلاً من استبدال المحتوى.
 */
function updateUI(chapterId, title, content, position = "append") {
  const container = document.getElementById("chapter-text");
  if (!container) return;

  const element = createChapterElement(chapterId, title, content);

  if (position === "prepend") {
    container.prepend(element);
  } else if (position === "append") {
    container.appendChild(element);
  } else {
    container.innerHTML = "";
    container.appendChild(element);
  }
}

/**
 * تحديث الزر العلوي لعرض عنوان الفصل الحالي.
 * @param {string} chapterId - رقم الفصل الحالي.
 */
function updateTitleButton(chapterId) {
  const btn = document.getElementById("title-btn");
  if (!btn) return;

  const chapter = state.chapters.find((c) => c.id === chapterId);
  if (chapter) {
    btn.textContent = `${chapter.id} – ${chapter.title}`;
    btn.classList.add("visible");
  }
}

/**
 * إظهار أو إخفاء وصف القصة (يظهر فقط مع الفصل الأول).
 * @param {string} chapterId - رقم الفصل الحالي.
 */
function updateStoryDescription(chapterId) {
  const container = document.getElementById("story-description-container");
  if (!container) return;

  const isFirstChapter = chapterId === state.chapters[0]?.id;
  container.style.display = isFirstChapter ? "block" : "none";
}

/**
 * تحديث نظام التعليقات ليرتبط بالفصل الصحيح.
 * @param {string} chapterId - رقم الفصل الحالي.
 */
function updateComments(chapterId) {
  if (window.CommentsSystem?.setChapter) {
    window.CommentsSystem.setChapter(`chapter-${chapterId}`);
  }
}

/**
 * إخفاء/إظهار الهيدر الرئيسي (يظهر فقط مع الفصل الأول).
 * @param {string} chapterId - رقم الفصل الحالي.
 */
function updateMainHeaderVisibility(chapterId) {
  const headerContainer = document.getElementById("main-header-container");
  if (!headerContainer) return;

  const isFirstChapter = chapterId === state.chapters[0]?.id;
  headerContainer.style.display = isFirstChapter ? "block" : "none";
}

/**
 * تحديث عداد الكلمات للفصل الحالي.
 * @param {string} chapterId - رقم الفصل الحالي.
 */
function updateWordCount(chapterId) {
  const wordCountBtn = document.getElementById("word-count");
  if (!wordCountBtn) return;

  const selector = `.chapter-block[data-chapter-id="${chapterId}"]`;
  const chapterBlock = document.querySelector(selector);

  if (chapterBlock) {
    const textContent = chapterBlock.textContent || "";
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    wordCountBtn.innerText = words.length + " كلمة";
  } else {
    console.warn(
      `[عداد الكلمات] ⚠️ فشل: لم يتم العثور على العنصر بالـ selector التالي: ${selector}`
    );
    wordCountBtn.innerText = "--- كلمة";
  }
}

// =======================================================================
// 4. التحكم المركزي بالفصل الحالي (Central Chapter Logic)
// -----------------------------------------------------------------------
// دالة محورية مسؤولة عن تعيين الفصل الحالي وتفعيل كل التحديثات
// المرتبطة به في واجهة المستخدم وحفظ التقدم.
// =======================================================================

/**
 * تعيين الفصل الحالي وتحديث جميع الأجزاء المعتمدة عليه.
 * @param {string} chapterId - رقم الفصل لتعيينه كحالي.
 */
function setCurrentChapter(chapterId) {
  if (chapterId === state.currentChapterId) return; // منع التحديثات غير الضرورية

  state.currentChapterId = chapterId;

  // استدعاء جميع دوال التحديث
  updateTitleButton(chapterId);
  updateComments(chapterId);
  updateWordCount(chapterId);
  updateStoryDescription(chapterId);
  updateMainHeaderVisibility(chapterId);

  // -- تحديث عنوان الصفحة --
  const chapter = state.chapters.find((c) => c.id === chapterId);
  if (chapter) {
    document.title = `${chapter.id} - ${chapter.title}`;
  }
  // -- نهاية تحديث عنوان الصفحة --

  // حفظ التقدم في المتصفح
  localStorage.setItem("lastReadChapter", chapterId);

  // تحديث الـ URL
  const newUrl = `#chapter-${chapterId}`;
  // تغيير الـ URL بدون إعادة تحميل الصفحة
  history.pushState(null, "", newUrl);

  console.log(`📖 الفصل الحالي: ${chapterId}`);
}

// =======================================================================
// 5. آلية تحميل الفصول (Chapter Loading Mechanism)
// -----------------------------------------------------------------------
// دوال تدير عملية تحميل الفصل، سواء عند فتح الصفحة لأول مرة،
// أو عند اختيار فصل من القائمة، أو عند التمرير لأسفل.
// =======================================================================

/**
 * تحميل وعرض فصل معين.
 * @param {string} chapterId - رقم الفصل المراد تحميله.
 * @param {boolean} [append=false] - هل يجب إلحاق الفصل بنهاية المحتوى الحالي.
 * @returns {Promise<boolean>} - إرجاع true عند النجاح.
 */
async function loadChapter(chapterId, position = "replace") {
  if (state.isLoading) return false;
  state.isLoading = true;

  try {
    const html = await fetchChapter(chapterId);
    const { title, content } = parseChapter(html, chapterId);

    // يحافظ على ارتفاع الشاشة قبل إضافة المحتوى الجديد
    const oldScrollHeight = document.documentElement.scrollHeight;
    const oldScrollTop = document.documentElement.scrollTop;

    updateUI(chapterId, title, content, position);

    if (position === "prepend") {
      // استعادة مكان القراءة بعد إضافة المحتوى في الأعلى
      const newScrollHeight = document.documentElement.scrollHeight;
      window.scrollTo(0, oldScrollTop + (newScrollHeight - oldScrollHeight));
    } else if (position === "replace") {
      setCurrentChapter(chapterId);
      window.currentChapterNumber = parseInt(chapterId, 10);
      resetInfiniteScroll();

      // Scroll to the chapter title, accounting for the sticky header
      const chapterTitleElement = document.getElementById(
        `chapter-title-${chapterId}`
      );
      if (chapterTitleElement) {
        const stickyHeader = document.querySelector(".body");
        const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
        const elementPosition = chapterTitleElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.scrollY - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "auto",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }

    // إطلاق حدث مخصص لإعلام الأنظمة الأخرى باكتمال التحديث
    document.dispatchEvent(new CustomEvent("contentUpdated"));
    return true;
  } catch (error) {
    console.error(`خطأ في تحميل الفصل ${chapterId}:`, error);
    if (position === "append") {
      // state.reachedEnd = true; // لا تحتاج إلى هذا الخيار لأنه يتم تحديث الصفحة بعد التحميل بشكل دائم
      document.getElementById("loading-spinner").style.display = "none";
    } else if (position === "prepend") {
      state.reachedStart = true;
      document.getElementById("loading-spinner-top").style.display = "none";
    }
    return false;
  } finally {
    state.isLoading = false;
  }
}

/**
 * تحميل الفصل الأولي عند بدء تشغيل الصفحة.
 */
async function loadInitialChapter() {
  try {
    const response = await fetch("chapters.json");
    state.chapters = await response.json();
    window.chapterList = state.chapters; // تعريضه عالميًا للاستخدامات الأخرى

    // -- منطق تحديد الفصل --
    let chapterId = null;

    // 1. التحقق من وجود هاش في الرابط
    const hash = window.location.hash;
    if (hash && hash.startsWith("#chapter-")) {
      const idFromHash = hash.substring(9); // استخراج الرقم من #chapter-...
      if (state.chapters.some((c) => c.id === idFromHash)) {
        chapterId = idFromHash;
        console.log(`تحميل الفصل من الرابط: ${chapterId}`);
      }
    }

    // 2. إذا لم يوجد فصل من الرابط، تحقق من التخزين المحلي
    if (!chapterId) {
      const idFromStorage = localStorage.getItem("lastReadChapter");
      if (idFromStorage && state.chapters.some((c) => c.id === idFromStorage)) {
        chapterId = idFromStorage;
      }
    }

    // 3. إذا لم يتوفر أي مما سبق، ابدأ من الفصل الأول
    if (!chapterId) {
      chapterId = state.chapters[0]?.id;
    }
    // -- نهاية منطق تحديد الفصل --

    if (chapterId) {
      await loadChapter(chapterId);
    } else {
      console.error("لا توجد فصول متاحة");
    }
  } catch (error) {
    console.error("فشل في تحميل الفصول:", error);
  }
}

// =======================================================================
// 6. نظام التمرير اللانهائي (Infinite Scroll)
// -----------------------------------------------------------------------
// يستخدم IntersectionObserver لتحميل الفصل التالي تلقائيًا
// عندما يصل القارئ إلى نهاية الصفحة.
// =======================================================================

function initInfiniteScroll() {
  const sentinel = document.getElementById("scroll-end-sentinel");
  const spinner = document.getElementById("loading-spinner");
  if (!sentinel || !spinner) return;

  state.observers.infinite?.disconnect();

  state.observers.infinite = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting && !state.isLoading && !state.reachedEnd) {
        spinner.style.display = "block";

        const currentIndex = state.chapters.findIndex(
          (c) => c.id === state.currentChapterId
        );

        // ابحث عن الفصل التالي بناءً على آخر فصل تم تحميله
        const lastLoadedChapterId = document
          .querySelector(".chapter-block:last-child")
          ?.dataset.chapterId.toString();

        const lastLoadedChapterIndex = state.chapters.findIndex(
          (c) => c.id === lastLoadedChapterId
        );

        const nextChapter = state.chapters[lastLoadedChapterIndex + 1];

        if (nextChapter) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          await loadChapter(nextChapter.id, "append");
        } else {
          state.reachedEnd = true;
          console.log("وصلت إلى نهاية الرواية.");
        }

        spinner.style.display = "none";
      }
    },
    { threshold: 1.0 }
  );

  state.observers.infinite.observe(sentinel);
}

function initInfiniteScrollUp() {
  const sentinel = document.getElementById("scroll-start-sentinel");
  const spinner = document.getElementById("loading-spinner-top");
  if (!sentinel || !spinner) return;

  state.observers.infiniteUp?.disconnect();

  state.observers.infiniteUp = new IntersectionObserver(
    async (entries) => {
      if (
        entries[0].isIntersecting &&
        !state.isLoading &&
        !state.reachedStart
      ) {
        spinner.style.display = "block";

        const firstLoadedChapterId = document
          .querySelector(".chapter-block:first-child")
          ?.dataset.chapterId.toString();

        const firstLoadedChapterIndex = state.chapters.findIndex(
          (c) => c.id === firstLoadedChapterId
        );

        const prevChapter = state.chapters[firstLoadedChapterIndex - 1];

        if (prevChapter) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          await loadChapter(prevChapter.id, "prepend");
        } else {
          state.reachedStart = true;
          console.log("وصلت إلى بداية الرواية.");
        }

        spinner.style.display = "none";
      }
    },
    { threshold: 1.0 }
  );

  state.observers.infiniteUp.observe(sentinel);
}

/**
 * إعادة تعيين نظام التمرير اللانهائي (مفيد عند التحميل اليدوي).
 */
function resetInfiniteScroll() {
  state.isLoading = false;
  state.reachedEnd = false;
  state.reachedStart = false;
  state.observers.infinite?.disconnect();
  state.observers.infiniteUp?.disconnect();
  initInfiniteScroll();
  initInfiniteScrollUp();
}

// =======================================================================
// 7. نظام تتبع الفصول الذكي (Smart Chapter Tracking)
// -----------------------------------------------------------------------
// الطريقة الأذكى لتحديد الفصل الحالي. تستخدم intersectionRatio
// لتحديد الفصل الأكثر ظهوراً على الشاشة بدقة عالية.
// =======================================================================

function initChapterTracking() {
  state.observers.tracking?.disconnect();

  const visibilityMap = new Map(); // خريطة لتخزين نسبة ظهور كل فصل

  state.observers.tracking = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const chapterId = entry.target.dataset.chapterId;
        if (entry.isIntersecting) {
          visibilityMap.set(chapterId, entry.intersectionRatio);
        } else {
          visibilityMap.delete(chapterId);
        }
      });

      // إيجاد الفصل صاحب أعلى نسبة ظهور
      if (visibilityMap.size > 0) {
        let maxRatio = 0;
        let mostVisibleChapter = null;

        visibilityMap.forEach((ratio, chapterId) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleChapter = chapterId;
          }
        });

        // تحديث الفصل الحالي إذا تم العثور على فصل مهيمن
        if (mostVisibleChapter) {
          setCurrentChapter(mostVisibleChapter);
        }
      }
    },
    {
      rootMargin: "0px 0px -30% 0px", // منطقة مراقبة محسّنة
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], // نسب متعددة لدقة أعلى
    }
  );

  // مراقبة جميع عناصر الفصول الموجودة في الصفحة
  document.querySelectorAll(".chapter-block").forEach((block) => {
    state.observers.tracking.observe(block);
  });
}

// =======================================================================
// 8. التهيئة ونقاط الدخول (Initialization & Entry Points)
// -----------------------------------------------------------------------
// ربط كل شيء معًا. يبدأ تحميل المحتوى عند جهوزية الصفحة،
// ويستمع للأحداث لتحديث الأنظمة عند الحاجة.
// =======================================================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadInitialChapter();
  initInfiniteScroll();
  initInfiniteScrollUp();
  initChapterTracking();
});

// عند إضافة محتوى جديد، يجب إعادة تشغيل نظام التتبع ليشمل العناصر الجديدة
document.addEventListener("contentUpdated", initChapterTracking);

// تعريض دالة `loadChapter` عالميًا حتى يمكن استدعاؤها من عناصر HTML
// (مثل أزرار قائمة الفصول).
window.loadChapter = loadChapter;
