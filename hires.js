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

// 苹果CMS 采集源（28 个，全部经逐源探测可用，含成人源）
// 注：新浪/无尽②③④/索尼-闪电 因搜索接口失效或"暂不支持搜索"已移除
var CMS_SOURCES = [
  { name: "非凡资源", url: "https://cj.ffzyapi.com/api.php/provide/vod" },
  { name: "非凡资源②", url: "https://api.ffzyapi.com/api.php/provide/vod" },
  { name: "非凡影视", url: "https://ffzy5.tv/api.php/provide/vod" },
  { name: "光速资源", url: "https://api.guangsuapi.com/api.php/provide/vod" },
  { name: "量子资源", url: "https://cj.lziapi.com/api.php/provide/vod" },
  { name: "无尽资源", url: "https://api.wujinapi.com/api.php/provide/vod" },
  { name: "巨量资源", url: "https://api.juliang.live/api/provide/vod" },
  { name: "虎牙资源", url: "https://www.huyaapi.com/api.php/provide/vod" },
  { name: "最大资源", url: "https://api.zuidapi.com/api.php/provide/vod" },
  { name: "360资源", url: "https://360zy.com/api.php/provide/vod" },
  { name: "百度资源", url: "https://api.apibdzy.com/api.php/provide/vod" },
  { name: "爱奇艺资源", url: "https://iqiyizyapi.com/api.php/provide/vod" },
  { name: "滴滴资源", url: "https://api.ddapi.cc/api.php/provide/vod" },
  { name: "红牛资源", url: "https://www.hongniuzy3.com/api.php/provide/vod" },
  { name: "非凡资源③", url: "https://ffzy.tv/api.php/provide/vod" },
  { name: "暴风资源", url: "https://bf.xoxowin86cisyap.com/api.php/provide/vod" },
  { name: "bycj资源", url: "https://bycj.rytvapi.com/api.php/provide/vod" },
  { name: "大地资源", url: "https://dadiapi.com/api.php/provide/vod/at/json" },
  { name: "森林资源", url: "https://beiyong.slapibf.com/api.php/provide/vod" },
  { name: "乐播资源", url: "https://lbapi9.com/api.php/provide/vod" },
  { name: "辣椒资源", url: "https://apilj.com/api.php/provide/vod" },
  { name: "麻豆资源", url: "https://91md.me/api.php/provide/vod" },
  { name: "madouse", url: "https://madouse.la/api.php/provide/vod" },
  // 以下为 api/json.php 接口的成人源（vod_play_url 是裸 m3u8 直链）
  { name: "白嫖资源", url: "https://www.kxgav.com/api/json.php" },
  { name: "美少女资源", url: "https://www.msnii.com/api/json.php" },
  { name: "香奶儿资源", url: "https://www.gdlsp.com/api/json.php" },
  { name: "淫水机资源", url: "https://www.xrbsp.com/api/json.php" },
  { name: "黄AV资源", url: "https://www.pgxdy.com/api/json.php" },
];

