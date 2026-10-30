// ============================================================================
// Rex 模块 · 可可影视（rex.mi3s.kkdy）
// ----------------------------------------------------------------------------
// 直连可可影视 App 的私有 API，不依赖任何本机中转 / 代理。
// 逆自 com.kkdyC1V261021.T120540 (3.5.0)：
//   · 请求签名 = HMAC-SHA1（key 由三段常量拼接），签名串 GET|path|qs|ts|secrets|
//   · 响应体 = AES-256-CBC/PKCS7 密文，命中 encrypted:1 时需解密
//   · 列表 /vod/channel/list.capi、详情 /v2/vod/detail.capi
//
// Rex 运行时没有 crypto / Buffer / TextEncoder，所以 SHA1、HMAC-SHA1、
// AES-256-CBC 全部用纯 JS 实现；二进制响应体通过 UTF-16 码元还原成字节数组。
//
// 官方搜索接口对新设备恒返回 40401「请重新初始化」，各域名一致，无法绕过，
// 因此本模块只做「分类浏览」，并在列表阶段就把每部片的播放直链解析好。
// ============================================================================


// 图片域名（来自 appInit.groups.vod1，按权重排序）
var KKDY_IMG = [
  "https://vres.xqdhkqt.cn/vod1",
  "https://vres.mppcdrr.cn/vod1",
  "https://vres.kbksn.com/vod1",
  "https://vres.afxgnjg.cn/vod1",
  "https://vres.kvod7.com/vod1",
  "https://vres.dsty25.com/vod1",
];

var KKDY_HOSTS = [
  "https://vcache.mjrlin.cn",
  "https://vcache.kvod14.com",
  "https://vcache.srnffc.cn",
  "https://vcache.shkjbd.com",
  "https://vcache.ybsdkl.cn",
];

// 逆向常量
var KK_APP_PKG = "com.kkdyC1V261021.T120540";
var KK_APP_ID = "kkdy";
var KK_APP_VER = "3.5.0.30500";
var KK_DEVICE_ID = "c798f425518bf312717d67dabff95aea";
var KK_DEVICE_AT = "1758000000000";
var KK_AES_KEY = "ayt5wy5afwmwrpb19k9s3psx3dymyd0n";
var KK_AES_IV = "b3t069ijy7pirw0j";
var KK_SIGN_KEY = "ksggsr4tp6difdo1c3im8fqd\u0033\u0067";

