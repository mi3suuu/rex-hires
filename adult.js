// ============================================================================
// Rex 模块 · 成人资源（rex.mi3s.adult）
// ----------------------------------------------------------------------------
// 全部为公网可直连的苹果CMS v10 源，不依赖任何本机中转。
// 本次开启代理后重新全量探测（2026-10-30）：
//   直连可达 29 源、仅代理可达 1 源（杏吧）、均不可达 12 源。
//   25 个源能挖到完整分类目录（接口 ?ac=list 响应的 class 字段）。
//
// 能力：
//   1) 分类浏览：25 个「有分类」的源各建一个 video 模块，源名标注 [直连]/[代理]，
//      分类目录动态从 class 字段拉取（不硬编码），点分类拉片单。
//   2) 最新榜：25 源各一个「最新」video 模块（ac=list 天然按时间倒序）。
//   3) 搜索：search 块接入 Rex 全局搜索开关，跨全部源搜片名。
//   4) 播放：stream 聚合播放源，分批并发解析直链。
//
// 标注含义：
//   [直连] = 无需代理即可访问；[代理] = 手机需挂代理(VPN/Clash)才能访问。
//   5 个 json.php 型源（香奶儿/淫水机/白嫖/美少女/黄AV）是纯搜索型，无分类目录。
//   12 个不可达源（AIvin/奥斯卡/幸资源/色南国/丝袜/优优/最色/大地/百万/细胞/香蕉/91精品）
//   已排除出源表（连代理都连不上）。
// ============================================================================

