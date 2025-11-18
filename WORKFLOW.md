# Project Workflow & Architecture Guide

This document outlines the structure, architecture, and standard workflows for the **Lord Of The Truth** project. It is designed to help developers understand the system and contribute effectively.

## 1. Project Overview

This is a **Progressive Web App (PWA)** designed for reading novels. It features a dynamic content loader, customizable reading experience (fonts, colors, themes), and a comment system.

*   **Entry Point**: `index.html` (Landing Page)
*   **Main App**: `reader.html` (The actual reader interface)
*   **Data Source**: JSON files (`novels.json` and individual chapter files).

## 2. Directory Structure

```text
/
├── index.html              # Landing page
├── reader.html             # Main reading application
├── novels.json             # Registry of all available novels
├── manifest.webmanifest    # PWA Manifest
├── css/                    # Stylesheets
│   ├── styles.css          # Main entry point (imports other CSS files)
│   ├── header.css          # Header styles
│   ├── card.css            # Novel card styles
│   └── ...                 # Component-specific styles
├── scripts/                # JavaScript Logic
│   ├── main.js             # Main entry point for reader.html
│   ├── novel-switcher.js   # Handles novel navigation logic
│   ├── loader/             # Content loading logic
│   │   ├── content-loader.js
│   │   └── story-loader.js
│   └── ...                 # Feature-specific scripts (font, color, comments)
├── chapters/               # Content Storage
│   └── [NovelName]/        # Directory for a specific novel
│       ├── [NovelName].json # Chapter index for the novel
│       └── ...             # (Future: potentially individual chapter files)
└── img/                    # Images (covers, icons, assets)
```

## 3. Core Workflows

### 3.1. Adding a New Novel

To add a new novel to the platform, follow these steps:

1.  **Prepare Assets**:
    *   Get the cover image and place it in `img/novels/`.
2.  **Create Content Directory**:
    *   Create a new folder in `chapters/` matching the novel's ID (e.g., `chapters/MyNewNovel/`).
    *   Create the main JSON file for the novel (e.g., `chapters/MyNewNovel/MyNewNovel.json`).
3.  **Update Registry**:
    *   Open `novels.json`.
    *   Add a new entry to the array:
        ```json
        {
          "id": "MyNewNovel",
          "path": "chapters/MyNewNovel/MyNewNovel.json",
          "title": "My New Novel",
          "image": "img/novels/cover.jpg",
          "categories": ["Action", "Fantasy"]
        }
        ```

### 3.2. Adding Chapters

Currently, chapters are loaded from the novel's main JSON file.

1.  Open the novel's JSON file (e.g., `chapters/Lord of The Truth/LordOfTheTruth.json`).
2.  Add a new object to the `chapters` array:
    ```json
    {
      "id": "1",
      "title": "Chapter Title",
      "content": "HTML content of the chapter..."
    }
    ```
    *Note: Ensure the `id` is unique within the novel.*

### 3.3. Styling Changes

The CSS is modular. **Do not write everything in `styles.css`.**

1.  **Identify the Component**: Determine if the style belongs to the header, a card, the font menu, etc.
2.  **Edit Specific File**: Open the corresponding file in `css/` (e.g., `css/header.css`).
3.  **New Components**: If creating a new component:
    *   Create `css/my-new-component.css`.
    *   Import it in `css/styles.css`: `@import url("my-new-component.css");`.

### 3.4. Scripting & Logic

*   **Modular ES6**: The project uses ES6 modules (`type="module"` in `reader.html`).
*   **Global State**: Some state is attached to `window` for inter-module communication (e.g., `window.currentNovelId`), but prefer passing data via function arguments where possible.
*   **Helpers**: Use `scripts/utils.js` for common utility functions.

## 4. Future Improvements & Refactoring

Based on the current analysis, the following areas are targeted for improvement:

*   **`scripts/loader/list-loader.js`**: Separate UI logic (open/close list) from Data logic (building the list).
*   **`scripts/script.js`**: Decompose this monolithic file into smaller, focused modules (e.g., `ui-interactions.js`, `audio-manager.js`).
*   **`scripts/carousel.js`**: Simplify the carousel logic.
*   **Theme & Color**: Refactor `scripts/theme.js` and `scripts/color.js` to share a common state manager for user preferences.

## 5. Deployment

*   Ensure `manifest.webmanifest` is updated if app icons or names change.
*   Verify all paths in `novels.json` are relative and correct.
