// document.addEventListener("DOMContentLoaded", () => {
//   // 2. جلب العنصر
//   const gear = document.getElementById("gear");

//   // 3. تعريف القيمة الحالية
//   let currentValue = 0;

//   // 4. دالة التعامل مع "الترس"
//   function handleGearScroll(event) {
//     // --- (هذا هو أهم سطر) ---
//     // يمنع الصفحة كلها من التحرك (السكرول)
//     // عندما نكون فوق الزر
//     event.preventDefault();

//     // 5. التحقق من اتجاه السكرول
//     // event.deltaY يكون "سالب" للسكرول للأعلى
//     // event.deltaY يكون "موجب" للسكرول للأسفل

//     if (event.deltaY > 0) {
//       // السكرول للأعلى
//       currentValue++;
//     } else {
//       // السكرول للأسفل
//       currentValue--;
//     }

//     // 6. تحديث الرقم الظاهر
//     gear.textContent = currentValue;
//   }

//   // 7. إضافة "مستمع الحدث" للعنصر
//   gear.addEventListener("wheel", handleGearScroll);
// });
