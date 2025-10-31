/**
 * ===========================================================
 * 📘 نظام قراءة الرواية - نسخة Infinity Scroll احترافية
 * ===========================================================
 * المميزات:
 * ✅ تحميل ديناميكي للفصول بالتدريج (Infinity Scroll)
 * ✅ حفظ موقع القراءة (Resume from last read)
 * ✅ تحديث نظام التعليقات
 * ✅ استخدام العناوين من ملف chapters.json
 * ✅ تأخير نصف ثانية بين التحميلات
 * ✅ إمكانية إعادة تهيئة النظام resetInfiniteScroll
 * ===========================================================
 */

/**
 * تحميل ملف فصل HTML
 */
async function fetchChapterHtml(chapterNumber) {
  const response = await fetch(`chapters/${chapterNumber}.html`);
  if (!response.ok) {
    throw new Error(`فشل تحميل الفصل ${chapterNumber}: ${response.status}`);
  }
  return await response.text();
}

/**
 * تحليل محتوى الفصل واستخراج العنوان من JSON بدلاً من HTML
 */
function parseChapter(chapterHtml, chapterNumber) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = chapterHtml;

  // الحصول على العنوان من JSON
  const chapterData = window.chapterList.find(
    (c) => parseInt(c.id, 10) === parseInt(chapterNumber, 10)
  );
  const title = chapterData ? chapterData.title : `الفصل ${chapterNumber}`;

  // إزالة أي عنصر عنوان داخلي من الفصل
  const oldTitle = tempDiv.querySelector("#chapter-title-data");
  if (oldTitle) oldTitle.remove();

  return { title, content: tempDiv.innerHTML };
}

/**
 * تحديث واجهة المستخدم بالفصل الجديد
 */
function updateChapterInDom(title, content, append = false, chapterNumber) {
  const titleElement = document.getElementById("chapter-title");
  const paragraphContainer = document.getElementById("chapter-text");

  if (!paragraphContainer) return;

  // ✅ توليد العنوان الكامل بالفصل + الاسم
  const fullTitle = `الفصل ${chapterNumber} – ${title}`;

  // 🔹 تحديث العنوان الرئيسي (اللي فوق الصفحة)
  if (titleElement && !append) {
    titleElement.textContent = fullTitle;
  }

  // 🔹 في كل الحالات، نضيف داخل المحتوى <h2> يحمل ID الفصل
  if (append) {
    // ✅ في حالة التحميل التدريجي (infinite scroll)
    const chapterWrapper = document.createElement("div");
    chapterWrapper.classList.add("chapter-block");
    chapterWrapper.setAttribute("data-chapter-id", chapterNumber);
    chapterWrapper.innerHTML = `
      <h2 id="chapter-${chapterNumber}" class="chapter-title">${fullTitle}</h2>
      ${content}
    `;
    paragraphContainer.appendChild(chapterWrapper);
  } else {
    // ✅ في حالة أول فصل يتم تحميله (من القائمة أو من البداية)
    // نضيف العنوان الداخلي علشان وظائف التتبع تشتغل عليه
    paragraphContainer.innerHTML = `
      <div class="chapter-block" data-chapter-id="${chapterNumber}">
        <h2 id="chapter-${chapterNumber}" class="chapter-title">${fullTitle}</h2>
        ${content}
      </div>
    `;
  }
}

/**
 * إظهار أو إخفاء وصف القصة بناءً على الفصل
 */