var ADULT_SOURCES = [
  { name: "辣椒资源", url: "https://apilj.com/api.php/provide/vod", mode: "直连", cat: "s1" },
  { name: "森林资源", url: "https://beiyong.slapibf.com/api.php/provide/vod", mode: "直连", cat: "s2" },
  { name: "XXAV", url: "https://xxavs.com/api.php/provide/vod", mode: "直连", cat: "s3" },
  { name: "番号资源", url: "http://fhapi9.com/api.php/provide/vod", mode: "直连", cat: "s4" },
  { name: "麻豆资源", url: "https://91md.me/api.php/provide/vod", mode: "直连", cat: "s5" },
  { name: "madouse", url: "https://madouse.la/api.php/provide/vod", mode: "直连", cat: "s6" },
  { name: "黄色仓库VIP", url: "https://hsckzy.vip/api.php/provide/vod", mode: "直连", cat: "s7" },
  { name: "CK资源", url: "https://ckzy.me/api.php/provide/vod", mode: "直连", cat: "s8" },
  { name: "大奶子", url: "https://apidanaizi.com/api.php/provide/vod", mode: "直连", cat: "s9" },
  { name: "老色逼", url: "https://apilsbzy1.com/api.php/provide/vod", mode: "直连", cat: "s10" },
  { name: "155资源", url: "https://155api.com/api.php/provide/vod", mode: "直连", cat: "s11" },
  { name: "souavZY", url: "https://api.souavzy.vip/api.php/provide/vod", mode: "直连", cat: "s12" },
  { name: "奶香资源", url: "https://Naixxzy.com/api.php/provide/vod", mode: "直连", cat: "s13" },
  { name: "小鸡资源", url: "https://api.xiaojizy.live/provide/vod", mode: "直连", cat: "s14" },
  { name: "杏吧资源", url: "https://xingba111.com/api.php/provide/vod", mode: "代理", cat: "s15" },
  { name: "滴滴资源", url: "https://api.ddapi.cc/api.php/provide/vod", mode: "直连", cat: "s16" },
  { name: "玉兔资源", url: "https://apiyutu.com/api.php/provide/vod", mode: "直连", cat: "s17" },
  { name: "精品资源", url: "https://www.jingpinx.com/api.php/provide/vod", mode: "直连", cat: "s18" },
  { name: "色猫资源", url: "https://caiji.semaozy.net/inc/apijson_vod.php/provide/vod", mode: "直连", cat: "s19" },
  { name: "鲨鱼资源", url: "https://shayuapi.com/api.php/provide/vod", mode: "直连", cat: "s20" },
  { name: "黄色仓库", url: "https://hsckzy.xyz/api.php/provide/vod", mode: "直连", cat: "s21" },
  { name: "乐播资源", url: "https://lbapi9.com/api.php/provide/vod", mode: "直连", cat: "s22" },
  { name: "jkun资源", url: "https://jkunzyapi.com/api.php/provide/vod", mode: "直连", cat: "s23" },
  { name: "豆豆资源", url: "https://api.douapi.cc/api.php/provide/vod", mode: "直连", cat: "s24" },
  { name: "桃花资源", url: "https://thzy1.me/api.php/provide/vod", mode: "直连", cat: "s25" },
  { name: "香奶儿资源", url: "https://www.gdlsp.com/api/json.php", mode: "直连" },
  { name: "淫水机资源", url: "https://www.xrbsp.com/api/json.php", mode: "直连" },
  { name: "白嫖资源", url: "https://www.kxgav.com/api/json.php", mode: "直连" },
  { name: "美少女资源", url: "https://www.msnii.com/api/json.php", mode: "直连" },
  { name: "黄AV资源", url: "https://www.pgxdy.com/api/json.php", mode: "直连" },
  { name: "AIvin", url: "http://lbapiby.com/api.php/provide/vod", mode: "不可达" },
  { name: "奥斯卡", url: "https://aosikazy.com/api.php/provide/vod", mode: "不可达" },
  { name: "幸资源", url: "https://xzybb2.com/api.php/provide/vod", mode: "不可达" },
  { name: "色南国", url: "https://api.sexnguon.com/api.php/provide/vod", mode: "不可达" },
  { name: "丝袜资源", url: "https://siwazyw.tv/api.php/provide/vod/at/json", mode: "不可达" },
  { name: "优优资源", url: "https://www.yyzywcj.com/api.php/provide/vod", mode: "不可达" },
  { name: "最色资源", url: "https://api.zuiseapi.com/api.php/provide/vod", mode: "不可达" },
  { name: "大地资源", url: "https://dadiapi.com/feifei2", mode: "不可达" },
  { name: "百万资源", url: "https://api.bwzyz.com/api.php/provide/vod", mode: "不可达" },
  { name: "细胞资源", url: "https://www.xxibaozyw.com/api.php/provide/vod", mode: "不可达" },
  { name: "香蕉资源", url: "https://www.xiangjiaozyw.com/api.php/provide/vod", mode: "不可达" },
  { name: "91精品", url: "https://91jpzyw.com/api.php/provide/vod", mode: "不可达" },
];

// 能挖到完整分类的源（cat 标记），各建分类浏览 + 最新榜模块
var ADULT_CAT_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24", "s25"];

function sourceByCat(cat) {
  for (var i = 0; i < ADULT_SOURCES.length; i++) {
    if (ADULT_SOURCES[i].cat === cat) return ADULT_SOURCES[i];
  }
  return null;
}

// 活跃源（排除 mode:"不可达"）：聚合播放/搜索只遍历这些，避免无谓的 5s 超时等待。
// 不可达源仍保留在 ADULT_SOURCES 里（若日后恢复可达，改 mode 即可重新启用）。
var ADULT_ACTIVE = [];
for (var ai = 0; ai < ADULT_SOURCES.length; ai++) {
  if (ADULT_SOURCES[ai].mode !== "不可达") ADULT_ACTIVE.push(ADULT_SOURCES[ai]);
}

