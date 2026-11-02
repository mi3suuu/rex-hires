// ============================================================================
// Rex 播放源模块 · 加密站（gdcm 果冻传媒 + zpc91 91制片厂）
// ----------------------------------------------------------------------------
// 协议：pwa-aes（反汇编自官方 App + relay.py/gs-gateway.ts 实测确认）
//   - 明文 = 7 身份字段（token/via/language/version/oauth_type/bundleId/oauth_id）+ 业务参数
//   - 加密 = AES-128-CBC / PKCS7，key/iv 见下方 SITES[].crypto
//   - 投递 = POST + application/x-www-form-urlencoded
//   - 签名 = md5( hex(sha256("client=pwa&data=<b64>&timestamp=<秒>" + salt)) )
//   - 响应 = {"errcode":0, "data":"<AES密文>"}，用同 key/iv 解密得到 JSON
//
// 接口（各站 method 协议，路径见 SITES[].methods）：
//   - 列表  mv/list_construct  {page, limit:30, id:1, sort:'new', _hash:0}
//   - 搜索  mv/search          {page, limit:36, type:2, word:<关键词>}
//   - 详情  mv/getDetail       {id:<视频id>}  → data.detail 里含 preview_url + cover_horizontal
//
// 播放地址 = data.detail.preview_url（相对路径，如 /videos5/<hash>/<hash>.m3u8?auth_key=..&via_m=gdpj）
//   → 拼视频 CDN 域名池（SITES[].videoHosts）。封面 cover_horizontal（相对路径）→ 拼 SITES[].imgHost。
//
// 环境：只用 Rex 运行时提供的 Widget.http.get / Widget.http.post / Widget.storage。
//   无 fetch / crypto / setTimeout；AES / MD5 / SHA256 / Base64 / UTF-8 全部内联纯 JS。
// ============================================================================

