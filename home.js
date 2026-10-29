// ============================================================================
// Rex 片单模块 · 高清片源聚合（app.mi3s.homes） v8.0.0
// ----------------------------------------------------------------------------
// ★ 数据源：Rex 官方发现服务（与官方「AI 搜索」同源）
//   Widget.http.post 到 https://api.rexnow.tv/api/discovery/ai-search/search
//
// ★★ 本版根因修正（v8.0.0）：照抄唯一「实机海报显示正常」的第三方模块
//   ZurlyQin/rex-widgets 的 TMDB 电影精选（README 实测验证），它用的是：
//     1. `async function xxx(params){}` 函数声明（非全局赋值）
//     2. 数字 id、数字 rating（Number(...) || 0，不字符串化）
//     3. type:"tmdb"、posterPath/backdropPath 传 TMDB 相对路径 /xxx.jpg
//   之前 v5「字符串化」/ v6「type=url」/ v7「全局赋值」三个结论均被该成品推翻。
//
// ★ 限流说明：该后端连续 ~16 次请求返回 429，列表入口统一 cacheDuration=3600。
//
// 播放链路：点进条目后，Rex 调 stream 模块（app.mi3s.hires）按 title 回 CMS 源。
// ============================================================================

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

WidgetMetadata = {
  id: "app.mi3s.homes",
  title: "高清片源聚合",
  version: "8.0.0",
  requiredVersion: "0.0.1",
  description: "片单走 Rex 官方发现服务（与 AI 搜索同源）：最新更新 / 热播榜 / 分类 / 题材 / 自由搜片，点进即调高清片源回 CMS 源解析播放地址",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  modules: [
    {
      id: "latest",
      title: "最新更新",
      functionName: "latest",
      cacheDuration: 3600,
      params: [
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "userId", title: "用户 ID", type: "userId" },
      ],
    },
    {
      id: "hot",
      title: "热播榜",
      functionName: "hot",
      cacheDuration: 3600,
      params: [
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "userId", title: "用户 ID", type: "userId" },
      ],
    },
    {
      id: "category",
      title: "分类",
      functionName: "category",
      cacheDuration: 3600,
      params: [
        {
          name: "type",
          title: "分类",
          type: "enumeration",
          value: "movie",
          enumOptions: [
            { title: "电影", value: "movie" },
            { title: "连续剧", value: "series" },
            { title: "动漫", value: "anime" },
            { title: "综艺", value: "variety" },
            { title: "纪录片", value: "documentary" },
          ],
        },
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "userId", title: "用户 ID", type: "userId" },
      ],
    },
    {
      id: "genre",
      title: "题材",
      functionName: "genre",
      cacheDuration: 3600,
      params: [
        {
          name: "genre",
          title: "题材",
          type: "enumeration",
          value: "action",
          enumOptions: [
            { title: "动作", value: "action" },
            { title: "喜剧", value: "comedy" },
            { title: "爱情", value: "romance" },
            { title: "科幻", value: "scifi" },
            { title: "恐怖", value: "horror" },
            { title: "剧情", value: "drama" },
            { title: "战争", value: "war" },
            { title: "犯罪", value: "crime" },
            { title: "悬疑", value: "mystery" },
            { title: "冒险", value: "adventure" },
            { title: "奇幻", value: "fantasy" },
          ],
        },
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "userId", title: "用户 ID", type: "userId" },
      ],
    },
  ],
  search: {
    title: "搜片",
    functionName: "search",
    params: [
      {
        name: "keyword",
        title: "片名或描述",
        type: "input",
        description: "输入片名或用自然语言描述想看的",
        placeholders: [
          { title: "流浪地球", value: "流浪地球" },
          { title: "高分科幻片", value: "高分科幻片" },
          { title: "诺兰的电影", value: "诺兰的电影" },
          { title: "类似盗梦空间", value: "类似盗梦空间" },
        ],
      },
      { name: "language", title: "语言", type: "language", value: "zh-CN" },
      { name: "userId", title: "用户 ID", type: "userId" },
    ],
  },
};

// 把后端条目规范成 Rex 渲染层可稳定解析的 VideoItem。
// 对齐 ZurlyQin/rex-widgets 的 videoItem（实机海报显示正常）：
//   数字 id、数字 rating（Number()||0）、type:"tmdb"、posterPath/backdropPath
//   传 TMDB 相对路径 /xxx.jpg、mediaType:"movie"。
function normalizeItem(it) {
  if (!it) return null;
  var rating = Number(it.rating);
  return {
    id: Number(it.id != null ? it.id : 0),
    type: it.type || "tmdb",
    mediaType: it.mediaType || "movie",
    title: it.title || "",
    description: it.description || "",
    posterPath: it.posterPath || "",
    backdropPath: it.backdropPath || "",
    releaseDate: it.releaseDate || "",
    rating: isFinite(rating) ? rating : 0
  };
}

// 调 Rex 官方发现服务，返回后端生成的条目（照抄 rex.nlsearch 的 nlSearch）
async function aiDiscover(query, params) {
  var language = (params && params.language) || "zh-CN";
  var userId = (params && params.userId) || "";
  try {
    var response = await Widget.http.post(
      API_BASE + "/search",
      { query: query, userId: userId, language: language },
      { headers: { "Content-Type": "application/json" } }
    );
    var data = response.data;
    if (!data || !data.success) {
      throw new Error((data && data.message) || "搜索失败");
    }
    var items = data.data || [];
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var n = normalizeItem(items[i]);
      if (n) out.push(n);
    }
    return out;
  } catch (error) {
    console.error("[高清片源] 请求失败:", error && error.message ? error.message : error);
    throw new Error("片单服务暂时不可用，请稍后再试");
  }
}

async function latest(params) {
  return await aiDiscover("最新上映的电影和剧集", params);
}

async function hot(params) {
  return await aiDiscover("本周热播的电影和剧集", params);
}

var CATEGORY_QUERY = {
  movie: "热门电影",
  series: "热门电视剧",
  anime: "热门动漫",
  variety: "热门综艺节目",
  documentary: "热门纪录片",
};

async function category(params) {
  var type = (params && params.type) || "movie";
  return await aiDiscover(CATEGORY_QUERY[type] || "热门电影", params);
}

var GENRE_QUERY = {
  action: "动作电影",
  comedy: "喜剧电影",
  romance: "爱情电影",
  scifi: "科幻电影",
  horror: "恐怖电影",
  drama: "剧情电影",
  war: "战争电影",
  crime: "犯罪电影",
  mystery: "悬疑电影",
  adventure: "冒险电影",
  fantasy: "奇幻电影",
};

async function genre(params) {
  var g = (params && params.genre) || "action";
  return await aiDiscover(GENRE_QUERY[g] || "动作电影", params);
}

async function search(params) {
  var keyword = ((params && (params.keyword || params.query)) || "").trim();
  if (!keyword) throw new Error("请输入片名或描述");
  return await aiDiscover(keyword, params);
}
