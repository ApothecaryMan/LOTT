// Word count logic separated from the carousel implementation.
document.addEventListener("contentLoaded", () => {
  const wordCountBtn = document.getElementById("word-count");
  const paragraph = document.getElementById("chapter-text");

  if (wordCountBtn && paragraph) {
    const textContent = paragraph.textContent || "";
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word !== "");
    const wordCount = words.length;
    wordCountBtn.innerText = wordCount + " كلمة ";
  } else {
    if (!wordCountBtn) console.error("Element with id 'word-count' not found.");
    if (!paragraph) console.error("Element with id 'chapter-text' not found.");
  }
});
