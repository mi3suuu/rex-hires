// 诊断模块 v1.2.0：A/B 对照「海报 URL 形式」，定位首页海报墙为何空白
// 同一部片（Fight Club, tmdb 550）出两条：
//   【A】完整 https 图床地址
//   【B】TMDB 相对路径 /xxx.jpg
// 谁出海报，就说明客户端认哪种写法。
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "1.2.0",
  requiredVersion: "0.0.1",
  description: "A/B 对照海报 URL 形式（完整 https vs 相对路径），排查首页海报墙空白",
  author: "mi3s",
  modules: [
    { id: "diag", title: "诊断", functionName: "diag", cacheDuration: 0, params: [] },
  ],
};

var POSTER = "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg";
var BACKDROP = "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg";

async function diag(params) {
  var out = [];

  // A：完整 https（RexHome 的 rexHomeNativeImage 写法）
  out.push({
    id: String(550),
    type: "tmdb",
    title: "【A】完整 https 海报（能出图=用这种）",
    description: "posterPath = https://image.tmdb.org/t/p/w500" + POSTER,
    posterPath: "https://image.tmdb.org/t/p/w500" + POSTER,
    backdropPath: "https://image.tmdb.org/t/p/w780" + BACKDROP,
    coverUrl: "https://image.tmdb.org/t/p/w500" + POSTER,
    rating: String(8.4),
    mediaType: "movie",
  });

  // B：相对路径（官方 rex.tmdb 明文写法）
  out.push({
    id: String(550),
    type: "tmdb",
    title: "【B】相对路径海报（能出图=相对路径也行）",
    description: "posterPath = " + POSTER,
    posterPath: POSTER,
    backdropPath: BACKDROP,
    rating: String(8.4),
    mediaType: "movie",
  });

  // C：真实 TMDB 取数，按完整 https 回传
  var info = "未执行";
  try {
    if (typeof Widget === "undefined" || !Widget.tmdb) {
      info = "Widget.tmdb 不存在";
    } else {
      var r = await Widget.tmdb.get("trending/all/week", { params: { language: "zh-CN", page: 1 } });
      var list = (r && r.results) || [];
      info = "trending 返回 " + list.length + " 条";
      for (var i = 0; i < list.length && i < 18; i++) {
        var it = list[i];
        var mt = it.media_type;
        if (mt == null) mt = it.title ? "movie" : "tv";
        if (mt !== "movie" && mt !== "tv") continue;
        var p = it.poster_path ? "https://image.tmdb.org/t/p/w500" + it.poster_path : undefined;
        var b = it.backdrop_path ? "https://image.tmdb.org/t/p/w780" + it.backdrop_path : undefined;
        out.push({
          id: String(it.id),
          type: "tmdb",
          title: it.title || it.name || ("(无标题#" + i + ")"),
          description: it.overview || "",
          releaseDate: it.release_date || it.first_air_date || "",
          posterPath: p,
          backdropPath: b,
          coverUrl: p || b,
          rating: it.vote_average == null ? undefined : String(it.vote_average),
          mediaType: mt,
        });
      }
    }
  } catch (e) {
    info = "异常: " + (e && e.message ? e.message : e);
  }

  // 头部放一条诊断说明（带图，确保它是可见的）
  out.unshift({
    id: String(551),
    type: "tmdb",
    title: "【诊断】" + info,
    description: "A=完整 https，B=相对路径；C 段是真实 TMDB 数据",
    posterPath: "https://image.tmdb.org/t/p/w500" + POSTER,
    backdropPath: "https://image.tmdb.org/t/p/w780" + BACKDROP,
    coverUrl: "https://image.tmdb.org/t/p/w500" + POSTER,
    rating: String(8.4),
    mediaType: "movie",
  });

  return out;
}
