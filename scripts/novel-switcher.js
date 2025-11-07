// 📦 استيراد الدوال المساعدة
import { getReadChapters } from "./utils.js";

// 📘 إنشاء عنصر يمثل الفصل داخل القائمة
function createChapterListItem(chapter, novelData, novelId, readChapters) {
  const chapterItem = document.createElement("a");
  chapterItem.href = "#";
  chapterItem.className = "chapter-item";
  chapterItem.dataset.chapterId = chapter.id;
  chapterItem.dataset.novelId = novelId;

  // ✅ تحديد ما إذا كان الفصل مقروءًا أم لا
  if (readChapters.has(chapter.id)) {
    chapterItem.classList.add("read-chapter");
  }

  // 🎨 هيكل HTML لعرض تفاصيل الفصل
  chapterItem.innerHTML = `
    <div class="chapter-item-details">
      <div class="chapter-item-header">
      </div>
      <div class="chapter-item-body">
        <span class="chapter-number">${chapter.id}</span>
        <span class="dash">-</span>        
        <span class="chapter-title-in-list">${chapter.title}</span>
        <span class="chapter-read-icon">
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="17px" height="17px" fill="green" viewBox="0 0 347 355"><path d="M131.6 39.5c-6.2 1.6-10 5.4-19.6 19.5-9.4 13.8-12.7 17-20.6 19.9-3.2 1.2-6.6 2.4-7.4 2.8-1.5.6-1.9.7-7.8 1.8-5.7 1-15.5 5.7-19 8.9-5.1 4.8-6.3 10.5-6 29.7.2 19.9-.6 22.5-10.8 35.5-11.8 14.9-13.8 18.6-13.9 26.4 0 6.7 2.4 11.6 10.4 21.5 7.6 9.4 11.9 16.2 13.3 21 .8 2.5 1.1 9.8 1 19.7-.4 22.1 1.3 27.1 11.1 32.7 2.8 1.6 9.5 4.1 14.7 5.4 16.9 4.5 19.8 5.9 26.7 13.4 3.5 3.7 6.3 7 6.3 7.4 0 1.2 8.9 14 11.8 17.2 1.4 1.5 4.6 3.7 7 4.8 5.6 2.7 13.8 2.2 23.2-1.6 10.1-4.1 22-7.5 26.1-7.5 2.1 0 9.1 1.8 15.6 4.1 21.7 7.5 26.2 8.2 32.7 5.5 4.8-2 9.3-6.9 17.6-19.2 9-13.4 13.2-17 24.9-21 7.4-2.5 8.8-3.3 7.8-4.4-1-1.2-.9-1.2.4-.2 2.2 1.7 7.1.6 14.9-3.4 11.3-5.6 13.9-12.5 12.6-33.3-1.1-19 .8-24.3 16.2-42.9 4.3-5.4 6.4-8.9 7.6-13 2.7-9.8.4-16-11.2-30.3-3.8-4.8-8.2-11.3-9.8-14.5-2.9-5.9-2.9-6-2.9-24.9 0-17.5-.2-19.3-2.1-23-1.2-2.2-3-4.7-4-5.6-3.7-3.2-15.4-8.1-22.4-9.3-1.4-.2-6.2-1.8-10.7-3.5-9.6-3.7-13-7-22.7-21.8-5.7-8.7-12.6-16.9-12.6-15 0 .4-.9-.2-2-1.3-3-3-13.4-3-21 0-27 10.6-30.5 10.7-55.5.9-7.6-2.9-14.5-3.8-19.9-2.4m102 88.1c13.3 10.8 15.4 12.6 15.4 13.3 0 .4-3 4.3-6.6 8.6-10.3 12.6-10.8 13.2-13.4 16.6-2.1 2.8-10.3 12.7-17 20.7-1.1 1.3-2 2.6-2 2.8s-3.2 4.1-7.1 8.7c-3.9 4.5-9.2 10.9-11.7 14.2s-4.9 6.2-5.2 6.5c-.9.9-14.5 17.4-18 22-1.9 2.5-3.7 4.4-4 5s-2.3 2.6-4.4 5.3c-4.4 5.3-4.5 5.3-11.6-1.3-5.2-4.9-41.8-38.1-45.4-41.2l-3.1-2.6 3.7-3.9c9.5-9.9 13.8-14.9 13.8-16 0-.6.9-1.5 2.1-1.8 1.5-.5 3 .1 5.3 2.3 3.6 3.4 12.4 11.5 20.4 18.9 3.1 2.9 6.2 5.3 6.7 5.3.9 0 9.5-9.3 9.5-10.3 0-.2 1.3-1.9 3-3.8 3.4-3.9 37.7-45.9 48.9-59.9 9.5-11.9 12.2-15 13.1-15 .4 0 3.8 2.5 7.6 5.6"/></svg>
        </span>
      </div>
    </div>
  `;
  return chapterItem;
}