WidgetMetadata = {
  id: "rex.mi3s.kkdy",
  title: "可可影视",
  description: "可可影视 App 私有接口直连：10 个分类全保留，播放直链实时解析",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.3",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "kk-home",
      title: "可可 · 推荐",
      functionName: "kkHome",
      description: "可可影视「推荐」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-netflix",
      title: "可可 · Netflix",
      functionName: "kkNetflix",
      description: "可可影视「Netflix」专区（跨电影/剧集/动漫/综艺/伦理合并的 category=NETFLIX 片单）",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-duanju",
      title: "可可 · 短剧",
      functionName: "kkDuanju",
      description: "可可影视「短剧」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "擦边", value: "擦边" }, { title: "王爷太子", value: "王爷太子" }, { title: "霸道总裁", value: "霸道总裁" }, { title: "屌丝逆袭", value: "屌丝逆袭" }, { title: "赘婿系列", value: "赘婿系列" }, { title: "重生系列", value: "重生系列" }, { title: "穿越系列", value: "穿越系列" }, { title: "美女总裁", value: "美女总裁" }, { title: "娇妻系列", value: "娇妻系列" }, { title: "龙王系列", value: "龙王系列" }, { title: "都市言情", value: "都市言情" }, { title: "爱情", value: "爱情" }, { title: "剧情", value: "剧情" }, { title: "都市", value: "都市" }, { title: "逆袭", value: "逆袭" }, { title: "甜宠", value: "甜宠" }, { title: "虐恋", value: "虐恋" }, { title: "穿越", value: "穿越" }, { title: "重生", value: "重生" }, { title: "科幻", value: "科幻" }, { title: "武侠", value: "武侠" }, { title: "古装", value: "古装" }, { title: "动作", value: "动作" }, { title: "战争", value: "战争" }, { title: "冒险", value: "冒险" }, { title: "其它", value: "其它" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-movie",
      title: "可可 · 电影",
      functionName: "kkMovie",
      description: "可可影视「电影」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "Netflix", value: "NETFLIX" }, { title: "剧情", value: "剧情" }, { title: "喜剧", value: "喜剧" }, { title: "动作", value: "动作" }, { title: "爱情", value: "爱情" }, { title: "恐怖", value: "恐怖" }, { title: "惊悚", value: "惊悚" }, { title: "犯罪", value: "犯罪" }, { title: "科幻", value: "科幻" }, { title: "悬疑", value: "悬疑" }, { title: "奇幻", value: "奇幻" }, { title: "冒险", value: "冒险" }, { title: "战争", value: "战争" }, { title: "历史", value: "历史" }, { title: "古装", value: "古装" }, { title: "家庭", value: "家庭" }, { title: "传记", value: "传记" }, { title: "武侠", value: "武侠" }, { title: "歌舞", value: "歌舞" }, { title: "短片", value: "短片" }, { title: "动画", value: "动画" }, { title: "儿童", value: "儿童" }, { title: "职场", value: "职场" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "台湾", value: "中国台湾" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" }, { title: "英国", value: "英国" }, { title: "法国", value: "法国" }, { title: "德国", value: "德国" }, { title: "印度", value: "印度" }, { title: "泰国", value: "泰国" }, { title: "丹麦", value: "丹麦" }, { title: "瑞典", value: "瑞典" }, { title: "巴西", value: "巴西" }, { title: "加拿大", value: "加拿大" }, { title: "俄罗斯", value: "俄罗斯" }, { title: "意大利", value: "意大利" }, { title: "比利时", value: "比利时" }, { title: "爱尔兰", value: "爱尔兰" }, { title: "西班牙", value: "西班牙" }, { title: "澳大利亚", value: "澳大利亚" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-cinema",
      title: "可可 · 院线上新",
      functionName: "kkCinema",
      description: "可可影视「院线上新」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "Netflix", value: "NETFLIX" }, { title: "剧情", value: "剧情" }, { title: "喜剧", value: "喜剧" }, { title: "动作", value: "动作" }, { title: "爱情", value: "爱情" }, { title: "恐怖", value: "恐怖" }, { title: "惊悚", value: "惊悚" }, { title: "犯罪", value: "犯罪" }, { title: "科幻", value: "科幻" }, { title: "悬疑", value: "悬疑" }, { title: "奇幻", value: "奇幻" }, { title: "冒险", value: "冒险" }, { title: "战争", value: "战争" }, { title: "历史", value: "历史" }, { title: "古装", value: "古装" }, { title: "家庭", value: "家庭" }, { title: "传记", value: "传记" }, { title: "武侠", value: "武侠" }, { title: "歌舞", value: "歌舞" }, { title: "短片", value: "短片" }, { title: "动画", value: "动画" }, { title: "儿童", value: "儿童" }, { title: "职场", value: "职场" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "台湾", value: "中国台湾" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" }, { title: "英国", value: "英国" }, { title: "法国", value: "法国" }, { title: "德国", value: "德国" }, { title: "印度", value: "印度" }, { title: "泰国", value: "泰国" }, { title: "丹麦", value: "丹麦" }, { title: "瑞典", value: "瑞典" }, { title: "巴西", value: "巴西" }, { title: "加拿大", value: "加拿大" }, { title: "俄罗斯", value: "俄罗斯" }, { title: "意大利", value: "意大利" }, { title: "比利时", value: "比利时" }, { title: "爱尔兰", value: "爱尔兰" }, { title: "西班牙", value: "西班牙" }, { title: "澳大利亚", value: "澳大利亚" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-tv",
      title: "可可 · 剧集",
      functionName: "kkTv",
      description: "可可影视「剧集」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "Netflix", value: "Netflix" }, { title: "剧情", value: "剧情" }, { title: "爱情", value: "爱情" }, { title: "喜剧", value: "喜剧" }, { title: "犯罪", value: "犯罪" }, { title: "悬疑", value: "悬疑" }, { title: "古装", value: "古装" }, { title: "动作", value: "动作" }, { title: "家庭", value: "家庭" }, { title: "惊悚", value: "惊悚" }, { title: "奇幻", value: "奇幻" }, { title: "美剧", value: "美剧" }, { title: "科幻", value: "科幻" }, { title: "历史", value: "历史" }, { title: "战争", value: "战争" }, { title: "韩剧", value: "韩剧" }, { title: "武侠", value: "武侠" }, { title: "言情", value: "言情" }, { title: "恐怖", value: "恐怖" }, { title: "冒险", value: "冒险" }, { title: "都市", value: "都市" }, { title: "职场", value: "职场" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "韩国", value: "韩国" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "法国", value: "法国" }, { title: "英国", value: "英国" }, { title: "德国", value: "德国" }, { title: "台湾", value: "中国台湾" }, { title: "泰国", value: "泰国" }, { title: "印度", value: "印度" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-kr",
      title: "可可 · 韩剧",
      functionName: "kkKr",
      description: "可可影视「韩剧」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "Netflix", value: "Netflix" }, { title: "剧情", value: "剧情" }, { title: "爱情", value: "爱情" }, { title: "喜剧", value: "喜剧" }, { title: "犯罪", value: "犯罪" }, { title: "悬疑", value: "悬疑" }, { title: "古装", value: "古装" }, { title: "动作", value: "动作" }, { title: "家庭", value: "家庭" }, { title: "惊悚", value: "惊悚" }, { title: "奇幻", value: "奇幻" }, { title: "美剧", value: "美剧" }, { title: "科幻", value: "科幻" }, { title: "历史", value: "历史" }, { title: "战争", value: "战争" }, { title: "韩剧", value: "韩剧" }, { title: "武侠", value: "武侠" }, { title: "言情", value: "言情" }, { title: "恐怖", value: "恐怖" }, { title: "冒险", value: "冒险" }, { title: "都市", value: "都市" }, { title: "职场", value: "职场" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "韩国", value: "韩国" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "法国", value: "法国" }, { title: "英国", value: "英国" }, { title: "德国", value: "德国" }, { title: "台湾", value: "中国台湾" }, { title: "泰国", value: "泰国" }, { title: "印度", value: "印度" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-anime",
      title: "可可 · 动漫",
      functionName: "kkAnime",
      description: "可可影视「动漫」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "Netflix", value: "Netflix" }, { title: "动态漫画", value: "动态漫画" }, { title: "剧情", value: "剧情" }, { title: "动画", value: "动画" }, { title: "喜剧", value: "喜剧" }, { title: "冒险", value: "冒险" }, { title: "动作", value: "动作" }, { title: "奇幻", value: "奇幻" }, { title: "科幻", value: "科幻" }, { title: "儿童", value: "儿童" }, { title: "搞笑", value: "搞笑" }, { title: "爱情", value: "爱情" }, { title: "家庭", value: "家庭" }, { title: "短片", value: "短片" }, { title: "热血", value: "热血" }, { title: "益智", value: "益智" }, { title: "悬疑", value: "悬疑" }, { title: "经典", value: "经典" }, { title: "校园", value: "校园" }, { title: "Anime", value: "Anime" }, { title: "运动", value: "运动" }, { title: "亲子", value: "亲子" }, { title: "青春", value: "青春" }, { title: "恋爱", value: "恋爱" }, { title: "武侠", value: "武侠" }, { title: "惊悚", value: "惊悚" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "台湾", value: "中国台湾" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" }, { title: "英国", value: "英国" }, { title: "法国", value: "法国" }, { title: "德国", value: "德国" }, { title: "印度", value: "印度" }, { title: "泰国", value: "泰国" }, { title: "丹麦", value: "丹麦" }, { title: "瑞典", value: "瑞典" }, { title: "巴西", value: "巴西" }, { title: "加拿大", value: "加拿大" }, { title: "俄罗斯", value: "俄罗斯" }, { title: "意大利", value: "意大利" }, { title: "比利时", value: "比利时" }, { title: "爱尔兰", value: "爱尔兰" }, { title: "西班牙", value: "西班牙" }, { title: "澳大利亚", value: "澳大利亚" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-variety",
      title: "可可 · 综艺纪录",
      functionName: "kkVariety",
      description: "可可影视「综艺纪录」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "纪录", value: "纪录" }, { title: "真人秀", value: "真人秀" }, { title: "记录", value: "记录" }, { title: "脱口秀", value: "脱口秀" }, { title: "剧情", value: "剧情" }, { title: "历史", value: "历史" }, { title: "喜剧", value: "喜剧" }, { title: "传记", value: "传记" }, { title: "相声", value: "相声" }, { title: "节目", value: "节目" }, { title: "歌舞", value: "歌舞" }, { title: "冒险", value: "冒险" }, { title: "运动", value: "运动" }, { title: "Season", value: "Season" }, { title: "犯罪", value: "犯罪" }, { title: "短片", value: "短片" }, { title: "搞笑", value: "搞笑" }, { title: "晚会", value: "晚会" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "台湾", value: "中国台湾" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      id: "kk-adult",
      title: "可可 · 伦理",
      functionName: "kkAdult",
      description: "可可影视「伦理」分类，直连官方接口并在列表阶段解析播放直链",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        { name: "sort", title: "排序", type: "enumeration", value: "1", enumOptions: [{ title: "综合", value: "1" }, { title: "最新", value: "2" }, { title: "最热", value: "3" }, { title: "评分", value: "4" }] },
        { name: "category", title: "类型", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "伦理", value: "伦理" }, { title: "福利", value: "福利" }, { title: "倫理", value: "倫理" }, { title: "剧情", value: "剧情" }, { title: "情色", value: "情色" }, { title: "爱情", value: "爱情" }, { title: "喜剧", value: "喜剧" }, { title: "惊悚", value: "惊悚" }, { title: "写真", value: "写真" }, { title: "美女", value: "美女" }, { title: "恐怖", value: "恐怖" }, { title: "犯罪", value: "犯罪" }, { title: "悬疑", value: "悬疑" }, { title: "动作", value: "动作" }, { title: "同性", value: "同性" }, { title: "奇幻", value: "奇幻" }, { title: "古装", value: "古装" }, { title: "青春", value: "青春" }, { title: "科幻", value: "科幻" }, { title: "文艺", value: "文艺" }] },
        { name: "area", title: "地区", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "大陆", value: "中国大陆" }, { title: "香港", value: "中国香港" }, { title: "台湾", value: "中国台湾" }, { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" }, { title: "英国", value: "英国" }, { title: "法国", value: "法国" }, { title: "德国", value: "德国" }, { title: "印度", value: "印度" }, { title: "泰国", value: "泰国" }, { title: "丹麦", value: "丹麦" }, { title: "瑞典", value: "瑞典" }, { title: "巴西", value: "巴西" }, { title: "加拿大", value: "加拿大" }, { title: "俄罗斯", value: "俄罗斯" }, { title: "意大利", value: "意大利" }, { title: "比利时", value: "比利时" }, { title: "爱尔兰", value: "爱尔兰" }, { title: "西班牙", value: "西班牙" }, { title: "澳大利亚", value: "澳大利亚" }, { title: "其它", value: "其它" }] },
        { name: "year", title: "年份", type: "enumeration", value: "", enumOptions: [{ title: "全部", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "10年代", value: "2010-2019" }, { title: "00年代", value: "2000-2009" }, { title: "90年代", value: "1990-1999" }, { title: "80年代", value: "1980-1989" }, { title: "更早", value: "0-1979" }] },
        { name: "page", title: "页码", type: "page", value: "1" },
      ],
    },
  ],
};


