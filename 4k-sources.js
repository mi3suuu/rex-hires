// ============================================================================
// Rex 播放源模块 · 4K/高清聚合源（app.mi3s.k4sources）
// ----------------------------------------------------------------------------
// stream 类型模块：loadResource(seriesName, episode) → VideoResource[]
//
// 本模块收录 100 个苹果CMS（MacCMS V10）影视采集源，多源聚合解析真实 m3u8 播放地址。
// 源清单来源：抖音/社区评论区线索 → 反搜 GitHub LunaTV-config、空壳影视 mac-cms、
// 北海博客等公开聚合页，去重合并而成。每个源标注清晰度等级：
//   4K  —— 源站明确标称 4K/蓝光/HDR/2160P，或线路数多、含 4K 线路的概率高
//   HD  —— 综合高清源（m3u8 自适应，多为 720P/1080P，部分片含 4K）
//   AD  —— 成人/擦边源（与常规源同接口，vod_play_url 多为裸 m3u8 直链）
//
// 关键认知（与 hires.js 一致）：
//   - 只用 Widget.http.get（Rex 运行时提供），绝不用 fetch / setTimeout / .finally
//   - 超时用 Widget.http 的 timeout 选项；并发用 Promise.all
//   - loadResource 返回 VideoResource[]：{name, description, url, customHeaders, playerType:"app"}
//   - 苹果CMS搜索接口：?ac=detail&wd=片名 或 ?ac=videolist&wd=片名
//   - vod_play_url 结构：「第N集$url#第N集$url」，多线路用 $$$ 分隔，play_from 对应线路名
//
// 注意：影视源站会频繁换域名/关停，本清单仅供参考，失效源会被运行时自动跳过，
// 不影响其它源聚合解析。
// ============================================================================

WidgetMetadata = {
  id: "app.mi3s.k4sources",
  title: "4K 聚合源",
  description: "100 个苹果CMS影视源多源聚合：优先4K/蓝光线路，含综合高清源与成人源，点进即出真实 m3u8 播放地址",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "loadResource",
      title: "4K 聚合源 · 解析",
      functionName: "loadResource",
      description: "100 个 CMS 源多源聚合，串行尝试，找到结果即返回",
      type: "stream",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
  ],
};

