WidgetMetadata = {
  "id": "app.mi3s.nl",
  "title": "高清片源聚合·AI",
  "version": "1.0.0",
  "requiredVersion": "0.0.1",
  "description": "逐字复刻官方「AI 搜索」模块：同一接口、同一参数、原样透传不重建对象。",
  "author": "mi3s",
  "site": "https://github.com/mi3suuu/rex-hires",
  "modules": [
    {
      "id": "aiDiscover",
      "title": "AI 发现",
      "functionName": "mi3sAiDiscover",
      "cacheDuration": 3600,
      "params": [
        {
          "name": "keyword",
          "title": "描述你想看的内容",
          "type": "input",
          "value": "随便推荐一点",
          "description": "用自然语言描述，AI 帮你找片",
          "placeholders": [
            { "title": "随便推荐一点", "value": "随便推荐一点" },
            { "title": "去年高分科幻片", "value": "去年高分科幻片" },
            { "title": "诺兰的电影", "value": "诺兰的电影" },
            { "title": "类似盗梦空间", "value": "类似盗梦空间" }
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
    },
    {
      "id": "rec",
      "title": "随便推荐",
      "functionName": "mi3sRecommend",
      "cacheDuration": 3600,
      "params": [
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

async function aiCall(keyword, params) {
  var language = (params && params.language) || "zh-CN";
  var userId = (params && params.userId) || "";
  try {
    var response = await Widget.http.post(
      API_BASE + "/search",
      { query: keyword, userId: userId, language: language },
      { headers: { "Content-Type": "application/json" } }
    );
    var data = response.data;
    if (!data || !data.success) {
      throw new Error((data && data.message) || "搜索失败");
    }
    var items = data.data || [];
    try {
      var first = items[0];
      console.log("[AI聚合] " + keyword + " 返回 " + items.length + " 条");
      if (first) console.log("[AI聚合] 首条原始字段 = " + JSON.stringify(Object.keys(first)) + " ; 首条 = " + JSON.stringify(first).slice(0, 600));
    } catch (e0) { console.error("[AI聚合] 日志失败 " + e0); }
    return items;
  } catch (error) {
    console.error("[AI聚合] 请求失败: " + (error && error.message ? error.message : error));
    throw new Error("AI 搜索服务暂时不可用，请稍后再试");
  }
}

async function mi3sAiDiscover(params) {
  params = params || {};
  var keyword = (params.keyword || params.query || "").trim();
  if (!keyword) throw new Error("请输入搜索描述");
  return aiCall(keyword, params);
}

async function mi3sRecommend(params) {
  params = params || {};
  return aiCall("随便推荐一点", params);
}
