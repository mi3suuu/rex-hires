// 诊断模块 v7.0.0：验证「全局赋值函数」修复是否生效
//
// 根因（v7.0.0 定位）：第三方模块（isOfficial=false）的入口函数必须用「全局赋值」
// 形式暴露（`xxx = async function(){}`），不能用 `async function xxx(){}` 函数声明。
// 官方 SDK 模板 baranwang/rex-widget-libs 里就是 `testFunction = async (params)=>{...}`。
//
// 两个入口（都用全局赋值函数 + type:"tmdb" 对齐 @rexnow/douban）：
//   ① 硬编码条目   —— 不依赖网络，验证第三方 video 列表能否渲染
//   ② 网络取片     —— 真实后端数据 + 归一化，验证端到端
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "7.0.0",
  requiredVersion: "0.0.1",
  description: "验证第三方模块「全局赋值函数」修复：硬编码条目 / 网络取片",
  author: "mi3s",
  modules: [
    { id: "hardcode", title: "① 硬编码条目", functionName: "hardcode", cacheDuration: 0, params: [] },
    { id: "netItem", title: "② 网络取片", functionName: "netItem", cacheDuration: 0, params: [] },
  ],
};

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

// ① 硬编码条目：type=tmdb + 相对路径 + 字符串 id（对齐 @rexnow/douban 写法）
hardcode = async function (params) {
  return [
    {
      id: "550",
      type: "tmdb",
      title: "搏击俱乐部",
      description: "硬编码条目，验证第三方 video 列表能否渲染海报",
      releaseDate: "1999",
      posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      mediaType: "movie",
      rating: "8.4",
      genreTitle: "剧情",
    },
    {
      id: "238",
      type: "tmdb",
      title: "教父",
      description: "第二部硬编码条目",
      releaseDate: "1972",
      posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      backdropPath: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      mediaType: "movie",
      rating: "8.7",
      genreTitle: "剧情 / 犯罪",
    },
  ];
};

// 归一化：type=tmdb + 相对路径 + 字符串 id/rating（对齐 @rexnow/douban）
normalize = function (it) {
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
};

// ② 网络取片：真实后端数据 + 归一化
netItem = async function (params) {
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
};
