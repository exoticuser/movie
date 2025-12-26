#!/usr/bin/env python3
import argparse
import time
import hashlib
import hmac
import base64
import requests
from urllib.parse import urlparse, parse_qs
import json

# ===================== CONFIG =====================
BASE_URL = "https://api.inmoviebox.com"

# Use the working key you already validated
PRIMARY_KEY = "76iRl07s0xSN9jqmEWAt79EBJZulIQIsV64FZr2O"

ACCEPT = "application/json"
CONTENT_TYPE = "application/json"
UA = "com.community.mbox.in/50020042 (Linux; Android)"

X_CLIENT_INFO = (
    '{"package_name":"com.community.mbox.in",'
    '"version_name":"3.0.03.0529.03",'
    '"version_code":50020042,'
    '"os":"android","os_version":"16",'
    '"device_id":"da2b99c821e6ea023e4be55b54d5f7d8",'
    '"install_store":"ps","brand":"google",'
    '"model":"sdk_gphone64_x86_64","region":"IN",'
    '"timezone":"Asia/Calcutta"}'
)

# ===================== AUTH =====================
def md5_hex(b: bytes) -> str:
    return hashlib.md5(b).hexdigest()

def gen_x_client_token(ts: int) -> str:
    return f"{ts},{md5_hex(str(ts)[::-1].encode())}"

def build_canonical(method: str, url: str, ts: int, body: str | None = None) -> str:
    p = urlparse(url)
    qs = parse_qs(p.query, keep_blank_values=True)

    parts = []
    for k in sorted(qs):
        for v in qs[k]:
            parts.append(f"{k}={v}")
    query = "&".join(parts)

    body_len = ""
    body_hash = ""
    if body:
        bb = body.encode("utf-8")
        body_len = str(len(bb))
        body_hash = md5_hex(bb[:102400])

    return (
        f"{method}\n"
        f"{ACCEPT}\n"
        f"{CONTENT_TYPE}\n"
        f"{body_len}\n"
        f"{ts}\n"
        f"{body_hash}\n"
        f"{p.path}?{query}"
    )

def gen_x_tr_signature(method: str, url: str, ts: int, body: str | None = None) -> str:
    secret = base64.b64decode(PRIMARY_KEY)
    canonical = build_canonical(method, url, ts, body)
    sig = hmac.new(secret, canonical.encode(), hashlib.md5).digest()
    return f"{ts}|2|{base64.b64encode(sig).decode()}"

def make_headers(method: str, url: str, body: str | None = None) -> dict:
    ts = int(time.time() * 1000)
    return {
        "user-agent": UA,
        "accept": ACCEPT,
        "content-type": CONTENT_TYPE,
        "x-client-info": X_CLIENT_INFO,
        "x-client-status": "0",
        "x-client-token": gen_x_client_token(ts),
        "x-tr-signature": gen_x_tr_signature(method, url, ts, body),
    }

def api_get(url: str) -> dict:
    r = requests.get(url, headers=make_headers("GET", url), timeout=20)
    r.raise_for_status()
    return r.json()

def api_post(url: str, body: str) -> dict:
    r = requests.post(url, data=body, headers=make_headers("POST", url, body), timeout=20)
    r.raise_for_status()
    return r.json()

# ===================== HELPERS =====================
def pretty_json(x):
    print(json.dumps(x, indent=2, ensure_ascii=False))

def iter_sections(tab: int):
    url = f"{BASE_URL}/wefeed-mobile-bff/tab-operating?page=1&tabId={tab}&version="
    data = api_get(url)
    return data.get("data", {}).get("items", [])

def iter_subjects_from_section(sec):
    if "subjects" in sec:
        for s in sec["subjects"]:
            yield s
    elif "customData" in sec:
        for it in sec["customData"].get("items", []):
            s = it.get("subject")
            if s:
                yield s

# ===================== COMMANDS =====================
def cmd_tabs():
    for tab in range(0, 8):
        secs = iter_sections(tab)
        if secs:
            print(f"\nTAB {tab}")
            for s in secs:
                print(" -", s.get("title"))

