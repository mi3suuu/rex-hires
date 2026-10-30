// ============================================================================
// Rex 模块 · 成人资源（rex.mi3s.adult）
// ----------------------------------------------------------------------------
// 全部为公网可直连的苹果CMS v10 源，不依赖任何本机中转。
// 开代理后重新全量探测（2026-10-30）：直连可达 29、仅代理 1（杏吧）、不可达 12。
//   25 个源能挖到完整分类（接口 ?ac=list 响应的 class 字段）。
//
// 能力：
//   1) 分类浏览：25 源各一个 video 模块，源名标注 [直连]/[代理]，分类动态拉取。
//   2) 最新榜：25 源各一个「最新」模块。
//   3) 每源独立搜索：30 源各一个「搜索」模块（input 参数，搜单源）。
//   4) 全局聚合搜索：search 块接入 Rex 总搜索开关，跨全部源搜片名。
//   5) 播放：stream 聚合播放源，分批并发解析直链。
//
// 标注：[直连]=无需代理；[代理]=手机需挂 VPN/Clash。
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
  { name: "香奶儿资源", url: "https://www.gdlsp.com/api/json.php", mode: "直连", cat: "香奶儿资源" },
  { name: "淫水机资源", url: "https://www.xrbsp.com/api/json.php", mode: "直连", cat: "淫水机资源" },
  { name: "白嫖资源", url: "https://www.kxgav.com/api/json.php", mode: "直连", cat: "白嫖资源" },
  { name: "美少女资源", url: "https://www.msnii.com/api/json.php", mode: "直连", cat: "美少女资源" },
  { name: "黄AV资源", url: "https://www.pgxdy.com/api/json.php", mode: "直连", cat: "黄AV资源" },
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

var ADULT_CAT_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24", "s25"];
var ADULT_JSON_KEYS = ["香奶儿资源", "淫水机资源", "白嫖资源", "美少女资源", "黄AV资源"];

function sourceByCat(cat) {
  for (var i = 0; i < ADULT_SOURCES.length; i++) {
    if (ADULT_SOURCES[i].cat === cat) return ADULT_SOURCES[i];
  }
  return null;
}

var ADULT_ACTIVE = [];
for (var ai = 0; ai < ADULT_SOURCES.length; ai++) {
  if (ADULT_SOURCES[ai].mode !== "不可达") ADULT_ACTIVE.push(ADULT_SOURCES[ai]);
}

