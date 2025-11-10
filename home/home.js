/**
 * @module Home
 * Manages the display of the novel list on the home page.
 */

class HomePage {
  constructor() {
    this.body = document.body;
    this.mainContentArea = document.querySelector(".main-content-area");
  }

  /**
   * Initializes the home page functionality.
   */
  init() {
    // Ensure populateNovelListContent is available
    if (typeof window.populateNovelListContent === "function") {
      this.showNovelListAsHome();
    } else {
      // If the function is not ready, wait for DOMContentLoaded and try again.
      document.addEventListener("DOMContentLoaded", () => {
        if (typeof window.populateNovelListContent === "function") {
          this.showNovelListAsHome();
        } else {
          console.error("Function populateNovelListContent not found.");
        }
      });
    }
  }

  /**
   * Displays the novel list as the main content of the home page.
   */
  showNovelListAsHome() {
    window.populateNovelListContent();
  }
}
