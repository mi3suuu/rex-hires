// ============================================================================
// t3.js · 结构对照实验
// ----------------------------------------------------------------------------
// 目的：home.js 的「预览」全空，但 t1.js 的预览正常。两者函数体几乎相同，
// 差别只在文件结构。本文件把 home.js 的函数体原样搬来，只改结构变量：
//   1. 每个 module 加 requiresWebView: false（t1 有，home.js 没有）
//   2. cacheDuration 120 → 1800（t1 用 1800）
//   3. 去掉 search 块、去掉 iconurl（t1 都没有）
// 三个入口：
//   offRaw  = home.js 的 official 函数体（Widget.tmdb.get）原样
//   aiRaw   = home.js 的 aiDiscover 函数体，但 return items 原样（不过 passthrough）
//   aiPass  = home.js 的 aiDiscover 函数体（含 passthrough）
// ============================================================================

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

WidgetMetadata = {
  id: "app.mi3s.t3",
  title: "对照3·结构验证",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "结构对照：函数体与 home.js 一致，仅对齐 t1 的文件结构",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  modules: [
    {
      id: "offRaw",
      title: "A·TMDB原始",
      functionName: "offRaw",
      description: "Widget.tmdb.get 取 popular，字段照抄官方 rex-tmdb",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "aiRaw",
      title: "B·AI原样",
      functionName: "aiRaw",
      description: "AI 接口，return items 原样透传（不过 passthrough）",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "userId", title: "用户 ID", type: "userId" }
      ]
    },
    {
      id: "aiPass",
      title: "C·AI浅拷贝",
      functionName: "aiPass",
      description: "AI 接口，走 home.js 的 passthrough 浅拷贝",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "userId", title: "用户 ID", type: "userId" }
      ]
    }
  ]
};

// ---- 官方 rex-tmdb 的 genreTitleWith 同款 ----
var GENRE_DICT = [
  [10759, "动作冒险"], [16, "动画"], [35, "喜剧"], [80, "犯罪"], [99, "纪录"],
  [18, "剧情"], [10751, "家庭"], [10762, "儿童"], [9648, "悬疑"], [10763, "新闻"],
  [10764, "真人秀"], [10765, "科幻"], [10766, "肥皂剧"], [10767, "脱口秀"], [10768, "战争"],
  [37, "西部"], [28, "动作"], [12, "冒险"], [14, "奇幻"], [36, "历史"], [27, "恐怖"],
  [10402, "音乐"], [10749, "爱情"], [878, "科幻"], [10770, "电视电影"], [53, "惊悚"], [10752, "战争"]
];
function genreTitleWith(genre_ids) {
  if (!genre_ids || !genre_ids.length) return "";
  var ids = genre_ids.length > 2 ? genre_ids.slice(0, 2) : genre_ids;
  var names = [];
  for (var i = 0; i < ids.length; i++) {
    for (var j = 0; j < GENRE_DICT.length; j++) {
      if (GENRE_DICT[j][0] == ids[i]) { names.push(GENRE_DICT[j][1]); break; }
    }
  }
  return names.join(", ");
}

// ---- A：home.js 的 official 函数体，逐字照搬 ----
async function offRaw(params) {
  params = params || {};
  var language = params.language || "zh-CN";
  var page = params.page || 1;
  var response = await Widget.tmdb.get("movie/popular", { params: { language: language, page: page } });
  if (!response || !Array.isArray(response.results)) throw new Error("TMDB 返回异常");
  var data = [];
  for (var i = 0; i < response.results.length; i++) {
    var item = response.results[i];
    data.push({
      id: item.id,
      type: "tmdb",
      title: item.title || item.name || "",
      description: item.overview || "",
      releaseDate: item.release_date || item.first_air_date || "",
      backdropPath: String(item.backdrop_path || "").trim(),
      posterPath: String(item.poster_path || "").trim(),
      rating: Number(item.vote_average) || 0,
      mediaType: "movie",
      genreTitle: genreTitleWith(item.genre_ids)
    });
  }
  console.log("[t3] offRaw 返回 " + data.length + " 条, 有海报 " + data.filter(function (x) { return x.posterPath; }).length);
  return data;
}

// ---- B/C：home.js 的 aiDiscover 函数体 ----
async function aiFetch(params) {
  var language = (params && params.language) || "zh-CN";
  var userId = (params && params.userId) || "";
  var response = await Widget.http.post(
    API_BASE + "/search",
    { query: "热门电影", userId: userId, language: language },
    { headers: { "Content-Type": "application/json" } }
  );
  var data = response.data;
  if (!data || !data.success) throw new Error((data && data.message) || "搜索失败");
  return data.data || [];
}

async function aiRaw(params) {
  var items = await aiFetch(params);
  console.log("[t3] aiRaw 返回 " + items.length + " 条");
  return items;
}

function passthrough(items) {
  if (!items || !items.length) return [];
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it || typeof it !== "object") continue;
    var copy = {};
    for (var k in it) copy[k] = it[k];
    if (copy.id == null) copy.id = String(i);
    if (!copy.title) copy.title = copy.name || copy.originalTitle || copy.original_title || "";
    if (!copy.type) copy.type = "tmdb";
    if (!copy.mediaType) copy.mediaType = copy.media_type || (copy.firstAirDate || copy.first_air_date ? "tv" : "movie");
    out.push(copy);
  }
  return out;
}

async function aiPass(params) {
  var items = await aiFetch(params);
  console.log("[t3] aiPass 返回 " + items.length + " 条");
  return passthrough(items);
}
