// ============================================================================
// Rex 模块 · 怪兽聚合加密站（rex.mi3s.gs）— 每站独立入口版
// ----------------------------------------------------------------------------
// 把 avbox「怪兽聚合」里实测可用的 pwa-aes 加密站接入 Rex，纯无中转。
//
// ★ 实测结论（2026-11-02，逐站探测 19 个候选站）：
//   真正可用的只有 3 站，其余 16 站 API 域名已失效：
//     - gdcm 果冻传媒  列表✅ 搜索✅ 详情✅(preview_url 相对路径) 分类❌(接口已死)
//     - dh50 50度灰    列表✅(带 source_240 完整直链) 分类✅(动态树) 搜索△
//     - ttt  汤头条    列表✅(source_240/480/720/1080)  分类✅(动态树) 搜索△
//
// 设计原则（响应「每个站点/分类都要分开，避免一次性全加载卡顿」）：
//   1) 每站一个独立 video 模块（静态声明，独立 functionName），点哪个站才请求哪个站。
//   2) 站内分类：dh50/ttt 有动态分类树（api/tab/listv1），点进站先返回分类列表
//      （用 genreItems 子条目呈现），点具体分类才拉该分类片单。
//   3) 每个资源独立计算：列表阶段只取 id/title/封面/时长，不预解析播放地址；
//      点开某条才由 loadResource(stream) 调详情/取直链。
//   4) dh50/ttt 列表条目已带 source_240 完整直链 → 直接塞 videoUrl，点开秒播。
//
// 协议（libapp.so 反编译 + LibreTV gs-gateway.ts 确证）：
//   明文 = 身份字段（果冻系 oauth_*，dh50/ttt system_*）+ 业务参数
//   加密 = AES-128-CBC/PKCS7（果冻系，data=base64）/ AES-256-CFB-128（dh50/ttt，data=hex）
//   签名 = md5( hex(sha256("client=pwa&data=<data>&timestamp=<秒>" + salt)) )
//   响应 = {errcode:0, data:"<密文>"}，dh50/ttt 的 data 是「JSON 字符串字面量」需多重 parse
//
// 环境：只用 Rex 的 Widget.http.post。无 fetch/crypto，AES/MD5/SHA256/Base64/UTF8 全内联。
// ============================================================================