WidgetMetadata = {
  id: "rex.mi3s.adult",
  title: "成人资源",
  description: "25分类+最新榜+每源搜索+全局搜索+播放（探测优先+聚合兜底）",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "3.8.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "adultCats1",
      title: "辣椒资源 [直连] · 最新",
      functionName: "catS1",
      description: "辣椒资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats2",
      title: "森林资源 [直连] · 最新",
      functionName: "catS2",
      description: "森林资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats3",
      title: "XXAV [直连] · 最新",
      functionName: "catS3",
      description: "XXAV 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats4",
      title: "番号资源 [直连] · 最新",
      functionName: "catS4",
      description: "番号资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats5",
      title: "麻豆资源 [直连] · 最新",
      functionName: "catS5",
      description: "麻豆资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats6",
      title: "madouse [直连] · 最新",
      functionName: "catS6",
      description: "madouse 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats7",
      title: "黄色仓库VIP [直连] · 最新",
      functionName: "catS7",
      description: "黄色仓库VIP 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats8",
      title: "CK资源 [直连] · 最新",
      functionName: "catS8",
      description: "CK资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats9",
      title: "大奶子 [直连] · 最新",
      functionName: "catS9",
      description: "大奶子 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats10",
      title: "老色逼 [直连] · 最新",
      functionName: "catS10",
      description: "老色逼 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats11",
      title: "155资源 [直连] · 最新",
      functionName: "catS11",
      description: "155资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats12",
      title: "souavZY [直连] · 最新",
      functionName: "catS12",
      description: "souavZY 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats13",
      title: "奶香资源 [直连] · 最新",
      functionName: "catS13",
      description: "奶香资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats14",
      title: "小鸡资源 [直连] · 最新",
      functionName: "catS14",
      description: "小鸡资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats15",
      title: "杏吧资源 [代理] · 最新",
      functionName: "catS15",
      description: "杏吧资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats16",
      title: "滴滴资源 [直连] · 最新",
      functionName: "catS16",
      description: "滴滴资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats17",
      title: "玉兔资源 [直连] · 最新",
      functionName: "catS17",
      description: "玉兔资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats18",
      title: "精品资源 [直连] · 最新",
      functionName: "catS18",
      description: "精品资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats19",
      title: "色猫资源 [直连] · 最新",
      functionName: "catS19",
      description: "色猫资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats20",
      title: "鲨鱼资源 [直连] · 最新",
      functionName: "catS20",
      description: "鲨鱼资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats21",
      title: "黄色仓库 [直连] · 最新",
      functionName: "catS21",
      description: "黄色仓库 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats22",
      title: "乐播资源 [直连] · 最新",
      functionName: "catS22",
      description: "乐播资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats23",
      title: "jkun资源 [直连] · 最新",
      functionName: "catS23",
      description: "jkun资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats24",
      title: "豆豆资源 [直连] · 最新",
      functionName: "catS24",
      description: "豆豆资源 最新列表（点开即播）",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
    {
      id: "adultCats25",
      title: "桃花资源 [直连] · 最新",
      functionName: "catS25",
      description: "桃花资源 最新列表（点开即播）",
      cacheDuration: 0,
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
      id: "adultSearchs1",
      title: "辣椒资源 [直连] · 搜索",
      functionName: "searchS1",
      description: "在 辣椒资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 辣椒资源 内搜索" }],
    },
    {
      id: "adultSearchs2",
      title: "森林资源 [直连] · 搜索",
      functionName: "searchS2",
      description: "在 森林资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 森林资源 内搜索" }],
    },
    {
      id: "adultSearchs3",
      title: "XXAV [直连] · 搜索",
      functionName: "searchS3",
      description: "在 XXAV 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 XXAV 内搜索" }],
    },
    {
      id: "adultSearchs4",
      title: "番号资源 [直连] · 搜索",
      functionName: "searchS4",
      description: "在 番号资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 番号资源 内搜索" }],
    },
    {
      id: "adultSearchs5",
      title: "麻豆资源 [直连] · 搜索",
      functionName: "searchS5",
      description: "在 麻豆资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 麻豆资源 内搜索" }],
    },
    {
      id: "adultSearchs6",
      title: "madouse [直连] · 搜索",
      functionName: "searchS6",
      description: "在 madouse 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 madouse 内搜索" }],
    },
    {
      id: "adultSearchs7",
      title: "黄色仓库VIP [直连] · 搜索",
      functionName: "searchS7",
      description: "在 黄色仓库VIP 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 黄色仓库VIP 内搜索" }],
    },
    {
      id: "adultSearchs8",
      title: "CK资源 [直连] · 搜索",
      functionName: "searchS8",
      description: "在 CK资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 CK资源 内搜索" }],
    },
    {
      id: "adultSearchs9",
      title: "大奶子 [直连] · 搜索",
      functionName: "searchS9",
      description: "在 大奶子 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 大奶子 内搜索" }],
    },
    {
      id: "adultSearchs10",
      title: "老色逼 [直连] · 搜索",
      functionName: "searchS10",
      description: "在 老色逼 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 老色逼 内搜索" }],
    },
    {
      id: "adultSearchs11",
      title: "155资源 [直连] · 搜索",
      functionName: "searchS11",
      description: "在 155资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 155资源 内搜索" }],
    },
    {
      id: "adultSearchs12",
      title: "souavZY [直连] · 搜索",
      functionName: "searchS12",
      description: "在 souavZY 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 souavZY 内搜索" }],
    },
    {
      id: "adultSearchs13",
      title: "奶香资源 [直连] · 搜索",
      functionName: "searchS13",
      description: "在 奶香资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 奶香资源 内搜索" }],
    },
    {
      id: "adultSearchs14",
      title: "小鸡资源 [直连] · 搜索",
      functionName: "searchS14",
      description: "在 小鸡资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 小鸡资源 内搜索" }],
    },
    {
      id: "adultSearchs15",
      title: "杏吧资源 [代理] · 搜索",
      functionName: "searchS15",
      description: "在 杏吧资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 杏吧资源 内搜索" }],
    },
    {
      id: "adultSearchs16",
      title: "滴滴资源 [直连] · 搜索",
      functionName: "searchS16",
      description: "在 滴滴资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 滴滴资源 内搜索" }],
    },
    {
      id: "adultSearchs17",
      title: "玉兔资源 [直连] · 搜索",
      functionName: "searchS17",
      description: "在 玉兔资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 玉兔资源 内搜索" }],
    },
    {
      id: "adultSearchs18",
      title: "精品资源 [直连] · 搜索",
      functionName: "searchS18",
      description: "在 精品资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 精品资源 内搜索" }],
    },
    {
      id: "adultSearchs19",
      title: "色猫资源 [直连] · 搜索",
      functionName: "searchS19",
      description: "在 色猫资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 色猫资源 内搜索" }],
    },
    {
      id: "adultSearchs20",
      title: "鲨鱼资源 [直连] · 搜索",
      functionName: "searchS20",
      description: "在 鲨鱼资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 鲨鱼资源 内搜索" }],
    },
    {
      id: "adultSearchs21",
      title: "黄色仓库 [直连] · 搜索",
      functionName: "searchS21",
      description: "在 黄色仓库 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 黄色仓库 内搜索" }],
    },
    {
      id: "adultSearchs22",
      title: "乐播资源 [直连] · 搜索",
      functionName: "searchS22",
      description: "在 乐播资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 乐播资源 内搜索" }],
    },
    {
      id: "adultSearchs23",
      title: "jkun资源 [直连] · 搜索",
      functionName: "searchS23",
      description: "在 jkun资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 jkun资源 内搜索" }],
    },
    {
      id: "adultSearchs24",
      title: "豆豆资源 [直连] · 搜索",
      functionName: "searchS24",
      description: "在 豆豆资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 豆豆资源 内搜索" }],
    },
    {
      id: "adultSearchs25",
      title: "桃花资源 [直连] · 搜索",
      functionName: "searchS25",
      description: "在 桃花资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 桃花资源 内搜索" }],
    },
    {
      id: "adultSearchJson_香奶儿资源",
      title: "香奶儿资源 [直连] · 搜索",
      functionName: "searchJson_香奶儿资源",
      description: "在 香奶儿资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 香奶儿资源 内搜索" }],
    },
    {
      id: "adultSearchJson_淫水机资源",
      title: "淫水机资源 [直连] · 搜索",
      functionName: "searchJson_淫水机资源",
      description: "在 淫水机资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 淫水机资源 内搜索" }],
    },
    {
      id: "adultSearchJson_白嫖资源",
      title: "白嫖资源 [直连] · 搜索",
      functionName: "searchJson_白嫖资源",
      description: "在 白嫖资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 白嫖资源 内搜索" }],
    },
    {
      id: "adultSearchJson_美少女资源",
      title: "美少女资源 [直连] · 搜索",
      functionName: "searchJson_美少女资源",
      description: "在 美少女资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 美少女资源 内搜索" }],
    },
    {
      id: "adultSearchJson_黄AV资源",
      title: "黄AV资源 [直连] · 搜索",
      functionName: "searchJson_黄AV资源",
      description: "在 黄AV资源 内搜索片名",
      cacheDuration: 0,
      requiresWebView: false,
      params: [{ name: "keyword", title: "片名", type: "input", description: "在 黄AV资源 内搜索" }],
    },
    {
      id: "loadResource",
      title: "成人资源 · 播放",
      functionName: "loadResource",
      description: "全部源分批并发聚合，输出可播放 m3u8/mp4 直链",
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
// 分类目录
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
      type: "url",
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

// 基础条目（无详情时的降级形态，保证条目不消失）
// ★ 关键修复：type 弃用 "detail"（官方只支持 url/douban/imdb/tmdb/forward）。
//   条目 id 编码 "ad-<cat>-<vod_id>"，点开后 Rex 调 loadResource，凭 params.id 精确定位。
function baseItem(it, srcName, srcUrl) {
  var cover = picOf(it, srcUrl);
  var item = {
    id: "ad-" + srcName + "-" + it.vod_id,
    type: "url",
    title: clean(it.vod_name) || "未命名",
    description: clean(it.vod_remarks || it.type_name || ""),
    posterPath: cover,
    coverUrl: cover,
    mediaType: "tv",
    genreTitle: clean(it.type_name) || srcName,
    link: buildUrl(srcUrl, { ac: "detail", ids: it.vod_id }),
    playerType: "app",
  };
  if (it.vod_time) item.releaseDate = String(it.vod_time);
  return item;
}

// 单条详情补全：列表接口普遍不带 vod_pic/vod_play_url，需逐个调 ac=detail&ids= 拿。
// 成功返回 { item, videoUrl }，失败返回 null（由调用方降级为 baseItem）。
async function enrichOne(src, it, srcName) {
  if (!it || it.vod_id == null) return null;
  try {
    var det = unwrap(await httpGet(buildUrl(src.url, { ac: "detail", ids: it.vod_id })));
    var d0 = (det && det.list && det.list[0]) || {};
    // 详情带完整海报则覆盖；否则沿用列表自带
    var pic = picOf(d0, src.url) || picOf(it, src.url);
    var playUrl = d0.vod_play_url || it.vod_play_url || "";
    var playFrom = d0.vod_play_from || it.vod_play_from || "";
    var item = baseItem(it, srcName, src.url);
    if (pic) { item.posterPath = pic; item.coverUrl = pic; }
    // 解析全部可播放直链：主条目放首条，其余塞 childItems 作多线路备选
    // （苹果CMS 采集源直链域名不稳定，单一直链超时会导致"一直加载"，多线路可手动切换）
    var lines = parsePlayUrl(playUrl, playFrom);
    if (lines.length) {
      item.type = "url";
      item.videoUrl = lines[0].url;
      item.playerType = "app";
      if (lines.length > 1) {
        var kids = [];
        for (var li = 1; li < lines.length; li++) {
          kids.push({
            id: "ad-" + srcName + "-" + it.vod_id + "-l" + li,
            type: "url",
            title: lines[li].line + " · " + lines[li].label,
            videoUrl: lines[li].url,
            playerType: "app",
          });
        }
        if (kids.length) item.childItems = kids;
      }
    }
    return item;
  } catch (e) {
    return null;
  }
}

// 详情加载：Rex 详情页可能用条目的 link 调用此顶层函数（官方约定 loadDetail(link)）。
// 调详情拿 vod_pic + vod_play_url，解析成 type="url" + videoUrl + 多线路 childItems。
async function loadDetail(link) {
  if (!link) return null;
  try {
    var det = unwrap(await httpGet(link));
    var d0 = (det && det.list && det.list[0]) || det || {};
    var origin = (String(link).match(/^(https?:\/\/[^\/]+)/) || [])[1] || "";
    var pic = picOf(d0, origin);
    var playUrl = d0.vod_play_url || "";
    var playFrom = d0.vod_play_from || "";
    var item = {
      id: "adl-" + (d0.vod_id != null ? d0.vod_id : encodeURIComponent(link).slice(-16)),
      type: "url",
      title: clean(d0.vod_name) || "未命名",
      description: clean(d0.vod_remarks || d0.type_name || d0.vod_content || ""),
      posterPath: pic,
      coverUrl: pic,
      mediaType: "tv",
      genreTitle: clean(d0.type_name) || "",
      link: link,
      playerType: "app",
    };
    if (d0.vod_time) item.releaseDate = String(d0.vod_time);
    if (d0.vod_score) item.rating = String(d0.vod_score);
    var lines = parsePlayUrl(playUrl, playFrom);
    if (lines.length) {
      item.videoUrl = lines[0].url;
      if (lines.length > 1) {
        var kids = [];
        for (var li = 1; li < lines.length; li++) {
          kids.push({
            id: "adl-" + d0.vod_id + "-l" + li,
            type: "url",
            title: lines[li].line + " · " + lines[li].label,
            videoUrl: lines[li].url,
            playerType: "app",
          });
        }
        if (kids.length) item.childItems = kids;
      }
    }
    return item;
  } catch (e) {
    return null;
  }
}

// 列表：仅拉 ac=list 一次，快速返回条目（不做详情预解析）。
// ★ v3.4.0 关键修复：之前对每条做 ac=detail 预解析，真机网络下 20 条 = 20+ 次慢请求，
//   导致列表一直 Loading。现改为点开条目时由 Rex 调 loadResource(stream) 精确定位直链，列表秒开。
async function srcList(cat, params, genreId) {
  var src = sourceByCat(cat);
  if (!src) return [];
  var query = { ac: "list" };
  if (genreId) query.t = genreId;
  query.pg = parseInt(params && params.page, 10) || 1;
  var list;
  try {
    var d = unwrap(await httpGet(buildUrl(src.url, query)));
    list = (d && d.list) || [];
  } catch (e) {
    return [];
  }
  if (!list.length) return [];

  var out = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (!it || it.vod_id == null) continue;
    out.push(baseItem(it, cat, src.url));
  }
  return out;
}

