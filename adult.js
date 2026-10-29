// ============================================================================
// Rex 模块 · 成人资源（rex.mi3s.adult）
// ----------------------------------------------------------------------------
// 全部为公网可直连的苹果CMS v10 源，不依赖任何本机中转。
// 逐源实测（2026-10-29）：搜索接口返回结果、且播放地址能直接取到 #EXTM3U。
//
// 关键修正（相对旧版 hires.js）：
//   1) 原来「找到第一个源就停」，名义多源实际只探 1 个 → 改成分批并发 + 全量合并
//   2) 很多源的 vod_play_url 同时给出「分享页面」和「真 m3u8」两条线路，
//      旧版把分享页也当资源返回（点了放不了）→ 现在只保留可直链播放的地址
//   3) 搜索接口返回的 vod_play_url 可能为空，需再按 ids 拉详情 → 保留该回退
// ============================================================================

var ADULT_SOURCES = [
  { name: "辣椒资源", url: "https://apilj.com/api.php/provide/vod" },
  { name: "森林资源", url: "https://beiyong.slapibf.com/api.php/provide/vod" },
  { name: "XXAV", url: "https://xxavs.com/api.php/provide/vod" },
  { name: "番号资源", url: "http://fhapi9.com/api.php/provide/vod" },
  { name: "香奶儿资源", url: "https://www.gdlsp.com/api/json.php" },
  { name: "淫水机资源", url: "https://www.xrbsp.com/api/json.php" },
  { name: "麻豆资源", url: "https://91md.me/api.php/provide/vod" },
  { name: "madouse", url: "https://madouse.la/api.php/provide/vod" },
  { name: "黄色仓库VIP", url: "https://hsckzy.vip/api.php/provide/vod" },
  { name: "白嫖资源", url: "https://www.kxgav.com/api/json.php" },
  { name: "美少女资源", url: "https://www.msnii.com/api/json.php" },
  { name: "黄AV资源", url: "https://www.pgxdy.com/api/json.php" },
];

WidgetMetadata = {
  id: "rex.mi3s.adult",
  title: "成人资源",
  description: "12 个公网直连成人 CMS 源聚合，只输出可直接播放的 m3u8/mp4 直链",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "adultResource",
      title: "成人资源 · 聚合",
      functionName: "adultResource",
      description: "并发查询 12 个源，合并全部可播放线路",
      type: "stream",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
  ],
};

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function txt(v) { return v == null ? "" : String(v).trim(); }

function clean(v) {
  return txt(v).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
}

function normTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\s：:·・—_\-–（）()\[\]【】,.，。'"“”\u200b\u200c\u200d\ufeff]/g, "");
}

var UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

function unwrap(resp) {
  if (!resp) return null;
  var d = resp.data !== undefined ? resp.data : resp;
  if (typeof d === "string") {
    var s = d.trim();
    if (!s) return null;
    try { return JSON.parse(s); } catch (e) { return null; }
  }
  return d || null;
}

function buildUrl(base, query) {
  var pairs = [];
  for (var k in query) {
    if (!Object.prototype.hasOwnProperty.call(query, k)) continue;
    var v = query[k];
    if (v === undefined || v === null || v === "") continue;
    pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
  }
  if (!pairs.length) return base;
  return base + (base.indexOf("?") >= 0 ? "&" : "?") + pairs.join("&");
}

async function httpGet(url) {
  return await Widget.http.get(url, {
    headers: { "User-Agent": UA },
    timeout: 6000,
  });
}

// 只认可直链播放的地址：m3u8 / mp4 / flv。
// 分享页（/share/xxx、/play/xxx 无扩展名）点了放不出来，一律丢弃。
function isPlayableUrl(u) {
  return /^https?:\/\//i.test(u) && /\.(m3u8|mp4|flv|mkv)(\?|$)/i.test(u);
}

