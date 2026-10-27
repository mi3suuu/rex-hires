// ============================================================================
// Rex 播放源模块 · 高清片源（app.mi3s.hires）
// ----------------------------------------------------------------------------
// 【重要】这是 stream 类型模块（播放源解析器），不是 video 类型（首页列表）。
//   Rex 点进一部影片后，会调用本模块的 loadResource(seriesName, episode)，
//   由我们解析并返回真实可播放的 VideoResource[] 地址。
//
// 返回条目字段（VideoResource，与 cheyong / 4kvm-resource 一致）：
//   { name, description, url, customHeaders, playerType }
//
// loadResource(params) 的入参（Rex 运行时传入）：
//   params.seriesName / title / name —— 片名
//   params.season / episode        —— 季 / 集
//   params.id / tmdbId / imdbId / link / videoUrl —— 其它上下文
//
// 逻辑：
//   1) 片名命中「固定测试片」（杜比视界/4K、1080p 测试流）→ 直接返回真直链
//   2) 片名命中「直播」关键词（NASA 等）→ 返回直播流
//   3) 否则走苹果CMS聚合：按片名搜索 → 匹配 → 详情 → 解析 vod_play_url 真实地址
// ============================================================================

// ---------------------------------------------------------------------------
// 我的直链（可选：给某部固定影片硬指一个 remux 直链）
// 例： { title: "我的原盘", match: "某片名", url: "http://nas/movie.mkv" }
// ---------------------------------------------------------------------------
var MY_SOURCES = [
  // { title: "示例", match: "示例片名", url: "http://192.168.1.10:8080/movies/demo.mkv", note: "remux" },
];

// ---------------------------------------------------------------------------
// 一、固定测试片源：全部经 master.m3u8 实测，分辨率/码率是真值
// ---------------------------------------------------------------------------
var APPLE_STREAMS = [
  {
    match: ["杜比视界", "dolby", "dv atmos", "atmos", "4k 测试", "apple 官方测试"],
    name: "杜比视界 4K · Apple 官方测试片",
    desc: "DV 25.1 Mbps（dvh1.05.06 + ec-3 全景声）· 3840×2160",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8",
  },
  {
    match: ["hevc", "bipbop hevc"],
    name: "HEVC 1080p 阶梯 · Apple BipBop",
    desc: "HEVC 多码率阶梯 · 1920×1080 · 约 8 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_hevc/master.m3u8",
  },
  {
    match: ["fmp4"],
    name: "fMP4 分片 · Apple BipBop",
    desc: "fMP4 封装 · 1920×1080 · 约 8 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
  },
  {
    match: ["ts 分片", "mpeg-ts", "bipbop ts"],
    name: "TS 分片 · Apple BipBop",
    desc: "MPEG-TS 分片 · 1920×1080 · 约 8 Mbps",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
  },
  {
    match: ["bipbop", "经典多轨"],
    name: "BipBop 经典多轨",
    desc: "多语言音轨 + 多档清晰度 · 最高 1080p",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",
  },
];

var LAB_STREAMS = [
  {
    match: ["big buck bunny", "bbb", "大雄兔"],
    name: "Big Buck Bunny · Mux",
    desc: "5 档自适应 · 1920×1080 @ 6.2 Mbps",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    match: ["mux 演示", "mux demo"],
    name: "Mux 演示流",
    desc: "1080p @ 4.7 Mbps",
    url: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8",
  },
  {
    match: ["tears of steel", "钢铁之泪"],
    name: "Tears of Steel · Unified Streaming",
    desc: "Blender 开源电影 · 7 档 · 最高 1680×750",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  },
  {
    match: ["angel one", "shaka"],
    name: "Angel One · Shaka 多语言",
    desc: "Google Shaka 样本 · 10 档 · 验字幕音轨",
    url: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8",
  },
  {
    match: ["jw player", "jwplayer"],
    name: "JW Player 演示 · 1080p",
    desc: "1080p @ 5.2 Mbps",
    url: "https://cdn.jwplayer.com/manifests/pZxWPRg4.m3u8",
  },
];

