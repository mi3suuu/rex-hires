// 诊断模块 v4.0.0：一锤定音定位「列表空白」根因
// 三个硬编码入口，不依赖网络，直接验证渲染层对条目字段的处理：
//   ① 字符串 id  → 如果这能出海报、②空白，说明 id 必须是字符串（根因）
//   ② 数字 id    → 透传后端数字 id 的写法（旧方案）
//   ③ 网络取片   → Widget.http.post 调 AI 后端 + id/rating 字符串化（新方案）
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "4.0.0",
  requiredVersion: "0.0.1",
  description: "对比字符串 id / 数字 id / 网络取片，定位列表空白根因",
  author: "mi3s",
  modules: [
    { id: "strId", title: "① 字符串 id", functionName: "strId", cacheDuration: 0, params: [] },
    { id: "numId", title: "② 数字 id", functionName: "numId", cacheDuration: 0, params: [] },
    { id: "netId", title: "③ 网络取片", functionName: "netId", cacheDuration: 0, params: [] },
  ],
};

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

// 同一个 TMDB 条目，唯一区别是 id 是字符串还是数字
async function strId(params) {
  return [
    {
      id: "550",
      type: "tmdb",
      title: "搏击俱乐部 (字符串id)",
      mediaType: "movie",
      posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      rating: "8.4",
    },
    {
      id: "238",
      type: "tmdb",
      title: "教父 (字符串id)",
      mediaType: "movie",
      posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      rating: "8.7",
    },
  ];
}

async function numId(params) {
  return [
    {
      id: 550,
      type: "tmdb",
      title: "搏击俱乐部 (数字id)",
      mediaType: "movie",
      posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      rating: 8.4,
    },
    {
      id: 238,
      type: "tmdb",
      title: "教父 (数字id)",
      mediaType: "movie",
      posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      rating: 8.7,
    },
  ];
}

function normalize(it) {
  if (!it) return null;
  var rating = it.rating;
  return {
    id: String(it.id != null ? it.id : ""),
    type: it.type || "tmdb",
    title: it.title || "",
    description: it.description || "",
    releaseDate: it.releaseDate || "",
    posterPath: it.posterPath || "",
    backdropPath: it.backdropPath || "",
    mediaType: it.mediaType || "movie",
    rating: (rating == null || rating === "") ? undefined : String(rating),
    genreTitle: it.genreTitle || "",
  };
}

async function netId(params) {
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
