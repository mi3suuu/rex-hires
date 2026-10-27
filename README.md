# Rex 高清无损片源模块（app.mi3s.hires）

给 iPhone Duo 上的 Rex（`tv.rexnow.app` 1.0.1）扩片源。一个模块，四个入口：**杜比视界 / 4K**、**高码率测试流**、**公共版权片库**、**我的直链**。

---

## 一、先说结论（三条硬事实）

1. **Rex 的「视频源」只有两种形态**
   - **模块**（JS widget）：`WidgetMetadata` + 若干 `functionName`，函数返回带 `videoUrl` 的条目 → 首页横滑列表。这套机制和官方 `assets.rexnow.tv/scripts/*.js` 完全一样，官方合集里就是 `rex.tmdb / rex.bangumi / rex.danmu / rex.nlsearch` 四个。
   - **媒体库**：WebDAV / SMB / 115 网盘 / Plex（`MediaSource` 模型，带 `preferOriginalStrmVideoPath` 开关）。
2. **网上流传的「4K 测试流清单」基本是标称**。逐条拉 master、数 variant 之后：Mux 那条最高 1920×1080、Unified Streaming 的《Tears of Steel》最高 1680×750、Shaka 那条 768×576。真正 4K 的只有 Apple 的 `adv_dv_atmos`。
3. **「无损」不可能从模块里来**。模块能给的最多是「高码率直链」。真正的无损（蓝光原盘 / remux / TrueHD）只能是你自己的库直连播放，模块负责索引。所以这个模块里给了一个「我的直链」入口，专门用来塞你自己的片子。

---

## 二、实测参数（2026-10-27，本机 ffprobe + master.m3u8 逐 variant 解析）

| 片源 | 最高分辨率 | 码率 | 编码 | 档数 |
|---|---|---|---|---|
| 杜比视界 4K · Apple `adv_dv_atmos` | **3840×2160** | **25.1 Mbps** | `dvh1.05.06` + `ec-3`（全景声） | 100 |
| └ 同一条里的 HEVC 4K | 3840×2160 | 24.8 Mbps | `hvc1.2.20000000.H150` | — |
| └ 同一条里的 H.264 | 1920×1080 | 10.8 Mbps | `avc1.640028` | — |
| HEVC 阶梯 · Apple BipBop | 1920×1080 | ~8 Mbps | `hvc1` | 54 |
| fMP4 / TS · Apple BipBop | 1920×1080 | ~8 Mbps | `avc1` | 24 / 24 |
| BipBop 经典多轨 | 1920×1080 | 1 Mbps | `avc1` | 6 |
| Big Buck Bunny · Mux | 1920×1080 | 6.2 Mbps | `avc1` | 5 |
| Tears of Steel · Unified | 1680×750 | 2.5 Mbps | `avc1` | 7 |
| Angel One · Shaka | 768×576 | 8 Mbps | `avc1` | 10 |
| Akamai 测试直播 | 1920×1080 | 12.9 Mbps | `avc1` | 2 |
| NASA TV 直播 | 1280×720 | 2.3 Mbps | `avc1` | 6 |

公共版权片库（Internet Archive，运行时查）：实测能捞到 **1080p 的完整长片**（例：`Sita Sings the Blues` 1080p / 4.2 GB，CC 授权），也能按分类捞默片、黑色电影、科幻、经典动画等 7 个类目、共 2.8 万部 `feature_films`。

复跑核验：`python3 verify.py`（30 秒，会打印上面那张表的实时数据）。

---

## 三、安装（三种方式，任选）

### A. 通过链接添加（最快，现在就能用）

模块已经在局域网起了个临时服务：

```
http://192.168.0.113:8788/hires.js
```

Rex → 设置 → **模块** → 添加 → **通过链接添加** → 粘贴上面这个地址。

> 手机要和 Mac 在同一个 Wi-Fi。这个服务是这次会话临时起的，Mac 重启或会话结束就没了，重启用：
> `cd ~/WorkBuddy/2026-10-25-04-06-58/rex-hires && python3 -m http.server 8788 --bind 192.168.0.113`

### B. 添加文件（不依赖网络）

把 `hires.js` 通过隔空投送 / 微信文件传到 iPhone，用「文件」App 存到 **我的 iPhone → Rex**，然后 Rex → 模块 → 添加 → **添加文件** → 选 `hires.js`。

### C. 直接推进沙盒（需要手机处于解锁、亮屏状态）

```bash
xcrun devicectl device copy to \
  --device 00008160-0002698C0A900036 \
  --domain-type appDataContainer --domain-identifier tv.rexnow.app \
  --source ./hires.js --destination "Documents/hires.js"
```

（这次尝试时手机锁屏，devicectl 报 `error 4016` 拿不到 powerAssertion，所以没推上去。解锁后重跑即可，走 B 更省事。）

### 装完之后

Rex 首页 → 编辑 → 添加小组件 → 从「高清无损片源」里挑：**杜比视界 / 4K**、**高码率测试流**、**公共版权片库**（可切 7 个分类）、**我的直链**。

---

## 四、想真看到「无损」，还要两步

1. **库走直连**：115 / Plex / WebDAV / SMB 加库后，播放设置里确认走 **原画/直连**，别让它转码；STRM 场景打开 **「优先原始 STRM 视频路径」**（`preferOriginalStrmVideoPath`）——不开的话 Rex 会先 try `start.m3u8` 转 HLS，码率就被压了。
2. **杜比视界别怕发绿**：Rex 内置 `libdovi` + `libplacebo`，P5 会自动映射，和电视上那套「DV 片源发绿紫」的问题不一样。

---

## 五、文件

| 文件 | 作用 |
|---|---|
| `hires.js` | 模块本体（14 KB，四个入口 + 你的直链表 `MY_SOURCES`） |
| `manifest.json` | 合集清单，字段照官方 `scripts/manifest.json` |
| `test_module.js` | Node 里假 Widget 跑全部函数，校验字段齐全、URL 全 https、id 不重复 |
| `verify.py` | 片源实时核验，输出真实分辨率/码率/档数 |

本地自测：

```bash
node --check hires.js && node test_module.js   # 5 个用例全通过
python3 verify.py                              # 片源可用性
```

---

## 六、已知限制（不粉饰）

- **archive.org 在部分网络下不通**。函数会记一行日志然后返回空数组，不影响其它三个入口；真连不上就改用「我的直链」+ 自家网盘。
- 模块只能给**直链**，不能浏览网盘目录（那是「库」的职责，Rex 已经自带）。
- 4K DV 那条是 Apple 官方 demo 素材，25 Mbps 起步，iPhone Duo 走 Wi-Fi 6 才稳，蜂窝网别试。
- 片源全部为**公开测试流 / 公共版权 / 开源电影**。没有也不需要任何来路不明的影视站聚合——那类内容 Rex 自己也会审。
