// ============================================================================
// Rex 播放源模块 · 高清片源（app.mi3s.hires）
// ----------------------------------------------------------------------------
// 严格对齐成品 stream 模块（cheyong / 4kvm / maccms）的写法：
//   - 只用 Widget.http.get（Rex 运行时提供），绝不用 fetch / setTimeout / .finally
//   - 超时用 Widget.http 的 timeout 选项，或 Date.now() + deadline
//   - 并发用 Promise.all
//   - loadResource(params) 返回 VideoResource[]：{name, description, url, customHeaders, playerType}
//
// 逻辑：
//   1) 片名命中固定测试片（4K/DV + 1080p + 直播）→ 直接返回真直链
//   2) 否则走苹果CMS聚合：?ac=detail&wd=片名 搜索 → 详情 → 解析 vod_play_url
// ============================================================================

// 我的直链（可选：给某部影片硬指一个 remux 直链）
var MY_SOURCES = [
  // { title: "示例", match: "示例片名", url: "http://192.168.1.10/movie.mkv", note: "remux" },
];

// 固定测试片源（4K/DV）
var APPLE_STREAMS = [
  { match: ["杜比视界", "dolby", "dv atmos", "atmos", "4k 测试", "apple 官方测试"], name: "杜比视界 4K · Apple 官方测试片", desc: "DV 25.1 Mbps · 3840×2160 · ec-3 全景声", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8" },
  { match: ["hevc", "bipbop hevc"], name: "HEVC 1080p 阶梯 · Apple BipBop", desc: "HEVC 多码率 · 1920×1080 · 约 8 Mbps", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_hevc/master.m3u8" },
  { match: ["fmp4"], name: "fMP4 分片 · Apple BipBop", desc: "fMP4 封装 · 1920×1080", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8" },
  { match: ["ts 分片", "mpeg-ts", "bipbop ts"], name: "TS 分片 · Apple BipBop", desc: "MPEG-TS 分片 · 1920×1080", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8" },
  { match: ["bipbop", "经典多轨"], name: "BipBop 经典多轨", desc: "多语言音轨 · 最高 1080p", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8" },
];

// 固定测试片源（1080p）
var LAB_STREAMS = [
  { match: ["big buck bunny", "bbb", "大雄兔"], name: "Big Buck Bunny · Mux", desc: "5 档自适应 · 1920×1080 @ 6.2 Mbps", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
  { match: ["mux 演示", "mux demo"], name: "Mux 演示流", desc: "1080p @ 4.7 Mbps", url: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8" },
  { match: ["tears of steel", "钢铁之泪"], name: "Tears of Steel · Unified Streaming", desc: "Blender 开源电影 · 7 档", url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8" },
  { match: ["angel one", "shaka"], name: "Angel One · Shaka 多语言", desc: "Google Shaka 样本 · 10 档", url: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8" },
  { match: ["jw player", "jwplayer"], name: "JW Player 演示 · 1080p", desc: "1080p @ 5.2 Mbps", url: "https://cdn.jwplayer.com/manifests/pZxWPRg4.m3u8" },
];

// 直播测试流
var LIVE_TEST_STREAMS = [
  { match: ["nasa", "直播"], name: "NASA TV · 公共直播", desc: "NASA 官方信号 · 最高 1280×720", url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8" },
  { match: ["akamai", "直播测试"], name: "Akamai 测试直播 · 1080p", desc: "24h 循环 · 1920×1080 @ 12.9 Mbps", url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8" },
];

// 苹果CMS 采集源（36 个公网源）
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
// 元数据（stream 类型，单 loadResource 入口，字段对齐 cheyong）
// ---------------------------------------------------------------------------
WidgetMetadata = {
  id: "app.mi3s.hires",
  title: "高清片源",
  description: "高清片源解析：固定 4K/DV 测试片直链 + 苹果CMS聚合搜索解析真实播放地址 + 直播流",
  author: "mi3s",
  site: "https://github.com/mi3s",
  version: "3.1.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "loadResource",
      title: "高清片源 · 聚合",
      functionName: "loadResource",
      description: "测试片直链 + 苹果CMS多源聚合解析",
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
function dsText(value) { return value == null ? "" : String(value).trim(); }

function clean(value) {
  return dsText(value).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
}

function normTitle(s) {
  return String(s || "").toLowerCase().replace(/[\s：:·・—_\-–（）()\[\]【】,.，。'"\u200b\u200c\u200d\ufeff]/g, "");
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

// unwrap：解析 Widget.http 返回（data 可能是字符串或对象），对齐 maccms
function unwrap(response) {
  if (!response) return null;
  var data = response.data !== undefined ? response.data : response;
  if (typeof data === "string") {
    var text = data.trim();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return null; }
  }
  return data || null;
}

// 手动拼查询串（不依赖宿主对 options.params 的支持），对齐 maccms
function buildUrl(base, query) {
  var pairs = [];
  for (var key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) continue;
    var value = query[key];
    if (value === undefined || value === null || value === "") continue;
    pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
  }
  if (!pairs.length) return base;
  return base + (base.indexOf("?") >= 0 ? "&" : "?") + pairs.join("&");
}

var DEFAULT_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

// 网络请求：只用 Widget.http.get（Rex 运行时提供），带 timeout 选项
async function httpGet(url, headers) {
  var response = await Widget.http.get(url, {
    headers: headers || { "User-Agent": DEFAULT_UA },
    timeout: 10000,
  });
  return response;
}

// ---------------------------------------------------------------------------
// 苹果CMS：单源搜索 + 详情解析
// 搜索接口：?ac=detail&wd=片名&pg=页（对齐 maccms 的 fetchPage）
// 详情接口：?ac=detail&ids=vod_id → list[0].vod_play_url / vod_play_from
// ---------------------------------------------------------------------------
function collectLines(item) {
  var playUrl = String(item.vod_play_url || "").replace(/#+$/, "");
  if (!playUrl) return [];
  var froms = String(item.vod_play_from || "").split("$$$");
  var blocks = playUrl.split("$$$");
  var lines = [];
  for (var i = 0; i < blocks.length; i++) {
    var sourceName = clean(froms[i]) || "线路" + (i + 1);
    var chunks = blocks[i].split("#");
    for (var j = 0; j < chunks.length; j++) {
      var parts = chunks[j].split("$");
      if (parts.length < 2) continue;
      var label = clean(parts[0]);
      var url = clean(parts.slice(1).join("$"));
      if (!url || !/^https?:\/\//i.test(url)) continue;
      lines.push({ sourceName: sourceName, label: label, url: url });
    }
  }
  return lines;
}

function parseEpisode(rawName) {
  var m = dsText(rawName).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function searchOneSource(src, title, episode) {
  var base = src.url;
  var list = [];
  // 搜索接口（最多 3 页）
  for (var page = 1; page <= 3; page++) {
    var searchUrl = buildUrl(base, { ac: "detail", wd: title, pg: page });
    var payload;
    try {
      var resp = await httpGet(searchUrl);
      payload = unwrap(resp);
    } catch (e) {
      return [];
    }
    var pageList = (payload && payload.list) || [];
    if (!Array.isArray(pageList) || !pageList.length) break;
    list = list.concat(pageList);
    if (pageList.length < 20) break; // 一页不足 20 条，说明到尾页
  }

  if (!list.length) return [];

  // 片名匹配
  var wantNorm = normTitle(title);
  var target = null;
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

  // 详情拿 vod_play_url（列表里通常已带，但保险起见再拉一次 detail）
  var playUrl = target.vod_play_url;
  var playFrom = target.vod_play_from;
  if (!playUrl) {
    try {
      var detailUrl = buildUrl(base, { ac: "detail", ids: target.vod_id });
      var detResp = await httpGet(detailUrl);
      var det = unwrap(detResp);
      var dl = (det && det.list && det.list[0]) || {};
      playUrl = dl.vod_play_url || "";
      playFrom = dl.vod_play_from || "";
    } catch (e) {
      return [];
    }
  }
  if (!playUrl) return [];

  // 解析线路
  var item = { vod_play_url: playUrl, vod_play_from: playFrom };
  var lines = collectLines(item);

  // 按集数过滤：只保留用户点的那一集（episode），对齐 cheyong/maccms 的做法
  var wantedEp = parseInt(episode, 10) || 1;
  var byEp = {};
  for (var k = 0; k < lines.length; k++) {
    var l = lines[k];
    var ep = parseEpisode(l.label);
    if (!byEp[ep]) byEp[ep] = [];
    byEp[ep].push(l);
  }
  var chosen = byEp[wantedEp];
  if (!chosen || !chosen.length) {
    // 集号对不上时兜底：返回第一集
    var firstKey = Object.keys(byEp)[0];
    chosen = byEp[firstKey] || lines;
  }

  var out = [];
  var seen = {};
  for (var m = 0; m < chosen.length; m++) {
    var line = chosen[m];
    if (seen[line.url]) continue;
    seen[line.url] = true;
    out.push(makeResource(
      src.name + " · " + line.sourceName + " · " + line.label,
      target.vod_name || title,
      line.url,
      { "User-Agent": DEFAULT_UA, Referer: base }
    ));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 主入口：loadResource(params) → VideoResource[]
// ---------------------------------------------------------------------------
async function loadResource(params) {
  params = params || {};
  var title = dsText(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);
  var results = [];

  // 1) 我的直链
  for (var i = 0; i < MY_SOURCES.length; i++) {
    var s = MY_SOURCES[i];
    if (s.match && title && !matchesAny(title, [s.match])) continue;
    results.push(makeResource(s.title || "我的直链", s.note || "", s.url, s.headers || {}));
  }

  // 2) 固定测试片（4K/DV + 1080p + 直播）
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

  // 3) 苹果CMS 聚合搜索（并行，谁先有结果用谁）
  if (title) {
    var MAX_SOURCES = 8;
    var batch = CMS_SOURCES.slice(0, MAX_SOURCES);
    var settled = results.length > 0;
    // 逐个串行尝试，找到结果就停（避免过多并发拖慢）
    for (var b = 0; b < batch.length && !settled; b++) {
      try {
        var r = await searchOneSource(batch[b], title, episode);
        if (r && r.length) {
          for (var x = 0; x < r.length; x++) results.push(r[x]);
          settled = true;
        }
      } catch (e) {
        // 单源失败忽略，继续下一个
      }
    }
  }

  return results;
}
