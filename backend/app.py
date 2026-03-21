from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes.url import url_bp
from routes.auth import auth_bp
from routes.analytics import analytics_bp

app = Flask(__name__)

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


# Run server
if __name__ == "__main__":
    app.run(debug=True)