async function catEntry(cat, params) {
  // ★ v3.5.0：分类导航（classesToNav 返回 type:"detail" 分类条目）在 Rex 里点开会走
  //   loadDetail 流程导致卡 Loading（Rex 分类筛选只能用静态 enumeration 参数，不支持动态分类导航）。
  //   改为直接返回最新列表（ac=list），分类筛选交给全局搜索/最新榜。
  var genreId = params && (params.genreId || params.genre_id);
  return await srcList(cat, params, genreId ? String(genreId) : "");
}

async function newEntry(cat, params) { return await srcList(cat, params, ""); }

// 单源搜索（每源独立搜索入口）：搜该源 → 可点击条目
async function searchByCat(cat, params) {
  var src = sourceByCat(cat);
  if (!src) return [];
  var kw = txt(params && (params.keyword || params.query || params.title));
  if (!kw) return [];
  var arr = await searchOne(src, kw);
  return arr;
}

async function catS1(params) { return catEntry("s1", params); }
async function newS1(params) { return newEntry("s1", params); }
async function searchS1(params) { return searchByCat("s1", params); }
async function catS2(params) { return catEntry("s2", params); }
async function newS2(params) { return newEntry("s2", params); }
async function searchS2(params) { return searchByCat("s2", params); }
async function catS3(params) { return catEntry("s3", params); }
async function newS3(params) { return newEntry("s3", params); }
async function searchS3(params) { return searchByCat("s3", params); }
async function catS4(params) { return catEntry("s4", params); }
async function newS4(params) { return newEntry("s4", params); }
async function searchS4(params) { return searchByCat("s4", params); }
async function catS5(params) { return catEntry("s5", params); }
async function newS5(params) { return newEntry("s5", params); }
async function searchS5(params) { return searchByCat("s5", params); }
async function catS6(params) { return catEntry("s6", params); }
async function newS6(params) { return newEntry("s6", params); }
async function searchS6(params) { return searchByCat("s6", params); }
async function catS7(params) { return catEntry("s7", params); }
async function newS7(params) { return newEntry("s7", params); }
async function searchS7(params) { return searchByCat("s7", params); }
async function catS8(params) { return catEntry("s8", params); }
async function newS8(params) { return newEntry("s8", params); }
async function searchS8(params) { return searchByCat("s8", params); }
async function catS9(params) { return catEntry("s9", params); }
async function newS9(params) { return newEntry("s9", params); }
async function searchS9(params) { return searchByCat("s9", params); }
async function catS10(params) { return catEntry("s10", params); }
async function newS10(params) { return newEntry("s10", params); }
async function searchS10(params) { return searchByCat("s10", params); }
async function catS11(params) { return catEntry("s11", params); }
async function newS11(params) { return newEntry("s11", params); }
async function searchS11(params) { return searchByCat("s11", params); }
async function catS12(params) { return catEntry("s12", params); }
async function newS12(params) { return newEntry("s12", params); }
async function searchS12(params) { return searchByCat("s12", params); }
async function catS13(params) { return catEntry("s13", params); }
async function newS13(params) { return newEntry("s13", params); }
async function searchS13(params) { return searchByCat("s13", params); }
async function catS14(params) { return catEntry("s14", params); }
async function newS14(params) { return newEntry("s14", params); }
async function searchS14(params) { return searchByCat("s14", params); }
async function catS15(params) { return catEntry("s15", params); }
async function newS15(params) { return newEntry("s15", params); }
async function searchS15(params) { return searchByCat("s15", params); }
async function catS16(params) { return catEntry("s16", params); }
async function newS16(params) { return newEntry("s16", params); }
async function searchS16(params) { return searchByCat("s16", params); }
async function catS17(params) { return catEntry("s17", params); }
async function newS17(params) { return newEntry("s17", params); }
async function searchS17(params) { return searchByCat("s17", params); }
async function catS18(params) { return catEntry("s18", params); }
async function newS18(params) { return newEntry("s18", params); }
async function searchS18(params) { return searchByCat("s18", params); }
async function catS19(params) { return catEntry("s19", params); }
async function newS19(params) { return newEntry("s19", params); }
async function searchS19(params) { return searchByCat("s19", params); }
async function catS20(params) { return catEntry("s20", params); }
async function newS20(params) { return newEntry("s20", params); }
async function searchS20(params) { return searchByCat("s20", params); }
async function catS21(params) { return catEntry("s21", params); }
async function newS21(params) { return newEntry("s21", params); }
async function searchS21(params) { return searchByCat("s21", params); }
async function catS22(params) { return catEntry("s22", params); }
async function newS22(params) { return newEntry("s22", params); }
async function searchS22(params) { return searchByCat("s22", params); }
async function catS23(params) { return catEntry("s23", params); }
async function newS23(params) { return newEntry("s23", params); }
async function searchS23(params) { return searchByCat("s23", params); }
async function catS24(params) { return catEntry("s24", params); }
async function newS24(params) { return newEntry("s24", params); }
async function searchS24(params) { return searchByCat("s24", params); }
async function catS25(params) { return catEntry("s25", params); }
async function newS25(params) { return newEntry("s25", params); }
async function searchS25(params) { return searchByCat("s25", params); }
async function searchJson_香奶儿资源(params) { return searchByCat("香奶儿资源", params); }
async function searchJson_淫水机资源(params) { return searchByCat("淫水机资源", params); }
async function searchJson_白嫖资源(params) { return searchByCat("白嫖资源", params); }
async function searchJson_美少女资源(params) { return searchByCat("美少女资源", params); }
async function searchJson_黄AV资源(params) { return searchByCat("黄AV资源", params); }

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
      customHeaders: {
        "User-Agent": UA,
        Referer: base,
        "X-Forward-Skip-Redirect-Probe": "1",
      },
      playerType: "app",
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 直链健康探测（★ v3.7.0 核心修复）
// ---------------------------------------------------------------------------
// 背景：苹果CMS 采集源的播放直链域名（如 2609.lajiao2026.com / *.senlin2026.com 等
//   「数字前缀+日期+泛域名」CDN）时通时断。实测 24 源里 11 个直链域名 TLS 握手卡死/403，
//   11 个可达。用户点的那部片若恰好落在挂掉的源，直链解析出来但播放器拿 m3u8 起播就
//   一直 loading（参照片 Apple 官方测试片证明播放器本身对 HLS 完全正常）。
// 所以：起播前对候选 m3u8 直链做可达性探测，剔除/后置不可达的，只把可达的交给播放器。
//
// 探测方式：Widget.http.get 短超时（m3u8 是几 KB 的文本 playlist，代价小）。
//   mp4/flv 直链不探测（会真的下载视频体），直接判为「未知」保留。
// ---------------------------------------------------------------------------

