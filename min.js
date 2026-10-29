// 最小可复现模块 v1.0.0 —— 完全照抄 douban（唯一第三方实测能显示）的结构
// 目的：把变量降到最低，只留 1 个入口 + 2 个硬编码条目，看能不能显示海报。
//   - 全局赋值函数（douban 产物同款：loadDefaultCatalog = ...）
//   - module 带 page 参数（douban / 官方 rex-tmdb 每个入口都有）
//   - 字符串 id/rating（zod z.string() 校验要求）
//   - type:"tmdb" + 相对路径 posterPath
// 如果这个都不显示，说明问题在 Rex 渲染层/资源库绑定，不在代码。

WidgetMetadata = {
  id: "app.mi3s.min",
  title: "最小测试",
  description: "最小可复现：1 个入口 + 2 个硬编码条目",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "minList",
      title: "最小列表",
      functionName: "minList",
      params: [{ name: "page", title: "页码", type: "page", value: "1" }]
    }
  ]
};

minList = async function (params) {
  return [
    {
      id: "550",
      type: "tmdb",
      title: "搏击俱乐部",
      mediaType: "movie",
      posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      releaseDate: "1999-10-15",
      rating: "8.4"
    },
    {
      id: "238",
      type: "tmdb",
      title: "教父",
      mediaType: "movie",
      posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      backdropPath: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      releaseDate: "1972-03-24",
      rating: "8.7"
    }
  ];
};
