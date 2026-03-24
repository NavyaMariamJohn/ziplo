from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
import os
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
CORS(app, resources={r"/*": {"origins": "*"}})

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


# Run server
if __name__ == "__main__":
    app.run(debug=True)