async function handleStoryDescriptionVisibility(chapterNumber) {
  const storyContainer = document.getElementById("story-description-container");
  if (!storyContainer) return;

  try {
    const firstChapter = Math.min(
      ...window.chapterList.map((c) => parseInt(c.id, 10))
    );

    if (parseInt(chapterNumber, 10) === firstChapter) {
      storyContainer.style.display = "block";
    } else {
      storyContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error handling story description visibility:", error);
  }
}

/**
 * تحديث نظام التعليقات
 */
function updateCommentsSystem(chapterNumber) {
  if (
    window.CommentsSystem &&
    typeof window.CommentsSystem.setChapter === "function"
  ) {
    const chapterId = `chapter-${chapterNumber}`;
    window.CommentsSystem.setChapter(chapterId);
    console.log(`💬 Comments system updated for chapter: ${chapterId}`);
  }
}

/**
 * تحميل فصل محدد وتحديث الصفحة
 */
async function loadChapter(chapterNumber, append = false) {
  try {
    const chapterHtml = await fetchChapterHtml(chapterNumber);
    const { title, content } = parseChapter(chapterHtml, chapterNumber);

    updateChapterInDom(title, content, append, chapterNumber);
    await handleStoryDescriptionVisibility(chapterNumber);
    updateCommentsSystem(chapterNumber);

    localStorage.setItem("lastReadChapter", chapterNumber);
    window.currentChapterNumber = parseInt(chapterNumber, 10);

    // حدث عام يفيد أن المحتوى انتهى من التحميل
    document.dispatchEvent(new CustomEvent("contentLoaded"));

    // 🔴 الحدث الجديد: يخبر باقي الأنظمة أن الفصل تغيّر فورًا
    document.dispatchEvent(
      new CustomEvent("chapterChanged", {
        detail: { chapterNumber: parseInt(chapterNumber, 10), title },
      })
    );

    // إعادة تهيئة الـ infinite scroll (ضروري بعد التنقل اليدوي)
    // فقط إذا لم يكن append (أي هو تحميل تحويلي/يدوي)
    if (!append && typeof resetInfiniteScroll === "function") {
      resetInfiniteScroll();
    }

    return true;
  } catch (error) {
    console.error(`Error loading chapter ${chapterNumber}:`, error);
    return false;
  }
}

/**
 * تحميل أول فصل أو آخر فصل تمت قراءته
 */
async function loadInitialChapter() {
  try {
    const res = await fetch("chapters.json");
    window.chapterList = await res.json(); // ✅ حفظ قائمة الفصول عالمياً

    const lastReadChapter = localStorage.getItem("lastReadChapter");
    let chapterToLoad;

    if (lastReadChapter) {
      chapterToLoad = window.chapterList.find((c) => c.id === lastReadChapter);
    }

    if (!chapterToLoad) {
      // تحميل أول فصل
      chapterToLoad = window.chapterList.reduce((first, chapter) => {
        const chapterId = parseInt(chapter.id, 10);
        return chapterId < (first ? parseInt(first.id, 10) : Infinity)
          ? chapter
          : first;
      }, null);
    }

    if (chapterToLoad) {
      await loadChapter(chapterToLoad.id);
      window.currentChapterNumber = parseInt(chapterToLoad.id, 10);
      if (typeof window.updateButtonVisibility === "function") {
        window.updateButtonVisibility();
      }
    }
  } catch (error) {
    console.error("Failed to load initial chapter data:", error);
  }
}

/**
 * إعادة تهيئة نظام التمرير اللانهائي (عند الانتقال اليدوي)
 */
function resetInfiniteScroll() {
  console.log("♻️ إعادة تهيئة نظام التمرير اللانهائي...");
  window.isLoading = false;
  window.reachedEnd = false;

  if (window.infiniteObserver) {
    window.infiniteObserver.disconnect();
  }

  const sentinel = document.getElementById("scroll-end-sentinel");
  if (sentinel) {
    window.infiniteObserver = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !window.isLoading && !window.reachedEnd) {
        window.isLoading = true;
        const nextChapter = await loadNextChapter();
        if (!nextChapter) window.reachedEnd = true;
        window.isLoading = false;
      }
    });

    window.infiniteObserver.observe(sentinel);
  }
}

/**
 * نظام التمرير اللانهائي (Infinity Scroll)
 */
async function infinityScrollManager() {
  const sentinel = document.getElementById("scroll-end-sentinel");
  const spinner = document.getElementById("loading-spinner");
  if (!sentinel || !spinner) return;

  const chapterIds = window.chapterList
    .map((c) => parseInt(c.id, 10))
    .sort((a, b) => a - b);

  let loadedChapters = [window.currentChapterNumber];
  let loadingLock = false;

  const observer = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting && !loadingLock) {
        const lastLoadedChapter = loadedChapters[loadedChapters.length - 1];
        const nextChapterIndex = chapterIds.indexOf(lastLoadedChapter) + 1;

        if (nextChapterIndex < chapterIds.length) {
          loadingLock = true;
          spinner.style.display = "block";

          const nextChapterId = chapterIds[nextChapterIndex];
          console.log(`📖 محاولة تحميل الفصل التالي: ${nextChapterId}`);

          await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ نصف ثانية تأخير

          const success = await loadChapter(nextChapterId, true);

          if (success) {
            loadedChapters.push(nextChapterId);
            window.currentChapterNumber = nextChapterId;

            if (typeof window.updateButtonVisibility === "function") {
              window.updateButtonVisibility();
            }

            console.log(`✅ تم تحميل الفصل ${nextChapterId}`);
          } else {
            console.warn(`⚠️ فشل تحميل الفصل ${nextChapterId}`);
            observer.disconnect();
          }

          spinner.style.display = "none";
          loadingLock = false;
        } else {
          console.log("📚 لا توجد فصول أخرى للتحميل.");
          observer.disconnect();
        }
      }
    },
    { threshold: 1.0 }
  );

  observer.observe(sentinel);
}

/**
 * عند تحميل الصفحة
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadInitialChapter();
  await infinityScrollManager();
});

/**
 * 🧭 نظام تتبع الفصول أثناء التمرير لتحديث العنوان في الزر العلوي (title-btn)
 */
