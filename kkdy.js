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

var KKDY_FILTERS = {
  "1": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["NETFLIX","Netflix"],["剧情","剧情"],["喜剧","喜剧"],["动作","动作"],["爱情","爱情"],["恐怖","恐怖"],["惊悚","惊悚"],["犯罪","犯罪"],["科幻","科幻"],["悬疑","悬疑"],["奇幻","奇幻"],["冒险","冒险"],["战争","战争"],["历史","历史"],["古装","古装"],["家庭","家庭"],["传记","传记"],["武侠","武侠"],["歌舞","歌舞"],["短片","短片"],["动画","动画"],["儿童","儿童"],["职场","职场"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["中国台湾","台湾"],["美国","美国"],["日本","日本"],["韩国","韩国"],["英国","英国"],["法国","法国"],["德国","德国"],["印度","印度"],["泰国","泰国"],["丹麦","丹麦"],["瑞典","瑞典"],["巴西","巴西"],["加拿大","加拿大"],["俄罗斯","俄罗斯"],["意大利","意大利"],["比利时","比利时"],["爱尔兰","爱尔兰"],["西班牙","西班牙"],["澳大利亚","澳大利亚"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
  "2": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["Netflix","Netflix"],["剧情","剧情"],["爱情","爱情"],["喜剧","喜剧"],["犯罪","犯罪"],["悬疑","悬疑"],["古装","古装"],["动作","动作"],["家庭","家庭"],["惊悚","惊悚"],["奇幻","奇幻"],["美剧","美剧"],["科幻","科幻"],["历史","历史"],["战争","战争"],["韩剧","韩剧"],["武侠","武侠"],["言情","言情"],["恐怖","恐怖"],["冒险","冒险"],["都市","都市"],["职场","职场"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["韩国","韩国"],["美国","美国"],["日本","日本"],["法国","法国"],["英国","英国"],["德国","德国"],["中国台湾","台湾"],["泰国","泰国"],["印度","印度"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
  "3": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["Netflix","Netflix"],["动态漫画","动态漫画"],["剧情","剧情"],["动画","动画"],["喜剧","喜剧"],["冒险","冒险"],["动作","动作"],["奇幻","奇幻"],["科幻","科幻"],["儿童","儿童"],["搞笑","搞笑"],["爱情","爱情"],["家庭","家庭"],["短片","短片"],["热血","热血"],["益智","益智"],["悬疑","悬疑"],["经典","经典"],["校园","校园"],["Anime","Anime"],["运动","运动"],["亲子","亲子"],["青春","青春"],["恋爱","恋爱"],["武侠","武侠"],["惊悚","惊悚"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["中国台湾","台湾"],["美国","美国"],["日本","日本"],["韩国","韩国"],["英国","英国"],["法国","法国"],["德国","德国"],["印度","印度"],["泰国","泰国"],["丹麦","丹麦"],["瑞典","瑞典"],["巴西","巴西"],["加拿大","加拿大"],["俄罗斯","俄罗斯"],["意大利","意大利"],["比利时","比利时"],["爱尔兰","爱尔兰"],["西班牙","西班牙"],["澳大利亚","澳大利亚"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
  "4": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["纪录","纪录"],["真人秀","真人秀"],["记录","记录"],["脱口秀","脱口秀"],["剧情","剧情"],["历史","历史"],["喜剧","喜剧"],["传记","传记"],["相声","相声"],["节目","节目"],["歌舞","歌舞"],["冒险","冒险"],["运动","运动"],["Season","Season"],["犯罪","犯罪"],["短片","短片"],["搞笑","搞笑"],["晚会","晚会"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["中国台湾","台湾"],["美国","美国"],["日本","日本"],["韩国","韩国"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
  "5": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["伦理","伦理"],["福利","福利"],["倫理","倫理"],["剧情","剧情"],["情色","情色"],["爱情","爱情"],["喜剧","喜剧"],["惊悚","惊悚"],["写真","写真"],["美女","美女"],["恐怖","恐怖"],["犯罪","犯罪"],["悬疑","悬疑"],["动作","动作"],["同性","同性"],["奇幻","奇幻"],["古装","古装"],["青春","青春"],["科幻","科幻"],["文艺","文艺"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["中国台湾","台湾"],["美国","美国"],["日本","日本"],["韩国","韩国"],["英国","英国"],["法国","法国"],["德国","德国"],["印度","印度"],["泰国","泰国"],["丹麦","丹麦"],["瑞典","瑞典"],["巴西","巴西"],["加拿大","加拿大"],["俄罗斯","俄罗斯"],["意大利","意大利"],["比利时","比利时"],["爱尔兰","爱尔兰"],["西班牙","西班牙"],["澳大利亚","澳大利亚"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
  "6": {sort:[["1","综合"],["2","最新"],["3","最热"]], category:[["","全部"],["擦边","擦边"],["王爷太子","王爷太子"],["霸道总裁","霸道总裁"],["屌丝逆袭","屌丝逆袭"],["赘婿系列","赘婿系列"],["重生系列","重生系列"],["穿越系列","穿越系列"],["美女总裁","美女总裁"],["娇妻系列","娇妻系列"],["龙王系列","龙王系列"],["都市言情","都市言情"],["爱情","爱情"],["剧情","剧情"],["都市","都市"],["逆袭","逆袭"],["甜宠","甜宠"],["虐恋","虐恋"],["穿越","穿越"],["重生","重生"],["科幻","科幻"],["武侠","武侠"],["古装","古装"],["动作","动作"],["战争","战争"],["冒险","冒险"],["其它","其它"]]},
  "2001": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["NETFLIX","Netflix"],["剧情","剧情"],["喜剧","喜剧"],["动作","动作"],["爱情","爱情"],["恐怖","恐怖"],["惊悚","惊悚"],["犯罪","犯罪"],["科幻","科幻"],["悬疑","悬疑"],["奇幻","奇幻"],["冒险","冒险"],["战争","战争"],["历史","历史"],["古装","古装"],["家庭","家庭"],["传记","传记"],["武侠","武侠"],["歌舞","歌舞"],["短片","短片"],["动画","动画"],["儿童","儿童"],["职场","职场"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["中国台湾","台湾"],["美国","美国"],["日本","日本"],["韩国","韩国"],["英国","英国"],["法国","法国"],["德国","德国"],["印度","印度"],["泰国","泰国"],["丹麦","丹麦"],["瑞典","瑞典"],["巴西","巴西"],["加拿大","加拿大"],["俄罗斯","俄罗斯"],["意大利","意大利"],["比利时","比利时"],["爱尔兰","爱尔兰"],["西班牙","西班牙"],["澳大利亚","澳大利亚"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
  "2002": {sort:[["1","综合"],["2","最新"],["3","最热"],["4","评分"]], category:[["","全部"],["Netflix","Netflix"],["剧情","剧情"],["爱情","爱情"],["喜剧","喜剧"],["犯罪","犯罪"],["悬疑","悬疑"],["古装","古装"],["动作","动作"],["家庭","家庭"],["惊悚","惊悚"],["奇幻","奇幻"],["美剧","美剧"],["科幻","科幻"],["历史","历史"],["战争","战争"],["韩剧","韩剧"],["武侠","武侠"],["言情","言情"],["恐怖","恐怖"],["冒险","冒险"],["都市","都市"],["职场","职场"]], area:[["","全部"],["中国大陆","大陆"],["中国香港","香港"],["韩国","韩国"],["美国","美国"],["日本","日本"],["法国","法国"],["英国","英国"],["德国","德国"],["中国台湾","台湾"],["泰国","泰国"],["印度","印度"],["其它","其它"]], year:[["","全部"],["2026","2026"],["2025","2025"],["2024","2024"],["2023","2023"],["2022","2022"],["2021","2021"],["2020","2020"],["2010-2019","10年代"],["2000-2009","00年代"],["1990-1999","90年代"],["1980-1989","80年代"],["0-1979","更早"]]},
};

var KKDY_CHANNELS = [
  { key: "home", name: "推荐", ch: "0" },
  { key: "netflix", name: "Netflix", ch: "1000" },
  { key: "duanju", name: "短剧", ch: "6" },
  { key: "movie", name: "电影", ch: "1" },
  { key: "cinema", name: "院线上新", ch: "2001" },
  { key: "tv", name: "剧集", ch: "2" },
  { key: "kr", name: "韩剧", ch: "2002" },
  { key: "anime", name: "动漫", ch: "3" },
  { key: "variety", name: "综艺纪录", ch: "4" },
  { key: "adult", name: "伦理", ch: "5" },
];

var KKDY_FN = {
  home: "kkHome", netflix: "kkNetflix", duanju: "kkDuanju", movie: "kkMovie",
  cinema: "kkCinema", tv: "kkTv", kr: "kkKr", anime: "kkAnime",
  variety: "kkVariety", adult: "kkAdult",
};

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

// ---------------------------------------------------------------------------
// 构建 metadata：每个分类一个模块，并带上该分类真实存在的筛选维度
// ---------------------------------------------------------------------------
WidgetMetadata = (function () {
  var mods = [];
  for (var i = 0; i < KKDY_CHANNELS.length; i++) {
    var c = KKDY_CHANNELS[i];
    var f = (typeof KKDY_FILTERS !== "undefined" && KKDY_FILTERS[c.ch]) || {};
    var params = [];
    var LABEL = { sort: "排序", category: "类型", area: "地区", year: "年份" };
    var ORDER = ["sort", "category", "area", "year"];
    for (var oi = 0; oi < ORDER.length; oi++) {
      var k = ORDER[oi];
      if (!f[k] || !f[k].length) continue;
      var opts = [];
      for (var j = 0; j < f[k].length; j++) opts.push([f[k][j][0], f[k][j][1]]);
      params.push({
        name: k,
        label: LABEL[k],
        type: "enum",
        default: k === "sort" ? opts[0][0] : "",
        options: opts,
      });
    }
    params.push({ name: "page", label: "页码", type: "page", default: "1" });
    mods.push({
      id: "kk-" + c.key,
      title: "可可 · " + c.name,
      functionName: KKDY_FN[c.key],
      description: "可可影视「" + c.name + "」分类，直连官方接口并解析播放直链",
      type: "video",
      cacheDuration: 1800,
      requiresWebView: false,
      params: params,
    });
  }
  return {
    id: "rex.mi3s.kkdy",
    title: "可可影视",
    description: "可可影视 App 私有接口直连：10 个分类全保留，播放直链实时解析",
    author: "mi3s",
    site: "https://github.com/mi3suuu/rex-hires",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    modules: mods,
  };
})();

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

var KK_INV_SBOX = (function () {
  var inv = new Array(256);
  for (var i = 0; i < 256; i++) inv[KK_SBOX[i]] = i;
  return inv;
})();

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

// 依次尝试各域名，返回 data 字段；业务错误（带 code）直接放弃换域名也没用。
// 记住上次成功的域名放到最前：可可线路之间延迟差很大，这一步能把耗时砍掉一半以上。
var KK_HOST_PREF = "";

async function kkApi(path, params) {
  var qs = kkQs(params || {});
  var order = KKDY_HOSTS.slice();
  if (KK_HOST_PREF) {
    var pi = order.indexOf(KK_HOST_PREF);
    if (pi > 0) { order.splice(pi, 1); order.unshift(KK_HOST_PREF); }
  }
  var lastErr = null;
  var tried = 0;
  for (var i = 0; i < order.length; i++) {
    var host = order[i];
    var url = host + path + (qs ? "?" + qs : "");
    var resp = null;
    try {
      resp = await Widget.http.get(url, { headers: kkHeaders(path, qs), timeout: 6000 });
    } catch (e) {
      lastErr = e;
      tried += 1;
      if (tried >= 3) break;
      continue;
    }
    var j = kkDecode(resp);
    if (!j) { lastErr = "decode"; tried += 1; if (tried >= 3) break; continue; }
    if (j.code === 200 || j.code === 0) { KK_HOST_PREF = host; return j.data; }
    if (j.code === undefined) { KK_HOST_PREF = host; return j; }
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

async function runChannel(ch, params) {
  params = params || {};
  var q = { channelId: String(ch), next: kkPageNext(params.page) };
  var FILTER_KEYS = ["sort", "category", "area", "year"];
  for (var i = 0; i < FILTER_KEYS.length; i++) {
    var k = FILTER_KEYS[i];
    var v = params[k];
    if (v === undefined || v === null || v === "") continue;
    q[k] = String(v);
  }

  var data = null;
  try {
    data = await kkApi("/vod/channel/list.capi", q);
  } catch (e) {
    return [];
  }
  var items = (data && data.items) || [];
  if (!items.length) return [];

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
        mediaType: ch === "6" ? "tv" : "movie",
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
      try {
        var det = await kkDetail(it.id);
        if (det) {
          if (det.url) base.videoUrl = det.url;
          if (det.cover) { base.posterPath = det.cover; base.coverUrl = det.cover; }
          if (det.intro) base.description = det.intro;
          if (det.sourceName) base.genreTitle = (base.genreTitle ? base.genreTitle + " · " : "") + det.sourceName;
          if (!det.url) base.type = "detail";
        }
      } catch (e) { /* 单条失败保持卡片 */ }
      out[i2] = base;
    }
  }
  var workers = [];
  for (var w = 0; w < conc; w++) workers.push(worker());
  await Promise.all(workers);
  return out.filter(function (x) { return x && x.title; });
}

async function kkHome(p) { return runChannel("0", p); }
async function kkNetflix(p) { return runChannel("1000", p); }
async function kkDuanju(p) { return runChannel("6", p); }
async function kkMovie(p) { return runChannel("1", p); }
async function kkCinema(p) { return runChannel("2001", p); }
async function kkTv(p) { return runChannel("2", p); }
async function kkKr(p) { return runChannel("2002", p); }
async function kkAnime(p) { return runChannel("3", p); }
async function kkVariety(p) { return runChannel("4", p); }
async function kkAdult(p) { return runChannel("5", p); }
