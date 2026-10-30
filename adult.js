// ============================================================================
// Rex 模块 · 成人资源（rex.mi3s.adult）
// ----------------------------------------------------------------------------
// 全部为公网可直连的苹果CMS v10 源，不依赖任何本机中转。
// 源列表 42 个：原有 12 个 + LunaTV-config 每日检测报告里 100% 可用的成人源 30 个。
//
// 能力（四合一）：
//   1) 分类浏览：对「能挖到完整分类」的 4 源（小鸡38/滴滴28/麻豆20/madouse8）
//      各建一个 video 模块，分类目录【动态】从接口 class 字段拉取，点分类拉片单。
//   2) 最新榜：上述 4 源各一个「最新更新」video 模块（ac=list 天然按时间倒序）。
//   3) 搜索：search 块接入 Rex 全局搜索开关，跨 42 源搜片名返回可播放直链。
//   4) 播放：stream 聚合播放源（loadResource），42 源分批并发解析直链。
//
// 关键说明：
//   - 分类目录来源是苹果CMS接口 ?ac=list 响应顶层的 class 字段（含 type_id/type_pid/
//     type_name，父子层级），并非首页 HTML，也非数据条目附带字段。
//   - 连不上的源：分类模块不展示（拿不到 class），但搜索/播放阶段仍参与（万一用户网络能连）。
// ============================================================================

var ADULT_SOURCES = [
  // —— 原有 12 源 ——
  { name: "辣椒资源", url: "https://apilj.com/api.php/provide/vod" },
  { name: "森林资源", url: "https://beiyong.slapibf.com/api.php/provide/vod" },
  { name: "XXAV", url: "https://xxavs.com/api.php/provide/vod" },
  { name: "番号资源", url: "http://fhapi9.com/api.php/provide/vod" },
  { name: "香奶儿资源", url: "https://www.gdlsp.com/api/json.php" },
  { name: "淫水机资源", url: "https://www.xrbsp.com/api/json.php" },
  { name: "麻豆资源", url: "https://91md.me/api.php/provide/vod", cat: "madou" },
  { name: "madouse", url: "https://madouse.la/api.php/provide/vod", cat: "madouse" },
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
  { name: "小鸡资源", url: "https://api.xiaojizy.live/provide/vod", cat: "xiaoji" },
  { name: "杏吧资源", url: "https://xingba111.com/api.php/provide/vod" },
  { name: "滴滴资源", url: "https://api.ddapi.cc/api.php/provide/vod", cat: "didi" },
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

// 能挖到完整分类的源（cat 标记），各建一个分类浏览模块
var ADULT_CAT_KEYS = ["xiaoji", "didi", "madou", "madouse"];

function sourceByCat(cat) {
  for (var i = 0; i < ADULT_SOURCES.length; i++) {
    if (ADULT_SOURCES[i].cat === cat) return ADULT_SOURCES[i];
  }
  return null;
}

WidgetMetadata = {
  id: "rex.mi3s.adult",
  title: "成人资源",
  description: "42 源聚合：分类浏览 + 最新榜 + 全局搜索 + 直链播放",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "2.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "adultCatXiaoji",
      title: "小鸡资源 · 分类",
      functionName: "catXiaoji",
      description: "小鸡资源 38 个分类（动态拉取），点分类进片单",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCatDidi",
      title: "滴滴资源 · 分类",
      functionName: "catDidi",
      description: "滴滴资源 28 个分类（动态拉取），点分类进片单",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCatMadou",
      title: "麻豆资源 · 分类",
      functionName: "catMadou",
      description: "麻豆资源 20 个分类（动态拉取），点分类进片单",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCatMadouse",
      title: "madouse · 分类",
      functionName: "catMadouse",
      description: "madouse 8 个分类（动态拉取），点分类进片单",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultNewXiaoji",
      title: "小鸡资源 · 最新",
      functionName: "newXiaoji",
      description: "小鸡资源最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNewDidi",
      title: "滴滴资源 · 最新",
      functionName: "newDidi",
      description: "滴滴资源最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNewMadou",
      title: "麻豆资源 · 最新",
      functionName: "newMadou",
      description: "麻豆资源最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNewMadouse",
      title: "madouse · 最新",
      functionName: "newMadouse",
      description: "madouse 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "loadResource",
      title: "成人资源 · 播放",
      functionName: "loadResource",
      description: "42 源分批并发聚合，输出可直接播放的 m3u8/mp4 直链",
      type: "stream",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
  ],
  // 接入 Rex 全局搜索开关
  search: {
    title: "搜成人片",
    functionName: "search",
    params: [
      {
        name: "keyword",
        title: "片名",
        type: "input",
        description: "输入片名，跨 42 源搜索",
        placeholders: [
          { title: "麻豆", value: "麻豆" },
          { title: "国产", value: "国产" },
          { title: "日本无码", value: "日本无码" },
        ],
      },
    ],
  },
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
    timeout: 5000,
  });
}

