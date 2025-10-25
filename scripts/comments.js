document.addEventListener("DOMContentLoaded", function () {
  const commentsContainer = document.querySelector(".comments-container");

  /**
   * دالة لإنشاء HTML لتعليق واحد بناءً على البيانات
   * @param {object} comment - كائن يحتوي على بيانات التعليق
   * @returns {string} - سلسلة HTML للتعليق
   */
  const createCommentHTML = (comment) => {
    // تم تحديث هذا الجزء ليحتوي على عدد الإعجابات والردود
    return `
      <div class="comment-section">
        <div class="comment-header">
          <img src="${comment.imageSrc}" class="auther-image" alt="Author Image" />
          <div class="comment-auther">${comment.author}</div>
          <div class="comment-time">${comment.time}</div>
        </div>
        <p class="comment-body">${comment.body}</p>
        <div class="comment-footer">
          <div class="heart">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <p>${comment.likes}</p>
          </div>
          <div class="reply">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
              <path d="M276-384h408q15.3 0 25.65-10.29Q720-404.58 720-419.79t-10.35-25.71Q699.3-456 684-456H276q-15.3 0-25.65 10.29Q240-435.42 240-420.21t10.35 25.71Q260.7-384 276-384Zm0-132h408q15.3 0 25.65-10.29Q720-536.58 720-551.79t-10.35-25.71Q699.3-588 684-588H276q-15.3 0-25.65 10.29Q240-567.42 240-552.21t10.35 25.71Q260.7-516 276-516Zm0-132h408q15.3 0 25.65-10.29Q720-668.58 720-683.79t-10.35-25.71Q699.3-720 684-720H276q-15.3 0-25.65 10.29Q240-699.42 240-684.21t10.35 25.71Q260.7-648 276-648ZM168-240q-29.7 0-50.85-21.15Q96-282.3 96-312v-480q0-29.7 21.15-50.85Q138.3-864 168-864h624q29.7 0 50.85 21.15Q864-821.7 864-792v609q0 24.19-22 33.59-22 9.41-39.12-7.71L720-240H168Z" />
            </svg>
            <p>${comment.replies}</p>
          </div>
        </div>
      </div>
    `;
  };

  /////////////////////////////////////////////////////////////////////
  // ... (دالة createCommentHTML تبقى كما هي) ...

  //   document.addEventListener("DOMContentLoaded", function () {
  //     const commentsContainer = document.querySelector(".comments-container");

  //     // دالة إنشاء HTML للتعليق
  //     const createCommentHTML = (comment) => {
  //       return `
  //       <div class="comment-section" data-comment-id="${comment.id}">
  //         <!-- ... نفس كود HTML للتعليق ... -->
  //       </div>
  //     `;
  //     };

  //     // ✨ دالة جديدة لإضافة تعليق جديد للصفحة فوراً
  //     window.renderNewComment = (commentData) => {
  //       const commentHTML = createCommentHTML(commentData);
  //       commentsContainer.insertAdjacentHTML("beforeend", commentHTML);
  //     };

  //     // ✨ تعديل منطق تحميل التعليقات
  //     const loadComments = () => {
  //       if (!commentsContainer) return;

  //       // محاولة جلب التعليقات من localStorage أولاً
  //       const savedComments = localStorage.getItem("comments");

  //       if (savedComments) {
  //         // إذا وجدت تعليقات محفوظة، اعرضها
  //         const comments = JSON.parse(savedComments);
  //         commentsContainer.innerHTML = comments.map(createCommentHTML).join("");
  //         console.log(
  //           `%c✅ تم تحميل ${comments.length} تعليقات من localStorage بنجاح!`,
  //           "color: green; font-weight: bold;"
  //         );
  //       } else {
  //         // إذا لم توجد، اجلبها من الملف كمرة أولى فقط
  //         fetch("comments.json")
  //           .then((response) =>
  //             response.ok ? response.json() : Promise.reject(response.statusText)
  //           )
  //           .then((comments) => {
  //             commentsContainer.innerHTML = comments
  //               .map(createCommentHTML)
  //               .join("");
  //             // احفظها في localStorage للمرة القادمة
  //             localStorage.setItem("comments", JSON.stringify(comments));
  //             console.log(
  //               `%c✅ تم تحميل التعليقات من comments.json وحفظها.`,
  //               "color: orange; font-weight: bold;"
  //             );
  //           })
  //           .catch((error) => {
  //             console.error("خطأ أثناء تحميل التعليقات:", error);
  //             commentsContainer.innerHTML =
  //               "<p>عفواً، حدث خطأ أثناء تحميل التعليقات.</p>";
  //           });
  //       }
  //     };

  //     loadComments();
  //   });

  // ملاحظة: لقد أزلنا مستمعي الأحداث من هنا لأن reply-handler.js سيهتم بهم.

  // باقي الكود يبقى كما هو بدون تغيير
  if (commentsContainer) {
    fetch("comments.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((comments) => {
        if (comments.length === 0) {
          commentsContainer.innerHTML = "<p>لا توجد تعليقات لعرضها.</p>";
          return;
        }

        const allCommentsHTML = comments.map(createCommentHTML).join("");
        commentsContainer.innerHTML = allCommentsHTML;

        console.log(
          `%c✅ تم تحميل وعرض ${comments.length} تعليقات بنجاح!`,
          "color: green; font-weight: bold;"
        );
      })
      .catch((error) => {
        console.error("❌ حدث خطأ أثناء تحميل بيانات التعليقات:", error);
        commentsContainer.innerHTML =
          "<p>عفواً، حدث خطأ أثناء تحميل التعليقات.</p>";
      });
  }
});
