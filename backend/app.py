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
@app.route("/<short_code>", methods=["GET"])
def redirect_url(short_code):
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    # 🔹 Safe geolocation
    try:
        geo = requests.get(
            f"https://ipapi.co/{ip}/json/",
            timeout=2
        ).json()
        location = geo.get("country_name", "Unknown")
    except:
        location = "Unknown"

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, original_url, status FROM urls WHERE short_code = %s",
            (short_code,)
        )

        row = cursor.fetchone()

        if not row:
            return "Short URL not found", 404

        url_id = row[0]
        original_url = row[1]
        status = row[2]
        
        if status != "active":
            return "This URL is not active", 403

        # 🔥 Log click
        cursor.execute(
            "INSERT INTO clicks (url_id, ip_address, location) VALUES (%s, %s, %s)",
            (url_id, ip, location)
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