// ---------------------------------------------------------------------------
// 源清单（100 个）
// tier: "4K" 标称4K/蓝光 · "HD" 综合高清 · "AD" 成人/擦边
// 按 tier 优先级排序：4K → HD → AD，让 4K 线路优先被尝试
// ---------------------------------------------------------------------------
var CMS_SOURCES = [
  // ============ 4K / 蓝光标称源（优先）============
  { name: "量子资源",  tier: "4K", url: "https://cj.lziapi.com/api.php/provide/vod" },
  { name: "量子影视",  tier: "4K", url: "https://cj.lzcaiji.com/api.php/provide/vod" },
  { name: "非凡资源",  tier: "4K", url: "https://cj.ffzyapi.com/api.php/provide/vod" },
  { name: "非凡资源②", tier: "4K", url: "https://api.ffzyapi.com/api.php/provide/vod" },
  { name: "非凡影视",  tier: "4K", url: "https://ffzy5.tv/api.php/provide/vod" },
  { name: "暴风资源",  tier: "4K", url: "https://bfzyapi.com/api.php/provide/vod" },
  { name: "光速资源",  tier: "4K", url: "https://api.guangsuapi.com/api.php/provide/vod" },
  { name: "无尽资源",  tier: "4K", url: "https://api.wujinapi.com/api.php/provide/vod" },
  { name: "无尽影视",  tier: "4K", url: "https://api.wujinapi.me/api.php/provide/vod" },
  { name: "红牛资源",  tier: "4K", url: "https://www.hongniuzy2.com/api.php/provide/vod" },
  { name: "红牛资源②", tier: "4K", url: "https://www.hongniuzy3.com/api.php/provide/vod" },
  { name: "索尼资源",  tier: "4K", url: "https://suoniapi.com/api.php/provide/vod" },
  { name: "极速资源",  tier: "4K", url: "https://jszyapi.com/api.php/provide/vod" },
  { name: "豪华资源",  tier: "4K", url: "https://hhzyapi.com/api.php/provide/vod" },
  { name: "奥斯卡资源", tier: "4K", url: "https://aosikazy.com/api.php/provide/vod" },
  { name: "360资源",   tier: "4K", url: "https://360zy.com/api.php/provide/vod" },
  { name: "360资源②", tier: "4K", url: "https://360zyzz.com/api.php/provide/vod" },
  { name: "天空资源",  tier: "4K", url: "http://m3u8.tiankongapi.com/api.php/provide/vod" },
  { name: "魔都资源",  tier: "4K", url: "https://caiji.moduapi.cc/api.php/provide/vod" },
  { name: "魔都资源②", tier: "4K", url: "https://www.mdzyapi.com/api.php/provide/vod" },
  { name: "卧龙资源",  tier: "4K", url: "https://collect.wolongzyw.com/api.php/provide/vod" },
  { name: "卧龙影视",  tier: "4K", url: "https://wolongzyw.com/api.php/provide/vod" },
  { name: "1080资源",  tier: "4K", url: "http://api.1080zyku.com/inc/api.php/provide/vod" },
  { name: "优质资源",  tier: "4K", url: "https://api.yzzy-api.com/inc/apijson.php" },
  { name: "金鹰资源",  tier: "4K", url: "https://jyzyapi.com/provide/vod" },
  { name: "金鹰点播",  tier: "4K", url: "https://jinyingzy.com/api.php/provide/vod" },
  { name: "闪电资源",  tier: "4K", url: "http://sdzyapi.com/api.php/provide/vod" },
  { name: "闪电资源②", tier: "4K", url: "https://xsd.sdzyapi.com/api.php/provide/vod" },
  { name: "快车资源",  tier: "4K", url: "https://caiji.kczyapi.com/api.php/provide/vod" },
  { name: "快车资源②", tier: "4K", url: "https://caiji.kuaichezy.org/api.php/provide/vod" },
  { name: "百度资源",  tier: "4K", url: "https://api.apibdzy.com/api.php/provide/vod" },
  { name: "电影天堂",  tier: "4K", url: "http://caiji.dyttzyapi.com/api.php/provide/vod" },
  { name: "豆瓣资源",  tier: "4K", url: "https://caiji.dbzy5.com/api.php/provide/vod" },
  { name: "爱奇艺资源", tier: "4K", url: "https://iqiyizyapi.com/api.php/provide/vod" },
  { name: "虎牙资源",  tier: "4K", url: "https://www.huyaapi.com/api.php/provide/vod" },
  { name: "最大资源",  tier: "4K", url: "https://api.zuidapi.com/api.php/provide/vod" },
  { name: "最大点播",  tier: "4K", url: "https://zuidazy.me/api.php/provide/vod" },
  { name: "U酷影视",   tier: "4K", url: "https://api.ukuapi88.com/api.php/provide/vod" },
  { name: "天涯影视",  tier: "4K", url: "https://tyyszy.com/api.php/provide/vod" },
  { name: "山海资源",  tier: "4K", url: "https://zy.sh0o.cn/api.php/provide/vod" },
  { name: "建安资源",  tier: "4K", url: "http://154.219.117.232:9981/jacloudapi.php/provide/vod" },
  { name: "新浪资源",  tier: "4K", url: "https://api.xinlangapi.com/xinlangapi.php/provide/vod" },
  { name: "旺旺资源",  tier: "4K", url: "https://api.wwzy.tv/api.php/provide/vod" },
  { name: "旺旺短剧",  tier: "4K", url: "https://wwzy.tv/api.php/provide/vod" },
  { name: "樱花资源",  tier: "4K", url: "https://m3u8.apiyhzy.com/api.php/provide/vod" },
  { name: "猫眼资源",  tier: "4K", url: "https://api.maoyanapi.top/api.php/provide/vod" },
  { name: "茅台资源",  tier: "4K", url: "https://caiji.maotaizy.cc/api.php/provide/vod" },
  { name: "飘零资源",  tier: "4K", url: "https://p2100.net/api.php/provide/vod" },
  { name: "鸭鸭资源",  tier: "4K", url: "https://cj.yayazy.net/api.php/provide/vod" },
  { name: "速播资源",  tier: "4K", url: "https://subocaiji.com/api.php/provide/vod" },
  { name: "iKun资源",  tier: "4K", url: "https://ikunzyapi.com/api.php/provide/vod" },
  { name: "大地资源",  tier: "4K", url: "https://dadiapi.com/api.php/provide/vod" },
  { name: "森林资源",  tier: "4K", url: "https://beiyong.slapibf.com/api.php/provide/vod" },
  { name: "乐播资源",  tier: "4K", url: "https://lbapi9.com/api.php/provide/vod" },
  { name: "如意资源",  tier: "4K", url: "https://cj.rycjapi.com/api.php/provide/vod" },
  { name: "滴滴资源",  tier: "4K", url: "https://api.ddapi.cc/api.php/provide/vod" },
  { name: "淘片资源",  tier: "4K", url: "https://taopianapi.com/home/cjapi/as/mc10/vod" },
  { name: "金鹰资源网", tier: "4K", url: "https://jinyingzy.net/api.php/provide/vod" },
  { name: "FOX资源",   tier: "4K", url: "https://foxzyapi.com/api.php/provide/vod" },
  { name: "速更资源",  tier: "4K", url: "https://www.sugengzy.cn/api.php/provide/vod" },

  // ============ 综合高清源（HD）============
  { name: "非凡资源③", tier: "HD", url: "https://ffzy.tv/api.php/provide/vod" },
  { name: "非凡资源④", tier: "HD", url: "https://ffzy1.tv/api.php/provide/vod" },
  { name: "虎牙资源②", tier: "HD", url: "https://www.huyaapi.com/api.php/provide/vod/at/json" },
  { name: "大地资源②", tier: "HD", url: "https://dadiapi.com/api.php/provide/vod/at/json" },
  { name: "辣椒资源", tier: "HD", url: "https://apilj.com/api.php/provide/vod" },
  { name: "玉兔资源", tier: "HD", url: "https://apiyutu.com/api.php/provide/vod" },
  { name: "百万资源", tier: "HD", url: "https://api.bwzyz.com/api.php/provide/vod" },
  { name: "精品资源", tier: "HD", url: "https://www.jingpinx.com/api.php/provide/vod" },
  { name: "细胞资源", tier: "HD", url: "https://www.xxibaozyw.com/api.php/provide/vod" },
  { name: "jkun资源", tier: "HD", url: "https://jkunzyapi.com/api.php/provide/vod" },
  { name: "豆豆资源", tier: "HD", url: "https://api.douapi.cc/api.php/provide/vod" },
  { name: "CK资源",   tier: "HD", url: "https://ckzy.me/api.php/provide/vod" },

  // ============ 成人/擦边源（AD）============
  { name: "白嫖资源", tier: "AD", url: "https://www.kxgav.com/api/json.php" },
  { name: "美少女资源", tier: "AD", url: "https://www.msnii.com/api/json.php" },
  { name: "香奶儿资源", tier: "AD", url: "https://www.gdlsp.com/api/json.php" },
  { name: "淫水机资源", tier: "AD", url: "https://www.xrbsp.com/api/json.php" },
  { name: "黄AV资源", tier: "AD", url: "https://www.pgxdy.com/api/json.php" },
  { name: "麻豆资源", tier: "AD", url: "https://91md.me/api.php/provide/vod" },
  { name: "madouse", tier: "AD", url: "https://madouse.la/api.php/provide/vod" },
  { name: "番号资源", tier: "AD", url: "http://fhapi9.com/api.php/provide/vod" },
  { name: "色猫资源", tier: "AD", url: "https://caiji.semaozy.net/inc/apijson_vod.php/provide/vod" },
  { name: "香蕉资源", tier: "AD", url: "https://www.xiangjiaozyw.com/api.php/provide/vod" },
  { name: "鲨鱼资源", tier: "AD", url: "https://shayuapi.com/api.php/provide/vod" },
  { name: "黄色仓库", tier: "AD", url: "https://hsckzy.xyz/api.php/provide/vod" },
  { name: "91精品",  tier: "AD", url: "https://91jpzyw.com/api.php/provide/vod" },
  { name: "桃花资源", tier: "AD", url: "https://thzy1.me/api.php/provide/vod" },
  { name: "杏吧资源", tier: "AD", url: "https://xingba111.com/api.php/provide/vod" },
  { name: "大地·飞飞", tier: "AD", url: "https://dadiapi.com/feifei2" },
  { name: "奶香资源", tier: "AD", url: "https://Naixxzy.com/api.php/provide/vod" },
  { name: "小鸡资源", tier: "AD", url: "https://api.xiaojizy.live/provide/vod" },
  { name: "丝袜资源", tier: "AD", url: "https://siwazyw.tv/api.php/provide/vod/at/json" },
  { name: "优优资源", tier: "AD", url: "https://www.yyzywcj.com/api.php/provide/vod" },
  { name: "最色资源", tier: "AD", url: "https://api.zuiseapi.com/api.php/provide/vod" },
  { name: "155资源", tier: "AD", url: "https://155api.com/api.php/provide/vod" },
  { name: "souavZY", tier: "AD", url: "https://api.souavzy.vip/api.php/provide/vod" },
  { name: "老色逼", tier: "AD", url: "https://apilsbzy1.com/api.php/provide/vod" },
  { name: "色南国", tier: "AD", url: "https://api.sexnguon.com/api.php/provide/vod" },
  { name: "大奶子", tier: "AD", url: "https://apidanaizi.com/api.php/provide/vod" },
  { name: "幸资源", tier: "AD", url: "https://xzybb2.com/api.php/provide/vod" },
  { name: "AIvin",  tier: "AD", url: "http://lbapiby.com/api.php/provide/vod" },
];

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------
function dsText(value) { return value == null ? "" : String(value).trim(); }

