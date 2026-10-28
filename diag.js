// 诊断模块：验证 Widget.tmdb 可用性 + type:tmdb 渲染链路
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "诊断 Widget.tmdb 与渲染链路",
  author: "mi3s",
  modules: [
    { id: "diag", title: "诊断", functionName: "diag", cacheDuration: 0, params: [] },
  ],
};

async function diag(params) {
  var out = [];
  // 1. 硬编码一个真实 tmdb 条目（550 = Fight Club），验证渲染链路（不依赖 Widget.tmdb）
  // 字段严格对齐 RexHome v151 rexHomeFinishItem 最终回传格式：
  //   id=字符串、rating=字符串、posterPath/backdropPath=完整 https URL
  out.push({
    id: "550",
    type: "tmdb",
    title: "【硬编码】Fight Club（若看到这条，说明 tmdb 渲染链路通）",
    description: "id=550 真实 tmdb id，不依赖 Widget.tmdb 调用",
    posterPath: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w780/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
    coverUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    rating: "8.4",
    mediaType: "movie",
  });

  // 2. 调 Widget.tmdb 测试
  var tmdbResult = "未执行";
  try {
    if (typeof Widget === "undefined" || !Widget.tmdb) {
      tmdbResult = "Widget.tmdb 不存在(undefined)";
    } else {
      var r = await Widget.tmdb.get("trending/all/week", { params: { language: "zh-CN" } });
      var n = (r && r.results) ? r.results.length : -1;
      tmdbResult = "trending 返回 " + n + " 条";
      if (n > 0) tmdbResult += "，首条=" + (r.results[0].title || r.results[0].name);
    }
  } catch (e) {
    tmdbResult = "Widget.tmdb 抛异常: " + (e && e.message ? e.message : e);
  }

  // 3. 把诊断信息作为一个条目返回（title 里带结果）
  out.push({
    id: 551,
    type: "tmdb",
    title: "【诊断】" + tmdbResult,
    description: "Widget.tmdb 调用测试结果",
    mediaType: "movie",
  });

  return out;
}
