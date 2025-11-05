document.addEventListener('DOMContentLoaded', () => {
  const quoteContextMenu = document.getElementById('quote-context-menu');
  const quoteBtn = document.getElementById('quote-btn');
  const quoteModal = document.getElementById('quote-modal');
  const quoteImageContainer = document.getElementById('quote-image-container');
  const downloadQuoteBtn = document.getElementById('download-quote-btn');
  const closeQuoteModalBtn = document.getElementById('close-quote-modal-btn');

  let selectedText = '';

  document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      quoteContextMenu.style.display = 'block';
      quoteContextMenu.style.top = `${window.scrollY + rect.bottom}px`;
      quoteContextMenu.style.left = `${window.scrollX + rect.left + rect.width / 2 - quoteContextMenu.offsetWidth / 2}px`;
    } else {
      quoteContextMenu.style.display = 'none';
    }
  });

  quoteBtn.addEventListener('click', () => {
    quoteContextMenu.style.display = 'none';
    generateQuoteImage(selectedText);
  });

  function generateQuoteImage(text) {
    const quoteTemplate = document.createElement('div');
    quoteTemplate.style.padding = '20px';
    quoteTemplate.style.backgroundColor = '#f0f0f0';
    quoteTemplate.style.border = '1px solid #ccc';
    quoteTemplate.style.borderRadius = '10px';
    quoteTemplate.style.width = `${document.body.clientWidth * 0.9}px`;
    quoteTemplate.style.maxWidth = '400px';
    quoteTemplate.style.textAlign = 'center';
    quoteTemplate.innerHTML = `<p style="font-size: 20px; font-family: 'Arial', sans-serif;">${text}</p>`;

    document.body.appendChild(quoteTemplate);

    html2canvas(quoteTemplate).then((canvas) => {
      document.body.removeChild(quoteTemplate);
      const imgData = canvas.toDataURL('image/png');
      const img = new Image();
      img.src = imgData;
      quoteImageContainer.innerHTML = '';
      quoteImageContainer.appendChild(img);
      quoteModal.style.display = 'flex';

      downloadQuoteBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = imgData;
        a.download = 'quote.png';
        a.click();
      };
    });
  }

  closeQuoteModalBtn.addEventListener('click', () => {
    quoteModal.style.display = 'none';
  });

  quoteModal.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
      quoteModal.style.display = 'none';
    }
  });
});
