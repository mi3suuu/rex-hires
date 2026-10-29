// ============================================================================
// Rex 片单模块 · 高清片源聚合（app.mi3s.homes） v7.0.0
// ----------------------------------------------------------------------------
// ★ 数据源走 Rex 官方发现服务（与官方「AI 搜索」同源）：
//   - 请求：Widget.http.post 到 https://api.rexnow.tv/api/discovery/ai-search/search
//   - 返回：后端 data.data 的条目
//
// ★★ 真正根因（v7.0.0，反复空白 6 个版本的最终定位）：
//   第三方模块（isOfficial=false）的入口函数【必须用「全局赋值」形式暴露】，
//   即 `latest = async function(params){...}`，不能用 `async function latest(){}`
//   函数声明，也不能用 `export`。
//   决定性证据：官方 SDK 仓库 baranwang/rex-widget-libs 的脚手架模板
//   examples/rslib-plugin/src/index.ts 里就是 `testFunction = async (params)=>{...}`；
//   唯一能正常显示的第三方视频模块 @rexnow/douban（豆瓣榜单）的产物也是
//   `loadDefaultCatalog = ...` 全局赋值。官方「AI 搜索」能用函数声明，是因为它走
//   isOfficial=true 的 bundledOfficialData 特殊加载路径。
//
// ★ 条目字段对齐 @rexnow/douban（实测可显示的第三方 video 模块）：
//   type:"tmdb"（走内置详情页，自动拿 TMDB 详情/图片，第三方也支持）、
//   posterPath/backdropPath 传 TMDB 相对路径 /xxx.jpg、id/rating 字符串化。
//
// ★ 限流说明：该后端连续 ~16 次请求返回 429，列表入口统一 cacheDuration=3600。
//
// 播放链路：点进条目后，Rex 调 stream 模块（app.mi3s.hires）按 title 回 CMS 源。
// ============================================================================

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

WidgetMetadata = {
  id: "app.mi3s.homes",
  title: "高清片源聚合",
  version: "7.0.0",
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
// 对齐 @rexnow/douban（实测可显示的第三方 video 模块）：
//   id/rating 字符串化，type 用 "tmdb"（走内置详情页），posterPath/backdropPath
//   传 TMDB 相对路径（/xxx.jpg）。第三方模块的 type:"tmdb" 是支持的（douban 即证）。
normalizeItem = function (it) {
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

// 调 Rex 官方发现服务，返回后端生成的条目（照抄 rex.nlsearch 的 nlSearch）
aiDiscover = async function (query, params) {
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
};

latest = async function (params) {
  return await aiDiscover("最新上映的电影和剧集", params);
};

hot = async function (params) {
  return await aiDiscover("本周热播的电影和剧集", params);
};

var CATEGORY_QUERY = {
  movie: "热门电影",
  series: "热门电视剧",
  anime: "热门动漫",
  variety: "热门综艺节目",
  documentary: "热门纪录片",
};

category = async function (params) {
  var type = (params && params.type) || "movie";
  return await aiDiscover(CATEGORY_QUERY[type] || "热门电影", params);
};

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

genre = async function (params) {
  var g = (params && params.genre) || "action";
  return await aiDiscover(GENRE_QUERY[g] || "动作电影", params);
};

search = async function (params) {
  var keyword = ((params && (params.keyword || params.query)) || "").trim();
  if (!keyword) throw new Error("请输入片名或描述");
  return await aiDiscover(keyword, params);
};
