/* ========================================================================== */
/* == ENHANCED SUPABASE COMMENTS SYSTEM - REAL-TIME & TYPING INDICATORS   == */
/* ========================================================================== */

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
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // ========================================================================
  // Configuration
  // ========================================================================
  const SUPABASE_CONFIG = {
    url: "https://ajjyjpqbsrsexucvbuln.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqanlqcHFic3JzZXh1Y3ZidWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDM1NjgsImV4cCI6MjA3NzUxOTU2OH0.ULSSZ_DzW-TfD8D3FlqvfSar5mCe0OlhkOxmoRq3fo8",
  };

  const CONFIG = {
    currentChapterId: "chapter-1",
    typingTimeout: 3000, // 3 seconds of inactivity clears typing status
    typingDebounce: 300, // Debounce typing broadcasts
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
    presenceChannel: null,
    typingUsers: new Map(), // userId -> {username, timestamp}
    typingTimer: null,
    pendingComments: new Map(), // Optimistic updates: tempId -> comment
  };

  // ========================================================================
  // DOM Elements
  // ========================================================================
  const elements = {
    commentsContainer: document.querySelector(".comments-container"),
    commentsBtn: document.getElementById("comments-btn"),
    commentsPanel: document.getElementById("comments-panel"),
    closeCommentsBtn: document.getElementById("close-comments-btn"),
    commentsOverlay: document.getElementById("comments-overlay"),
    typingIndicator: null,
    connectionStatus: null,
    authModal: null,
    commentInputContainer: null,
    commentInputTextarea: null,
    commentSubmitBtn: null,
  };

  // ========================================================================
  // Utilities
  // ========================================================================
  const utils = {
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    generateTempId() {
      return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },
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
          ui.showMainCommentForm();
          await commentManager.loadComments();
          presence.init();
        } else if (event === "SIGNED_OUT") {
          state.currentUser = null;
          state.isAuthenticated = false;
          ui.showMainCommentForm();
          await commentManager.loadComments();
          presence.disconnect();
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
        avatar_url:
          profile?.avatar_url ||
          avatars[getUserIdNumber(user.id) % avatars.length],
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
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  };

  // ========================================================================
  // Presence & Typing Indicators
  // ========================================================================
  const presence = {
    init() {
      if (!state.isAuthenticated) return;

      if (state.presenceChannel) {
        supabase.removeChannel(state.presenceChannel);
      }

      state.presenceChannel = supabase.channel(
        `presence:${CONFIG.currentChapterId}`,
        {
          config: {
            presence: {
              key: state.currentUser.id,
            },
          },
        }
      );

      state.presenceChannel
        .on("presence", { event: "sync" }, () => {
          this.handlePresenceSync();
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("User joined:", key);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("User left:", key);
          this.removeTypingUser(key);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await state.presenceChannel.track({
              user_id: state.currentUser.id,
              username: state.currentUser.username,
              online_at: new Date().toISOString(),
              typing: false,
            });
          }
        });
    },

    handlePresenceSync() {
      const presenceState = state.presenceChannel.presenceState();

      // Clear all typing users first
      state.typingUsers.clear();

      // Rebuild typing users from presence state
      Object.entries(presenceState).forEach(([userId, presences]) => {
        const presence = presences[0];
        if (presence.typing && userId !== state.currentUser?.id) {
          state.typingUsers.set(userId, {
            username: presence.username,
            timestamp: Date.now(),
          });
        }
      });

      ui.updateTypingIndicator();
    },

    async broadcastTyping(isTyping) {
      if (!state.presenceChannel || !state.isAuthenticated) return;

      try {
        await state.presenceChannel.track({
          user_id: state.currentUser.id,
          username: state.currentUser.username,
          online_at: new Date().toISOString(),
          typing: isTyping,
        });
      } catch (error) {
        console.error("Error broadcasting typing status:", error);
      }
    },

    removeTypingUser(userId) {
      state.typingUsers.delete(userId);
      ui.updateTypingIndicator();
    },

    disconnect() {
      if (state.presenceChannel) {
        supabase.removeChannel(state.presenceChannel);
        state.presenceChannel = null;
      }
      state.typingUsers.clear();
      ui.updateTypingIndicator();
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
        } else if (!comment.parent_id) {
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

      // Optimistic UI update
      const tempId = utils.generateTempId();
      const optimisticComment = {
        id: tempId,
        user_id: state.currentUser.id,
        username: state.currentUser.username,
        avatar_url: state.currentUser.avatar_url,
        body: body,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        time: "الآن",
        likes_count: 0,
        user_has_liked: false,
        is_edited: false,
        replies: [],
        pending: true,
      };

      // Add to UI immediately
      if (parentId) {
        const parentComment = this.findCommentInState(parentId);
        if (parentComment) {
          parentComment.replies.push(optimisticComment);
          const parentElement = elements.commentsContainer.querySelector(
            `[data-comment-id="${parentId}"]`
          );
          if (parentElement) {
            const repliesContainer =
              parentElement.querySelector(".replies-container");
            if (repliesContainer) {
              repliesContainer.classList.remove("empty");
              repliesContainer.appendChild(
                ui.createCommentElement(optimisticComment, true)
              );
            }
          }
        }
      } else {
        state.comments.unshift(optimisticComment);
        if (elements.commentsContainer.querySelector(".no-comments")) {
          elements.commentsContainer.innerHTML = "";
        }
        elements.commentsContainer.prepend(
          ui.createCommentElement(optimisticComment)
        );
      }

      state.pendingComments.set(tempId, optimisticComment);

      // Clear typing indicator
      presence.broadcastTyping(false);

      try {
        const { data, error } = await supabase
          .from("comments")
          .insert({
            user_id: state.currentUser.id,
            chapter_id: CONFIG.currentChapterId,
            parent_id: parentId,
            body,
          })
          .select()
          .single();

        if (error) throw error;

        // Remove optimistic comment
        state.pendingComments.delete(tempId);

        // Real-time subscription will handle adding the confirmed comment
        return { success: true };
      } catch (error) {
        console.error("Error posting comment:", error);

        // Remove failed optimistic comment
        state.pendingComments.delete(tempId);
        const failedElement = elements.commentsContainer.querySelector(
          `[data-comment-id="${tempId}"]`
        );
        if (failedElement) {
          failedElement.remove();
        }

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

        // Optimistic UI update
        const comment = this.findCommentInState(commentId);
        if (comment) {
          comment.user_has_liked = !comment.user_has_liked;
          comment.likes_count += comment.user_has_liked ? 1 : -1;

          const commentElement = elements.commentsContainer.querySelector(
            `[data-comment-id="${commentId}"]`
          );
          if (commentElement) {
            const likeBtn = commentElement.querySelector(".like-btn");
            const likesCount = commentElement.querySelector(".likes-count");
            if (likeBtn) {
              likeBtn.classList.toggle("liked", comment.user_has_liked);
            }
            if (likesCount) {
              likesCount.textContent = comment.likes_count || 0;
            }
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },

    findCommentInState(commentId) {
      const search = (comments) => {
        for (const comment of comments) {
          if (comment.id === commentId) return comment;
          if (comment.replies && comment.replies.length > 0) {
            const found = search(comment.replies);
            if (found) return found;
          }
        }
        return null;
      };
      return search(state.comments);
    },

    async fetchCommentWithUserData(commentId) {
      try {
        const { data, error } = await supabase.rpc(
          "get_single_comment_with_data",
          {
            comment_id_param: commentId,
            user_id_param: state.currentUser?.id || null,
          }
        );
        if (error) throw error;
        return data[0];
      } catch (error) {
        console.error("Error fetching comment with user data:", error);
        return null;
      }
    },

    async handleRealtimeUpdate(payload) {
      const newComment = payload.new;
      const oldComment = payload.old;
      const eventType = payload.eventType;

      console.log("Real-time event:", eventType, payload);

      switch (eventType) {
        case "INSERT":
          // Skip if this is our own optimistic update
          if (state.pendingComments.has(newComment.id)) {
            break;
          }

          const fullComment = await this.fetchCommentWithUserData(
            newComment.id
          );
          if (!fullComment) break;

          // Remove any matching optimistic comments
          state.pendingComments.forEach((pending, tempId) => {
            if (
              pending.body === fullComment.body &&
              pending.parent_id === fullComment.parent_id
            ) {
              const pendingElement = elements.commentsContainer.querySelector(
                `[data-comment-id="${tempId}"]`
              );
              if (pendingElement) {
                pendingElement.remove();
              }
              state.pendingComments.delete(tempId);
            }
          });

          const processedComment = {
            ...fullComment,
            replies: [],
            time: this.formatTimeAgo(fullComment.created_at),
          };

          if (fullComment.parent_id) {
            const parentComment = this.findCommentInState(
              fullComment.parent_id
            );
            if (parentComment) {
              parentComment.replies.push(processedComment);
              const parentElement = elements.commentsContainer.querySelector(
                `[data-comment-id="${parentComment.id}"]`
              );
              if (parentElement) {
                const repliesContainer =
                  parentElement.querySelector(".replies-container");
                if (repliesContainer) {
                  repliesContainer.classList.remove("empty");
                  const newElement = ui.createCommentElement(
                    processedComment,
                    true
                  );
                  newElement.classList.add("comment-appear");
                  repliesContainer.appendChild(newElement);

                  const toggleBtn = parentElement.querySelector(
                    ".toggle-replies-btn"
                  );
                  if (toggleBtn) {
                    const count = ui.getTotalRepliesCount(parentComment);
                    toggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 16.42L6.29 10.71L7.71 9.29L12 13.59L16.29 9.29L17.71 10.71L12 16.42Z"></path></svg>${count} ${
                      count === 1 ? "رد" : count === 2 ? "ردان" : "ردود"
                    }`;
                  }
                }
              }
            }
          } else {
            state.comments.unshift(processedComment);
            if (elements.commentsContainer.querySelector(".no-comments")) {
              elements.commentsContainer.innerHTML = "";
            }
            const newElement = ui.createCommentElement(processedComment);
            newElement.classList.add("comment-appear");
            elements.commentsContainer.prepend(newElement);
          }
          break;

        case "UPDATE":
          const updatedComment = this.findCommentInState(newComment.id);
          if (updatedComment) {
            Object.assign(updatedComment, {
              ...newComment,
              time: this.formatTimeAgo(
                newComment.updated_at || newComment.created_at
              ),
              is_edited: newComment.is_edited,
            });

            const commentElement = elements.commentsContainer.querySelector(
              `[data-comment-id="${newComment.id}"]`
            );
            if (commentElement) {
              commentElement.replaceWith(
                ui.createCommentElement(updatedComment)
              );
            }
          }
          break;

        case "DELETE":
          const deletedCommentId = oldComment.id;
          const removeComment = (commentsArray) => {
            for (let i = 0; i < commentsArray.length; i++) {
              if (commentsArray[i].id === deletedCommentId) {
                commentsArray.splice(i, 1);
                return true;
              }
              if (commentsArray[i].replies?.length > 0) {
                if (removeComment(commentsArray[i].replies)) {
                  return true;
                }
              }
            }
            return false;
          };

          removeComment(state.comments);

          const commentElement = elements.commentsContainer.querySelector(
            `[data-comment-id="${deletedCommentId}"]`
          );
          if (commentElement) {
            commentElement.classList.add("comment-disappear");
            setTimeout(() => commentElement.remove(), 300);
          }

          if (state.comments.length === 0) {
            elements.commentsContainer.innerHTML = `<div class="no-comments"><p>لا توجد تعليقات بعد. كن أول من يعلق!</p></div>`;
          }
          break;
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
            this.handleRealtimeUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          ui.updateConnectionStatus(status === "SUBSCRIBED");
        });
    },
  };

  // ========================================================================
  // UI Manager
  // ========================================================================
  const ui = {
    createCommentElement(comment, isReply = false) {
      const commentElement = document.createElement("div");
      commentElement.className = `comment-section ${
        isReply ? "is-reply" : ""
      } ${comment.pending ? "pending-comment" : ""}`;
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

      const ownerActionsHTML =
        isOwner && !comment.pending
          ? `<div class="comment-actions"><button class="edit-comment-btn" data-comment-id="${comment.id}" title="تعديل"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button class="delete-comment-btn" data-comment-id="${comment.id}" title="حذف"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div>`
          : "";

      const userIdNumber = getUserIdNumber(comment.user_id);
      const randomAvatar = avatars[userIdNumber % avatars.length];
      const avatarUrl = comment.avatar_url || randomAvatar;

      let footerControls = "";
      if (state.isAuthenticated && !comment.pending) {
        footerControls = `
          <div class="reply"><button class="reply-btn" data-comment-id="${comment.id}">رد</button></div>
          ${toggleRepliesButtonHTML}
        `;
      } else if (!comment.pending) {
        footerControls = toggleRepliesButtonHTML;
      }

      const pendingIndicator = comment.pending
        ? '<span class="pending-indicator">جاري الإرسال...</span>'
        : "";

      commentElement.innerHTML = `
        <div class="comment-main-content">
          <img src="${avatarUrl}" class="author-image" alt="Author Image" />
          <div class="comment-details">
            <div class="comment-header">
              <div class="comment-author">${utils.escapeHtml(
                comment.username
              )}${
        comment.is_edited ? '<span class="edited-badge">(معدل)</span>' : ""
      }${pendingIndicator}</div>
              <div class="comment-time">${comment.time}</div>
              ${ownerActionsHTML}
            </div>
            <p class="comment-body">${utils.escapeHtml(comment.body)}</p>
            <div class="comment-footer">
              <div class="heart">
                <button class="like-btn ${
                  comment.user_has_liked ? "liked" : ""
                }" data-comment-id="${comment.id}" ${
        comment.pending ? "disabled" : ""
      }>
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
        elements.commentsContainer.innerHTML = `<div class="error-message"><p>⚠ ${message}</p></div>`;
    },

    getTotalRepliesCount(comment) {
      let count = comment.replies ? comment.replies.length : 0;
      if (comment.replies) {
        comment.replies.forEach((reply) => {
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

    showMainCommentForm() {
      if (!elements.commentsPanel) return;

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
            <textarea class="edit-textarea" required>${utils.escapeHtml(
              currentBody
            )}</textarea>
            <div class="edit-form-actions">
              <button type="button" class="edit-cancel-btn">إلغاء</button>
              <button type="submit" class="edit-submit-btn">حفظ</button>
            </div>
          </form>`;
      const textarea = bodyElement.querySelector(".edit-textarea");
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    },

    updateTypingIndicator() {
      if (!elements.commentsContainer) return;

      let indicator =
        elements.commentsContainer.querySelector(".typing-indicator");

      if (state.typingUsers.size === 0) {
        if (indicator) indicator.remove();
        return;
      }

      const typingUsernames = Array.from(state.typingUsers.values())
        .map((u) => u.username)
        .slice(0, 3);

      let text = "";
      if (typingUsernames.length === 1) {
        text = `${typingUsernames[0]} يكتب...`;
      } else if (typingUsernames.length === 2) {
        text = `${typingUsernames[0]} و ${typingUsernames[1]} يكتبان...`;
      } else {
        text = `${typingUsernames[0]} و ${
          typingUsernames.length - 1
        } آخرون يكتبون...`;
      }

      if (!indicator) {
        indicator = document.createElement("div");
        indicator.className = "typing-indicator";

        const firstComment =
          elements.commentsContainer.querySelector(".comment-section");
        if (firstComment) {
          elements.commentsContainer.insertBefore(indicator, firstComment);
        } else {
          elements.commentsContainer.prepend(indicator);
        }
      }

      indicator.innerHTML = `
        <div class="typing-indicator-content">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">${text}</span>
        </div>
      `;
    },

    updateConnectionStatus(isConnected) {
      let statusEl = document.querySelector(".connection-status");

      if (!statusEl) {
        statusEl = document.createElement("div");
        statusEl.className = "connection-status";
        const header = elements.commentsPanel?.querySelector(
          ".comments-panel-header"
        );
        if (header) {
          header.appendChild(statusEl);
        }
      }

      statusEl.className = `connection-status ${
        isConnected ? "connected" : "disconnected"
      }`;
      statusEl.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">${isConnected ? "متصل" : "غير متصل"}</span>
      `;

      elements.connectionStatus = statusEl;
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
          alert(result.message);
        } else {
          errorDiv.textContent = result.error;
        }
        return;
      }
    },

    handleTextareaInput: utils.debounce(function (event) {
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

      // Broadcast typing status
      if (
        textarea.matches(".comment-textarea, .reply-textarea") &&
        state.isAuthenticated
      ) {
        const isTyping = textarea.value.trim().length > 0;

        if (isTyping) {
          presence.broadcastTyping(true);

          // Clear existing timer
          if (state.typingTimer) {
            clearTimeout(state.typingTimer);
          }

          // Set timer to clear typing status after inactivity
          state.typingTimer = setTimeout(() => {
            presence.broadcastTyping(false);
          }, CONFIG.typingTimeout);
        } else {
          presence.broadcastTyping(false);
          if (state.typingTimer) {
            clearTimeout(state.typingTimer);
          }
        }
      }
    }, CONFIG.typingDebounce),
  };

  // ========================================================================
  // Panel Controls
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
  // SVG Connectors - FIXED VERSION
  // ========================================================================
  const Connector = {
    svg: null,
    container: null,
    pathClass: "connector-path",
    enabled: true, // Disable by default - can be toggled

    init() {
      // You can enable/disable connectors here
      if (!this.enabled) return;

      this.container = document.querySelector(".comments-container");
      if (!this.container) return;

      const compStyle = getComputedStyle(this.container).position;
      if (compStyle === "static") this.container.style.position = "relative";

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

      this.observeMutations();
      this.redrawDebounced();
      window.addEventListener("resize", this.redrawDebounced.bind(this));
    },

    enable() {
      this.enabled = true;
      this.init();
    },

    disable() {
      this.enabled = false;
      if (this.svg) {
        this.svg.remove();
        this.svg = null;
      }
      if (this._observer) {
        this._observer.disconnect();
      }
    },

    redrawDebounced: utils.debounce(function () {
      if (Connector.enabled) Connector.redraw();
    }, 150),

    observeMutations() {
      if (this._observer) this._observer.disconnect();
      const obs = new MutationObserver(() => this.redrawDebounced());
      obs.observe(this.container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"],
      });
      this._observer = obs;
    },

    clearSVG() {
      if (!this.svg) return;
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    },

    redraw() {
      if (!this.enabled || !this.container || !this.svg) return;

      const rect = this.container.getBoundingClientRect();
      this.svg.setAttribute("width", rect.width);
      this.svg.setAttribute("height", rect.height);
      this.svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);

      this.clearSVG();

      // Get all reply comments (those with parent_id)
      const replyComments = Array.from(
        this.container.querySelectorAll(
          ".comment-section.is-reply[data-parent-id]"
        )
      ).filter((el) => {
        // Only show visible replies (not in collapsed containers)
        const repliesContainer = el.closest(".replies-container");
        return repliesContainer && repliesContainer.classList.contains("open");
      });

      replyComments.forEach((replyEl) => {
        const replyId = replyEl.dataset.commentId;
        const parentId = replyEl.dataset.parentId;
        if (!parentId) return;

        const parentEl = this.container.querySelector(
          `[data-comment-id="${parentId}"]`
        );
        if (!parentEl) return;

        const replyAvatar = replyEl.querySelector(".author-image");
        const parentAvatar = parentEl.querySelector(".author-image");

        if (!replyAvatar || !parentAvatar) return;

        const replyRect = replyAvatar.getBoundingClientRect();
        const parentRect = parentAvatar.getBoundingClientRect();

        // Calculate positions relative to container
        const x1 = replyRect.left - rect.left + replyRect.width / 2;
        const y1 = replyRect.top - rect.top + replyRect.height / 2;
        const x2 = parentRect.left - rect.left + parentRect.width / 2;
        const y2 = parentRect.top - rect.top + parentRect.height / 2;

        // Skip if reply is above parent (shouldn't happen)
        if (y1 <= y2) return;

        // Skip if too close
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        if (distance < 30) return;

        // Draw a simple curved line from reply to parent
        this.drawConnection(x1, y1, x2, y2);
      });
    },

    drawConnection(x1, y1, x2, y2) {
      // Calculate the midpoint Y
      const midY = (y1 + y2) / 2;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      // --- START OF CHANGE ---
      // Use a Cubic Bezier curve for a smooth "S" shape
      // This creates a curve that bends from the parent's vertical line towards the reply
      const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      // --- END OF CHANGE ---

      path.setAttribute("d", pathD);
      path.setAttribute("class", this.pathClass);
      // Note: Stroke styles can be controlled from CSS for better management
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");

      this.svg.appendChild(path);
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
    ui.showMainCommentForm();
    await commentManager.loadComments();
    commentManager.setupRealtimeSubscription();

    if (state.isAuthenticated) {
      presence.init();
    }

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

    // Initialize SVG connectors
    setTimeout(() => {
      Connector.init();
    }, 500);

    console.log(
      "%c🚀 Enhanced Supabase Comments System Ready!",
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
      if (state.isAuthenticated) {
        presence.disconnect();
        presence.init();
      }
    },
  };
})();
