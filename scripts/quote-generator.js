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
    quoteTemplate.style.padding = "20px";
    quoteTemplate.style.borderRadius = "0";
    quoteTemplate.style.width = `${document.body.clientWidth * 0.9}px`;
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
      return paragraphs.map((p, index) => {
        const marginBottom = index === paragraphs.length - 1 ? '0' : '1.5em';
        return `<div style="padding-bottom: ${marginBottom};"><p style="font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${color}; margin: 0;">${p}</p></div>`;
      }).join('');
    };

    // Measurement loop
    while (true) {
      const paragraphHtml = generateParagraphHtml(currentFontSize);
      quoteTemplate.innerHTML = paragraphHtml;

      if (quoteTemplate.offsetHeight <= maxHeight || currentFontSize <= 8) { // Stop if fits or font size too small
        break;
      }
      currentFontSize--;
    }

    // Remove temporary styling before html2canvas
    quoteTemplate.style.visibility = "";
    quoteTemplate.style.position = "";
    quoteTemplate.style.left = "";

    html2canvas(quoteTemplate).then((canvas) => {
      document.body.removeChild(quoteTemplate); // Remove after canvas is generated
      const imgData = canvas.toDataURL("image/png");
      const img = new Image();
      img.src = imgData;
      quoteImageContainer.innerHTML = "";
      quoteImageContainer.appendChild(img);
      quoteModal.style.display = "flex";

      downloadQuoteBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = imgData;
        a.download = "quote.png";
        a.click();
      };
    });
  }

  closeQuoteModalBtn.addEventListener("click", () => {
    quoteModal.style.display = "none";
  });

  quoteModal.addEventListener("click", (e) => {
    if (e.target === quoteModal) {
      quoteModal.style.display = "none";
    }
  });
});
