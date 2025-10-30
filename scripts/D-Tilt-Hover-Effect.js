document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".card-container");
  const card = document.querySelector(".card");

  // تحديد أقصى قيم للحركة
  const maxRotate = 15; // درجة الميلان
  const maxTranslate = 8; // بكسل للحركة الأفقية والعمودية

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 1. حساب الميلان (Rotate)
    const rotateX = ((y - centerY) / centerY) * maxRotate;
    const rotateY = -((x - centerX) / centerX) * maxRotate;

    // 2. حساب حركة التتبع (Translate) - هذه هي الإضافة المهمة
    const translateX = ((x - centerX) / centerX) * maxTranslate;
    const translateY = ((y - centerY) / centerY) * maxTranslate;

    // 3. تطبيق كل الحركات (Rotate, Scale, Translate) على الكرت ككتلة واحدة
    card.style.transform = `
                    perspective(1500px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale3d(1.05, 1.05, 1.05)
                    translateX(${translateX}px) 
                    translateY(${translateY}px)
                `;
    card.style.transition = "transform 0.1s linear, box-shadow 0.1s linear";

    // تحديث موقع اللمعة
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });

  // عند خروج الماوس، تعود كل قيم التحويل إلى الصفر بسلاسة
  container.addEventListener("mouseleave", () => {
    card.style.transition = "transform 0.5s ease-out, box-shadow 0.5s ease-out";
    card.style.transform = `
                    perspective(1500px) 
                    rotateX(0deg) 
                    rotateY(0deg) 
                    scale3d(1, 1, 1)
                    translateX(0px) 
                    translateY(0px)
                `;
  });
});
