// ============================================================================
// Rex 视频源模块 · 高清无损片源（app.mi3s.hires）
// ----------------------------------------------------------------------------
// 结构对齐官方模块 assets.rexnow.tv/scripts/rex-tmdb.js：
//   WidgetMetadata = { ... }  →  每个 module.functionName 指向一个全局 async 函数
//   函数返回「条目数组」，条目字段照抄官方 demo library.json 的形状（含 videoUrl）
// 运行时提供的全局能力：Widget.http.get(url) / console.log / fetch
//
// 六个入口：
//   dv4k     —— 杜比视界 / 4K 测试片（固定直链，实测真值）
//   lab      —— 1080p 高码率测试流（固定直链，实测真值）
//   cms      —— 苹果CMS 采集源（36 个公网源，动态拉片单 → 详情 → 播放地址）
//   live     —— 直播源（iptv-org 等 GitHub 仓库 m3u，动态解析）
//   archive  —— 公共版权片库（Internet Archive 动态查询）
//   mine     —— 我的直链（自己填 remux 直链）
// ============================================================================

// ---------------------------------------------------------------------------
// 我的直链（自己往里加，改完重新导入即可）
// ---------------------------------------------------------------------------
var MY_SOURCES = [
  // { title: "示例 · 我的 NAS 上的原盘", url: "http://192.168.1.10:8080/movies/demo.mkv", note: "SMB 也能直接加库，不必走模块" },
];

// ---------------------------------------------------------------------------
// 一、固定测试片源：全部经 master.m3u8 实测，分辨率/码率是真值
// ---------------------------------------------------------------------------
var APPLE_STREAMS = [
  {
    id: "apple-dv-atmos-4k",
    title: "杜比视界 4K · Apple 官方测试片",
    desc: "一条 master 同时含 H.264 / HEVC / 杜比视界三套阶梯共 100 档。4K 档：DV 25.1 Mbps（dvh1.05.06 + ec-3 全景声）、HEVC 24.8 Mbps、H.264 10.8 Mbps。公开可用唯一真 4K + DV P5 + Atmos 流。",
    res: "3840×2160 · DV P5 · 25 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8",
    duration: 0,
  },
  {
    id: "apple-hevc-ladder",
    title: "HEVC 1080p 阶梯 · Apple BipBop",
    desc: "HEVC（hvc1）多码率阶梯，最高 1920×1080 · 约 8 Mbps。注意：这条不是 4K，网上不少清单标 4K 是错的。",
    res: "1920×1080 · 约 8 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_hevc/master.m3u8",
    duration: 0,
  },
  {
    id: "apple-fmp4-1080",
    title: "fMP4 分片 · Apple BipBop",
    desc: "fMP4 封装进阶示例，最高 1920×1080 · 约 8 Mbps。验分片封装与音轨切换。",
    res: "1920×1080 · fMP4 · 约 8 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    duration: 0,
  },
  {
    id: "apple-ts-1080",
    title: "TS 分片 · Apple BipBop",
    desc: "MPEG-TS 分片进阶示例，最高 1920×1080 · 约 8 Mbps。老链路兼容性对照。",
    res: "1920×1080 · MPEG-TS · 约 8 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
    duration: 0,
  },
  {
    id: "apple-bipbop-classic",
    title: "BipBop 经典多轨",
    desc: "最老牌的 Apple 测试流：多语言音轨 + 多档清晰度，最高 1080p 但码率仅 1 Mbps。只适合验多音轨/字幕。",
    res: "1920×1080 · 1 Mbps · 多音轨",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",
    duration: 0,
  },
];

