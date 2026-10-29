WidgetMetadata = {
  "id": "app.mi3s.homes3",
  "title": "对照2·app前缀",
  "version": "1.0.0",
  "requiredVersion": "0.0.1",
  "description": "对照实验：内容完全相同，只有 widget id 不同。",
  "author": "mi3s",
  "site": "https://github.com/mi3suuu/rex-hires",
  "modules": [
    {
      "id": "staticTest",
      "title": "静态样片",
      "functionName": "staticTest",
      "description": "4 部写死的电影，形状与成品模块逐字段一致。",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page"
        },
        {
          "name": "language",
          "title": "语言",
          "type": "language",
          "value": "zh-CN"
        }
      ]
    },
    {
      "id": "aiTest",
      "title": "AI 发现",
      "functionName": "aiTest",
      "description": "调官方 AI 搜索接口，原样透传。",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "keyword",
          "title": "描述你想看的内容",
          "type": "input",
          "value": "随便推荐一点",
          "description": "用自然语言描述，AI 帮你找片",
          "placeholders": [
            { "title": "随便推荐一点", "value": "随便推荐一点" },
            { "title": "去年高分科幻片", "value": "去年高分科幻片" }
          ]
        },
        {
          "name": "language",
          "title": "语言",
          "type": "language",
          "value": "zh-CN"
        },
        {
          "name": "userId",
          "title": "用户 ID",
          "type": "userId"
        }
      ]
    }
  ]
};

var API_BASE = "https://api.rexnow.tv/api/discovery/ai-search";

var FIXED = [
  { id: 550, title: "搏击俱乐部", date: "1999-10-15", vote: 8.438, poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", back: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg" },
  { id: 238, title: "教父", date: "1972-03-24", vote: 8.709, poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", back: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg" },
  { id: 278, title: "肖申克的救赎", date: "1994-09-23", vote: 8.712, poster: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", back: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg" },
  { id: 129, title: "千与千寻", date: "2001-07-20", vote: 8.538, poster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", back: "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg" }
];

async function staticTest(params) {
  var out = [];
  for (var i = 0; i < FIXED.length; i++) {
    var m = FIXED[i];
    out.push({
      id: m.id,
      type: "tmdb",
      mediaType: "movie",
      title: m.title,
      description: m.title + "（对照条目）",
      posterPath: m.poster,
      backdropPath: m.back,
      releaseDate: m.date,
      rating: m.vote
    });
  }
  console.log("[对照:app.mi3s.homes3] 静态返回 " + out.length + " 条");
  return out;
}

async function aiTest(params) {
  params = params || {};
  var keyword = (params.keyword || params.query || "").trim();
  if (!keyword) keyword = "随便推荐一点";
  try {
    var response = await Widget.http.post(
      API_BASE + "/search",
      { query: keyword, userId: params.userId || "", language: params.language || "zh-CN" },
      { headers: { "Content-Type": "application/json" } }
    );
    var data = response.data;
    if (!data || !data.success) throw new Error((data && data.message) || "搜索失败");
    var items = data.data || [];
    try {
      if (items[0]) console.log("[对照:app.mi3s.homes3] AI 首条字段 = " + JSON.stringify(Object.keys(items[0])) + " ; " + JSON.stringify(items[0]).slice(0, 500));
    } catch (e1) { console.error("[对照] 日志异常 " + e1); }
    return items;
  } catch (error) {
    console.error("[对照:app.mi3s.homes3] AI 请求失败: " + (error && error.message ? error.message : error));
    throw error;
  }
}
