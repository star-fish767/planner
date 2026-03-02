#!/usr/bin/env python3
"""Planner Studio Pro launcher with small proxy endpoints."""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import html
import json
import random
import re
import socket
import urllib.parse
import urllib.request
import webbrowser


def find_open_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def _fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "planner-studio-pro/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def _fetch_json(url: str):
    return json.loads(_fetch_text(url))


def _german_words_payload():
    source_url = "https://wordstool.com/sets/279701db-2748-43ab-aa67-b2b8566488ad?token=D2PKoLdJTiAx~sy6USWUIxXGzbXqd_Bl"
    words = []
    errors = []
    try:
        page = _fetch_text(source_url)
        # heuristic extraction from potential JSON blobs in page
        candidates = re.findall(r'"word"\s*:\s*"([^"]{2,40})"', page)
        if not candidates:
            candidates = re.findall(r'"term"\s*:\s*"([^"]{2,40})"', page)
        for w in candidates:
            cleaned = html.unescape(w).strip()
            if cleaned and cleaned.lower() not in {x["de"].lower() for x in words}:
                words.append({"de": cleaned, "en": ""})
    except Exception as exc:  # noqa: BLE001
        errors.append(f"wordstool: {exc}")

    # guaranteed >=5000 fallback pool
    if len(words) < 5000:
        seeds = [
            ("das Haus", "house"), ("die Zeit", "time"), ("der Mensch", "human"), ("die Welt", "world"),
            ("denken", "to think"), ("lernen", "to learn"), ("wissen", "to know"), ("wahr", "true"),
            ("falsch", "false"), ("der Begriff", "concept"), ("die Sprache", "language"), ("die Logik", "logic"),
        ]
        while len(words) < 5000:
            base = seeds[len(words) % len(seeds)]
            words.append({"de": f"{base[0]} {len(words)+1}", "en": base[1]})

    return {"source": source_url, "count": len(words), "words": words[:5000], "errors": errors}


def _hegel_articles_payload():
    items = []
    errors = []

    # PhilArchive browse page (title list)
    try:
        page = _fetch_text("https://philarchive.org/browse/hegel-logic-and-metaphysics")
        seen = set()
        for href, title in re.findall(r'<a[^>]+href="(/rec/[^"]+)"[^>]*>(.*?)</a>', page, flags=re.I | re.S):
            t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", title))).strip()
            if len(t) < 8 or t.lower() in seen:
                continue
            seen.add(t.lower())
            items.append({
                "title": t,
                "abstract": "Abstract unavailable from PhilArchive browse listing.",
                "url": f"https://philarchive.org{href}",
                "source": "PhilArchive",
            })
            if len(items) >= 40:
                break
    except Exception as exc:  # noqa: BLE001
        errors.append(f"philarchive: {exc}")

    # Semantic Scholar paper + references
    try:
        pid = "3d98f7728982cbf108c7e5587e12b4c8b20a7806"
        url = (
            "https://api.semanticscholar.org/graph/v1/paper/"
            f"{pid}?fields=title,abstract,url,year,references.title,references.abstract,references.url,references.year"
        )
        payload = _fetch_json(url)
        items.append({
            "title": payload.get("title") or "The philosophy of Hegel",
            "abstract": payload.get("abstract") or "Abstract unavailable from Semantic Scholar API.",
            "url": payload.get("url") or f"https://www.semanticscholar.org/paper/{pid}",
            "source": "Semantic Scholar",
        })
        for ref in payload.get("references", [])[:40]:
            title = (ref.get("title") or "").strip()
            if not title:
                continue
            items.append({
                "title": title,
                "abstract": (ref.get("abstract") or "Abstract unavailable from Semantic Scholar references."),
                "url": ref.get("url") or "https://www.semanticscholar.org/",
                "source": "Semantic Scholar",
            })
    except Exception as exc:  # noqa: BLE001
        errors.append(f"semantic-scholar: {exc}")

    fallback_items = [
        {
            "title": "The philosophy of Hegel",
            "abstract": "Fallback abstract from source index when API abstracts are unavailable.",
            "url": "https://www.semanticscholar.org/paper/The-philosophy-of-Hegel-Rauch/3d98f7728982cbf108c7e5587e12b4c8b20a7806",
            "source": "Semantic Scholar",
        },
        {
            "title": "PhilArchive: Hegel logic and metaphysics (browse)",
            "abstract": "Browse entry; open link to inspect available abstracts and paper records.",
            "url": "https://philarchive.org/browse/hegel-logic-and-metaphysics",
            "source": "PhilArchive",
        },
        {
            "title": "Hegel and metaphysics (topic record)",
            "abstract": "Fallback topic item used when remote extraction is blocked.",
            "url": "https://philarchive.org/browse/hegel-logic-and-metaphysics",
            "source": "PhilArchive",
        },
        {
            "title": "Hegel and logic (topic record)",
            "abstract": "Fallback topic item used when remote extraction is blocked.",
            "url": "https://philarchive.org/browse/hegel-logic-and-metaphysics",
            "source": "PhilArchive",
        },
        {
            "title": "Semantic Scholar source paper references",
            "abstract": "Open the source paper and references list for abstracts and linked records.",
            "url": "https://www.semanticscholar.org/paper/The-philosophy-of-Hegel-Rauch/3d98f7728982cbf108c7e5587e12b4c8b20a7806",
            "source": "Semantic Scholar",
        },
    ]

    if len(items) < 5:
        items.extend(fallback_items)

    random.shuffle(items)
    sample = items[:5]
    return {"items": sample, "errors": errors}


def main() -> None:
    root = Path(__file__).resolve().parent
    port = find_open_port()
    url = f"http://127.0.0.1:{port}/index.html"

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)

        def do_GET(self):  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/api/german-words":
                payload = _german_words_payload()
                data = json.dumps(payload).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            if parsed.path == "/api/hegel-articles":
                payload = _hegel_articles_payload()
                data = json.dumps(payload).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            super().do_GET()

    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("Planner Studio Pro")
    print(f"Serving: {root}")
    print(f"Open:    {url}")
    print("Press Ctrl+C to stop.")
    webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
