WidgetMetadata = {
  "id": "rex.mi3s.kkm1",
  "title": "kkm1-noparams",
  "description": "可可影视 App 私有接口直连：10 个分类全保留，播放直链实时解析",
  "author": "mi3s",
  "site": "https://github.com/mi3suuu/rex-hires",
  "version": "1.0.1",
  "requiredVersion": "0.0.1",
  "modules": [
    {
      "id": "kk-home",
      "title": "可可 · 推荐",
      "functionName": "kkHome",
      "description": "可可影视「推荐」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-netflix",
      "title": "可可 · Netflix",
      "functionName": "kkNetflix",
      "description": "可可影视「Netflix」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-duanju",
      "title": "可可 · 短剧",
      "functionName": "kkDuanju",
      "description": "可可影视「短剧」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-movie",
      "title": "可可 · 电影",
      "functionName": "kkMovie",
      "description": "可可影视「电影」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-cinema",
      "title": "可可 · 院线上新",
      "functionName": "kkCinema",
      "description": "可可影视「院线上新」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-tv",
      "title": "可可 · 剧集",
      "functionName": "kkTv",
      "description": "可可影视「剧集」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-kr",
      "title": "可可 · 韩剧",
      "functionName": "kkKr",
      "description": "可可影视「韩剧」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-anime",
      "title": "可可 · 动漫",
      "functionName": "kkAnime",
      "description": "可可影视「动漫」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-variety",
      "title": "可可 · 综艺纪录",
      "functionName": "kkVariety",
      "description": "可可影视「综艺纪录」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    },
    {
      "id": "kk-adult",
      "title": "可可 · 伦理",
      "functionName": "kkAdult",
      "description": "可可影视「伦理」分类，直连官方接口并在列表阶段解析播放直链",
      "cacheDuration": 1800,
      "requiresWebView": false,
      "params": [
        {
          "name": "page",
          "title": "页码",
          "type": "page",
          "value": "1"
        }
      ]
    }
  ]
};

async function kkAdult(p) { return []; }
async function kkAnime(p) { return []; }
async function kkCinema(p) { return []; }
async function kkDuanju(p) { return []; }
async function kkHome(p) { return []; }
async function kkKr(p) { return []; }
async function kkMovie(p) { return []; }
async function kkNetflix(p) { return []; }
async function kkTv(p) { return []; }
async function kkVariety(p) { return []; }
