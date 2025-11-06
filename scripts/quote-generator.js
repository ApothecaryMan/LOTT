document.addEventListener("DOMContentLoaded", () => {
  const quoteContextMenu = document.getElementById("quote-context-menu");
  const quoteBtn = document.getElementById("quote-btn");
  const quoteModal = document.getElementById("quote-modal");
  const quoteImageContainer = document.getElementById("quote-image-container");
  const downloadQuoteBtn = document.getElementById("download-quote-btn");
  const closeQuoteModalBtn = document.getElementById("close-quote-modal-btn");

  let selectedText = "";
  let selectedTextColor = "";
  let selectedTextFontFamily = "";

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  const debouncedSelectionChange = debounce(() => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      const parentElement = range.commonAncestorContainer.parentElement;
      const computedStyle = window.getComputedStyle(parentElement);

      selectedTextColor = computedStyle.color;
      const isDarkMode = !document.body.classList.contains("light-theme");
      if (isDarkMode) {
        const rgb = selectedTextColor.match(/\d+/g);
        if (rgb) {
          const brightness =
            (parseInt(rgb[0]) * 299 +
              parseInt(rgb[1]) * 587 +
              parseInt(rgb[2]) * 114) /
            1000;
          if (brightness < 128) {
            selectedTextColor = "rgb(166, 166, 166)";
          }
        }
      }
      selectedTextFontFamily = computedStyle.fontFamily;

      const rect = range.getBoundingClientRect();
      quoteContextMenu.style.display = "block";
      quoteContextMenu.style.top = `${window.scrollY + rect.bottom}px`;
      quoteContextMenu.style.left = `${
        window.scrollX +
        rect.left +
        rect.width / 2 -
        quoteContextMenu.offsetWidth / 2
      }px`;
    } else {
      quoteContextMenu.style.display = "none";
    }
  }, 200);

  document.addEventListener("selectionchange", () => {
    debouncedSelectionChange();
  });

  document.addEventListener("contextmenu", (e) => {
    if (window.getSelection().toString().trim()) {
      e.preventDefault();
    }
  });

  quoteBtn.addEventListener("click", () => {
    quoteContextMenu.style.display = "none";
    generateQuoteImage(selectedText, selectedTextColor, selectedTextFontFamily);
    window.getSelection().removeAllRanges();
  });

  function generateQuoteImage(text, color, fontFamily) {
    const COLOR_KEY = "userColorPreference";
    const CUSTOM_COLOR_VALUE_KEY = "userCustomColorPreferenceValue";

    let backgroundColor;
    const savedColorId = localStorage.getItem(COLOR_KEY) || "gray";
    if (savedColorId === "custom-color-btn") {
      backgroundColor =
        localStorage.getItem(CUSTOM_COLOR_VALUE_KEY) || "rgb(76, 175, 80)"; // fallback to green
    } else {
      const colorButton = document.getElementById(savedColorId);
      if (colorButton) {
        backgroundColor = window.getComputedStyle(colorButton).backgroundColor;
      } else {
        backgroundColor = "rgb(76, 175, 80)"; // fallback to green
      }
    }

    const quoteTemplate = document.createElement("div");
    quoteTemplate.classList.add("generated-quote");
    quoteTemplate.style.padding = "20px 20px 10px 20px";
    let useRoundedCorners = JSON.parse(localStorage.getItem("quoteRoundedCorners") || "true");
    quoteTemplate.style.borderRadius = useRoundedCorners ? "15px" : "0";
    quoteTemplate.style.width = `${Math.round(
      document.body.clientWidth * 0.9
    )}px`;
    quoteTemplate.style.maxWidth = "400px";
    quoteTemplate.style.textAlign = "center";
    quoteTemplate.style.visibility = "hidden"; // Hide for measurement
    quoteTemplate.style.position = "absolute";
    quoteTemplate.style.left = "-9999px";
    document.body.appendChild(quoteTemplate); // Append for measurement

    const maxHeight = document.documentElement.clientHeight / 2;
    let currentFontSize = 20; // Initial font size

    const paragraphs = text.split(/\n\s*\n/);

    // Function to generate paragraph HTML with a given font size
    const generateParagraphHtml = (fontSize) => {
      return paragraphs
        .map((p, index) => {
          const marginBottom = index === paragraphs.length - 1 ? "0" : "1.5em";
          return `<div style="padding-bottom: ${marginBottom};"><p style="font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${color}; margin: 0;">${p}</p></div>`;
        })
        .join("");
    };

    // Measurement loop
    while (true) {
      const paragraphHtml = generateParagraphHtml(currentFontSize);
      quoteTemplate.innerHTML = paragraphHtml;

      if (quoteTemplate.offsetHeight <= maxHeight || currentFontSize <= 8) {
        // Stop if fits or font size too small
        break;
      }
      currentFontSize--;
    }

    // Remove temporary styling before html2canvas
    quoteTemplate.style.visibility = "";
    quoteTemplate.style.position = "";
    quoteTemplate.style.left = "";

    // Add chapter and novel information
    const novelId = window.currentNovelId;
    const chapterId = window.currentChapterNumber;
    let novelTitle = "";
    let chapterTitle = "";

    if (window.allNovels && novelId) {
      const novel = window.allNovels.find((n) => n.id === novelId);
      if (novel) {
        novelTitle = novel.title;
      }
    }

    if (window.currentNovelChapters && chapterId) {
      const chapter = window.currentNovelChapters.find(
        (c) => c.id === chapterId.toString()
      );
      if (chapter) {
        chapterTitle = chapter.title;
      }
    }

    if (novelTitle || chapterTitle) {
      const footerDiv = document.createElement("div");
      footerDiv.style.display = "flex";
      footerDiv.style.justifyContent = "space-between";
      footerDiv.style.paddingTop = "15px";
      footerDiv.style.fontSize = "small";
      footerDiv.style.color = color; // Use the same color as the quote text

      const chapterInfoSpan = document.createElement("span");
      chapterInfoSpan.style.textAlign = "left";
      chapterInfoSpan.textContent = `${
        chapterId ? chapterId + " - " : ""
      }${chapterTitle}`;

      const novelTitleSpan = document.createElement("span");
      novelTitleSpan.style.textAlign = "right";
      novelTitleSpan.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";
      novelTitleSpan.textContent = novelTitle;

      footerDiv.appendChild(chapterInfoSpan);
      footerDiv.appendChild(novelTitleSpan);
      quoteTemplate.appendChild(footerDiv);
    }

    html2canvas(quoteTemplate, { backgroundColor: null }).then((canvas) => {
      document.body.removeChild(quoteTemplate); // Remove after canvas is generated
      const imgData = canvas.toDataURL("image/png");
      const img = new Image();
      img.src = imgData;
      quoteImageContainer.innerHTML = "";
      quoteImageContainer.appendChild(img);
      quoteModal.style.display = "flex";
      quoteImageContainer.classList.add("rainbow-border");

      downloadQuoteBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = imgData;
        // Generate dynamic filename
        const getNovelAbbreviation = (title) => {
          if (!title) return "UNKNOWN";
          return title.split(" ").map(word => word.charAt(0)).join("").toUpperCase();
        };

        const novelAbbr = getNovelAbbreviation(novelTitle);
        const chapterNum = chapterId || "NOC"; // "NOC" for No Chapter
        
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;

        const IMAGE_COUNT_KEY = "quoteImageDownloadCount";
        let imageCount = parseInt(localStorage.getItem(IMAGE_COUNT_KEY) || "0");
        
        const filename = `${novelAbbr}-${chapterNum}-${dateString}-${imageCount}.png`;
        localStorage.setItem(IMAGE_COUNT_KEY, (imageCount + 1).toString());

        a.download = filename;
        a.click();
      };
    });
  }

  const toggleBorderRadius = document.getElementById("toggle-border-radius");
  const shareQuoteBtn = document.getElementById("share-quote-btn");

  // Initialize border-radius preference
  let useRoundedCorners = JSON.parse(localStorage.getItem("quoteRoundedCorners") || "true");
  toggleBorderRadius.checked = useRoundedCorners;

  toggleBorderRadius.addEventListener("change", () => {
    useRoundedCorners = toggleBorderRadius.checked;
    localStorage.setItem("quoteRoundedCorners", JSON.stringify(useRoundedCorners));
    // If the modal is open, regenerate the image to apply the new setting
    if (quoteModal.style.display === "flex" && selectedText) {
      generateQuoteImage(selectedText, selectedTextColor, selectedTextFontFamily);
    }
  });

  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "1000";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.5s ease";
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 2000);
  }

  shareQuoteBtn.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        const img = quoteImageContainer.querySelector('img');
        if (img) {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const file = new File([blob], "quote.png", { type: "image/png" });

          await navigator.share({
            files: [file],
            title: 'My Quote',
            text: 'Check out this quote!',
          });
          console.log('Quote shared successfully');
        } else {
          showToast('No quote image to share.');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Share cancelled by user.');
        } else {
          console.error('Error sharing:', error);
          showToast('Failed to share quote.');
        }
      }
    } else {
      try {
        const img = quoteImageContainer.querySelector("img");
        if (img) {
          const response = await fetch(img.src);
          const blob = await response.blob();
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          showToast("Quote image copied to clipboard!");
        } else {
          showToast("No quote image to copy.");
        }
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        showToast(
          "Copying to clipboard is not supported in your browser. You can download the image instead."
        );
      }
    }
  });

  closeQuoteModalBtn.addEventListener("click", () => {
    quoteModal.style.display = "none";
    quoteImageContainer.classList.remove("rainbow-border");
  });

  quoteModal.addEventListener("click", (e) => {
    if (e.target === quoteModal) {
      quoteModal.style.display = "none";
      quoteImageContainer.classList.remove("rainbow-border");
    }
  });
});
