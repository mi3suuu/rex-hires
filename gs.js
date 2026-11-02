// ============================================================================
// Rex 模块 · 怪兽聚合（avbox）加密站聚合（rex.mi3s.gs）
// ----------------------------------------------------------------------------
// 把 avbox「怪兽聚合」APK 里的 pwa-aes 加密站批量接入 Rex，纯无中转。
// 协议来自 LibreTV 的 gs-gateway.ts（libapp.so 反编译确证）：
//
//   明文 = 7 身份字段（token/via/language/version/oauth_type/bundleId/oauth_id）
//          或 system_* 前缀身份字段（dh50/ttt）+ 业务参数
//   加密 = AES-128-CBC/PKCS7（果冻系，data=base64）
//          或 AES-256-CFB-128（dh50/ttt/lxs/dsp91，data=hex/base16）
//   投递 = POST + application/x-www-form-urlencoded，字段 client/timestamp/data/sign
//   签名 = md5( hex(sha256("client=pwa&data=<data>&timestamp=<秒>" + salt)) )
//   响应 = {"errcode":0,"data":"<AES密文>"}，用同 key/iv 解密得到 JSON
//
// 站点协议分三类：
//   1) 果冻系（gdcm/zpc91/cg51/cgw/fl2/hgsp/hsxs/hu4/hxsp/ll51/one/ttav/txvlog/
//      yxfm/zlt）：CBC + oauth_* 身份 + method 协议（mv/list_construct 等）
//   2) tab 系（dh50/ttt）：CFB + system_* 身份 + MvList/featured + tabId
//   3) dsp91（91短视频）：CFB + mod/code 协议（index/listByTag 等）
//
// 环境：只用 Rex 运行时的 Widget.http.get/post。无 fetch/crypto/setTimeout，
//   AES/MD5/SHA256/Base64/UTF-8 全部内联纯 JS。
// ============================================================================

