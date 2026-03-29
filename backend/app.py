from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from flask_mail import Mail
import os
import requests
from config import get_db_connection
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes.url import url_bp
from routes.auth import auth_bp
from routes.analytics import analytics_bp
from routes.admin import admin_bp

app = Flask(__name__)

# 📧 Mail Config (secure from .env)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

mail = Mail(app)
# Enable CORS
# Enable CORS with explicit support for preflight and custom headers
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
}})

# Secret key from .env
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")


# ================================
# HEALTH CHECK
# ================================
# ================================
# HEALTH CHECK + UPTIME
# ================================
@app.route("/", methods=["GET", "HEAD"])
def home():
    return jsonify({
        "status": "Ziplo API is running",
        "uptime_monitored": True
    }), 200


@app.route("/health", methods=["GET"])
def health_check():
    return {
        "status": "Server is running",
        "service": "ZIPLO URL Shortener API"
    }, 200


# Register routes
app.register_blueprint(auth_bp)
app.register_blueprint(url_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(admin_bp)


# ================================
# ROOT REDIRECTION + ANALYTICS (PROFESSIONAL CLEAN URLS 🔥)
# ================================
@app.route("/<short_code>", methods=["GET", "POST"])
def redirect_url(short_code):
    # 🕵️ Get Client IP (Handle proxies like Render/Vercel)
    ip_header = request.headers.get("X-Forwarded-For", request.remote_addr)
    # Take the first IP if it's a list
    ip = ip_header.split(',')[0].strip() if ip_header else "127.0.0.1"

    # 🔹 Safe geolocation
    location = "Unknown"
    city = "Unknown"
    region = "Unknown"
    
    # 🔹 User-Agent OS/Browser
    ua_string = request.headers.get('User-Agent', '').lower()
    
    if 'windows' in ua_string: os_name = 'Windows'
    elif 'iphone' in ua_string or 'ipad' in ua_string: os_name = 'iOS'
    elif 'mac' in ua_string: os_name = 'macOS'
    elif 'android' in ua_string: os_name = 'Android'
    elif 'linux' in ua_string: os_name = 'Linux'
    else: os_name = 'Other'
        
    if 'edg' in ua_string: browser = 'Edge'
    elif 'chrome' in ua_string: browser = 'Chrome'
    elif 'safari' in ua_string and 'chrome' not in ua_string: browser = 'Safari'
    elif 'firefox' in ua_string: browser = 'Firefox'
    else: browser = 'Other'
    
    if ip in ["127.0.0.1", "localhost", "::1"]:
        location = "Local Test"
        city = "Local Test"
        region = "Local Test"
    else:
        # 1. Primary: ip-api.com (more generous rate limits for servers)
        try:
            geo_resp = requests.get(f"http://ip-api.com/json/{ip}", timeout=2)
            if geo_resp.status_code == 200:
                geo_data = geo_resp.json()
                location = geo_data.get("country", "Unknown")
                city = geo_data.get("city", "Unknown")
                region = geo_data.get("regionName", "Unknown")
        except:
            pass

        # 2. Fallback: ipapi.co
        if location == "Unknown":
            try:
                geo = requests.get(
                    f"https://ipapi.co/{ip}/json/",
                    timeout=2,
                    headers={'User-Agent': 'Ziplo-URL-Shortener'}
                ).json()
                location = geo.get("country_name", "Unknown")
                city = geo.get("city", "Unknown")
                region = geo.get("region", "Unknown")
            except Exception as e:
                print(f"Geo Error: {e}")
                location = "Unknown"

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, original_url, status, expires_at, password FROM urls WHERE short_code = %s",
            (short_code,)
        )

        row = cursor.fetchone()

        if not row:
            return "Short URL not found", 404

        url_id = row[0]
        original_url = row[1]
        status = row[2]
        expires_at = row[3]
        password_hash = row[4]
        
        if status != "active":
            return "This URL is not active", 403
            
        from datetime import datetime
        if expires_at and datetime.utcnow() > expires_at:
            return "This URL has expired", 410

        # 🔥 Password Check
        if password_hash:
            from flask import render_template
            if request.method == "GET":
                return render_template("password_prompt.html", short_code=short_code, error=None)
            
            if request.method == "POST":
                from werkzeug.security import check_password_hash
                submitted_password = request.form.get("password")
                if not submitted_password or not check_password_hash(password_hash, submitted_password):
                    return render_template("password_prompt.html", short_code=short_code, error="Incorrect password")
        
        # 🔥 Log click (only if GET w/o password XOR POST with correct password)
        cursor.execute(
            "INSERT INTO clicks (url_id, ip_address, location, city, region, os, browser) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (url_id, ip, location, city, region, os_name, browser)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return redirect(original_url)

    except Exception as e:
        return jsonify({"error": str(e)}), 400




# Run server
if __name__ == "__main__":
    app.run(debug=True)