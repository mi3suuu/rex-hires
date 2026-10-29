// ============================================================================
// Rex 片单模块 · 高清片源聚合（app.mi3s.homes） v6.0.0
// ----------------------------------------------------------------------------
// ★ 数据源走 Rex 官方发现服务（与官方「AI 搜索」同源）：
//   - 请求：Widget.http.post 到 https://api.rexnow.tv/api/discovery/ai-search/search
//   - 返回：后端 data.data 的条目（id/type/title/posterPath 等）
//
// ★ 关键（v6.0.0，根因修正）：条目 type 必须用 "url"、图片填「完整 https URL」。
//   官方「AI 搜索」是 isOfficial=true，能透传 type:"tmdb" 显示，因为它有内置
//   TMDB 桥；第三方模块（isOfficial=false）没有这个桥（反编译见
//   tmdb.bridge.not.configured + tmdbImageProxyHost 已 404），type:"tmdb" 条目
//   会整批失败 → 列表「没有更多」。改用 type:"url" 走通用封面回退链（coverUrl
//   只填即可全位置出图），不依赖 TMDB 桥。
//
// ★ 限流说明：该后端对同一来源有速率限制（实测连续 ~16 次返回 429），因此
//   列表入口统一 cacheDuration=3600（官方默认），1 小时内同一入口不重复请求。
//
// 播放链路：条目保留 tmdbId 字段，点进后 stream 模块（app.mi3s.hires）按
// title 回 CMS 源解析播放地址，播放链路不受影响。
// ============================================================================

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

WidgetMetadata = {
  id: "app.mi3s.homes",
  title: "高清片源聚合",
  version: "6.0.0",
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
// 关键（v6.0.0，根因修正）：type 必须用 "url"，图片字段填「完整 https 图片 URL」。
// 依据三重证据：
//   1) 官方「AI 搜索」是 isOfficial=true，直接 return data.data 透传 type:"tmdb"
//      能显示——因为它有内置 TMDB 桥；第三方模块（isOfficial=false）没有这个桥，
//      type:"tmdb" 条目会整批失败 → 列表「没有更多」。
//   2) 反编译 Rex 主二进制发现 services.copy.tmdb.bridge.not.configured
//      （"TMDB 桥未配置"）+ tmdbImageProxyHost（实测 rexnow.tv/t/p 已 404）。
//   3) ForwardWidgets 官方文档：type:"url" 走通用封面回退链（coverUrl 只填即可
//      全位置出图），不依赖 TMDB 桥；type:"tmdb"/douban/imdb 才走内置详情页。
// 保留 tmdbId 字段：点进条目后 stream 模块（app.mi3s.hires）仍能按 title 回 CMS
// 源解析播放地址，播放链路不受影响。
var IMG_BASE = "https://image.tmdb.org/t/p";

function normalizeItem(it) {
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
    coverUrl: poster ? IMG_BASE + "/w500" + poster : (backdrop ? IMG_BASE + "/w1280" + backdrop : ""),
    posterPath: poster ? IMG_BASE + "/w500" + poster : "",
    backdropPath: backdrop ? IMG_BASE + "/w1280" + backdrop : "",
    mediaType: it.mediaType || "movie",
    rating: it.rating,
    genreTitle: it.genreTitle || "",
    tmdbId: id,
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