var LAB_STREAMS = [
  {
    id: "mux-bbb-1080",
    title: "Big Buck Bunny · Mux",
    desc: "Mux 维护的 BBB 点播流，5 档自适应，最高 1920×1080 @ 6.2 Mbps。",
    res: "1920×1080 · 6.2 Mbps",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    duration: 596,
  },
  {
    id: "mux-demo-1080",
    title: "Mux 演示流",
    desc: "Mux 官方点播演示，1080p @ 4.7 Mbps。",
    res: "1920×1080 · 4.7 Mbps",
    url: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8",
    duration: 0,
  },
  {
    id: "unified-tos",
    title: "Tears of Steel · Unified Streaming",
    desc: "Blender 开源电影《Tears of Steel》完整版点播，7 档，最高 1680×750 @ 2.5 Mbps。内容 CC-BY。",
    res: "1680×750 · 2.5 Mbps",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    duration: 734,
  },
  {
    id: "shaka-angel-one",
    title: "Angel One · Shaka 多语言",
    desc: "Google Shaka 多语言样本流，10 档，验字幕与音轨切换。",
    res: "768×576 · 8 Mbps",
    url: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8",
    duration: 0,
  },
  {
    id: "jwplayer-1080",
    title: "JW Player 演示 · 1080p",
    desc: "JW Player 官方演示流，1080p @ 5.2 Mbps。",
    res: "1920×1080 · 5.2 Mbps",
    url: "https://cdn.jwplayer.com/manifests/pZxWPRg4.m3u8",
    duration: 0,
  },
  {
    id: "akamai-live-1080",
    title: "Akamai 测试直播 · 1080p",
    desc: "24 小时循环真直播流，最高 1920×1080 @ 12.9 Mbps。测断线重连、网络切换。",
    res: "1920×1080 · 12.9 Mbps · Live",
    url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    duration: 0,
  },
  {
    id: "akamai-eight-1080",
    title: "Akamai Eight 直播 · 1080p",
    desc: "Akamai 另一路直播流，1080p @ 6.7 Mbps。",
    res: "1920×1080 · 6.7 Mbps · Live",
    url: "https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8",
    duration: 0,
  },
  {
    id: "nasa-tv",
    title: "NASA TV · 公共直播",
    desc: "NASA 官方公共频道直播，最高 1280×720。合法公共信号。",
    res: "1280×720 · Live",
    url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
    duration: 0,
  },
];

// ---------------------------------------------------------------------------
// 二、苹果CMS 采集源（36 个公网源，来自 LibreTV 预置源清单）
//     接口：{url}?ac=list 或 {url} 返回片单；{url}?ac=detail&ids= 返回播放地址
// ---------------------------------------------------------------------------
var CMS_SOURCES = [
  { name: "非凡资源", url: "https://cj.ffzyapi.com/api.php/provide/vod" },
  { name: "非凡资源②", url: "https://api.ffzyapi.com/api.php/provide/vod" },
  { name: "非凡影视", url: "https://ffzy5.tv/api.php/provide/vod" },
  { name: "光速资源", url: "https://api.guangsuapi.com/api.php/provide/vod" },
  { name: "量子资源", url: "https://cj.lziapi.com/api.php/provide/vod" },
  { name: "无尽资源", url: "https://api.wujinapi.com/api.php/provide/vod" },
  { name: "巨量资源", url: "https://api.juliang.live/api/provide/vod" },
  { name: "新浪资源", url: "https://api.xinlangapi.com/xinlangapi.php/provide/vod" },
  { name: "虎牙资源", url: "https://www.huyaapi.com/api.php/provide/vod" },
  { name: "最大资源", url: "https://api.zuidapi.com/api.php/provide/vod" },
  { name: "360资源", url: "https://360zy.com/api.php/provide/vod" },
  { name: "百度资源", url: "https://api.apibdzy.com/api.php/provide/vod" },
  { name: "爱奇艺资源", url: "https://iqiyizyapi.com/api.php/provide/vod" },
  { name: "滴滴资源", url: "https://api.ddapi.cc/api.php/provide/vod" },
  { name: "无尽资源②", url: "https://api.wujinapi.me/api.php/provide/vod" },
  { name: "无尽资源③", url: "https://api.wujinapi.net/api.php/provide/vod" },
  { name: "无尽资源④", url: "https://api.wujinapi.cc/api.php/provide/vod" },
  { name: "索尼-闪电", url: "https://xsd.sdzyapi.com/api.php/provide/vod" },
  { name: "红牛资源", url: "https://www.hongniuzy3.com/api.php/provide/vod" },
  { name: "非凡资源③", url: "https://ffzy.tv/api.php/provide/vod" },
  { name: "非凡资源④", url: "https://ffzy1.tv/api.php/provide/vod" },
  { name: "暴风资源", url: "https://bf.xoxowin86cisyap.com/api.php/provide/vod" },
  { name: "bycj资源", url: "https://bycj.rytvapi.com/api.php/provide/vod" },
  { name: "大地资源", url: "https://dadiapi.com/api.php/provide/vod/at/json" },
  { name: "艾旦影视", url: "http://lovedan.net/api.php/provide/vod" },
  { name: "速播资源", url: "https://subocaiji.com/api.php/provide/vod" },
  { name: "豪华资源", url: "https://haohuazy.com/api.php/provide/vod" },
  { name: "飘零资源", url: "https://p2100.net/api.php/provide/vod" },
  { name: "U酷影视2", url: "https://api.ukuapi88.com/api.php/provide/vod" },
  { name: "如意资源", url: "https://cj.rycjapi.com/api.php/provide/vod" },
  { name: "魔都资源", url: "https://www.mdzyapi.com/api.php/provide/vod" },
  { name: "U酷影视", url: "https://api.ukuapi.com/api.php/provide/vod" },
  { name: "360资源2", url: "https://360zyzz.com/api.php/provide/vod" },
  { name: "新极品资源", url: "https://jipinvip1.com/api.php/provide/vod" },
  { name: "猫眼资源", url: "https://api.maoyanapi.top/api.php/provide/vod" },
  { name: "乐播资源", url: "https://lbapi9.com/api.php/provide/vod" },
];

