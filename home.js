// ============================================================================
// Rex 首页聚合模块 · 高清片源（app.mi3s.homes）
// ----------------------------------------------------------------------------
// video 类型模块：在 Rex「首页推荐源」提供聚合片单与分类浏览。
//
// 严格对齐 Rex 官方 video 模块（rex.tmdb / rex.bangumi）的写法与官方类型定义
// （@rexnow/libs env.d.ts）：
//   - modules[] 不写 type 字段（缺省即 video 类型）
//   - function 返回 VideoItem[]：{id, type:"tmdb", title, posterPath, backdropPath,
//     releaseDate, rating, mediaType, genreTitle, description}
//   - 只用 Widget.http.get（Rex 运行时提供），绝不用 fetch / setTimeout / .finally / new Promise
//   - 超时用 Widget.http 的 timeout 选项；并发用 Promise.all
//
// 点进条目后，Rex 会把条目的 title（片名）作为 params.title 传给 stream 模块
// （app.mi3s.hires 的 loadResource），由它去 28 个 CMS 源搜真实播放地址。
//
// 分类策略（参照 LibreTV 的二开实现 + 逐源探测结果）：
//   主流影视源（非凡/光速/量子/巨量/虎牙/360/爱奇艺/暴风/bycj）有标准苹果CMS
//   两级分类树（?ac=list 返回 class 数组，type_pid=0 一级、≠0 二级题材）。
//   这里把「一级分类 → 各源 type_id」硬编码成映射表（逐源探测得到），
//   二级题材按「题材名 → 各源 type_id」同样硬编码，跨源统一成标准题材。
// ============================================================================

