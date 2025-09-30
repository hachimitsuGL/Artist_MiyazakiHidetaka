
(function () {
  const thumbs = Array.from(document.querySelectorAll('#analysis-main .gallery ul li'));
  if (!thumbs.length) return;

  const overlay = document.getElementById('lbOverlay');
  const stage = document.getElementById('lbStage');
  const imgEl = document.getElementById('lbImg');
  const caption = document.getElementById('lbCaption');
  const btnPrev = document.getElementById('lbPrev');
  const btnNext = document.getElementById('lbNext');
  const btnClose = document.getElementById('lbClose');
  let index = 0;
  let isOpen = false;
  // 从现有 li > img 和 li > p 提取数据
  // 节点获取：新增两个引用
  const titleEl = document.getElementById('lbTitle');
  const bodyEl = document.getElementById('lbBody');

  // 重新收集：title 来自 <p>，detail 来自 data-detail
  const items = thumbs.map(li => {
    const img = li.querySelector('img');
    const p = li.querySelector('p');
    const title = (p?.textContent || '').trim() || (img?.alt || '');
    const detail = (img?.dataset.detail || '').trim(); // 正文只认 data-detail
    return {
      src: img?.getAttribute('src'),
      alt: img?.getAttribute('alt') || '',
      title,    // 标题
      detail    // 正文（允许为空）
    };
  }).filter(it => !!it.src);

  // 打开时分别渲染标题和正文
  function open(i) {
    index = (i + items.length) % items.length;
    const it = items[index];

    imgEl.src = it.src;
    imgEl.alt = it.alt;

    // 标题：永远显示（优先 p，没有就回退 alt）
    titleEl.textContent = it.title || it.alt || '';

    // 正文：优先 data-detail；如果你想“无正文时隐藏”，取消注释 if
    // if (!it.detail) { bodyEl.style.display = 'none'; } else { bodyEl.style.display = ''; }
    // 这里支持换行（CSS 用了 white-space: pre-wrap），直接 textContent 即安全
    bodyEl.textContent = it.detail || '';

    overlay.classList.add('is-open');
    overlay.style.display = 'grid';
    requestAnimationFrame(() => {
      overlay.setAttribute('aria-hidden', 'false');
      isOpen = true;
      document.documentElement.style.overflow = 'hidden';
    });
  }

  const close = () => {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    isOpen = false;
    // 动画结束后再隐藏（避免闪烁）
    setTimeout(() => {
      if (!isOpen) {
        overlay.style.display = 'none';
        imgEl.removeAttribute('src');
        document.documentElement.style.overflow = '';
      }
    }, 320);
  };

  const prev = () => open(index - 1);
  const next = () => open(index + 1);

  // 绑定缩略图点击
  thumbs.forEach((li, i) => {
    const img = li.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(i));
    // 也可给 li 加点击：
    li.addEventListener('click', (e) => {
      if (e.target.tagName !== 'IMG') open(i);
    });
  });

  // 导航与关闭
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  btnClose.addEventListener('click', (e) => { e.stopPropagation(); close(); });

  // 点击背景关闭（只在点到 overlay 空白区域时触发）
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // 键盘支持
  window.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // 简单触摸滑动（左/右切图）
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    if (!isOpen) return;
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    if (!isOpen) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40; // 需滑动一定距离才触发
    if (dx > threshold) { prev(); }
    else if (dx < -threshold) { next(); }
  }, { passive: true });
})();