function clean(value) {
  return dsText(value).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
}

function normTitle(s) {
  return String(s || "").toLowerCase().replace(/[\s：:·・—_\-–（）()\[\]【】,.，。'"\u200b\u200c\u200d\ufeff]/g, "");
}

function makeResource(name, desc, url, headers) {
  return {
    name: name,
    description: desc || "",
    url: url,
    customHeaders: headers || {},
    playerType: "app",
  };
}

// unwrap：解析 Widget.http 返回（data 可能是字符串或对象）
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

var DEFAULT_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

async function httpGet(url, headers) {
  var response = await Widget.http.get(url, {
    headers: headers || { "User-Agent": DEFAULT_UA },
    timeout: 10000,
  });
  return response;
}

// ---------------------------------------------------------------------------
// 苹果CMS：单源搜索 + 详情解析（与 hires.js 一致）
// ---------------------------------------------------------------------------
function collectLines(item) {
  var playUrl = String(item.vod_play_url || "").replace(/#+$/, "");
  if (!playUrl) return [];
  var froms = String(item.vod_play_from || "").split("$$$");
  var blocks = playUrl.split("$$$");
  var lines = [];
  for (var i = 0; i < blocks.length; i++) {
    var sourceName = clean(froms[i]) || "线路" + (i + 1);
    var chunks = blocks[i].split("#");
    for (var j = 0; j < chunks.length; j++) {
      var parts = chunks[j].split("$");
      if (parts.length < 2) continue;
      var label = clean(parts[0]);
      var url = clean(parts.slice(1).join("$"));
      if (!url || !/^https?:\/\//i.test(url)) continue;
      lines.push({ sourceName: sourceName, label: label, url: url });
    }
  }
  // 兜底：api/json.php 成人源，vod_play_url 本身是裸直链
  if (!lines.length && /^https?:\/\//i.test(playUrl.trim())) {
    lines.push({ sourceName: clean(froms[0]) || "直链", label: "正片", url: playUrl.trim() });
  }
  return lines;
}

function parseEpisode(rawName) {
  var m = dsText(rawName).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function searchOneSource(src, title, episode) {
  var base = src.url;
  var list = [];
  var searchModes = [
    { ac: "detail", wd: title },
    { ac: "videolist", wd: title },
  ];
  for (var mi = 0; mi < searchModes.length && !list.length; mi++) {
    var mode = searchModes[mi];
    for (var page = 1; page <= 3; page++) {
      var searchUrl = buildUrl(base, { ac: mode.ac, wd: mode.wd, pg: page });
      var payload;
      try {
        var resp = await httpGet(searchUrl);
        payload = unwrap(resp);
      } catch (e) {
        break;
      }
      var pageList = (payload && payload.list) || [];
      if (!Array.isArray(pageList) || !pageList.length) break;
      list = list.concat(pageList);
      if (pageList.length < 20) break;
    }
  }

  if (!list.length) return [];

  var wantNorm = normTitle(title);
  var target = null;
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || !it.vod_id) continue;
    var n = normTitle(it.vod_name);
    if (!wantNorm) { target = it; break; }
    if (n === wantNorm || n.indexOf(wantNorm) >= 0 || wantNorm.indexOf(n) >= 0) {
      target = it;
      break;
    }
  }
  if (!target) return [];

  var playUrl = target.vod_play_url;
  var playFrom = target.vod_play_from;
  if (!playUrl) {
    try {
      var detailUrl = buildUrl(base, { ac: "detail", ids: target.vod_id });
      var detResp = await httpGet(detailUrl);
      var det = unwrap(detResp);
      var dl = (det && det.list && det.list[0]) || {};
      playUrl = dl.vod_play_url || "";
      playFrom = dl.vod_play_from || "";
    } catch (e) {
      return [];
    }
  }
  if (!playUrl) return [];

  var lines = collectLines({ vod_play_url: playUrl, vod_play_from: playFrom });

  var wantedEp = parseInt(episode, 10) || 1;
  var byEp = {};
  for (var k = 0; k < lines.length; k++) {
    var l = lines[k];
    var ep = parseEpisode(l.label);
    if (!byEp[ep]) byEp[ep] = [];
    byEp[ep].push(l);
  }
  var chosen = byEp[wantedEp];
  if (!chosen || !chosen.length) {
    var firstKey = Object.keys(byEp)[0];
    chosen = byEp[firstKey] || lines;
  }

  var tierLabel = src.tier === "4K" ? "4K" : (src.tier === "AD" ? "成人" : "高清");
  var out = [];
  var seen = {};
  for (var m = 0; m < chosen.length; m++) {
    var line = chosen[m];
    if (seen[line.url]) continue;
    seen[line.url] = true;
    out.push(makeResource(
      "[" + tierLabel + "] " + src.name + " · " + line.sourceName + " · " + line.label,
      target.vod_name || title,
      line.url,
      { "User-Agent": DEFAULT_UA, Referer: base }
    ));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 实测在线源（2026-10-28 实测返回 HTTP 200 的域名，优先尝试，减少失效源超时等待）
// 影视源频繁换域名/关停，此名单仅供参考；不在名单里的源仍会按 tier 正常尝试，
// 失效时自动跳过，不影响整体聚合。
// ---------------------------------------------------------------------------
var ONLINE_HOSTS = {
  "154.219.117.232": 1, "fhapi9.com": 1, "360zy.com": 1, "91md.me": 1,
  "api.apibdzy.com": 1, "api.ffzyapi.com": 1, "api.guangsuapi.com": 1,
  "api.wujinapi.com": 1, "api.wujinapi.me": 1, "api.xinlangapi.com": 1,
  "api.yzzy-api.com": 1, "api.zuidapi.com": 1, "apilj.com": 1,
  "beiyong.slapibf.com": 1, "caiji.kczyapi.com": 1, "caiji.semaozy.net": 1,
  "cj.ffzyapi.com": 1, "cj.lziapi.com": 1, "ckzy.me": 1,
  "collect.wolongzyw.com": 1, "dadiapi.com": 1, "ffzy.tv": 1, "ffzy5.tv": 1,
  "iqiyizyapi.com": 1, "jinyingzy.net": 1, "lbapi9.com": 1,
  "m3u8.apiyhzy.com": 1, "wolongzyw.com": 1, "www.gdlsp.com": 1,
  "www.hongniuzy3.com": 1, "www.huyaapi.com": 1, "www.kxgav.com": 1,
  "www.msnii.com": 1, "www.pgxdy.com": 1, "www.xrbsp.com": 1,
  "www.yyzywcj.com": 1, "xsd.sdzyapi.com": 1,
};

function hostOf(url) {
  var m = String(url || "").match(/^https?:\/\/([^\/]+)/);
  return m ? m[1].toLowerCase() : "";
}

function isOnline(src) {
  return !!ONLINE_HOSTS[hostOf(src.url)];
}

// ---------------------------------------------------------------------------
// 主入口：loadResource(params) → VideoResource[]
// 排序优先级：在线 4K > 在线 HD > 在线 AD > 离线 4K > 离线 HD > 离线 AD
// 串行尝试，找到 4K 结果即返回；失效源自动跳过。
// ---------------------------------------------------------------------------
async function loadResource(params) {
  params = params || {};
  var title = dsText(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);

  if (!title) return [];

  var results = [];
  var order = { "4K": 0, "HD": 1, "AD": 2 };
  var sorted = CMS_SOURCES.slice().sort(function (a, b) {
    var ao = isOnline(a) ? 0 : 1;
    var bo = isOnline(b) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return (order[a.tier] || 9) - (order[b.tier] || 9);
  });

  // 优先尝试在线源，找到结果即返回
  for (var b = 0; b < sorted.length; b++) {
    var src = sorted[b];
    try {
      var r = await searchOneSource(src, title, episode);
      if (r && r.length) {
        for (var x = 0; x < r.length; x++) results.push(r[x]);
        // 命中 4K 源立即返回；命中 HD/AD 源继续尝试，但结果够了也返回
        if (src.tier === "4K") {
          return results;
        }
        if (results.length >= 3) {
          return results;
        }
      }
    } catch (e) {
      // 单源失败忽略
    }
  }

  return results;
}
