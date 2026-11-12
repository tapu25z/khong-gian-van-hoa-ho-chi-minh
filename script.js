/**
 * Blog cá nhân - Bùi Huỳnh Tây (UIT - ĐHQG-HCM)
 * JavaScript tối giản cho trải nghiệm đọc
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Chế độ Sáng / Tối
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('personal_blog_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('personal_blog_theme', next);
      updateThemeIcon(next);
      showToast(next === 'dark' ? 'Đã bật chế độ tối' : 'Đã bật chế độ sáng');
    });
  }

  function updateThemeIcon(theme) {
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // 2. Thanh tiến trình đọc
  const progressBar = document.getElementById('reading-progress-bar');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0 && progressBar) {
      progressBar.style.width = ((window.scrollY / total) * 100) + '%';
    }
  }, { passive: true });

  // 3. Nút Thích bài viết
  const likeBtn = document.getElementById('btn-like-post');
  let likes = parseInt(localStorage.getItem('buihuynhtay_blog_likes')) || 42;
  const likeCountSpan = document.getElementById('like-count');
  if (likeCountSpan) likeCountSpan.textContent = likes;

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likes++;
      localStorage.setItem('buihuynhtay_blog_likes', likes);
      if (likeCountSpan) likeCountSpan.textContent = likes;
      showToast('Cảm ơn bạn đã thích bài viết!');
    });
  }

  // 4. Sao chép link bài viết
  const copyBtn = document.getElementById('btn-copy-url');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Đã sao chép liên kết bài viết!');
      }).catch(() => {
        showToast(window.location.href);
      });
    });
  }

  // 5. Bình luận giản dị
  const commentForm = document.getElementById('simple-comment-form');
  const commentList = document.getElementById('simple-comment-list');
  const savedComments = JSON.parse(localStorage.getItem('buihuynhtay_comments') || '[]');

  savedComments.forEach(c => renderComment(c));

  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('c-name');
      const textInput = document.getElementById('c-text');

      const name = nameInput.value.trim() || 'Bạn đọc';
      const text = textInput.value.trim();

      if (!text) return;

      const newC = {
        name,
        text,
        time: 'Vừa xong'
      };

      savedComments.unshift(newC);
      localStorage.setItem('buihuynhtay_comments', JSON.stringify(savedComments));

      renderComment(newC, true);
      textInput.value = '';
      showToast('Đã gửi bình luận của bạn!');
    });
  }

  function renderComment(c, isNew = false) {
    if (!commentList) return;
    const div = document.createElement('div');
    div.className = 'comment-single';
    div.innerHTML = `
      <div class="comment-header">
        <strong>${escapeHTML(c.name)}</strong> • <span>${c.time}</span>
      </div>
      <div class="comment-body">${escapeHTML(c.text)}</div>
    `;
    if (isNew) {
      commentList.prepend(div);
    } else {
      commentList.appendChild(div);
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-msg';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
