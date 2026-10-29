WidgetMetadata = {
  "id": "app.mi3s.homes2",
  "title": "高清片源聚合2",
  "version": "1.0.3",
  "requiredVersion": "0.0.1",
  "description": "TMDB 榜单片单：热门电影、最新电影、高分电影、热门剧集。",
  "author": "mi3s",
  "site": "https://github.com/mi3suuu/rex-hires",
  "modules": [
    {
      "id": "env",
      "title": "环境探针（看JS日志）",
      "functionName": "env",
      "description": "把运行环境、Widget API、收到的参数全部写进 JS日志，同时返回 3 条硬编码条目。",
      "cacheDuration": 0,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        }
      ]
    },
    {
      "id": "sample",
      "title": "静态样片（不联网）",
      "functionName": "sample",
      "description": "完全不走网络，写死 6 部电影。用来区分是网络问题还是渲染问题。",
      "cacheDuration": 0,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        }
      ]
    },
    {
      "id": "popular",
      "title": "热门电影",
      "functionName": "popular",
      "description": "TMDB 热门电影，按热度倒序。",
      "cacheDuration": 0,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        },
        {
          "name": "language",
          "title": "资料语言",
          "type": "language",
          "value": "zh-CN"
        }
      ]
    },
    {
      "id": "latest",
      "title": "最新电影",
      "functionName": "latest",
      "description": "TMDB 最新电影，按首次上映日期倒序。",
      "cacheDuration": 0,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        },
        {
          "name": "language",
          "title": "资料语言",
          "type": "language",
          "value": "zh-CN"
        }
      ]
    },
    {
      "id": "topRated",
      "title": "高分电影",
      "functionName": "topRated",
      "description": "TMDB 高分电影，按评分倒序，评价人数不少于 200。",
      "cacheDuration": 0,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        },
        {
          "name": "language",
          "title": "资料语言",
          "type": "language",
          "value": "zh-CN"
        }
      ]
    },
    {
      "id": "tvPopular",
      "title": "热门剧集",
      "functionName": "tvPopular",
      "description": "TMDB 热门剧集，按热度倒序。",
      "cacheDuration": 0,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        },
        {
          "name": "language",
          "title": "资料语言",
          "type": "language",
          "value": "zh-CN"
        }
      ]
    }
  ]
};

function pageOption(value) {
  var page = Number(value);
  if (!isFinite(page) || page < 1) return 1;
  if (page > 500) return 500;
  return Math.floor(page);
}

function videoItem(movie, mediaType) {
  return {
    id: movie.id,
    type: "tmdb",
    mediaType: mediaType,
    title: movie.title || movie.name || movie.original_title || "未命名",
    description: movie.overview || "",
    posterPath: movie.poster_path || "",
    backdropPath: movie.backdrop_path || "",
    releaseDate: movie.release_date || movie.first_air_date || "",
    rating: Number(movie.vote_average) || 0
  };
}

async function discover(api, query, params, mediaType, tag) {
  var request = {
    language: (params && params.language) || "zh-CN",
    page: pageOption(params && params.page),
    include_adult: false,
    include_video: false
  };
  for (var key in query) request[key] = query[key];
  try {
    var response = await Widget.tmdb.get(api, { params: request });
    if (!response || !Array.isArray(response.results) || response.success === false) {
      throw new Error("TMDB 返回异常，请检查 Rex 的 TMDB 网络设置后重试");
    }
    var items = response.results.filter(function (movie) {
      return movie && movie.id && (movie.title || movie.name || movie.original_title);
    }).map(function (movie) {
      return videoItem(movie, mediaType);
    });
    console.log("[" + tag + "] 第 " + request.page + " 页：" + items.length + " 部");
    return items;
  } catch (error) {
    console.error("[" + tag + "] " + (error && error.message ? error.message : error));
    throw error;
  }
}

async function popular(params) {
  return discover("discover/movie", { sort_by: "popularity.desc" }, params, "movie", "热门电影");
}

