# Implementation Plan - Home Page Card Carousel

## Goal Description
Replace the current static "Enter Story" button on the home page (`index.html`) with a dynamic carousel of novel cards. This will allow users to select a novel directly from the landing page, utilizing the existing card styling and structure.

## User Review Required
> [!IMPORTANT]
> This change will completely replace the current simple landing page. The "Enter Story" button will be removed in favor of the novel list.

## Proposed Changes

### Home Page
#### [MODIFY] [index.html](file:///home/x1carbon/Projects/HTML/Lord/index.html)
*   Remove the inline `<style>` block and the "Enter Story" button.
*   Add the HTML structure for the card carousel:
    ```html
    <div class="card-carousel-container" style="display: block;">
      <div class="cards" id="novel-cards-container">
        <!-- Cards will be injected here -->
      </div>
    </div>
    ```
*   Add a script to:
    1.  Fetch `novels.json`.
    2.  Generate HTML for each novel using the `.card` class.
    3.  Handle click events to save the selected novel ID to `localStorage` and redirect to `reader.html`.

### Styling
*   Ensure `css/styles.css` is correctly applied.
*   The `css/card.css` is already imported in `css/styles.css`, so no new CSS files are needed unless specific adjustments for the home page are required.

## Verification Plan

### Manual Verification
1.  Open `index.html` in the browser.
2.  Verify that the list of novels from `novels.json` is displayed as cards.
3.  Check that the cards match the styling of the card in `reader.html`.
4.  Click on a card and verify it redirects to `reader.html` and loads the correct novel.
