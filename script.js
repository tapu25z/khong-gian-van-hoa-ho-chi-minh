/**
 * JAVASCRIPT XỬ LÝ TƯƠNG TÁC CHO WEB BLOG
 * Tác giả: Bùi Huỳnh Tây - Trường Đại học Công nghệ Thông tin ĐHQG-HCM
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initReadingProgressBar();
  initTableOfContents();
  initPodcastPlayer();
  initReactions();
  initShareAndCopy();
  initDailyQuotes();
  initCommentSystem();
  initLightbox();
});

/* 1. XỬ LÝ DARK / LIGHT MODE */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const currentTheme = localStorage.getItem('uit_blog_theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(toggleBtn, currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('uit_blog_theme', newTheme);
      updateThemeIcon(toggleBtn, newTheme);
      showToast(`Đã chuyển sang chế độ ${newTheme === 'dark' ? 'ban đêm' : 'ban ngày'}`);
    });
  }
}

function updateThemeIcon(btn, theme) {
  if (!btn) return;
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('title', theme === 'dark' ? 'Chuyển sang chế độ ban ngày' : 'Chuyển sang chế độ ban đêm');
}

/* 2. THANH TIẾN TRÌNH ĐỌC (READING PROGRESS) */
function initReadingProgressBar() {
  const bar = document.getElementById('reading-progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }, { passive: true });
}

/* 3. MỤC LỤC TỰ ĐỘNG HIGHLIGHT (TABLE OF CONTENTS) */
function initTableOfContents() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const sections = document.querySelectorAll('.post-section-heading');

  if (!sections.length || !tocLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0.1
  });

  sections.forEach(sec => observer.observe(sec));
}

/* 4. TRÌNH PHÁT PODCAST / AUDIO BẢN TIN THANH NIÊN UIT */
function initPodcastPlayer() {
  const playBtn = document.getElementById('audio-play-btn');
  const progressFill = document.querySelector('.audio-progress-bar');
  const timeDisplay = document.getElementById('audio-time-display');

  if (!playBtn) return;

  let isPlaying = false;
  let timer = null;
  let currentSec = 0;
  const totalSec = 255; // 4 phút 15 giây

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.innerHTML = '⏸';
      playBtn.setAttribute('title', 'Tạm dừng');
      showToast('Đang phát bản tin phát thanh: Bài học từ Bác');
      timer = setInterval(() => {
        currentSec++;
        if (currentSec > totalSec) {
          currentSec = 0;
          isPlaying = false;
          playBtn.innerHTML = '▶';
          clearInterval(timer);
        }
        updateAudioUI();
      }, 1000);
    } else {
      playBtn.innerHTML = '▶';
      playBtn.setAttribute('title', 'Nghe bản tin');
      clearInterval(timer);
    }
  });

  function updateAudioUI() {
    const mins = Math.floor(currentSec / 60);
    const secs = currentSec % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (timeDisplay) timeDisplay.textContent = `${formatted} / 04:15`;
    if (progressFill) progressFill.style.width = `${(currentSec / totalSec) * 100}%`;
  }
}

/* 5. TƯƠNG TÁC THẢ TIM, VỖ TAY, ĐÁNH GIÁ (REACTIONS) */
function initReactions() {
  const clapBtn = document.getElementById('btn-clap');
  const likeBtn = document.getElementById('btn-like');
  const starBtn = document.getElementById('btn-star');

  setupReactionButton(clapBtn, 'uit_blog_claps', 128, '👏 Cảm ơn bạn đã vỗ tay ủng hộ bài viết!');
  setupReactionButton(likeBtn, 'uit_blog_likes', 342, '❤️ Bạn đã bày tỏ cảm xúc yêu thích bài viết!');
  setupReactionButton(starBtn, 'uit_blog_stars', 89, '⭐ Bạn đã đánh giá 5 sao cho mô hình giải pháp!');
}

function setupReactionButton(btn, storageKey, initialCount, toastMsg) {
  if (!btn) return;
  const countSpan = btn.querySelector('.count');
  let count = parseInt(localStorage.getItem(storageKey)) || initialCount;
  if (countSpan) countSpan.textContent = count;

  btn.addEventListener('click', () => {
    count++;
    localStorage.setItem(storageKey, count);
    if (countSpan) countSpan.textContent = count;
    btn.classList.add('active');
    showToast(toastMsg);
  });
}

/* 6. CHIA SẺ, COPY LINK & IN BÀI VIẾT */
function initShareAndCopy() {
  const copyBtn = document.getElementById('btn-copy-link');
  const printBtn = document.getElementById('btn-print-post');
  const fbBtn = document.getElementById('btn-share-fb');
  const zaloBtn = document.getElementById('btn-share-zalo');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
      }).catch(() => {
        showToast('🔗 ' + url);
      });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (fbBtn) {
    fbBtn.addEventListener('click', () => {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(shareUrl, '_blank', 'width=600,height=500');
    });
  }

  if (zaloBtn) {
    zaloBtn.addEventListener('click', () => {
      const shareUrl = `https://sp.zalo.me/share?url=${encodeURIComponent(window.location.href)}`;
      window.open(shareUrl, '_blank', 'width=600,height=500');
    });
  }
}

