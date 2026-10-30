// ============================================================================
// Rex 模块 · 四大平台推荐页（rex.mi3s.portal）
// ----------------------------------------------------------------------------
// 移植 LibreTV 的爱奇艺 / 腾讯视频 / 芒果TV 推荐页能力到 Rex。
// 全部走各平台官方公开接口，零本机中转、Rex 直连公网。
//
// 可移植性结论（2026-10-30 实测）：
//   爱奇艺  ✅ GET  pcw-api.iqiyi.com/search/recommend/list  （page_id 数字翻页）
//   芒果TV  ✅ GET  pianku.api.mgtv.com/rider/list/pcweb/v3  （pn 数字翻页）
//   腾讯视频 ⚠️ POST pbaccess.video.qq.com/.../getMVLPage     （翻页需 page_context 链式光标，
//            Rex 无跨调用内存 → 只支持首页 + 有限次链式翻页）
//   优酷    ❌ mtop.youku.columbus.home.query 需 md5 签名 + set-cookie token，
//            Rex Widget 环境无 crypto / 无 set-cookie 访问 → 无法移植，故跳过。
//
// 模块布局（每个平台 1 个推荐页模块，片种用 enum 参数切换）：
//   爱奇艺：电影 / 电视剧 / 纪录片 / 动漫 / 综艺
//   芒果TV：电影 / 电视剧 / 综艺
//   腾讯视频：电影 / 电视剧 / 综艺 / 动漫
//
// 说明：条目为「详情卡」——点击后由 Rex 官方「详情页」能力承接（跳平台网页/播放）。
// ============================================================================