// 单个直链可达性探测：返回 true(可达) / false(不可达) / null(未知，跳过探测的格式)
async function probeUrl(url, ms) {
  if (!url) return null;
  // 只对 m3u8（HLS playlist）探测；mp4/flv/mkv 直接下载体，探测代价太高 → 返回 null(未知)
  if (!/\.m3u8(\?|$)/i.test(url)) return null;
  try {
    var resp = await Widget.http.get(url, {
      headers: { "User-Agent": UA },
      timeout: ms || 3000,
    });
    // 有响应即视为可达；data 为空字符串/404 也视为不可达
    var d = resp && resp.data !== undefined ? resp.data : resp;
    if (d == null) return false;
    if (typeof d === "string" && !d.trim()) return false;
    // m3u8 开头应是 #EXTM3U；但有些源返回重定向后的文本，只要非空且非错误页即可
    var s = typeof d === "string" ? d : (d.body || "");
    if (typeof s === "string" && /<html|<body|error|not found/i.test(s.slice(0, 200))) return false;
    return true;
  } catch (e) {
    return false; // 超时/网络错误 → 不可达
  }
}

// 对一批结果做并发可达性探测，返回排序后的列表：可达的在前，不可达的排后（不丢弃，
// 万一设备网络环境不同仍可手动切换）。unknown(null) 的（mp4 直链）排中间。
async function rankByProbe(results, cap) {
  if (!results || !results.length) return results || [];
  var CONC = 8;
  var ok = [], unknown = [], bad = [];
  // 分批并发探测，避免一次性 60 条全打出去
  for (var b = 0; b < results.length; b += CONC) {
    var slice = results.slice(b, b + CONC);
    var flags = await Promise.all(slice.map(function (r) {
      return probeUrl(r.url, 3000).catch(function () { return false; });
    }));
    for (var x = 0; x < slice.length; x++) {
      var r = slice[x];
      var f = flags[x];
      if (f === true) ok.push(r);
      else if (f === false) bad.push(r);
      else unknown.push(r);
    }
    // 一旦拿到足够的可达直链就提前停，不用探测全部
    if (ok.length >= (cap || 5)) break;
  }
  return ok.concat(unknown).concat(bad);
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
        if (collected.length >= 60) break;
      }
      if (collected.length >= 60) break;
    }
    if (collected.length >= 60) break;
  }
  // 只收集，不探测（探测由 loadResource 统一做，避免重复）
  return collected;
}