/* 7. LỜI BÁC DẠY HÔM NAY (DAILY QUOTE GENERATOR) */
const hoChiMinhQuotes = [
  {
    text: "Học để làm việc, làm người, làm cán bộ. Học để phụng sự Đoàn thể, giai cấp và nhân dân, Tổ quốc và nhân loại.",
    context: "Lời Bác ghi tại trang đầu cuốn sổ vàng Trường Nguyễn Ái Quốc Trung ương, 1949."
  },
  {
    text: "Đâu cần thanh niên có, việc gì khó có thanh niên.",
    context: "Lời Bác dạy thế hệ trẻ tại Đại hội Thanh niên tích cực Thủ đô, 1961."
  },
  {
    text: "Không có việc gì khó, chỉ sợ lòng không bền. Đào núi và lấp biển, quyết chí ắt làm nên.",
    context: "Tặng Liên phân đội thanh niên xung phong Nà Tu (Bắc Kạn), 1951."
  },
  {
    text: "Đã hẹn thì phải đến, đến cho đúng giờ. Thà mình chịu ướt còn hơn để cả lớp chờ uổng công.",
    context: "Bài học quý báu về tinh thần kỷ luật và tôn trọng thời gian của Bác."
  },
  {
    text: "Học hỏi là một việc phải tiếp tục suốt đời. Không ai có thể tự cho mình đã biết đủ rồi.",
    context: "Bài nói chuyện tại lớp bồi dưỡng cán bộ, 1954."
  },
  {
    text: "Cái đẹp nằm ở sự vừa đủ, không ở sự cầu kỳ. Tiết kiệm là quốc sách, là thước đo đạo đức.",
    context: "Phong cách sống giản dị, cần kiệm, liêm chính của Chủ tịch Hồ Chí Minh."
  }
];

function initDailyQuotes() {
  const quoteText = document.getElementById('daily-quote-text');
  const quoteSource = document.getElementById('daily-quote-source');
  const refreshBtn = document.getElementById('btn-refresh-quote');

  if (!quoteText || !quoteSource || !refreshBtn) return;

  let currentIndex = 0;

  function renderQuote(idx) {
    quoteText.style.opacity = '0';
    quoteSource.style.opacity = '0';
    setTimeout(() => {
      quoteText.textContent = `“${hoChiMinhQuotes[idx].text}”`;
      quoteSource.textContent = `— ${hoChiMinhQuotes[idx].context}`;
      quoteText.style.opacity = '1';
      quoteSource.style.opacity = '1';
    }, 200);
  }

  renderQuote(0);

  refreshBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % hoChiMinhQuotes.length;
    renderQuote(currentIndex);
  });
}

/* 8. HỆ THỐNG BÌNH LUẬN TRỰC TIẾP (COMMENTS) */
function initCommentSystem() {
  const form = document.getElementById('comment-form');
  const list = document.getElementById('comment-list');
  const countEl = document.getElementById('comment-count');

  if (!form || !list) return;

  // Tải bình luận đã lưu từ localStorage
  const savedComments = JSON.parse(localStorage.getItem('uit_blog_user_comments') || '[]');
  savedComments.forEach(c => prependCommentNode(c, false));
  updateCommentCount();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('comment-name');
    const roleInput = document.getElementById('comment-role');
    const messageInput = document.getElementById('comment-message');

    const name = nameInput.value.trim();
    const role = roleInput.value.trim() || 'Sinh viên UIT';
    const message = messageInput.value.trim();

    if (!name || !message) {
      showToast('⚠️ Vui lòng điền họ tên và nội dung bình luận!');
      return;
    }

    const newComment = {
      name,
      role,
      message,
      date: 'Vừa xong'
    };

    savedComments.unshift(newComment);
    localStorage.setItem('uit_blog_user_comments', JSON.stringify(savedComments));

    prependCommentNode(newComment, true);
    updateCommentCount();

    nameInput.value = '';
    roleInput.value = '';
    messageInput.value = '';

    showToast('🎉 Cảm ơn bạn! Bình luận đã được đăng thành công.');
  });

  function prependCommentNode(c, isNew) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    if (isNew) item.style.animation = 'zoomIn 0.3s ease';

    item.innerHTML = `
      <div class="comment-author-row">
        <div class="comment-author-name">
          <span>${escapeHTML(c.name)}</span>
          <span class="comment-role-tag">${escapeHTML(c.role)}</span>
        </div>
        <span class="comment-date">${c.date}</span>
      </div>
      <div class="comment-text">${escapeHTML(c.message)}</div>
    `;
    list.prepend(item);
  }

  function updateCommentCount() {
    if (!countEl) return;
    const total = 4 + savedComments.length; // 4 bình luận mặc định + số đã thêm
    countEl.textContent = total;
  }
}

/* 9. LIGHTBOX PHÓNG TO HÌNH ẢNH */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  if (!modal || !modalImg) return;

  const images = document.querySelectorAll('.post-figure img');
  images.forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      const figcaption = img.closest('figure')?.querySelector('figcaption');
      if (modalCaption && figcaption) {
        modalCaption.innerHTML = figcaption.innerHTML;
      } else if (modalCaption) {
        modalCaption.textContent = img.alt || '';
      }
      modal.classList.add('active');
    });
  });

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
}

/* HÀM TOAST THÔNG BÁO */
function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
