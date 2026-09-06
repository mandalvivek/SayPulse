#!/usr/bin/env python3
import os
import sys
import ftplib

FTP_HOST = "ftp.nextgenmultiverse.com"
FTP_PORT = 21
FTP_USER = "u459840062.antigravity"
FTP_PASS = "N7!qR4@vL9#xT2mK8pZ6"
REMOTE_TARGET_DIR = "services/saypulse/prod"
LOCAL_DIR = os.path.join(os.path.dirname(__file__), "dist-prod")

def deploy():
    print(f"🚀 Connecting to {FTP_HOST}:{FTP_PORT} (Passive Mode)...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=20)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print("✅ Authenticated successfully!")

    # Navigate or ensure remote directory
    dirs = REMOTE_TARGET_DIR.split('/')
    current = ""
    for d in dirs:
        current += f"/{d}" if current else d
        try:
            ftp.cwd(d)
        except Exception:
            print(f"📁 Creating remote directory: {d}...")
            ftp.mkd(d)
            ftp.cwd(d)

    print(f"📂 Current Remote Directory: {ftp.pwd()}")

    # Upload all files from dist-prod
    files = os.listdir(LOCAL_DIR)
    for filename in sorted(files):
        local_filepath = os.path.join(LOCAL_DIR, filename)
        if os.path.isfile(local_filepath):
            file_size_kb = os.path.getsize(local_filepath) / 1024
            print(f"⬆️  Uploading {filename} ({file_size_kb:.1f} KB)...")
            with open(local_filepath, "rb") as f:
                ftp.storbinary(f"STOR {filename}", f)
            print(f"   ✓ {filename} uploaded successfully.")

    print("\n📋 Final Remote Directory Listing:")
    for item in ftp.nlst():
        print(f"   - {item}")

    ftp.quit()
    print("\n🎉 Deployment to production complete!")

if __name__ == "__main__":
    deploy()
