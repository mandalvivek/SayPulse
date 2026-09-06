#!/usr/bin/env python3
import os
import sys
import ftplib

FTP_HOST = "ftp.nextgenmultiverse.com"
FTP_PORT = 21
FTP_USER = "u459840062.ag_dev_saypulse"
FTP_PASS = "D3v!S6@pL8#qW1mZ"
LOCAL_DIR = os.path.join(os.path.dirname(__file__), "dist-prod")

def deploy_dev():
    print(f"🚀 Connecting to {FTP_HOST}:{FTP_PORT} with Dev User {FTP_USER} (Passive Mode)...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=20)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print("✅ Authenticated successfully!")
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
    print("\n🎉 Deployment to Development complete!")

if __name__ == "__main__":
    deploy_dev()
