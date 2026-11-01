import os
import sys
import time
import json
import base64
import asyncio
import subprocess
import urllib.request
import websockets

SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

async def send_cdp(ws, method, params=None, msg_id=1):
    req = {"id": msg_id, "method": method, "params": params or {}}
    await ws.send(json.dumps(req))
    while True:
        resp = await ws.recv()
        data = json.loads(resp)
        if data.get("id") == msg_id:
            return data.get("result", {})

async def capture_page(ws, url, out_path, wait_time=2.0):
    await send_cdp(ws, "Page.navigate", {"url": url}, 10)
    await asyncio.sleep(wait_time)
    res = await send_cdp(ws, "Page.captureScreenshot", {"format": "png"}, 11)
    if "data" in res:
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(res["data"]))
        print(f"Captured: {out_path}")

async def run_captures(prefix="before"):
    # Launch Chrome headless with remote debugging
    user_data = os.path.join(os.environ.get("TEMP", "C:\\temp"), "chrome_cdp_profile")
    os.makedirs(user_data, exist_ok=True)
    chrome_proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        f"--user-data-dir={user_data}",
        "--window-size=1280,800",
        "--disable-gpu",
        "--no-sandbox",
        "about:blank"
    ])
    
    try:
        # Wait for CDP to respond
        for _ in range(30):
            try:
                with urllib.request.urlopen("http://localhost:9222/json") as resp:
                    tabs = json.loads(resp.read().decode())
                    if tabs:
                        ws_url = tabs[0]["webSocketDebuggerUrl"]
                        break
            except Exception:
                await asyncio.sleep(0.3)
        else:
            print("Failed to connect to Chrome CDP.")
            return

        async with websockets.connect(ws_url) as ws:
            await send_cdp(ws, "Page.enable", {}, 1)
            await send_cdp(ws, "Emulation.setDeviceMetricsOverride", {
                "width": 1280,
                "height": 800,
                "deviceScaleFactor": 1,
                "mobile": False
            }, 2)

            # 1. Login page
            await capture_page(ws, "http://localhost:3000/login", os.path.join(SCREENSHOTS_DIR, f"{prefix}_login.png"), 1.5)

            # Set localStorage for authenticated pages
            mock_officer = {
                "officer_id": "OFF-001",
                "badge_number": "CID-001",
                "full_name": "Rajesh Sharma",
                "role": "ADMIN",
                "department": "Special Operations"
            }
            token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy"
            set_storage_js = f"""
            localStorage.setItem('fusion_auth_token', '{token}');
            localStorage.setItem('fusion_officer', '{json.dumps(mock_officer)}');
            """
            await send_cdp(ws, "Runtime.evaluate", {"expression": set_storage_js}, 3)

            # 2. Dashboard
            await capture_page(ws, "http://localhost:3000/", os.path.join(SCREENSHOTS_DIR, f"{prefix}_dashboard.png"), 2.0)

            # 3. Cases List
            await capture_page(ws, "http://localhost:3000/cases", os.path.join(SCREENSHOTS_DIR, f"{prefix}_cases.png"), 2.0)

            # 4. Case Detail
            await capture_page(ws, "http://localhost:3000/cases/CASE-2026-001", os.path.join(SCREENSHOTS_DIR, f"{prefix}_case_detail.png"), 2.0)

            # 5. Evidence
            await capture_page(ws, "http://localhost:3000/evidence", os.path.join(SCREENSHOTS_DIR, f"{prefix}_evidence.png"), 2.0)

            # 6. Search
            await capture_page(ws, "http://localhost:3000/search?q=crypto", os.path.join(SCREENSHOTS_DIR, f"{prefix}_search.png"), 2.0)

            # 7. Relationships
            await capture_page(ws, "http://localhost:3000/relationships", os.path.join(SCREENSHOTS_DIR, f"{prefix}_relationships.png"), 2.5)

            # 8. DBMS Concepts
            await capture_page(ws, "http://localhost:3000/dbms-concepts", os.path.join(SCREENSHOTS_DIR, f"{prefix}_dbms_concepts.png"), 2.0)

            # 9. Users
            await capture_page(ws, "http://localhost:3000/users", os.path.join(SCREENSHOTS_DIR, f"{prefix}_users.png"), 2.0)

    finally:
        chrome_proc.terminate()
        try:
            chrome_proc.wait(timeout=3)
        except Exception:
            chrome_proc.kill()

if __name__ == "__main__":
    prefix = sys.argv[1] if len(sys.argv) > 1 else "before"
    asyncio.run(run_captures(prefix))
