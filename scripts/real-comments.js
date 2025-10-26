/* ========================================================================== */
/* == REAL COMMENTS SYSTEM - FRONTEND CLIENT                              == */
/* ========================================================================== */

/**
 * Professional Comments System Frontend
 * Integrates with backend API for real-time comment functionality
 *
 * Features:
 * - User authentication
 * - Real-time comment posting
 * - Edit/delete operations
 * - Like/unlike functionality
 * - Nested replies
 * - Error handling and loading states
 *
 * @author Your Name
 * @os Fedora with GNOME
 */

(function () {
  "use strict";

  // ========================================================================
  // Configuration
  // ========================================================================
  const CONFIG = {
    apiBaseUrl: "http://localhost:3000/api",
    tokenKey: "auth_token",
    userKey: "current_user",
    currentChapterId: "chapter-1766", // Update dynamically based on page
  };

  // ========================================================================
  // State Management
  // ========================================================================
  const state = {
    comments: [],
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
  };

  // ========================================================================
  // DOM Elements
  // ========================================================================
  const elements = {
    commentsContainer: null,
    commentsBtn: null,
    commentsPanel: null,
    closeCommentsBtn: null,
    commentsOverlay: null,
    authModal: null,
  };

  // ========================================================================
  // API Client
  // ========================================================================
  const api = {
    /**
     * Generic fetch wrapper with authentication
     */
    async request(endpoint, options = {}) {
      const token = localStorage.getItem(CONFIG.tokenKey);
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, {
          ...options,
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
        }

        return data;
      } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
      }
    },

    // Auth endpoints
    async register(username, email, password) {
      return await this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
    },

    async login(username, password) {
      return await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },

    // Comment endpoints
    async getComments(chapterId) {
      return await this.request(`/comments/${chapterId}`);
    },

    async postComment(chapterId, body, parentId = null) {
      return await this.request("/comments", {
        method: "POST",
        body: JSON.stringify({ chapterId, body, parentId }),
      });
    },

    async updateComment(commentId, body) {
      return await this.request(`/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ body }),
      });
    },

    async deleteComment(commentId) {
      return await this.request(`/comments/${commentId}`, {
        method: "DELETE",
      });
    },

    async toggleLike(commentId) {
      return await this.request(`/comments/${commentId}/like`, {
        method: "POST",
      });
    },
  };

  // ========================================================================
  // Authentication Manager
  // ========================================================================
  const auth = {
    /**
     * Initialize auth state from localStorage
     */
    init() {
      const token = localStorage.getItem(CONFIG.tokenKey);
      const user = localStorage.getItem(CONFIG.userKey);

      if (token && user) {
        state.isAuthenticated = true;
        state.currentUser = JSON.parse(user);
      }
    },

    /**
     * Login user
     */
    async login(username, password) {
      try {
        const response = await api.login(username, password);
        this.setAuthData(response.token, response.user);
        return { success: true, user: response.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Register new user
     */
    async register(username, email, password) {
      try {
        const response = await api.register(username, email, password);
        this.setAuthData(response.token, response.user);
        return { success: true, user: response.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Logout user
     */
    logout() {
      localStorage.removeItem(CONFIG.tokenKey);
      localStorage.removeItem(CONFIG.userKey);
      state.isAuthenticated = false;
      state.currentUser = null;
      location.reload();
    },

    /**
     * Store auth data
     */
    setAuthData(token, user) {
      localStorage.setItem(CONFIG.tokenKey, token);
      localStorage.setItem(CONFIG.userKey, JSON.stringify(user));
      state.isAuthenticated = true;
      state.currentUser = user;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
      return state.isAuthenticated;
    },
  };

  // ========================================================================
  // UI Rendering
  // ========================================================================
  const ui = {
    /**
     * Create comment element
     */
    createCommentElement(comment, isReply = false) {
      const commentElement = document.createElement("div");
      commentElement.className = `comment-section ${isReply ? "is-reply" : ""}`;
      commentElement.dataset.commentId = comment.id;

      const isOwner =
        state.currentUser && state.currentUser.id === comment.user_id;
      const repliesCount = comment.replies ? comment.replies.length : 0;
      const toggleRepliesButtonHTML =
        repliesCount > 0
          ? `<div class="replies-toggle">
           <button class="toggle-replies-btn">
             <svg viewBox="0 0 24 24"><path d="M12 16.42L6.29 10.71L7.71 9.29L12 13.59L16.29 9.29L17.71 10.71L12 16.42Z"></path></svg>
             ${repliesCount} ${
              repliesCount === 1 ? "رد" : repliesCount === 2 ? "ردان" : "ردود"
            }
           </button>
         </div>`
          : "";

      const ownerActionsHTML = isOwner
        ? `<div class="comment-actions">
             <button class="edit-comment-btn" data-comment-id="${comment.id}" title="تعديل">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
               </svg>
             </button>
             <button class="delete-comment-btn" data-comment-id="${comment.id}" title="حذف">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
               </svg>
             </button>
           </div>`
        : "";

      commentElement.innerHTML = `
        <div class="comment-main-content">
          <img src="${
            comment.avatar_url
          }" class="auther-image" alt="Author Image" />
          <div class="comment-details">
            <div class="comment-header">
              <div class="comment-auther">
                ${comment.username}
                ${
                  comment.is_edited
                    ? '<span class="edited-badge">(معدل)</span>'
                    : ""
                }
              </div>
              <div class="comment-time">${comment.time}</div>
              ${ownerActionsHTML}
            </div>
            <p class="comment-body">${this.escapeHtml(comment.body)}</p>
            <div class="comment-footer">
              <div class="heart">
                <button class="like-btn ${
                  comment.user_has_liked ? "liked" : ""
                }" data-comment-id="${comment.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <p class="likes-count">${comment.likes_count || 0}</p>
              </div>
              ${
                state.isAuthenticated
                  ? `<div class="reply">
                       <button class="reply-btn" data-comment-id="${comment.id}">رد</button>
                     </div>`
                  : ""
              }
            </div>
          </div>
        </div>
        ${toggleRepliesButtonHTML}
        <div class="replies-container ${repliesCount > 0 ? "" : "empty"}">
          ${
            comment.replies
              ? comment.replies
                  .map(
                    (reply) => this.createCommentElement(reply, true).outerHTML
                  )
                  .join("")
              : ""
          }
        </div>
      `;
      return commentElement;
    },

    /**
     * Display all comments
     */
    displayComments(comments) {
      if (!elements.commentsContainer) return;

      elements.commentsContainer.innerHTML = "";

      if (comments.length === 0) {
        elements.commentsContainer.innerHTML = `
          <div class="no-comments">
            <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
          </div>
        `;
        return;
      }

      comments.forEach((comment) => {
        const commentElement = this.createCommentElement(comment);
        elements.commentsContainer.appendChild(commentElement);
      });
    },

    /**
     * Show loading state
     */
    showLoading() {
      if (elements.commentsContainer) {
        elements.commentsContainer.innerHTML = `
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>جاري التحميل...</p>
          </div>
        `;
      }
    },

    /**
     * Show error message
     */
    showError(message) {
      if (elements.commentsContainer) {
        elements.commentsContainer.innerHTML = `
          <div class="error-message">
            <p>❌ ${message}</p>
          </div>
        `;
      }
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Show authentication modal
     */
    showAuthModal() {
      const modal = document.createElement("div");
      modal.id = "auth-modal";
      modal.className = "auth-modal";
      modal.innerHTML = `
        <div class="auth-modal-content">
          <button class="auth-modal-close">&times;</button>
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">تسجيل الدخول</button>
            <button class="auth-tab" data-tab="register">إنشاء حساب</button>
          </div>
          
          <!-- Login Form -->
          <form id="login-form" class="auth-form active">
            <h3>تسجيل الدخول</h3>
            <div class="form-group">
              <input type="text" id="login-username" placeholder="اسم المستخدم" required>
            </div>
            <div class="form-group">
              <input type="password" id="login-password" placeholder="كلمة المرور" required>
            </div>
            <div class="form-error" id="login-error"></div>
            <button type="submit" class="auth-submit-btn">دخول</button>
          </form>

          <!-- Register Form -->
          <form id="register-form" class="auth-form">
            <h3>إنشاء حساب جديد</h3>
            <div class="form-group">
              <input type="text" id="register-username" placeholder="اسم المستخدم" required>
            </div>
            <div class="form-group">
              <input type="email" id="register-email" placeholder="البريد الإلكتروني" required>
            </div>
            <div class="form-group">
              <input type="password" id="register-password" placeholder="كلمة المرور (6 أحرف على الأقل)" required>
            </div>
            <div class="form-error" id="register-error"></div>
            <button type="submit" class="auth-submit-btn">إنشاء حساب</button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      elements.authModal = modal;
    },

    /**
     * Show reply form
     */
    showReplyForm(targetElement, commentId) {
      const existingForm = document.querySelector(".reply-form-container");
      if (existingForm) {
        existingForm.remove();
      }

      const formContainer = document.createElement("div");
      formContainer.className = "reply-form-container";
      formContainer.innerHTML = `
        <img src="${state.currentUser.avatar}" class="current-user-avatar" alt="Your Avatar">
        <form class="reply-form" data-reply-to-id="${commentId}">
          <div class="textarea-wrapper">
            <textarea class="reply-textarea" placeholder="إضافة رد..." required></textarea>
          </div>
          <div class="reply-form-actions">
            <button type="button" class="reply-cancel-btn">إلغاء</button>
            <button type="submit" class="reply-submit-btn" disabled>رد</button>
          </div>
        </form>
      `;

      targetElement.insertAdjacentElement("afterend", formContainer);
      formContainer.querySelector(".reply-textarea").focus();
    },

    /**
     * Show edit form
     */
    showEditForm(commentElement, commentId, currentBody) {
      const bodyElement = commentElement.querySelector(".comment-body");
      const originalText = bodyElement.textContent;

      bodyElement.innerHTML = `
        <form class="edit-form" data-comment-id="${commentId}">
          <textarea class="edit-textarea" required>${currentBody}</textarea>
          <div class="edit-form-actions">
            <button type="button" class="edit-cancel-btn">إلغاء</button>
            <button type="submit" class="edit-submit-btn">حفظ</button>
          </div>
        </form>
      `;

      const textarea = bodyElement.querySelector(".edit-textarea");
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    },
  };

  // ========================================================================
  // Comment Manager
  // ========================================================================
  const commentManager = {
    /**
     * Load comments from API
     */
    async loadComments() {
      state.isLoading = true;
      ui.showLoading();

      try {
        const response = await api.getComments(CONFIG.currentChapterId);
        state.comments = response.comments;
        ui.displayComments(state.comments);
        console.log(
          `%c✅ تم تحميل ${state.comments.length} تعليقات بنجاح!`,
          "color: green; font-weight: bold;"
        );
      } catch (error) {
        console.error("Error loading comments:", error);
        ui.showError("حدث خطأ أثناء تحميل التعليقات. يرجى المحاولة لاحقاً.");
      } finally {
        state.isLoading = false;
      }
    },

    /**
     * Post new comment
     */
    async postComment(body, parentId = null) {
      if (!state.isAuthenticated) {
        ui.showAuthModal();
        return;
      }

      try {
        const response = await api.postComment(
          CONFIG.currentChapterId,
          body,
          parentId
        );
        await this.loadComments(); // Reload to get updated structure
        return { success: true };
      } catch (error) {
        console.error("Error posting comment:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Update comment
     */
    async updateComment(commentId, body) {
      try {
        await api.updateComment(commentId, body);
        await this.loadComments();
        return { success: true };
      } catch (error) {
        console.error("Error updating comment:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Delete comment
     */
    async deleteComment(commentId) {
      if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
        return;
      }

      try {
        await api.deleteComment(commentId);
        await this.loadComments();
        return { success: true };
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("حدث خطأ أثناء حذف التعليق");
        return { success: false, error: error.message };
      }
    },

    /**
     * Toggle like on comment
     */
    async toggleLike(commentId) {
      if (!state.isAuthenticated) {
        ui.showAuthModal();
        return;
      }

      try {
        const response = await api.toggleLike(commentId);

        // Update UI immediately
        const likeBtn = document.querySelector(
          `.like-btn[data-comment-id="${commentId}"]`
        );
        const likesCount = likeBtn.parentElement.querySelector(".likes-count");
        const currentCount = parseInt(likesCount.textContent);

        if (response.liked) {
          likeBtn.classList.add("liked");
          likesCount.textContent = currentCount + 1;
        } else {
          likeBtn.classList.remove("liked");
          likesCount.textContent = currentCount - 1;
        }

        return { success: true };
      } catch (error) {
        console.error("Error toggling like:", error);
        return { success: false, error: error.message };
      }
    },
  };

  // ========================================================================
  // Event Handlers
  // ========================================================================
  const handlers = {
    /**
     * Handle document clicks (event delegation)
     */
    handleDocumentClick(event) {
      // Reply button
      const replyBtn = event.target.closest(".reply-btn");
      if (replyBtn) {
        const commentId = replyBtn.dataset.commentId;
        const commentElement = replyBtn.closest(".comment-section");
        ui.showReplyForm(commentElement, commentId);
        return;
      }

      // Cancel reply button
      const cancelBtn = event.target.closest(".reply-cancel-btn");
      if (cancelBtn) {
        cancelBtn.closest(".reply-form-container").remove();
        return;
      }

      // Toggle replies button
      const toggleBtn = event.target.closest(".toggle-replies-btn");
      if (toggleBtn) {
        toggleBtn.classList.toggle("open");
        const repliesContainer =
          toggleBtn.closest(".replies-toggle").nextElementSibling;
        repliesContainer.classList.toggle("open");
        return;
      }

      // Like button
      const likeBtn = event.target.closest(".like-btn");
      if (likeBtn) {
        const commentId = likeBtn.dataset.commentId;
        commentManager.toggleLike(commentId);
        return;
      }

      // Edit button
      const editBtn = event.target.closest(".edit-comment-btn");
      if (editBtn) {
        const commentId = editBtn.dataset.commentId;
        const commentElement = editBtn.closest(".comment-section");
        const bodyElement = commentElement.querySelector(".comment-body");
        const currentBody = bodyElement.textContent;
        ui.showEditForm(commentElement, commentId, currentBody);
        return;
      }

      // Delete button
      const deleteBtn = event.target.closest(".delete-comment-btn");
      if (deleteBtn) {
        const commentId = deleteBtn.dataset.commentId;
        commentManager.deleteComment(commentId);
        return;
      }

      // Edit cancel button
      const editCancelBtn = event.target.closest(".edit-cancel-btn");
      if (editCancelBtn) {
        commentManager.loadComments(); // Reload to restore original
        return;
      }

      // Auth modal close
      if (
        event.target.matches(".auth-modal-close") ||
        event.target.matches(".auth-modal")
      ) {
        const modal = document.getElementById("auth-modal");
        if (modal) modal.remove();
        return;
      }

      // Auth tabs
      const authTab = event.target.closest(".auth-tab");
      if (authTab) {
        const targetTab = authTab.dataset.tab;
        document
          .querySelectorAll(".auth-tab")
          .forEach((tab) => tab.classList.remove("active"));
        document
          .querySelectorAll(".auth-form")
          .forEach((form) => form.classList.remove("active"));
        authTab.classList.add("active");
        document.getElementById(`${targetTab}-form`).classList.add("active");
        return;
      }
    },

    /**
     * Handle form submissions
     */
    async handleFormSubmit(event) {
      // Reply form
      if (event.target.matches(".reply-form")) {
        event.preventDefault();
        const form = event.target;
        const replyToId = parseInt(form.dataset.replyToId);
        const textarea = form.querySelector(".reply-textarea");
        const body = textarea.value.trim();

        if (body) {
          const result = await commentManager.postComment(body, replyToId);
          if (result.success) {
            form.closest(".reply-form-container").remove();
          }
        }
        return;
      }

      // Edit form
      if (event.target.matches(".edit-form")) {
        event.preventDefault();
        const form = event.target;
        const commentId = parseInt(form.dataset.commentId);
        const textarea = form.querySelector(".edit-textarea");
        const body = textarea.value.trim();

        if (body) {
          await commentManager.updateComment(commentId, body);
        }
        return;
      }

      // Login form
      if (event.target.matches("#login-form")) {
        event.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value;
        const errorDiv = document.getElementById("login-error");

        const result = await auth.login(username, password);
        if (result.success) {
          document.getElementById("auth-modal")?.remove();
          commentManager.loadComments();
          location.reload(); // Refresh to update UI
        } else {
          errorDiv.textContent = result.error;
        }
        return;
      }

      // Register form
      if (event.target.matches("#register-form")) {
        event.preventDefault();
        const username = document
          .getElementById("register-username")
          .value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const errorDiv = document.getElementById("register-error");

        const result = await auth.register(username, email, password);
        if (result.success) {
          document.getElementById("auth-modal")?.remove();
          commentManager.loadComments();
          location.reload();
        } else {
          errorDiv.textContent = result.error;
        }
        return;
      }
    },

    /**
     * Handle textarea input for auto-resize and button state
     */
    handleTextareaInput(event) {
      if (!event.target.matches(".reply-textarea, .edit-textarea")) return;

      const textarea = event.target;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";

      const form = textarea.closest("form");
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = textarea.value.trim().length === 0;
    },
  };

  // ========================================================================
  // Panel Controls
  // ========================================================================
  const panelControls = {
    /**
     * Open comments panel
     */
    openPanel() {
      const isDesktop = window.innerWidth >= 1081;

      if (isDesktop) {
        elements.commentsPanel.classList.add("open");
        document
          .querySelector(".main-content-wrapper")
          ?.classList.add("comments-active");
      } else {
        document.body.classList.add("comments-open");
        elements.commentsPanel.classList.add("open");
        elements.commentsOverlay.classList.add("visible");
      }

      elements.commentsBtn.classList.add("active");
    },

    /**
     * Close comments panel
     */
    closePanel() {
      const isDesktop = window.innerWidth >= 1081;

      if (isDesktop) {
        elements.commentsPanel.classList.remove("open");
        document
          .querySelector(".main-content-wrapper")
          ?.classList.remove("comments-active");
      } else {
        document.body.classList.remove("comments-open");
        elements.commentsPanel.classList.remove("open");
        elements.commentsOverlay.classList.remove("visible");
      }

      elements.commentsBtn.classList.remove("active");
    },

    /**
     * Toggle comments panel
     */
    togglePanel() {
      if (elements.commentsPanel.classList.contains("open")) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    },
  };

  // ========================================================================
  // Initialization
  // ========================================================================
  async function init() {
    // Initialize DOM references
    elements.commentsContainer = document.querySelector(".comments-container");
    elements.commentsBtn = document.getElementById("comments-btn");
    elements.commentsPanel = document.getElementById("comments-panel");
    elements.closeCommentsBtn = document.getElementById("close-comments-btn");
    elements.commentsOverlay = document.getElementById("comments-overlay");

    // Validate required elements
    if (!elements.commentsContainer) {
      console.error("Comments container not found!");
      return;
    }

    // Initialize authentication
    auth.init();

    // Load comments
    await commentManager.loadComments();

    // Attach event listeners
    document.addEventListener("click", handlers.handleDocumentClick);
    document.addEventListener("submit", handlers.handleFormSubmit);
    document.addEventListener("input", handlers.handleTextareaInput);

    // Panel controls
    if (elements.commentsBtn) {
      elements.commentsBtn.addEventListener("click", () =>
        panelControls.togglePanel()
      );
    }
    if (elements.closeCommentsBtn) {
      elements.closeCommentsBtn.addEventListener("click", () =>
        panelControls.closePanel()
      );
    }
    if (elements.commentsOverlay) {
      elements.commentsOverlay.addEventListener("click", () =>
        panelControls.closePanel()
      );
    }

    // Handle responsive behavior
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isDesktop = window.innerWidth >= 1081;
        const isOpen = elements.commentsPanel.classList.contains("open");

        if (isDesktop && isOpen) {
          elements.commentsOverlay.classList.remove("visible");
          document.body.classList.remove("comments-open");
          document
            .querySelector(".main-content-wrapper")
            ?.classList.add("comments-active");
        } else if (!isDesktop && isOpen) {
          elements.commentsOverlay.classList.add("visible");
          document.body.classList.add("comments-open");
          document
            .querySelector(".main-content-wrapper")
            ?.classList.remove("comments-active");
        }
      }, 250);
    });

    console.log(
      "%c🚀 Comments system initialized successfully!",
      "color: #3ea6ff; font-weight: bold;"
    );
  }

  // ========================================================================
  // Start Application
  // ========================================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose API for external use (optional)
  window.CommentsSystem = {
    auth,
    reload: () => commentManager.loadComments(),
    setChapter: (chapterId) => {
      CONFIG.currentChapterId = chapterId;
      commentManager.loadComments();
    },
  };
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////
// // إنشاء كائن إعدادات لو مش موجود
// const CONFIG = CONFIG || {};

// // أولوية القراءة:
// // 1️⃣ من رابط الصفحة (URL parameter)
// // 2️⃣ من data attribute في الـ body
// // 3️⃣ من عنصر في الصفحة (مثل العنوان)
// // 4️⃣ القيمة الافتراضية "chapter-1"

// (function detectChapterId() {
//   const urlParams = new URLSearchParams(window.location.search);

//   CONFIG.currentChapterId =
//     urlParams.get("chapter") || // من الرابط
//     document.body.dataset.chapterId || // من الـbody
//     document.getElementById("chapter-title")?.dataset.chapterId || // من عنصر محدد
//     "chapter-1"; // الافتراضي

//   console.log("📘 الفصل الحالي:", CONFIG.currentChapterId);
// })();
