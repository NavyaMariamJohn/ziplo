import jwt
from flask import request, jsonify, current_app


def get_user_from_token():

    auth_header = request.headers.get("Authorization")

    # Check if token exists
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, jsonify({"error": "Token missing or invalid"}), 401

    try:
        # Extract token
        token = auth_header.split(" ")[1]

        # Decode JWT
        decoded = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=["HS256"]
        )

        user_id = decoded.get("user_id")

        if not user_id:
            return None, jsonify({"error": "Invalid token payload"}), 401

        return user_id, None, None

    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401

    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401

    except Exception as e:
        return None, jsonify({"error": str(e)}), 400

def is_admin(user_id):
    from config import get_db_connection

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT role FROM users WHERE id = %s",
        (user_id,)
    )

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row and row[0] == "admin":
        return True

    return False