function parsePlayUrl(playUrl, playFrom) {
  var pu = String(playUrl || "").replace(/#+$/, "");
  if (!pu) return [];
  var froms = String(playFrom || "").split("$$$");
  var blocks = pu.split("$$$");
  var out = [];
  for (var i = 0; i < blocks.length; i++) {
    var lineName = clean(froms[i]) || "线路" + (i + 1);
    var chunks = blocks[i].split("#");
    for (var j = 0; j < chunks.length; j++) {
      var parts = chunks[j].split("$");
      if (parts.length < 2) continue;
      var label = clean(parts[0]);
      var url = clean(parts.slice(1).join("$"));
      if (!isPlayableUrl(url)) continue;
      out.push({ line: lineName, label: label, url: url });
    }
  }
  // 兜底：vod_play_url 本身就是裸直链
  if (!out.length && isPlayableUrl(pu.trim())) {
    out.push({ line: clean(froms[0]) || "直链", label: "正片", url: pu.trim() });
  }
  return out;
}

function epNo(label) {
  var m = txt(label).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// ---------------------------------------------------------------------------
// 单源：搜索 → 详情 → 解析线路
// ---------------------------------------------------------------------------

async function queryOne(src, title, episode) {
  var base = src.url;
  var list = [];

  // 搜索：先 ac=detail&wd=，失败再退回 ?wd=
  var probes = [
    buildUrl(base, { ac: "detail", wd: title }),
    buildUrl(base, { wd: title }),
  ];
  for (var p = 0; p < probes.length && !list.length; p++) {
    try {
      var payload = unwrap(await httpGet(probes[p]));
      var l = (payload && payload.list) || [];
      if (Array.isArray(l) && l.length) list = l;
    } catch (e) { /* 换下一种 */ }
  }
  if (!list.length) return [];

  // 片名匹配
  var want = normTitle(title);
  var target = null;
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || !it.vod_id) continue;
    var n = normTitle(it.vod_name);
    if (!want) { target = it; break; }
    if (n === want || n.indexOf(want) >= 0 || want.indexOf(n) >= 0) { target = it; break; }
  }
  if (!target) return [];

  var playUrl = target.vod_play_url || "";
  var playFrom = target.vod_play_from || "";

  // 搜索接口常不给 vod_play_url，再按 ids 拉一次详情
  if (!playUrl) {
    try {
      var det = unwrap(await httpGet(buildUrl(base, { ac: "detail", ids: target.vod_id })));
      var d0 = (det && det.list && det.list[0]) || {};
      playUrl = d0.vod_play_url || "";
      playFrom = d0.vod_play_from || "";
    } catch (e) { return []; }
  }
  if (!playUrl) return [];

  var lines = parsePlayUrl(playUrl, playFrom);
  if (!lines.length) return [];

  // 按集号挑：优先用户点的那一集，同集多线路全给
  var want2 = parseInt(episode, 10) || 1;
  var byEp = {};
  for (var k = 0; k < lines.length; k++) {
    var e = epNo(lines[k].label);
    if (!byEp[e]) byEp[e] = [];
    byEp[e].push(lines[k]);
  }
  var chosen = byEp[want2];
  if (!chosen || !chosen.length) {
    var keys = Object.keys(byEp);
    chosen = keys.length ? byEp[keys[0]] : lines;
  }

  var out = [];
  for (var m = 0; m < chosen.length; m++) {
    var ln = chosen[m];
    out.push({
      name: src.name + " · " + ln.line + " · " + ln.label,
      description: clean(target.vod_name) || title,
      url: ln.url,
      customHeaders: { "User-Agent": UA, Referer: base },
      playerType: "app",
    });
  }
  return out;
}

// 全部源一次性并发（每源最多 2 次请求），再合并去重。
// 早期版本按批 4 个串行，最坏要 20s+；一次并发最坏约 12s，常见 2~4s。
async function aggregate(title, episode) {
  var settled = await Promise.all(ADULT_SOURCES.map(function (src) {
    return queryOne(src, title, episode).catch(function () { return []; });
  }));

  var collected = [];
  var seen = {};
  for (var b = 0; b < settled.length; b++) {
    var arr = settled[b];
    for (var x = 0; x < arr.length; x++) {
      var r = arr[x];
      if (seen[r.url]) continue;
      seen[r.url] = true;
      collected.push(r);
      if (collected.length >= 40) return collected;
    }
  }
  return collected;
}

async function adultResource(params) {
  params = params || {};
  var title = txt(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);
  if (!title) return [];
  return await aggregate(title, episode);
}
