
const fs = require('fs');
const path = require('path');

/**
 * Adds or updates a chapter in chapters.json.
 * @param {string} chapterId - The ID of the chapter.
 * @param {string} chapterTitle - The title of the chapter.
 */
function addOrUpdateChapter(chapterId, chapterTitle) {
  const chaptersFilePath = path.join(__dirname, '..', 'chapters.json');

  fs.readFile(chaptersFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') { // ENOENT means file doesn't exist, which is fine for the first run.
      console.error('Error reading chapters.json:', err);
      return;
    }

    let chapters = [];
    if (data) {
      try {
        chapters = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing chapters.json:', parseErr);
        return;
      }
    }

    // Check if chapter already exists
    const existingChapterIndex = chapters.findIndex(c => c.id === chapterId);

    if (existingChapterIndex > -1) {
      console.log(`Chapter ${chapterId} already exists. Updating title.`);
      chapters[existingChapterIndex].title = chapterTitle;
    } else {
      chapters.push({ id: chapterId, title: chapterTitle });
    }

    // Sort chapters by ID (as numbers)
    chapters.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

    // Convert back to JSON with pretty printing
    const updatedData = JSON.stringify(chapters, null, 2);

    fs.writeFile(chaptersFilePath, updatedData, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to chapters.json:', writeErr);
        return;
      }
      console.log(`Successfully added/updated chapter ${chapterId}: "${chapterTitle}"`);
    });
  });
}

// --- How to use this script ---
// 1. Open your terminal.
// 2. Navigate to the project directory: cd /path/to/your/project
// 3. Run the script with node, followed by the chapter ID and the title in quotes.
//
// Example:
// node scripts/add-chapter.js 1772 "A New Beginning"
//

// Get arguments from the command line
const [,, chapterId, chapterTitle] = process.argv;

// Validate input
if (!chapterId || !chapterTitle) {
  console.log('Please provide both a chapter ID and a title.');
  console.log('Usage: node scripts/add-chapter.js <chapterId> "<chapterTitle>"');
  process.exit(1); // Exit with an error code
}

addOrUpdateChapter(chapterId, chapterTitle);
