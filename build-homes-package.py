#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 Rex 首页布局包（.rex）。

严格照官方 Mac 导出写法（见 rex-home 仓库 .github/scripts/build-rex-package.py）：
  - zip 顺序：rex-manifest.json → rex-layout.json → rex-home.json（内嵌版再加 rex-scripts/）
  - JSON 紧凑一行、中文不转义、网址里的 / 写成 \\/
  - 文件属性 0644、create_system=3、固定时间戳

产出两个包：
  homes-package.rex      行里 widgetURL 指向 jsDelivr（需联网，模块自动更新）
  homes-package-local.rex 行里 widgetURL = file:///home.js，脚本内嵌在 rex-scripts/
                          （导入即装成本机模块，完全不依赖网络）

用法：python3 build-homes-package.py
"""

import json
import os
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
JS_PATH = os.path.join(HERE, "home.js")
CDN_URL = "https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v4.1.0/home.js"
WIDGET_ID = "app.mi3s.homes"
WIDGET_NAME = "高清片源聚合"
STAMP = (2026, 10, 29, 0, 0, 0)

# 4 行：最新更新 / 热播榜 / 分类 / 题材
ROWS = [
    ("9B18F434-14D1-437A-9DEF-232660A23C51", "8D732165-949B-4DCC-9E21-B64BCAAD786D",
     "高清片源聚合", "最新更新", "布局已生效 ✔", "latest", [{"key": "page", "value": "1"}]),
    ("5DB404D7-2149-43DE-9C6B-849833EA8C27", "DCBC2A90-BA88-4F43-A1C4-5BE4AC5AF539",
     "热播榜", "热播榜", "本周趋势（电影+剧集）", "hot", [{"key": "page", "value": "1"}]),
    ("73E72BA9-58F8-46AE-86E4-B799DB7A24FB", "BD664215-70B0-46AC-B48C-9013EA62B4D9",
     "分类", "分类", "电影 / 连续剧 / 动漫 / 综艺 / 纪录片 / 短剧", "category",
     [{"key": "type", "value": "movie"}, {"key": "page", "value": "1"}]),
    ("1D2289F5-5401-478A-8504-F8B6DF246F10", "F98752DC-AF6F-47E4-BE73-D2ED09A82722",
     "题材", "题材", "动作 / 喜剧 / 爱情 / 科幻 / 恐怖 / 剧情 等", "genre",
     [{"key": "genre", "value": "action"}, {"key": "page", "value": "1"}]),
]


def build_layout(widget_url):
    layout = []
    for sec_id, item_id, sec_title, item_title, subtitle, fn, params in ROWS:
        layout.append({
            "id": sec_id,
            "title": sec_title,
            "isActive": True,
            "items": [{
                "style": "fullWidthPoster",
                "count": 0,
                "gridSize": [-1, 2.3],
                "id": item_id,
                "title": item_title,
                "subtitle": subtitle,
                "iconUrl": "",
                "functionId": fn,
                "params": params,
                "widgetBundleId": WIDGET_ID,
                "widgetId": WIDGET_ID,
                "widgetURL": widget_url,
                "name": WIDGET_NAME,
            }],
        })
    return layout


def mac_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("/", "\\/").encode("utf-8")


def write_package(out_path, layout, home, script_bytes=None):
    entries = [
        ("rex-manifest.json", mac_json({"format": "video.fika.rex.home-package", "version": 1})),
        ("rex-layout.json", mac_json(layout)),
        ("rex-home.json", mac_json(home)),
    ]
    if script_bytes is not None:
        entries.append(("rex-scripts/home.js", script_bytes))

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in entries:
            info = zipfile.ZipInfo(name, date_time=STAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)

    # 自检
    chk = zipfile.ZipFile(out_path)
    assert chk.testzip() is None, f"{out_path} zip 损坏"
    expect = [n for n, _ in entries]
    assert chk.namelist() == expect, f"{out_path} 文件顺序不符: {chk.namelist()}"
    # 回读校验 JSON 可解析
    json.loads(chk.read("rex-layout.json"))
    json.loads(chk.read("rex-home.json"))
    json.loads(chk.read("rex-manifest.json"))
    print(f"✔ {os.path.basename(out_path)}  {os.path.getsize(out_path)} bytes  条目={expect}")


def main():
    script = open(JS_PATH, "rb").read()
    home = {"avatar": "avatar-8", "isIndependent": False, "title": "高清片源首页"}

    # CDN 版（不可变 tag URL，确定能拿到对应版本）
    write_package(os.path.join(HERE, "homes-package.rex"), build_layout(CDN_URL), home)


if __name__ == "__main__":
    main()
