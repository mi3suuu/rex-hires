WidgetMetadata = {
  "id": "rex.mi3s.kkm4",
  "title": "kkm4-3modules",
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
          "name": "sort",
          "title": "排序",
          "type": "enumeration",
          "value": "1",
          "enumOptions": [
            {
              "title": "综合",
              "value": "1"
            },
            {
              "title": "最新",
              "value": "2"
            },
            {
              "title": "最热",
              "value": "3"
            }
          ]
        },
        {
          "name": "category",
          "title": "类型",
          "type": "enumeration",
          "value": "",
          "enumOptions": [
            {
              "title": "全部",
              "value": ""
            },
            {
              "title": "擦边",
              "value": "擦边"
            },
            {
              "title": "王爷太子",
              "value": "王爷太子"
            },
            {
              "title": "霸道总裁",
              "value": "霸道总裁"
            },
            {
              "title": "屌丝逆袭",
              "value": "屌丝逆袭"
            },
            {
              "title": "赘婿系列",
              "value": "赘婿系列"
            },
            {
              "title": "重生系列",
              "value": "重生系列"
            },
            {
              "title": "穿越系列",
              "value": "穿越系列"
            },
            {
              "title": "美女总裁",
              "value": "美女总裁"
            },
            {
              "title": "娇妻系列",
              "value": "娇妻系列"
            },
            {
              "title": "龙王系列",
              "value": "龙王系列"
            },
            {
              "title": "都市言情",
              "value": "都市言情"
            },
            {
              "title": "爱情",
              "value": "爱情"
            },
            {
              "title": "剧情",
              "value": "剧情"
            },
            {
              "title": "都市",
              "value": "都市"
            },
            {
              "title": "逆袭",
              "value": "逆袭"
            },
            {
              "title": "甜宠",
              "value": "甜宠"
            },
            {
              "title": "虐恋",
              "value": "虐恋"
            },
            {
              "title": "穿越",
              "value": "穿越"
            },
            {
              "title": "重生",
              "value": "重生"
            },
            {
              "title": "科幻",
              "value": "科幻"
            },
            {
              "title": "武侠",
              "value": "武侠"
            },
            {
              "title": "古装",
              "value": "古装"
            },
            {
              "title": "动作",
              "value": "动作"
            },
            {
              "title": "战争",
              "value": "战争"
            },
            {
              "title": "冒险",
              "value": "冒险"
            },
            {
              "title": "其它",
              "value": "其它"
            }
          ]
        },
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
