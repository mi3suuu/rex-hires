#!/usr/bin/env python3
# 生成「含内嵌明文脚本」的 .rex 首页包（复刻 RexHome 草稿版 v151-draft/RexHome-v151.rex 的约定）：
#   - rex-manifest.json / rex-layout.json / rex-home.json（紧凑 JSON，/ 写成 \/）
#   - rex-scripts/home.js = 明文模块脚本
#   - layout 里每个 item 的 widgetURL 改成 file:///home.js（指向包内脚本）
#   - 文件属性 0644（external_attr=0o100644<<16）、create_system=3、固定时间戳
import json, zipfile, io, os

SRC_LAYOUT = 'homes-package.rex'   # 读现有包的 layout/home
JS_PATH = 'home.js'                 # 要内嵌的明文脚本
OUT = 'homes-package-embedded.rex'

# 读现有包
src = zipfile.ZipFile(SRC_LAYOUT)
layout = json.loads(src.read('rex-layout.json'))
home = json.loads(src.read('rex-home.json'))
stamp = src.getinfo('rex-layout.json').date_time

# 1) layout 里 widgetURL 改为 file:///home.js
pointed = 0
for row in layout:
    for item in row.get('items', []):
        if item.get('widgetId') == 'app.mi3s.homes':
            item['widgetURL'] = 'file:///home.js'
            pointed += 1

# 2) 读明文脚本
script = open(JS_PATH, 'rb').read()

def mac_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('/', '\\/').encode('utf-8')

out = zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED)
files = [
    ('rex-manifest.json', mac_json({'format': 'video.fika.rex.home-package', 'version': 1})),
    ('rex-layout.json', mac_json(layout)),
    ('rex-home.json', mac_json(home)),
    ('rex-scripts/home.js', script),
]
for name, data in files:
    entry = zipfile.ZipInfo(name, date_time=stamp)
    entry.compress_type = zipfile.ZIP_DEFLATED
    entry.create_system = 3
    entry.external_attr = 0o100644 << 16
    out.writestr(entry, data)
out.close()

# 校验
chk = zipfile.ZipFile(OUT)
names = chk.namelist()
assert chk.testzip() is None, 'zip 损坏'
assert 'rex-scripts/home.js' in names, '缺少内嵌脚本'
print(f'生成 {OUT}：{len(layout)} 行，{pointed} 行指向 file:///home.js')
print('包内容:', names)
