// ============================================================================
// Rex 首页片单模块 · 高清片源（app.mi3s.homes）
// ----------------------------------------------------------------------------
// video 类型模块：首页「片单」走 TMDB 片库，返回 type:"tmdb" 条目（官方规范）。
//
// 为什么走 TMDB 片库而不是直接聚合 CMS 源：
//   Rex 首页视频列表只把 type:"tmdb"（或 douban/imdb）条目渲染成「片」（海报卡片），
//   type:"url" 会被当成「源/链接」，海报墙渲染不出 → 显示「暂无」。
//   CMS 源片名没有 tmdb id，逐条去 TMDB 搜索匹配的命中率低、又慢，不可靠。
//   故参照官方 rex.bangumi 与 RexHome 的「TMDB 片库模式」：片单直接来自 TMDB
//   discover/trending 接口，100% 有海报、详情、评分。
//
// 播放链路：点进条目后，Rex 把条目的 title（片名）传给 stream 模块
//   （app.mi3s.hires 的 loadResource），由它去 28 个 CMS 源搜真实播放地址。
//   即「首页 = TMDB 片库（展示），播放 = CMS 源（回源）」。
//
// 严格对齐官方类型（@rexnow/libs video.ts）+ 已验证可用的首页模块 RexHome 写法：
//   - modules[] 不写 type 字段（缺省即 video 类型）
//   - function 返回 VideoItem[]：{id, type:"tmdb", title, posterPath, backdropPath,
//     coverUrl, releaseDate, rating, mediaType, genreTitle, description}
//   - 【关键 1】id 与 rating 必须是字符串（id: string / rating?: string）
//   - 【关键 2】海报必须是【完整 https URL】。首页海报墙不会替第三方模块补图床前缀，
//     给相对路径 /xxx.jpg 会导致整行空（官方 rex.tmdb 能给相对路径是客户端特判）
//   - 只用 Widget.tmdb.get(api, {params})（Rex 运行时提供），无 fetch/定时器
// ============================================================================

