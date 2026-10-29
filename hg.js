// ============================================================================
// Rex 模块 · 红果短剧（rex.mi3s.hongguo）
// ----------------------------------------------------------------------------
// 直连官网 SSR，不依赖任何本机中转。
//   分类页  https://hongguoduanju.com/category/{slug}?page=N  → recommendList + total
//   播放页  https://hongguoduanju.com/player/{series_id}      → vid_list
//   取流    https://hongguoduanju.com/video/public/{vid}/360p.mp4
//
// 官网搜索页已被反爬拦截（返回 JS 挑战页，无 searchList），
// 所以「按片名找剧」走分类全量扫描 + 本地缓存索引。
// ============================================================================

var HG_BASE = "https://hongguoduanju.com";
var HG_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

// 片库三档（官网一级分类）
var HG_CATS = [
  { key: "real", slug: "real-drama", name: "短剧" },
  { key: "comic", slug: "comic-drama", name: "漫剧" },
  { key: "ai", slug: "ai-drama", name: "AI短剧" },
];

// 二级题材（官网 /category/{slug}/{sub}）
var HG_GENRES = {
  real: [
    ["romance", "爱情"], ["period", "年代"], ["comeback", "逆袭"], ["legend", "传奇"],
    ["growth", "成长"], ["family", "家庭"], ["clan", "家族"], ["cute-kids", "萌宝"],
    ["suspense", "悬疑"], ["thriller", "惊悚"], ["horror", "恐怖"], ["supernatural", "志怪"],
    ["costume", "古装"], ["fantasy", "玄幻"], ["wonder", "奇幻"], ["urban", "都市"],
    ["youth", "青春"], ["comedy", "喜剧"], ["sci-fi", "科幻"], ["disaster", "灾难"],
    ["action-adventure", "动作冒险"], ["war", "战争"], ["variety", "综艺"], ["drama", "剧情"],
  ],
  comic: [
    ["adventure", "冒险"], ["apocalypse", "末世"], ["creative", "脑洞"], ["drama", "剧情"],
    ["fantasy", "玄幻"], ["sci-fi", "科幻"], ["wealthy-family", "豪门"], ["wonder", "奇幻"],
  ],
  ai: [
    ["adventure", "冒险"], ["apocalypse", "末世"], ["creative", "脑洞"], ["drama", "剧情"],
    ["fantasy", "玄幻"], ["sci-fi", "科幻"], ["wealthy-family", "豪门"], ["wonder", "奇幻"],
  ],
};

WidgetMetadata = {
  id: "rex.mi3s.hongguo",
  title: "红果短剧",
  description: "红果短剧官网直连：短剧 / 漫剧 / AI 短剧 全库分类 + 360p 直链播放",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "hgReal",
      title: "红果 · 短剧",
      functionName: "hgReal",
      description: "官网短剧全库（约 800 部），按题材筛选",
      type: "video",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "genre", label: "题材", type: "enum", default: "", options: [["", "全部"]].concat(HG_GENRES.real) },
        { name: "page", label: "页码", type: "page", default: "1" },
      ],
    },
    {
      id: "hgComic",
      title: "红果 · 漫剧",
      functionName: "hgComic",
      description: "官网漫剧全库",
      type: "video",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "genre", label: "题材", type: "enum", default: "", options: [["", "全部"]].concat(HG_GENRES.comic) },
        { name: "page", label: "页码", type: "page", default: "1" },
      ],
    },
    {
      id: "hgAi",
      title: "红果 · AI短剧",
      functionName: "hgAi",
      description: "官网 AI 短剧全库",
      type: "video",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "genre", label: "题材", type: "enum", default: "", options: [["", "全部"]].concat(HG_GENRES.ai) },
        { name: "page", label: "页码", type: "page", default: "1" },
      ],
    },
    {
      id: "hgResource",
      title: "红果短剧 · 播放源",
      functionName: "hgResource",
      description: "按片名在红果全库定位剧集，输出 360p mp4 直链",
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

function getBody(resp) {
  if (!resp) return "";
  var d = resp.data !== undefined ? resp.data : resp;
  if (typeof d === "string") return d;
  if (d == null) return "";
  try { return JSON.stringify(d); } catch (e) { return String(d); }
}

async function fetchText(url) {
  var resp = await Widget.http.get(url, {
    headers: { "User-Agent": HG_UA, "Accept-Language": "zh-CN,zh;q=0.9" },
    timeout: 15000,
  });
  return getBody(resp);
}

// 从 SSR HTML 中捞出 `"key":[...]`，按括号深度配平（简介里可能含 [] ）
function extractJsonArray(html, key) {
  var marker = '"' + key + '":[';
  var i = html.indexOf(marker);
  if (i < 0) return null;
  var start = i + marker.length - 1;
  var depth = 0, inStr = false, esc = false;
  for (var j = start; j < html.length; j++) {
    var ch = html.charAt(j);
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') {
      inStr = true;
    } else if (ch === "[") {
      depth += 1;
    } else if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        try { return JSON.parse(html.slice(start, j + 1)); } catch (e) { return null; }
      }
    }
  }
  return null;
}

