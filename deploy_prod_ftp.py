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

def upload_file(ftp, local_filepath, remote_filename):
    if remote_filename in ["store.json", "saypulse_store.json"]:
        print(f"🔒 Skipping {remote_filename} to protect live production tenant database.")
        return True
    file_size_kb = os.path.getsize(local_filepath) / 1024
    print(f"⬆️  Uploading {remote_filename} ({file_size_kb:.1f} KB)...")
    for attempt in range(3):
        try:
            with open(local_filepath, "rb") as f:
                ftp.storbinary(f"STOR {remote_filename}", f)
            print(f"   ✓ {remote_filename} uploaded successfully.")
            return True
        except Exception as e:
            print(f"   ⚠️ Retry {attempt+1}/3 for {remote_filename}: {e}")
    return False

def upload_recursive(ftp, current_local):
    for item in sorted(os.listdir(current_local)):
        if item.startswith('.') and item != '.htaccess':
            continue
        local_path = os.path.join(current_local, item)
        if os.path.isfile(local_path):
            upload_file(ftp, local_path, item)
        elif os.path.isdir(local_path):
            try:
                ftp.cwd(item)
            except Exception:
                try:
                    ftp.mkd(item)
                    ftp.cwd(item)
                except Exception as e:
                    print(f"   ⚠️ Error creating dir {item}: {e}")
            upload_recursive(ftp, local_path)
            try:
                ftp.cwd("..")
            except: pass

def deploy():
    if "--confirm-production" not in sys.argv and os.environ.get("CONFIRM_PROD") != "true":
        print("⛔ ABORTED: Production deployment requires explicit confirmation.")
        print("Agent Rule Enforced: Localhost -> Dev -> Production pipeline.")
        print("Usage: python3 saypulse/deploy_prod_ftp.py --confirm-production")
        sys.exit(1)

    print(f"🚀 Connecting to {FTP_HOST}:{FTP_PORT} (Passive Mode)...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print("✅ Authenticated successfully!")

    # Navigate or ensure remote directory
    dirs = REMOTE_TARGET_DIR.split('/')
    for d in dirs:
        try:
            ftp.cwd(d)
        except Exception:
            print(f"📁 Creating remote directory: {d}...")
            ftp.mkd(d)
            ftp.cwd(d)

    print(f"📂 Current Remote Directory: {ftp.pwd()}")

    upload_recursive(ftp, LOCAL_DIR)

    print("\n📋 Final Remote Directory Listing:")
    try:
        for item in ftp.nlst():
            print(f"   - {item}")
    except: pass

    try:
        ftp.quit()
    except: pass
    print("\n🎉 Deployment to production complete!")

if __name__ == "__main__":
    deploy()
