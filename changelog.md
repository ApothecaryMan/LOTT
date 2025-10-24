# Changelog

## October 24, 2025

### Feature: Display Current Chapter Name

- **File Modified:** `scripts/loader/content-loader.js`
- **Change:** Updated the `loadChapter` function to set the text content of the button with `id="title-btn"` to the current chapter's title.

### Refinement: Display Chapter Name Only

- **File Modified:** `scripts/loader/content-loader.js`
- **Change:** The script was improved to parse the chapter title and remove the chapter number before displaying it on the `title-btn`.

### Feature: Text Alignment Control

- **File Modified:** `scripts/font.js`
- **Change:** Implemented functionality for the text alignment buttons (`ltr-btn`, `middle-btn`, `rtl-btn`) to control the `text-align` property of the chapter content. The user's preference is saved to `localStorage` and applied automatically on page load and when new chapters are loaded.

### Refinement: Themed Text Alignment Buttons

- **File Modified:** `scripts/color.js`
- **Change:** The text alignment buttons now adopt the selected color theme, consistent with other buttons in the carousel. The active and hover states are now styled correctly.

### Refinement: Text Alignment Button Animation

- **File Modified:** `css/carousel.css`
- **Change:** Added a `border-radius` transition to the text alignment buttons to provide a smooth animation when the alignment is changed, matching the style of other carousel buttons.

### Refinement: Comprehensive Text Alignment

- **File Modified:** `scripts/font.js`
- **Change:** The `applyTextAlign` function was updated to apply alignment to the chapter title, author, previous/next buttons, and the support and info sections, in addition to the chapter text.

### Bugfix: Corrected Prev/Next Button Alignment

- **File Modified:** `scripts/font.js`
- **Change:** Swapped `justify-content` values (`flex-start` and `flex-end`) for the `.pre-nex` container to correctly align the buttons in a right-to-left context, matching the selected text alignment.

### Enhancement: Animated Theme Toggle Button

- **Files Modified:** `css/carousel.css`, `scripts/theme.js`
- **Change:** The theme toggle button now rotates 180 degrees on hover and when active. It also switches between a sun and moon icon based on the selected theme, with appropriate colors for light and dark modes.

### Refinement: Updated Theme Toggle Icons

- **File Modified:** `scripts/theme.js`
- **Change:** Replaced the existing sun and moon SVG icons in the theme toggle button with new, user-provided icons.

### Bugfix: Corrected Author/Date Alignment

- **File Modified:** `scripts/font.js`
- **Change:** Fixed a bug where the `.date` element (a flex container) was not aligning correctly. The code now uses `justify-content` instead of `text-align` to properly align its content.

### Refinement: Resized Chapter Cards

- **File Modified:** `css/card.css`
- **Change:** The chapter cards in the bottom carousel have been resized to a smaller width (100px). The text and images within the cards have been adjusted to fit the new, more compact layout.

### Bugfix: Fixed Text Wrapping in Cards

- **File Modified:** `css/card.css`
- **Change:** Corrected a layout issue in the small chapter cards where the author and date text would wrap incorrectly. The `.date` element is now a vertical flex container, and its text content is properly truncated.

### Feature: Enhanced "Super Move" Title Animation

- **Files Modified:** `css/carousel.css`, `scripts/title-animation.js`
- **Change:** The "Super Move" title animation has been significantly enhanced. It now features a "flying" title effect created by animating a clone of the title element. Also fixed a bug where the title button would not expand correctly by using a more reliable `max-width` animation.

### Enhancement: Simplified Gear Button Interaction

- **Files Modified:** `scripts/scroll-gear.js`, `css/scroll-gear.css`
- **Change:** The gear button's functionality has been completely overhauled. All previous features (scrolling, swiping, transforming into an input) have been removed. The button now displays the current chapter number and features a new animation: it expands on press, and a long press activates the search bar. On release, it returns to its normal size with a bouncy animation. This simplifies the UI and improves swipe performance in the carousel.
