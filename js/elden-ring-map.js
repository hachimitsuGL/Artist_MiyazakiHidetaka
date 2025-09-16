var mapExtent = [0.00000000, -6809.00000000, 6509.00000000, 0.00000000];
var mapMinZoom = 0;
var mapMaxZoom = 4;
var mapMaxResolution = 1.00000000;
var mapMinResolution = Math.pow(2, mapMaxZoom) * mapMaxResolution;
var tileExtent = [0.00000000, -6809.00000000, 6509.00000000, 0.00000000];
var crs = L.CRS.Simple;
crs.transformation = new L.Transformation(1, -tileExtent[0], -1, tileExtent[3]);
crs.scale = function (zoom) {
  return Math.pow(2, zoom) / mapMinResolution;
};
crs.zoom = function (scale) {
  return Math.log(scale * mapMinResolution) / Math.LN2;
};
var layer;
var map = new L.Map('map', {
  maxZoom: mapMaxZoom,
  minZoom: mapMinZoom,
  crs: crs
});

layer = L.tileLayer('images/eldenring_map/{z}/{x}/{y}.jpg', {
  minZoom: mapMinZoom, maxZoom: mapMaxZoom,
  tileSize: L.point(512, 512),
  attribution: '',
  noWrap: true,
  tms: true
}).addTo(map);

map.fitBounds([
  crs.unproject(L.point(mapExtent[2], mapExtent[3])),
  crs.unproject(L.point(mapExtent[0], mapExtent[1]))
]);

L.control.mousePosition().addTo(map);


// ========== 0) 工具函数 ==========
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// 若你的底图是用 L.CRS.Simple（常见于切图的大图），你可能掌握的是“像素坐标”。
// 可以用这个小工具把像素坐标转成 Leaflet 需要的 LatLng：
function fromPixels(pxX, pxY, atZoom = (map && map.getMaxZoom ? map.getMaxZoom() : 0)) {
  // 返回 [lat, lng]
  return map.unproject([pxX, pxY], atZoom);
}

