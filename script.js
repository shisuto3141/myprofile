// ===== NAV: active link on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);
sections.forEach((s) => navObserver.observe(s));

// ===== FADE-IN on scroll =====
const fadeEls = document.querySelectorAll(
  '.timeline-item, .skill-card, .contact-card, .hobby-card, .project-card'
);

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

fadeEls.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});

const visibleStyle = document.createElement('style');
visibleStyle.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(visibleStyle);

// ===== HOBBY MODAL =====
const PHOTO_SLOTS = 6;

const modalData = {
  cooking: {
    title: '料理',
    icon: 'bi bi-egg-fried',
    comment: 'レシピをアレンジして自分流にカスタマイズするのが楽しい。最近はアジアン系の料理にハマり中。作った料理は写真で記録しています。',
    // 写真を追加するときは src に画像パスを入れてください
    // 例:
    photos: [ { src: 'assets/food1.jpg', alt: 'チキンのクリーム煮' },
              { src: 'assets/food2.jpg', alt: 'オーブンレンジを買ったので、ミートパイを焼きました！' },
              { src: 'assets/food3.jpg', alt: '真鯛を捌いてポワレのオレンジソースがけを作りました' },
              { src: 'assets/food4.jpg', alt: 'SNSで話題になってたジューシーハンバーグ' },
              { src: 'assets/food5.jpg', alt: '明太子パスタと白ワイン' },
              { src: 'assets/food6.jpg', alt: '鶏むね肉のソテーとシーフードリゾット' }
    ],
  },
  outdoor: {
    title: '旅行・キャンプ',
    icon: 'bi bi-airplane',
    comment: 'アウトドア全般が好き。非日常の景色でリフレッシュするのが最高。ソロキャンプから友人と登山まで幅広く楽しんでいます。',
    photos: [{ src: 'assets/outdoor1.jpg', alt: '山梨県のまかいの牧場にて' },
             { src: 'assets/outdoor2.jpg', alt: '本栖湖キャンプ場でソロキャン！富士山が良く見えました' },
             { src: 'assets/outdoor3.jpg', alt: '出張でスペインのバルセロナへ！ギリ未完成のサクラダ・ファミリア' },
             { src: 'assets/outdoor4.jpg', alt: 'バルセロナはシーフードが最高でした！' },
             { src: 'assets/outdoor5.jpg', alt: 'ドイツ・フランクフルトにて' },
             { src: 'assets/outdoor6.jpg', alt: 'ドイツのビールはめっちゃデカいです' }],
  },
};

const overlay  = document.getElementById('modalOverlay');
const modalEl  = overlay.querySelector('.modal');
const titleEl  = overlay.querySelector('.modal-title');
const iconEl   = overlay.querySelector('.modal-title-icon');
const commentEl = overlay.querySelector('.modal-comment');
const photosEl = overlay.querySelector('.modal-photos');
const closeBtn = document.getElementById('modalClose');

function openModal(key) {
  const data = modalData[key];
  if (!data) return;

  titleEl.textContent  = data.title;
  iconEl.className     = `modal-title-icon ${data.icon}`;
  commentEl.textContent = data.comment;

  // 写真グリッドを組み立てる
  photosEl.innerHTML = '';
  for (let i = 0; i < PHOTO_SLOTS; i++) {
    const slot = document.createElement('div');
    slot.className = 'modal-photo-slot';
    if (data.photos[i]) {
      const img = document.createElement('img');
      img.src = data.photos[i].src;
      img.alt = data.photos[i].alt || '';
      slot.appendChild(img);
    } else {
      slot.innerHTML = '<i class="bi bi-camera"></i><span>写真を追加</span>';
    }
    photosEl.appendChild(slot);
  }

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

// 開く：クリック可能な hobby-card
document.querySelectorAll('.hobby-card--clickable').forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.modal));
});

// 閉じる：× ボタン
closeBtn.addEventListener('click', closeModal);

// 閉じる：オーバーレイ背景クリック
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// 閉じる：ESC キー
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightbox.classList.contains('is-open')) closeLightbox();
    else closeModal();
  }
});

// ===== LIGHTBOX =====
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox-close" aria-label="閉じる"><i class="bi bi-x-lg"></i></button>
  <img class="lightbox-img" src="" alt="" />
  <p class="lightbox-caption"></p>
`;
document.body.appendChild(lightbox);

const lbImg     = lightbox.querySelector('.lightbox-img');
const lbCaption = lightbox.querySelector('.lightbox-caption');

function openLightbox(src, caption) {
  lbImg.src            = src;
  lbImg.alt            = caption;
  lbCaption.textContent = caption;
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
}

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// 写真クリックでライトボックスを開く（モーダル内の img に対して委譲）
photosEl.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if (img) openLightbox(img.src, img.alt);
});