WidgetMetadata = {
  id: "rex.mi3s.gs",
  title: "怪兽聚合·加密站",
  description: "avbox 怪兽聚合加密站批量直连（果冻/91制片厂/50度灰/汤头条/吃瓜/短视频等 21 站），pwa-aes 本地解密，纯无中转",
  author: "mi3s",
  site: "https://github.com/mi3s",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  search: {
    title: "搜索加密站",
    functionName: "searchVideos",
    params: [{ name: "keyword", title: "关键词（片名/番号）", type: "input", value: "" }]
  },
  modules: [
    {
      id: "gs-list",
      title: "最新片单（全站）",
      description: "聚合全部加密站最新上架，分页浏览",
      requiresWebView: false,
      cacheDuration: 120,
      functionName: "loadList",
      type: "video",
      params: [
        { name: "kind", title: "类型", type: "constant", value: "new" },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "gs-search",
      title: "搜索",
      description: "按片名/番号跨全部加密站搜索",
      requiresWebView: false,
      cacheDuration: 60,
      functionName: "searchVideos",
      params: [{ name: "keyword", title: "关键词", type: "input", value: "" }]
    },
    {
      id: "gs-resource",
      title: "播放资源",
      description: "按需解析加密站播放地址（详情页调用）",
      requiresWebView: false,
      cacheDuration: 0,
      functionName: "loadResource",
      type: "stream",
      params: [
        { name: "link", title: "详情链接", type: "input", value: "" },
        { name: "title", title: "标题", type: "input", value: "" }
      ]
    }
  ]
};

// ============================================================================
// 站点配置（自 LibreTV data/gs-sites.json 导出，仅保留「有 key + 有 base」可直连站）
//   mode: 'cbc' | 'cfb'   加密模式
//   idp:  'oauth' | 'system' | 'mod'   身份字段方案
// ============================================================================
var SITES = [
  // ---- 果冻系（CBC + oauth_* + method 协议）----
  { key: "gdcm", name: "果冻传媒", mode: "cbc", idp: "oauth",
    bases: ["https://api1.gdapi1.com/api.php/", "https://api2.gdapi2.com/api.php/", "https://api3.gdapi1.com/api.php/"],
    crypto: { key: "2acf7e91e9864673", iv: "1c29882d3ddfcfd6", salt: "5589d41f92a597d016b037ac37db243d", bundleId: "com.pwa.gdcm", oauthId: "fbc236d031e742c65e485f74dd9b3df9", version: "3.9.0" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "https://kfws.xeqyy.com", videoHosts: ["https://hf-120play.sxwph.com"] },

  { key: "zpc91", name: "91制片厂", mode: "cbc", idp: "oauth",
    bases: ["https://api2.piifvly.com/api.php/", "https://api2.zpcapiz2.com/api.php/", "https://api3.zpcapiz3.com/api.php/"],
    crypto: { key: "2acf7e91e9864673", iv: "1c29882d3ddfcfd6", salt: "5589d41f92a597d016b037ac37db243d", bundleId: "com.pwa.zpcpj", oauthId: "7a84f1d768a7874f0c325fbbef92ba5c", version: "1.7.0" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "https://kfws.xeqyy.com", videoHosts: ["https://hf-120play.sxwph.com"] },

  { key: "cg51", name: "51吃瓜", mode: "cbc", idp: "oauth",
    bases: ["https://bpi3.uzapchtyr.com/api.php/api/", "https://bpi4.bjhmwjug.com/api.php/api/"],
    crypto: { key: "2acf7e91e9864673", iv: "1c29882d3ddfcfd6", salt: "5589d41f92a597d016b037ac37db243d", bundleId: "com.pwa.cgqz", oauthId: "", version: "3.5.0" },
    methods: { list: "contents/list_contents", search: "contents/search", detail: "contents/detail_content" },
    imgHost: "", videoHosts: [] },

  { key: "cgw", name: "吃瓜网", mode: "cbc", idp: "oauth",
    bases: ["https://apt1.pngufiwe.cc/"],
    crypto: { key: "0efb2cd6a0be7456", iv: "418a9a9663d9befd", salt: "ec5c6a691215d4954de4419fad6fd6dc", bundleId: "com.pwa.sf07", oauthId: "11bf0051bfa412a744986887d3cf1594", version: "1.3.4" },
    methods: { list: "contents/list_contents", search: "contents/search" },
    imgHost: "", videoHosts: [] },

  { key: "fl2", name: "Fu2", mode: "cbc", idp: "oauth",
    bases: ["https://api-al.ass6.store/", "https://api-al.tvmey.com/", "https://stream.ass6.store/", "https://stream-ani.bckbp.com/", "https://api-al.yuytyr.online/"],
    crypto: { key: "3a0fd42302f0aada8abc0529a2bde5aa", iv: "3a0fd42302f0aada8abc0529a2bde5aa", salt: "3a0fd42302f0aada8abc0529a2bde5aa", bundleId: "", oauthId: "", version: "" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "hgsp", name: "黄瓜视频", mode: "cbc", idp: "oauth",
    bases: ["https://hgapi-pnt017.soymfb.com"],
    crypto: { key: "368480924a6c78e2e8681551a7cf4c21", iv: "368480924a6c78e2e8681551a7cf4c21", salt: "368480924a6c78e2e8681551a7cf4c21", bundleId: "", oauthId: "", version: "" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "hsxs", name: "好色先生", mode: "cbc", idp: "oauth",
    bases: ["https://api2.kpsvvkl.cc/"],
    crypto: { key: "tjJHooEeIYLszIUt", iv: "bleBrccsf7MZLG29", salt: "", bundleId: "com.hsxs.cc.org", oauthId: "cccf56a5cd127bd8fca7eb7a4bca5cf5", version: "2.2.2" },
    methods: { list: "tabnew/list_construct", search: "search/mv", detail: "element/getElementById" },
    imgHost: "", videoHosts: [] },

  { key: "hu4", name: "4虎", mode: "cbc", idp: "oauth",
    bases: ["https://api2.kpsvvkl.cc/"],
    crypto: { key: "22946bc50fd63164b79df55070a85a92", iv: "kaixin1234567890", salt: "", bundleId: "", oauthId: "", version: "" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "hxsp", name: "红杏视频", mode: "cbc", idp: "oauth",
    bases: ["http://172.247.132.138/"],
    crypto: { key: "W$S3skNwm3zkHXqd", iv: "ZV8^Vg!aSyk!uRNh", salt: "", bundleId: "", oauthId: "", version: "" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "ll51", name: "51萝莉", mode: "cbc", idp: "oauth",
    bases: ["https://s704.ihrwtjf.com", "https://sapi01.gg-gv.com/api.php/", "https://sapi02.gg-gv.com/api.php/", "https://sapi03.gg-gv.com/api.php/"],
    crypto: { key: "NQYT3eSsXG52WPDS", iv: "e89225cfbbimgkcu", salt: "", bundleId: "com.7du.cn.org", oauthId: "", version: "4.1.0" },
    methods: { list: "navigation/list_short_mv", search: "search/mv" },
    imgHost: "", videoHosts: [] },

  { key: "one", name: "全(One)", mode: "cbc", idp: "oauth",
    bases: ["https://api.em1oifd0.com/", "https://api.61c76a0.com/", "https://api.j7y675.com/", "https://api.3459381.com/", "https://api.87735d5.com/", "https://api.c6dd5cc.com/"],
    crypto: { key: "l*bv%Ziq000Biaog", iv: "8597506002939249", salt: "", bundleId: "", oauthId: "", version: "" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "ttav", name: "TTAV", mode: "cbc", idp: "oauth",
    bases: ["https://d39jna88gmha0l.cloudfront.net"],
    crypto: { key: "tJqkoiJXvD7UCU3i", iv: "h79lkicjeqwko5nd", salt: "", bundleId: "com.tiktok.cc.org", oauthId: "", version: "3.4.0" },
    methods: { list: "tabnew/list_construct", search: "mv/search", detail: "element/getElementById" },
    imgHost: "", videoHosts: [] },

  { key: "txvlog", name: "糖心Vlog", mode: "cbc", idp: "oauth",
    bases: ["https://api.8ebe288ee10c0d45.com/", "https://api.32092345ec6c81f5.com/", "https://api.acaa0272469c5c16.com/", "https://api.ykkilavd.com/", "https://api.abzrzylk.com/", "https://api.wwscmafa.com/", "https://api.c1a82780f63b6c11.com/", "https://api.4d6fa906eaaf4a4f.com/", "https://api.2611e946dcb68187.com/", "https://api.9779edcc8ec4ee9c.com/"],
    crypto: { key: "02c140afa946d427", iv: "02c140afa946d427", salt: "928547a24cbf62a315d8cf0f46d67a17", bundleId: "", oauthId: "928547a24cbf62a315d8cf0f46d67a17", version: "4.80.0" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "yxfm", name: "银杏FM", mode: "cbc", idp: "oauth",
    bases: ["https://www.yuepmaa.space"],
    crypto: { key: "Af234dfdf0io@#$*", iv: "1234567890123456", salt: "", bundleId: "com.bbs.radio.web", oauthId: "", version: "1.0.0" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  { key: "zlt", name: "糟老头", mode: "cbc", idp: "oauth",
    bases: ["https://missav.ws", "https://surrit.com/", "https://hgapi-pnt017.soymfb.com", "https://hgustp-bp-lk.jachsp.com"],
    crypto: { key: "xPxo2S5uGPhKHx5g", iv: "0a1b2c3d4e5f6789", salt: "", bundleId: "", oauthId: "", version: "2.5.2" },
    methods: { list: "v2/index_items", search: "video/search", detail: "v2/video/details/" },
    imgHost: "", videoHosts: [] },

  // ---- tab 系（CFB + system_* + MvList/featured）----
  { key: "dh50", name: "50度灰", mode: "cfb", idp: "system",
    bases: ["https://api3.boygzqzff.cc/pwa.php/", "https://api1.bmvjxkdfz.cc/pwa.php/", "https://api2.bngtckrhq.cc/pwa.php/"],
    crypto: { key: "7205a6c3883caf95b52db5b534e12ec3", iv: "81d7beac44a86f43", salt: "7205a6c3883caf95b52db5b534e12ec3", bundleId: "", oauthId: "a1B2c3D4e5F6g7H8", version: "6.3.3" },
    methods: { list: "MvList/featured", tabList: "api/tab/listv1" },
    imgHost: "", videoHosts: [], tabId: 12 },

  { key: "ttt", name: "汤头条", mode: "cfb", idp: "system",
    bases: ["https://d39jna88gmha0l.cloudfront.net", "https://api3.rcbvmajq.cc/pwa.php/"],
    crypto: { key: "7205a6c3883caf95b52db5b534e12ec3", iv: "81d7beac44a86f43", salt: "7205a6c3883caf95b52db5b534e12ec3", bundleId: "", oauthId: "a1B2c3D4e5F6g7H8", version: "9.5.5" },
    methods: { list: "MvList/featured", tabList: "api/tab/listv1" },
    imgHost: "", videoHosts: [], tabId: 1 },

  { key: "lxs", name: "撸先生", mode: "cfb", idp: "oauth",
    bases: ["https://s704.ihrwtjf.com"],
    crypto: { key: "f95277cfbbimgkcusimcuekd3b777pwa", iv: "f95277cfbbimgkcu", salt: "", bundleId: "com.tvlutv", oauthId: "", version: "2.4.2" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "", videoHosts: [] },

  // ---- dsp91（CFB + mod/code 协议）----
  { key: "dsp91", name: "91短视频", mode: "cfb", idp: "mod",
    bases: ["https://ujvxsl.nkbvfuvu.cc/"],
    crypto: { key: "cc88ddc9357ff461e08f047aedee692b", iv: "e89225cfbbimgkcu", salt: "cc88ddc9357ff461e08f047aedee692b", bundleId: "", oauthId: "", version: "7.4.5" },
    methods: { list: "index/listByTag", search: "index/search", detail: "element/getElementItembyId" },
    imgHost: "", videoHosts: [] }
];

var DEFAULT_UA = "okhttp/4.9.0";

// ============================================================================
// ---------- UTF-8 ----------
// ============================================================================
function utf8Encode(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      var c2 = str.charCodeAt(i + 1);
      var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
      i++;
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    } else { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
  }
  return out;
}
function utf8Decode(bytes) {
  var s = "", i = 0;
  while (i < bytes.length) {
    var b = bytes[i++];
    if (b < 0x80) s += String.fromCharCode(b);
    else if (b < 0xe0) { s += String.fromCharCode(((b & 31) << 6) | (bytes[i++] & 63)); }
    else if (b < 0xf0) { s += String.fromCharCode(((b & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63)); }
    else {
      var cp = ((b & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
      cp -= 0x10000;
      s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 1023));
    }
  }
  return s;
}
// ---------- Base64 ----------
var B64C = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var B64R = null;
function base64Encode(bytes) {
  var out = "", i;
  for (i = 0; i + 2 < bytes.length; i += 3) {
    var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64C[(n >> 18) & 63] + B64C[(n >> 12) & 63] + B64C[(n >> 6) & 63] + B64C[n & 63];
  }
  var rem = bytes.length - i;
  if (rem === 1) { var n1 = bytes[i] << 16; out += B64C[(n1 >> 18) & 63] + B64C[(n1 >> 12) & 63] + "=="; }
  else if (rem === 2) { var n2 = (bytes[i] << 16) | (bytes[i + 1] << 8); out += B64C[(n2 >> 18) & 63] + B64C[(n2 >> 12) & 63] + B64C[(n2 >> 6) & 63] + "="; }
  return out;
}
function base64Decode(str) {
  if (!B64R) { B64R = {}; for (var k = 0; k < B64C.length; k++) B64R[B64C.charAt(k)] = k; }
  var s = String(str || "").replace(/[^A-Za-z0-9+/]/g, "");
  var out = [], i;
  for (i = 0; i + 3 < s.length; i += 4) {
    var n = (B64R[s.charAt(i)] << 18) | (B64R[s.charAt(i + 1)] << 12) | (B64R[s.charAt(i + 2)] << 6) | B64R[s.charAt(i + 3)];
    out.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  var rest = s.length - i;
  if (rest === 3) { var m = (B64R[s.charAt(i)] << 18) | (B64R[s.charAt(i + 1)] << 12) | (B64R[s.charAt(i + 2)] << 6); out.push((m >> 16) & 255, (m >> 8) & 255); }
  else if (rest === 2) { var m2 = (B64R[s.charAt(i)] << 18) | (B64R[s.charAt(i + 1)] << 12); out.push((m2 >> 16) & 255); }
  return out;
}
// ---------- MD5 ----------
function md5Hex(str) {
  var msg = utf8Encode(str), len = msg.length;
  var bitLen = len * 8;
  msg.push(0x80);
  while (msg.length % 64 !== 56) msg.push(0);
  var lo = bitLen >>> 0, hi = Math.floor(bitLen / 4294967296) >>> 0;
  msg.push(lo & 255, (lo >>> 8) & 255, (lo >>> 16) & 255, (lo >>> 24) & 255);
  msg.push(hi & 255, (hi >>> 8) & 255, (hi >>> 16) & 255, (hi >>> 24) & 255);
  var a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  var S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
           5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
           4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
           6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  var K = [];
  for (var i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
  for (var off = 0; off < msg.length; off += 64) {
    var M = [];
    for (var j = 0; j < 16; j++) M[j] = msg[off + j * 4] | (msg[off + j * 4 + 1] << 8) | (msg[off + j * 4 + 2] << 16) | (msg[off + j * 4 + 3] << 24);
    var A = a0, B = b0, C = c0, D = d0;
    for (var r = 0; r < 64; r++) {
      var F, g;
      if (r < 16) { F = (B & C) | (~B & D); g = r; }
      else if (r < 32) { F = (D & B) | (~D & C); g = (5 * r + 1) % 16; }
      else if (r < 48) { F = B ^ C ^ D; g = (3 * r + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * r) % 16; }
      var tmp = D; D = C; C = B;
      var sum = (A + F + K[r] + M[g]) | 0;
      B = (B + ((sum << S[r]) | (sum >>> (32 - S[r])))) | 0;
      A = tmp;
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
  }
  function w(x) { var s = ""; for (var i = 0; i < 4; i++) { var b = (x >>> (i * 8)) & 255; s += ("0" + b.toString(16)).slice(-2); } return s; }
  return w(a0) + w(b0) + w(c0) + w(d0);
}
// ---------- SHA-256 ----------
function sha256Hex(str) {
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var bytes = utf8Encode(str);
  var l = bytes.length;
  var bitLen = l * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  var hi = Math.floor(bitLen / 4294967296);
  var lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  for (var off = 0; off < bytes.length; off += 64) {
    var w = new Array(64);
    for (var i = 0; i < 16; i++) {
      w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    }
    for (var i2 = 16; i2 < 64; i2++) {
      var s0 = rotr(w[i2 - 15], 7) ^ rotr(w[i2 - 15], 18) ^ (w[i2 - 15] >>> 3);
      var s1 = rotr(w[i2 - 2], 17) ^ rotr(w[i2 - 2], 19) ^ (w[i2 - 2] >>> 10);
      w[i2] = (w[i2 - 16] + s0 + w[i2 - 7] + s1) >>> 0;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (var i3 = 0; i3 < 64; i3++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = (e & f) ^ ((~e) & g);
      var temp1 = (h + S1 + ch + K[i3] + w[i3]) >>> 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  var out = "";
  for (var j = 0; j < 8; j++) {
    var x = H[j];
    for (var k = 0; k < 4; k++) { var b = (x >>> (24 - k * 8)) & 255; out += ("0" + b.toString(16)).slice(-2); }
  }
  return out;
}
// ---------- AES（支持 AES-128 与 AES-256，CBC + CFB-128）----------
var AES = (function () {
  function xt(a) { return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff; }
  function mul(a, b) { var r = 0; while (b) { if (b & 1) r ^= a; a = xt(a); b >>= 1; } return r & 0xff; }
  var SBOX = [], INV = [];
  for (var a = 0; a < 256; a++) {
    var inv = 0;
    if (a) { for (var b = 1; b < 256; b++) { if (mul(a, b) === 1) { inv = b; break; } } }
    var x = inv;
    var s = x ^ ((x << 1 | x >> 7) & 255) ^ ((x << 2 | x >> 6) & 255) ^ ((x << 3 | x >> 5) & 255) ^ ((x << 4 | x >> 4) & 255) ^ 0x63;
    SBOX[a] = s & 0xff;
  }
  for (var i = 0; i < 256; i++) INV[SBOX[i]] = i;

  // key: 16 字节 → AES-128 (Nk=4, Nr=10)；32 字节 → AES-256 (Nk=8, Nr=14)
  function expandKey(key) {
    var Nk = key.length / 4;
    var Nr = Nk + 6;
    var w = [];
    for (var i = 0; i < Nk; i++) w[i] = (key[i * 4] << 24) | (key[i * 4 + 1] << 16) | (key[i * 4 + 2] << 8) | key[i * 4 + 3];
    var rcon = 1;
    for (var j = Nk; j < 4 * (Nr + 1); j++) {
      var t = w[j - 1];
      if (j % Nk === 0) {
        t = ((t << 8) | (t >>> 24)) >>> 0;
        t = ((SBOX[(t >>> 24) & 255] << 24) | (SBOX[(t >>> 16) & 255] << 16) | (SBOX[(t >>> 8) & 255] << 8) | SBOX[t & 255]) >>> 0;
        t = (t ^ (rcon << 24)) >>> 0;
        rcon = xt(rcon);
      } else if (Nk > 6 && j % Nk === 4) {
        t = ((SBOX[(t >>> 24) & 255] << 24) | (SBOX[(t >>> 16) & 255] << 16) | (SBOX[(t >>> 8) & 255] << 8) | SBOX[t & 255]) >>> 0;
      }
      w[j] = (w[j - Nk] ^ t) >>> 0;
    }
    return { w: w, Nr: Nr };
  }

  function encBlock(ks, s) {
    var w = ks.w, Nr = ks.Nr;
    var st = [];
    for (var i = 0; i < 4; i++) st[i] = s[i] ^ w[i];
    for (var round = 1; round <= Nr; round++) {
      var t = [];
      for (var c = 0; c < 4; c++) t[c] = (SBOX[(st[c] >>> 24) & 255] << 24) | (SBOX[(st[c] >>> 16) & 255] << 16) | (SBOX[(st[c] >>> 8) & 255] << 8) | SBOX[st[c] & 255];
      var sh = [];
      for (var c2 = 0; c2 < 4; c2++) sh[c2] = [(t[c2] >>> 24) & 255, (t[c2] >>> 16) & 255, (t[c2] >>> 8) & 255, t[c2] & 255];
      var rows = [[], [], [], []];
      for (var col = 0; col < 4; col++) for (var row = 0; row < 4; row++) rows[row][col] = sh[col][row];
      for (var row2 = 0; row2 < 4; row2++) { var tmp = rows[row2].slice(); for (var col2 = 0; col2 < 4; col2++) rows[row2][col2] = tmp[(col2 + row2) % 4]; }
      for (var col3 = 0; col3 < 4; col3++) for (var row3 = 0; row3 < 4; row3++) sh[col3][row3] = rows[row3][col3];
      var mixed = [];
      for (var c3 = 0; c3 < 4; c3++) {
        var a0 = sh[c3][0], a1 = sh[c3][1], a2 = sh[c3][2], a3 = sh[c3][3];
        if (round !== Nr) mixed[c3] = ((mul(a0, 2) ^ mul(a1, 3) ^ a2 ^ a3) << 24 | (a0 ^ mul(a1, 2) ^ mul(a2, 3) ^ a3) << 16 | (a0 ^ a1 ^ mul(a2, 2) ^ mul(a3, 3)) << 8 | (mul(a0, 3) ^ a1 ^ a2 ^ mul(a3, 2))) >>> 0;
        else mixed[c3] = ((a0 << 24) | (a1 << 16) | (a2 << 8) | a3) >>> 0;
      }
      for (var c4 = 0; c4 < 4; c4++) st[c4] = (mixed[c4] ^ w[round * 4 + c4]) >>> 0;
    }
    return st;
  }

  function decBlock(ks, s) {
    var w = ks.w, Nr = ks.Nr;
    var st = [];
    for (var i = 0; i < 4; i++) st[i] = s[i] >>> 0;
    for (var round = Nr; round >= 1; round--) {
      for (var k = 0; k < 4; k++) st[k] = (st[k] ^ w[round * 4 + k]) >>> 0;
      if (round !== Nr) {
        var out = [];
        for (var c = 0; c < 4; c++) {
          var b0 = (st[c] >>> 24) & 255, b1 = (st[c] >>> 16) & 255, b2 = (st[c] >>> 8) & 255, b3 = st[c] & 255;
          out[c] = ((mul(b0, 14) ^ mul(b1, 11) ^ mul(b2, 13) ^ mul(b3, 9)) << 24 |
                    (mul(b0, 9) ^ mul(b1, 14) ^ mul(b2, 11) ^ mul(b3, 13)) << 16 |
                    (mul(b0, 13) ^ mul(b1, 9) ^ mul(b2, 14) ^ mul(b3, 11)) << 8 |
                    (mul(b0, 11) ^ mul(b1, 13) ^ mul(b2, 9) ^ mul(b3, 14))) >>> 0;
        }
        st = out;
      }
      var cols = [];
      for (var c2 = 0; c2 < 4; c2++) cols[c2] = [(st[c2] >>> 24) & 255, (st[c2] >>> 16) & 255, (st[c2] >>> 8) & 255, st[c2] & 255];
      var rows = [[], [], [], []];
      for (var cc = 0; cc < 4; cc++) for (var rr = 0; rr < 4; rr++) rows[rr][cc] = cols[cc][rr];
      for (var r2 = 0; r2 < 4; r2++) { var t2 = rows[r2].slice(); for (var c3 = 0; c3 < 4; c3++) rows[r2][(c3 + r2) % 4] = t2[c3]; }
      for (var c4 = 0; c4 < 4; c4++) for (var r3 = 0; r3 < 4; r3++) cols[c4][r3] = rows[r3][c4];
      var st2 = [];
      for (var c5 = 0; c5 < 4; c5++) st2[c5] = ((cols[c5][0] << 24) | (cols[c5][1] << 16) | (cols[c5][2] << 8) | cols[c5][3]) >>> 0;
      var st3 = [];
      for (var c6 = 0; c6 < 4; c6++) st3[c6] = ((INV[(st2[c6] >>> 24) & 255] << 24) | (INV[(st2[c6] >>> 16) & 255] << 16) | (INV[(st2[c6] >>> 8) & 255] << 8) | INV[st2[c6] & 255]) >>> 0;
      st = st3;
    }
    for (var k2 = 0; k2 < 4; k2++) st[k2] = (st[k2] ^ w[k2]) >>> 0;
    return st;
  }

  function wordsToBytes(words) {
    var out = [];
    for (var i = 0; i < words.length; i++) out.push((words[i] >>> 24) & 255, (words[i] >>> 16) & 255, (words[i] >>> 8) & 255, words[i] & 255);
    return out;
  }

  // CBC（AES-128/256，PKCS7 由调用方处理）
  function cbc(keyBytes, ivBytes, dataBytes, encrypt) {
    var ks = expandKey(keyBytes);
    var iv = [];
    for (var i = 0; i < 4; i++) iv[i] = ((ivBytes[i * 4] << 24) | (ivBytes[i * 4 + 1] << 16) | (ivBytes[i * 4 + 2] << 8) | ivBytes[i * 4 + 3]) >>> 0;
    var out = [], prev = iv;
    for (var off = 0; off < dataBytes.length; off += 16) {
      var blk = [];
      for (var j = 0; j < 4; j++) blk[j] = ((dataBytes[off + j * 4] << 24) | (dataBytes[off + j * 4 + 1] << 16) | (dataBytes[off + j * 4 + 2] << 8) | dataBytes[off + j * 4 + 3]) >>> 0;
      var res;
      if (encrypt) res = encBlock(ks, [blk[0] ^ prev[0], blk[1] ^ prev[1], blk[2] ^ prev[2], blk[3] ^ prev[3]]);
      else {
        res = decBlock(ks, blk);
        res = [(res[0] ^ prev[0]) >>> 0, (res[1] ^ prev[1]) >>> 0, (res[2] ^ prev[2]) >>> 0, (res[3] ^ prev[3]) >>> 0];
      }
      for (var j2 = 0; j2 < 4; j2++) out.push((res[j2] >>> 24) & 255, (res[j2] >>> 16) & 255, (res[j2] >>> 8) & 255, res[j2] & 255);
      if (encrypt) prev = res;
      else prev = blk;
    }
    return out;
  }

  // CFB-128：寄存器反馈。encrypt=true 加密（data=明文，寄存器喂密文=输出），
  // encrypt=false 解密（data=密文，寄存器喂密文=输入）。
  function cfbX(keyBytes, ivBytes, dataBytes, encrypt) {
    var ks = expandKey(keyBytes);
    var reg = [];
    for (var i = 0; i < 4; i++) reg[i] = (ivBytes[i * 4] << 24) | (ivBytes[i * 4 + 1] << 16) | (ivBytes[i * 4 + 2] << 8) | ivBytes[i * 4 + 3];
    var out = [];
    for (var off = 0; off < dataBytes.length; off += 16) {
      var enc = encBlock(ks, reg);
      var block = [];
      for (var i = 0; i < 16 && off + i < dataBytes.length; i++) {
        var kb = (enc[(i >> 2)] >>> (24 - (i & 3) * 8)) & 255;
        block.push(dataBytes[off + i] ^ kb);
      }
      out = out.concat(block);
      // 寄存器始终喂「密文块」：加密时=输出 block，解密时=输入 dataBytes
      var feed = encrypt ? block : dataBytes.slice(off, off + 16);
      for (var j = 0; j < 4; j++) {
        var b0 = feed[j * 4] || 0, b1 = feed[j * 4 + 1] || 0, b2 = feed[j * 4 + 2] || 0, b3 = feed[j * 4 + 3] || 0;
        reg[j] = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
      }
    }
    return out;
  }

  return { cbc: cbc, cfb: cfbX };
})();

function keyBytesOf(keyStr) {
  return utf8Encode(keyStr);
}
function ivBytesOf(ivStr) {
  var b = utf8Encode(ivStr);
  if (b.length > 16) b = b.slice(0, 16);
  while (b.length < 16) b.push(0);
  return b;
}

// 加密：mode 'cbc' → base64，'cfb' → hex(base16)
function encryptPayload(site, plainStr) {
  var c = site.crypto;
  var kb = keyBytesOf(c.key);
  var ib = ivBytesOf(c.iv);
  if (site.mode === "cfb") {
    var enc = AES.cfb(kb, ib, utf8Encode(plainStr), true);
    var hex = "";
    for (var i = 0; i < enc.length; i++) hex += ("0" + enc[i].toString(16)).slice(-2);
    return hex;
  }
  var data = utf8Encode(plainStr);
  var pad = 16 - (data.length % 16);
  for (var p = 0; p < pad; p++) data.push(pad);
  return base64Encode(AES.cbc(kb, ib, data, true));
}
// 解密：mode 'cbc' → base64 输入，'cfb' → hex 输入
function decryptPayload(site, encoded) {
  var c = site.crypto;
  var kb = keyBytesOf(c.key);
  var ib = ivBytesOf(c.iv);
  if (site.mode === "cfb") {
    var s = String(encoded || "").trim();
    var bytes = [];
    for (var i = 0; i + 1 < s.length; i += 2) bytes.push(parseInt(s.substr(i, 2), 16));
    if (!bytes.length) return "";
    return utf8Decode(AES.cfb(kb, ib, bytes, false));
  }
  var bytes = base64Decode(encoded);
  if (!bytes.length || bytes.length % 16 !== 0) return "";
  var out = AES.cbc(kb, ib, bytes, false);
  var pad = out[out.length - 1];
  if (pad >= 1 && pad <= 16) out = out.slice(0, out.length - pad);
  return utf8Decode(out);
}

// ============================================================================
// ---------- 工具 ----------
// ============================================================================
function dsText(value) { return value == null ? "" : String(value).trim(); }
function clean(value) {
  return dsText(value).replace(/[\u200b\u200c\u200d\ufeff]/g, "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}
function pick() {
  for (var i = 0; i < arguments.length; i++) {
    var v = arguments[i];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}
function jsonEncode(obj) { return JSON.stringify(obj); }
function jsonDecode(str) {
  if (!str) return null;
  var s = dsText(str);
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}

// 递归解包：dh50/ttt 解密结果是「JSON 字符串」可能再套一层
function deepJsonParse(text) {
  var cur = text;
  for (var i = 0; i < 8; i++) {
    if (typeof cur !== "string") return cur;
    var t = cur.trim();
    if (!/^[{["]/.test(t)) return cur;
    try { cur = JSON.parse(t); } catch (e) { return cur; }
  }
  return cur;
}

function siteByKey(key) {
  for (var i = 0; i < SITES.length; i++) if (SITES[i].key === key) return SITES[i];
  return null;
}

// ============================================================================
// ---------- pwa-aes 协议核心 ----------
// ============================================================================
function signFor(data, ts, salt) {
  var s = "client=pwa&data=" + data + "&timestamp=" + ts + (salt || "");
  return md5Hex(sha256Hex(s));
}

// 构造身份字段
function buildIdentity(site, ts) {
  var c = site.crypto;
  if (site.idp === "system") {
    return {
      system_oauth_type: "pwa",
      system_oauth_new_id: "",
      system_version: c.version || "1.0.0",
      system_app_type: "",
      system_build: "",
      system_build_id: "",
      system_oauth_id: c.oauthId || "a1B2c3D4e5F6g7H8",
      system_timestamp: ts
    };
  }
  return {
    token: "",
    via: "pwa",
    language: "zh",
    version: c.version || "1.0.0",
    oauth_type: "web",
    bundleId: c.bundleId || "",
    oauth_id: c.oauthId || ""
  };
}

// 打一次加密接口，返回解密后的 JSON 对象；失败抛错
async function pwaCall(site, method, params) {
  var c = site.crypto;
  var ts = String(Math.floor(Date.now() / 1000));

  var plain;
  if (site.idp === "mod") {
    // dsp91：mod/code 进加密体，form 只带 4 字段
    var parts = String(method).split("/");
    plain = { oauth_type: "pwa", version: c.version || "1.0.0", timestamp: ts, oauth_id: c.oauthId || "", mod: parts[0], code: parts[1] || "", };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) plain[k] = params[k];
  } else {
    plain = buildIdentity(site, ts);
    for (var k2 in params) if (Object.prototype.hasOwnProperty.call(params, k2)) plain[k2] = params[k2];
  }

  var data = encryptPayload(site, jsonEncode(plain));
  var sign = signFor(data, ts, c.salt || "");
  var form = "client=pwa&data=" + encodeURIComponent(data) + "&timestamp=" + ts + "&sign=" + encodeURIComponent(sign);
  var headers = {
    "User-Agent": DEFAULT_UA,
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  var errors = [];
  for (var i = 0; i < site.bases.length; i++) {
    var b = site.bases[i].replace(/\/+$/, "");
    var url;
    if (site.idp === "mod") {
      // dsp91：POST 到 base + pwa.php
      url = b + "/pwa.php";
    } else {
      var m = String(method).replace(/^\/+/, "").replace(/^api\//, "");
      if (/\/(pwa|api)\.php\/api$/i.test(b)) url = b + "/" + m;
      else if (/\/(pwa|api)\.php$/i.test(b)) url = b + "/api/" + m;
      else url = b + "/api.php/api/" + m;
    }
    try {
      var resp = await Widget.http.post(url, form, { headers: headers, timeout: 15000 });
      var body = resp && resp.data !== undefined ? resp.data : resp;
      var text = typeof body === "string" ? body : JSON.stringify(body);
      var j = jsonDecode(text);
      if (!j) { errors.push(url + ": 非JSON"); continue; }
      if (typeof j.data === "string" && j.data) {
        var dec = decryptPayload(site, j.data);
        var obj = deepJsonParse(dec);
        if (obj !== null && obj !== undefined) return obj;
        if (dec) return { __raw: dec };
        errors.push(url + ": 解密失败");
        continue;
      }
      return j;
    } catch (e) {
      errors.push(url + ": " + (e && e.message ? e.message : String(e)));
    }
  }
  throw new Error("加密站请求失败: " + errors.slice(0, 2).join(" | "));
}

// 递归取列表数组（容忍 data/list 包装）
function arrayOf(j) {
  if (Array.isArray(j)) return j;
  if (j && typeof j === "object") {
    // dh50/ttt 的 data 可能是 JSON 字符串，先解
    if (typeof j.data === "string") { var d = deepJsonParse(j.data); if (d && typeof d === "object") j.data = d; }
    var cands = ["list", "videos", "mvs", "mv_list", "video_list", "items", "data", "content", "records", "rows"];
    for (var i = 0; i < cands.length; i++) {
      var v = j[cands[i]];
      if (Array.isArray(v)) return v;
    }
    if (j.data && typeof j.data === "object") return arrayOf(j.data);
  }
  return [];
}

// ============================================================================
// ---------- 字段提取 ----------
// ============================================================================
// 封面字段可能是 JSON 字符串 {"ori":"...","360":"...","720":"..."}
function resolveCover(it) {
  var raw = pick(it.cover_horizontal, it.cover_vertical, it.cover, it.cover_img, it.cover_thumb, it.cover_url, it.thumb, it.thumb_cover, it.thumb_cover_str, it.thumbnail, it.img_url, it.poster, it.vod_pic, it.img, it.pic);
  if (!raw) return "";
  var u = String(raw).trim();
  if (u.charAt(0) === "{") {
    var o = jsonDecode(u);
    if (o) return pick(o.ori, o["720"], o["360"], raw);
  }
  return u;
}
function coverOf(site, it) {
  var u = resolveCover(it);
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (site.imgHost) return site.imgHost + (u.charAt(0) === "/" ? "" : "/") + u;
  return u;
}
function titleOf(it) {
  return clean(pick(it.title, it.name, it.vod_name, it.mv_name, it.video_title, ""));
}
function idOf(it) {
  return String(pick(it.id, it.video_id, it.mv_id, it.vod_id, it.aid, ""));
}
function linkOf(siteKey, id) { return "gs://" + siteKey + "/" + id; }
function parseLink(raw) {
  var s = String(raw || "");
  // 两种形态：link="gs://<key>/<id>" 或 id="gs-<key>-<id>"
  var m = s.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (m) return { site: m[1], id: decodeURIComponent(m[2]) };
  var m2 = s.match(/^gs-([^-]+)-(.+)$/);
  if (m2) return { site: m2[1], id: decodeURIComponent(m2[2]) };
  return null;
}
function durationText(sec) {
  var s = parseInt(sec, 10) || 0;
  if (s <= 0) return "";
  var m = Math.floor(s / 60);
  if (m <= 0) return s + "秒";
  if (m < 60) return m + "分钟";
  var h = Math.floor(m / 60);
  return h + "小时" + (m % 60) + "分";
}
function itemOf(it, site) {
  var id = idOf(it);
  var title = titleOf(it);
  if (!title) return null;
  var cover = coverOf(site, it);
  var bits = [site.name];
  var durStr = dsText(it.duration_str) || durationText(it.duration);
  if (durStr) bits.push(durStr);
  if (it.actors) bits.push(clean(it.actors));
  if (it.publisher) bits.push(clean(it.publisher));
  if (it.count_play) bits.push("播放 " + it.count_play);
  return {
    id: "gs-" + site.key + "-" + (id || title),
    type: "url",
    mediaType: "movie",
    title: title,
    link: linkOf(site.key, id || title),
    description: bits.join(" · "),
    posterPath: cover,
    coverUrl: cover,
    posterUrl: cover,
    imageUrl: cover,
    playerType: "app"
  };
}

// 从列表项/详情里挖播放直链（preview_url 相对路径 or 完整直链）
function pickPlay(node) {
  var direct = pick(node.preview_url, node.play_url, node.playUrl, node.source_240, node.url, node.m3u8, node.video_url, node.preview_video);
  if (direct) return String(direct);
  var vs = node.video_sources;
  if (vs && typeof vs === "object") {
    var u = pick(vs.url_265, vs.url_264);
    if (u) return String(u);
  }
  return "";
}

// ============================================================================
// ---------- Rex 入口 ----------
// ============================================================================
// 列表：果冻系走 list 方法，dh50/ttt 走 MvList/featured+tabId，dsp91 走 index/listByTag
async function loadList(params) {
  params = params || {};
  var page = Math.max(1, parseInt(params.page, 10) || 1);
  var out = [];
  for (var i = 0; i < SITES.length; i++) {
    var site = SITES[i];
    try {
      var j;
      if (site.key === "dh50" || site.key === "ttt") {
        j = await pwaCall(site, site.methods.list, { tabId: site.tabId || 1, page: page, size: 20 });
      } else if (site.idp === "mod") {
        j = await pwaCall(site, site.methods.list, { type: "new", page: page, tags: 10, limit: 20 });
      } else {
        j = await pwaCall(site, site.methods.list || "mv/list_construct", { page: page, limit: 30, id: 1, sort: "new", _hash: 0 });
      }
      var arr = arrayOf(j);
      for (var k = 0; k < arr.length; k++) {
        var it = itemOf(arr[k], site);
        if (it) out.push(it);
      }
    } catch (e) {
      // 单站失败忽略
    }
  }
  return out;
}

async function searchVideos(params) {
  params = params || {};
  var keyword = clean(params.keyword || params.q || "");
  if (!keyword) return [];
  var page = Math.max(1, parseInt(params.page, 10) || 1);
  var out = [];
  for (var i = 0; i < SITES.length; i++) {
    var site = SITES[i];
    try {
      var j;
      if (site.key === "dh50" || site.key === "ttt") {
        // dh50/ttt 搜索走 MvSearch/search
        j = await pwaCall(site, "MvSearch/search", { page: page, size: 20, word: keyword });
      } else if (site.idp === "mod") {
        j = await pwaCall(site, site.methods.search, { type: 2, key: keyword, page: page });
      } else {
        j = await pwaCall(site, site.methods.search || "mv/search", { page: page, limit: 36, type: 2, word: keyword });
      }
      var arr = arrayOf(j);
      for (var k = 0; k < arr.length; k++) {
        var it = itemOf(arr[k], site);
        if (it) out.push(it);
      }
    } catch (e) {
      // 单站失败忽略
    }
  }
  return out;
}

// 播放解析：详情接口挖 preview_url / 完整直链，返回 VideoResource[]
async function loadResource(params) {
  params = params || {};
  var raw = params.link || params.url || params.id || "";
  var parsed = parseLink(raw);
  if (!parsed) return [];
  var site = siteByKey(parsed.site);
  if (!site) return [];
  try {
    var j;
    if (site.idp === "mod") {
      j = await pwaCall(site, site.methods.detail, { id: Number(parsed.id) || parsed.id });
    } else if (site.key === "dh50" || site.key === "ttt") {
      // dh50/ttt 详情
      j = await pwaCall(site, "MvList/detail", { id: Number(parsed.id) || parsed.id });
    } else {
      j = await pwaCall(site, site.methods.detail || "mv/getDetail", { id: Number(parsed.id) || parsed.id });
    }

    // 定位详情节点
    var node = j;
    if (j && typeof j === "object") {
      if (typeof j.data === "string") { var dd = deepJsonParse(j.data); if (dd && typeof dd === "object") j.data = dd; }
      if (j.data && typeof j.data === "object") {
        node = (j.data.detail && typeof j.data.detail === "object") ? j.data.detail : j.data;
        for (var keys = ["detail", "info", "data"]; ; ) {
          var advanced = false;
          for (var ki = 0; ki < 3; ki++) {
            var kk = keys[ki];
            if (node && node[kk] && typeof node[kk] === "object" && !Array.isArray(node[kk])) { node = node[kk]; advanced = true; break; }
          }
          if (!advanced) break;
        }
      }
    }

    var pu = pickPlay(node);
    // 有些站详情把播放藏在列表里
    if (!pu) {
      var arr = arrayOf(node);
      for (var ai = 0; ai < arr.length && !pu; ai++) pu = pickPlay(arr[ai]);
    }
    if (!pu) return [];

    var lines = [];
    if (/^https?:\/\//i.test(String(pu))) {
      lines.push({
        name: "直链 · " + site.name,
        description: site.name + " 加密站直连（本地解密）",
        url: String(pu),
        playerType: "app"
      });
    } else {
      var hosts = site.videoHosts || [];
      if (!hosts.length) return [];
      for (var h = 0; h < hosts.length; h++) {
        var u = hosts[h] + (String(pu).charAt(0) === "/" ? "" : "/") + pu;
        lines.push({
          name: "HLS · " + site.name + (hosts.length > 1 ? " 线路" + (h + 1) : ""),
          description: site.name + " 加密站直连（本地解密）",
          url: u,
          playerType: "app"
        });
      }
    }
    return lines;
  } catch (e) {
    return [];
  }
}
