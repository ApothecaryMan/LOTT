// ننتظر تحميل الصفحة للتأكد من وجود التعليقات التي أنشأها app.js
document.addEventListener("DOMContentLoaded", function () {
  const commentsContainer = document.querySelector(".comments-container");

  // إذا لم يتم العثور على حاوية التعليقات، نتوقف عن العمل
  if (!commentsContainer) {
    console.warn(
      "Reply Handler: لم يتم العثور على حاوية التعليقات (.comments-container)"
    );
    return;
  }

  /**
   * دالة لإنشاء HTML الخاص بنموذج الرد
   * @param {string} commentId - مُعرّف التعليق الذي يتم الرد عليه
   * @returns {string} - كود HTML للنموذج
   */
  const createReplyFormHTML = (commentId) => {
    return `
      <div class="reply-form-container" data-is-reply-form="true">
        <form class="reply-form" data-reply-to-id="${commentId}">
          <textarea class="reply-textarea" placeholder="اتحفنا بتعليقك.." required></textarea>
          <div class="reply-form-actions">
          <button type="submit" class="reply-submit-btn">إرسال</button>
          <button type="button" class="reply-cancel-btn">إلغاء</button>            
          </div>
        </form>
      </div>
    `;
  };

  /**
   * دالة لمعالجة إرسال الرد (محاكاة API)
   * @param {HTMLFormElement} formElement - عنصر النموذج الذي تم إرساله
   */
  const handleReplySubmit = (formElement) => {
    const textarea = formElement.querySelector(".reply-textarea");
    const submitButton = formElement.querySelector(".reply-submit-btn");
    const replyText = textarea.value.trim();
    const parentCommentId = formElement.dataset.replyToId;

    if (!replyText) return; // منع إرسال الردود الفارغة

    console.log(
      `%c🚀 جارٍ إرسال الرد على التعليق #${parentCommentId}...`,
      "color: blue;"
    );
    submitButton.textContent = "جارٍ الإرسال...";
    submitButton.disabled = true;

    // محاكاة استدعاء API مع تأخير ثانية واحدة
    setTimeout(() => {
      // هذا هو المكان الذي تستدعي فيه الـ API الحقيقي باستخدام fetch
      // fetch('https://your-api.com/replies', { ... })
      console.log(
        "%c✅ تم إرسال الرد بنجاح!",
        "color: green; font-weight: bold;",
        {
          parentCommentId: parentCommentId,
          text: replyText,
        }
      );

      // إزالة النموذج بعد الإرسال الناجح
      formElement.closest(".reply-form-container").remove();

      // في تطبيق حقيقي، يمكنك هنا إضافة الرد الجديد إلى الصفحة
      // alert('تم إرسال ردك بنجاح!');
    }, 1000);
  };

  // --- استخدام Event Delegation للاستماع لكل النقرات داخل حاوية التعليقات ---

  commentsContainer.addEventListener("click", (event) => {
    const target = event.target;

    // الحالة 1: النقر على زر "الرد"
    const replyButton = target.closest(".reply");
    if (replyButton) {
      const parentComment = replyButton.closest(".comment-section");
      const commentId = parentComment.dataset.commentId;

      // إزالة أي نموذج رد آخر مفتوح
      const existingForm = commentsContainer.querySelector(
        ".reply-form-container"
      );
      if (existingForm) {
        // إذا نقر المستخدم على نفس زر الرد مرة أخرى، فقط أغلق النموذج
        if (existingForm.previousElementSibling === parentComment) {
          existingForm.remove();
          return;
        }
        existingForm.remove();
      }

      // إنشاء وإضافة النموذج الجديد
      const formHTML = createReplyFormHTML(commentId);
      parentComment.insertAdjacentHTML("afterend", formHTML);
      parentComment.nextElementSibling.querySelector(".reply-textarea").focus();
      return;
    }

    // الحالة 2: النقر على زر "إلغاء"
    const cancelButton = target.closest(".reply-cancel-btn");
    if (cancelButton) {
      cancelButton.closest(".reply-form-container").remove();
      return;
    }
  });

  // --- استخدام Event Delegation للاستماع لعمليات إرسال النماذج ---

  commentsContainer.addEventListener("submit", (event) => {
    // تحقق من أن الإرسال قادم من نموذج الرد الخاص بنا
    if (event.target.classList.contains("reply-form")) {
      event.preventDefault(); // منع إعادة تحميل الصفحة
      handleReplySubmit(event.target);
    }
  });
});

/////////////////////////////////////////////////////////////////////
// to auto resize textarea

// أولاً: نقوم بإنشاء دالة منفصلة لتغيير الحجم لتنظيم الكود
const autoResizeTextarea = (textareaElement) => {
  // الخطوة 1: إعادة تعيين الارتفاع مؤقتاً للحصول على قياس دقيق للمحتوى
  textareaElement.style.height = "auto";

  // الخطوة 2: ضبط الارتفاع ليساوي الارتفاع الفعلي للمحتوى (scrollHeight)
  // نضيف 2 بكسل كهامش بسيط لتجنب ظهور شريط التمرير في بعض الحالات
  textareaElement.style.height = textareaElement.scrollHeight + "px";
};

// ثانياً: نضيف مستمع أحداث واحد فقط على مستوى الصفحة كلها (document)
document.addEventListener("input", function (event) {
  // نتحقق إذا كان العنصر الذي سبب الحدث (event.target)
  // هو بالفعل textarea ويحمل الكلاس الذي نريده
  if (
    event.target.tagName.toLowerCase() === "textarea" &&
    event.target.matches(".reply-textarea")
  ) {
    // إذا تطابقت الشروط، نستدعي دالة تغيير الحجم ونمرر لها العنصر
    autoResizeTextarea(event.target);
  }
});