function extractInt(html, key) {
  var m = html.match(new RegExp('"' + key + '"\\s*:\\s*(\\d+)'));
  return m ? parseInt(m[1], 10) : 0;
}

function extractStr(html, key) {
  var m = html.match(new RegExp('"' + key + '"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"'));
  if (!m) return "";
  try { return JSON.parse('"' + m[1] + '"').trim(); } catch (e) { return m[1].trim(); }
}

// ---------------------------------------------------------------------------
// 官网取数
// ---------------------------------------------------------------------------

// 分类页 → [{ id, title, cover, intro, episodeCnt, remarks, tags }]
async function hgCategory(slug, page, sub) {
  var subPath = sub ? "/" + sub : "";
  var url = HG_BASE + "/category/" + slug + subPath + "?page=" + (page || 1);
  var html = await fetchText(url);
  var raw = extractJsonArray(html, "recommendList") || [];
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var d = raw[i];
    if (!d || !d.series_id) continue;
    var tags = [];
    if (d.tags && d.tags.length) {
      for (var t = 0; t < d.tags.length; t++) tags.push(txt(d.tags[t]));
    }
    out.push({
      id: String(d.series_id),
      title: txt(d.series_name),
      cover: txt(d.series_cover),
      intro: txt(d.series_intro),
      episodeCnt: d.episode_cnt || 0,
      remarks: txt(d.episode_right_text),
      tags: tags,
    });
  }
  return { items: out, total: extractInt(html, "total") || out.length };
}

// 播放页 → { episodes:[vid], title, cover, intro, tags }
async function hgPlayer(seriesId) {
  var html = await fetchText(HG_BASE + "/player/" + seriesId);
  var vids = extractJsonArray(html, "vid_list") || [];
  var eps = [];
  for (var i = 0; i < vids.length; i++) {
    if (vids[i]) eps.push(String(vids[i]));
  }
  var title = extractStr(html, "series_name");
  if (!title) {
    var tm = html.match(/<title[^>]*>([^<]{1,120})<\/title>/);
    if (tm) title = txt(tm[1]).split(/\s*[第|｜]/)[0];
  }
  return {
    episodes: eps,
    title: title,
    cover: extractStr(html, "series_cover"),
    intro: extractStr(html, "series_intro"),
  };
}

function hgMp4(vid) {
  return HG_BASE + "/video/public/" + vid + "/360p.mp4";
}

// ---------------------------------------------------------------------------
// 分类入口 → VideoItem[]
// ---------------------------------------------------------------------------

function toVideoItem(it, catName) {
  var item = {
    id: "hg-" + it.id,
    // detail：Rex 会打开详情页，再由 hgResource（stream）按片名定位并提供 mp4 直链
    type: "detail",
    title: it.title,
    description: it.intro || ("红果 · " + catName),
    posterPath: it.cover,
    coverUrl: it.cover,
    backdropPath: it.cover,
    mediaType: "tv",
    genreTitle: catName + (it.tags.length ? " · " + it.tags.slice(0, 3).join("/") : ""),
    link: HG_BASE + "/player/" + it.id,
  };
  // 附带自有字段，供播放阶段使用
  item.seriesId = it.id;
  item.episodeCount = it.episodeCnt;
  item.remarks = it.remarks || (it.episodeCnt ? "共" + it.episodeCnt + "集" : "");
  item.source = "红果" + catName;
  return item;
}

async function runCategory(key, params) {
  params = params || {};
  var cat = null;
  for (var i = 0; i < HG_CATS.length; i++) {
    if (HG_CATS[i].key === key) cat = HG_CATS[i];
  }
  if (!cat) return [];
  var page = parseInt(params.page, 10) || 1;
  var genre = txt(params.genre);
  var res = await hgCategory(cat.slug, page, genre);
  var out = [];
  for (var j = 0; j < res.items.length; j++) out.push(toVideoItem(res.items[j], cat.name));
  return out;
}

