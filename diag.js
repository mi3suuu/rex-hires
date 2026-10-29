// 诊断模块：验证 type:"tmdb" 渲染链路 + Widget.tmdb 可用性
// 字段严格按 @rexnow/libs video.ts：id=字符串、rating=字符串、posterPath=相对路径
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "诊断 Widget.tmdb 与 type:tmdb 渲染链路",
  author: "mi3s",
  modules: [
    { id: "diag", title: "诊断", functionName: "diag", cacheDuration: 0, params: [] },
  ],
};

async function diag(params) {
  var out = [];

  // 1. 调 Widget.tmdb 真实取数，按 string 契约回传 —— 验证「真实数据」能否渲染
  var tmdbResult = "未执行";
  try {
    if (typeof Widget === "undefined" || !Widget.tmdb) {
      tmdbResult = "Widget.tmdb 不存在";
    } else {
      var r = await Widget.tmdb.get("trending/all/week", { params: { language: "zh-CN", page: 1 } });
      var list = (r && r.results) || [];
      tmdbResult = "trending 返回 " + list.length + " 条";
      for (var i = 0; i < list.length && i < 20; i++) {
        var it = list[i];
        var mt = it.media_type;
        if (mt == null) mt = it.title ? "movie" : "tv";
        if (mt !== "movie" && mt !== "tv") continue;
        out.push({
          id: String(it.id),
          type: "tmdb",
          title: it.title || it.name || ("(无标题#" + i + ")"),
          description: it.overview || "",
          releaseDate: it.release_date || it.first_air_date || "",
          posterPath: it.poster_path || "",
          backdropPath: it.backdrop_path || "",
          rating: it.vote_average == null ? undefined : String(it.vote_average),
          mediaType: mt,
        });
      }
    }
  } catch (e) {
    tmdbResult = "异常: " + (e && e.message ? e.message : e);
  }

  // 2. 头部固定 2 条硬编码真实条目（Fight Club 550），完全不依赖网络，验证渲染链路本身
  var head = [
    {
      id: String(551),
      type: "tmdb",
      title: "【诊断】" + tmdbResult,
      description: "若这条出现，说明 type:tmdb 条目已进入列表",
      posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdropPath: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
      rating: String(8.4),
      mediaType: "movie",
    },
    {
      id: String(550),
      type: "tmdb",
      title: "【硬编码】Fight Club（看到海报=渲染链路通）",
      description: "id=550 真实 tmdb id，不依赖 Widget.tmdb",
      posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdropPath: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
      rating: String(8.4),
      mediaType: "movie",
    },
  ];
  return head.concat(out);
}