WidgetMetadata = {
  id: "rex.mi3s.adult",
  title: "成人资源",
  description: "25 分类源浏览 + 最新榜 + 全局搜索 + 直链播放（[直连]/[代理]已标注）",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "3.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "adultCats1",
      title: "辣椒资源 [直连] · 分类",
      functionName: "catS1",
      description: "辣椒资源 32 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats2",
      title: "森林资源 [直连] · 分类",
      functionName: "catS2",
      description: "森林资源 56 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats3",
      title: "XXAV [直连] · 分类",
      functionName: "catS3",
      description: "XXAV 3 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats4",
      title: "番号资源 [直连] · 分类",
      functionName: "catS4",
      description: "番号资源 32 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats5",
      title: "麻豆资源 [直连] · 分类",
      functionName: "catS5",
      description: "麻豆资源 20 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats6",
      title: "madouse [直连] · 分类",
      functionName: "catS6",
      description: "madouse 8 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats7",
      title: "黄色仓库VIP [直连] · 分类",
      functionName: "catS7",
      description: "黄色仓库VIP 41 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats8",
      title: "CK资源 [直连] · 分类",
      functionName: "catS8",
      description: "CK资源 2 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats9",
      title: "大奶子 [直连] · 分类",
      functionName: "catS9",
      description: "大奶子 36 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats10",
      title: "老色逼 [直连] · 分类",
      functionName: "catS10",
      description: "老色逼 25 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats11",
      title: "155资源 [直连] · 分类",
      functionName: "catS11",
      description: "155资源 40 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats12",
      title: "souavZY [直连] · 分类",
      functionName: "catS12",
      description: "souavZY 99 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats13",
      title: "奶香资源 [直连] · 分类",
      functionName: "catS13",
      description: "奶香资源 33 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats14",
      title: "小鸡资源 [直连] · 分类",
      functionName: "catS14",
      description: "小鸡资源 38 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats15",
      title: "杏吧资源 [代理] · 分类",
      functionName: "catS15",
      description: "杏吧资源 57 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats16",
      title: "滴滴资源 [直连] · 分类",
      functionName: "catS16",
      description: "滴滴资源 28 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats17",
      title: "玉兔资源 [直连] · 分类",
      functionName: "catS17",
      description: "玉兔资源 25 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats18",
      title: "精品资源 [直连] · 分类",
      functionName: "catS18",
      description: "精品资源 29 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats19",
      title: "色猫资源 [直连] · 分类",
      functionName: "catS19",
      description: "色猫资源 27 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats20",
      title: "鲨鱼资源 [直连] · 分类",
      functionName: "catS20",
      description: "鲨鱼资源 22 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats21",
      title: "黄色仓库 [直连] · 分类",
      functionName: "catS21",
      description: "黄色仓库 41 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats22",
      title: "乐播资源 [直连] · 分类",
      functionName: "catS22",
      description: "乐播资源 17 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats23",
      title: "jkun资源 [直连] · 分类",
      functionName: "catS23",
      description: "jkun资源 25 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats24",
      title: "豆豆资源 [直连] · 分类",
      functionName: "catS24",
      description: "豆豆资源 28 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats25",
      title: "桃花资源 [直连] · 分类",
      functionName: "catS25",
      description: "桃花资源 15 个分类（动态拉取）",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultNews1",
      title: "辣椒资源 [直连] · 最新",
      functionName: "newS1",
      description: "辣椒资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews2",
      title: "森林资源 [直连] · 最新",
      functionName: "newS2",
      description: "森林资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews3",
      title: "XXAV [直连] · 最新",
      functionName: "newS3",
      description: "XXAV 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews4",
      title: "番号资源 [直连] · 最新",
      functionName: "newS4",
      description: "番号资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews5",
      title: "麻豆资源 [直连] · 最新",
      functionName: "newS5",
      description: "麻豆资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews6",
      title: "madouse [直连] · 最新",
      functionName: "newS6",
      description: "madouse 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews7",
      title: "黄色仓库VIP [直连] · 最新",
      functionName: "newS7",
      description: "黄色仓库VIP 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews8",
      title: "CK资源 [直连] · 最新",
      functionName: "newS8",
      description: "CK资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews9",
      title: "大奶子 [直连] · 最新",
      functionName: "newS9",
      description: "大奶子 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews10",
      title: "老色逼 [直连] · 最新",
      functionName: "newS10",
      description: "老色逼 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews11",
      title: "155资源 [直连] · 最新",
      functionName: "newS11",
      description: "155资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews12",
      title: "souavZY [直连] · 最新",
      functionName: "newS12",
      description: "souavZY 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews13",
      title: "奶香资源 [直连] · 最新",
      functionName: "newS13",
      description: "奶香资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews14",
      title: "小鸡资源 [直连] · 最新",
      functionName: "newS14",
      description: "小鸡资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews15",
      title: "杏吧资源 [代理] · 最新",
      functionName: "newS15",
      description: "杏吧资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews16",
      title: "滴滴资源 [直连] · 最新",
      functionName: "newS16",
      description: "滴滴资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews17",
      title: "玉兔资源 [直连] · 最新",
      functionName: "newS17",
      description: "玉兔资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews18",
      title: "精品资源 [直连] · 最新",
      functionName: "newS18",
      description: "精品资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews19",
      title: "色猫资源 [直连] · 最新",
      functionName: "newS19",
      description: "色猫资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews20",
      title: "鲨鱼资源 [直连] · 最新",
      functionName: "newS20",
      description: "鲨鱼资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews21",
      title: "黄色仓库 [直连] · 最新",
      functionName: "newS21",
      description: "黄色仓库 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews22",
      title: "乐播资源 [直连] · 最新",
      functionName: "newS22",
      description: "乐播资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews23",
      title: "jkun资源 [直连] · 最新",
      functionName: "newS23",
      description: "jkun资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews24",
      title: "豆豆资源 [直连] · 最新",
      functionName: "newS24",
      description: "豆豆资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "adultNews25",
      title: "桃花资源 [直连] · 最新",
      functionName: "newS25",
      description: "桃花资源 最新更新片单",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [{ name: "page", title: "页码", type: "page", value: "1" }],
    },
    {
      id: "loadResource",
      title: "成人资源 · 播放",
      functionName: "loadResource",
      description: "全部源分批并发聚合，输出可直接播放的 m3u8/mp4 直链",
      type: "stream",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
  ],
  search: {
    title: "搜成人片",
    functionName: "search",
    params: [
      {
        name: "keyword",
        title: "片名",
        type: "input",
        description: "输入片名，跨全部源搜索",
        placeholders: [
          { title: "麻豆", value: "麻豆" },
          { title: "国产", value: "国产" },
          { title: "日本无码", value: "日本无码" },
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function txt(v) { return v == null ? "" : String(v).trim(); }

function clean(v) {
  return txt(v).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/\s+/g, " ").trim();
}

function normTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\s：:·・—_\-–（）()\[\]【】,.，。'"“”\u200b\u200c\u200d\ufeff]/g, "");
}

var UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

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

async function httpGet(url) {
  return await Widget.http.get(url, {
    headers: { "User-Agent": UA },
    timeout: 5000,
  });
}

function isPlayableUrl(u) {
  return /^https?:\/\//i.test(u) && /\.(m3u8|mp4|flv|mkv)(\?|$)/i.test(u);
}

function parsePlayUrl(playUrl, playFrom) {
  var pu = String(playUrl || "").replace(/#+$/, "");
  if (!pu) return [];
  var froms = String(playFrom || "").split("$$$");
  var blocks = pu.split("$$$");
  var out = [];
  for (var i = 0; i < blocks.length; i++) {
    var lineName = clean(froms[i]) || "线路" + (i + 1);
    var chunks = blocks[i].split("#");
    for (var j = 0; j < chunks.length; j++) {
      var parts = chunks[j].split("$");
      if (parts.length < 2) continue;
      var label = clean(parts[0]);
      var url = clean(parts.slice(1).join("$"));
      if (!isPlayableUrl(url)) continue;
      out.push({ line: lineName, label: label, url: url });
    }
  }
  if (!out.length && isPlayableUrl(pu.trim())) {
    out.push({ line: clean(froms[0]) || "直链", label: "正片", url: pu.trim() });
  }
  return out;
}

function epNo(label) {
  var m = txt(label).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function picOf(it, base) {
  var p = it && it.vod_pic ? String(it.vod_pic) : "";
  if (!p) return "";
  if (/^https?:\/\//.test(p)) return p;
  var m = base.match(/^(https?:\/\/[^\/]+)/);
  var origin = m ? m[1] : "";
  if (p.charAt(0) === "/") return origin + p;
  return origin + "/" + p;
}

// ---------------------------------------------------------------------------
// 分类目录：拉 ac=list 响应的 class 字段 → [{id, title, pid}]
// ---------------------------------------------------------------------------

async function fetchClasses(src) {
  try {
    var d = unwrap(await httpGet(buildUrl(src.url, { ac: "list", pg: 1 })));
    var cl = (d && d.class) || [];
    if (!cl.length) return [];
    var out = [];
    for (var i = 0; i < cl.length; i++) {
      var c = cl[i];
      if (!c || c.type_id == null) continue;
      out.push({
        id: String(c.type_id),
        title: clean(c.type_name) || ("分类" + c.type_id),
        pid: c.type_pid == null ? 0 : String(c.type_pid),
      });
    }
    return out;
  } catch (e) {
    return [];
  }
}

function classesToNav(classes, srcName) {
  var tops = classes.filter(function (c) { return c.pid === "0" || c.pid === 0; });
  if (!tops.length) tops = classes;
  var out = [];
  for (var i = 0; i < tops.length; i++) {
    var top = tops[i];
    var subs = [];
    for (var k = 0; k < classes.length; k++) {
      if (classes[k].pid === top.id) subs.push({ id: classes[k].id, title: classes[k].title });
    }
    var item = {
      id: "cat-" + srcName + "-" + top.id,
      type: "detail",
      title: top.title,
      description: subs.length ? "含 " + subs.length + " 个子分类" : srcName + "分类",
      mediaType: "tv",
      genreTitle: srcName,
    };
    if (subs.length) item.genreItems = subs;
    out.push(item);
  }
  return out;
}

function listToItems(list, srcName, srcUrl) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || it.vod_id == null) continue;
    var cover = picOf(it, srcUrl);
    var item = {
      id: "ad-" + srcName + "-" + it.vod_id,
      type: "detail",
      title: clean(it.vod_name) || "未命名",
      description: clean(it.vod_remarks || it.type_name || ""),
      posterPath: cover,
      coverUrl: cover,
      mediaType: "tv",
      genreTitle: clean(it.type_name) || srcName,
    };
    if (it.vod_time) item.releaseDate = String(it.vod_time);
    out.push(item);
  }
  return out;
}

async function srcList(cat, params, genreId) {
  var src = sourceByCat(cat);
  if (!src) return [];
  var query = { ac: "list" };
  if (genreId) query.t = genreId;
  query.pg = parseInt(params && params.page, 10) || 1;
  try {
    var d = unwrap(await httpGet(buildUrl(src.url, query)));
    var list = (d && d.list) || [];
    return listToItems(list, cat, src.url);
  } catch (e) {
    return [];
  }
}

async function catEntry(cat, params) {
  var src = sourceByCat(cat);
  if (!src) return [];
  var genreId = params && (params.genreId || params.genre_id);
  if (genreId) {
    return await srcList(cat, params, String(genreId));
  }
  var classes = await fetchClasses(src);
  if (!classes.length) {
    return await srcList(cat, params, "");
  }
  return classesToNav(classes, cat);
}

async function newEntry(cat, params) { return await srcList(cat, params, ""); }

async function catS1(params) { return catEntry("s1", params); }
async function newS1(params) { return newEntry("s1", params); }
async function catS2(params) { return catEntry("s2", params); }
async function newS2(params) { return newEntry("s2", params); }
async function catS3(params) { return catEntry("s3", params); }
async function newS3(params) { return newEntry("s3", params); }
async function catS4(params) { return catEntry("s4", params); }
async function newS4(params) { return newEntry("s4", params); }
async function catS5(params) { return catEntry("s5", params); }
async function newS5(params) { return newEntry("s5", params); }
async function catS6(params) { return catEntry("s6", params); }
async function newS6(params) { return newEntry("s6", params); }
async function catS7(params) { return catEntry("s7", params); }
async function newS7(params) { return newEntry("s7", params); }
async function catS8(params) { return catEntry("s8", params); }
async function newS8(params) { return newEntry("s8", params); }
async function catS9(params) { return catEntry("s9", params); }
async function newS9(params) { return newEntry("s9", params); }
async function catS10(params) { return catEntry("s10", params); }
async function newS10(params) { return newEntry("s10", params); }
async function catS11(params) { return catEntry("s11", params); }
async function newS11(params) { return newEntry("s11", params); }
async function catS12(params) { return catEntry("s12", params); }
async function newS12(params) { return newEntry("s12", params); }
async function catS13(params) { return catEntry("s13", params); }
async function newS13(params) { return newEntry("s13", params); }
async function catS14(params) { return catEntry("s14", params); }
async function newS14(params) { return newEntry("s14", params); }
async function catS15(params) { return catEntry("s15", params); }
async function newS15(params) { return newEntry("s15", params); }
async function catS16(params) { return catEntry("s16", params); }
async function newS16(params) { return newEntry("s16", params); }
async function catS17(params) { return catEntry("s17", params); }
async function newS17(params) { return newEntry("s17", params); }
async function catS18(params) { return catEntry("s18", params); }
async function newS18(params) { return newEntry("s18", params); }
async function catS19(params) { return catEntry("s19", params); }
async function newS19(params) { return newEntry("s19", params); }
async function catS20(params) { return catEntry("s20", params); }
async function newS20(params) { return newEntry("s20", params); }
async function catS21(params) { return catEntry("s21", params); }
async function newS21(params) { return newEntry("s21", params); }
async function catS22(params) { return catEntry("s22", params); }
async function newS22(params) { return newEntry("s22", params); }
async function catS23(params) { return catEntry("s23", params); }
async function newS23(params) { return newEntry("s23", params); }
async function catS24(params) { return catEntry("s24", params); }
async function newS24(params) { return newEntry("s24", params); }
async function catS25(params) { return catEntry("s25", params); }
async function newS25(params) { return newEntry("s25", params); }

// ---------------------------------------------------------------------------
// 单源：搜索 → 详情 → 解析线路
// ---------------------------------------------------------------------------

async function queryOne(src, title, episode) {
  var base = src.url;
  var list = [];

  var probes = [
    buildUrl(base, { ac: "detail", wd: title }),
    buildUrl(base, { wd: title }),
  ];
  for (var p = 0; p < probes.length && !list.length; p++) {
    try {
      var payload = unwrap(await httpGet(probes[p]));
      var l = (payload && payload.list) || [];
      if (Array.isArray(l) && l.length) list = l;
    } catch (e) { /* 换下一种 */ }
  }
  if (!list.length) return [];

  var want = normTitle(title);
  var target = null;
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || !it.vod_id) continue;
    var n = normTitle(it.vod_name);
    if (!want) { target = it; break; }
    if (n === want || n.indexOf(want) >= 0 || want.indexOf(n) >= 0) { target = it; break; }
  }
  if (!target) return [];

  var playUrl = target.vod_play_url || "";
  var playFrom = target.vod_play_from || "";

  if (!playUrl) {
    try {
      var det = unwrap(await httpGet(buildUrl(base, { ac: "detail", ids: target.vod_id })));
      var d0 = (det && det.list && det.list[0]) || {};
      playUrl = d0.vod_play_url || "";
      playFrom = d0.vod_play_from || "";
    } catch (e) { return []; }
  }
  if (!playUrl) return [];

  var lines = parsePlayUrl(playUrl, playFrom);
  if (!lines.length) return [];

  var want2 = parseInt(episode, 10) || 1;
  var byEp = {};
  for (var k = 0; k < lines.length; k++) {
    var e = epNo(lines[k].label);
    if (!byEp[e]) byEp[e] = [];
    byEp[e].push(lines[k]);
  }
  var chosen = byEp[want2];
  if (!chosen || !chosen.length) {
    var keys = Object.keys(byEp);
    chosen = keys.length ? byEp[keys[0]] : lines;
  }

  var out = [];
  for (var m = 0; m < chosen.length; m++) {
    var ln = chosen[m];
    out.push({
      name: src.name + " · " + ln.line + " · " + ln.label,
      description: clean(target.vod_name) || title,
      url: ln.url,
      customHeaders: { "User-Agent": UA, Referer: base },
      playerType: "app",
    });
  }
  return out;
}

