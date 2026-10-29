// 诊断模块 v6.0.0：定位「第三方模块列表空白」根因（type 与图片 URL 格式）
//
// 三重证据锁定根因：
//   1) 官方「AI 搜索」(rex.nlsearch) 是 isOfficial=true，直接 return data.data
//      透传 type:"tmdb" 条目能显示——因为它有内置 TMDB 桥。
//   2) 反编译 Rex 主二进制发现 services.copy.tmdb.bridge.not.configured
//      （"TMDB 桥未配置"）+ tmdbImageProxyHost 配置（实测 rexnow.tv/t/p 已 404）。
//      第三方模块 (isOfficial=false) 没有 TMDB 桥 → type:"tmdb" 条目整批失败。
//   3) ForwardWidgets 官方文档：type:"url" 走通用封面回退链（coverUrl 只填即可
//      全位置出图），type:"tmdb"/douban/imdb 才走内置详情页（依赖 TMDB 能力）。
//
// 四个入口，一次测出真相：
//   ① type=url + 完整 https 图片 URL   ← 主推，预计能出海报
//   ② type=tmdb + 完整 https 图片 URL  ← 对照：单独隔离「type」这个变量
//   ③ type=tmdb + 相对路径            ← v5.0 旧方案，预计仍空白
//   ④ 网络取片 → type=url + 完整 URL   ← 验证真实后端数据 + 新方案
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "6.0.0",
  requiredVersion: "0.0.1",
  description: "对比 type=url / type=tmdb / 相对路径 / 网络取片，定位第三方模块列表空白根因",
  author: "mi3s",
  modules: [
    { id: "urlFull", title: "① type=url 完整图", functionName: "urlFull", cacheDuration: 0, params: [] },
    { id: "tmdbFull", title: "② type=tmdb 完整图", functionName: "tmdbFull", cacheDuration: 0, params: [] },
    { id: "tmdbRel", title: "③ type=tmdb 相对路径", functionName: "tmdbRel", cacheDuration: 0, params: [] },
    { id: "netUrl", title: "④ 网络取片 type=url", functionName: "netUrl", cacheDuration: 0, params: [] },
  ],
};

var IMG = "https://image.tmdb.org/t/p/w500";
var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

// 真实 TMDB 条目（搏击俱乐部 / 教父，海报与背景均已实测可直连）
var ITEMS = [
  { id: "550", title: "搏击俱乐部", poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg" },
  { id: "238", title: "教父", poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg" },
];

// ① type=url + 完整图片 URL（主推）
async function urlFull(params) {
  var out = [];
  for (var i = 0; i < ITEMS.length; i++) {
    var m = ITEMS[i];
    out.push({
      id: m.id,
      type: "url",
      title: m.title + " (type=url)",
      description: "完整图片 URL，走通用封面回退链，不依赖 TMDB 桥",
      coverUrl: IMG + m.poster,
      posterPath: IMG + m.poster,
      backdropPath: IMG + m.backdrop,
      mediaType: "movie",
      rating: "8.5",
      genreTitle: "剧情",
    });
  }
  return out;
}

// ② type=tmdb + 完整图片 URL（对照：单独隔离 type 变量）
async function tmdbFull(params) {
  var out = [];
  for (var i = 0; i < ITEMS.length; i++) {
    var m = ITEMS[i];
    out.push({
      id: m.id,
      type: "tmdb",
      title: m.title + " (type=tmdb 完整图)",
      description: "完整图片 URL 但 type 仍是 tmdb（对照①）",
      coverUrl: IMG + m.poster,
      posterPath: IMG + m.poster,
      backdropPath: IMG + m.backdrop,
      mediaType: "movie",
      rating: "8.5",
      genreTitle: "剧情",
    });
  }
  return out;
}

// ③ type=tmdb + 相对路径（v5.0 旧方案，预计仍空白）
async function tmdbRel(params) {
  var out = [];
  for (var i = 0; i < ITEMS.length; i++) {
    var m = ITEMS[i];
    out.push({
      id: m.id,
      type: "tmdb",
      title: m.title + " (type=tmdb 相对路径)",
      description: "v5.0 旧方案：相对 posterPath",
      posterPath: m.poster,
      backdropPath: m.backdrop,
      mediaType: "movie",
      rating: "8.5",
      genreTitle: "剧情",
    });
  }
  return out;
}

// 网络取片归一化：type=url + 完整图片 URL（保留 tmdbId 供 stream 播放链路）
function normalize(it) {
  if (!it) return null;
  var id = it.id != null ? String(it.id) : "";
  var poster = it.posterPath || "";
  var backdrop = it.backdropPath || "";
  return {
    id: id,
    type: "url",
    title: it.title || "",
    description: it.description || "",
    releaseDate: it.releaseDate || "",
    coverUrl: poster ? IMG + poster : (backdrop ? IMG + backdrop : ""),
    posterPath: poster ? IMG + poster : "",
    backdropPath: backdrop ? IMG + backdrop : "",
    mediaType: it.mediaType || "movie",
    rating: it.rating,
    genreTitle: it.genreTitle || "",
    tmdbId: id,
  };
}

// ④ 网络取片 → type=url + 完整 URL
async function netUrl(params) {
  var response = await Widget.http.post(
    API_BASE + "/search",
    { query: "最近热门电影", userId: "", language: "zh-CN" },
    { headers: { "Content-Type": "application/json" } }
  );
  var data = response.data;
  if (!data || !data.success) throw new Error((data && data.message) || "失败");
  var out = [];
  var items = data.data || [];
  for (var i = 0; i < items.length; i++) {
    var n = normalize(items[i]);
    if (n) out.push(n);
  }
  return out;
}
