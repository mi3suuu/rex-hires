WidgetMetadata = {
  "id": "rex.mi3s.kkm2",
  "title": "kkm2-1module",
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