// 按 vod_id 精确定位：直接调 ac=detail&ids= 拿该片的播放地址，返回 StreamSourceItem[]。
// 这是「点开条目」时最快的路径，避免片名模糊搜索命错片/超时。
async function queryByVodId(src, vodId, title) {
  try {
    var det = unwrap(await httpGet(buildUrl(src.url, { ac: "detail", ids: vodId })));
    var d0 = (det && det.list && det.list[0]) || {};
    var playUrl = d0.vod_play_url || "";
    var playFrom = d0.vod_play_from || "";
    if (!playUrl) return [];
    var lines = parsePlayUrl(playUrl, playFrom);
    if (!lines.length) return [];
    var out = [];
    for (var m = 0; m < lines.length; m++) {
      var ln = lines[m];
      out.push({
        name: src.name + " · " + ln.line + " · " + ln.label,
        description: clean(d0.vod_name) || title || "",
        url: ln.url,
        customHeaders: {
          "User-Agent": UA,
          Referer: src.url,
          "X-Forward-Skip-Redirect-Probe": "1",
        },
        playerType: "app",
      });
    }
    return out;
  } catch (e) {
    return [];
  }
}

// 从 params 里提取定位信息：优先 params.id（"ad-<cat>-<vod_id>"），其次 params.link（?ac=detail&ids=）。
function vodLocateFromParams(params) {
  if (!params) return null;
  // 1) id 形如 "ad-s1-12345"（cat 可能含中文，如 "ad-白嫖资源-123"）
  var id = txt(params.id);
  var im = id.match(/^ad-(.+)-(\d+)$/);
  if (im) return { cat: im[1], vodId: im[2] };
  // 2) link 形如 "...?ac=detail&ids=12345"
  var link = txt(params.link);
  var lm = link.match(/[?&]ids=(\d+)/);
  if (lm) {
    var cm = link.match(/^(https?:\/\/[^\/]+)/);
    var origin = cm ? cm[1] : "";
    var cat = "";
    for (var i = 0; i < ADULT_SOURCES.length; i++) {
      if (ADULT_SOURCES[i].url.indexOf(origin) >= 0) { cat = ADULT_SOURCES[i].cat || ""; break; }
    }
    return { cat: cat, vodId: lm[1] };
  }
  return null;
}

