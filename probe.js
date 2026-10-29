// 探针模块：验证 Rex 运行时 Widget.http 的能力边界
// 1) 二进制响应（可可 API 的 AES 密文）能否拿到原始字节
// 2) 大 HTML 页面（红果官网 SSR）能否拿到
// 3) 响应 headers 是否可见（需要 encrypted 标记）
WidgetMetadata = {
  id: "rex.mi3s.probe",
  title: "运行时探针",
  description: "验证 Widget.http 的二进制/HTML/headers 能力",
  author: "mi3s",
  site: "https://github.com/mi3su",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "runProbe",
      title: "运行探针",
      functionName: "runProbe",
      description: "跑一遍能力探测并返回结果",
      type: "video",
      cacheDuration: 0,
      requiresWebView: false,
      params: [],
    },
  ],
};

function desc(v) {
  var out = {};
  out.type = typeof v;
  if (v === null) { out.isNull = true; return out; }
  if (typeof v === "string") {
    out.len = v.length;
    var codes = [];
    for (var i = 0; i < Math.min(16, v.length); i++) codes.push(v.charCodeAt(i));
    out.firstCodes = codes;
    out.head = v.slice(0, 60);
  } else if (typeof v === "object") {
    try { out.keys = Object.keys(v).slice(0, 20); } catch (e) { out.keys = ["<err>"]; }
  }
  return out;
}

async function runProbe() {
  var items = [];

  function push(title, detail) {
    items.push({
      id: "probe-" + items.length,
      type: "text",
      title: title,
      description: String(detail).slice(0, 400),
    });
  }

  // 1) 可可 API（AES 密文，二进制）
  try {
    var ts = String(Date.now());
    var r1 = await Widget.http.get(
      "https://vcache.mjrlin.cn/v5/config/appInit.capi?appId=kkdy",
      {
        headers: {
          "X-CDN": "1",
          ts: ts,
          appId: "kkdy",
          os: "android",
          appVersion: "3.5.0.30500",
          package: "com.kkdyC1V261021.T120540",
          deviceId: "c798f425518bf312717d67dabff95aea",
          deviceCreatedAt: "1758000000000",
          userLevel: "0",
          st: "2",
          userChannel: "official",
          "User-Agent": "okhttp/4.12.0",
        },
        timeout: 12000,
      }
    );
    push("可可 appInit 响应对象", JSON.stringify(desc(r1)));
    var body1 = r1 && r1.data !== undefined ? r1.data : r1;
    push("可可 body", JSON.stringify(desc(body1)));
    if (r1 && r1.headers) push("可可 headers", JSON.stringify(desc(r1.headers)));
  } catch (e) {
    push("可可 appInit 失败", e && e.message ? e.message : e);
  }

  // 2) 红果官网分类页（HTML）
  try {
    var r2 = await Widget.http.get("https://hongguoduanju.com/category/real-drama", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
      timeout: 15000,
    });
    var body2 = r2 && r2.data !== undefined ? r2.data : r2;
    var s2 = typeof body2 === "string" ? body2 : JSON.stringify(body2);
    push("红果 category 长度", s2.length);
    push("红果 含 recommendList", s2.indexOf('"recommendList"') >= 0 ? "YES" : "NO");
    var m = s2.match(/"total":(\d+)/);
    push("红果 total", m ? m[1] : "(none)");
  } catch (e) {
    push("红果 category 失败", e && e.message ? e.message : e);
  }

  // 3) 红果 mp4 直链（二进制视频，只看能否请求成功）
  try {
    var r3 = await Widget.http.get(
      "https://hongguoduanju.com/video/public/7694655440692448281/360p.mp4",
      { headers: { "User-Agent": "Mozilla/5.0", Range: "bytes=0-255" }, timeout: 12000 }
    );
    var body3 = r3 && r3.data !== undefined ? r3.data : r3;
    push("红果 mp4 响应", JSON.stringify(desc(r3)));
    push("红果 mp4 body", JSON.stringify(desc(body3)));
  } catch (e) {
    push("红果 mp4 失败", e && e.message ? e.message : e);
  }

  // 4) 一个普通 CMS JSON 接口做对照
  try {
    var r4 = await Widget.http.get(
      "https://api.xinlangapi.com/xinlangapi.php/provide/vod?ac=detail&wd=" + encodeURIComponent("流浪地球"),
      { headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" }, timeout: 12000 }
    );
    var body4 = r4 && r4.data !== undefined ? r4.data : r4;
    var j4 = typeof body4 === "string" ? JSON.parse(body4) : body4;
    push("新浪资源 list", (j4 && j4.list ? j4.list.length : 0) + " 条 | " + (j4 && j4.list && j4.list[0] ? j4.list[0].vod_name : ""));
  } catch (e) {
    push("新浪资源 失败", e && e.message ? e.message : e);
  }

  return items;
}