WidgetMetadata = {
  id: "rex.mi3s.gs",
  title: "怪兽聚合·加密站",
  description: "avbox 怪兽聚合实测可用加密站（果冻传媒/50度灰/汤头条），每站独立入口+站内分类，pwa-aes 本地解密纯无中转",
  author: "mi3s",
  site: "https://github.com/mi3s",
  version: "2.0.0",
  requiredVersion: "0.0.1",
  search: {
    title: "搜索加密站",
    functionName: "searchVideos",
    params: [{ name: "keyword", title: "关键词（片名/番号）", type: "input", value: "" }]
  },
  modules: [
    {
      id: "gs-gdcm",
      title: "果冻传媒",
      description: "果冻传媒最新片单 + 搜索（分类接口已失效）",
      requiresWebView: false,
      cacheDuration: 120,
      functionName: "gdcmList",
      type: "video",
      params: [{ name: "page", title: "页码", type: "page" }]
    },
    {
      id: "gs-dh50",
      title: "50度灰",
      description: "50度灰分类片单（点开选择分类）",
      requiresWebView: false,
      cacheDuration: 120,
      functionName: "dh50List",
      type: "video",
      params: []
    },
    {
      id: "gs-ttt",
      title: "汤头条",
      description: "汤头条分类片单（点开选择分类）",
      requiresWebView: false,
      cacheDuration: 120,
      functionName: "tttList",
      type: "video",
      params: []
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
// 站点配置（仅实测可用的 3 站）
//   mode: 'cbc' | 'cfb'    idp: 'oauth' | 'system'
// ============================================================================
var SITES = [
  {
    key: "gdcm", name: "果冻传媒", mode: "cbc", idp: "oauth",
    bases: ["https://api1.gdapi1.com/api.php/", "https://api2.gdapi2.com/api.php/", "https://api3.gdapi1.com/api.php/"],
    crypto: { key: "2acf7e91e9864673", iv: "1c29882d3ddfcfd6", salt: "5589d41f92a597d016b037ac37db243d", bundleId: "com.pwa.gdcm", oauthId: "fbc236d031e742c65e485f74dd9b3df9", version: "3.9.0" },
    methods: { list: "mv/list_construct", search: "mv/search", detail: "mv/getDetail" },
    imgHost: "https://kfws.xeqyy.com",
    videoHosts: ["https://hf-120play.sxwph.com"],
    hasCats: false
  },
  {
    key: "dh50", name: "50度灰", mode: "cfb", idp: "system",
    bases: ["https://api3.boygzqzff.cc/pwa.php/", "https://api1.bmvjxkdfz.cc/pwa.php/", "https://api2.bngtckrhq.cc/pwa.php/"],
    crypto: { key: "7205a6c3883caf95b52db5b534e12ec3", iv: "81d7beac44a86f43", salt: "7205a6c3883caf95b52db5b534e12ec3", bundleId: "", oauthId: "a1B2c3D4e5F6g7H8", version: "6.3.3" },
    methods: { list: "MvList/featured", tabList: "api/tab/listv1", search: "MvSearch/video" },
    imgHost: "",
    videoHosts: [],
    hasCats: true,
    defaultTabId: 12
  },
  {
    key: "ttt", name: "汤头条", mode: "cfb", idp: "system",
    bases: ["https://d39jna88gmha0l.cloudfront.net", "https://api3.rcbvmajq.cc/pwa.php/"],
    crypto: { key: "7205a6c3883caf95b52db5b534e12ec3", iv: "81d7beac44a86f43", salt: "7205a6c3883caf95b52db5b534e12ec3", bundleId: "", oauthId: "a1B2c3D4e5F6g7H8", version: "9.5.5" },
    methods: { list: "MvList/featured", tabList: "api/tab/listv1", search: "MvSearch/video" },
    imgHost: "",
    videoHosts: [],
    hasCats: true,
    defaultTabId: 1
  }
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
// ---------- AES（AES-128 与 AES-256，CBC + CFB-128）----------
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

function keyBytesOf(keyStr) { return utf8Encode(keyStr); }
function ivBytesOf(ivStr) {
  var b = utf8Encode(ivStr);
  if (b.length > 16) b = b.slice(0, 16);
  while (b.length < 16) b.push(0);
  return b;
}

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

// 递归解包：dh50/ttt 解密结果是「JSON 字符串字面量」可能套多层（含引号包裹）
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
  var plain = buildIdentity(site, ts);
  for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) plain[k] = params[k];

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
    var m = String(method).replace(/^\/+/, "").replace(/^api\//, "");
    var url;
    if (/\/(pwa|api)\.php\/api$/i.test(b)) url = b + "/" + m;
    else if (/\/(pwa|api)\.php$/i.test(b)) url = b + "/api/" + m;
    else url = b + "/api.php/api/" + m;
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

// 递归取列表数组（容忍 data/list 多重包装 + 字符串）
function arrayOf(j) {
  if (Array.isArray(j)) return j;
  if (j && typeof j === "object") {
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
// 从列表项/详情里挖播放直链（dh50/ttt 是 source_240/480/720/1080；gdcm 是 preview_url 相对路径）
function pickPlay(node) {
  var direct = pick(node.source_1080, node.source_720, node.source_480, node.source_240, node.preview_url, node.play_url, node.playUrl, node.m3u8, node.video_url, node.url, node.preview_video);
  if (direct) return String(direct);
  var vs = node.video_sources;
  if (vs && typeof vs === "object") {
    var u = pick(vs.url_265, vs.url_264);
    if (u) return String(u);
  }
  return "";
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

// 条目：type:'url'（成熟模式），dh50/ttt 列表已带完整直链则直接塞 videoUrl 秒播
function itemOf(it, site) {
  var id = idOf(it);
  var title = titleOf(it);
  if (!title) return null;
  var cover = coverOf(site, it);
  var bits = [site.name];
  var durStr = dsText(it.duration_str) || durationText(it.duration);
  if (durStr) bits.push(durStr);
  if (it.tags && String(it.tags) !== "") bits.push(clean(it.tags));
  if (it.count_play) bits.push("播放 " + it.count_play);

  var item = {
    id: "gs-" + site.key + "-" + (id || title),
    type: "url",
    mediaType: "movie",
    title: title,
    link: "gs://" + site.key + "/" + (id || title),
    description: bits.join(" · "),
    posterPath: cover,
    coverUrl: cover,
    posterUrl: cover,
    imageUrl: cover,
    playerType: "app"
  };

  // dh50/ttt：列表项直接带完整播放直链 → 塞 videoUrl，点开秒播
  var play = pickPlay(it);
  if (play && /^https?:\/\//i.test(play)) {
    item.videoUrl = play;
  }
  return item;
}

// ============================================================================
// ---------- Rex 入口 ----------
// ============================================================================
// 通用列表拉取：果冻系走 list 方法；dh50/ttt 走 MvList/featured + tabId
async function fetchSiteList(site, tabId, page) {
  if (site.idp === "system") {
    return await pwaCall(site, site.methods.list, { tabId: tabId || site.defaultTabId || 1, page: page, size: 20 });
  }
  return await pwaCall(site, site.methods.list, { page: page, limit: 30, id: 1, sort: "new", _hash: 0 });
}

// 拉取 dh50/ttt 的动态分类树（api/tab/listv1），返回 [{id,name,api}]
async function fetchTabs(site) {
  try {
    var j = await pwaCall(site, site.methods.tabList, {});
    var arr = j;
    if (j && typeof j === "object") {
      if (typeof j.data === "string") { var d = deepJsonParse(j.data); if (d && typeof d === "object") j.data = d; }
      arr = j.data || j;
    }
    if (!Array.isArray(arr)) return [];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var t = arr[i];
      if (!t || typeof t !== "object") continue;
      var id = String(t.id || "");
      var name = clean(t.name || "");
      if (!name || id === "-1") continue; // -1 是固定入口（关注/推荐等），跳过
      out.push({ id: id, name: name, api: t.api || "" });
    }
    return out;
  } catch (e) {
    return [];
  }
}

// 果冻传媒：无分类树，直接最新列表
async function gdcmList(params) {
  params = params || {};
  var page = Math.max(1, parseInt(params.page, 10) || 1);
  var site = siteByKey("gdcm");
  if (!site) return [];
  try {
    var j = await fetchSiteList(site, 1, page);
    var arr = arrayOf(j);
    var out = [];
    for (var k = 0; k < arr.length; k++) {
      var it = itemOf(arr[k], site);
      if (it) out.push(it);
    }
    return out;
  } catch (e) {
    return [];
  }
}

// 50度灰 / 汤头条：先返回分类列表（子条目），点分类再拉该分类片单
async function dh50List(params) { return tabSiteList("dh50", params); }
async function tttList(params) { return tabSiteList("ttt", params); }

async function tabSiteList(key, params) {
  params = params || {};
  var site = siteByKey(key);
  if (!site) return [];

  // 若带 tabId 参数（点进某个分类后），直接返回该分类片单
  if (params.tabId) {
    try {
      var j = await fetchSiteList(site, Number(params.tabId), 1);
      var arr = arrayOf(j);
      var out = [];
      for (var k = 0; k < arr.length; k++) {
        var it = itemOf(arr[k], site);
        if (it) out.push(it);
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  // 否则返回分类列表：每个分类一个 type:'url' 条目
  var tabs = await fetchTabs(site);
  if (!tabs.length) {
    // 分类树拉不到，退回默认 tab 的最新列表
    return tabSiteList(key, { tabId: site.defaultTabId || 1 });
  }
  var out = [];
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    out.push({
      id: "gs-tab-" + key + "-" + t.id,
      type: "url",
      title: t.name,
      description: site.name + " 分类",
      mediaType: "tv",
      genreTitle: site.name,
      link: "gs://" + key + "/tab/" + t.id
    });
  }
  return out;
}

// 搜索：果冻系 mv/search，dh50/ttt MvSearch/video
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
      if (site.idp === "system") {
        j = await pwaCall(site, site.methods.search, { word: keyword, page: page, size: 20 });
      } else {
        j = await pwaCall(site, site.methods.search, { page: page, limit: 36, type: 2, word: keyword });
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

// 播放解析：点开条目后 Rex 调本函数（stream）。
//   dh50/ttt：列表项已带 source_240 完整直链，若 params 里能拿到 videoUrl 直接用；
//   否则调详情接口挖直链。gdcm：调 mv/getDetail 挖 preview_url（相对路径拼 videoHosts）。
async function loadResource(params) {
  params = params || {};
  var raw = params.link || params.url || params.id || "";

  // 分类条目（gs://key/tab/xxx）不解析播放
  if (/^gs:\/\/[^\/]+\/tab\//.test(String(raw))) return [];

  var s = String(raw);
  var m = s.match(/^gs:\/\/([^\/]+)\/(.+)$/) || s.match(/^gs-([^-]+)-(.+)$/);
  if (!m) return [];
  var site = siteByKey(m[1]);
  if (!site) return [];
  var vid = decodeURIComponent(m[2]);

  // 1) 若列表项已带完整直链（dh50/ttt），params 可能直接给了 videoUrl
  if (params.videoUrl && /^https?:\/\//i.test(String(params.videoUrl))) {
    return [{
      name: "直链 · " + site.name,
      description: site.name + " 加密站直连（本地解密）",
      url: String(params.videoUrl),
      playerType: "app"
    }];
  }

  try {
    var j;
    if (site.idp === "system") {
      // dh50/ttt 详情接口返回 502「Action not found」——它们列表已带完整直链，
      // 正常情况下 loadResource 不会走到这（item 已带 videoUrl）
      return [];
    }
    j = await pwaCall(site, site.methods.detail, { id: Number(vid) || vid });

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
      // 相对路径 → 拼视频域名池
      var hosts = site.videoHosts || [];
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
