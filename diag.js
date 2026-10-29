// 诊断模块 v8.0.0 —— 一次性 26 种「可行写法」对照（全部来自权威源码，不胡编）
//
// 参照来源（每个都实测或官方）：
//   1. ZurlyQin/rex-widgets 的 TMDB 电影精选（README 实机验证「海报显示正常」）→ 本文件主结构照抄它
//   2. @rexnow/douban（Douban Bridge，实测能在 Rex 显示）→ A2 / C2 字符串化写法
//   3. baranwang/rex-widget-libs 官方模板 → A3 全局赋值写法
//   4. @rexnow/libs 的 VideoItem zod schema → B 组 type 合法取值
//
// 用法：每个入口返回 1 个条目，标题前缀 = 变量维度。逐个点开，看哪个「出海报」。
// 绝大多数硬编码（不依赖网络/桥），100% 稳定，隔离出「渲染」变量本身。
// 结论：哪个能出海报，就把那个维度的写法套用到 home.js。

WidgetMetadata = {
  "id": "rex.mi3s.diag",
  "title": "诊断 8.0.0",
  "version": "8.0.0",
  "requiredVersion": "0.0.1",
  "description": "26 种可行写法对照，逐个点开看哪个出海报（A函数形式/B type取值/C id类型/D 图片格式/E 字段/E 网络源）",
  "author": "mi3s",
  "modules": [
    { "id": "A1_zurlyqin", "title": "A1·ZurlyQin原样", "functionName": "A1_zurlyqin", "cacheDuration": 0, "params": [] },
    { "id": "A2_douban", "title": "A2·Douban原样", "functionName": "A2_douban", "cacheDuration": 0, "params": [] },
    { "id": "A3_global", "title": "A3·全局赋值", "functionName": "A3_global", "cacheDuration": 0, "params": [] },
    { "id": "B1_tmdb", "title": "B1·type=tmdb", "functionName": "B1_tmdb", "cacheDuration": 0, "params": [] },
    { "id": "B2_url", "title": "B2·type=url", "functionName": "B2_url", "cacheDuration": 0, "params": [] },
    { "id": "B3_detail", "title": "B3·type=detail", "functionName": "B3_detail", "cacheDuration": 0, "params": [] },
    { "id": "B4_douban", "title": "B4·type=douban", "functionName": "B4_douban", "cacheDuration": 0, "params": [] },
    { "id": "B5_imdb", "title": "B5·type=imdb", "functionName": "B5_imdb", "cacheDuration": 0, "params": [] },
    { "id": "B6_forward", "title": "B6·type=forward", "functionName": "B6_forward", "cacheDuration": 0, "params": [] },
    { "id": "C1_num_num", "title": "C1·数字id+数字rating", "functionName": "C1_num_num", "cacheDuration": 0, "params": [] },
    { "id": "C2_str_str", "title": "C2·字符串id+字符串rating", "functionName": "C2_str_str", "cacheDuration": 0, "params": [] },
    { "id": "C3_num_str", "title": "C3·数字id+字符串rating", "functionName": "C3_num_str", "cacheDuration": 0, "params": [] },
    { "id": "C4_str_num", "title": "C4·字符串id+数字rating", "functionName": "C4_str_num", "cacheDuration": 0, "params": [] },
    { "id": "C5_norating", "title": "C5·无rating字段", "functionName": "C5_norating", "cacheDuration": 0, "params": [] },
    { "id": "D1_relative", "title": "D1·相对路径poster", "functionName": "D1_relative", "cacheDuration": 0, "params": [] },
    { "id": "D2_fullurl", "title": "D2·完整URL poster", "functionName": "D2_fullurl", "cacheDuration": 0, "params": [] },
    { "id": "D3_coverUrl", "title": "D3·coverUrl字段", "functionName": "D3_coverUrl", "cacheDuration": 0, "params": [] },
    { "id": "D4_nobackdrop", "title": "D4·无backdrop", "functionName": "D4_nobackdrop", "cacheDuration": 0, "params": [] },
    { "id": "E1_minimal", "title": "E1·最简字段", "functionName": "E1_minimal", "cacheDuration": 0, "params": [] },
    { "id": "E2_full", "title": "E2·全字段", "functionName": "E2_full", "cacheDuration": 0, "params": [] },
    { "id": "E3_genre", "title": "E3·带genreTitle", "functionName": "E3_genre", "cacheDuration": 0, "params": [] },
    { "id": "F1_tmdb_discover", "title": "F1·Widget.tmdb取片", "functionName": "F1_tmdb_discover", "cacheDuration": 0, "params": [] },
    { "id": "F2_ai_backend", "title": "F2·AI后端取片", "functionName": "F2_ai_backend", "cacheDuration": 0, "params": [] },
    { "id": "G1_tv", "title": "G1·mediaType=tv", "functionName": "G1_tv", "cacheDuration": 0, "params": [] },
    { "id": "G2_int_rating", "title": "G2·rating整数", "functionName": "G2_int_rating", "cacheDuration": 0, "params": [] },
    { "id": "G3_nodesc", "title": "G3·无description", "functionName": "G3_nodesc", "cacheDuration": 0, "params": [] },
  ],
};