// ---------------------------------------------------------------------------
// 纯 JS 密码学：字节工具
// ---------------------------------------------------------------------------
function kkBytesFromBinary(s) {
  var out = [];
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    out.push((c >>> 8) & 0xff);
    out.push(c & 0xff);
  }
  return out;
}

function kkUtf8ToBytes(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return out;
}

function kkBytesToUtf8(b) {
  var s = "";
  var i = 0;
  while (i < b.length) {
    var c = b[i];
    if (c < 0x80) { s += String.fromCharCode(c); i += 1; }
    else if (c >= 0xc0 && c < 0xe0) {
      s += String.fromCharCode(((c & 0x1f) << 6) | (b[i + 1] & 0x3f));
      i += 2;
    } else if (c >= 0xe0 && c < 0xf0) {
      s += String.fromCharCode(((c & 0x0f) << 12) | ((b[i + 1] & 0x3f) << 6) | (b[i + 2] & 0x3f));
      i += 3;
    } else {
      var cp = ((c & 0x07) << 18) | ((b[i + 1] & 0x3f) << 12) | ((b[i + 2] & 0x3f) << 6) | (b[i + 3] & 0x3f);
      cp -= 0x10000;
      s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      i += 4;
    }
  }
  return s;
}

function kkHex(b) {
  var s = "";
  for (var i = 0; i < b.length; i++) {
    var h = b[i].toString(16);
    s += h.length === 1 ? "0" + h : h;
  }
  return s;
}