def cmd_categories(tab: int):
    for s in iter_sections(tab):
        print("-", s.get("title"))

def cmd_items(tab: int, category: str):
    for sec in iter_sections(tab):
        if sec.get("title") == category:
            print(f"\n{category}")
            found = False
            for s in iter_subjects_from_section(sec):
                found = True
                print(s.get("title"), "=>", s.get("subjectId"))
            if not found:
                print("(No items)")
            return
    print("Category not found")

def cmd_search(keyword: str, page: int, per_page: int):
    url = f"{BASE_URL}/wefeed-mobile-bff/subject-api/search/v2"
    body = json.dumps({"page": page, "perPage": per_page, "keyword": keyword})
    data = api_post(url, body)
    results = data.get("data", {}).get("results", [])
    for group in results:
        for s in group.get("subjects", []):
            print(s.get("title"), "=>", s.get("subjectId"))

def cmd_links(subject_id: str, season: int, episode: int):
    url = (
        f"{BASE_URL}/wefeed-mobile-bff/subject-api/play-info"
        f"?subjectId={subject_id}&se={season}&ep={episode}"
    )
    data = api_get(url)
    streams = data.get("data", {}).get("streams", [])

    if not streams:
        print("No streams found")
        return

    # Prefer MP4, then HLS, then DASH
    def rank(s):
        u = (s.get("url") or "").lower()
        if ".mp4" in u:
            return 0
        if "m3u8" in u:
            return 1
        return 2

    streams = sorted(streams, key=rank)

    for s in streams:
        stream_url = s.get("url")
        sign_cookie = s.get("signCookie")

        print("\nFORMAT:", s.get("format"))
        print("RES:", s.get("resolutions"))
        print("CODEC:", s.get("codecName"))
        print("URL:", stream_url)

        # Pre-signed MP4 (direct)
        if stream_url and "sign=" in stream_url:
            print("▶ DIRECT (pre-signed)")
            print("mpv '" + stream_url + "'")
            print("ffmpeg -i '" + stream_url + "' -c copy out.mp4")

        # Cookie-protected DASH/HLS
        elif sign_cookie:
            print("▶ COOKIE-PROTECTED")
            print(
                "mpv '" + stream_url + "' "
                f"--http-header-fields='Referer: {BASE_URL}' "
                f"--http-header-fields='Cookie: {sign_cookie}'"
            )
            print(
                "ffmpeg "
                f"-headers \"Referer: {BASE_URL}\\r\\nCookie: {sign_cookie}\" "
                f"-i '{stream_url}' -c copy out.mkv"
            )
        else:
            print("⚠ Stream unusable (no signature, no cookie)")

# ===================== MAIN =====================
parser = argparse.ArgumentParser(description="MovieBox All-in-One CLI")
sub = parser.add_subparsers(dest="cmd")

sub.add_parser("tabs")

p_cat = sub.add_parser("categories")
p_cat.add_argument("--tab", type=int, required=True)

p_items = sub.add_parser("items")
p_items.add_argument("--tab", type=int, required=True)
p_items.add_argument("--category", required=True)

p_search = sub.add_parser("search")
p_search.add_argument("--q", required=True)
p_search.add_argument("--page", type=int, default=1)
p_search.add_argument("--per-page", type=int, default=10)

p_links = sub.add_parser("links")
p_links.add_argument("--subject-id", required=True)
p_links.add_argument("--season", type=int, default=0)
p_links.add_argument("--episode", type=int, default=0)

args = parser.parse_args()

if args.cmd == "tabs":
    cmd_tabs()
elif args.cmd == "categories":
    cmd_categories(args.tab)
elif args.cmd == "items":
    cmd_items(args.tab, args.category)
elif args.cmd == "search":
    cmd_search(args.q, args.page, args.per_page)
elif args.cmd == "links":
    cmd_links(args.subject_id, args.season, args.episode)
else:
    parser.print_help()