// 几张已知可用的 TMDB 相对路径海报（循环复用，标题才是区分标识）
var P_FC = "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg";   // 搏击俱乐部
var P_GF = "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg";   // 教父
var P_TDK = "/qJ2tW6WMUDux911r6m7haRef0WH.jpg";  // 蝙蝠侠：黑暗骑士
var B_FC = "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg";   // 搏击俱乐部背景

// ── A 组：函数暴露形式 ──────────────────────────────────────────────
// A1：ZurlyQin 原样 = async function 声明 + 数字 id + 数字 rating + type=tmdb + 相对路径
async function A1_zurlyqin(params) {
  return [{
    id: 550,
    type: "tmdb",
    mediaType: "movie",
    title: "A1·ZurlyQin原样",
    description: "TMDB电影精选同款：数字id/数字rating/相对路径",
    posterPath: P_FC,
    backdropPath: B_FC,
    releaseDate: "1999-10-15",
    rating: 8.4
  }];
}

// A2：Douban 原样 = async function 声明 + 字符串 id + 字符串 rating + type=tmdb + 相对路径
async function A2_douban(params) {
  return [{
    id: "550",
    type: "tmdb",
    mediaType: "movie",
    title: "A2·Douban原样",
    description: "Douban桥同款：字符串id/字符串rating/相对路径",
    posterPath: P_GF,
    backdropPath: B_FC,
    releaseDate: "1972-03-24",
    rating: "8.7"
  }];
}

// A3：全局赋值 = xxx = async function，其余同 ZurlyQin
A3_global = async function (params) {
  return [{
    id: 550,
    type: "tmdb",
    mediaType: "movie",
    title: "A3·全局赋值",
    description: "官方模板 testFunction 同款全局赋值",
    posterPath: P_FC,
    backdropPath: B_FC,
    releaseDate: "1999-10-15",
    rating: 8.4
  }];
};

// ── B 组：type 字段合法取值（@rexnow/libs schema） ───────────────────
async function B1_tmdb(params) {
  return [{ id: 550, type: "tmdb", title: "B1·type=tmdb", posterPath: P_FC, rating: 8.4, mediaType: "movie" }];
}
async function B2_url(params) {
  return [{ id: "550", type: "url", title: "B2·type=url", url: "https://www.themoviedb.org/movie/550", posterPath: P_FC, rating: "8.4" }];
}
async function B3_detail(params) {
  return [{ id: "550", type: "detail", title: "B3·type=detail", url: "https://www.themoviedb.org/movie/550", posterPath: P_FC, rating: "8.4" }];
}
async function B4_douban(params) {
  return [{ id: "1292052", type: "douban", title: "B4·type=douban", posterPath: P_GF, rating: "9.7" }];
}
async function B5_imdb(params) {
  return [{ id: "tt0111161", type: "imdb", title: "B5·type=imdb", posterPath: P_GF, rating: "9.3" }];
}
async function B6_forward(params) {
  return [{ id: "550", type: "forward", title: "B6·type=forward", url: "https://www.themoviedb.org/movie/550", posterPath: P_FC, rating: "8.4" }];
}

// ── C 组：id / rating 类型 ───────────────────────────────────────────
async function C1_num_num(params) {
  return [{ id: 550, type: "tmdb", title: "C1·数字id+数字rating", posterPath: P_FC, rating: 8.4, mediaType: "movie" }];
}
async function C2_str_str(params) {
  return [{ id: "550", type: "tmdb", title: "C2·字符串id+字符串rating", posterPath: P_FC, rating: "8.4", mediaType: "movie" }];
}
async function C3_num_str(params) {
  return [{ id: 550, type: "tmdb", title: "C3·数字id+字符串rating", posterPath: P_FC, rating: "8.4", mediaType: "movie" }];
}
async function C4_str_num(params) {
  return [{ id: "550", type: "tmdb", title: "C4·字符串id+数字rating", posterPath: P_FC, rating: 8.4, mediaType: "movie" }];
}
async function C5_norating(params) {
  return [{ id: 550, type: "tmdb", title: "C5·无rating字段", posterPath: P_FC, mediaType: "movie" }];
}