async function latest(params) {
  return discover("discover/movie", { sort_by: "primary_release_date.desc" }, params, "movie", "最新电影");
}

async function topRated(params) {
  return discover("discover/movie", { sort_by: "vote_average.desc", "vote_count.gte": 200 }, params, "movie", "高分电影");
}

async function tvPopular(params) {
  return discover("discover/tv", { sort_by: "popularity.desc" }, params, "tv", "热门剧集");
}

async function env(params) {
  try {
    console.log("[探针] 模块已加载，WidgetMetadata.id = " + String(WidgetMetadata && WidgetMetadata.id));
    console.log("[探针] 收到参数 = " + JSON.stringify(params || null));
    var keys = [];
    try { keys = Object.keys(Widget || {}); } catch (e1) { keys = ["Object.keys(Widget) 抛错: " + e1]; }
    console.log("[探针] Widget 上的成员 = " + keys.join(","));
    console.log("[探针] typeof tmdb=" + typeof (Widget && Widget.tmdb) + " http=" + typeof (Widget && Widget.http) + " storage=" + typeof (Widget && Widget.storage) + " sharedCache=" + typeof (Widget && Widget.sharedCache) + " html=" + typeof (Widget && Widget.html) + " i18n=" + typeof (Widget && Widget.i18n));
    if (Widget && Widget.tmdb && typeof Widget.tmdb.get === "function") {
      try {
        var probe = await Widget.tmdb.get("movie/550", { params: { language: "zh-CN" } });
        console.log("[探针] TMDB 直连测试 OK，返回 title=" + String(probe && (probe.title || probe.name)) + " poster=" + String(probe && probe.poster_path));
      } catch (e2) {
        console.error("[探针] TMDB 直连测试失败: " + (e2 && e2.message ? e2.message : e2));
      }
    } else {
      console.error("[探针] Widget.tmdb 不可用");
    }
  } catch (e0) {
    console.error("[探针] 异常: " + (e0 && e0.message ? e0.message : e0));
  }
  return [
    { id: 550, type: "tmdb", mediaType: "movie", title: "探针·搏击俱乐部", description: "探针返回的第 1 条", posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", releaseDate: "1999-10-15", rating: 8.438 },
    { id: 238, type: "tmdb", mediaType: "movie", title: "探针·教父", description: "探针返回的第 2 条", posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdropPath: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", releaseDate: "1972-03-24", rating: 8.709 },
    { id: 278, type: "tmdb", mediaType: "movie", title: "探针·肖申克的救赎", description: "探针返回的第 3 条", posterPath: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdropPath: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg", releaseDate: "1994-09-23", rating: 8.712 }
  ];
}

async function sample(params) {
  var items = [
    { id: 550, type: "tmdb", mediaType: "movie", title: "搏击俱乐部", description: "一个人厌倦了自己的工作。", posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", releaseDate: "1999-10-15", rating: 8.438 },
    { id: 238, type: "tmdb", mediaType: "movie", title: "教父", description: "教父的传奇故事。", posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdropPath: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", releaseDate: "1972-03-24", rating: 8.709 },
    { id: 278, type: "tmdb", mediaType: "movie", title: "肖申克的救赎", description: "希望是美好的事物。", posterPath: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdropPath: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg", releaseDate: "1994-09-23", rating: 8.712 },
    { id: 129, type: "tmdb", mediaType: "movie", title: "千与千寻", description: "宫崎骏作品。", posterPath: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", backdropPath: "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg", releaseDate: "2001-07-20", rating: 8.538 },
    { id: 155, type: "tmdb", mediaType: "movie", title: "蝙蝠侠：黑暗骑士", description: "小丑登场。", posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdropPath: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", releaseDate: "2008-07-16", rating: 8.512 },
    { id: 496243, type: "tmdb", mediaType: "movie", title: "寄生虫", description: "两个家庭的故事。", posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdropPath: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg", releaseDate: "2019-05-30", rating: 8.503 }
  ];
  console.log("[静态样片] " + items.length + " 部");
  return items;
}
