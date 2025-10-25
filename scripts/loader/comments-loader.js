// ننتظر حتى يتم تحميل محتوى الصفحة بالكامل
document.addEventListener("DOMContentLoaded", function () {
  // نحدد العنصر اللي هيستقبل التعليقات
  const commentsWrapper = document.getElementById("comments-section-wrapper");

  if (commentsWrapper) {
    // نحمل ملف التعليقات من مجلد partials
    fetch("partials/comments.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.text();
      })
      .then((html) => {
        // نحط المحتوى اللي جابه fetch داخل الصفحة
        commentsWrapper.innerHTML = html;

        console.log(
          "%c✅ comments.html تم تحميله بنجاح!",
          "color: green; font-weight: bold;"
        );

        // لو فيه دالة initComments، نشغلها
        if (typeof window.initComments === "function") {
          window.initComments();
        } else {
          console.warn("⚠️ initComments() غير موجودة حالياً.");
        }
      })
      .catch((error) => {
        console.error("❌ حدث خطأ أثناء تحميل التعليقات:", error);
        commentsWrapper.innerHTML =
          "<p>عفواً، حدث خطأ أثناء تحميل التعليقات.</p>";
      });
  }
});
