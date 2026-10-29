WidgetMetadata = {
  "id": "rex.tmdb.mi3smirror",
  "title": "TMDB 电影精选（镜像对照）",
  "version": "1.0.0",
  "requiredVersion": "0.0.1",
  "description": "最新华语、最新外语、高分华语、高分香港、高分外语；全部来自 TMDB。",
  "author": "Julian",
  "site": "https://www.themoviedb.org",
  "modules": [
    {
      "id": "latestChinese",
      "title": "最新华语电影",
      "functionName": "latestChinese",
      "description": "按首次上映日期倒序，排除未来上映。原始语言：普通话或粤语。",
      "cacheDuration": 1800,
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
        },
        {
          "name": "minVotes",
          "title": "最低评价人数",
          "type": "enumeration",
          "value": "10",
          "enumOptions": [
            {
              "title": "0 人",
              "value": "0"
            },
            {
              "title": "10 人",
              "value": "10"
            },
            {
              "title": "50 人",
              "value": "50"
            },
            {
              "title": "100 人",
              "value": "100"
            },
            {
              "title": "300 人",
              "value": "300"
            },
            {
              "title": "500 人",
              "value": "500"
            },
            {
              "title": "1000 人",
              "value": "1000"
            }
          ]
        }
      ]
    },
    {
      "id": "latestForeign",
      "title": "最新外语电影",
      "functionName": "latestForeign",
      "description": "按首次上映日期倒序，排除未来上映。排除普通话、粤语及无语言标记影片。",
      "cacheDuration": 1800,
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
        },
        {
          "name": "minVotes",
          "title": "最低评价人数",
          "type": "enumeration",
          "value": "10",
          "enumOptions": [
            {
              "title": "0 人",
              "value": "0"
            },
            {
              "title": "10 人",
              "value": "10"
            },
            {
              "title": "50 人",
              "value": "50"
            },
            {
              "title": "100 人",
              "value": "100"
            },
            {
              "title": "300 人",
              "value": "300"
            },
            {
              "title": "500 人",
              "value": "500"
            },
            {
              "title": "1000 人",
              "value": "1000"
            }
          ]
        }
      ]
    },
    {
      "id": "topChinese",
      "title": "高分华语电影",
      "functionName": "topChinese",
      "description": "按 TMDB 评分倒序，默认至少 7 分。原始语言：普通话或粤语。",
      "cacheDuration": 1800,
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
        },
        {
          "name": "minVotes",
          "title": "最低评价人数",
          "type": "enumeration",
          "value": "100",
          "enumOptions": [
            {
              "title": "0 人",
              "value": "0"
            },
            {
              "title": "10 人",
              "value": "10"
            },
            {
              "title": "50 人",
              "value": "50"
            },
            {
              "title": "100 人",
              "value": "100"
            },
            {
              "title": "300 人",
              "value": "300"
            },
            {
              "title": "500 人",
              "value": "500"
            },
            {
              "title": "1000 人",
              "value": "1000"
            }
          ]
        },
        {
          "name": "minRating",
          "title": "最低 TMDB 评分",
          "type": "enumeration",
          "value": "7",
          "enumOptions": [
            {
              "title": "6 分",
              "value": "6"
            },
            {
              "title": "6.5 分",
              "value": "6.5"
            },
            {
              "title": "7 分",
              "value": "7"
            },
            {
              "title": "7.5 分",
              "value": "7.5"
            },
            {
              "title": "8 分",
              "value": "8"
            },
            {
              "title": "8.5 分",
              "value": "8.5"
            }
          ]
        }
      ]
    },
    {
      "id": "topHongKong",
      "title": "高分香港电影",
      "functionName": "topHongKong",
      "description": "按 TMDB 评分倒序，默认至少 7 分。出品地区：香港（含合拍）。",
      "cacheDuration": 1800,
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
        },
        {
          "name": "minVotes",
          "title": "最低评价人数",
          "type": "enumeration",
          "value": "100",
          "enumOptions": [
            {
              "title": "0 人",
              "value": "0"
            },
            {
              "title": "10 人",
              "value": "10"
            },
            {
              "title": "50 人",
              "value": "50"
            },
            {
              "title": "100 人",
              "value": "100"
            },
            {
              "title": "300 人",
              "value": "300"
            },
            {
              "title": "500 人",
              "value": "500"
            },
            {
              "title": "1000 人",
              "value": "1000"
            }
          ]
        },
        {
          "name": "minRating",
          "title": "最低 TMDB 评分",
          "type": "enumeration",
          "value": "7",
          "enumOptions": [
            {
              "title": "6 分",
              "value": "6"
            },
            {
              "title": "6.5 分",
              "value": "6.5"
            },
            {
              "title": "7 分",
              "value": "7"
            },
            {
              "title": "7.5 分",
              "value": "7.5"
            },
            {
              "title": "8 分",
              "value": "8"
            },
            {
              "title": "8.5 分",
              "value": "8.5"
            }
          ]
        }
      ]
    },
    {
      "id": "topForeign",
      "title": "高分外语电影",
      "functionName": "topForeign",
      "description": "按 TMDB 评分倒序，默认至少 7 分。排除普通话、粤语及无语言标记影片。",
      "cacheDuration": 1800,
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
        },
        {
          "name": "minVotes",
          "title": "最低评价人数",
          "type": "enumeration",
          "value": "500",
          "enumOptions": [
            {
              "title": "0 人",
              "value": "0"
            },
            {
              "title": "10 人",
              "value": "10"
            },
            {
              "title": "50 人",
              "value": "50"
            },
            {
              "title": "100 人",
              "value": "100"
            },
            {
              "title": "300 人",
              "value": "300"
            },
            {
              "title": "500 人",
              "value": "500"
            },
            {
              "title": "1000 人",
              "value": "1000"
            }
          ]
        },
        {
          "name": "minRating",
          "title": "最低 TMDB 评分",
          "type": "enumeration",
          "value": "7",
          "enumOptions": [
            {
              "title": "6 分",
              "value": "6"
            },
            {
              "title": "6.5 分",
              "value": "6.5"
            },
            {
              "title": "7 分",
              "value": "7"
            },
            {
              "title": "7.5 分",
              "value": "7.5"
            },
            {
              "title": "8 分",
              "value": "8"
            },
            {
              "title": "8.5 分",
              "value": "8.5"
            }
          ]
        }
      ]
    }
  ]
};