function initChapterTracking() {
  const titleBtn = document.getElementById("title-btn");
  if (!titleBtn) return;

  const chapters = document.querySelectorAll(".chapter-title");
  if (!chapters.length) return;

  let currentVisibleChapter = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const chapterId = entry.target.getAttribute("id");
        const chapterNumber = chapterId?.split("-")[1];
        const chapterData = window.chapterList.find(
          (c) => c.id === chapterNumber
        );

        if (entry.isIntersecting) {
          // ✅ هذا الفصل هو الآن المعروض في الشاشة
          currentVisibleChapter = chapterNumber;

          const newTitle = chapterData
            ? `${chapterData.id} – ${chapterData.title}`
            : entry.target.textContent;

          // ✅ نحدث العنوان في الزر العلوي فورًا
          titleBtn.textContent = newTitle;
          titleBtn.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.4, // عندما يظهر 40% من الفصل في الشاشة
    }
  );

  chapters.forEach((ch) => observer.observe(ch));

  // 🔁 إعادة تفعيل المتابع بعد تحميل فصول جديدة
  document.addEventListener("contentLoaded", () => {
    observer.disconnect();
    initChapterTracking();
  });
}

// ✅ تفعيل النظام بعد تحميل أول فصل
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("chapterChanged", () => {
    initChapterTracking();
  });

  // كمان بعد أول تحميل
  setTimeout(initChapterTracking, 1000);
});

// /**
//  * Fetches the HTML content of a specific chapter.
//  * @param {string | number} chapterNumber - The chapter to fetch.
//  * @returns {Promise<string>} - The HTML content of the chapter.
//  */
// async function fetchChapterHtml(chapterNumber) {
//   const response = await fetch(`chapters/${chapterNumber}.html`);
//   if (!response.ok) {
//     throw new Error(
//       `Failed to fetch chapter ${chapterNumber}: ${response.status}`
//     );
//   }
//   return await response.text();
// }

// /**
//  * Parses the chapter HTML to extract the title and content.
//  * @param {string} chapterHtml - The HTML content of the chapter.
//  * @param {string | number} chapterNumber - The chapter number.
//  * @returns {{title: string, content: string}} - The chapter title and content.
//  */
// function parseChapter(chapterHtml, chapterNumber) {
//   const tempDiv = document.createElement("div");
//   tempDiv.innerHTML = chapterHtml;

//   const newTitleElement = tempDiv.querySelector("#chapter-title-data");
//   let title = `الفصل ${chapterNumber}`;
//   if (newTitleElement) {
//     title = newTitleElement.textContent;
//     newTitleElement.remove();
//   }
//   return { title, content: tempDiv.innerHTML };
// }

// /**
//  * Updates the DOM with the new chapter title and content.
//  * @param {string} title - The new chapter title.
//  * @param {string} content - The new chapter content.
//  */
// function updateChapterInDom(title, content, append = false) {
//   const titleElement = document.getElementById("chapter-title");
//   const paragraphContainer = document.getElementById("chapter-text");

//   if (titleElement && !append) {
//     titleElement.textContent = title;
//   }

//   if (paragraphContainer) {
//     if (append) {
//       const chapterWrapper = document.createElement("div");
//       chapterWrapper.innerHTML = `<h2>${title}</h2>${content}`;
//       paragraphContainer.appendChild(chapterWrapper);
//     } else {
//       paragraphContainer.innerHTML = content;
//     }
//   }
// }

// /**
//  * Shows or hides the story description based on the chapter number.
//  * @param {string | number} chapterNumber - The current chapter number.
//  */
// async function handleStoryDescriptionVisibility(chapterNumber) {
//   const storyContainer = document.getElementById("story-description-container");
//   if (!storyContainer) return;

//   try {
//     const chaptersResponse = await fetch("chapters.json");
//     const chapters = await chaptersResponse.json();
//     const firstChapter = Math.min(...chapters.map((c) => parseInt(c.id, 10)));

//     storyContainer.style.display =
//       parseInt(chapterNumber, 10) === firstChapter ? "block" : "none";
//   } catch (error) {
//     console.error("Error handling story description visibility:", error);
//   }
// }

// /**
//  * Updates the comments system with the current chapter ID.
//  * @param {string | number} chapterNumber - The current chapter number.
//  */
// function updateCommentsSystem(chapterNumber) {
//   if (
//     window.CommentsSystem &&
//     typeof window.CommentsSystem.setChapter === "function"
//   ) {
//     const chapterId = `chapter-${chapterNumber}`;
//     window.CommentsSystem.setChapter(chapterId);
//     console.log(`🚀 Comments system updated for chapter: ${chapterId}`);
//   }
// }