WidgetMetadata = {
  id: "app.mi3s.homes",
  title: "高清片源聚合",
  description: "首页片单走 TMDB 片库（最新更新 / 热播榜 / 电影·剧集·动漫·综艺·纪录片·短剧 / 二级题材），点进即调高清片源(stream)回 CMS 源解析播放地址",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "2.5.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      id: "latest",
      title: "最新更新",
      functionName: "latest",
      description: "电影 + 剧集按首映/首播日期倒序的最新片单",
      cacheDuration: 300,
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "hot",
      title: "热播榜",
      functionName: "hot",
      description: "本周趋势热播（电影 + 剧集）",
      cacheDuration: 600,
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "category",
      title: "分类",
      functionName: "category",
      description: "电影 / 连续剧 / 动漫 / 综艺 / 纪录片 / 短剧 六大分类",
      cacheDuration: 300,
      params: [
        {
          name: "type",
          title: "分类",
          type: "enumeration",
          enumOptions: [
            { title: "电影", value: "movie" },
            { title: "连续剧", value: "series" },
            { title: "动漫", value: "anime" },
            { title: "综艺", value: "variety" },
            { title: "纪录片", value: "documentary" },
            { title: "短剧", value: "short" },
          ],
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "genre",
      title: "题材",
      functionName: "genre",
      description: "二级题材：动作 / 喜剧 / 爱情 / 科幻 / 恐怖 / 剧情 / 战争 / 犯罪 / 悬疑 / 合家欢 / 冒险 / 奇幻 / 历史 / 音乐",
      cacheDuration: 300,
      params: [
        {
          name: "genre",
          title: "题材",
          type: "enumeration",
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
            { title: "合家欢", value: "family" },
            { title: "冒险", value: "adventure" },
            { title: "奇幻", value: "fantasy" },
            { title: "历史", value: "history" },
            { title: "音乐", value: "music" },
          ],
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// TMDB 片库取数：直接调 TMDB 标准接口，返回 type:"tmdb" 条目（100% 能显示成「片」）
// 参照官方 rex.bangumi 的 fetchData / applySortBy / discover 写法。
// 首页 video 列表必须返回 type:"tmdb" 条目——type:"url" 会被 Rex 当成「源/链接」，
// 海报墙渲染不出，表现为「暂无」。播放由 stream 模块（app.mi3s.hires）按片名回源解析。
// ---------------------------------------------------------------------------

// genre_id → 中文名（常用题材）
var GENRE_NAMES = {
  "28": "动作", "12": "冒险", "16": "动画", "35": "喜剧", "80": "犯罪",
  "99": "纪录", "18": "剧情", "10751": "合家欢", "14": "奇幻", "36": "历史",
  "27": "恐怖", "10402": "音乐", "9648": "悬疑", "10749": "爱情", "878": "科幻",
  "10770": "电视电影", "53": "惊悚", "10752": "战争", "37": "西部",
  "10759": "动作冒险", "10762": "儿童", "10763": "新闻", "10764": "真人秀",
  "10765": "科幻奇幻", "10766": "肥皂剧", "10767": "脱口秀", "10768": "战争政治",
  "35": "喜剧",
};

function genreTitleOf(genreIds) {
  if (!genreIds || !genreIds.length) return "";
  var names = [];
  for (var i = 0; i < genreIds.length; i++) {
    var n = GENRE_NAMES[String(genreIds[i])];
    if (n && names.indexOf(n) < 0) names.push(n);
  }
  return names.slice(0, 3).join("/");
}

// 排序字段归一：movie 用 primary_release_date，tv 用 first_air_date
function applySortBy(params, type) {
  if (!params.sort_by || params.sort_by === "default") {
    delete params.sort_by;
    return;
  }
  var dateField = type === "movie" ? "primary_release_date" : "first_air_date";
  if (params.sort_by === "release_date.desc") params.sort_by = dateField + ".desc";
  else if (params.sort_by === "release_date.asc") params.sort_by = dateField + ".asc";
}

// 把 TMDB 相对路径 /xxx.jpg 拼成完整 https 图床地址。
// 为什么必须拼：首页「海报墙」行（fullWidthPoster）不会替你补图床前缀，
// 只有官方 rex.tmdb 那种内置模块才享受客户端特判；第三方模块给相对路径 → 整行无图/空。
// 参照 RexHome 的 rexHomeNativeImage()：poster 用 w500、backdrop/cover 用 w780。
var IMG_BASE = "https://image.tmdb.org/t/p/";
function imgUrl(path, size) {
  if (!path || typeof path !== "string") return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return IMG_BASE + size + (path.charAt(0) === "/" ? path : "/" + path);
}

// 调 TMDB 接口并把 results 转成 type:"tmdb" 条目。
// 权威契约 = 官方类型定义 @rexnow/libs video.ts + RexHome 的 rexHomeFinishItem()：
//   - id: string（纯数字 "550"）
//   - rating: string（"8.4"）
//   - posterPath: 完整 https URL（w500）
//   - backdropPath: 完整 https URL（w780）
//   - coverUrl: 完整 https URL（兜底，横图位排在 backdrop 之后、竖图位最后）
// 官方 rex.tmdb 明文里给相对路径、数字 id，是客户端对官方模块的特判兜底；
// 第三方模块必须按上面这套回传，否则海报墙整行空白。
async function tmdbFetch(api, params, forceMediaType) {
  var response;
  try {
    response = await Widget.tmdb.get(api, { params: params || {} });
  } catch (e) {
    return [];
  }
  var data = (response && response.results) || [];
  if (!Array.isArray(data)) return [];
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var mediaType = forceMediaType;
    if (!mediaType) {
      mediaType = item.media_type;
      if (mediaType == null) mediaType = item.title ? "movie" : "tv";
    }
    if (mediaType !== "movie" && mediaType !== "tv") continue;
    var poster = imgUrl(item.poster_path, "w500");
    var backdrop = imgUrl(item.backdrop_path, "w780");
    out.push({
      id: String(item.id),
      type: "tmdb",
      title: item.title || item.name,
      description: item.overview,
      releaseDate: item.release_date || item.first_air_date,
      posterPath: poster,
      backdropPath: backdrop,
      coverUrl: poster || backdrop,
      rating: item.vote_average == null ? undefined : String(item.vote_average),
      mediaType: mediaType,
      genreTitle: genreTitleOf(item.genre_ids),
    });
  }
  return out;
}

// 按 tmdb id 去重（movie 与 tv 合并后可能撞 id 的极少数情况）
function dedupeById(items) {
  var seen = {};
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it || it.id == null) continue;
    var key = it.mediaType + ":" + it.id;
    if (seen[key]) continue;
    seen[key] = true;
    out.push(it);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 入口 function：直接走 TMDB 片库（参照官方 rex.bangumi），返回 type:"tmdb" 条目
// ---------------------------------------------------------------------------

// 最新更新：电影 + 剧集按首映/首播日期倒序，合并去重
async function latest(params) {
  var page = parseInt(params.page, 10) || 1;
  var language = params.language || "zh-CN";
  var movie = await tmdbFetch("discover/movie", {
    sort_by: "primary_release_date.desc", page: page, language: language,
    "vote_count.gte": 20, include_adult: false,
  }, "movie");
  var tv = await tmdbFetch("discover/tv", {
    sort_by: "first_air_date.desc", page: page, language: language,
    "vote_count.gte": 20, include_adult: false,
  }, "tv");
  return dedupeById(movie.concat(tv));
}

// 热播榜：本周趋势（电影+剧集）
async function hot(params) {
  var page = parseInt(params.page, 10) || 1;
  var language = params.language || "zh-CN";
  return await tmdbFetch("trending/all/week", {
    page: page, language: language,
  }, null);
}

// 分类：电影 / 连续剧 / 动漫 / 综艺 / 纪录片 / 短剧（映射到 TMDB 片库类型 + 题材）
async function category(params) {
  var cat = params.type || "movie";
  var page = parseInt(params.page, 10) || 1;
  var language = params.language || "zh-CN";
  // 分类 → TMDB 片库映射
  if (cat === "movie") {
    return await tmdbFetch("discover/movie", {
      sort_by: "popularity.desc", page: page, language: language, include_adult: false,
    }, "movie");
  }
  if (cat === "series") {
    return await tmdbFetch("discover/tv", {
      sort_by: "popularity.desc", page: page, language: language, include_adult: false,
    }, "tv");
  }
  if (cat === "anime") {
    return await tmdbFetch("discover/tv", {
      sort_by: "popularity.desc", page: page, language: language,
      with_genres: "16", include_adult: false,
    }, "tv");
  }
  if (cat === "variety") {
    return await tmdbFetch("discover/tv", {
      sort_by: "popularity.desc", page: page, language: language,
      with_genres: "10764", include_adult: false,
    }, "tv");
  }
  if (cat === "documentary") {
    return await tmdbFetch("discover/movie", {
      sort_by: "popularity.desc", page: page, language: language,
      with_genres: "99", include_adult: false,
    }, "movie");
  }
  if (cat === "short") {
    // TMDB 的运行时筛选参数名带点：with_runtime.gte / with_runtime.lte（不是下划线）
    return await tmdbFetch("discover/movie", {
      sort_by: "popularity.desc", page: page, language: language,
      "with_runtime.gte": "1", "with_runtime.lte": "60", include_adult: false,
    }, "movie");
  }
  return [];
}

// 题材：按 TMDB 题材（genre）筛选，可选电影/剧集
async function genre(params) {
  var g = params.genre || "action";
  var page = parseInt(params.page, 10) || 1;
  var language = params.language || "zh-CN";
  // 题材 → TMDB genre_id 映射
  var GENRE_MAP = {
    action: "28", comedy: "35", romance: "10749", scifi: "878", horror: "27",
    drama: "18", war: "10752", ethics: "10749", crime: "80", mystery: "9648",
    family: "10751", adventure: "12", fantasy: "14", history: "36", music: "10402",
  };
  var gid = GENRE_MAP[g] || "28";
  // 动漫/剧集类题材走 tv，其余默认 movie
  var isTv = (g === "jp_kr_anime" || g === "cn_anime" || g === "us_eu_anime");
  var type = isTv ? "tv" : "movie";
  return await tmdbFetch("discover/" + type, {
    sort_by: "popularity.desc", page: page, language: language,
    with_genres: gid, include_adult: false,
  }, type);
}