WidgetMetadata = {
  id: "app.mi3s.homes",
  title: "高清片源聚合",
  description: "聚合 28 个 CMS 源的首页片单：最新更新、热播榜、电影/连续剧/综艺/动漫分类及二级题材，点进即出播放地址",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      id: "latest",
      title: "最新更新",
      functionName: "latest",
      description: "28 个 CMS 源最新更新片单聚合，按更新时间倒序去重",
      cacheDuration: 300,
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "hot",
      title: "热播榜",
      functionName: "hot",
      description: "按播放热度聚合的片单",
      cacheDuration: 600,
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "category",
      title: "分类",
      functionName: "category",
      description: "电影 / 连续剧 / 综艺 / 动漫 / 短剧 / 纪录片 六大分类，跨源聚合",
      cacheDuration: 300,
      params: [
        {
          name: "type",
          title: "分类",
          type: "enumeration",
          enumOptions: [
            { title: "电影", value: "movie" },
            { title: "连续剧", value: "series" },
            { title: "综艺", value: "variety" },
            { title: "动漫", value: "anime" },
            { title: "短剧", value: "short" },
            { title: "纪录片", value: "documentary" },
          ],
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "genre",
      title: "题材",
      functionName: "genre",
      description: "二级题材：动作 / 喜剧 / 爱情 / 科幻 / 恐怖 / 剧情 / 战争 / 伦理 / 地区剧集等",
      cacheDuration: 300,
      params: [
        {
          name: "genre",
          title: "题材",
          type: "enumeration",
          enumOptions: [
            { title: "动作片", value: "action" },
            { title: "喜剧片", value: "comedy" },
            { title: "爱情片", value: "romance" },
            { title: "科幻片", value: "scifi" },
            { title: "恐怖片", value: "horror" },
            { title: "剧情片", value: "drama" },
            { title: "战争片", value: "war" },
            { title: "伦理片", value: "ethics" },
            { title: "国产剧", value: "cn_drama" },
            { title: "港台剧", value: "hk_tw_drama" },
            { title: "日韩剧", value: "jp_kr_drama" },
            { title: "欧美剧", value: "us_eu_drama" },
            { title: "国产动漫", value: "cn_anime" },
            { title: "日韩动漫", value: "jp_kr_anime" },
            { title: "欧美动漫", value: "us_eu_anime" },
          ],
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------
function dsText(value) { return value == null ? "" : String(value).trim(); }

function clean(value) {
  return dsText(value).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
}

var DEFAULT_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

// 手动拼查询串
function buildUrl(base, query) {
  var pairs = [];
  for (var key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) continue;
    var value = query[key];
    if (value === undefined || value === null || value === "") continue;
    pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
  }
  if (!pairs.length) return base;
  return base + (base.indexOf("?") >= 0 ? "&" : "?") + pairs.join("&");
}

// 解析 Widget.http 返回（data 可能是字符串或对象）
function unwrap(response) {
  if (!response) return null;
  var data = response.data !== undefined ? response.data : response;
  if (typeof data === "string") {
    var text = data.trim();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return null; }
  }
  return data || null;
}

async function httpGet(url) {
  var response = await Widget.http.get(url, {
    headers: { "User-Agent": DEFAULT_UA },
    timeout: 5000,
  });
  return response;
}

// ---------------------------------------------------------------------------
// 源清单
// ---------------------------------------------------------------------------
// 主流影视源（有分类树，参与「分类/题材」维度）
// typeIds：一级分类的 type_id（逐源探测）
var CMS_SOURCES = [
  { name: "非凡资源",  url: "https://cj.ffzyapi.com/api.php/provide/vod",   typeIds: { movie: "1", series: "2", variety: "3", anime: "4" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "34", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "15", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
  { name: "非凡资源②", url: "https://api.ffzyapi.com/api.php/provide/vod",  typeIds: { movie: "1", series: "2", variety: "3", anime: "4" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "34", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "15", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
  { name: "非凡影视",  url: "https://ffzy5.tv/api.php/provide/vod",         typeIds: { movie: "1", series: "2", variety: "3", anime: "4" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "34", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "15", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
  { name: "光速资源",  url: "https://api.guangsuapi.com/api.php/provide/vod", typeIds: { movie: "1", series: "2", variety: "3", anime: "4", short: "31", documentary: "24" } },
  { name: "量子资源",  url: "https://cj.lziapi.com/api.php/provide/vod",    typeIds: { movie: "1", series: "2", variety: "3", anime: "4", short: "46" } },
  { name: "巨量资源",  url: "https://api.juliang.live/api/provide/vod",     typeIds: { movie: "1", series: "2", variety: "4", anime: "3", short: "5" } },
  { name: "虎牙资源",  url: "https://www.huyaapi.com/api.php/provide/vod",  typeIds: { movie: "2", series: "1", variety: "27", anime: "17", short: "30" } },
  { name: "360资源",   url: "https://360zy.com/api.php/provide/vod",        typeIds: { movie: "1", series: "2", variety: "3", anime: "4", short: "46" } },
  { name: "爱奇艺资源", url: "https://iqiyizyapi.com/api.php/provide/vod",  typeIds: { movie: "7", series: "8", variety: "9", anime: "40" } },
  { name: "暴风资源",  url: "https://bf.xoxowin86cisyap.com/api.php/provide/vod", typeIds: { movie: "20", series: "30", variety: "45", anime: "39", short: "58" } },
  { name: "bycj资源",  url: "https://bycj.rytvapi.com/api.php/provide/vod", typeIds: { movie: "1", series: "2", variety: "3", anime: "4" } },
  // 扁平分类源（无两级树，但一级分类齐全，参与「分类」维度；题材走不到）
  { name: "无尽资源",  url: "https://api.wujinapi.com/api.php/provide/vod", typeIds: { movie: "1", series: "2", variety: "3", anime: "4", short: "41", documentary: "21" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "20", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "22", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
  { name: "红牛资源",  url: "https://www.hongniuzy3.com/api.php/provide/vod", typeIds: { movie: "1", series: "2", variety: "3", anime: "4" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "34", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "15", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
  { name: "最大资源",  url: "https://api.zuidapi.com/api.php/provide/vod",   typeIds: { movie: "1", series: "2", variety: "3", anime: "4" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "34", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "15", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
  { name: "百度资源",  url: "https://api.apibdzy.com/api.php/provide/vod",  typeIds: { movie: "1", series: "2", variety: "3", anime: "4" }, genres: { action: "6", comedy: "7", romance: "8", scifi: "9", horror: "10", drama: "11", war: "12", ethics: "34", cn_drama: "13", hk_tw_drama: "14", jp_kr_drama: "15", us_eu_drama: "16", cn_anime: "29", jp_kr_anime: "30", us_eu_anime: "31" } },
];

// 仅参与「最新/热播」聚合、无分类树或不进分类维度的源
var EXTRA_SOURCES = [
  { name: "非凡资源③", url: "https://ffzy.tv/api.php/provide/vod" },
  { name: "非凡资源④", url: "https://ffzy1.tv/api.php/provide/vod" },
  { name: "滴滴资源",   url: "https://api.ddapi.cc/api.php/provide/vod" },
  { name: "大地资源",   url: "https://dadiapi.com/api.php/provide/vod/at/json" },
  { name: "森林资源",   url: "https://beiyong.slapibf.com/api.php/provide/vod" },
  { name: "乐播资源",   url: "https://lbapi9.com/api.php/provide/vod" },
  { name: "辣椒资源",   url: "https://apilj.com/api.php/provide/vod" },
  { name: "麻豆资源",   url: "https://91md.me/api.php/provide/vod" },
  { name: "madouse",    url: "https://madouse.la/api.php/provide/vod" },
];

// 全部源（聚合用）
var ALL_SOURCES = CMS_SOURCES.concat(EXTRA_SOURCES);

// ---------------------------------------------------------------------------
// 片单条目转换：CMS vod → Rex VideoItem
// ---------------------------------------------------------------------------
function mediaTypeOf(typeId) {
  // 按 type_id 归属判定媒体类型（电影/连续剧/综艺/动漫 → movie/tv）
  return "movie";
}

function toVideoItem(vod) {
  var name = clean(vod.vod_name);
  if (!name) return null;
  var year = clean(vod.vod_year);
  var pic = clean(vod.vod_pic);
  var remarks = clean(vod.vod_remarks);
  var typeName = clean(vod.type_name);
  // mediaType：标题含「第..集/季」或分类是连续剧类则 tv，否则 movie
  var mediaType = /(?:第\d+集|第\d+話|S\d+)/i.test(name) || /剧/.test(typeName) ? "tv" : "movie";
  return {
    id: String(vod.vod_id || ""),
    type: "tmdb",
    title: name,
    description: remarks || "",
    releaseDate: year || "",
    posterPath: pic,
    backdropPath: pic,
    rating: clean(vod.vod_score) || "",
    mediaType: mediaType,
    genreTitle: typeName,
    // 内部排序用（不进最终返回，但在 paginate 前用于 hot 排序）
    _hits: parseInt(vod.vod_hits, 10) || 0,
  };
}

// 去掉内部字段
function stripInternal(items) {
  return items.map(function (it) {
    var copy = {};
    for (var k in it) {
      if (k === "_hits") continue;
      copy[k] = it[k];
    }
    return copy;
  });
}

// 去重 + 排序
function dedupe(items) {
  var seen = {};
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it || !it.title) continue;
    var key = it.title;
    if (seen[key]) continue;
    seen[key] = true;
    out.push(it);
  }
  return out;
}

function sortByTime(items) {
  // 尽量按 releaseDate 倒序，缺失的排后面（无可靠时间戳时保持抓取顺序）
  return items.sort(function (a, b) {
    var ya = parseInt(a.releaseDate, 10) || 0;
    var yb = parseInt(b.releaseDate, 10) || 0;
    return yb - ya;
  });
}

// ---------------------------------------------------------------------------
// 取数：单源列表页
// ---------------------------------------------------------------------------
async function loadSourceList(src, query) {
  var url = buildUrl(src.url, query);
  var payload;
  try {
    var resp = await httpGet(url);
    payload = unwrap(resp);
  } catch (e) {
    return [];
  }
  var list = (payload && payload.list) || [];
  if (!Array.isArray(list)) return [];
  var items = [];
  for (var i = 0; i < list.length; i++) {
    var it = toVideoItem(list[i]);
    if (it) items.push(it);
  }
  return items;
}

// 并发抓多个源（Promise.all），每个源独立容错
async function loadMany(sources, makeQuery) {
  var tasks = sources.map(function (src) {
    var query = makeQuery(src);
    if (!query) return Promise.resolve([]);
    return loadSourceList(src, query).catch(function () { return []; });
  });
  var groups = await Promise.all(tasks);
  var merged = [];
  for (var i = 0; i < groups.length; i++) {
    merged = merged.concat(groups[i]);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// 分页切片：每页 20 条
// ---------------------------------------------------------------------------
var PAGE_SIZE = 20;

function paginate(items, page) {
  var p = parseInt(page, 10) || 1;
  if (p < 1) p = 1;
  var start = (p - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

// ---------------------------------------------------------------------------
// 入口 function
// ---------------------------------------------------------------------------

// 最新更新：全部源 ?ac=videolist&pg=1（跨源去重，按时间倒序）
async function latest(params) {
  var page = params.page || 1;
  var tasks = ALL_SOURCES.map(function (src) {
    return loadSourceList(src, { ac: "videolist", pg: 1 }).catch(function () { return []; });
  });
  var groups = await Promise.all(tasks);
  var merged = [];
  for (var i = 0; i < groups.length; i++) merged = merged.concat(groups[i]);
  var items = sortByTime(dedupe(merged));
  return stripInternal(paginate(items, page));
}

// 热播榜：全部源列表页按 vod_hits 倒序
async function hot(params) {
  var page = params.page || 1;
  var tasks = ALL_SOURCES.map(function (src) {
    return loadSourceList(src, { ac: "videolist", pg: 1 }).catch(function () { return []; });
  });
  var groups = await Promise.all(tasks);
  var merged = [];
  for (var i = 0; i < groups.length; i++) merged = merged.concat(groups[i]);
  var items = dedupe(merged);
  items.sort(function (a, b) { return b._hits - a._hits; });
  return stripInternal(paginate(items, page));
}

// 分类：选一个一级分类，跨源取该分类 type_id 的列表
async function category(params) {
  var cat = params.type || "movie";
  var page = params.page || 1;
  var tasks = CMS_SOURCES.map(function (src) {
    var tid = src.typeIds && src.typeIds[cat];
    if (!tid) return Promise.resolve([]);
    return loadSourceList(src, { ac: "videolist", t: tid, pg: 1 }).catch(function () { return []; });
  });
  var groups = await Promise.all(tasks);
  var merged = [];
  for (var i = 0; i < groups.length; i++) merged = merged.concat(groups[i]);
  var items = sortByTime(dedupe(merged));
  return stripInternal(paginate(items, page));
}

// 题材：选一个二级题材，跨源取该题材 type_id 的列表
async function genre(params) {
  var g = params.genre || "action";
  var page = params.page || 1;
  var tasks = CMS_SOURCES.map(function (src) {
    var gid = src.genres && src.genres[g];
    if (!gid) return Promise.resolve([]);
    return loadSourceList(src, { ac: "videolist", t: gid, pg: 1 }).catch(function () { return []; });
  });
  var groups = await Promise.all(tasks);
  var merged = [];
  for (var i = 0; i < groups.length; i++) merged = merged.concat(groups[i]);
  var items = sortByTime(dedupe(merged));
  return stripInternal(paginate(items, page));
}
