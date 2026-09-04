#!/usr/bin/env python3
"""
Dev server for Ayrisha's Adventures.

python3 -m http.server sends no cache headers, so Chrome caches the JS
and can keep running an old build after you have edited it - which looks
exactly like "my change did nothing". This sends no-store on everything,
so a reload always gets what is actually on disk.

    python3 serve.py            # http://localhost:8777
    python3 serve.py 9000       # a different port
"""

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        if '404' in (fmt % args):
            super().log_message(fmt, *args)


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
print(f"Ayrisha's Adventures  ->  http://localhost:{port}")
print(f"  whole game     http://localhost:{port}")
print(f"  a single level http://localhost:{port}/game.html?level=3")
print('Ctrl-C to stop.')
ThreadingHTTPServer(('', port), NoCacheHandler).serve_forever()
