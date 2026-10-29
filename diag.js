// 诊断模块 v3.0.0：对比两种数据源，定位「资源库/首页空白」根因
// 入口 1「后端取片」= 完全照抄 AI 搜索（Widget.http.post → Rex 后端）
// 入口 2「TMDB 取片」= Widget.tmdb.get（旧方案）
// 哪个入口有内容，就说明哪种数据源在真实渲染环境可用。
WidgetMetadata = {
  id: "app.mi3s.diag",
  title: "诊断",
  version: "3.0.0",
  requiredVersion: "0.0.1",
  description: "对比后端取片 vs TMDB 取片，定位列表空白根因",
  author: "mi3s",
  modules: [
    { id: "diagHttp", title: "① 后端取片（照抄 AI 搜索）", functionName: "diagHttp", cacheDuration: 0, params: [] },
    { id: "diagTmdb", title: "② TMDB 取片（旧方案）", functionName: "diagTmdb", cacheDuration: 0, params: [] },
  ],
};

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

async function diagHttp(params) {
  var response = await Widget.http.post(
    API_BASE + "/search",
    { query: "最近热门电影", userId: "", language: "zh-CN" },
    { headers: { "Content-Type": "application/json" } }
  );
  var data = response.data;
  if (!data || !data.success) throw new Error((data && data.message) || "失败");
  return data.data || [];
}

async function diagTmdb(params) {
  var response = await Widget.tmdb.get("trending/all/week", { params: { language: "zh-CN", page: 1 } });
  var list = (response && response.results) || [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
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
    });
  }
  return out;
}
