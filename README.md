# Rex 播放源合集（stream 类型）

点进影片即出**真实播放地址**的 Rex 播放源模块。全部是 `stream` 类型（`loadResource` 解析器），
不是首页列表组件（`video` 类型）。

## 模块清单

| 模块 | id | 说明 | raw 地址 |
|------|----|----|---------|
| 高清片源 | `app.mi3s.hires` | 4K/DV 测试片直链 + 苹果CMS聚合搜索 + 直播流 | [hires.js](hires.js) |
| 4KVM 播放源 | `hyj1817.4kvm.resource` | 4KVM 影视 HLS 播放源（开源） | [4kvm-resource.js](4kvm-resource.js) |
| 苹果CMS 聚合源 | `hyj1817.maccms.resource` | 通用苹果CMS聚合，可配站点/翻页/季匹配（开源） | [maccms-source.js](maccms-source.js) |
| 4K 聚合源 | `app.mi3s.k4sources` | 100 个苹果CMS影视源多源聚合，优先4K/蓝光线路 | [4k-sources.js](4k-sources.js) |

## 100 个 4K 源站模块（app.mi3s.k4sources）

从抖音/社区评论区线索反搜 GitHub（LunaTV-config）、空壳影视 mac-cms、北海博客等公开聚合页，
去重合并出 **100 个苹果CMS影视采集源**，按清晰度等级分三档：

| 等级 | 数量 | 说明 |
|------|------|------|
| 4K | 60 | 源站标称 4K/蓝光/HDR，或线路数多、含 4K 线路概率高 |
| HD | 12 | 综合高清源（m3u8 自适应，多为 720P/1080P，部分片含 4K） |
| AD | 28 | 成人/擦边源（api/json.php 裸 m3u8 直链） |

### 实测可用性（2026-10-28）

影视源会频繁换域名、关停或被墙，实测 100 个源里 **39 个当前可达**（HTTP 200），
其中成人源（api/json.php 类）几乎全部在线，部分正规源已失效或需代理。
模块运行时对失效源**自动跳过**，并把 39 个实测在线源**优先尝试**，减少等待。

> 源站随时会变，本清单是「快照」而非「永久可用」。失效后建议按站名反搜新域名替换。

### 导入方式

**方式一：App 内「添加文件」**（推荐）
把 `4k-sources.js` 下载到手机，在 Rex 里「添加文件」导入。

**方式二：远程订阅**
- 4K 聚合源：`https://raw.githubusercontent.com/mi3suuu/rex-hires/main/4k-sources.js`

## 导入方式

**方式一：App 内「添加文件」**（推荐）
把 `.js` 文件下载到手机，在 Rex 里「添加文件」导入，App 会自动注册为 `local` 模式。

**方式二：远程订阅**
- 自研 hires：`https://raw.githubusercontent.com/mi3suuu/rex-hires/main/hires.js`
- 4KVM：`https://raw.githubusercontent.com/HYJ1817/fw-modules/main/widgets/4kvm-resource.js`
- maccms：`https://raw.githubusercontent.com/HYJ1817/fw-modules/main/widgets/maccms-source.js`

## 关键认知（为什么之前「点进去没资源」）

Rex 模块分两种 `type`：
- `video` —— 首页列表组件，只返回**片单/元数据**（官方 tmdb/bangumi 就是这种）
- `stream` —— 播放源解析器，`loadResource(seriesName, episode)` 返回**真实播放地址** `VideoResource[]`

点进一部影片后，Rex 会拿片名去调**所有已注册的 `stream` 模块**，
谁的 `loadResource` 返回了播放地址，就用谁播。所以「播放源」必须是 `stream` 类型。

`VideoResource` 字段：`{ name, description, url, customHeaders, playerType: "app" }`。

## 实测

- 片名「Big Buck Bunny」→ 返回 Mux 1080p 直链
- 片名「NASA」→ 返回 NASA TV 直播流
- 片名「流浪地球」→ 从苹果CMS源解析出 `vip.ffzy-play8.com` 真实 m3u8 播放地址