async function loadResource(params) {
  params = params || {};
  var title = txt(params.seriesName || params.title || params.name);
  var episode = params.episode == null ? 1 : Number(params.episode);

  // ★ v3.8.0 性能修复：探测优先、聚合兜底。
  //   v3.7.0 的「无条件跨源聚合 + 再探测」在真机上太慢（29 源扫描 + 不可达探测超时），
  //   反而重新引入「一直 loading」。正确做法：
  //     1) 精确定位直链（1 次请求）
  //     2) 只探测这一条直链——可达就直接返回（最快路径）
  //     3) 只有不可达/无直链时，才跨源片名聚合兜底

  // 1) 精确定位
  var direct = [];
  var loc = vodLocateFromParams(params);
  if (loc && loc.vodId) {
    var src = null;
    if (loc.cat) src = sourceByCat(loc.cat);
    if (!src) {
      var linkOrigin = (txt(params.link).match(/^(https?:\/\/[^\/]+)/) || [])[1];
      if (linkOrigin) {
        for (var i = 0; i < ADULT_ACTIVE.length; i++) {
          if (ADULT_ACTIVE[i].url.indexOf(linkOrigin) >= 0) { src = ADULT_ACTIVE[i]; break; }
        }
      }
    }
    if (src) {
      direct = await queryByVodId(src, loc.vodId, title).catch(function () { return []; });
    }
  }

  // 2) 精确定位命中：只探测这些直链，有可达就返回（最快路径，最多几次短探测）
  if (direct.length) {
    // 直接探测排序；cap=1 表示拿到 1 条可达即可提前停（但 unknown/mp4 也算可用）
    var ranked = await rankByProbe(direct, 3);
    // 检查排序后第一条是否「可达或未知」（即非明确的不可达）
    if (ranked.length) {
      var head = ranked[0];
      // mp4/flv 直链 probeUrl 返回 null(未知)，视为可用，不触发慢的跨源聚合
      if (!/\.m3u8(\?|$)/i.test(head.url)) {
        return ranked; // 非 m3u8 直链，直接返回
      }
      // m3u8 直链：探测第一条
      var ok = await probeUrl(head.url, 3000);
      if (ok === true) {
        return ranked; // 可达，直接返回
      }
      // 第一条不可达：看排第二的（rankByProbe 已把可达排前，若有多条）
      // 直接返回 ranked（即使第一条不可达，可达的也在前面，播放器会逐个试）
      // 但为了保险，触发跨源聚合补充可达源
    }
  }

  // 3) 精确定位不可达/无直链 → 跨源片名聚合兜底（慢，但此时没有别的办法）
  if (title) {
    var agg = await aggregate(title, episode);
    if (agg.length) {
      return await rankByProbe(agg, 3);
    }
  }

  // 4) 兜底失败：返回精确定位的结果（可能有不可达的，但至少让用户看到线路）
  return direct.length ? direct : [];
}

