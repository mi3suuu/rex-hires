# Rex 播放源合集（stream 类型）

点进影片即出**真实播放地址**的 Rex 播放源模块。全部是 `stream` 类型（`loadResource` 解析器），
不是首页列表组件（`video` 类型）。

## 模块清单

| 模块 | id | 说明 | raw 地址 |
|------|----|----|---------|
| 高清片源 | `app.mi3s.hires` | 4K/DV 测试片直链 + 苹果CMS聚合搜索 + 直播流 | [hires.js](hires.js) |
| 4KVM 播放源 | `hyj1817.4kvm.resource` | 4KVM 影视 HLS 播放源（开源） | [4kvm-resource.js](4kvm-resource.js) |
| 苹果CMS 聚合源 | `hyj1817.maccms.resource` | 通用苹果CMS聚合，可配站点/翻页/季匹配（开源） | [maccms-source.js](maccms-source.js) |

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
