#!/usr/bin/env python3
"""复跑核验：把所有固定片源重新测一遍，输出真实最高分辨率/码率。

用法：python3 verify.py
只依赖标准库 + 本机 ffprobe（可选，用来二次确认 mp4 直链）。
"""
import json
import re
import subprocess
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}

# 与 hires.js 里 APPLE_STREAMS / LAB_STREAMS 一一对应
SOURCES = {
    "杜比视界 4K · Apple": "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8",
    "HEVC 阶梯 · Apple": "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8",
    "fMP4 · Apple": "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    "TS · Apple": "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
    "BipBop 经典": "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",
    "Mux BBB": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    "Unified ToS": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    "Shaka Angel One": "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8",
    "Akamai 直播": "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    "NASA TV": "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
}


def probe_hls(url):
    text = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read().decode(
        "utf-8", "ignore"
    )
    variants = []
    for line in text.splitlines():
        if not line.startswith("#EXT-X-STREAM-INF"):
            continue
        res = re.search(r"RESOLUTION=(\d+x\d+)", line)
        bw = re.search(r"BANDWIDTH=(\d+)", line)
        codecs = re.search(r'CODECS="([^"]+)"', line)
        variants.append(
            {
                "res": res.group(1) if res else "?",
                "w": int(res.group(1).split("x")[0]) if res else 0,
                "h": int(res.group(1).split("x")[1]) if res else 0,
                "bps": int(bw.group(1)) if bw else 0,
                "codecs": codecs.group(1) if codecs else "",
            }
        )
    if not variants:
        return None
    top = max(variants, key=lambda v: v["h"] * 10**9 + v["bps"])
    return {"count": len(variants), "top": top, "dv": any("dvh1" in v["codecs"] for v in variants)}


def probe_media(url):
    """mp4/mkv 直链用 ffprobe 量。"""
    try:
        out = subprocess.run(
            [
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=codec_name,width,height",
                "-of", "json", "-timeout", "15000000", url,
            ],
            capture_output=True, text=True, timeout=40,
        )
        s = json.loads(out.stdout)["streams"][0]
        return {"res": f"{s['width']}x{s['height']}", "h": s["height"], "codec": s["codec_name"]}
    except Exception as e:  # noqa: BLE001
        return {"error": str(e)[:60]}


def main():
    ok = 0
    print(f"{'片源':<22}{'最高分辨率':>12}{'码率':>10}  编码 / 说明")
    print("-" * 78)
    for name, url in SOURCES.items():
        try:
            if url.endswith((".m3u8",)) or ".m3u8" in url:
                r = probe_hls(url)
                if not r:
                    print(f"{name:<22}{'—':>12}{'—':>10}  无 variant")
                    continue
                t = r["top"]
                flag = " · DV" if r["dv"] else ""
                print(
                    f"{name:<22}{t['res']:>12}{t['bps']//1000000:>8.1f}M  {t['codecs'][:34]}{flag}  ({r['count']} 档)"
                )
                ok += 1
            else:
                r = probe_media(url)
                print(f"{name:<22}{r.get('res','?'):>12}{'—':>10}  {r.get('codec','?')}")
                ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"{name:<22}{'FAIL':>12}{'':>10}  {type(e).__name__}: {str(e)[:40]}")
    print("-" * 78)
    print(f"可用 {ok}/{len(SOURCES)}")


if __name__ == "__main__":
    main()
