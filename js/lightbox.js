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
  // 既存の li > img と li > p からデータを抽出
  // ノード取得：参照を2つ追加
  const titleEl = document.getElementById('lbTitle');
  const bodyEl = document.getElementById('lbBody');

  // 再収集：title は <p>、detail は data-detail から取得
  const items = thumbs.map(li => {
    const img = li.querySelector('img');
    const p = li.querySelector('p');
    const title = (p?.textContent || '').trim() || (img?.alt || '');
    const detail = (img?.dataset.detail || '').trim(); // 本文は data-detail のみを参照
    return {
      src: img?.getAttribute('src'),
      alt: img?.getAttribute('alt') || '',
      title,    // タイトル
      detail    // 本文（空でも可）
    };
  }).filter(it => !!it.src);

  // 開くときにタイトルと本文をそれぞれ描画
  function open(i) {
    index = (i + items.length) % items.length;
    const it = items[index];

    imgEl.src = it.src;
    imgEl.alt = it.alt;

    // タイトル：常に表示（<p> を優先、なければ alt にフォールバック）
    titleEl.textContent = it.title || it.alt || '';

    // 本文：data-detail を優先。本文がない場合に非表示にしたいなら if のコメントを外す
    // if (!it.detail) { bodyEl.style.display = 'none'; } else { bodyEl.style.display = ''; }
    // 改行に対応（CSS で white-space: pre-wrap を使用）、textContent で安全
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
    // アニメーション終了後に非表示にする（チラつきを避ける）
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

  // サムネイルのクリックをバインド
  thumbs.forEach((li, i) => {
    const img = li.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(i));
    // li にもクリックを付けられる：
    li.addEventListener('click', (e) => {
      if (e.target.tagName !== 'IMG') open(i);
    });
  });

  // ナビゲーションと閉じる
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  btnClose.addEventListener('click', (e) => { e.stopPropagation(); close(); });

  // 背景クリックで閉じる（overlay の空白領域のみで発火）
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // キーボード対応
  window.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // 簡易スワイプ（左右で画像切替）
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    if (!isOpen) return;
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    if (!isOpen) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40; // 一定距離以上のスワイプで発火
    if (dx > threshold) { prev(); }
    else if (dx < -threshold) { next(); }
  }, { passive: true });
})();