// ── D 组：海报字段格式 ───────────────────────────────────────────────
async function D1_relative(params) {
  return [{ id: 550, type: "tmdb", title: "D1·相对路径poster", posterPath: P_FC, mediaType: "movie", rating: 8.4 }];
}
async function D2_fullurl(params) {
  return [{ id: 550, type: "tmdb", title: "D2·完整URL poster", posterPath: "https://image.tmdb.org/t/p/w500" + P_FC, mediaType: "movie", rating: 8.4 }];
}
async function D3_coverUrl(params) {
  return [{ id: 550, type: "tmdb", title: "D3·coverUrl字段", coverUrl: "https://image.tmdb.org/t/p/w500" + P_FC, mediaType: "movie", rating: 8.4 }];
}
async function D4_nobackdrop(params) {
  return [{ id: 550, type: "tmdb", title: "D4·无backdrop", posterPath: P_FC, mediaType: "movie", rating: 8.4 }];
}

// ── E 组：字段完整度 ─────────────────────────────────────────────────
async function E1_minimal(params) {
  return [{ id: 550, type: "tmdb", title: "E1·最简(仅id/type/title/poster)", posterPath: P_FC }];
}
async function E2_full(params) {
  return [{
    id: 550, type: "tmdb", mediaType: "movie",
    title: "E2·全字段",
    description: "完整描述文字",
    posterPath: P_FC, backdropPath: B_FC,
    releaseDate: "1999-10-15", rating: 8.4
  }];
}
async function E3_genre(params) {
  return [{
    id: 550, type: "tmdb", mediaType: "movie",
    title: "E3·带genreTitle",
    posterPath: P_FC, backdropPath: B_FC,
    releaseDate: "1999-10-15", rating: 8.4,
    genreTitle: "剧情 / 动作"
  }];
}

// ── F 组：网络取片（成品数据源，失败时回退硬编码条目以区分「网络」与「渲染」） ──
async function F1_tmdb_discover(params) {
  try {
    var response = await Widget.tmdb.get("discover/movie", {
      params: { language: "zh-CN", include_adult: false, include_video: false, sort_by: "popularity.desc", page: 1 }
    });
    if (!response || !Array.isArray(response.results) || !response.results.length) {
      throw new Error("TMDB 返回空");
    }
    var out = [];
    for (var i = 0; i < Math.min(5, response.results.length); i++) {
      var m = response.results[i];
      out.push({
        id: m.id, type: "tmdb", mediaType: "movie",
        title: "F1·" + (m.title || m.original_title || "未命名"),
        description: m.overview || "",
        posterPath: m.poster_path || "", backdropPath: m.backdrop_path || "",
        releaseDate: m.release_date || "", rating: Number(m.vote_average) || 0
      });
    }
    return out;
  } catch (e) {
    return [{ id: 550, type: "tmdb", title: "F1失败:" + (e.message || e), posterPath: P_FC, rating: 0 }];
  }
}

async function F2_ai_backend(params) {
  try {
    var response = await Widget.http.post(
      "https://api.rexnow.tv/api/discovery/ai-search/search",
      { query: "最近热门电影", userId: "", language: "zh-CN" },
      { headers: { "Content-Type": "application/json" } }
    );
    var data = response.data;
    if (!data || !data.success || !Array.isArray(data.data) || !data.data.length) {
      throw new Error((data && data.message) || "AI 后端返回空");
    }
    var out = [];
    for (var i = 0; i < Math.min(5, data.data.length); i++) {
      var it = data.data[i];
      out.push({
        id: it.id, type: it.type || "tmdb", mediaType: it.mediaType || "movie",
        title: "F2·" + (it.title || ""),
        description: it.description || "",
        posterPath: it.posterPath || "", backdropPath: it.backdropPath || "",
        releaseDate: it.releaseDate || "", rating: it.rating
      });
    }
    return out;
  } catch (e) {
    return [{ id: 550, type: "tmdb", title: "F2失败:" + (e.message || e), posterPath: P_FC, rating: 0 }];
  }
}

// ── G 组：附加维度 ───────────────────────────────────────────────────
async function G1_tv(params) {
  return [{ id: 1399, type: "tmdb", mediaType: "tv", title: "G1·mediaType=tv", posterPath: P_GF, rating: 8.9, releaseDate: "2011-04-17" }];
}
async function G2_int_rating(params) {
  return [{ id: 550, type: "tmdb", title: "G2·rating整数", posterPath: P_FC, rating: 8, mediaType: "movie" }];
}
async function G3_nodesc(params) {
  return [{ id: 550, type: "tmdb", title: "G3·无description", posterPath: P_FC, rating: 8.4, mediaType: "movie" }];
}