// ---------------------------------------------------------------------------
// 直播测试流（片名命中「直播/live/nasa」时返回）
// ---------------------------------------------------------------------------
var LIVE_TEST_STREAMS = [
  {
    match: ["nasa", "直播"],
    name: "NASA TV · 公共直播",
    desc: "NASA 官方公共信号 · 最高 1280×720",
    url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
  },
  {
    match: ["akamai", "直播测试"],
    name: "Akamai 测试直播 · 1080p",
    desc: "24h 循环真直播 · 1920×1080 @ 12.9 Mbps",
    url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
  },
];

// ---------------------------------------------------------------------------
// 二、苹果CMS 采集源（36 个公网源，来自 LibreTV 预置源清单）
//     列表/搜索接口：{url}?ac=videolist&wd= 或 {url}?ac=list
//     详情接口：{url}?ac=detail&ids={vod_id} → list[0].vod_play_url
//     vod_play_url 格式："第01集$url#第02集$url$$$多源分隔"
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
// 元数据：stream 类型，只有一个 loadResource 入口
// ---------------------------------------------------------------------------
WidgetMetadata = {
  id: "app.mi3s.hires",
  title: "高清片源",
  version: "3.0.0",
  requiredVersion: "0.0.1",
  description: "高清片源解析：固定 4K/DV 测试片直链 + 苹果CMS聚合搜索解析真实播放地址 + 直播流。点进影片即出播放源。",
  author: "mi3s",
  site: "https://github.com/mi3s",
  iconurl: "",
  detailCacheDuration: 60,
  modules: [
    { id: "loadResource", title: "加载资源", functionName: "loadResource", type: "stream", cacheDuration: 0, params: [] },
  ],
};

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------
function httpGet(url, options) {
  // 优先 Widget.http.get（Rex 运行时），回退 fetch（Node 测试）
  if (typeof Widget !== "undefined" && Widget && Widget.http && Widget.http.get) {
    return Widget.http.get(url, options);
  }
  var headers = (options && options.headers) || { "User-Agent": "RexHires/3.0" };
  return fetch(url, { headers: headers }).then(function (res) {
    return { data: res, statusCode: res.status };
  });
}

function getText(url, options) {
  return httpGet(url, options).then(function (r) {
    if (r == null) return "";
    if (typeof r === "string") return r;
    if (typeof r.data === "string") return r.data;
    if (r.data && typeof r.data.text === "function") return r.data.text();
    return JSON.stringify(r.data || r);
  });
}

