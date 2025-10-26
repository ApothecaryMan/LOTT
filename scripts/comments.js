// Author: -REPLACE WITH YOUR NAME-
// OS support: -REPLACE WITH YOUR OS SUPPORT-
// Description: Manages fetching, displaying, and interacting with a nested comment section.

(function () {
  "use strict";

  const state = {
    comments: [],
    currentUser: {
      author: "المستخدم الحالي",
      imageSrc: "https://i.pravatar.cc/50?u=current_user",
    },
  };

  const commentsContainer = document.querySelector(".comments-container");
  if (!commentsContainer) {
    console.error("Comments container not found!");
    return;
  }

  function createCommentElement(comment, isReply = false) {
    const commentElement = document.createElement("div");
    commentElement.className = `comment-section ${isReply ? "is-reply" : ""}`;
    commentElement.dataset.commentId = comment.id;

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

    commentElement.innerHTML = `
      <div class="comment-main-content">
        <img src="${comment.imageSrc}" class="auther-image" alt="Author Image" />
        <div class="comment-details">
          <div class="comment-header">
            <div class="comment-auther">${comment.author}</div>
            <div class="comment-time">${comment.time}</div>
          </div>
          <p class="comment-body">${comment.body}</p>
          <div class="comment-footer">
            <div class="heart">
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </button>
              <p>${comment.likes}</p>
            </div>
            <div class="reply">
              <button class="reply-btn">رد</button>
            </div>
          </div>
        </div>
      </div>
      ${toggleRepliesButtonHTML}
      <div class="replies-container" data-is-loaded="false"></div>
    `;
    return commentElement;
  }

  function displayComments(comments, container) {
    container.innerHTML = "";
    comments.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      container.appendChild(commentElement);
    });
  }

  function displayReplies(repliesData, container) {
    container.innerHTML = "";
    repliesData.forEach((reply) => {
      const replyElement = createCommentElement(reply, true);
      container.appendChild(replyElement);
    });
    container.dataset.isLoaded = "true";
  }

  function showReplyForm(targetElement, commentId) {
    const existingForm = document.querySelector(".reply-form-container");
    if (existingForm) {
      existingForm.remove();
    }

    const formContainer = document.createElement("div");
    formContainer.className = "reply-form-container";
    formContainer.innerHTML = `
      <img src="${state.currentUser.imageSrc}" class="current-user-avatar" alt="Your Avatar">
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
  }

  function findCommentById(commentsArray, id) {
    for (const comment of commentsArray) {
      if (comment.id === id) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  function findAndAddReply(commentsArray, parentId, newReply) {
    for (const comment of commentsArray) {
      if (comment.id === parentId) {
        if (!comment.replies) {
          comment.replies = [];
        }
        comment.replies.unshift(newReply);
        return true;
      }
      if (comment.replies && comment.replies.length > 0) {
        if (findAndAddReply(comment.replies, parentId, newReply)) {
          return true;
        }
      }
    }
    return false;
  }

  function handleDocumentClick(event) {
    const replyBtn = event.target.closest(".reply-btn");
    if (replyBtn) {
      const commentElement = replyBtn.closest(".comment-section");
      const commentId = commentElement.dataset.commentId;
      showReplyForm(commentElement, commentId);
      return;
    }

    const cancelBtn = event.target.closest(".reply-cancel-btn");
    if (cancelBtn) {
      cancelBtn.closest(".reply-form-container").remove();
      return;
    }

    const toggleBtn = event.target.closest(".toggle-replies-btn");
    if (toggleBtn) {
      const commentId = toggleBtn.closest(".comment-section").dataset.commentId;
      const repliesContainer =
        toggleBtn.closest(".replies-toggle").nextElementSibling;

      toggleBtn.classList.toggle("open");
      repliesContainer.classList.toggle("open");

      const isLoaded = repliesContainer.dataset.isLoaded === "true";
      if (repliesContainer.classList.contains("open") && !isLoaded) {
        const commentData = findCommentById(
          state.comments,
          parseInt(commentId)
        );
        if (commentData && commentData.replies) {
          displayReplies(commentData.replies, repliesContainer);
        }
      }
    }
  }

  function handleFormSubmit(event) {
    if (!event.target.matches(".reply-form")) return;

    event.preventDefault();
    const form = event.target;
    const replyToId = parseInt(form.dataset.replyToId);
    const textarea = form.querySelector(".reply-textarea");
    const body = textarea.value.trim();

    if (body) {
      const newReply = {
        id: Date.now(),
        author: state.currentUser.author,
        imageSrc: state.currentUser.imageSrc,
        time: "الآن",
        body: body,
        likes: 0,
        replies: [],
      };

      if (findAndAddReply(state.comments, replyToId, newReply)) {
        const scrollPosition = commentsContainer.scrollTop;
        displayComments(state.comments, commentsContainer);
        commentsContainer.scrollTop = scrollPosition;
      }
      form.closest(".reply-form-container").remove();
    }
  }

  function handleTextareaInput(event) {
    if (!event.target.matches(".reply-textarea")) return;
    const textarea = event.target;

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    const form = textarea.closest(".reply-form");
    const submitButton = form.querySelector(".reply-submit-btn");
    submitButton.disabled = textarea.value.trim().length === 0;
  }

  async function init() {
    try {
      const response = await fetch("comments.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      state.comments = await response.json();
      displayComments(state.comments, commentsContainer);

      document.addEventListener("click", handleDocumentClick);
      document.addEventListener("submit", handleFormSubmit);
      document.addEventListener("input", handleTextareaInput);

      const commentsBtn = document.getElementById("comments-btn");
      const commentsPanel = document.getElementById("comments-panel");
      const closeCommentsBtn = document.getElementById("close-comments-btn");
      const commentsOverlay = document.getElementById("comments-overlay");

      const openCommentsPanel = () => {
        document.body.classList.add("comments-open");
        commentsPanel.classList.add("open");
        commentsOverlay.classList.add("visible");
        commentsBtn.classList.add("active");
      };

      const closeCommentsPanel = () => {
        document.body.classList.remove("comments-open");
        commentsPanel.classList.remove("open");
        commentsOverlay.classList.remove("visible");
        commentsBtn.classList.remove("active");
      };

      if (commentsBtn && commentsPanel && closeCommentsBtn && commentsOverlay) {
        commentsBtn.addEventListener("click", () => {
          if (commentsPanel.classList.contains("open")) {
            closeCommentsPanel();
          } else {
            openCommentsPanel();
          }
        });
        closeCommentsBtn.addEventListener("click", closeCommentsPanel);
        commentsOverlay.addEventListener("click", closeCommentsPanel);
      }

      console.log(
        `%c✅ تم تحميل وعرض ${state.comments.length} تعليقات بنجاح!`,
        "color: green; font-weight: bold;"
      );
    } catch (error) {
      console.error("حدث خطأ أثناء تحميل بيانات التعليقات:", error);
      commentsContainer.innerHTML =
        "<p>عفواً، حدث خطأ أثناء تحميل التعليقات.</p>";
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

// BUTTON FUNCTION
