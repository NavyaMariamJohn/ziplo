from flask import Blueprint, request, jsonify, current_app
from config import get_db_connection
from utils.jwt_helper import get_user_from_token, is_admin
import bcrypt
import jwt
import datetime
from flask_mail import Message
from time import time

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

last_request_time = {}
# ===============================
# REGISTER
# ===============================
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data or "username" not in data or "email" not in data or "password" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    username = data["username"]
    email = data["email"]
    password = data["password"]

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING id",
            (username, email, hashed_password.decode('utf-8'), 'user')
        )
        user_id = cursor.fetchone()[0]

        conn.commit()

        # 🔥 GENERATE TOKEN (same as login)
        token = jwt.encode({
            "user_id": user_id,
            "role": "user",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        if isinstance(token, bytes):
            token = token.decode("utf-8")

        cursor.close()
        conn.close()

        return jsonify({
            "message": "User registered successfully!",
            "token": token,
            "username": username,
            "email": email,
            "role": "user"
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400
# ===============================
# LOGIN  🔥 SECURE FIXED
# ===============================
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Missing email or password"}), 400

    email = data["email"]
    password = data["password"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # ✅ include role
        cursor.execute(
            "SELECT id, username, email, password_hash, role FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            user_id = user[0]
            username = user[1]
            user_email = user[2]
            stored_password = user[3]
            role = user[4]

            if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):

                # 🔥 FIX: include role in token
                token = jwt.encode({
                    "user_id": user_id,
                    "role": role,   # ✅ VERY IMPORTANT
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
                }, current_app.config['SECRET_KEY'], algorithm="HS256")

                if isinstance(token, bytes):
                    token = token.decode("utf-8")

                return jsonify({
                    "message": "Login successful!",
                    "token": token,
                    "username": username,
                    "email": user_email,
                    "role": role
                }), 200

        return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@auth_bp.route("/change-password", methods=["PUT"])
def change_password():

    # 🔐 Get user from token (your existing system)
    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        return jsonify({"error": "All fields required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔹 Fetch current password
        cursor.execute(
            "SELECT password_hash FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        stored_password = user[0]

        # 🔹 Verify current password (bcrypt)
        if not bcrypt.checkpw(
            current_password.encode("utf-8"),
            stored_password.encode("utf-8")
        ):
            return jsonify({"error": "Incorrect current password"}), 400

        # 🔹 Hash new password
        new_hashed = bcrypt.hashpw(
            new_password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # 🔹 Update password
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (new_hashed, user_id)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ===============================
# DELETE ACCOUNT
# ===============================
@auth_bp.route("/delete-account", methods=["DELETE"])
def delete_account():

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔥 delete clicks first (using correct column)
        cursor.execute(
            "DELETE FROM clicks WHERE url_id IN (SELECT id FROM urls WHERE user_id = %s)",
            (user_id,)
        )

        # 🔥 delete urls
        cursor.execute(
            "DELETE FROM urls WHERE user_id = %s",
            (user_id,)
        )

        # 🔥 delete user
        cursor.execute(
            "DELETE FROM users WHERE id = %s",
            (user_id,)
        )

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        print("DELETE ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
    

# ===============================
# FORGOT PASSWORD
# ===============================
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        current_time = time()

        if email in last_request_time:
            if current_time - last_request_time[email] < 900:
                return jsonify({"error": "Wait 15 minutes"}), 429

        last_request_time[email] = current_time

        token = jwt.encode({
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        reset_link = f"http://localhost:5173/reset-password/{token}"

        msg = Message(
            "Password Reset",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email]
        )

        msg.html = f"""
        <h3>Password Reset</h3>
        <p>Click below:</p>
        <a href="{reset_link}">Reset Password</a>
        """

        current_app.extensions['mail'].send(msg)

        return jsonify({"message": "Reset link sent"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===============================
# RESET PASSWORD
# ===============================
@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    try:
        data = request.get_json()
        new_password = data.get("password")

        decoded = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=["HS256"]
        )

        email = decoded.get("email")

        hashed_password = bcrypt.hashpw(
            new_password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE email = %s",
            (hashed_password, email)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Password reset successful"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 400

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500