WidgetMetadata = {
  id: "rex.mi3s.gdcm",
  title: "果冻传媒·91制片厂",
  description: "加密站高清直连：果冻传媒(gdcm) + 91制片厂(zpc91)，pwa-aes 协议本地解密，纯无中转",
  author: "mi3s",
  site: "https://github.com/mi3s",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  search: {
    title: "搜索加密站",
    functionName: "searchVideos",
    params: [{ name: "keyword", title: "关键词（片名/番号）", type: "input", value: "" }]
  },
  modules: [
    {
      id: "gdcm-list",
      title: "最新片单",
      description: "果冻传媒 + 91制片厂 最新上架，分页浏览",
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
      id: "gdcm-search",
      title: "搜索",
      description: "按片名/番号搜索两站",
      requiresWebView: false,
      cacheDuration: 60,
      functionName: "searchVideos",
      params: [{ name: "keyword", title: "关键词", type: "input", value: "" }]
    },
    {
      id: "gdcm-resource",
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
// 站点配置（同模板 pwa-aes，参数各异）
// ============================================================================
var SITES = [
  {
    key: "gdcm",
    name: "果冻传媒",
    bases: [
      "https://api2.gdapi2.com/api.php/",
      "https://api3.gdapi1.com/api.php/",
      "https://api1.gdapi1.com/api.php/"
    ],
    crypto: {
      key: "2acf7e91e9864673",
      iv: "1c29882d3ddfcfd6",
      salt: "5589d41f92a597d016b037ac37db243d",
      bundleId: "com.pwa.gdcm",
      oauthId: "fbc236d031e742c65e485f74dd9b3df9",
      version: "3.9.0"
    },
    // 封面图片 CDN（cover_horizontal 相对路径 /upload_01/... 拼此域名）
    imgHost: "https://kfws.xeqyy.com",
    // 视频 CDN 域名池（preview_url 相对路径 /videos5/... 依次尝试拼接）
    // 注：hf-120play.sxwph.com 为历史确证域名（旧番号格式）；/videos5/ 新格式的
    // 精确域名+auth_key 校验仍在逆向中，这里先给出确证域名，播放器按需尝试。
    videoHosts: [
      "https://hf-120play.sxwph.com"
    ]
  },
  {
    key: "zpc91",
    name: "91制片厂",
    bases: [
      "https://api2.piifvly.com/api.php/",
      "https://api2.zpcapiz2.com/api.php/",
      "https://api3.zpcapiz3.com/api.php/"
    ],
    crypto: {
      key: "2acf7e91e9864673",
      iv: "1c29882d3ddfcfd6",
      salt: "5589d41f92a597d016b037ac37db243d",
      bundleId: "com.pwa.zpcpj",
      oauthId: "7a84f1d768a7874f0c325fbbef92ba5c",
      version: "1.7.0"
    },
    imgHost: "https://kfws.xeqyy.com",
    videoHosts: [
      "https://hf-120play.sxwph.com"
    ]
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
// ---------- AES-128 ----------
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
    var w = [];
    w[0] = (key[0] << 24) | (key[1] << 16) | (key[2] << 8) | key[3];
    w[1] = (key[4] << 24) | (key[5] << 16) | (key[6] << 8) | key[7];
    w[2] = (key[8] << 24) | (key[9] << 16) | (key[10] << 8) | key[11];
    w[3] = (key[12] << 24) | (key[13] << 16) | (key[14] << 8) | key[15];
    var rcon = 1;
    for (i = 4; i < 44; i++) {
      var t = w[i - 1];
      if (i % 4 === 0) {
        t = ((t << 8) | (t >>> 24)) >>> 0;
        t = ((SBOX[(t >>> 24) & 255] << 24) | (SBOX[(t >>> 16) & 255] << 16) | (SBOX[(t >>> 8) & 255] << 8) | SBOX[t & 255]) >>> 0;
        t = (t ^ (rcon << 24)) >>> 0;
        rcon = xt(rcon);
      }
      w[i] = (w[i - 4] ^ t) >>> 0;
    }
    return w;
  }
  function encBlock(w, s) {
    var st = [];
    for (var i = 0; i < 4; i++) st[i] = s[i] ^ w[i];
    for (var round = 1; round <= 10; round++) {
      var t = [];
      for (var c = 0; c < 4; c++) {
        t[c] = (SBOX[(st[c] >>> 24) & 255] << 24) | (SBOX[(st[c] >>> 16) & 255] << 16) | (SBOX[(st[c] >>> 8) & 255] << 8) | SBOX[st[c] & 255];
      }
      var sh = [];
      for (var c2 = 0; c2 < 4; c2++) {
        sh[c2] = [(t[c2] >>> 24) & 255, (t[c2] >>> 16) & 255, (t[c2] >>> 8) & 255, t[c2] & 255];
      }
      var rows = [[], [], [], []];
      for (var col = 0; col < 4; col++) for (var row = 0; row < 4; row++) rows[row][col] = sh[col][row];
      for (var row2 = 0; row2 < 4; row2++) {
        var tmp = rows[row2].slice();
        for (var col2 = 0; col2 < 4; col2++) rows[row2][col2] = tmp[(col2 + row2) % 4];
      }
      for (var col3 = 0; col3 < 4; col3++) for (var row3 = 0; row3 < 4; row3++) sh[col3][row3] = rows[row3][col3];
      var mixed = [];
      for (var c3 = 0; c3 < 4; c3++) {
        var a0 = sh[c3][0], a1 = sh[c3][1], a2 = sh[c3][2], a3 = sh[c3][3];
        if (round !== 10) {
          mixed[c3] = ((mul(a0, 2) ^ mul(a1, 3) ^ a2 ^ a3) << 24 | (a0 ^ mul(a1, 2) ^ mul(a2, 3) ^ a3) << 16 | (a0 ^ a1 ^ mul(a2, 2) ^ mul(a3, 3)) << 8 | (mul(a0, 3) ^ a1 ^ a2 ^ mul(a3, 2))) >>> 0;
        } else {
          mixed[c3] = ((a0 << 24) | (a1 << 16) | (a2 << 8) | a3) >>> 0;
        }
      }
      for (var c4 = 0; c4 < 4; c4++) st[c4] = (mixed[c4] ^ w[round * 4 + c4]) >>> 0;
    }
    return st;
  }
  function invShift(st) {
    var cols = [];
    for (var c = 0; c < 4; c++) cols[c] = [(st[c] >>> 24) & 255, (st[c] >>> 16) & 255, (st[c] >>> 8) & 255, st[c] & 255];
    var rows = [[], [], [], []];
    for (var cc = 0; cc < 4; cc++) for (var rr = 0; rr < 4; rr++) rows[rr][cc] = cols[cc][rr];
    for (var r2 = 0; r2 < 4; r2++) { var t2 = rows[r2].slice(); for (var c2 = 0; c2 < 4; c2++) rows[r2][(c2 + r2) % 4] = t2[c2]; }
    for (var c3 = 0; c3 < 4; c3++) for (var r3 = 0; r3 < 4; r3++) cols[c3][r3] = rows[r3][c3];
    var out = [];
    for (var c4 = 0; c4 < 4; c4++) out[c4] = ((cols[c4][0] << 24) | (cols[c4][1] << 16) | (cols[c4][2] << 8) | cols[c4][3]) >>> 0;
    return out;
  }
  function invSub(st) {
    var out = [];
    for (var c = 0; c < 4; c++) out[c] = ((INV[(st[c] >>> 24) & 255] << 24) | (INV[(st[c] >>> 16) & 255] << 16) | (INV[(st[c] >>> 8) & 255] << 8) | INV[st[c] & 255]) >>> 0;
    return out;
  }
  function invMix(st) {
    var out = [];
    for (var c = 0; c < 4; c++) {
      var b0 = (st[c] >>> 24) & 255, b1 = (st[c] >>> 16) & 255, b2 = (st[c] >>> 8) & 255, b3 = st[c] & 255;
      out[c] = ((mul(b0, 14) ^ mul(b1, 11) ^ mul(b2, 13) ^ mul(b3, 9)) << 24 |
                (mul(b0, 9) ^ mul(b1, 14) ^ mul(b2, 11) ^ mul(b3, 13)) << 16 |
                (mul(b0, 13) ^ mul(b1, 9) ^ mul(b2, 14) ^ mul(b3, 11)) << 8 |
                (mul(b0, 11) ^ mul(b1, 13) ^ mul(b2, 9) ^ mul(b3, 14))) >>> 0;
    }
    return out;
  }
  function decBlock(w, s) {
    var st = [];
    for (var i = 0; i < 4; i++) st[i] = s[i] >>> 0;
    for (var round = 10; round >= 1; round--) {
      for (var k = 0; k < 4; k++) st[k] = (st[k] ^ w[round * 4 + k]) >>> 0;
      if (round !== 10) st = invMix(st);
      st = invShift(st);
      st = invSub(st);
    }
    for (var k2 = 0; k2 < 4; k2++) st[k2] = (st[k2] ^ w[k2]) >>> 0;
    return st;
  }
  function cbc(keyBytes, ivBytes, dataBytes, encrypt) {
    var w = expandKey(keyBytes);
    var iv = [];
    for (var i = 0; i < 4; i++) iv[i] = ((ivBytes[i * 4] << 24) | (ivBytes[i * 4 + 1] << 16) | (ivBytes[i * 4 + 2] << 8) | ivBytes[i * 4 + 3]) >>> 0;
    var out = [], prev = iv;
    for (var off = 0; off < dataBytes.length; off += 16) {
      var blk = [];
      for (var j = 0; j < 4; j++) blk[j] = ((dataBytes[off + j * 4] << 24) | (dataBytes[off + j * 4 + 1] << 16) | (dataBytes[off + j * 4 + 2] << 8) | dataBytes[off + j * 4 + 3]) >>> 0;
      var res;
      if (encrypt) res = encBlock(w, [blk[0] ^ prev[0], blk[1] ^ prev[1], blk[2] ^ prev[2], blk[3] ^ prev[3]]);
      else {
        res = decBlock(w, blk);
        res = [(res[0] ^ prev[0]) >>> 0, (res[1] ^ prev[1]) >>> 0, (res[2] ^ prev[2]) >>> 0, (res[3] ^ prev[3]) >>> 0];
      }
      for (var j2 = 0; j2 < 4; j2++) out.push((res[j2] >>> 24) & 255, (res[j2] >>> 16) & 255, (res[j2] >>> 8) & 255, res[j2] & 255);
      if (encrypt) prev = res;
      else prev = blk;
    }
    return out;
  }
  return { cbc: cbc };
})();
function aesEncryptCbcBase64(keyStr, ivStr, plainStr) {
  var data = utf8Encode(plainStr);
  var pad = 16 - (data.length % 16);
  for (var i = 0; i < pad; i++) data.push(pad);
  return base64Encode(AES.cbc(utf8Encode(keyStr), utf8Encode(ivStr), data, true));
}
function aesDecryptCbc(keyStr, ivStr, b64) {
  var bytes = base64Decode(b64);
  if (!bytes.length || bytes.length % 16 !== 0) return "";
  var out = AES.cbc(utf8Encode(keyStr), utf8Encode(ivStr), bytes, false);
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
function encQuery(params) {
  if (!params) return "";
  var parts = [];
  var keys = Object.keys(params);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = params[k];
    if (v === undefined || v === null || v === "") continue;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
  }
  return parts.join("&");
}
function jsonEncode(obj) { return JSON.stringify(obj); }
function jsonDecode(str) {
  if (!str) return null;
  var s = dsText(str);
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}

// ============================================================================
// ---------- pwa-aes 协议核心 ----------
// ============================================================================
function signFor(dataB64, ts, salt) {
  var s = "client=pwa&data=" + dataB64 + "&timestamp=" + ts + salt;
  return md5Hex(sha256Hex(s));
}

// 打一次加密接口，返回解密后的 JSON 对象；失败抛错
async function pwaCall(site, method, params) {
  var c = site.crypto;
  var plain = {
    token: "",
    via: "pwa",
    language: "zh",
    version: c.version || "1.0.0",
    oauth_type: "web",
    bundleId: c.bundleId || "",
    oauth_id: c.oauthId || ""
  };
  for (var k in params) {
    if (Object.prototype.hasOwnProperty.call(params, k)) plain[k] = params[k];
  }
  var ts = String(Math.floor(Date.now() / 1000));
  var dataB64 = aesEncryptCbcBase64(c.key, c.iv, jsonEncode(plain));
  var sign = signFor(dataB64, ts, c.salt || "");
  var form = "client=pwa&data=" + encodeURIComponent(dataB64) + "&timestamp=" + ts + "&sign=" + encodeURIComponent(sign);
  var headers = {
    "User-Agent": DEFAULT_UA,
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  var errors = [];
  for (var i = 0; i < site.bases.length; i++) {
    // buildUrl：base 形如 https://h/api.php/ → https://h/api.php/api/<method>
    var b = site.bases[i].replace(/\/+$/, "");
    var m = method.replace(/^\/+/, "").replace(/^api\//, "");
    var url;
    if (/\/(pwa|api)\.php\/api$/i.test(b)) url = b + "/" + m;
    else if (/\/(pwa|api)\.php$/i.test(b)) url = b + "/api/" + m;
    else url = b + "/api.php/api/" + m;
    try {
      var resp = await Widget.http.post(url, form, { headers: headers, timeout: 15000 });
      var body = resp && resp.data !== undefined ? resp.data : resp;
      var text = typeof body === "string" ? body : JSON.stringify(body);
      var j = jsonDecode(text);
      if (!j) { errors.push(url + ": 非 JSON"); continue; }
      if (typeof j.data === "string" && j.data) {
        var dec = aesDecryptCbc(c.key, c.iv, j.data);
        var obj = jsonDecode(dec);
        if (obj !== null) return obj;
        // 解密成功但非 JSON（可能是纯文本），返回原始解密文本包装
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
    var cands = ["list", "videos", "mvs", "mv_list", "video_list", "items", "data", "content", "records"];
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
function coverOf(site, it) {
  var raw = pick(it.cover_horizontal, it.cover_vertical, it.cover, it.thumb, it.thumbnail, it.poster, it.img_url, it.vod_pic);
  if (!raw) return "";
  var u = String(raw).trim();
  if (/^https?:\/\//i.test(u)) return u;
  return site.imgHost + (u.charAt(0) === "/" ? "" : "/") + u;
}
function titleOf(it) {
  return clean(pick(it.title, it.name, it.vod_name, it.mv_name, it.video_title, ""));
}
function idOf(it) {
  return String(pick(it.id, it.video_id, it.mv_id, it.vod_id, it.aid, ""));
}
function linkOf(siteKey, id) { return "gdcm://" + siteKey + "/" + id; }
function parseLink(raw) {
  var s = String(raw || "");
  var m = s.match(/^gdcm:\/\/([^\/]+)\/(.+)$/);
  if (!m) return null;
  return { site: m[1], id: decodeURIComponent(m[2]) };
}
function siteByKey(key) {
  for (var i = 0; i < SITES.length; i++) if (SITES[i].key === key) return SITES[i];
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
  var dur = durationText(it.duration);
  if (dur) bits.push(dur);
  if (it.actors) bits.push(clean(it.actors));
  if (it.publisher) bits.push(clean(it.publisher));
  if (it.count_play) bits.push("播放 " + it.count_play);
  var item = {
    id: id || title,
    type: "detail",
    mediaType: "movie",
    title: title,
    link: linkOf(site.key, id || title),
    description: bits.join(" · "),
    posterPath: cover,
    coverUrl: cover,
    posterUrl: cover,
    imageUrl: cover
  };
  return item;
}

// ============================================================================
// ---------- Rex 入口 ----------
// ============================================================================
async function loadList(params) {
  params = params || {};
  var page = Math.max(1, parseInt(params.page, 10) || 1);
  var out = [];
  for (var i = 0; i < SITES.length; i++) {
    try {
      var j = await pwaCall(SITES[i], "mv/list_construct", { page: page, limit: 30, id: 1, sort: "new", _hash: 0 });
      var arr = arrayOf(j);
      for (var k = 0; k < arr.length; k++) {
        var it = itemOf(arr[k], SITES[i]);
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
    try {
      var j = await pwaCall(SITES[i], "mv/search", { page: page, limit: 36, type: 2, word: keyword });
      var arr = arrayOf(j);
      for (var k = 0; k < arr.length; k++) {
        var it = itemOf(arr[k], SITES[i]);
        if (it) out.push(it);
      }
    } catch (e) {
      // 单站失败忽略
    }
  }
  return out;
}

// 播放解析：从详情 data.detail 里挖 preview_url，拼视频域名池，返回 VideoResource[]
async function loadResource(params) {
  params = params || {};
  var raw = params.link || params.url || params.id || "";
  var parsed = parseLink(raw);
  if (!parsed) return [];
  var site = siteByKey(parsed.site);
  if (!site) return [];
  try {
    var j = await pwaCall(site, "mv/getDetail", { id: Number(parsed.id) || parsed.id });
    // 详情结构：{data:{banner, play_ad, ad_pops, detail}}，播放字段在 detail 里
    var node = j;
    if (j && j.data && typeof j.data === "object") {
      node = (j.data.detail && typeof j.data.detail === "object") ? j.data.detail : j.data;
    }
    var pu = node.preview_url || node.play_url || node.playUrl || node.m3u8 || node.video_url || node.url || "";
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
      // 相对路径 → 拼视频域名池，逐条给出（播放器按需尝试）
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