// 直播源（6 个 m3u 订阅，全部经探测可用）
var LIVE_SOURCES = [
  { name: "央视·国内", url: "https://iptv-org.github.io/iptv/countries/cn.m3u" },
  { name: "中文频道", url: "https://iptv-org.github.io/iptv/languages/zho.m3u" },
  { name: "电视直播·综合", url: "https://cdn.jsdelivr.net/gh/vbskycn/iptv@master/tv/iptv4.m3u" },
  { name: "港澳台及海外", url: "https://raw.githubusercontent.com/YueChan/Live/main/GNTV.m3u" },
  { name: "全球电影", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
  { name: "全球纪录片", url: "https://iptv-org.github.io/iptv/categories/documentary.m3u" },
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
  version: "3.2.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "loadResource",
      title: "高清片源 · 聚合",
      functionName: "loadResource",
      description: "28 个 CMS 源 + 6 个直播源 + 测试片直链，多源聚合解析",
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

// getText：取纯文本（用于 m3u 直播源等非 JSON 内容）
function getText(response) {
  if (!response) return "";
  var data = response.data !== undefined ? response.data : response;
  if (typeof data === "string") return data;
  if (data == null) return "";
  try { return JSON.stringify(data); } catch (e) { return String(data); }
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
  // 兜底：有些源（如 api/json.php 成人源）的 vod_play_url 本身就是裸直链，
  // 没有「第01集$url」这种分隔结构，直接当作单条线路返回。
  if (!lines.length && /^https?:\/\//i.test(playUrl.trim())) {
    lines.push({ sourceName: clean(froms[0]) || "直链", label: "正片", url: playUrl.trim() });
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
  // 搜索接口（最多 3 页）：不同源的搜索参数不同，先 ac=detail&wd=，再回退 ac=videolist&wd=
  var searchModes = [
    { ac: "detail", wd: title },
    { ac: "videolist", wd: title },
  ];
  for (var mi = 0; mi < searchModes.length && !list.length; mi++) {
    var mode = searchModes[mi];
    for (var page = 1; page <= 3; page++) {
      var searchUrl = buildUrl(base, { ac: mode.ac, wd: mode.wd, pg: page });
      var payload;
      try {
        var resp = await httpGet(searchUrl);
        payload = unwrap(resp);
      } catch (e) {
        break;
      }
      var pageList = (payload && payload.list) || [];
      if (!Array.isArray(pageList) || !pageList.length) break;
      list = list.concat(pageList);
      if (pageList.length < 20) break; // 一页不足 20 条，说明到尾页
    }
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
// 直播源：解析 m3u 订阅，按频道名匹配
// ---------------------------------------------------------------------------
function parseM3U(text, limit) {
  var lines = text.split(/\r?\n/);
  var items = [];
  var cur = null;
  limit = limit || 100;
  for (var i = 0; i < lines.length && items.length < limit; i++) {
    var l = lines[i].trim();
    if (!l) continue;
    if (l.indexOf("#EXTINF") === 0) {
      var name = l.split(",").slice(1).join(",").trim();
      cur = { name: name || "频道", group: "" };
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

async function searchLive(title) {
  var out = [];
  var wantNorm = normTitle(title);
  // 拆分匹配 token：英文按非字母数字切，中文提取常见关键词
  var tokens = [];
  var asciiTokens = wantNorm.match(/[a-z0-9]+/g) || [];
  for (var t = 0; t < asciiTokens.length; t++) {
    if (asciiTokens[t].length >= 2) tokens.push(asciiTokens[t]);
  }
  // 常见中文频道关键词
  var zhKw = ["综合", "新闻", "体育", "电影", "纪录", "少儿", "财经", "音乐", "戏曲", "农业", "军事", "国际", "卫视", "综艺"];
  for (var z = 0; z < zhKw.length; z++) {
    if (wantNorm.indexOf(zhKw[z]) >= 0) tokens.push(zhKw[z]);
  }
  if (!tokens.length) tokens.push(wantNorm);

  for (var i = 0; i < LIVE_SOURCES.length; i++) {
    var src = LIVE_SOURCES[i];
    try {
      var resp = await httpGet(src.url);
      var text = getText(resp);
      if (!text || text.indexOf("#EXTM3U") < 0 && text.indexOf("#EXTINF") < 0) continue;
      var chans = parseM3U(text, 300);
      for (var j = 0; j < chans.length; j++) {
        var c = chans[j];
        var cn = normTitle(c.name);
        var hit = false;
        for (var k = 0; k < tokens.length; k++) {
          if (cn.indexOf(tokens[k]) >= 0) { hit = true; break; }
        }
        if (hit) {
          out.push(makeResource(src.name + " · " + c.name, c.group || "直播", c.url, {}));
          if (out.length >= 20) break;
        }
      }
    } catch (e) {
      // 单源失败忽略
    }
    if (out.length >= 20) break;
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

  // 3) 直播源 m3u 订阅解析（片名含直播/频道/电视台等关键词）
  if (title && matchesAny(title, ["直播", "频道", "电视台", "cctv", "卫视", "新闻"])) {
    try {
      var liveRes = await searchLive(title);
      for (var lv = 0; lv < liveRes.length; lv++) results.push(liveRes[lv]);
    } catch (e) {
      // 直播解析失败忽略
    }
  }

  // 4) 苹果CMS 聚合搜索（串行尝试全部源，找到结果就停）
  if (title) {
    var settled = results.length > 0;
    for (var b = 0; b < CMS_SOURCES.length && !settled; b++) {
      try {
        var r = await searchOneSource(CMS_SOURCES[b], title, episode);
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
