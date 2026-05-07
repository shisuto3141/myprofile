// ===== VISITOR TRACKING =====
// Railway にデプロイ後、URL を差し替えてください
const VISITOR_API = 'https://myprofile-production-3766.up.railway.app/api/visit';

(async () => {
  try {
    await fetch(VISITOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer:      document.referrer || null,
        user_agent:    navigator.userAgent,
        screen_width:  window.screen.width,
        screen_height: window.screen.height,
        page_url:      location.href,
      }),
    });
  } catch (_) {
    // tracking 失敗はサイト表示に影響させない
  }
})();

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
    photos: [ { src: 'assets/hobbies/food1.jpg', alt: 'チキンのクリーム煮' },
              { src: 'assets/hobbies/food2.jpg', alt: 'オーブンレンジを買ったので、ミートパイを焼きました！' },
              { src: 'assets/hobbies/food3.jpg', alt: '真鯛を捌いてポワレのオレンジソースがけを作りました' },
              { src: 'assets/hobbies/food4.jpg', alt: 'SNSで話題になってたジューシーハンバーグ' },
              { src: 'assets/hobbies/food5.jpg', alt: '明太子パスタと白ワイン' },
              { src: 'assets/hobbies/food6.jpg', alt: '鶏むね肉のソテーとシーフードリゾット' }
    ],
  },
  outdoor: {
    title: '旅行・キャンプ',
    icon: 'bi bi-airplane',
    comment: 'アウトドア全般が好き。非日常の景色でリフレッシュするのが最高。ソロキャンプから友人と登山まで幅広く楽しんでいます。',
    photos: [{ src: 'assets/hobbies/outdoor1.jpg', alt: '山梨県のまかいの牧場にて' },
             { src: 'assets/hobbies/outdoor2.jpg', alt: '本栖湖キャンプ場でソロキャン！富士山が良く見えました' },
             { src: 'assets/hobbies/outdoor3.jpg', alt: '出張でスペインのバルセロナへ！ギリ未完成のサクラダ・ファミリア' },
             { src: 'assets/hobbies/outdoor4.jpg', alt: 'バルセロナはシーフードが最高でした！' },
             { src: 'assets/hobbies/outdoor5.jpg', alt: 'ドイツ・フランクフルトにて' },
             { src: 'assets/hobbies/outdoor6.jpg', alt: 'ドイツのビールはめっちゃデカいです' }],
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
    if (lightbox.classList.contains('is-open'))             closeLightbox();
    else if (projectOverlay.classList.contains('is-open'))  closeProjectModal();
    else                                                    closeModal();
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

// ===== PROJECT MODAL =====
const PROJECT_SCREENSHOT_SLOTS = 4;

const projectModalData = {
  levelog: {
    name:       'LeveLog',
    icon:       'assets/projects/levelog_icon.png',
    status:     '🚀 Coming Soon',
    desc:       '日々の学習・成長を記録してレベルアップを実感できるスマホアプリ。勉強時間・読書・筋トレなど、あらゆる「成長」を記録してゲーム感覚で続けられる仕組みを作っています。',
    features: [
      '学習・習慣の記録とレベルアップ演出',
      'AI による学習アドバイス機能',
      '成長グラフ・統計ダッシュボード',
      'カテゴリ別スキルツリー',
    ],
    tags:    ['Flutter', 'Dart', 'Firebase', 'AI'],
    screenshots: [
      // リリース後に画像パスを追加
      // 例: { src: 'assets/levelog_ss1.png', alt: 'ホーム画面' }
      { src: 'assets/projects/levelog1.jpg', alt: 'ホーム画面' },
      { src: 'assets/projects/levelog2.jpg', alt: 'ログ記録でステータスアップ' },
      { src: 'assets/projects/levelog3.jpg', alt: 'レベルアップするとキャラクターが成長！' },
      { src: 'assets/projects/levelog4.jpg', alt: '記録はカレンダーで確認できます' },
    ],
  },
};

const projectOverlay   = document.getElementById('projectModalOverlay');
const pModalIcon       = projectOverlay.querySelector('.pmodal-icon');
const pModalName       = projectOverlay.querySelector('.pmodal-name');
const pModalStatus     = projectOverlay.querySelector('.pmodal-status');
const pModalDesc       = projectOverlay.querySelector('.pmodal-desc');
const pModalFeatures   = projectOverlay.querySelector('.pmodal-features');
const pModalTags       = projectOverlay.querySelector('.pmodal-tags');
const pModalScreenshots = projectOverlay.querySelector('.pmodal-screenshots');
const projectCloseBtn  = document.getElementById('projectModalClose');

function openProjectModal(key) {
  const d = projectModalData[key];
  if (!d) return;

  pModalIcon.src       = d.icon;
  pModalIcon.alt       = d.name;
  pModalName.textContent   = d.name;
  pModalStatus.textContent = d.status;
  pModalDesc.textContent   = d.desc;

  // 機能リスト
  pModalFeatures.innerHTML = d.features
    .map(f => `<li>${f}</li>`)
    .join('');

  // タグ
  pModalTags.innerHTML = d.tags
    .map(t => `<span>${t}</span>`)
    .join('');

  // スクリーンショット
  pModalScreenshots.innerHTML = '';
  for (let i = 0; i < PROJECT_SCREENSHOT_SLOTS; i++) {
    const slot = document.createElement('div');
    slot.className = 'pmodal-screenshot-slot';
    if (d.screenshots[i]) {
      const img = document.createElement('img');
      img.src = d.screenshots[i].src;
      img.alt = d.screenshots[i].alt || '';
      slot.appendChild(img);
    } else {
      slot.innerHTML = '<i class="bi bi-phone"></i><span>準備中</span>';
    }
    pModalScreenshots.appendChild(slot);
  }

  projectOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  projectOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.project-card--clickable').forEach((card) => {
  card.addEventListener('click', () => openProjectModal(card.dataset.project));
});

projectCloseBtn.addEventListener('click', closeProjectModal);
projectOverlay.addEventListener('click', (e) => {
  if (e.target === projectOverlay) closeProjectModal();
});

// スクリーンショットのライトボックス（project modal 内）
pModalScreenshots.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if (img) openLightbox(img.src, img.alt);
});