// 全局聚合搜索（search 块，接入 Rex 总开关）
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
    var item = {
      id: "ads-" + (src.cat || "x") + "-" + it.vod_id,
      type: "url",
      title: clean(it.vod_name) || "未命名",
      description: clean(it.type_name || it.vod_remarks || src.name),
      posterPath: cover,
      coverUrl: cover,
      mediaType: "tv",
      genreTitle: src.name + (it.type_name ? " · " + clean(it.type_name) : ""),
      link: buildUrl(base, { ac: "detail", ids: it.vod_id }),
      playerType: "app",
    };
    // 搜索接口(ac=detail&wd=)多数直接带 vod_play_url，就地解析直链；无则降级 detail。
    var playUrl = it.vod_play_url || "";
    var playFrom = it.vod_play_from || "";
    if (playUrl) {
      var lines = parsePlayUrl(playUrl, playFrom);
      if (lines.length) {
        item.type = "url";
        item.videoUrl = lines[0].url;
        item.playerType = "app";
        if (lines.length > 1) {
          var kids = [];
          for (var li = 1; li < lines.length; li++) {
            kids.push({
              id: "ads-" + (src.cat || "x") + "-" + it.vod_id + "-l" + li,
              type: "url",
              title: lines[li].line + " · " + lines[li].label,
              videoUrl: lines[li].url,
              playerType: "app",
            });
          }
          if (kids.length) item.childItems = kids;
        }
      }
    }
    out.push(item);
  }
  return out;
}