// ---------------------------------------------------------------------------
// 纯 JS 密码学：SHA-1 / HMAC-SHA1
// ---------------------------------------------------------------------------
function kkSha1(bytes) {
  var ml = bytes.length * 8;
  var msg = bytes.slice();
  msg.push(0x80);
  while (msg.length % 64 !== 56) msg.push(0);
  var hi = Math.floor(ml / 4294967296) & 0xffffffff;
  var lo = ml & 0xffffffff;
  msg.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255);
  msg.push((lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);

  var h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  var w = new Array(80);

  for (var off = 0; off < msg.length; off += 64) {
    for (var i = 0; i < 16; i++) {
      w[i] = ((msg[off + i * 4] << 24) | (msg[off + i * 4 + 1] << 16) | (msg[off + i * 4 + 2] << 8) | msg[off + i * 4 + 3]) | 0;
    }
    for (var j = 16; j < 80; j++) {
      var x = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = ((x << 1) | (x >>> 31)) | 0;
    }
    var a = h0, b = h1, c = h2, d = h3, e = h4;
    for (var k = 0; k < 80; k++) {
      var f, kk;
      if (k < 20) { f = (b & c) | (~b & d); kk = 0x5a827999; }
      else if (k < 40) { f = b ^ c ^ d; kk = 0x6ed9eba1; }
      else if (k < 60) { f = (b & c) | (b & d) | (c & d); kk = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; kk = 0xca62c1d6; }
      var temp = (((a << 5) | (a >>> 27)) + f + e + kk + w[k]) | 0;
      e = d; d = c; c = ((b << 30) | (b >>> 2)) | 0; b = a; a = temp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  var out = [];
  var hs = [h0, h1, h2, h3, h4];
  for (var q = 0; q < 5; q++) out.push((hs[q] >>> 24) & 255, (hs[q] >>> 16) & 255, (hs[q] >>> 8) & 255, hs[q] & 255);
  return out;
}

function kkHmacSha1Hex(keyBytes, msgBytes) {
  var block = 64;
  var k = keyBytes.slice();
  if (k.length > block) k = kkSha1(k);
  while (k.length < block) k.push(0);
  var ipad = [], opad = [];
  for (var i = 0; i < block; i++) {
    ipad.push(k[i] ^ 0x36);
    opad.push(k[i] ^ 0x5c);
  }
  return kkHex(kkSha1(opad.concat(kkSha1(ipad.concat(msgBytes)))));
}

// ---------------------------------------------------------------------------
// 纯 JS 密码学：AES-256-CBC 解密
// ---------------------------------------------------------------------------
var KK_SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
];

var KK_INV_SBOX = new Array(256);
for (var kkInv = 0; kkInv < 256; kkInv++) KK_INV_SBOX[KK_SBOX[kkInv]] = kkInv;

function kkXtime(a) { return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff; }

function kkGmul(a, b) {
  var p = 0;
  for (var i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    var hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p & 0xff;
}

function kkExpandKey(key) {
  var Nk = 8, Nr = 14;
  var w = [];
  for (var i = 0; i < Nk; i++) w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
  var rcon = 1;
  for (var j = Nk; j < 4 * (Nr + 1); j++) {
    var t = w[j - 1].slice();
    if (j % Nk === 0) {
      t = [t[1], t[2], t[3], t[0]];
      t = [KK_SBOX[t[0]], KK_SBOX[t[1]], KK_SBOX[t[2]], KK_SBOX[t[3]]];
      t[0] ^= rcon;
      rcon = kkXtime(rcon);
    } else if (j % Nk === 4) {
      t = [KK_SBOX[t[0]], KK_SBOX[t[1]], KK_SBOX[t[2]], KK_SBOX[t[3]]];
    }
    w[j] = [w[j - Nk][0] ^ t[0], w[j - Nk][1] ^ t[1], w[j - Nk][2] ^ t[2], w[j - Nk][3] ^ t[3]];
  }
  return { w: w, Nr: Nr };
}

function kkAddRoundKey(s, w, round) {
  for (var c = 0; c < 4; c++) {
    var word = w[round * 4 + c];
    for (var r = 0; r < 4; r++) s[r + 4 * c] ^= word[r];
  }
}

function kkInvSubBytes(s) { for (var i = 0; i < 16; i++) s[i] = KK_INV_SBOX[s[i]]; }

function kkInvShiftRows(s) {
  var t = s.slice();
  for (var r = 1; r < 4; r++) {
    for (var c = 0; c < 4; c++) s[r + 4 * ((c + r) % 4)] = t[r + 4 * c];
  }
}

function kkInvMixColumns(s) {
  for (var c = 0; c < 4; c++) {
    var a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
    s[4 * c]     = kkGmul(a0, 14) ^ kkGmul(a1, 11) ^ kkGmul(a2, 13) ^ kkGmul(a3, 9);
    s[4 * c + 1] = kkGmul(a0, 9)  ^ kkGmul(a1, 14) ^ kkGmul(a2, 11) ^ kkGmul(a3, 13);
    s[4 * c + 2] = kkGmul(a0, 13) ^ kkGmul(a1, 9)  ^ kkGmul(a2, 14) ^ kkGmul(a3, 11);
    s[4 * c + 3] = kkGmul(a0, 11) ^ kkGmul(a1, 13) ^ kkGmul(a2, 9)  ^ kkGmul(a3, 14);
  }
}

function kkDecryptBlock(block, ks) {
  var s = block.slice();
  kkAddRoundKey(s, ks.w, ks.Nr);
  for (var round = ks.Nr - 1; round >= 1; round--) {
    kkInvShiftRows(s);
    kkInvSubBytes(s);
    kkAddRoundKey(s, ks.w, round);
    kkInvMixColumns(s);
  }
  kkInvShiftRows(s);
  kkInvSubBytes(s);
  kkAddRoundKey(s, ks.w, 0);
  return s;
}

function kkAesDecrypt(keyBytes, ivBytes, ctBytes) {
  var ks = kkExpandKey(keyBytes);
  var prev = ivBytes.slice();
  var out = [];
  for (var off = 0; off + 16 <= ctBytes.length; off += 16) {
    var block = ctBytes.slice(off, off + 16);
    var dec = kkDecryptBlock(block, ks);
    for (var i = 0; i < 16; i++) out.push(dec[i] ^ prev[i]);
    prev = block;
  }
  if (out.length) {
    var pad = out[out.length - 1];
    if (pad >= 1 && pad <= 16) out = out.slice(0, out.length - pad);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 可可 API
// ---------------------------------------------------------------------------
function kkQs(params) {
  var keys = [];
  for (var k in params) {
    if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
    var v = params[k];
    if (v === undefined || v === null || v === "") continue;
    keys.push(k);
  }
  keys.sort();
  var pairs = [];
  for (var i = 0; i < keys.length; i++) pairs.push(keys[i] + "=" + params[keys[i]]);
  return pairs.join("&");
}

function kkHeaders(path, qs) {
  var ts = String(Date.now());
  var secrets = "appId=" + KK_APP_ID + "&deviceCreatedAt=" + KK_DEVICE_AT + "&deviceId=" + KK_DEVICE_ID + "&st=2";
  var msg = ["get", path, qs, ts, secrets, ""].join("|");
  var sign = kkHmacSha1Hex(kkUtf8ToBytes(KK_SIGN_KEY), kkUtf8ToBytes(msg));
  return {
    "X-CDN": "1",
    ts: ts,
    sign: sign,
    appId: KK_APP_ID,
    os: "android",
    appVersion: KK_APP_VER,
    package: KK_APP_PKG,
    deviceId: KK_DEVICE_ID,
    deviceCreatedAt: KK_DEVICE_AT,
    userLevel: "0",
    st: "2",
    userChannel: "official",
    "User-Agent": "okhttp/4.12.0",
  };
}

function kkBodyText(resp) {
  if (!resp) return "";
  var d = resp.data !== undefined ? resp.data : resp;
  if (typeof d === "string") return d;
  if (d == null) return "";
  try { return JSON.stringify(d); } catch (e) { return String(d); }
}

// 解析响应：明文 JSON 直接用；否则按 UTF-16 码元还原字节并 AES 解密
function kkDecode(resp) {
  var raw = kkBodyText(resp);
  if (!raw) return null;
  var trimmed = raw.replace(/^\s+/, "");
  if (trimmed.charAt(0) === "{") {
    try { return JSON.parse(trimmed); } catch (e) { /* 继续尝试解密 */ }
  }
  try {
    var bytes = kkBytesFromBinary(raw);
    var plain = kkBytesToUtf8(kkAesDecrypt(kkUtf8ToBytes(KK_AES_KEY), kkUtf8ToBytes(KK_AES_IV), bytes));
    var cut = plain.indexOf("{");
    if (cut > 0) plain = plain.slice(cut);
    return JSON.parse(plain);
  } catch (e) {
    return null;
  }
}

// 依次尝试各域名，返回 data 字段；业务错误（带 code）直接放弃换域名也没用
async function kkApi(path, params) {
  var qs = kkQs(params || {});
  var query = kkQs(params || {});
  var lastErr = null;
  for (var i = 0; i < KKDY_HOSTS.length; i++) {
    var host = KKDY_HOSTS[i];
    var url = host + path + (query ? "?" + query : "");
    var resp = null;
    try {
      resp = await Widget.http.get(url, { headers: kkHeaders(path, qs), timeout: 9000 });
    } catch (e) {
      lastErr = e;
      continue;
    }
    var j = kkDecode(resp);
    if (!j) { lastErr = "decode"; continue; }
    if (j.code === 200 || j.code === 0) return j.data;
    if (j.code === undefined) return j;
    // 业务错误
    lastErr = j.code + " " + (j.message || "");
    if (j.code === 40401) break;
  }
  throw new Error(String(lastErr || "all hosts failed"));
}

function kkCover(item) {
  var p = item && item.imagePath ? String(item.imagePath) : "";
  if (!p) return "";
  if (/^https?:\/\//.test(p)) return p;
  return KKDY_IMG[0] + p;
}

// ---------------------------------------------------------------------------
// 列表 → 逐条解析播放直链 → VideoItem[]
// ---------------------------------------------------------------------------
function kkPageNext(pg) {
  var n = parseInt(pg, 10) || 1;
  return n <= 1 ? "" : "page=" + n;
}

function pickUrl(source) {
  var list = (source && source.list) || [];
  for (var i = 0; i < list.length; i++) {
    var ep = list[i];
    var urls = ep.playUrls || [];
    var pick = null;
    for (var j = 0; j < urls.length; j++) {
      if (urls[j] && urls[j].url && /h264/i.test(urls[j].type || "")) { pick = urls[j]; break; }
    }
    if (!pick) {
      for (var m = 0; m < urls.length; m++) {
        if (urls[m] && urls[m].url) { pick = urls[m]; break; }
      }
    }
    if (pick && pick.url) return pick.url;
    if (ep && ep.m3u8Url) return ep.m3u8Url;
  }
  return "";
}

// 详情 → { url, sources, title, cover, intro, total }
async function kkDetail(vodId) {
  var d = await kkApi("/v2/vod/detail.capi", { vodId: String(vodId) });
  if (!d) return null;
  var sources = (d.playSources || []).slice();
  sources.sort(function (a, b) { return (b.sort || 0) - (a.sort || 0); });
  var best = "";
  var bestName = "";
  for (var i = 0; i < sources.length; i++) {
    var u = pickUrl(sources[i]);
    if (u && /^https?:\/\//.test(u)) {
      best = u;
      bestName = sources[i].name || sources[i].siteId || "";
      break;
    }
  }
  return { url: best, sourceName: bestName, title: d.title || "", cover: kkCover(d), intro: d.summary || "", total: sources.length, raw: d };
}

// chs 可以是单个频道 id，也可以是频道数组（跨频道合并，如 Netflix）
// opts.category 用于强制套用某个分类筛选（Netflix 就是跨频道 category=NETFLIX）
async function runChannel(chs, params, opts) {
  params = params || {};
  opts = opts || {};
  if (Object.prototype.toString.call(chs) !== "[object Array]") chs = [chs];

  var q = { next: kkPageNext(params.page) };
  var FILTER_KEYS = ["sort", "category", "area", "year"];
  for (var i = 0; i < FILTER_KEYS.length; i++) {
    var k = FILTER_KEYS[i];
    var v = params[k];
    if (v === undefined || v === null || v === "") continue;
    q[k] = String(v);
  }
  if (opts.category) q.category = opts.category;

  var lists = await Promise.all(
    chs.map(function (c) {
      var qq = {};
      for (var k2 in q) qq[k2] = q[k2];
      qq.channelId = String(c);
      return kkApi("/vod/channel/list.capi", qq).then(
        function (d) { return d; },
        function () { return null; }
      );
    })
  );

  var items = [];
  var seen = {};
  for (var li = 0; li < lists.length; li++) {
    var arr = (lists[li] && lists[li].items) || [];
    for (var aj = 0; aj < arr.length; aj++) {
      var one = arr[aj];
      if (!one || one.id == null) continue;
      if (seen[one.id]) continue;
      seen[one.id] = 1;
      items.push(one);
    }
  }
  if (opts.limit && items.length > opts.limit) items = items.slice(0, opts.limit);
  if (!items.length) return [];

  var mediaType = opts.mediaType || (chs[0] === "6" ? "tv" : "movie");

  // 逐条解析播放直链（并发 8），解析失败的条目不丢，退回详情型
  var out = new Array(items.length);
  var idx = 0;
  var conc = 8;
  async function worker() {
    while (idx < items.length) {
      var i2 = idx++;
      var it = items[i2];
      var cover = kkCover(it);
      var base = {
        id: "kk-" + it.id,
        type: "url",
        title: it.title || "",
        description: "",
        posterPath: cover,
        coverUrl: cover,
        mediaType: mediaType,
        genreTitle: "",
        playerType: "app",
      };
      // 标签
      var tags = [];
      if (it.labels && it.labels.length) {
        for (var t = 0; t < it.labels.length; t++) if (it.labels[t] && it.labels[t].name) tags.push(it.labels[t].name);
      }
      base.genreTitle = tags.slice(0, 3).join("/");
      base.description = it.bottomLabel || it.topRightLabel || "";
      // 关键：type 先用 detail（无 videoUrl 的 url 型会被 Rex 直接丢弃 → 条目“消失”），
      // 只有真正解析出直链才升为 url。这样限流/失败时卡片一定保留。
      base.type = "detail";
      try {
        var det = await kkDetail(it.id);
        if (det) {
          if (det.url) { base.videoUrl = det.url; base.type = "url"; }
          if (det.cover) { base.posterPath = det.cover; base.coverUrl = det.cover; }
          if (det.intro) base.description = det.intro;
          if (det.sourceName) base.genreTitle = (base.genreTitle ? base.genreTitle + " · " : "") + det.sourceName;
        }
      } catch (e) { /* 单条失败：保持 detail 型，卡片仍在 */ }
      out[i2] = base;
    }
  }
  var workers = [];
  for (var w = 0; w < conc; w++) workers.push(worker());
  await Promise.all(workers);
  return out.filter(function (x) { return x && x.title; });
}

async function kkHome(p) { return runChannel("0", p); }
// Netflix 在可可里不是独立频道（channelId=1000 恒为空），而是跨频道的 category=NETFLIX 筛选：
// 电影/剧集/动漫/综艺/伦理各频道带上 category=NETFLIX 才有内容，故这里跨频道合并并去重。
async function kkNetflix(p) {
  return runChannel(["1", "2", "3", "4", "5"], p, { category: "NETFLIX", limit: 24 });
}
async function kkDuanju(p) { return runChannel("6", p, { mediaType: "tv" }); }
async function kkMovie(p) { return runChannel("1", p); }
async function kkCinema(p) { return runChannel("2001", p); }
async function kkTv(p) { return runChannel("2", p); }
async function kkKr(p) { return runChannel("2002", p); }
async function kkAnime(p) { return runChannel("3", p); }
async function kkVariety(p) { return runChannel("4", p); }
async function kkAdult(p) { return runChannel("5", p); }
