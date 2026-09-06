#!/usr/bin/env python3
"""
SayPulse Local SPA Development Server
Emulates Apache .htaccess rewrite rules for local development.
"""
import http.server
import os
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist-prod')

class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-SayPulse-Key, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path.strip('/')
        disk_path = os.path.join(BASE_DIR, clean_path)

        # 1. Existing regular files
        if clean_path and os.path.isfile(disk_path):
            return super().do_GET()

        # 2. SPA Rewrites matching dist-prod/.htaccess
        if clean_path.startswith('admin'):
            self.path = '/admin.html'
        elif clean_path.startswith('demo'):
            self.path = '/demo.html'
        elif not os.path.exists(disk_path):
            self.path = '/index.html'

        return super().do_GET()

    def do_HEAD(self):
        return self.do_GET()

if __name__ == '__main__':
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), SPARequestHandler)
    print(f"🎙️ [SayPulse SPA Local Server] Serving {BASE_DIR} on http://localhost:{PORT}")
    sys.stdout.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
