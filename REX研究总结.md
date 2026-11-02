# Rex 播放器模块研究总结（rex-hires）

> 本文件是 rex-hires 项目全部研究结论的浓缩归档，来源：`2026-10-25-04-06-58` 会话的长期记忆（MEMORY.md）与 2026-10-28/29/30 工作日志。
> 代码仓库：`github.com/mi3suuu/rex-hires`。Rex App bundle id：`tv.rexnow.app`。

---

## 一、真·根因（video 列表空白问题）

**Rex 只给 widget id 以 `rex.` 开头的模块构建 video 显示模型。**

id 用 `app.` 前缀的模块：脚本能加载、元数据能解析（`type:"video"` 会被自动补）、调试面板「Test / Debug this function」能成功返回 N 条并打印字段，但「预览」和「资源库」永远空白 / 显示「没有更多了」，因为显示模型那层根本不生成条目。

实测四组，只有 widget id 不同、其余逐字相同：
- `t1.js` id=`rex.mi3s.homes` → 正常出海报 ✅
- `mirror.js` id=`rex.tmdb.mi3smirror` → 正常出海报 ✅
- `t3.js` id=`app.mi3s.t3` → 预览 "No more items" ❌
- `t4.js` = t3 仅把 id 改成 `rex.mi3s.t3` → 立刻正常出海报 ✅
- 官方 4 个（`rex.tmdb`/`rex.bangumi`/`rex.nlsearch`/`rex.danmu`）全是 `rex.` ✅

→ **所有新建模块 id 一律 `rex.` 前缀。** `home.js` v10.0.0 已改 `rex.mi3s.homes`。⚠️ 改 id 等于新模块，旧的 `app.mi3s.homes` 需用户手动删除。