// 只认可直链播放的地址：m3u8 / mp4 / flv。
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
  if (!out.length && isPlayableUrl(pu.trim())) {
    out.push({ line: clean(froms[0]) || "直链", label: "正片", url: pu.trim() });
  }
  return out;
}

function epNo(label) {
  var m = txt(label).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// 从 vod_pic 拿到可用的海报（补全相对路径）
function picOf(it, base) {
  var p = it && it.vod_pic ? String(it.vod_pic) : "";
  if (!p) return "";
  if (/^https?:\/\//.test(p)) return p;
  // 相对路径：用接口域名前缀
  var m = base.match(/^(https?:\/\/[^\/]+)/);
  var origin = m ? m[1] : "";
  if (p.charAt(0) === "/") return origin + p;
  return origin + "/" + p;
}

// ---------------------------------------------------------------------------
// 分类目录：拉 ac=list 响应的 class 字段 → [{id, title, pid}]
// ---------------------------------------------------------------------------

async function fetchClasses(src) {
  try {
    var d = unwrap(await httpGet(buildUrl(src.url, { ac: "list", pg: 1 })));
    var cl = (d && d.class) || [];
    if (!cl.length) return [];
    var out = [];
    for (var i = 0; i < cl.length; i++) {
      var c = cl[i];
      if (!c || c.type_id == null) continue;
      out.push({
        id: String(c.type_id),
        title: clean(c.type_name) || ("分类" + c.type_id),
        pid: c.type_pid == null ? 0 : String(c.type_pid),
      });
    }
    return out;
  } catch (e) {
    return [];
  }
}

// 分类导航 → 每个顶级分类渲染成一个可点击条目，genreItems 挂该分类下的子分类。
// Rex 详情页点分类会回传 genreId；本模块据此拉 ?ac=list&t=genreId 片单。
function classesToNav(classes, srcName) {
  // 顶级（pid=0）
  var tops = classes.filter(function (c) { return c.pid === "0" || c.pid === 0; });
  // 兜底：若没有 pid 概念，全部视为顶级
  if (!tops.length) tops = classes;

  var out = [];
  for (var i = 0; i < tops.length; i++) {
    var top = tops[i];
    // 收集该顶级下的子分类
    var subs = [];
    for (var k = 0; k < classes.length; k++) {
      if (classes[k].pid === top.id) subs.push({ id: classes[k].id, title: classes[k].title });
    }
    var item = {
      id: "cat-" + srcName + "-" + top.id,
      type: "detail",
      title: top.title,
      description: subs.length ? "含 " + subs.length + " 个子分类" : srcName + "分类",
      mediaType: "tv",
      genreTitle: srcName,
    };
    if (subs.length) item.genreItems = subs;
    out.push(item);
  }
  return out;
}

// 按分类拉片单 → VideoItem[]
function listToItems(list, srcName, srcUrl, opts) {
  opts = opts || {};
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || it.vod_id == null) continue;
    var cover = picOf(it, srcUrl);
    var item = {
      id: "ad-" + srcName + "-" + it.vod_id,
      type: "detail",
      title: clean(it.vod_name) || "未命名",
      description: clean(it.vod_remarks || it.type_name || ""),
      posterPath: cover,
      coverUrl: cover,
      mediaType: "tv",
      genreTitle: clean(it.type_name) || srcName,
    };
    if (it.vod_time) item.releaseDate = String(it.vod_time);
    out.push(item);
  }
  return out;
}