function getJSON(url, options) {
  return getText(url, options).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

function normTitle(s) {
  return String(s || "").toLowerCase().replace(/[\s：:·・—_\-–（）()\[\]【】,.，。'"]/g, "");
}

function matchesAny(title, keys) {
  var t = normTitle(title);
  for (var i = 0; i < keys.length; i++) {
    if (t.indexOf(normTitle(keys[i])) >= 0) return true;
  }
  return false;
}

function makeResource(name, desc, url, headers) {
  return {
    name: name,
    description: desc || "",
    url: url,
    customHeaders: headers || {},
    playerType: "app",
  };
}

// 从 vod_play_url 解析出所有播放地址（含多源、多集）
function parsePlayUrls(playUrl, episode) {
  var out = [];
  if (!playUrl) return out;
  // 多个播放源用 $$$ 分隔
  var srcs = String(playUrl).split("$$$");
  for (var i = 0; i < srcs.length; i++) {
    // 每个源内 "第01集$url#第02集$url"
    var segs = srcs[i].split("#");
    for (var j = 0; j < segs.length; j++) {
      var seg = segs[j];
      var m = seg.indexOf("$");
      if (m < 0) continue;
      var label = seg.slice(0, m).trim();
      var url = seg.slice(m + 1).trim();
      if (!url || !/^https?:\/\//i.test(url)) continue;
      var ep = parseInt((label.match(/(\d+)/) || [])[1], 10) || 0;
      out.push({ label: label, url: url, ep: ep, srcIdx: i });
    }
  }
  // 若指定了集数，优先返回那一集
  var wanted = parseInt(episode, 10) || 0;
  if (wanted > 0) {
    var matched = out.filter(function (o) { return o.ep === wanted; });
    if (matched.length) return matched;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 苹果CMS：按片名搜索 + 详情解析（一个源）
// ---------------------------------------------------------------------------
async function searchOneSource(src, title, episode) {
  var base = src.url;
  var sep = base.indexOf("?") >= 0 ? "&" : "?";
  // 先试搜索接口
  var searchUrl = base + sep + "ac=videolist&wd=" + encodeURIComponent(title);
  var payload = await getJSON(searchUrl);
  var list = (payload && payload.list) || [];
  if (!Array.isArray(list) || !list.length) {
    // 回退：不带 wd 的列表接口，本地过滤
    var listPayload = await getJSON(base + sep + "ac=list");
    list = (listPayload && listPayload.list) || [];
  }

  var target = null;
  var wantNorm = normTitle(title);
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || !it.vod_id) continue;
    var n = normTitle(it.vod_name);
    if (!wantNorm) { target = it; break; }
    if (n === wantNorm || n.indexOf(wantNorm) >= 0 || wantNorm.indexOf(n) >= 0) {
      target = it;
      break;
    }
  }
  if (!target) return [];

  // 详情拿 vod_play_url
  var detailUrl = base + sep + "ac=detail&ids=" + target.vod_id;
  var det = await getJSON(detailUrl);
  var dl = (det && det.list && det.list[0]) || {};
  var playUrl = dl.vod_play_url || target.vod_play_url || "";
  if (!playUrl) return [];

  var urls = parsePlayUrls(playUrl, episode);
  var out = [];
  var seen = {};
  for (var k = 0; k < urls.length; k++) {
    var u = urls[k];
    if (seen[u.url]) continue;
    seen[u.url] = true;
    out.push(makeResource(
      src.name + (u.label ? " · " + u.label : ""),
      target.vod_name || "",
      u.url,
      { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15", Referer: base }
    ));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 主入口：loadResource(params) → VideoResource[]
// ---------------------------------------------------------------------------
async function loadResource(params) {
  params = params || {};
  var title = String(params.seriesName || params.title || params.name || "").trim();
  var episode = params.episode;
  var results = [];

  // 1) 我的直链
  for (var i = 0; i < MY_SOURCES.length; i++) {
    var s = MY_SOURCES[i];
    if (s.match && title && !matchesAny(title, [s.match])) continue;
    results.push(makeResource(s.title || "我的直链", s.note || "", s.url, s.headers || {}));
  }

  // 2) 固定测试片（4K/DV + 1080p）
  if (title) {
    var pools = [APPLE_STREAMS, LAB_STREAMS, LIVE_TEST_STREAMS];
    for (var p = 0; p < pools.length; p++) {
      for (var q = 0; q < pools[p].length; q++) {
        var item = pools[p][q];
        if (matchesAny(title, item.match)) {
          results.push(makeResource(item.name, item.desc, item.url, {}));
        }
      }
    }
  }

  // 3) 苹果CMS 聚合搜索（多源并行，谁先有结果用谁，最多并发 6 个）
  if (!title) return results;

  var MAX_SOURCES = 8;
  var batch = CMS_SOURCES.slice(0, MAX_SOURCES);
  var settled = false;
  var errors = 0;

  await new Promise(function (resolve) {
    var pending = 0;
    var done = function () {
      if (settled) return;
      if (results.length > 0) {
        settled = true;
        resolve();
        return;
      }
      if (errors >= batch.length) { resolve(); return; }
      if (pending === 0 && errors >= batch.length) resolve();
    };
    for (var b = 0; b < batch.length; b++) {
      (function (src) {
        pending++;
        searchOneSource(src, title, episode).then(function (r) {
          if (!settled && r && r.length) {
            for (var x = 0; x < r.length; x++) results.push(r[x]);
          }
        }).catch(function (e) {
          // 忽略单源失败
        }).finally(function () {
          pending--;
          errors++;
          done();
        });
      })(batch[b]);
    }
    // 兜底：10 秒后强制结束
    setTimeout(function () { if (!settled) { settled = true; resolve(); } }, 10000);
  });

  return results;
}