// ========== 1) 信息面板渲染 ==========
const infoBox = document.querySelector('#poi-info') || document.querySelector('.info');
function nl2br(s = '') {
  // 先转义，再把 \n 变成 <br>
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

function renderInfo(poi) {
  const infoBox = document.querySelector('#poi-info') || document.querySelector('.info');
  const safeName = escapeHtml(poi.name);
  const analysisHtml = nl2br(poi.analysis || '');
  infoBox.innerHTML = `
    <h2>${safeName}</h2>
    ${poi.img ? `<img src="${poi.img}" alt="${safeName}">` : ''}
    <p class="analysis">${analysisHtml}</p>
  `;
}

// ========== 2) 自定义图标 ==========
// 1) 按原图比例 590:1060 设置显示尺寸（像素）
//    你只需要改这个高度即可（例如 48、56、64 等），宽度会自动按比例算。
const PIN_HEIGHT = 56;
const PIN_RATIO = 590 / 1060; // 宽高比
const PIN_WIDTH = Math.round(PIN_HEIGHT * PIN_RATIO);

// 2) 锚点在图片底部正中（x = 宽度一半，y = 高度）
//    这样大头针“尖端”就会准确落在坐标点上。
const pinIcon = L.icon({
  iconUrl: 'images/thumbtack_icon.png',
  iconSize: [PIN_WIDTH, PIN_HEIGHT],
  iconAnchor: [Math.round(PIN_WIDTH / 2), PIN_HEIGHT],
  // 可选：给提示/tooltip使用
  tooltipAnchor: [0, -Math.round(PIN_HEIGHT * 0.8)]
});

// ========== 3) 兴趣点数据（示例） ==========
// coords 使用 [lat, lng]（Leaflet 坐标）。如果你的地图是 L.CRS.Simple，
// 而你手里是像素坐标 (pxX, pxY)，则请用 fromPixels(pxX, pxY) 转换。
const POIS = [{
  id: 'limgrave',
  name: 'リムグレイブ',
  coords: [-5200, 2500],
  img: 'images/pois/limgrave.jpg',
  analysis: '【背景紹介】はじまりの地。嵐と陽光が交錯する丘陵と古城、放棄された砦が「褪せ人」の出立地点としての寓意を担う。\n【美術分析】空はしばしば高コントラストで、雲影が芝の起伏を切り分ける。彩度を抑えた緑と石灰質の灰が主調で、黄金樹の黄のみが高彩度のアクセントとして遠景に釘を打つ。道は蛇行しつつ視線を遺跡と城砦へ導き、樹木はウィンドブレイク（風の方向）を示して時間感覚を生む。中世風の石造モチーフと自然の有機的形状の対置によって、「文明の残響」のテーマが視覚的に確立される。'
},
{
  id: 'caelid',
  name: 'ケイリッド',
  coords: [-4850, 3600],
  img: 'images/pois/caelid.jpg',
  analysis: '【背景紹介】腐敗と戦役の傷跡が大地そのものを蝕んだ辺境。\n【美術分析】色彩は病的な赤と黒の二項対立。空気遠近は通常の青みを捨て、粉塵のオレンジ霧で距離感を歪ませる。樹形はねじれ、地表は膿泡のような起伏を繰り返し、輪郭は鋸歯状に処理されるため視覚的ストレスが持続する。直立する風車・骨柱が垂直軸を強調し、地平線の低さと相まって圧迫感を増幅。「腐敗＝崩壊美」の審美を、意図的な不快さと荘厳さの同居で描く。'
},
{
  id: 'raya-lucaria',
  name: '魔術学院レアルカリア',
  coords: [-3553, 842],
  img: 'images/pois/raya-lucaria.jpg',
  analysis: '【背景紹介】学術と権威の象徴として湖上に孤立する学院都市。\n【美術分析】ゴシック的尖塔と回廊の反復が「知の垂直性」を示す。石材は冷色寄りのグレーで統一し、湖面の反射光が建築のシャドウを青く冷却する。構図は常に上下二層（空／水）で挟み込み、橋梁や舟が唯一の水平導線となる。魔術効果の粒子は補色の淡い青白で処理され、静謐な色面の中に微細な運動を与える。空間全体が実験室のように滅菌され、「理性の距離」を視覚化。'
},
{
  id: 'stormveil',
  name: 'ストームヴィル城',
  coords: [-4850, 1800],
  img: 'images/pois/stormveil.jpg',
  analysis: '【背景紹介】嵐を抱く断崖に築かれた巨大城塞。門は客人を拒む身体のように歪む。\n【美術分析】斜線（風・旗・雲）が構図全体を支配し、常に対角方向の運動が生まれる。石壁は苔・蔦・割れでテクスチャ密度が高く、近景の粗さ／遠景の均整というスケールの反転が不安を醸す。暖色の松明が冷たい石の色温度を局所的に反転し、攻略導線を示すダイエジェティック・ライティングとして機能。建築は「加算」ではなく「欠損」で語られ、欠け・崩落が物語の主語となる。'
},
{
  id: 'liurnia',
  name: '湖のリエーニエ',
  coords: [-4050, 1100],
  img: 'images/pois/liurnia.jpg',
  analysis: '【背景紹介】浅い湖水と霧が領する学術領の外縁。\n【美術分析】低彩度の群青〜灰が基調で、霧のボリュームライトが遠近を柔らかく分節する。水面は鏡ではなく薄膜として描かれ、反射は意図的に鈍らせて冴えを回避。尖塔や墓標が点景として水平の単調さを破り、視線をスキャンするリズムを作る。環境音と色の冷却で「余白」を強調し、戦闘の閃光が画面の唯一の高周波情報として際立つ、静／動の対照が美学の核。'
},
{
  id: 'altus-plateau',
  name: 'アルトゥス高原',
  coords: [-2200, 1932],
  img: 'images/pois/altus-plateau.jpg',
  analysis: '【背景紹介】黄金樹に最も近い高地。豊穣と荘厳が同時に現れる聖域前庭。\n【美術分析】草海は明度の高い黄緑で塗られ、夕刻のような斜光が長い影を引く。遠景の黄金樹は常に画面の黄金比付近に位置し、自然と視線を吸引するランドマーク設計。列柱・古代遺構が規則的なリズムで並び、都市的秩序と自然の起伏が和音を奏でる。空気は粒子状の金塵で満たされ、神聖性を「光の密度」で表現。'
},
{
  id: 'erdtree',
  name: '黄金樹',
  coords: [-2660, 3000],
  img: 'images/pois/erdtree.jpg',
  analysis: '【背景紹介】世界の中心軸であり祝福と支配の象徴。\n【美術分析】幹は超越的スケールで描かれ、枝葉は発光材質として空を塗り替える。色彩は純度の高い金で、周囲の色相を吸収・支配し、環境全体がモノクローム化する。根は地表の地形線そのものとなり、地図的／神学的な「地の支配」を視覚化。近接時は葉の粒子表現が「神意の雨」のように降り、観者の身体を作品の内部に取り込む没入演出となる。'
},
{
  id: 'leyndell',
  name: '王都ローデイル',
  coords: [-2450, 2650],
  img: 'images/pois/leyndell.jpg',
  analysis: '【背景紹介】黄金樹の麓に展開する宗廟都市。栄華と硬直の終着点。\n【美術分析】白石の街路と黄金の装飾が高コントラストを形成し、樹からの放射状プランが都市計画の秩序を示す。巨大な龍骸が流線形の街路と交差し、歴史の断絶が一筆で描かれる。光は上からの正面光が多く、陰影は薄い—これは「真実を覆い隠す影の欠如」という逆説的表現。祝祭の色と葬送の静けさが同居する厳粛なパレット。'
},
{
  id: 'farum-azula',
  name: '崩れゆくファルム・アズラ',
  coords: [-3220, 5912],
  img: 'images/pois/farum-azula.jpg',
  analysis: '【背景紹介】嵐の渦中に漂う古代都市。時間が解体し続ける遺構。\n【美術分析】建築ブロックが空間的に分解され、アーチは半分だけ残り、連続性が断たれる。色調は風化した砂岩と鉛色の空で抑制され、稲妻のみが高輝度の瞬発的アクセント。遠景は渦の遠近によって放射状に歪み、地平は消失。観者は「重力と時間」の破綻を視覚として体験する。龍のモチーフが曲線の反復で全体に潜み、都市そのものが生物のように見える。'
},
{
  id: 'volcano-manor',
  name: '火山館',
  coords: [-2070, 1100],
  img: 'images/pois/volcano-manor.jpg',
  analysis: '【背景紹介】反権威の結社が拠る、火口縁の貴族館。\n【美術分析】内装は暖色のビロード、燭台、油彩肖像で統一され、外の黒い玄武岩と強い色温度差を作る。曲線的な廊下と密度の高い壁面装飾が「閉鎖と結束」を表し、隠し通路の多用が視覚的パラノイアを誘発。外界の溶岩は高輝度の流動線として画面を切り裂き、館の静的な秩序と火のカオスが常に干渉し合う。'
},
{
  id: 'mountaintops',
  name: '巨人たちの山嶺',
  coords: [-1647, 3840],
  img: 'images/pois/mountaintops.jpg',
  analysis: '【背景紹介】雪と風に晒された終末的高地。巨人の記憶が風紋となって残る。\n【美術分析】色はほぼ無彩で、雪の白を基調に金属的な青灰が混ざる。コントラストは気象で変動し、吹雪時は輪郭が消え、形が「質量」ではなく「気配」で読まれる。稀に見える炎の赤は強烈な補色アクセントとなり、視線と導線を同時に担う。音と風の粒度が画面の粗さと連動し、身体感覚としての寒さを視覚に翻訳する。'
}
];

// ========== 4) 将 POI 加到地图 ==========
const markerLayer = L.layerGroup().addTo(map);
let activeMarker = null;

POIS.forEach((p) => {
  const marker = L.marker(p.coords, { icon: pinIcon, title: p.name });
  marker.on('add', function () {
    // 给图钉加个自定义 class，方便样式控制；并设置无障碍 alt（可选）
    if (this._icon) {
      this._icon.classList.add('poi-marker');
      this._icon.setAttribute('alt', p.name);
    }
  });
  marker.on('click', function () {
    // 激活态样式
    if (activeMarker && activeMarker._icon) {
      activeMarker._icon.classList.remove('poi-marker--active');
    }
    if (this._icon) this._icon.classList.add('poi-marker--active');
    activeMarker = this;

    // 更新信息面板
    renderInfo(p);
  });
  marker.addTo(markerLayer);
});

// ========== 5) 体验小优化（可选） ==========
map.on('click', () => {
  if (activeMarker && activeMarker._icon) {
    activeMarker._icon.classList.remove('poi-marker--active');
  }
  activeMarker = null;
  if (infoBox) infoBox.innerHTML = '<h2>探索の導き</h2><p>地図上のマーカーをクリックして、詳細を確認しましょう。</p>';
});
