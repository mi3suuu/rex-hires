// 诊断模块 v2.0.0：复刻官方「AI 搜索」后端返回格式，验证 tmdb 条目能否渲染
// 结论来源：用户设备上 AI 搜索（rex.nlsearch）能正常显示，
// 其后端 https://api.rexnow.tv/api/discovery/ai-search/search 返回条目为：
//   id=数字, type="tmdb", title, description, releaseDate,
//   posterPath=相对路径, backdropPath=相对路径, mediaType, rating=数字,
//   genreTitle="科幻 / 悬疑 / 动作"（空格+斜杠+空格）
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "2.0.0",
  requiredVersion: "0.0.1",
  description: "复刻 AI 搜索返回格式，验证 tmdb 条目渲染",
  author: "mi3s",
  modules: [
    { id: "diag", title: "诊断", functionName: "diag", cacheDuration: 0, params: [] },
  ],
};

async function diag(params) {
  var out = [];

  // 1. 硬编码：完全照抄 AI 搜索后端一条真实返回（Fight Club 的 tmdb id 用 550 替入）
  out.push({
    id: 550,
    type: "tmdb",
    title: "【硬编码】Fight Club（看到海报=渲染链路通）",
    description: "此条字段与 AI 搜索后端完全一致：数字 id、数字 rating、相对路径海报",
    releaseDate: "1999-10-15",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
    mediaType: "movie",
    rating: 8.4,
    genreTitle: "剧情 / 惊悚",
  });

  // 2. 真实 TMDB 取数，按 AI 搜索同样格式回传
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
        out.push({
          id: it.id,
          type: "tmdb",
          title: it.title || it.name,
          description: it.overview || "",
          releaseDate: it.release_date || it.first_air_date || "",
          posterPath: it.poster_path || "",
          backdropPath: it.backdrop_path || "",
          mediaType: mt,
          rating: it.vote_average,
          genreTitle: (function (ids) {
            var map = { "28": "动作", "12": "冒险", "16": "动画", "35": "喜剧", "80": "犯罪",
              "99": "纪录", "18": "剧情", "10751": "合家欢", "14": "奇幻", "36": "历史",
              "27": "恐怖", "10402": "音乐", "9648": "悬疑", "10749": "爱情", "878": "科幻",
              "53": "惊悚", "10752": "战争", "37": "西部" };
            if (!ids || !ids.length) return "";
            var n = [];
            for (var k = 0; k < ids.length; k++) {
              var name = map[String(ids[k])];
              if (name && n.indexOf(name) < 0) n.push(name);
            }
            return n.slice(0, 3).join(" / ");
          })(it.genre_ids),
        });
      }
    }
  } catch (e) {
    info = "异常: " + (e && e.message ? e.message : e);
  }

  out.unshift({
    id: 551,
    type: "tmdb",
    title: "【诊断】" + info,
    description: "第 2 条是硬编码（数字 id+相对路径）；其余是真实 TMDB 数据，格式同 AI 搜索",
    releaseDate: "1999-10-15",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
    mediaType: "movie",
    rating: 8.4,
    genreTitle: "剧情 / 惊悚",
  });

  return out;
}
