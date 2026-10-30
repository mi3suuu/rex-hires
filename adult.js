// ============================================================================
// Rex 模块 · 成人资源（rex.mi3s.adult）
// ----------------------------------------------------------------------------
// 全部为公网可直连的苹果CMS v10 源，不依赖任何本机中转。
// 源列表 42 个：原有 12 个 + LunaTV-config 每日检测报告里 100% 可用的成人源 30 个。
//
// 关键修正（相对旧版）：
//   1) 原来「找到第一个源就停」→ 改成分批并发 + 全量合并
//   2) 只保留可直链播放的地址（m3u8/mp4/flv），丢弃分享页
//   3) 搜索接口 vod_play_url 为空时按 ids 拉详情回退
//   4) 42 个源分批并发（每批 6 个）+ 单源短超时（4s）+ 快速失败，
//      连不上的源不阻塞整体，能连的源正常返回
// ============================================================================

var ADULT_SOURCES = [
  // —— 原有 12 源 ——
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
  // —— LunaTV-config 新增 30 源（每日检测 100% 可用） ——
  { name: "CK资源", url: "https://ckzy.me/api.php/provide/vod" },
  { name: "AIvin", url: "http://lbapiby.com/api.php/provide/vod" },
  { name: "大奶子", url: "https://apidanaizi.com/api.php/provide/vod" },
  { name: "奥斯卡", url: "https://aosikazy.com/api.php/provide/vod" },
  { name: "幸资源", url: "https://xzybb2.com/api.php/provide/vod" },
  { name: "老色逼", url: "https://apilsbzy1.com/api.php/provide/vod" },
  { name: "色南国", url: "https://api.sexnguon.com/api.php/provide/vod" },
  { name: "155资源", url: "https://155api.com/api.php/provide/vod" },
  { name: "souavZY", url: "https://api.souavzy.vip/api.php/provide/vod" },
  { name: "丝袜资源", url: "https://siwazyw.tv/api.php/provide/vod/at/json" },
  { name: "优优资源", url: "https://www.yyzywcj.com/api.php/provide/vod" },
  { name: "最色资源", url: "https://api.zuiseapi.com/api.php/provide/vod" },
  { name: "大地资源", url: "https://dadiapi.com/feifei2" },
  { name: "奶香资源", url: "https://Naixxzy.com/api.php/provide/vod" },
  { name: "小鸡资源", url: "https://api.xiaojizy.live/provide/vod" },
  { name: "杏吧资源", url: "https://xingba111.com/api.php/provide/vod" },
  { name: "滴滴资源", url: "https://api.ddapi.cc/api.php/provide/vod" },
  { name: "玉兔资源", url: "https://apiyutu.com/api.php/provide/vod" },
  { name: "百万资源", url: "https://api.bwzyz.com/api.php/provide/vod" },
  { name: "精品资源", url: "https://www.jingpinx.com/api.php/provide/vod" },
  { name: "细胞资源", url: "https://www.xxibaozyw.com/api.php/provide/vod" },
  { name: "色猫资源", url: "https://caiji.semaozy.net/inc/apijson_vod.php/provide/vod" },
  { name: "香蕉资源", url: "https://www.xiangjiaozyw.com/api.php/provide/vod" },
  { name: "鲨鱼资源", url: "https://shayuapi.com/api.php/provide/vod" },
  { name: "黄色仓库", url: "https://hsckzy.xyz/api.php/provide/vod" },
  { name: "乐播资源", url: "https://lbapi9.com/api.php/provide/vod" },
  { name: "91精品", url: "https://91jpzyw.com/api.php/provide/vod" },
  { name: "jkun资源", url: "https://jkunzyapi.com/api.php/provide/vod" },
  { name: "豆豆资源", url: "https://api.douapi.cc/api.php/provide/vod" },
  { name: "桃花资源", url: "https://thzy1.me/api.php/provide/vod" },
];

WidgetMetadata = {
  id: "rex.mi3s.adult",
  title: "成人资源",
  description: "42 个公网直连成人 CMS 源聚合，只输出可直接播放的 m3u8/mp4 直链",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "loadResource",
      title: "成人资源 · 聚合",
      functionName: "loadResource",
      description: "并发查询 42 个源，合并全部可播放线路",
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
    timeout: 4000,
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

// 分批并发聚合：42 个源每批 6 个，单源 4s 超时 + 快速失败。
// 连不上的源不阻塞整体，能连的源正常返回。合并去重后最多 60 条线路。
async function aggregate(title, episode) {
  var collected = [];
  var seen = {};
  var BATCH = 6;

  for (var b = 0; b < ADULT_SOURCES.length; b += BATCH) {
    var slice = ADULT_SOURCES.slice(b, b + BATCH);
    var settled = await Promise.all(slice.map(function (src) {
      return queryOne(src, title, episode).catch(function () { return []; });
    }));
    for (var x = 0; x < settled.length; x++) {
      var arr = settled[x];
      for (var y = 0; y < arr.length; y++) {
        var r = arr[y];
        if (seen[r.url]) continue;
        seen[r.url] = true;
        collected.push(r);
        if (collected.length >= 60) return collected;
      }
    }
  }
  return collected;
}

async function loadResource(params) {
  params = params || {};
  var title = txt(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);
  if (!title) return [];
  return await aggregate(title, episode);
}