// ---------------------------------------------------------------------------
// 三、直播源（m3u 订阅，来自 GitHub 公开仓库）
// ---------------------------------------------------------------------------
var LIVE_SOURCES = [
  { name: "央视·国内频道", url: "https://iptv-org.github.io/iptv/countries/cn.m3u" },
  { name: "全球电影频道", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
  { name: "全球纪录片频道", url: "https://iptv-org.github.io/iptv/categories/documentary.m3u" },
  { name: "电视直播·综合", url: "https://cdn.jsdelivr.net/gh/vbskycn/iptv@master/tv/iptv4.m3u" },
  { name: "港澳台及海外", url: "https://raw.githubusercontent.com/YueChan/Live/main/GNTV.m3u" },
];

// ---------------------------------------------------------------------------
// 四、公共版权片库（Internet Archive）
// ---------------------------------------------------------------------------
var IA_CATEGORIES = [
  { value: "classic", title: "高分长片", q: "collection:(feature_films) AND downloads:[50000 TO null]" },
  { value: "silent", title: "默片时代", q: "collection:(silent_films)" },
  { value: "noir", title: "黑色电影", q: 'subject:("film noir")' },
  { value: "scifi", title: "科幻", q: 'subject:("science fiction")' },
  { value: "cartoon", title: "经典动画", q: "collection:(animationandcartoons)" },
  { value: "prelinger", title: "纪录影像", q: "collection:(prelinger)" },
  { value: "tv", title: "老电视", q: "collection:(classic_tv)" },
];

// ---------------------------------------------------------------------------
// 元数据
// ---------------------------------------------------------------------------
WidgetMetadata = {
  id: "app.mi3s.hires",
  title: "高清无损片源",
  version: "2.0.0",
  requiredVersion: "0.0.1",
  description: "4K 杜比视界 / 1080p 高码率测试流 / 苹果CMS采集源 / 直播源 / 公共版权片库 / 我的直链。全部公网直连。",
  author: "mi3s",
  site: "https://github.com/mi3s",
  iconurl: "",
  detailCacheDuration: 360,
  modules: [
    { type: "video", id: "dv4k", title: "杜比视界 / 4K", functionName: "dv4k", cacheDuration: 86400, params: [] },
    { type: "video", id: "lab", title: "1080p 测试流", functionName: "lab", cacheDuration: 3600, params: [] },
    {
      type: "video", id: "cms", title: "采集源 · 影视", functionName: "cms", cacheDuration: 600,
      params: [
        {
          type: "enumeration", title: "源", name: "site",
          enumOptions: CMS_SOURCES.map(function (s, i) { return { value: String(i), title: s.name }; }),
        },
      ],
    },
    {
      type: "video", id: "live", title: "直播源", functionName: "live", cacheDuration: 3600,
      params: [
        {
          type: "enumeration", title: "频道组", name: "site",
          enumOptions: LIVE_SOURCES.map(function (s, i) { return { value: String(i), title: s.name }; }),
        },
      ],
    },
    {
      type: "video", id: "archive", title: "公共版权片库", functionName: "archive", cacheDuration: 21600,
      params: [
        {
          type: "enumeration", title: "分类", name: "category",
          enumOptions: IA_CATEGORIES.map(function (c) { return { value: c.value, title: c.title }; }),
        },
      ],
    },
    { type: "video", id: "mine", title: "我的直链", functionName: "mine", cacheDuration: 0, params: [] },
  ],
};

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------
function makeItem(o) {
  return {
    id: o.id,
    mediaType: "movie",
    title: o.title,
    originalTitle: o.title,
    description: o.desc || "",
    releaseDate: o.releaseDate || "",
    rating: typeof o.rating === "number" ? o.rating : 0,
    genres: o.genres || [],
    genreIds: [],
    originCountry: o.country || "",
    companyIds: [],
    networkIds: [],
    posterPath: o.poster || "",
    backdropPath: o.poster || "",
    backdropPaths: o.poster ? [o.poster] : [],
    duration: typeof o.duration === "number" ? o.duration : 0,
    videoUrl: o.url,
    people: o.people || [],
    tags: o.tags || [],
    ranks: {},
    tagline: o.note || "",
  };
}

async function httpGet(url) {
  try {
    if (typeof Widget !== "undefined" && Widget && Widget.http && Widget.http.get) {
      var r = await Widget.http.get(url);
      if (r && typeof r === "object" && r.data !== undefined) return r.data;
      return r;
    }
  } catch (e) {
    console.log("[hires] Widget.http 失败，回退 fetch:", e && e.message);
  }
  var res = await fetch(url, { headers: { "User-Agent": "RexHires/2.0" } });
  var text = await res.text();
  try { return JSON.parse(text); } catch (e2) { return text; }
}

async function httpText(url) {
  var r = await httpGet(url);
  if (typeof r === "string") return r;
  return JSON.stringify(r);
}

// ---------------------------------------------------------------------------
// 入口 1：杜比视界 / 4K
// ---------------------------------------------------------------------------
async function dv4k(params) {
  return APPLE_STREAMS.map(function (s) {
    return makeItem({
      id: s.id, title: s.title, desc: s.desc, url: s.url,
      duration: s.duration, note: s.res, genres: ["测试片源"], tags: ["uhd", "dolby-vision"],
    });
  });
}

// ---------------------------------------------------------------------------
// 入口 2：1080p 测试流
// ---------------------------------------------------------------------------
async function lab(params) {
  return LAB_STREAMS.map(function (s) {
    return makeItem({
      id: s.id, title: s.title, desc: s.desc, url: s.url,
      duration: s.duration, note: s.res, genres: ["测试片源"], tags: ["hls"],
    });
  });
}

// ---------------------------------------------------------------------------
// 入口 3：苹果CMS 采集源（动态）
// 片单接口：{url}?ac=detail 之外，默认列表接口是 {url}（带 page）
// 详情接口：{url}?ac=detail&ids={vod_id} → list[0].vod_play_url（"第01集$url#第02集$url"）
// ---------------------------------------------------------------------------
function pickFirstPlayUrl(playUrl) {
  if (!playUrl) return "";
  // 形如 "第01集$url#第02集$url$$$..."（多个播放源用 $$$ 分隔）
  var srcs = String(playUrl).split("$$$");
  for (var i = 0; i < srcs.length; i++) {
    var segs = srcs[i].split("#");
    for (var j = 0; j < segs.length; j++) {
      var m = segs[j].indexOf("$");
      if (m < 0) continue;
      var url = segs[j].slice(m + 1);
      if (url && /^https?:\/\//.test(url)) return url;
    }
  }
  return "";
}

async function cms(params) {
  var idx = parseInt(params && params.site, 10);
  if (isNaN(idx) || idx < 0 || idx >= CMS_SOURCES.length) idx = 0;
  var src = CMS_SOURCES[idx];
  var base = src.url;
  var listUrl = base;
  if (listUrl.indexOf("?") < 0) listUrl += "?ac=detail";
  // 有些源需要 ?ac=list，这里统一先试不带参数的列表（返回 list）
  var sep = base.indexOf("?") >= 0 ? "&" : "?";
  listUrl = base + sep + "ac=list";

  var items = [];
  try {
    var payload = await httpGet(listUrl);
    var list = (payload && payload.list) || [];
    // 有的源返回 {code,list:[...]}，有的返回 {list:[...]}
    if (!Array.isArray(list)) list = (payload && payload.data && payload.data.list) || [];

    var max = Math.min(list.length, 20);
    for (var i = 0; i < max; i++) {
      var it = list[i];
      if (!it || !it.vod_id) continue;
      var playUrl = it.vod_play_url;
      // 列表里通常没有播放地址，需要二次请求 detail
      var detailUrl = base + (base.indexOf("?") >= 0 ? "&" : "?") + "ac=detail&ids=" + it.vod_id;
      var play = "";
      try {
        var det = await httpGet(detailUrl);
        var dl = (det && det.list && det.list[0]) || {};
        play = dl.vod_play_url ? pickFirstPlayUrl(dl.vod_play_url) : (it.vod_play_url ? pickFirstPlayUrl(it.vod_play_url) : "");
      } catch (e2) {
        play = it.vod_play_url ? pickFirstPlayUrl(it.vod_play_url) : "";
      }
      if (!play) continue;

      items.push(makeItem({
        id: "cms-" + idx + "-" + it.vod_id,
        title: it.vod_name || ("影片 " + it.vod_id),
        desc: (it.type_name || "") + (it.vod_remarks ? " · " + it.vod_remarks : ""),
        url: play,
        poster: it.vod_pic || "",
        releaseDate: it.vod_time ? String(it.vod_time).slice(0, 10) : "",
        note: it.vod_remarks || "",
        genres: [src.name, it.type_name || "影视"],
        tags: ["cms", src.name],
      }));
    }
  } catch (e) {
    console.log("[hires] CMS 源失败:", src.name, e && e.message);
  }
  return items;
}

// ---------------------------------------------------------------------------
// 入口 4：直播源（解析 m3u）
// ---------------------------------------------------------------------------
function parseM3U(text, limit) {
  var lines = text.split(/\r?\n/);
  var items = [];
  var cur = null;
  limit = limit || 60;
  for (var i = 0; i < lines.length && items.length < limit; i++) {
    var l = lines[i].trim();
    if (!l) continue;
    if (l.indexOf("#EXTINF") === 0) {
      var name = l.split(",").slice(1).join(",").trim();
      // 取 group-title 或 tvg-name 作为补充
      cur = { name: name || "频道" };
      var grp = l.match(/group-title="([^"]*)"/);
      if (grp) cur.group = grp[1];
    } else if (l.indexOf("#") !== 0 && /^https?:\/\//.test(l)) {
      if (cur) {
        items.push({ name: cur.name, group: cur.group || "", url: l });
        cur = null;
      }
    }
  }
  return items;
}

async function live(params) {
  var idx = parseInt(params && params.site, 10);
  if (isNaN(idx) || idx < 0 || idx >= LIVE_SOURCES.length) idx = 0;
  var src = LIVE_SOURCES[idx];

  var items = [];
  try {
    var text = await httpText(src.url);
    var chans = parseM3U(text, 60);
    for (var i = 0; i < chans.length; i++) {
      var c = chans[i];
      items.push(makeItem({
        id: "live-" + idx + "-" + i,
        title: c.name,
        desc: c.group || src.name,
        url: c.url,
        genres: [c.group || "直播", src.name],
        tags: ["live", src.name],
        note: "直播",
      }));
    }
  } catch (e) {
    console.log("[hires] 直播源失败:", src.name, e && e.message);
  }
  return items;
}

// ---------------------------------------------------------------------------
// 入口 5：公共版权片库（Internet Archive）
// ---------------------------------------------------------------------------
function pickBestVideoFile(files) {
  var best = null;
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var name = String(f.name || "");
    var lower = name.toLowerCase();
    if (lower.indexOf(".mp4") < 0 && lower.indexOf(".m4v") < 0) continue;
    if (lower.indexOf("_512kb") >= 0) continue;
    var h = parseInt(f.height, 10) || 0;
    var size = parseInt(f.size, 10) || 0;
    var score = h * 1000000 + size / 1024;
    if (!best || score > best.score) best = { name: name, height: h, size: size, score: score };
  }
  return best;
}