WidgetMetadata = {
  id: "rex.mi3s.portal",
  title: "平台推荐",
  description: "爱奇艺/芒果TV/腾讯视频 官方推荐页（直连公网，可翻页）",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  iconurl: "https://assets.rexnow.tv/scripts/rex-icon.png",
  modules: [
    {
      id: "portalIqiyi",
      title: "爱奇艺 · 推荐",
      functionName: "iqiyiRecommend",
      description: "爱奇艺官方推荐页：电影/电视剧/纪录片/动漫/综艺，可翻页",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        {
          name: "channel",
          title: "片种",
          type: "enumeration",
          value: "1",
          enumOptions: [
            { title: "电影", value: "1" },
            { title: "电视剧", value: "2" },
            { title: "纪录片", value: "3" },
            { title: "动漫", value: "4" },
            { title: "综艺", value: "6" },
          ],
        },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "portalMgtv",
      title: "芒果TV · 推荐",
      functionName: "mgtvRecommend",
      description: "芒果TV官方推荐页：电影/电视剧/综艺，可翻页",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        {
          name: "channel",
          title: "片种",
          type: "enumeration",
          value: "3",
          enumOptions: [
            { title: "电影", value: "3" },
            { title: "电视剧", value: "2" },
            { title: "综艺", value: "1" },
          ],
        },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "portalTencent",
      title: "腾讯视频 · 推荐",
      functionName: "tencentRecommend",
      description: "腾讯视频官方片库推荐：电影/电视剧/综艺/动漫（首页+翻页）",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        {
          name: "channel",
          title: "片种",
          type: "enumeration",
          value: "100173",
          enumOptions: [
            { title: "电影", value: "100173" },
            { title: "电视剧", value: "100113" },
            { title: "综艺", value: "100109" },
            { title: "动漫", value: "100119" },
          ],
        },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function txt(v) { return v == null ? "" : String(v).trim(); }

function clean(v) {
  return txt(v).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
}

var UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

function toHttps(url) {
  if (!url) return "";
  var s = String(url);
  if (s.indexOf("//") === 0) return "https:" + s;
  return s.replace(/^http:\/\//i, "https://");
}

function unwrap(resp) {
  if (!resp) return null;
  var d = resp.data !== undefined ? resp.data : resp;
  if (typeof d === "string") {
    var s = d.trim();
    if (!s) return null;
    try { return JSON.parse(s); } catch (e) { return null; }
  }
  return d || null;
}

function buildUrl(base, query) {
  var pairs = [];
  for (var k in query) {
    if (!Object.prototype.hasOwnProperty.call(query, k)) continue;
    var v = query[k];
    if (v === undefined || v === null || v === "") continue;
    pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
  }
  if (!pairs.length) return base;
  return base + (base.indexOf("?") >= 0 ? "&" : "?") + pairs.join("&");
}

async function httpGet(url, extraHeaders) {
  var headers = { "User-Agent": UA };
  if (extraHeaders) {
    for (var k in extraHeaders) {
      if (Object.prototype.hasOwnProperty.call(extraHeaders, k)) headers[k] = extraHeaders[k];
    }
  }
  return await Widget.http.get(url, { headers: headers, timeout: 10000 });
}

async function httpPostJson(url, body, extraHeaders) {
  var headers = { "User-Agent": UA, "Content-Type": "application/json", Accept: "application/json" };
  if (extraHeaders) {
    for (var k in extraHeaders) {
      if (Object.prototype.hasOwnProperty.call(extraHeaders, k)) headers[k] = extraHeaders[k];
    }
  }
  return await Widget.http.post(url, body, { headers: headers, timeout: 10000 });
}

// 统一条目构造（详情卡）
function detailItem(id, title, poster, desc, mediaType, releaseDate) {
  var cover = toHttps(poster);
  var item = {
    id: String(id),
    type: "detail",
    title: clean(title) || "未命名",
    description: clean(desc) || "",
    posterPath: cover,
    coverUrl: cover,
    mediaType: mediaType || "movie",
  };
  if (releaseDate) item.releaseDate = String(releaseDate);
  return item;
}

// ---------------------------------------------------------------------------
// 爱奇艺
// ---------------------------------------------------------------------------

async function iqiyiRecommend(params) {
  var channel = params && params.channel ? String(params.channel) : "1";
  var page = parseInt(params && params.page, 10) || 1;
  var url = buildUrl("https://pcw-api.iqiyi.com/search/recommend/list", {
    channel_id: channel,
    data_type: "1",
    mode: "11",
    page_id: page,
    ret_num: "24",
    session: "rexportal",
  });
  try {
    var d = unwrap(await httpGet(url, { Referer: "https://www.iqiyi.com/" }));
    if (!d || d.code !== "A00000" || !d.data) return [];
    var list = d.data.list || [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it || (!it.name && !it.albumName)) continue;
      var title = it.name || it.albumName || "";
      var poster = it.imageUrl || it.albumImageUrl || "";
      var desc = it.description || (it.people && it.people.main_charactor && it.people.main_charactor.length
        ? "主演：" + it.people.main_charactor.map(function (p) { return p.name; }).join(" / ")
        : "");
      var rating = it.score ? "评分 " + it.score : "";
      var cat0 = (it.categories && it.categories[0]) || "";
      var remark = [rating, cat0].filter(Boolean).join(" · ");
      var item = detailItem(it.albumId || it.tvId || title, title, poster, remark || desc, "movie", it.period);
      out.push(item);
    }
    return out;
  } catch (e) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 芒果TV
// ---------------------------------------------------------------------------

async function mgtvRecommend(params) {
  var channel = params && params.channel ? String(params.channel) : "3";
  var page = parseInt(params && params.page, 10) || 1;
  var url = buildUrl("https://pianku.api.mgtv.com/rider/list/pcweb/v3", {
    allowedRC: "1",
    platform: "pcweb",
    channelId: channel,
    pn: page,
    pc: "24",
    hudong: "1",
    _support: "10000000",
  });
  try {
    var d = unwrap(await httpGet(url, { Referer: "https://www.mgtv.com/" }));
    if (!d || d.code !== 200 || !d.data) return [];
    var list = d.data.hitDocs || [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it || (!it.title && !it.subtitle)) continue;
      var title = it.title || it.subtitle || "";
      var poster = it.imgUrlH || it.img || "";
      var kinds = (it.kind && it.kind.length) ? it.kind.join(" / ") : "";
      var cast = it.subtitle && it.title !== it.subtitle ? "主演：" + it.subtitle : "";
      var desc = [kinds, cast].filter(Boolean).join(" · ") || it.story || "";
      var item = detailItem(it.clipId || title, title, poster, desc, "movie", it.year);
      out.push(item);
    }
    return out;
  } catch (e) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 腾讯视频
// ---------------------------------------------------------------------------

// 在嵌套卡片树里收集指定 type 的卡片
function collectCards(node, type, out, depth) {
  if (!node || depth > 26 || out.length > 400) return out;
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) collectCards(node[i], type, out, depth + 1);
    return out;
  }
  if (typeof node !== "object") return out;
  if (node.type === type) out.push(node);
  for (var k in node) {
    if (Object.prototype.hasOwnProperty.call(node, k)) collectCards(node[k], type, out, depth + 1);
  }
  return out;
}

// 腾讯片库 MVL 翻页：一页只给 12 条，靠 page_context 链式取下一批。
// Rex 无跨调用内存，翻到第 N 页需从头链 N 次（受 timeout 约束，最多链几批）。
async function tencentRecommend(params) {
  var channel = params && params.channel ? String(params.channel) : "100173";
  var page = Math.max(1, parseInt(params && params.page, 10) || 1);
  var filterParams = "sort=75&itype=-1&ipay=-1&iarea=-1&iyear=-1";
  var url = "https://pbaccess.video.qq.com/trpc.multi_vector_layout.mvl_controller.MVLPageHTTPService/getMVLPage?&vversion_platform=2";
  var headers = { Referer: "https://v.qq.com/", Origin: "https://v.qq.com" };

  try {
    var ctx;
    var collected = [];
    var hasNext = true;
    // 链式取前 page 批（每批 12 条），第 page 页对应第 page 批
    for (var b = 1; b <= page; b++) {
      var payload = {
        page_params: {
          channel_id: channel,
          filter_params: filterParams,
          page_id: "channel_list",
          page_type: "operation",
        },
      };
      if (ctx) payload.page_context = ctx;
      var resp = unwrap(await httpPostJson(url, payload, headers));
      if (!resp || !resp.data) break;
      var cards = collectCards(resp.data, "searchlist_poster_card", [], 0);
      if (!cards.length && b === 1) {
        // 第一批就空：退回频道推荐流
        return await tencentChannel(channel);
      }
      if (b === page) {
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var p = c.params || {};
          var title = (p.title || "").trim();
          var cover = p.new_pic_vt || p.new_pic_hz || "";
          if (!title || !cover) continue;
          var remark = p.third_title && p.third_title.length <= 14 ? p.third_title : "";
          collected.push(detailItem(p.cid || title, title, cover, remark, "movie"));
        }
        break;
      }
      ctx = resp.data.page_context;
      hasNext = Boolean(resp.data.has_next_page);
      if (!hasNext) break;
    }
    return collected;
  } catch (e) {
    return [];
  }
}

// 腾讯频道推荐流（getPage），作为 MVL 兜底：一次性返回整页海报
async function tencentChannel(channel) {
  var url = "https://pbaccess.video.qq.com/trpc.vector_layout.page_view.PageService/getPage?video_appid=3000010&vversion_platform=2";
  var headers = { Referer: "https://v.qq.com/channel/movie" };
  var payload = {
    page_params: { page_type: "channel", page_id: channel, scene: "channel", new_mark_label_enabled: "1" },
    page_bypass_params: {
      params: {
        platform_id: "2",
        caller_id: "3000010",
        data_mode: "default",
        user_mode: "default",
        specified_strategy: "",
        page_type: "channel",
        page_id: channel,
        scene: "channel",
        new_mark_label_enabled: "1",
      },
      scene: "channel",
      app_version: "",
      abtest_bypass_id: "",
    },
    page_context: null,
  };
  try {
    var resp = unwrap(await httpPostJson(url, payload, headers));
    if (!resp || !resp.data) return [];
    var strict = [];
    var items = [];
    var walk = function (node, depth) {
      if (!node || depth > 14 || items.length > 80) return;
      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) walk(node[i], depth + 1);
        return;
      }
      if (typeof node !== "object") return;
      var title = typeof node.mz_title === "string" ? node.mz_title.trim() : "";
      var cover = typeof node.image_url === "string" ? node.image_url : "";
      var looksLikeCopy = /[，。]|《/.test(title);
      if (title && cover && !looksLikeCopy && title.length <= 18) {
        var item = detailItem(node.cid || title, title, cover, "", "movie");
        items.push(item);
        if (node.main_genre) strict.push(item);
      }
      for (var k in node) {
        if (Object.prototype.hasOwnProperty.call(node, k)) walk(node[k], depth + 1);
      }
    };
    walk(resp.data, 0);
    return strict.length >= 8 ? strict : items;
  } catch (e) {
    return [];
  }
}