// Rex / Forward bridge only. No embedded API key or external service.
// Each source has an independent cursor. Merge before slicing into 20-item pages.
// This avoids missed films and interleaved ordering when combining zh and cn.
async function latestChinese(params) { return movieCollection(params, "latestChinese", "latest", "chinese", 10); }
async function latestForeign(params) { return movieCollection(params, "latestForeign", "latest", "foreign", 10); }
async function topChinese(params) { return movieCollection(params, "topChinese", "top", "chinese", 100); }
async function topHongKong(params) { return movieCollection(params, "topHongKong", "top", "hongkong", 100); }
async function topForeign(params) { return movieCollection(params, "topForeign", "top", "foreign", 500); }

function numberOption(value, fallback, min, max) {
  if (value === undefined || value === null || value === "") return fallback;
  var number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error("筛选参数超出范围");
  return number;
}
function chinaToday() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
function chineseLanguage(language) { return language === "zh" || language === "cn"; }
function validMovie(movie, area, query) {
  if (!movie || !Number.isInteger(movie.id) || movie.id <= 0 || movie.adult) return false;
  if (!movie.release_date || movie.release_date > query["primary_release_date.lte"]) return false;
  if (Number(movie.vote_count || 0) < query["vote_count.gte"]) return false;
  if (Number(movie.vote_average || 0) < (query["vote_average.gte"] || 0)) return false;
  if (area === "chinese") return chineseLanguage(movie.original_language);
  if (area === "foreign") return !!movie.original_language && movie.original_language !== "xx" && !chineseLanguage(movie.original_language);
  return true; // HK origin is filtered server-side; discover does not always return origin_country.
}
function videoItem(movie) {
  return {
    id: movie.id,
    type: "tmdb",
    mediaType: "movie",
    title: movie.title || movie.original_title || "未命名电影",
    description: movie.overview || "",
    posterPath: movie.poster_path || "",
    backdropPath: movie.backdrop_path || "",
    releaseDate: movie.release_date || "",
    rating: Number(movie.vote_average) || 0
  };
}
function readCollectionCache(key, signature) {
  try {
    if (!Widget.storage) return null;
    var raw = Widget.storage.get(key);
    var value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (value && value.signature === signature && Date.now() - value.createdAt < 1800000 && Array.isArray(value.items) && Array.isArray(value.streams)) {
      // Never mutate a storage object before a request has completed successfully.
      return JSON.parse(JSON.stringify(value));
    }
  } catch (_) { /* cache is optional */ }
  return null;
}
function writeCollectionCache(key, state) {
  try { if (Widget.storage) Widget.storage.set(key, JSON.stringify(state)); }
  catch (_) { /* storage full/unavailable: results are still usable */ }
}
async function fillMovieStream(stream, query, area) {
  while (!stream.buffer.length && !stream.done) {
    var request = Object.assign({}, query, { page: stream.nextPage });
    if (stream.language) request.with_original_language = stream.language;
    var response = await Widget.tmdb.get("discover/movie", { params: request });
    if (!response || !Array.isArray(response.results) || response.success === false) {
      throw new Error("TMDB 返回异常，请检查 Rex 的 TMDB 网络设置后重试");
    }
    var totalPages = Number(response.total_pages);
    // A missing/invalid total_pages should not silently truncate the list.
    if (!Number.isFinite(totalPages) || totalPages < 0) throw new Error("TMDB 分页信息异常");
    stream.nextPage += 1;
    stream.done = !response.results.length || stream.nextPage > Math.min(500, totalPages);
    stream.buffer = response.results.filter(function (movie) { return validMovie(movie, area, query); });
  }
}
function precedesMovie(a, b, kind) {
  // Preserve TMDB's ordering for equal primary sort keys.
  return kind === "latest" ? a.release_date > b.release_date : Number(a.vote_average) > Number(b.vote_average);
}
async function movieCollection(params, key, kind, area, defaultVotes) {
  params = params || {};
  try {
    var page = numberOption(params.page, 1, 1, 500);
    if (!Number.isInteger(page)) throw new Error("页码必须是整数");
    var query = {
      language: params.language || "zh-CN",
      include_adult: false,
      include_video: false,
      sort_by: kind === "latest" ? "primary_release_date.desc" : "vote_average.desc",
      "primary_release_date.lte": chinaToday(),
      "vote_count.gte": numberOption(params.minVotes, defaultVotes, 0, 1000000)
    };
    if (kind === "top") query["vote_average.gte"] = numberOption(params.minRating, 7, 0, 10);
    if (area === "hongkong") query.with_origin_country = "HK";
    if (params.genreId) query.with_genres = String(params.genreId);
    if (params.peopleId) query.with_people = String(params.peopleId);
    var signature = JSON.stringify(query);
    var storageKey = "rex.moviecollections.v1." + key;
    var state = readCollectionCache(storageKey, signature) || {
      signature: signature, createdAt: Date.now(), items: [], seen: {},
      streams: (area === "chinese" ? ["zh", "cn"] : [""]).map(function (language) {
        return { language: language, nextPage: 1, buffer: [], done: false };
      })
    };
    var target = page * 20;
    while (state.items.length < target) {
      // At most two independent requests in flight; failures preserve the last good cache.
      await Promise.all(state.streams.map(function (stream) { return fillMovieStream(stream, query, area); }));
      var selected = null;
      state.streams.forEach(function (stream) {
        if (stream.buffer.length && (!selected || precedesMovie(stream.buffer[0], selected.buffer[0], kind))) selected = stream;
      });
      if (!selected) break;
      var movie = selected.buffer.shift();
      if (!state.seen[movie.id]) {
        state.seen[movie.id] = true;
        state.items.push(videoItem(movie));
      }
    }
    // Five bounded cache slots, one per category; changes of filters replace a slot.
    writeCollectionCache(storageKey, state);
    var result = state.items.slice((page - 1) * 20, target);
    console.log("[TMDB 电影精选] " + key + " 第 " + page + " 页：" + result.length + " 部");
    return result;
  } catch (error) {
    console.error("[TMDB 电影精选] " + key + "：" + (error.message || error));
    throw error;
  }
}
