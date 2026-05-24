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
from routes.qr import qr_bp

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
app.register_blueprint(qr_bp)


# ================================
# ROOT REDIRECTION + ANALYTICS (PROFESSIONAL CLEAN URLS 🔥)
# ================================
import threading

def track_click_async(url_id, ip, os_name, browser, lat, lng):
    # This runs in a background thread
    location = "Unknown"
    city = "Unknown"
    region = "Unknown"

    if not lat or not lng:
        # Fallback to IP geolocation
        if ip not in ["127.0.0.1", "localhost", "::1"]:
            try:
                geo_resp = requests.get(f"http://ip-api.com/json/{ip}", timeout=2)
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    location = geo_data.get("country", "Unknown")
                    city = geo_data.get("city", "Unknown")
                    region = geo_data.get("regionName", "Unknown")
                    lat = geo_data.get("lat")
                    lng = geo_data.get("lon")
            except:
                pass
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
                    lat = geo.get("latitude")
                    lng = geo.get("longitude")
                except Exception as e:
                    print(f"Geo Error: {e}")
    else:
        # Reverse Geocoding to get actual Street, City, Country from GPS
        try:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}"
            headers = {'User-Agent': 'Ziplo-URL-Shortener/1.0'}
            rev_resp = requests.get(url, headers=headers, timeout=3)
            if rev_resp.status_code == 200:
                rev_data = rev_resp.json()
                address = rev_data.get("address", {})
                
                # Extract best available details
                location = address.get("country", "Unknown")
                region = address.get("state", address.get("region", "Unknown"))
                
                # Get city or closest match
                city_name = address.get("city", address.get("town", address.get("village", address.get("suburb", "Unknown"))))
                
                # Get street or road
                road = address.get("road", "")
                
                if road and city_name != "Unknown":
                    city = f"{road}, {city_name}"
                else:
                    city = city_name
            else:
                city = "Precise Location (GPS)"
        except Exception as e:
            print(f"Reverse Geo Error: {e}")
            city = "Precise Location (GPS)"

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO clicks (url_id, ip_address, location, city, region, os, browser, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (url_id, ip, location, city, region, os_name, browser, lat, lng)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Async tracking error: {e}")

@app.route("/<short_code>", methods=["GET", "POST"])
def redirect_url(short_code):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, original_url, status, expires_at, password FROM urls WHERE short_code = %s",
            (short_code,)
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()

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

        from flask import render_template
        if request.method == "GET":
            return render_template("tracking_prompt.html", short_code=short_code, password_required=bool(password_hash), error=None)

        if request.method == "POST":
            # Check Password
            if password_hash:
                from werkzeug.security import check_password_hash
                submitted_password = request.form.get("password")
                if not submitted_password or not check_password_hash(password_hash, submitted_password):
                    return render_template("tracking_prompt.html", short_code=short_code, password_required=True, error="Incorrect password")

            # Extract Tracking Info
            lat = request.form.get("lat")
            lng = request.form.get("lng")
            if lat == "null" or lat == "": lat = None
            if lng == "null" or lng == "": lng = None

            ip_header = request.headers.get("X-Forwarded-For", request.remote_addr)
            ip = ip_header.split(',')[0].strip() if ip_header else "127.0.0.1"
            
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

            # Start background thread for tracking
            threading.Thread(target=track_click_async, args=(url_id, ip, os_name, browser, lat, lng)).start()

            return redirect(original_url)

    except Exception as e:
        return jsonify({"error": str(e)}), 400




# Run server
if __name__ == "__main__":
    app.run(debug=True)