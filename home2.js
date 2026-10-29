WidgetMetadata = {
  "id": "app.mi3s.homes2",
  "title": "高清片源聚合2",
  "version": "2.0.0",
  "requiredVersion": "0.0.1",
  "description": "TMDB 榜单片单。前三个入口是同三组静态数据，只差一个变量，用来锁定渲染层到底要什么。",
  "author": "mi3s",
  "site": "https://github.com/mi3suuu/rex-hires",
  "modules": [
    {
      "id": "rel",
      "title": "静态A·字符串ID",
      "functionName": "rel",
      "description": "豆瓣桥同款：id 用字符串、rating 用字符串、相对海报路径。",
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
      "id": "num",
      "title": "静态B·数字ID",
      "functionName": "num",
      "description": "成品同款：id 用数字、rating 用数字、相对海报路径。",
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
      "id": "abs",
      "title": "静态C·绝对海报URL",
      "functionName": "abs",
      "description": "海报给整条 https 地址，同时带 coverUrl / posterUrl / thumbnailUrl，绕开一切前缀拼接。",
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

var STATIC = [
  { tmdb: 550, title: "搏击俱乐部", date: "1999-10-15", vote: 8.438, poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", back: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg" },
  { tmdb: 238, title: "教父", date: "1972-03-24", vote: 8.709, poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", back: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg" },
  { tmdb: 278, title: "肖申克的救赎", date: "1994-09-23", vote: 8.712, poster: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", back: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg" },
  { tmdb: 129, title: "千与千寻", date: "2001-07-20", vote: 8.538, poster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", back: "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg" }
];

var IMG = "https://image.tmdb.org/t/p/w500";

function absUrl(path) {
  if (!path) return "";
  if (path.indexOf("http") === 0) return path;
  return IMG + path;
}

function logCount(tag, items) {
  console.log("[" + tag + "] 返回 " + items.length + " 条；首条 id=" + JSON.stringify(items[0] && items[0].id) + " (" + typeof (items[0] && items[0].id) + ")，posterLength=" + String(items[0] && items[0].posterPath ? items[0].posterPath.length : 0));
}

async function rel(params) {
  var items = STATIC.map(function (m) {
    return {
      id: String(m.tmdb),
      type: "tmdb",
      mediaType: "movie",
      title: m.title,
      releaseDate: m.date,
      rating: String(m.vote),
      posterPath: m.poster,
      backdropPath: m.back
    };
  });
  logCount("静态A", items);
  return items;
}

async function num(params) {
  var items = STATIC.map(function (m) {
    return {
      id: m.tmdb,
      type: "tmdb",
      mediaType: "movie",
      title: m.title,
      description: m.title + "（静态测试条目）",
      posterPath: m.poster,
      backdropPath: m.back,
      releaseDate: m.date,
      rating: m.vote
    };
  });
  logCount("静态B", items);
  return items;
}

async function abs(params) {
  var items = STATIC.map(function (m) {
    return {
      id: String(m.tmdb),
      type: "tmdb",
      mediaType: "movie",
      title: m.title,
      description: m.title + "（绝对海报 URL）",
      posterPath: absUrl(m.poster),
      backdropPath: absUrl(m.back),
      coverUrl: absUrl(m.poster),
      posterUrl: absUrl(m.poster),
      thumbnailUrl: absUrl(m.poster),
      releaseDate: m.date,
      rating: String(m.vote)
    };
  });
  logCount("静态C", items);
  return items;
}

function pageOption(value) {
  var page = Number(value);
  if (!isFinite(page) || page < 1) return 1;
  if (page > 500) return 500;
  return Math.floor(page);
}

function videoItem(movie, mediaType) {
  return {
    id: String(movie.id),
    type: "tmdb",
    mediaType: mediaType,
    title: movie.title || movie.name || movie.original_title || "未命名",
    description: movie.overview || "",
    posterPath: movie.poster_path || "",
    backdropPath: movie.backdrop_path || "",
    releaseDate: movie.release_date || movie.first_air_date || "",
    rating: String(Number(movie.vote_average) || 0)
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
    var items = [];
    for (var i = 0; i < response.results.length; i++) {
      var movie = response.results[i];
      if (!movie || !movie.id) continue;
      if (!(movie.title || movie.name || movie.original_title)) continue;
      items.push(videoItem(movie, mediaType));
    }
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
