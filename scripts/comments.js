/* ========================================================================== */
/* == SUPABASE ALTERNATIVE - MODIFIED TO MATCH REAL-COMMENTS.JS BEHAVIOR  == */
/* ========================================================================== */

/**
 * Real Comments System using Supabase
 *
 * Benefits:
 * - No backend server to maintain
 * - Built-in authentication
 * - Real-time subscriptions
 * - Free tier: 500MB database, 50k monthly active users
 * - Automatic API generation
 *
 * @requires @supabase/supabase-js
 */

// SQL Setup and Supabase client installation steps remain the same.

(function () {
  "use strict";

  const avatars = [
    "img/avatar/femail-2.webp",
    "img/avatar/male-1.webp",
    "img/avatar/male-2.webp",
    "img/avatar/male-3.webp",
  ];

  const getUserIdNumber = (userId) => {
    if (!userId) return 0;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // ========================================================================
  // Configuration
  // ========================================================================
  const SUPABASE_CONFIG = {
    url: "https://ajjyjpqbsrsexucvbuln.supabase.co", // Your Supabase URL
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqanlqcHFic3JzZXh1Y3ZidWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDM1NjgsImV4cCI6MjA3NzUxOTU2OH0.ULSSZ_DzW-TfD8D3FlqvfSar5mCe0OlhkOxmoRq3fo8", // Your Supabase Anon Key
  };

  const CONFIG = {
    currentChapterId: "chapter-1",
  };

  // ========================================================================
  // Initialize Supabase Client
  // ========================================================================
  const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );

  // ========================================================================
  // State Management
  // ========================================================================
  const state = {
    comments: [],
    currentUser: null,
    isAuthenticated: false,
    subscription: null,
  };

  // ========================================================================
  // DOM Elements (Matched with real-comments.js)
  // ========================================================================
  const elements = {
    commentsContainer: document.querySelector(".comments-container"),
    commentsBtn: document.getElementById("comments-btn"),
    commentsPanel: document.getElementById("comments-panel"),
    closeCommentsBtn: document.getElementById("close-comments-btn"),
    commentsOverlay: document.getElementById("comments-overlay"),
    authModal: null,
    commentInputContainer: null,
    commentInputTextarea: null,
    commentSubmitBtn: null,
  };

  // ========================================================================
  // Authentication
  // ========================================================================
  const auth = {
    async init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await this.setUser(session.user);
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await this.setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          state.currentUser = null;
          state.isAuthenticated = false;
        }
      });
    },

    async setUser(user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      state.currentUser = {
        id: user.id,
        username: profile?.username || user.email.split("@")[0],
        // Corrected property name to match DB
        avatar_url:
          profile?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        email: user.email,
      };
      state.isAuthenticated = true;
    },

    async register(email, password, username) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) throw error;
        return {
          success: true,
          message: "تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.",
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async login(email, password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async logout() {
      await supabase.auth.signOut();
      location.reload();
    },
  };

  // ========================================================================
  // Comment Manager
  // ========================================================================
  const commentManager = {
    async loadComments() {
      try {
        ui.showLoading();
        const { data, error } = await supabase.rpc("get_comments_with_data", {
          chapter_param: CONFIG.currentChapterId,
          user_id_param: state.currentUser?.id || null,
        });
        if (error) throw error;
        state.comments = this.buildCommentTree(data);
        ui.displayComments(state.comments);
        console.log(
          `%c✅ تم تحميل ${data.length} تعليقات`,
          "color: green; font-weight: bold;"
        );
      } catch (error) {
        console.error("Error loading comments:", error);
        ui.showError("حدث خطأ أثناء تحميل التعليقات");
      }
    },

    buildCommentTree(flatComments) {
      const commentMap = {};
      const rootComments = [];
      flatComments.forEach((comment) => {
        commentMap[comment.id] = {
          ...comment,
          replies: [],
          time: this.formatTimeAgo(comment.created_at),
        };
      });
      flatComments.forEach((comment) => {
        if (comment.parent_id && commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
        } else {
          rootComments.push(commentMap[comment.id]);
        }
      });
      return rootComments;
    },

    formatTimeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return "الآن";
      if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
      if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
      if (seconds < 2592000) return `منذ ${Math.floor(seconds / 86400)} يوم`;
      return new Date(date).toLocaleDateString("ar-EG");
    },

    async postComment(body, parentId = null) {
      if (!state.isAuthenticated) {
        ui.showAuthModal();
        return { success: false, error: "User not authenticated" };
      }
      try {
        const { error } = await supabase.from("comments").insert({
          user_id: state.currentUser.id,
          chapter_id: CONFIG.currentChapterId,
          parent_id: parentId,
          body,
        });
        if (error) throw error;
        // Real-time will handle the update, but we can also reload for immediate feedback
        await this.loadComments();
        return { success: true };
      } catch (error) {
        console.error("Error posting comment:", error);
        return { success: false, error: error.message };
      }
    },

    async updateComment(commentId, body) {
      try {
        const { error } = await supabase
          .from("comments")
          .update({
            body,
            updated_at: new Date().toISOString(),
            is_edited: true,
          })
          .eq("id", commentId)
          .eq("user_id", state.currentUser.id);
        if (error) throw error;
        await this.loadComments();
        return { success: true };
      } catch (error) {
        console.error("Error updating comment:", error);
        return { success: false, error: error.message };
      }
    },

    async deleteComment(commentId) {
      if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId)
          .eq("user_id", state.currentUser.id);
        if (error) throw error;
        await this.loadComments();
        return { success: true };
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("حدث خطأ أثناء حذف التعليق");
        return { success: false, error: error.message };
      }
    },

    async toggleLike(commentId) {
      if (!state.isAuthenticated) {
        ui.showAuthModal();
        return;
      }
      try {
        const { data: existingLike } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", state.currentUser.id)
          .eq("comment_id", commentId)
          .single();
        if (existingLike) {
          await supabase.from("likes").delete().eq("id", existingLike.id);
        } else {
          await supabase
            .from("likes")
            .insert({ user_id: state.currentUser.id, comment_id: commentId });
        }
        await this.loadComments(); // Reload to get updated like counts and status
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },

    setupRealtimeSubscription() {
      if (state.subscription) {
        supabase.removeChannel(state.subscription);
      }
      state.subscription = supabase
        .channel(`comments:${CONFIG.currentChapterId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
            filter: `chapter_id=eq.${CONFIG.currentChapterId}`,
          },
          (payload) => {
            console.log("Real-time update received:", payload);
            this.loadComments();
          }
        )
        .subscribe();
    },
  };

  // ========================================================================
  // UI Manager
  // ========================================================================
  const ui = {
    createCommentElement(comment, isReply = false) {
      const commentElement = document.createElement("div");
      commentElement.className = `comment-section ${isReply ? "is-reply" : ""}`;
      commentElement.dataset.commentId = comment.id;
      if (comment.parent_id)
        commentElement.dataset.parentId = comment.parent_id;
      const isOwner =
        state.currentUser && state.currentUser.id === comment.user_id;
      const repliesCount = this.getTotalRepliesCount(comment);
      const toggleRepliesButtonHTML =
        repliesCount > 0
          ? `<div class="replies-toggle"><button class="toggle-replies-btn"><svg viewBox="0 0 24 24"><path d="M12 16.42L6.29 10.71L7.71 9.29L12 13.59L16.29 9.29L17.71 10.71L12 16.42Z"></path></svg>${repliesCount} ${
              repliesCount === 1 ? "رد" : repliesCount === 2 ? "ردان" : "ردود"
            }</button></div>`
          : "";
      const ownerActionsHTML = isOwner
        ? `<div class="comment-actions"><button class="edit-comment-btn" data-comment-id="${comment.id}" title="تعديل"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button class="delete-comment-btn" data-comment-id="${comment.id}" title="حذف"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div>`
        : "";

      const userIdNumber = getUserIdNumber(comment.user_id);
      const randomAvatar = avatars[userIdNumber % avatars.length];
      const avatarUrl = comment.avatar_url || randomAvatar;

      let footerControls = "";
      if (state.isAuthenticated) {
        footerControls = `
          <div class="reply"><button class="reply-btn" data-comment-id="${comment.id}">رد</button></div>
          ${toggleRepliesButtonHTML}
        `;
      } else {
        footerControls = toggleRepliesButtonHTML;
      }

      commentElement.innerHTML = `
        <div class="comment-main-content">
          <img src="${avatarUrl}" class="author-image" alt="Author Image" />
          <div class="comment-details">
            <div class="comment-header">
              <div class="comment-author">${comment.username}${
        comment.is_edited ? '<span class="edited-badge">(معدل)</span>' : ""
      }</div>
              <div class="comment-time">${comment.time}</div>
              ${ownerActionsHTML}
            </div>
            <p class="comment-body">${this.escapeHtml(comment.body)}</p>
            <div class="comment-footer">
              <div class="heart">
                <button class="like-btn ${
                  comment.user_has_liked ? "liked" : ""
                }" data-comment-id="${comment.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" height="17px" viewBox="0 0 24 24" width="17px"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </button>
                <p class="likes-count">${comment.likes_count || 0}</p>
              </div>
              ${footerControls}
            </div>
          </div>
        </div>
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
        </div>`;
      return commentElement;
    },

    displayComments(comments) {
      if (!elements.commentsContainer) return;
      elements.commentsContainer.innerHTML = "";
      if (comments.length === 0) {
        elements.commentsContainer.innerHTML = `<div class="no-comments"><p>لا توجد تعليقات بعد. كن أول من يعلق!</p></div>`;
        return;
      }
      comments.forEach((comment) => {
        const commentElement = this.createCommentElement(comment);
        elements.commentsContainer.appendChild(commentElement);
      });
    },

    showLoading() {
      if (elements.commentsContainer)
        elements.commentsContainer.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>جاري التحميل...</p></div>`;
    },
    showError(message) {
      if (elements.commentsContainer)
        elements.commentsContainer.innerHTML = `<div class="error-message"><p>❌ ${message}</p></div>`;
    },
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    getTotalRepliesCount(comment) {
      let count = comment.replies ? comment.replies.length : 0;
      if (comment.replies) {
        comment.replies.forEach(reply => {
          count += this.getTotalRepliesCount(reply);
        });
      }
      return count;
    },

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
            <form id="login-form" class="auth-form active">
              <h3>تسجيل الدخول</h3>
              <div class="form-group"><input type="email" id="login-email" placeholder="البريد الإلكتروني" required></div>
              <div class="form-group"><input type="password" id="login-password" placeholder="كلمة المرور" required></div>
              <div class="form-error" id="login-error"></div>
              <button type="submit" class="auth-submit-btn">دخول</button>
            </form>
            <form id="register-form" class="auth-form">
              <h3>إنشاء حساب جديد</h3>
              <div class="form-group"><input type="text" id="register-username" placeholder="اسم المستخدم" required></div>
              <div class="form-group"><input type="email" id="register-email" placeholder="البريد الإلكتروني" required></div>
              <div class="form-group"><input type="password" id="register-password" placeholder="كلمة المرور (6 أحرف على الأقل)" required minlength="6"></div>
              <div class="form-error" id="register-error"></div>
              <button type="submit" class="auth-submit-btn">إنشاء حساب</button>
            </form>
          </div>`;
      document.body.appendChild(modal);
      elements.authModal = modal;
    },

    // --- START: Added from real-comments.js ---
    showMainCommentForm() {
      if (!elements.commentsPanel) return;

      // Remove existing form if any to prevent duplicates
      const existingForm = elements.commentsPanel.querySelector(
        ".main-comment-input-container"
      );
      if (existingForm) existingForm.remove();

      const formHtml = `
        <div class="main-comment-input-container">
          ${
            state.isAuthenticated
              ? `
                <img src="${state.currentUser.avatar_url}" class="current-user-avatar" alt="Your Avatar">
                <form id="main-comment-form" class="main-comment-form">
                  <div class="textarea-wrapper">
                    <textarea id="main-comment-textarea" class="comment-textarea" placeholder="اتحفنا بـ ردك" required></textarea>
                  </div>
                  <div class="comment-form-actions">
                    <button type="button" id="main-cancel-btn" class="comment-cancel-btn">إلغاء</button>
                    <button type="submit" id="main-submit-btn" class="comment-submit-btn" disabled>تعليق</button>
                  </div>
                </form>
              `
              : `
                <div class="comment-auth-prompt">
                  <p>يجب تسجيل الدخول لإضافة تعليق</p>
                  <button id="auth-prompt-btn" class="auth-prompt-btn">تسجيل الدخول / حساب جديد</button>
                </div>
              `
          }
        </div>
      `;
      const commentsPanelHeader = elements.commentsPanel.querySelector(
        ".comments-panel-header"
      );
      if (commentsPanelHeader) {
        commentsPanelHeader.insertAdjacentHTML("afterend", formHtml);
        elements.commentInputContainer = elements.commentsPanel.querySelector(
          ".main-comment-input-container"
        );
        elements.commentInputTextarea = elements.commentsPanel.querySelector(
          "#main-comment-textarea"
        );
        elements.commentSubmitBtn =
          elements.commentsPanel.querySelector("#main-submit-btn");
      }
    },
    // --- END: Added from real-comments.js ---

    showReplyForm(targetElement, commentId) {
      const existingForm = document.querySelector(".reply-form-container");
      if (existingForm) existingForm.remove();
      const formContainer = document.createElement("div");
      formContainer.className = "reply-form-container";
      formContainer.innerHTML = `
          <img src="${state.currentUser.avatar_url}" class="current-user-avatar" alt="Your Avatar">
          <form class="reply-form" data-reply-to-id="${commentId}">
            <div class="textarea-wrapper"><textarea class="reply-textarea" placeholder="إضافة رد..." required></textarea></div>
            <div class="reply-form-actions">
              <button type="button" class="reply-cancel-btn">إلغاء</button>
              <button type="submit" class="reply-submit-btn" disabled>رد</button>
            </div>
          </form>`;
      targetElement.insertAdjacentElement("afterend", formContainer);
      formContainer.querySelector(".reply-textarea").focus();
    },

    showEditForm(commentElement, commentId, currentBody) {
      const bodyElement = commentElement.querySelector(".comment-body");
      bodyElement.innerHTML = `
          <form class="edit-form" data-comment-id="${commentId}">
            <textarea class="edit-textarea" required>${currentBody}</textarea>
            <div class="edit-form-actions">
              <button type="button" class="edit-cancel-btn">إلغاء</button>
              <button type="submit" class="edit-submit-btn">حفظ</button>
            </div>
          </form>`;
      const textarea = bodyElement.querySelector(".edit-textarea");
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    },
  };

  // ========================================================================
  // Event Handlers
  // ========================================================================
  const handlers = {
    handleDocumentClick(event) {
      if (event.target.closest(".reply-btn")) {
        const commentId = event.target.closest(".reply-btn").dataset.commentId;
        const commentElement = event.target.closest(".comment-section");
        ui.showReplyForm(commentElement, commentId);
        return;
      }
      if (event.target.closest(".reply-cancel-btn")) {
        event.target.closest(".reply-form-container").remove();
        return;
      }
      // --- START: Added from real-comments.js ---
      if (event.target.closest("#main-cancel-btn")) {
        const form = event.target.closest("form");
        if (form) {
          const textarea = form.querySelector("#main-comment-textarea");
          const submitBtn = form.querySelector("#main-submit-btn");
          if (textarea) {
            textarea.value = "";
            textarea.style.height = "auto";
          }
          if (submitBtn) {
            submitBtn.disabled = true;
          }
        }
        return;
      }
      if (event.target.closest("#auth-prompt-btn")) {
        ui.showAuthModal();
        return;
      }
      // --- END: Added from real-comments.js ---
      if (event.target.closest(".toggle-replies-btn")) {
        const toggleBtn = event.target.closest(".toggle-replies-btn");
        toggleBtn.classList.toggle("open");
        const commentSection = toggleBtn.closest(".comment-section");
        const repliesContainer =
          commentSection.querySelector(".replies-container");
        repliesContainer.classList.toggle("open");
        return;
      }
      if (event.target.closest(".like-btn")) {
        const commentId = event.target.closest(".like-btn").dataset.commentId;
        commentManager.toggleLike(commentId);
        return;
      }
      if (event.target.closest(".edit-comment-btn")) {
        const commentId =
          event.target.closest(".edit-comment-btn").dataset.commentId;
        const commentElement = event.target.closest(".comment-section");
        const currentBody =
          commentElement.querySelector(".comment-body").textContent;
        ui.showEditForm(commentElement, commentId, currentBody);
        return;
      }
      if (event.target.closest(".delete-comment-btn")) {
        const commentId = event.target.closest(".delete-comment-btn").dataset
          .commentId;
        commentManager.deleteComment(commentId);
        return;
      }
      if (event.target.closest(".edit-cancel-btn")) {
        commentManager.loadComments();
        return;
      }
      if (
        event.target.matches(".auth-modal-close") ||
        event.target.matches(".auth-modal")
      ) {
        document.getElementById("auth-modal")?.remove();
        return;
      }
      if (event.target.closest(".auth-tab")) {
        const tab = event.target.closest(".auth-tab");
        const targetTab = tab.dataset.tab;
        document
          .querySelectorAll(".auth-tab")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".auth-form")
          .forEach((f) => f.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(`${targetTab}-form`).classList.add("active");
        return;
      }
    },

    async handleFormSubmit(event) {
      // --- START: Added from real-comments.js ---
      if (event.target.matches("#main-comment-form")) {
        event.preventDefault();
        const textarea = document.getElementById("main-comment-textarea");
        const body = textarea.value.trim();
        if (body) {
          const result = await commentManager.postComment(body);
          if (result.success) {
            textarea.value = "";
            textarea.style.height = "auto";
            document.getElementById("main-submit-btn").disabled = true;
          }
        }
        return;
      }
      // --- END: Added from real-comments.js ---
      if (event.target.matches(".reply-form")) {
        event.preventDefault();
        const form = event.target;
        const replyToId = parseInt(form.dataset.replyToId);
        const body = form.querySelector(".reply-textarea").value.trim();
        if (body) {
          const result = await commentManager.postComment(body, replyToId);
          if (result.success) form.closest(".reply-form-container").remove();
        }
        return;
      }
      if (event.target.matches(".edit-form")) {
        event.preventDefault();
        const form = event.target;
        const commentId = parseInt(form.dataset.commentId);
        const body = form.querySelector(".edit-textarea").value.trim();
        if (body) await commentManager.updateComment(commentId, body);
        return;
      }
      if (event.target.matches("#login-form")) {
        event.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const errorDiv = document.getElementById("login-error");
        const result = await auth.login(email, password);
        if (result.success) {
          document.getElementById("auth-modal")?.remove();
          location.reload(); // Behavior matched
        } else {
          errorDiv.textContent = result.error;
        }
        return;
      }
      if (event.target.matches("#register-form")) {
        event.preventDefault();
        const username = document
          .getElementById("register-username")
          .value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const errorDiv = document.getElementById("register-error");
        const result = await auth.register(email, password, username);
        if (result.success) {
          document.getElementById("auth-modal")?.remove();
          location.reload(); // Behavior matched
        } else {
          errorDiv.textContent = result.error;
        }
        return;
      }
    },

    handleTextareaInput(event) {
      if (
        !event.target.matches(
          ".reply-textarea, .edit-textarea, .comment-textarea"
        )
      )
        return;
      const textarea = event.target;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
      const form = textarea.closest("form");
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = textarea.value.trim().length === 0;
    },
  };

  // ========================================================================
  // Panel Controls (Identical to real-comments.js)
  // ========================================================================
  const panelControls = {
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
      elements.commentsBtn?.classList.add("active");
    },
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
      elements.commentsBtn?.classList.remove("active");
    },
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
    if (!elements.commentsContainer) {
      console.error("Comments container not found!");
      return;
    }

    await auth.init();

    // --- START: Added from real-comments.js ---
    ui.showMainCommentForm();
    // --- END: Added from real-comments.js ---

    await commentManager.loadComments();
    commentManager.setupRealtimeSubscription();

    document.addEventListener("click", handlers.handleDocumentClick);
    document.addEventListener("submit", handlers.handleFormSubmit);
    document.addEventListener("input", handlers.handleTextareaInput);

    elements.commentsBtn?.addEventListener("click", () =>
      panelControls.togglePanel()
    );
    elements.closeCommentsBtn?.addEventListener("click", () =>
      panelControls.closePanel()
    );
    elements.commentsOverlay?.addEventListener("click", () =>
      panelControls.closePanel()
    );

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
      "%c🚀 Supabase Comments System Ready!",
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

  // Expose API
  window.CommentsSystem = {
    auth,
    reload: () => commentManager.loadComments(),
    setChapter: (chapterId) => {
      CONFIG.currentChapterId = chapterId;
      commentManager.loadComments();
      commentManager.setupRealtimeSubscription();
    },
  };
  /* ===== Connectors: رسم خطوط منحنيه بين التعليق والوالد ===== */
  (function () {
    const Connector = {
      svg: null,
      container: null,
      pathClass: "connector-path",
      init() {
        this.container = document.querySelector(".comments-container");
        if (!this.container) return;
        // اجعل ال container relative (لو مش موجود)
        const compStyle = getComputedStyle(this.container).position;
        if (compStyle === "static") this.container.style.position = "relative";

        // أنشئ الـSVG لو مش موجود
        this.svg = this.container.querySelector(".comments-connector-svg");
        if (!this.svg) {
          this.svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          this.svg.classList.add("comments-connector-svg");
          this.svg.setAttribute("aria-hidden", "true");
          this.container.prepend(this.svg);
        }

        // مراقب تغيُّر DOM لرسم تلقائي
        this.observeMutations();
        // رسم أولي
        this.redrawDebounced();

        // إعادة الرسم عند تغيير الحجم
        window.addEventListener("resize", this.redrawDebounced.bind(this));
      },

      // debounce
      redrawDebounced: (function () {
        let t;
        return function () {
          clearTimeout(t);
          t = setTimeout(() => Connector.redraw(), 80);
        };
      })(),

      observeMutations() {
        if (this._observer) this._observer.disconnect();
        const obs = new MutationObserver(() => this.redrawDebounced());
        obs.observe(this.container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: [
            "class",
            "style",
            "data-parent-id",
            "data-comment-id",
          ],
        });
        this._observer = obs;
      },

      clearSVG() {
        while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
      },

      redraw() {
        if (!this.container || !this.svg) return;
        // حجم الـSVG يطابق حجم الـcontainer
        const rect = this.container.getBoundingClientRect();
        this.svg.setAttribute("width", rect.width);
        this.svg.setAttribute("height", rect.height);
        this.svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);

        this.clearSVG();

        // اجمع كل التعليقات اللي لها parent
        const comments = Array.from(
          this.container.querySelectorAll(".comment-section[data-comment-id]")
        );

        // خرائط: id -> element, id-> avatar center (relative to container)
        const idToEl = new Map();
        const idToAvatar = new Map();

        comments.forEach((c) => {
          const id = c.dataset.commentId;
          idToEl.set(id, c);
          const avatar = c.querySelector(".author-image");
          if (avatar) {
            const aRect = avatar.getBoundingClientRect();
            // نحسب مركز الصورة بالنسبة للـcontainer
            const cx = aRect.left - rect.left + aRect.width / 2;
            const cy = aRect.top - rect.top + aRect.height / 2;
            idToAvatar.set(id, { cx, cy, w: aRect.width, h: aRect.height });
          }
        });

        // الآن لكل تعليق عنده parent نرسم مسار
        comments.forEach((childEl) => {
          const childId = childEl.dataset.commentId;
          const parentId = childEl.dataset.parentId;
          if (!parentId) return;
          const childAvatar = idToAvatar.get(childId);
          const parentAvatar = idToAvatar.get(parentId);
          // لو الأب مش ظاهِر مثلاً مخفي أو في صفحة مختلفة نتجاهل
          if (!childAvatar || !parentAvatar) return;

          // نقاط البداية والنهاية (نحو يمين/يسار بناءً على اتجاه)
          const x1 = childAvatar.cx;
          const y1 = childAvatar.cy;
          const x2 = parentAvatar.cx;
          const y2 = parentAvatar.cy;

          // لو المسافة صغيرة جداً نتخطى الرسم
          const dy = y2 - y1;
          const dx = x2 - x1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) return;

          // نحدد اتجاه الانحناء: لو x2 < x1 (يعني الأب على اليسار) نفرد منحنى يسار
          // نحسب نقاط التحكم لعمل منحنى سلس - نعتمد على dy و dx
          const curvature = Math.min(
            120,
            Math.abs(dy) * 0.6 + Math.abs(dx) * 0.3
          );
          // تحكمات على محور X بتدفع المنحنى ناحية الأب
          const cx1 = x1;
          const cy1 = y1 + (dy < 0 ? -curvature * 0.2 : curvature * 0.4);
          const cx2 = x2;
          const cy2 = y2 - (dy < 0 ? -curvature * 0.4 : curvature * 0.2);

          // خلق المسار بصيغة cubic Bezier
          const pathD = `M ${x1.toFixed(1)} ${y1.toFixed(1)}
                       C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(
            1
          )} ${cy2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("d", pathD);
          path.setAttribute("class", this.pathClass + " draw");
          // ضبط سمك/لون لو حبيت تغير من هنا
          path.setAttribute("stroke-width", 2);
          path.setAttribute("stroke", "rgba(255,255,255,0.12)");
          path.setAttribute("fill", "none");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          this.svg.appendChild(path);

          // لو عايز نقطة/دائرة صغيرة عند بداية المسار (اختياري)
          /*
        const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
        circle.setAttribute("cx", x1);
        circle.setAttribute("cy", y1);
        circle.setAttribute("r", 2.2);
        circle.setAttribute("fill", "rgba(255,255,255,0.12)");
        this.svg.appendChild(circle);
        */
        });
      },
    };

    // بداية التشغيل لما DOM يكون جاهز أو لو CommentsSystem جاهز
    document.addEventListener("DOMContentLoaded", () => {
      // انتظار وجود .comments-container
      const waitForContainer = setInterval(() => {
        if (document.querySelector(".comments-container")) {
          clearInterval(waitForContainer);
          Connector.init();
        }
      }, 120);
      // safety stop بعد 5 ثواني
      setTimeout(() => clearInterval(waitForContainer), 5000);
    });
  })();
})();