### 顺带查清的非根因（不要再往这些方向查）
- 数据源无责：AI 后端 `ai-search/search` 各 query 海报覆盖 19~20/20；TMDB `Widget.tmdb.get` 全有海报。
- 条目字段形态无责：`{id,type:"tmdb",mediaType,title,description,posterPath,backdropPath,releaseDate,rating}` 与 mirror.js/zurlyqin 的 `videoItem()` 完全一致。
- 元数据无责：`app.` 与 `rex.` 的 managed/*.metadata.json 结构完全一致，`type:"video"` 都会被自动补。
- `requiresWebView` / `cacheDuration` / `search` 块 / `iconurl` 全都不是变量。

---

## 二、真·根因（点进去一直 loading）

**源直链 CDN 域名 TLS 握手卡死（非代码 bug）。**

盗版 CMS 源返回的直链域名（`voddadaizi5.com:52866` / `senlin2026.com` / `lajiao2026.com` 等「非标端口 + 泛域名」CDN）在真机模拟器网络下 TLS 握手卡死。

逐层取证（点「大奶子资源」片福利姬奈.汐酱）：
- 条目是 `baseItem` 降级形态（`videoUrl=None`，`type:"url"`，`link=...ac=detail&ids=153728`）。
- 点开走 loadResource → queryByVodId(大奶子, 153728) → 直链 `https://voddadaizi5.com:52866/videos/202610/29/.../index.m3u8`。
- **该直链 TLS 握手卡死 12s 超时**：DNS 可解析(23.140.204.25)、TCP 52866/443 都通、但 `curl -w` 测 TLS 返回 HTTP 000 + time_connect=0。第二次 curl 却能返回 `#EXTM3U` 头（连接复用假象）。

三重对照实验：
| 测试对象 | 直链域名 | 端口 | TLS | 真机结果 |
|---------|---------|------|-----|---------|
| Apple 官方测试片 | `devstreaming-cdn.apple.com` | 443 | 正常 | ✅ 正常播放（0→33s） |
| CK 资源直链 | `ckzy3.com` | 443 | 0.76s | ✅ HTTP 200 返回 m3u8 |
| 大奶子资源直链 | `voddadaizi5.com` | 52866 非标 | 12s 卡死 | ❌ 一直 loading |
| 森林资源直链 | `2609.senlin2026.com` | 非标/泛域名 | 卡死 | ❌ |

与模块代码、loadResource 逻辑、条目格式（`{name,description,url,customHeaders,playerType}` 与 hires.js 参照片完全一致）都无关。probeUrl 的 3s 超时能识别这类卡死直链，但识别后若跨源聚合也搜不到替代源（番号片独有），播放器拿到空 → 一直 loading，属「源内容覆盖 + CDN 失效」双重问题。

---

## 三、模拟器实测方法（比让用户当测试员快得多）

- 虚拟机名 `Fig`（iOS 27.1 越狱），控制入口 `/Applications/vphone-launchpad.app/Contents/MacOS/vphone-launchpad-cli`。
- `guest unlock Fig --timeout 20` → `apps.launch {"bundle_id":"tv.rexnow.app"}` → `screen.screenshot`（返回 base64 jpeg，屏幕会自动息屏，每次 tap/截图前都先 unlock）。
- 坐标换算：截图 1398×2034 px，`coordinate_scale 3` → 设备点是 **466×678**。
- 导入模块：`apps.open_url {"url":"rex://widget?url=<jsdelivr @<sha>/file.js>"}`。同 id 会弹「File already exists」→ 点 Overwrite file 直接覆盖。
- 导航路径：底部 tab `Discover(60,620) / My(147,620) / Libraries(233,620) / Settings(339,620)`。
- 关键取证目录：`Library/Application Support/ScriptModules/managed/<recordID>.js|.metadata.json`。
- 缓存：`Library/Caches/ScriptShelfResults/<hash>.json`（原始结果）+ `<hash>.display-v1.json`（显示模型）+ `.metadata.json`。显示模型里 `titlesByCard{ "<sourceCardID>": [...] }` 空白就说明条目没进显示模型。
- 无障碍无 shell：没有 `shell.exec`/设备日志；`guest rpc` 可用 `input.tap/swipe/type/key`、`files.list`、`guest pull`。`input.swipe` 不能带 duration 字段；整目录 pull 不支持，要逐文件 pull。
- 截图后至少等 10~18 秒再看海报（Rex 海报异步下载 + 淡入）。
- 沙盒 data_path 反查：`guest rpc Fig apps.list` 找 `tv.rexnow.app` 的 `data_path`（如 `/private/var/mobile/Containers/Data/Application/C7E4BBAC-...`）。

---

## 四、分发铁律

- 仓库：`github.com/mi3suuu/rex-hires`，本地 `/Users/mi3s/WorkBuddy/2026-10-25-04-06-58/rex-hires`，分支 `main`。
- 分发一律走 jsDelivr，订阅地址固定用 `@main`（可变分支）：`https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/<file>.js`。
  - `@main`：push 后调 `purge.jsdelivr.net/gh/mi3suuu/rex-hires@main/<file>`，~15 秒内边缘缓存即更新。
  - `@vX.Y.Z`（tag，不可变）：force-move tag 后 purge 无效（边缘缓存顽固）。
  - → 发新版 = push main + purge @main 各文件。`raw.githubusercontent.com` 国内被墙，务必用 jsDelivr。
- 模块：`rex.mi3s.homes`（video 片单，v10.0.0）、`app.mi3s.hires`（stream 播放源，v3.2.0）、`app.mi3s.diag`（诊断，v8.0.0）、`app.mi3s.k4sources`（4K 聚合 stream）、`homes-package.rex`（发现首页布局）。

---

## 五、最权威参照（胜过 ForwardWidgets 文档）

1. **`ZurlyQin/rex-widgets` 的 TMDB 电影精选模块**：唯一有「实机海报显示正常」确证的第三方 video 模块。用 `Widget.tmdb.get("discover/movie", {params})` + `async function xxx()` 声明 + 数字 id/rating + `type:"tmdb"` + 相对路径 posterPath。
2. **`@rexnow/douban`（Douban Bridge）**：实测能正常显示的第三方 video 模块。npm 包 `https://unpkg.com/@rexnow/douban`。与 ZurlyQin 差异仅在 douban 把 id/rating 字符串化。
3. **`@rexnow/libs`**（官方 SDK，baranwang 维护）：`dist/env.zod/index.ts` 定义 VideoItem / WidgetMetadata 精确 zod schema。`type` 合法值：`"url"|"detail"|"douban"|"imdb"|"tmdb"|"forward"`。
4. **`baranwang/rex-widget-libs`**（官方工具链 monorepo）。

---

## 六、铁律（踩过坑，勿违）

1. **条目格式照抄 ZurlyQin 成品即可：`async function` 声明 + 数字 id/rating + `type:"tmdb"` + 相对路径 posterPath。** 之前「字符串化」「type=url」「必须全局赋值」三个结论全被 ZurlyQin 成品推翻。
2. 取片照抄官方 AI 搜索 `rex.nlsearch`：`Widget.http.post("https://api.rexnow.tv/api/discovery/ai-search/search", {query, userId, language}, {headers:{"Content-Type":"application/json"}})` → 检查 `data.success` → 取 `data.data`。签名：`http.post→{data,statusCode,headers}`；`tmdb.get→直接数据`。
3. 后端返回条目字段：`id` 数字、`rating` 数字、`posterPath`/`backdropPath` 相对路径 `/xxx.jpg`、`type:"tmdb"`、`mediaType:"movie"|"tv"`、`genreTitle` `" / "` 分隔。
4. 验证套路：Node `vm` + mock `Widget.http.post`/`Widget.tmdb.get`，断言入口函数可被 sandbox 读为函数 + 返回条目字段形状正确。改完必须同时验证 CDN 远程文件（curl 回来再跑），避免缓存"改了没生效"。
5. **后端限流**：`api.rexnow.tv/api/discovery/ai-search/search` 连续 ~16 次 POST 后返回 429 → 列表入口必须 `cacheDuration: 3600` 强缓存。
6. 反编译产物：Rex IPA 主二进制 `Rex`（未加密，arm64，符号已 strip）。官方模块明文源码 `RexScript_RexScript.bundle/OfficialModules/`（rex-tmdb.js / bangumi.js / nlsearch.js / danmu.js）。`nlsearch.js` 直接 `return data.data` 原样透传。Widget 环境无 fetch，只有 Widget.http/tmdb/html/storage/sharedCache/i18n/console。

---

## 七、关键取证命令备忘

- TLS 卡死检测：`curl -s -o /dev/null -w "HTTP %{http_code} time %{time_total}s connect %{time_connect}s" <url>`。HTTP 000 + time_connect=0 = TLS 握手卡死（TCP 通但 TLS 层挂）。
- TCP 连通性：`nc -z -w 5 <域名> <端口>`。
- 可用源（直链 TLS 正常）：CK 资源 `ckzy3.com`（标准 443）。
- 坏源（直链 TLS 卡死）：大奶子 `voddadaizi5.com:52866`、森林 `senlin2026.com`、辣椒 `lajiao2026.com` 等。
- ViewImage 返回坐标体系不稳定（时而像素 1398×2034、时而逻辑点 466×678），tap 用逻辑点（466×678）。
