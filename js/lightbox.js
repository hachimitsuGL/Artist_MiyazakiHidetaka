
(function(){
  const thumbs = Array.from(document.querySelectorAll('#analysis-main .gallery ul li'));
  if (!thumbs.length) return;

  const overlay  = document.getElementById('lbOverlay');
  const stage    = document.getElementById('lbStage');
  const imgEl    = document.getElementById('lbImg');
  const caption  = document.getElementById('lbCaption');
  const btnPrev  = document.getElementById('lbPrev');
  const btnNext  = document.getElementById('lbNext');
  const btnClose = document.getElementById('lbClose');

  // 从现有 li > img 和 li > p 提取数据
  const items = thumbs.map(li => {
    const img = li.querySelector('img');
    const p   = li.querySelector('p');
    return {
      src:  img?.getAttribute('src'),
      alt:  img?.getAttribute('alt') || '',
      desc: (p?.textContent || '').trim()
    };
  }).filter(it => !!it.src);

  let index = 0;
  let isOpen = false;

  const open = (i) => {
    index = (i + items.length) % items.length;
    const it = items[index];
    imgEl.src = it.src;
    imgEl.alt = it.alt;
    caption.textContent = it.desc || it.alt || '';
    overlay.classList.add('is-open');
    overlay.style.display = 'grid'; // 立即参与布局
    requestAnimationFrame(() => {
      overlay.setAttribute('aria-hidden', 'false');
      isOpen = true;
      // 防止页面滚动
      document.documentElement.style.overflow = 'hidden';
    });
  };

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
  }, {passive:true});
  overlay.addEventListener('touchend', (e) => {
    if (!isOpen) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40; // 需滑动一定距离才触发
    if (dx > threshold) { prev(); }
    else if (dx < -threshold) { next(); }
  }, {passive:true});
})();