// /**
//  * Loads a chapter, updates the DOM, and handles related side effects.
//  * @param {string | number} chapterNumber - The chapter to load.
//  * @returns {Promise<boolean>} - True if the chapter was loaded successfully, false otherwise.
//  */
// async function loadChapter(chapterNumber, append = false) {
//   try {
//     const chapterHtml = await fetchChapterHtml(chapterNumber);
//     const { title, content } = parseChapter(chapterHtml, chapterNumber);
//     updateChapterInDom(title, content, append);

//     await handleStoryDescriptionVisibility(chapterNumber);
//     updateCommentsSystem(chapterNumber);

//     localStorage.setItem("lastReadChapter", chapterNumber);
//     window.currentChapterNumber = parseInt(chapterNumber, 10);

//     document.dispatchEvent(new CustomEvent("contentLoaded"));

//     // ✅ بعد كل تحميل فصل يدوي أو تلقائي، تأكد من إعادة تهيئة الـ scroll
//     if (!append) {
//       resetInfiniteScroll();
//     }

//     return true;
//   } catch (error) {
//     console.error(`Error loading chapter ${chapterNumber}:`, error);
//     return false;
//   }
// }

// /**
//  * Fetches the list of chapters and loads the first one by default.
//  */
// async function loadInitialChapter() {
//   try {
//     const lastReadChapter = localStorage.getItem("lastReadChapter");
//     const res = await fetch("chapters.json");
//     const chapters = await res.json();

//     let chapterToLoad;
//     if (lastReadChapter) {
//       chapterToLoad = chapters.find((c) => c.id === lastReadChapter);
//     }

//     if (!chapterToLoad) {
//       chapterToLoad = chapters.reduce((first, chapter) => {
//         const chapterId = parseInt(chapter.id, 10);
//         return chapterId < (first ? parseInt(first.id, 10) : Infinity)
//           ? chapter
//           : first;
//       }, null);
//     }

//     if (chapterToLoad) {
//       await loadChapter(chapterToLoad.id);

//       resetInfiniteScroll(); // ✅ تأكيد تهيئة النظام بعد أول فصل
//     }
//   } catch (error) {
//     console.error("Failed to load initial chapter data:", error);
//   }
// }

// /**
//  * 🧩 Reset Infinite Scroll (عند الانتقال اليدوي أو بعد تحميل أول فصل)
//  */
// function resetInfiniteScroll() {
//   console.log("♻️ إعادة تهيئة نظام التمرير اللانهائي...");
//   window.isLoading = false;
//   window.reachedEnd = false;

//   if (window.infiniteObserver) {
//     window.infiniteObserver.disconnect();
//   }

//   // إعادة إنشاء الـ observer
//   setTimeout(() => {
//     infinityScrollManager();
//   }, 300);
// }

// /**
//  * 🔄 Manages the infinite scroll feature.
//  */
// async function infinityScrollManager() {
//   const sentinel = document.getElementById("scroll-end-sentinel");
//   const spinner = document.getElementById("loading-spinner");
//   if (!sentinel || !spinner) return;

//   const chaptersResponse = await fetch("chapters.json");
//   const chapters = await chaptersResponse.json();
//   const chapterIds = chapters
//     .map((c) => parseInt(c.id, 10))
//     .sort((a, b) => a - b);

//   let loadedChapters = [window.currentChapterNumber];
//   let loadingLock = false;

//   const observer = new IntersectionObserver(
//     async (entries) => {
//       if (entries[0].isIntersecting && !loadingLock) {
//         const lastLoadedChapter = loadedChapters[loadedChapters.length - 1];
//         const nextChapterIndex = chapterIds.indexOf(lastLoadedChapter) + 1;

//         if (nextChapterIndex < chapterIds.length) {
//           loadingLock = true;
//           spinner.style.display = "block";

//           const nextChapterId = chapterIds[nextChapterIndex];
//           console.log(`📖 محاولة تحميل الفصل التالي: ${nextChapterId}`);

//           await new Promise((resolve) => setTimeout(resolve, 500));

//           const success = await loadChapter(nextChapterId, true);

//           if (success) {
//             loadedChapters.push(nextChapterId);
//             console.log(`✅ تم تحميل الفصل ${nextChapterId}`);
//           } else {
//             console.warn(
//               `⚠️ فشل تحميل الفصل ${nextChapterId} — سيتم إيقاف التحميل التلقائي.`
//             );
//             observer.disconnect();
//             window.reachedEnd = true;
//           }

//           spinner.style.display = "none";
//           loadingLock = false;
//         } else {
//           console.log("📚 لا توجد فصول أخرى للتحميل.");
//           observer.disconnect();
//           window.reachedEnd = true;
//         }
//       }
//     },
//     { threshold: 1.0 }
//   );

//   observer.observe(sentinel);
//   window.infiniteObserver = observer;
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   await loadInitialChapter();
// });