async function hgReal(params) { return runCategory("real", params); }
async function hgComic(params) { return runCategory("comic", params); }
async function hgAi(params) { return runCategory("ai", params); }

// ---------------------------------------------------------------------------
// 播放源：按片名在红果全库定位
// ---------------------------------------------------------------------------

function normTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\s：:·・—_\-–（）()\[\]【】,.，。'"“”\u200b\u200c\u200d\ufeff]/g, "");
}

// 全库扫描索引：title(normalized) -> seriesId。存在 Widget.storage 里，24h 复用。
var HG_INDEX_KEY = "hg-index-v1";
var HG_INDEX_TTL = 24 * 3600 * 1000;

async function loadIndex() {
  try {
    var raw = await Widget.storage.get(HG_INDEX_KEY);
    if (raw) {
      var obj = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (obj && obj.at && Date.now() - obj.at < HG_INDEX_TTL && obj.map) return obj;
    }
  } catch (e) { /* 忽略 */ }
  return null;
}

async function saveIndex(map) {
  try {
    await Widget.storage.set(HG_INDEX_KEY, JSON.stringify({ at: Date.now(), map: map }));
  } catch (e) { /* 忽略 */ }
}

// 扫描三档片库，边扫边找：命中即返回，扫完没命中才建索引
async function scanForTitle(title) {
  var want = normTitle(title);
  if (!want) return null;

  var cached = await loadIndex();
  if (cached && cached.map && cached.map[want]) {
    return { seriesId: cached.map[want].id, name: cached.map[want].name, from: "index" };
  }

  var map = (cached && cached.map) ? cached.map : {};
  var found = null;
  var deadline = Date.now() + 22000;

  for (var c = 0; c < HG_CATS.length && !found; c++) {
    var slug = HG_CATS[c].slug;
    var page = 1;
    var maxPage = 40;
    while (page <= maxPage && !found && Date.now() < deadline) {
      var batch = [];
      for (var b = 0; b < 6 && page + b <= maxPage; b++) batch.push(page + b);
      var results = await Promise.all(batch.map(function (p) {
        return hgCategory(slug, p, "").catch(function () { return null; });
      }));
      for (var r = 0; r < results.length; r++) {
        var res = results[r];
        if (!res || !res.items.length) { maxPage = 0; break; }
        for (var k = 0; k < res.items.length; k++) {
          var it = res.items[k];
          var n = normTitle(it.title);
          if (!n) continue;
          if (!map[n]) map[n] = { id: it.id, name: it.title };
          if (n === want || n.indexOf(want) >= 0 || want.indexOf(n) >= 0) {
            found = { seriesId: it.id, name: it.title, from: "scan" };
            break;
          }
        }
        if (found) break;
      }
      page += 6;
    }
  }

  if (found) {
    saveIndex(map);
    return found;
  }
  // 没命中但扫到了东西，也把索引存下来，下次更快
  if (Object.keys(map).length) saveIndex(map);
  return null;
}

async function hgResource(params) {
  params = params || {};
  var title = txt(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);
  if (!title) return [];

  var hit = await scanForTitle(title);
  if (!hit) return [];

  var play = await hgPlayer(hit.seriesId);
  if (!play.episodes.length) return [];

  var want = parseInt(episode, 10) || 1;
  var idx = want - 1;
  if (idx < 0 || idx >= play.episodes.length) idx = 0;

  var out = [];
  var seen = {};
  // 目标集优先，随后给出前后几集备选
  var order = [idx];
  for (var d = 1; d <= 3; d++) {
    if (idx - d >= 0) order.push(idx - d);
    if (idx + d < play.episodes.length) order.push(idx + d);
  }
  for (var i = 0; i < order.length; i++) {
    var k = order[i];
    var vid = play.episodes[k];
    var url = hgMp4(vid);
    if (seen[url]) continue;
    seen[url] = true;
    out.push({
      name: "红果短剧 · 第" + (k + 1) + "集" + (k === idx ? "（当前集）" : ""),
      description: (play.title || hit.name) + " · 360p · 官网直链",
      url: url,
      customHeaders: { "User-Agent": HG_UA, Referer: HG_BASE + "/" },
      playerType: "app",
    });
  }
  return out;
}