// 📚 دالة عرض قائمة الفصول داخل الرواية
function renderChapterList(novelData, novelId) {
  const chapterListDiv = document.getElementById("chapter-list");
  if (chapterListDiv) {
    chapterListDiv.innerHTML = ""; // 🧹 تنظيف القائمة القديمة
    const readChapters = getReadChapters(novelId);

    novelData.chapters.forEach((chapter) => {
      const chapterItem = createChapterListItem(
        chapter,
        novelData,
        novelId,
        readChapters
      );
      chapterListDiv.appendChild(chapterItem);
    });
  }
}

// 🚀 تشغيل التطبيق بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  let novels = [];
  let currentNovelIndex = 0;

  // 🧠 تهيئة النظام وتحميل أول رواية
  async function initialize() {
    try {
      const response = await fetch("novels.json");
      if (!response.ok)
        throw new Error(`فشل تحميل بيانات الروايات: ${response.status}`);

      novels = await response.json();
      window.allNovels = novels; // 📤 حفظ الروايات في المتغير العام

      // 📍 تحديد آخر رواية تم فتحها
      const lastOpenNovelId = localStorage.getItem("lastOpenNovelId");
      const novelToLoad =
        novels.find((n) => n.id === lastOpenNovelId)?.id || novels[0].id;

      await loadNovel(novelToLoad);
    } catch (error) {
      console.error("خطأ أثناء التهيئة:", error);
    }
  }

  // 📖 تحميل بيانات رواية محددة
  async function loadNovel(novelId) {
    if (window.resetReaderState) window.resetReaderState();

    try {
      const novelDataPath = novels.find((n) => n.id === novelId).path;
      const response = await fetch(novelDataPath);
      if (!response.ok)
        throw new Error(`فشل تحميل بيانات الرواية: ${response.status}`);

      const novelData = await response.json();
      localStorage.setItem("lastOpenNovelId", novelId);

      // 🔄 تحديث البيانات العامة
      window.currentNovelId = novelId;
      window.currentNovelChapters = novelData.chapters;

      // 🖼️ تحديث الصورة والعنوان والوصف
      const cardImg = document.querySelector(".card-img");
      const cardTitle = document.querySelector(".card-title");
      if (cardImg) cardImg.src = novelData.novel.image;
      if (cardTitle) cardTitle.textContent = novelData.novel.title;

      // 🎯 تحديث العناوين في الأعلى
      const logoTitle = document.querySelector(".header .title");
      const carouselLogoTitle = document.getElementById("logo");
      if (logoTitle) logoTitle.textContent = novelData.novel.title;
      if (carouselLogoTitle)
        carouselLogoTitle.textContent = novelData.novel.title;

      // 📝 تحديث وصف القصة
      const storyDescription = document.getElementById(
        "story-description-text"
      );
      if (storyDescription)
        storyDescription.textContent = novelData.novel.description;

      // 📜 عرض قائمة الفصول
      renderChapterList(novelData, novelId);

      // 🔁 تحميل آخر فصل تم قراءته
      let chapterToLoad = localStorage.getItem(`lastReadChapter_${novelId}`);
      if (
        !chapterToLoad ||
        !novelData.chapters.some((c) => c.id === chapterToLoad)
      ) {
        chapterToLoad = novelData.chapters[0]?.id;
      }
      if (chapterToLoad) await window.loadChapter(novelId, chapterToLoad);

      // ✅ إظهار المحتوى وإخفاء التحميل
      const loader = document.getElementById("global-loader");
      const mainContent = document.querySelector(".main-content-wrapper");
      if (loader) loader.style.display = "none";
      if (mainContent) mainContent.style.visibility = "visible";
    } catch (error) {
      console.error(`خطأ أثناء تحميل الرواية ${novelId}:`, error);
    }
  }

  // ⏭️ التبديل إلى الرواية التالية
  function switchToNextNovel() {
    currentNovelIndex = (currentNovelIndex + 1) % novels.length;
    loadNovel(novels[currentNovelIndex].id);
  }

  // ⏮️ التبديل إلى الرواية السابقة
  function switchToPreviousNovel() {
    currentNovelIndex = (currentNovelIndex - 1 + novels.length) % novels.length;
    loadNovel(novels[currentNovelIndex].id);
  }

  // 🔗 جعل دوال التنقل متاحة عالميًا
  window.novelSwitcher = { switchToNextNovel, switchToPreviousNovel };

  // 🧱 بناء قائمة الروايات (الواجهة الرئيسية)
  async function populateNovelListContent() {
    console.log("تم استدعاء populateNovelListContent");
    const novelListContainer = document.getElementById("novel-list");
    if (!novelListContainer)
      return console.error("❌ لم يتم العثور على عنصر #novel-list");

    // 🧩 تحميل بيانات الروايات إن لم تكن موجودة
    if (novels.length === 0) {
      const response = await fetch("novels.json");
      if (!response.ok)
        throw new Error(`فشل تحميل الروايات: ${response.status}`);
      novels = await response.json();
    }

    novelListContainer.innerHTML = ""; // 🧹 تنظيف القائمة القديمة

    // 📊 جلب عدد الفصول لكل رواية
    const novelDataPromises = novels.map(async (novel) => {
      try {
        const response = await fetch(novel.path);
        if (!response.ok) throw new Error();
        const data = await response.json();
        return {
          ...novel,
          chapterCount: data.chapters.length,
          description: data.novel.description,
        };
      } catch {
        return { ...novel, chapterCount: 0 };
      }
    });

    const novelsWithChapterCounts = await Promise.all(novelDataPromises);

    // 🧱 إنشاء عناصر الروايات في القائمة
    novelsWithChapterCounts.forEach((novel) => {
      const novelItem = document.createElement("a");
      novelItem.href = "#";
      novelItem.className = "novel-item";
      novelItem.dataset.novelId = novel.id;

      // 💅 بناء الهيكل الداخلي لعرض الرواية
      novelItem.innerHTML = `
        <img class="novel-item-img lazy" data-src="${novel.image}" alt="${
        novel.title
      }" src="img/pic1.webp">
        <div class="novel-item-details">
          <div class="novel-item-header">
            <p class="novel-title">${novel.title}</p>
          </div>
          <div class="novel-item-body">
            <span class="novel-chapter-count">
              ${getReadChapters(novel.id).size}/${novel.chapterCount}
            </span>
          </div>
        </div>
        <div class="novel-item-description">
          <p>${novel.description}</p>
        </div>
      `;

      // 👆 متغيرات لتتبع الضغط المطول
      let pressTimer = null;
      let hasMovedDuringPress = false;
      let pressStartX = 0;
      let pressStartY = 0;

      // 🖱️ معالجة بداية الضغط
      function handlePressStart(e) {
        const touch = e.touches ? e.touches[0] : e;
        pressStartX = touch.clientX;
        pressStartY = touch.clientY;
        hasMovedDuringPress = false;

        pressTimer = window.setTimeout(() => {
          if (!hasMovedDuringPress) {
            // إغلاق العنصر الآخر المفتوح
            const expanded = document.querySelector(".novel-item.expanded");
            if (expanded && expanded !== novelItem) {
              expanded.classList.remove("expanded");
            }
            // فتح/إغلاق العنصر الحالي
            novelItem.classList.toggle("expanded");
          }
        }, 500);
      }

      // 🖱️ معالجة حركة الماوس/اللمس
      function handleMove(e) {
        if (pressTimer) {
          const touch = e.touches ? e.touches[0] : e;
          const deltaX = Math.abs(touch.clientX - pressStartX);
          const deltaY = Math.abs(touch.clientY - pressStartY);

          // إذا تحرك أكثر من 10px، اعتبره scroll وليس ضغط
          if (deltaX > 10 || deltaY > 10) {
            hasMovedDuringPress = true;
            clearTimeout(pressTimer);
          }
        }
      }

      // 🖱️ معالجة انتهاء الضغط
      function handlePressEnd() {
        clearTimeout(pressTimer);
      }

      // 🖱️ أحداث الماوس
      novelItem.addEventListener("mousedown", handlePressStart);
      novelItem.addEventListener("mousemove", handleMove);
      novelItem.addEventListener("mouseup", handlePressEnd);
      novelItem.addEventListener("mouseleave", handlePressEnd);

      // 🖱️ أحداث اللمس
      novelItem.addEventListener("touchstart", handlePressStart, {
        passive: true,
      });
      novelItem.addEventListener("touchmove", handleMove, { passive: true });
      novelItem.addEventListener("touchend", handlePressEnd);
      novelItem.addEventListener("touchcancel", handlePressEnd);

      // 🖱️ معالجة النقر العادي
      novelItem.addEventListener("click", async (e) => {
        // لا تحمل رواية جديدة إذا كانت توسعة الوصف هي السبب
        if (novelItem.classList.contains("expanded")) {
          e.preventDefault();
          return;
        }

        await loadNovel(novel.id);
        if (window.novelListUI && window.novelListUI._hideList)
          window.novelListUI._hideList();
      });

      novelListContainer.appendChild(novelItem);
    });

    // 💤 تحميل الصور عند ظهورها فقط (Lazy Loading)
    const lazyImages = novelListContainer.querySelectorAll(".lazy");
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  // 🔰 بدء التشغيل
  await initialize();
  window.populateNovelListContent = populateNovelListContent;
  window.loadNovel = loadNovel;
});
