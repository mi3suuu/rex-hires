WidgetMetadata = {
  id: "rex.mi3s.kkq36",
  title: "kkq36",
  description: "可可影视 App 私有接口直连：10 个分类全保留，播放直链实时解析",
  author: "mi3s",
  site: "https://github.com/mi3suuu/rex-hires",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  modules: [
    { id: "kk-home", title: "可可 · 推荐", functionName: "kkHome", description: "可可影视「推荐」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-netflix", title: "可可 · Netflix", functionName: "kkNetflix", description: "可可影视「Netflix」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-duanju", title: "可可 · 短剧", functionName: "kkDuanju", description: "可可影视「短剧」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "擦边", "value": "擦边"}, {"title": "王爷太子", "value": "王爷太子"}, {"title": "霸道总裁", "value": "霸道总裁"}, {"title": "屌丝逆袭", "value": "屌丝逆袭"}, {"title": "赘婿系列", "value": "赘婿系列"}, {"title": "重生系列", "value": "重生系列"}, {"title": "穿越系列", "value": "穿越系列"}, {"title": "美女总裁", "value": "美女总裁"}, {"title": "娇妻系列", "value": "娇妻系列"}, {"title": "龙王系列", "value": "龙王系列"}, {"title": "都市言情", "value": "都市言情"}, {"title": "爱情", "value": "爱情"}, {"title": "剧情", "value": "剧情"}, {"title": "都市", "value": "都市"}, {"title": "逆袭", "value": "逆袭"}, {"title": "甜宠", "value": "甜宠"}, {"title": "虐恋", "value": "虐恋"}, {"title": "穿越", "value": "穿越"}, {"title": "重生", "value": "重生"}, {"title": "科幻", "value": "科幻"}, {"title": "武侠", "value": "武侠"}, {"title": "古装", "value": "古装"}, {"title": "动作", "value": "动作"}, {"title": "战争", "value": "战争"}, {"title": "冒险", "value": "冒险"}, {"title": "其它", "value": "其它"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-movie", title: "可可 · 电影", functionName: "kkMovie", description: "可可影视「电影」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "Netflix", "value": "NETFLIX"}, {"title": "剧情", "value": "剧情"}, {"title": "喜剧", "value": "喜剧"}, {"title": "动作", "value": "动作"}, {"title": "爱情", "value": "爱情"}, {"title": "恐怖", "value": "恐怖"}, {"title": "惊悚", "value": "惊悚"}, {"title": "犯罪", "value": "犯罪"}, {"title": "科幻", "value": "科幻"}, {"title": "悬疑", "value": "悬疑"}, {"title": "奇幻", "value": "奇幻"}, {"title": "冒险", "value": "冒险"}, {"title": "战争", "value": "战争"}, {"title": "历史", "value": "历史"}, {"title": "古装", "value": "古装"}, {"title": "家庭", "value": "家庭"}, {"title": "传记", "value": "传记"}, {"title": "武侠", "value": "武侠"}, {"title": "歌舞", "value": "歌舞"}, {"title": "短片", "value": "短片"}, {"title": "动画", "value": "动画"}, {"title": "儿童", "value": "儿童"}, {"title": "职场", "value": "职场"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "台湾", "value": "中国台湾"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "韩国", "value": "韩国"}, {"title": "英国", "value": "英国"}, {"title": "法国", "value": "法国"}, {"title": "德国", "value": "德国"}, {"title": "印度", "value": "印度"}, {"title": "泰国", "value": "泰国"}, {"title": "丹麦", "value": "丹麦"}, {"title": "瑞典", "value": "瑞典"}, {"title": "巴西", "value": "巴西"}, {"title": "加拿大", "value": "加拿大"}, {"title": "俄罗斯", "value": "俄罗斯"}, {"title": "意大利", "value": "意大利"}, {"title": "比利时", "value": "比利时"}, {"title": "爱尔兰", "value": "爱尔兰"}, {"title": "西班牙", "value": "西班牙"}, {"title": "澳大利亚", "value": "澳大利亚"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-cinema", title: "可可 · 院线上新", functionName: "kkCinema", description: "可可影视「院线上新」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "Netflix", "value": "NETFLIX"}, {"title": "剧情", "value": "剧情"}, {"title": "喜剧", "value": "喜剧"}, {"title": "动作", "value": "动作"}, {"title": "爱情", "value": "爱情"}, {"title": "恐怖", "value": "恐怖"}, {"title": "惊悚", "value": "惊悚"}, {"title": "犯罪", "value": "犯罪"}, {"title": "科幻", "value": "科幻"}, {"title": "悬疑", "value": "悬疑"}, {"title": "奇幻", "value": "奇幻"}, {"title": "冒险", "value": "冒险"}, {"title": "战争", "value": "战争"}, {"title": "历史", "value": "历史"}, {"title": "古装", "value": "古装"}, {"title": "家庭", "value": "家庭"}, {"title": "传记", "value": "传记"}, {"title": "武侠", "value": "武侠"}, {"title": "歌舞", "value": "歌舞"}, {"title": "短片", "value": "短片"}, {"title": "动画", "value": "动画"}, {"title": "儿童", "value": "儿童"}, {"title": "职场", "value": "职场"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "台湾", "value": "中国台湾"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "韩国", "value": "韩国"}, {"title": "英国", "value": "英国"}, {"title": "法国", "value": "法国"}, {"title": "德国", "value": "德国"}, {"title": "印度", "value": "印度"}, {"title": "泰国", "value": "泰国"}, {"title": "丹麦", "value": "丹麦"}, {"title": "瑞典", "value": "瑞典"}, {"title": "巴西", "value": "巴西"}, {"title": "加拿大", "value": "加拿大"}, {"title": "俄罗斯", "value": "俄罗斯"}, {"title": "意大利", "value": "意大利"}, {"title": "比利时", "value": "比利时"}, {"title": "爱尔兰", "value": "爱尔兰"}, {"title": "西班牙", "value": "西班牙"}, {"title": "澳大利亚", "value": "澳大利亚"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-tv", title: "可可 · 剧集", functionName: "kkTv", description: "可可影视「剧集」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "Netflix", "value": "Netflix"}, {"title": "剧情", "value": "剧情"}, {"title": "爱情", "value": "爱情"}, {"title": "喜剧", "value": "喜剧"}, {"title": "犯罪", "value": "犯罪"}, {"title": "悬疑", "value": "悬疑"}, {"title": "古装", "value": "古装"}, {"title": "动作", "value": "动作"}, {"title": "家庭", "value": "家庭"}, {"title": "惊悚", "value": "惊悚"}, {"title": "奇幻", "value": "奇幻"}, {"title": "美剧", "value": "美剧"}, {"title": "科幻", "value": "科幻"}, {"title": "历史", "value": "历史"}, {"title": "战争", "value": "战争"}, {"title": "韩剧", "value": "韩剧"}, {"title": "武侠", "value": "武侠"}, {"title": "言情", "value": "言情"}, {"title": "恐怖", "value": "恐怖"}, {"title": "冒险", "value": "冒险"}, {"title": "都市", "value": "都市"}, {"title": "职场", "value": "职场"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "韩国", "value": "韩国"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "法国", "value": "法国"}, {"title": "英国", "value": "英国"}, {"title": "德国", "value": "德国"}, {"title": "台湾", "value": "中国台湾"}, {"title": "泰国", "value": "泰国"}, {"title": "印度", "value": "印度"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-kr", title: "可可 · 韩剧", functionName: "kkKr", description: "可可影视「韩剧」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "Netflix", "value": "Netflix"}, {"title": "剧情", "value": "剧情"}, {"title": "爱情", "value": "爱情"}, {"title": "喜剧", "value": "喜剧"}, {"title": "犯罪", "value": "犯罪"}, {"title": "悬疑", "value": "悬疑"}, {"title": "古装", "value": "古装"}, {"title": "动作", "value": "动作"}, {"title": "家庭", "value": "家庭"}, {"title": "惊悚", "value": "惊悚"}, {"title": "奇幻", "value": "奇幻"}, {"title": "美剧", "value": "美剧"}, {"title": "科幻", "value": "科幻"}, {"title": "历史", "value": "历史"}, {"title": "战争", "value": "战争"}, {"title": "韩剧", "value": "韩剧"}, {"title": "武侠", "value": "武侠"}, {"title": "言情", "value": "言情"}, {"title": "恐怖", "value": "恐怖"}, {"title": "冒险", "value": "冒险"}, {"title": "都市", "value": "都市"}, {"title": "职场", "value": "职场"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "韩国", "value": "韩国"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "法国", "value": "法国"}, {"title": "英国", "value": "英国"}, {"title": "德国", "value": "德国"}, {"title": "台湾", "value": "中国台湾"}, {"title": "泰国", "value": "泰国"}, {"title": "印度", "value": "印度"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-anime", title: "可可 · 动漫", functionName: "kkAnime", description: "可可影视「动漫」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "Netflix", "value": "Netflix"}, {"title": "动态漫画", "value": "动态漫画"}, {"title": "剧情", "value": "剧情"}, {"title": "动画", "value": "动画"}, {"title": "喜剧", "value": "喜剧"}, {"title": "冒险", "value": "冒险"}, {"title": "动作", "value": "动作"}, {"title": "奇幻", "value": "奇幻"}, {"title": "科幻", "value": "科幻"}, {"title": "儿童", "value": "儿童"}, {"title": "搞笑", "value": "搞笑"}, {"title": "爱情", "value": "爱情"}, {"title": "家庭", "value": "家庭"}, {"title": "短片", "value": "短片"}, {"title": "热血", "value": "热血"}, {"title": "益智", "value": "益智"}, {"title": "悬疑", "value": "悬疑"}, {"title": "经典", "value": "经典"}, {"title": "校园", "value": "校园"}, {"title": "Anime", "value": "Anime"}, {"title": "运动", "value": "运动"}, {"title": "亲子", "value": "亲子"}, {"title": "青春", "value": "青春"}, {"title": "恋爱", "value": "恋爱"}, {"title": "武侠", "value": "武侠"}, {"title": "惊悚", "value": "惊悚"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "台湾", "value": "中国台湾"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "韩国", "value": "韩国"}, {"title": "英国", "value": "英国"}, {"title": "法国", "value": "法国"}, {"title": "德国", "value": "德国"}, {"title": "印度", "value": "印度"}, {"title": "泰国", "value": "泰国"}, {"title": "丹麦", "value": "丹麦"}, {"title": "瑞典", "value": "瑞典"}, {"title": "巴西", "value": "巴西"}, {"title": "加拿大", "value": "加拿大"}, {"title": "俄罗斯", "value": "俄罗斯"}, {"title": "意大利", "value": "意大利"}, {"title": "比利时", "value": "比利时"}, {"title": "爱尔兰", "value": "爱尔兰"}, {"title": "西班牙", "value": "西班牙"}, {"title": "澳大利亚", "value": "澳大利亚"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-variety", title: "可可 · 综艺纪录", functionName: "kkVariety", description: "可可影视「综艺纪录」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "纪录", "value": "纪录"}, {"title": "真人秀", "value": "真人秀"}, {"title": "记录", "value": "记录"}, {"title": "脱口秀", "value": "脱口秀"}, {"title": "剧情", "value": "剧情"}, {"title": "历史", "value": "历史"}, {"title": "喜剧", "value": "喜剧"}, {"title": "传记", "value": "传记"}, {"title": "相声", "value": "相声"}, {"title": "节目", "value": "节目"}, {"title": "歌舞", "value": "歌舞"}, {"title": "冒险", "value": "冒险"}, {"title": "运动", "value": "运动"}, {"title": "Season", "value": "Season"}, {"title": "犯罪", "value": "犯罪"}, {"title": "短片", "value": "短片"}, {"title": "搞笑", "value": "搞笑"}, {"title": "晚会", "value": "晚会"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "台湾", "value": "中国台湾"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "韩国", "value": "韩国"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
    { id: "kk-adult", title: "可可 · 伦理", functionName: "kkAdult", description: "可可影视「伦理」分类，直连官方接口并在列表阶段解析播放直链", cacheDuration: 1800, requiresWebView: false, params: [{"name": "sort", "title": "排序", "type": "enumeration", "value": "1", "enumOptions": [{"title": "综合", "value": "1"}, {"title": "最新", "value": "2"}, {"title": "最热", "value": "3"}, {"title": "评分", "value": "4"}]}, {"name": "category", "title": "类型", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "伦理", "value": "伦理"}, {"title": "福利", "value": "福利"}, {"title": "倫理", "value": "倫理"}, {"title": "剧情", "value": "剧情"}, {"title": "情色", "value": "情色"}, {"title": "爱情", "value": "爱情"}, {"title": "喜剧", "value": "喜剧"}, {"title": "惊悚", "value": "惊悚"}, {"title": "写真", "value": "写真"}, {"title": "美女", "value": "美女"}, {"title": "恐怖", "value": "恐怖"}, {"title": "犯罪", "value": "犯罪"}, {"title": "悬疑", "value": "悬疑"}, {"title": "动作", "value": "动作"}, {"title": "同性", "value": "同性"}, {"title": "奇幻", "value": "奇幻"}, {"title": "古装", "value": "古装"}, {"title": "青春", "value": "青春"}, {"title": "科幻", "value": "科幻"}, {"title": "文艺", "value": "文艺"}]}, {"name": "area", "title": "地区", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "大陆", "value": "中国大陆"}, {"title": "香港", "value": "中国香港"}, {"title": "台湾", "value": "中国台湾"}, {"title": "美国", "value": "美国"}, {"title": "日本", "value": "日本"}, {"title": "韩国", "value": "韩国"}, {"title": "英国", "value": "英国"}, {"title": "法国", "value": "法国"}, {"title": "德国", "value": "德国"}, {"title": "印度", "value": "印度"}, {"title": "泰国", "value": "泰国"}, {"title": "丹麦", "value": "丹麦"}, {"title": "瑞典", "value": "瑞典"}, {"title": "巴西", "value": "巴西"}, {"title": "加拿大", "value": "加拿大"}, {"title": "俄罗斯", "value": "俄罗斯"}, {"title": "意大利", "value": "意大利"}, {"title": "比利时", "value": "比利时"}, {"title": "爱尔兰", "value": "爱尔兰"}, {"title": "西班牙", "value": "西班牙"}, {"title": "澳大利亚", "value": "澳大利亚"}, {"title": "其它", "value": "其它"}]}, {"name": "year", "title": "年份", "type": "enumeration", "value": "", "enumOptions": [{"title": "全部", "value": ""}, {"title": "2026", "value": "2026"}, {"title": "2025", "value": "2025"}, {"title": "2024", "value": "2024"}, {"title": "2023", "value": "2023"}, {"title": "2022", "value": "2022"}, {"title": "2021", "value": "2021"}, {"title": "2020", "value": "2020"}, {"title": "10年代", "value": "2010-2019"}, {"title": "00年代", "value": "2000-2009"}, {"title": "90年代", "value": "1990-1999"}, {"title": "80年代", "value": "1980-1989"}, {"title": "更早", "value": "0-1979"}]}, {"name": "page", "title": "页码", "type": "page", "value": "1"}] },
  ],
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
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
// pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad-pad
