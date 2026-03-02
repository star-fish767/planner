#!/usr/bin/env python3
"""Planner Studio Pro launcher.
Starts a local server, serves static files, and exposes publication proxy APIs.
"""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import socket
import webbrowser
import json
import urllib.parse
import urllib.request


def find_open_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def _fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "planner-studio-pro/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def _pub_payload(query: str):
    q = urllib.parse.quote_plus(query)
    crossref_url = f"https://api.crossref.org/works?query.title={q}&sort=published&order=desc&rows=120"
    openalex_url = f"https://api.openalex.org/works?search={q}&per-page=120&sort=publication_date:desc"
    semantic_url = (
        "https://api.semanticscholar.org/graph/v1/paper/search"
        f"?query={q}&limit=80&fields=title,year,url,publicationTypes"
    )

    output = {"crossref": [], "openalex": [], "semantic": []}
    errors = []

    try:
        payload = _fetch_json(crossref_url)
        for item in payload.get("message", {}).get("items", []):
            output["crossref"].append({
                "title": (item.get("title") or [""])[0],
                "year": ((item.get("published") or {}).get("date-parts") or [[None]])[0][0],
                "url": f"https://doi.org/{item['DOI']}" if item.get("DOI") else item.get("URL"),
                "type": item.get("type", ""),
                "lang": (item.get("language") or "").lower(),
            })
    except Exception as exc:  # noqa: BLE001
        errors.append(f"crossref: {exc}")

    try:
        payload = _fetch_json(openalex_url)
        for item in payload.get("results", []):
            output["openalex"].append({
                "title": item.get("display_name", ""),
                "year": item.get("publication_year"),
                "url": ((item.get("primary_location") or {}).get("landing_page_url") or item.get("id")),
                "type": item.get("type", ""),
                "lang": (item.get("language") or "").lower(),
            })
    except Exception as exc:  # noqa: BLE001
        errors.append(f"openalex: {exc}")

    try:
        payload = _fetch_json(semantic_url)
        for item in payload.get("data", []):
            output["semantic"].append({
                "title": item.get("title", ""),
                "year": item.get("year"),
                "url": item.get("url"),
                "type": ",".join((item.get("publicationTypes") or [])),
                "lang": "",
            })
    except Exception as exc:  # noqa: BLE001
        errors.append(f"semantic: {exc}")

    output["errors"] = errors
    return output


def main() -> None:
    root = Path(__file__).resolve().parent
    port = find_open_port()
    url = f"http://127.0.0.1:{port}/index.html"

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)

        def do_GET(self):  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/api/publications":
                query = urllib.parse.parse_qs(parsed.query).get("q", ["Hegel OR Kant OR German Idealism"])[0]
                payload = _pub_payload(query)
                encoded = json.dumps(payload).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(encoded)))
                self.end_headers()
                self.wfile.write(encoded)
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