function parseDuration(meta) {
  var raw = meta && (meta.length || meta.runtime);
  if (!raw) return 0;
  var m = String(raw).match(/(\d+):(\d+):(\d+)|(\d+):(\d+)/);
  if (m) {
    if (m[1]) return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
    return (+m[4]) * 60 + (+m[5]);
  }
  var n = parseFloat(String(raw));
  return isNaN(n) ? 0 : Math.round(n);
}

async function archive(params) {
  var wanted = (params && params.category) || "classic";
  var cat = IA_CATEGORIES[0];
  for (var i = 0; i < IA_CATEGORIES.length; i++) {
    if (IA_CATEGORIES[i].value === wanted) cat = IA_CATEGORIES[i];
  }

  var search =
    "https://archive.org/advancedsearch.php?q=" +
    encodeURIComponent(cat.q + " AND mediatype:movies") +
    "&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description" +
    "&fl%5B%5D=downloads&sort%5B%5D=downloads+desc&rows=16&page=1&output=json";

  var payload = await httpGet(search);
  var docs = (payload && payload.response && payload.response.docs) || [];
  if (!docs.length) { console.log("[hires] IA 无结果:", cat.q); return []; }

  var picked = [];
  for (var j = 0; j < docs.length && picked.length < 10; j++) {
    var doc = docs[j];
    if (!doc.identifier) continue;
    try {
      var meta = await httpGet("https://archive.org/metadata/" + doc.identifier);
      if (!meta || !meta.files) continue;
      var best = pickBestVideoFile(meta.files);
      if (!best) continue;
      var md = meta.metadata || {};
      picked.push({ doc: doc, md: md, file: best, height: best.height, size: best.size });
    } catch (e) {
      console.log("[hires] metadata 失败:", doc.identifier, e && e.message);
    }
  }

  picked.sort(function (a, b) {
    if (b.height !== a.height) return b.height - a.height;
    return b.size - a.size;
  });

  var items = [];
  for (var k = 0; k < picked.length && items.length < 8; k++) {
    var p = picked[k];
    var d2 = p.doc;
    items.push(makeItem({
      id: "ia-" + d2.identifier,
      title: d2.title || p.md.title || d2.identifier,
      desc: (d2.description || p.md.description || "").toString().slice(0, 260),
      url: "https://archive.org/download/" + d2.identifier + "/" + encodeURIComponent(p.file.name).replace(/%2F/g, "/"),
      poster: "https://archive.org/services/img/" + d2.identifier,
      duration: parseDuration(p.md),
      releaseDate: d2.year ? String(d2.year) : "",
      note: (p.height ? p.height + "p · " : "") + Math.round(p.size / 1048576) + " MB",
      genres: [cat.title],
      country: p.md.country || "",
      tags: ["archive.org", "public-domain"],
    }));
  }
  return items;
}

// ---------------------------------------------------------------------------
// 入口 6：我的直链
// ---------------------------------------------------------------------------
async function mine(params) {
  return (MY_SOURCES || []).map(function (s, i) {
    return makeItem({
      id: "mine-" + i,
      title: s.title || ("我的直链 " + (i + 1)),
      desc: s.note || "",
      url: s.url,
      poster: s.poster || "",
      genres: ["我的库"],
      tags: ["custom"],
    });
  });
}
