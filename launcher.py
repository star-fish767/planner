#!/usr/bin/env python3
"""Planner Studio Pro launcher.
Starts a local static server and opens the app in your browser.
"""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import socket
import webbrowser


def find_open_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def main() -> None:
    root = Path(__file__).resolve().parent
    port = find_open_port()
    url = f"http://127.0.0.1:{port}/index.html"

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)

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