async function aggregate(title, episode) {
  var collected = [];
  var seen = {};
  var BATCH = 6;

  for (var b = 0; b < ADULT_ACTIVE.length; b += BATCH) {
    var slice = ADULT_ACTIVE.slice(b, b + BATCH);
    var settled = await Promise.all(slice.map(function (src) {
      return queryOne(src, title, episode).catch(function () { return []; });
    }));
    for (var x = 0; x < settled.length; x++) {
      var arr = settled[x];
      for (var y = 0; y < arr.length; y++) {
        var r = arr[y];
        if (seen[r.url]) continue;
        seen[r.url] = true;
        collected.push(r);
        if (collected.length >= 60) return collected;
      }
    }
  }
  return collected;
}

async function loadResource(params) {
  params = params || {};
  var title = txt(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);
  if (!title) return [];
  return await aggregate(title, episode);
}

async function search(params) {
  params = params || {};
  var kw = txt(params.keyword || params.query || params.title);
  if (!kw) return [];

  var out = [];
  var seenName = {};
  var BATCH = 8;
  for (var b = 0; b < ADULT_ACTIVE.length; b += BATCH) {
    var slice = ADULT_ACTIVE.slice(b, b + BATCH);
    var settled = await Promise.all(slice.map(function (src) {
      return searchOne(src, kw).catch(function () { return []; });
    }));
    for (var x = 0; x < settled.length; x++) {
      var arr = settled[x];
      for (var y = 0; y < arr.length; y++) {
        var it = arr[y];
        var key = normTitle(it.title);
        if (!key || seenName[key]) continue;
        seenName[key] = true;
        out.push(it);
        if (out.length >= 40) return out;
      }
    }
  }
  return out;
}

async function searchOne(src, kw) {
  var base = src.url;
  var list = [];
  var probes = [
    buildUrl(base, { ac: "detail", wd: kw }),
    buildUrl(base, { wd: kw }),
  ];
  for (var p = 0; p < probes.length && !list.length; p++) {
    try {
      var payload = unwrap(await httpGet(probes[p]));
      var l = (payload && payload.list) || [];
      if (Array.isArray(l) && l.length) list = l;
    } catch (e) { /* 换下一种 */ }
  }
  if (!list.length) return [];

  var out = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || it.vod_id == null) continue;
    var cover = picOf(it, base);
    out.push({
      id: "ads-" + (src.cat || "x") + "-" + it.vod_id,
      type: "detail",
      title: clean(it.vod_name) || "未命名",
      description: clean(it.type_name || it.vod_remarks || src.name),
      posterPath: cover,
      coverUrl: cover,
      mediaType: "tv",
      genreTitle: src.name + (it.type_name ? " · " + clean(it.type_name) : ""),
    });
  }
  return out;
}