// 单源列表（分类 or 最新）
async function srcList(cat, params, genreId) {
  var src = sourceByCat(cat);
  if (!src) return [];
  var query = { ac: "list" };
  if (genreId) query.t = genreId;
  query.pg = parseInt(params && params.page, 10) || 1;
  try {
    var d = unwrap(await httpGet(buildUrl(src.url, query)));
    var list = (d && d.list) || [];
    return listToItems(list, cat, src.url);
  } catch (e) {
    return [];
  }
}

// 分类模块：无 genreId → 分类导航；有 genreId → 该分类片单
async function catEntry(cat, params) {
  var src = sourceByCat(cat);
  if (!src) return [];
  // Rex 从详情页分类进入时会注入 genreId
  var genreId = params && (params.genreId || params.genre_id);
  if (genreId) {
    return await srcList(cat, params, String(genreId));
  }
  var classes = await fetchClasses(src);
  if (!classes.length) {
    // 拿不到分类目录，退回最新片单
    return await srcList(cat, params, "");
  }
  return classesToNav(classes, cat);
}

async function catXiaoji(params) { return catEntry("xiaoji", params); }
async function catDidi(params) { return catEntry("didi", params); }
async function catMadou(params) { return catEntry("madou", params); }
async function catMadouse(params) { return catEntry("madouse", params); }

// 最新榜模块
async function newEntry(cat, params) { return await srcList(cat, params, ""); }
async function newXiaoji(params) { return newEntry("xiaoji", params); }
async function newDidi(params) { return newEntry("didi", params); }
async function newMadou(params) { return newEntry("madou", params); }
async function newMadouse(params) { return newEntry("madouse", params); }

// ---------------------------------------------------------------------------
// 单源：搜索 → 详情 → 解析线路
// ---------------------------------------------------------------------------

async function queryOne(src, title, episode) {
  var base = src.url;
  var list = [];

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

// 分批并发聚合：42 个源每批 6 个，单源 5s 超时 + 快速失败。
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

// 全局搜索：跨 42 源搜片名，返回「可点击条目」（点开由 stream 聚合播放）
async function search(params) {
  params = params || {};
  var kw = txt(params.keyword || params.query || params.title);
  if (!kw) return [];

  // 对能连的源做搜索，聚合出条目（去重按 vod_name）
  var out = [];
  var seenName = {};
  var BATCH = 8;
  for (var b = 0; b < ADULT_SOURCES.length; b += BATCH) {
    var slice = ADULT_SOURCES.slice(b, b + BATCH);
    var settled = await Promise.all(slice.map(function (src) {
      return searchOne(src, kw).catch(function () { return []; });
    }));
    for (var x = 0; x < settled.length; x++) {
      var arr = settled[x];
      for (var y = 0; y < arr.length; y++) {
        var it = arr[y];
        var key = normTitle(it.title);
        if (!key || seenName[key]) continue;
        seenName[key] = true;
        out.push(it);
        if (out.length >= 40) return out;
      }
    }
  }
  return out;
}

// 单源搜索 → VideoItem[]（type:detail，点开走 stream 聚合播放）
async function searchOne(src, kw) {
  var base = src.url;
  var list = [];
  var probes = [
    buildUrl(base, { ac: "detail", wd: kw }),
    buildUrl(base, { wd: kw }),
  ];
  for (var p = 0; p < probes.length && !list.length; p++) {
    try {
      var payload = unwrap(await httpGet(probes[p]));
      var l = (payload && payload.list) || [];
      if (Array.isArray(l) && l.length) list = l;
    } catch (e) { /* 换下一种 */ }
  }
  if (!list.length) return [];

  var out = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || it.vod_id == null) continue;
    var cover = picOf(it, base);
    out.push({
      id: "ads-" + (src.cat || "x") + "-" + it.vod_id,
      type: "detail",
      title: clean(it.vod_name) || "未命名",
      description: clean(it.type_name || it.vod_remarks || src.name),
      posterPath: cover,
      coverUrl: cover,
      mediaType: "tv",
      genreTitle: src.name + (it.type_name ? " · " + clean(it.type_name) : ""),
    });
  }
  return out;
}
