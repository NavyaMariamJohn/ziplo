from flask import Blueprint, request, jsonify, redirect
import requests
from config import get_db_connection
from utils.jwt_helper import get_user_from_token, is_admin
from utils.shortener import generate_short_code

url_bp = Blueprint("url", __name__, url_prefix="/api")


# ================================
# CREATE SHORT URL
# ================================
@url_bp.route("/create-url", methods=["POST"])
def create_url():

    # Allow guest users (optional auth)
    user_id, error, status = get_user_from_token()
    if error:
        user_id = None

    data = request.get_json()
    if not data or "original_url" not in data:
        return jsonify({"error": "Original URL is required"}), 400

    original_url = data["original_url"]
    custom_code = data.get("custom_code")

    if not original_url.startswith("http://") and not original_url.startswith("https://"):
        return jsonify({"error": "Invalid URL. Must start with http:// or https://"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔹 Handle Custom Code vs Random
        if custom_code:
            # Validate custom_code (alphanumeric only)
            if not custom_code.isalnum():
                return jsonify({"error": "Custom code must be alphanumeric"}), 400
            
            # Check if custom code is already in use
            cursor.execute("SELECT id FROM urls WHERE short_code = %s", (custom_code,))
            if cursor.fetchone():
                return jsonify({"error": "Custom alias already in use"}), 400
            
            short_code = custom_code
        else:
            # 🔹 Check if already exists (only for random generation)
            if user_id:
                cursor.execute(
                    "SELECT short_code FROM urls WHERE user_id = %s AND original_url = %s",
                    (user_id, original_url)
                )
            else:
                cursor.execute(
                    "SELECT short_code FROM urls WHERE user_id IS NULL AND original_url = %s",
                    (original_url,)
                )

            row = cursor.fetchone()
            if row:
                return jsonify({
                    "message": "URL already shortened",
                    "short_code": row[0]
                }), 200

            # 🔹 Generate unique random short code
            while True:
                short_code = generate_short_code()
                cursor.execute(
                    "SELECT id FROM urls WHERE short_code = %s",
                    (short_code,)
                )
                if not cursor.fetchone():
                    break

        # 🔹 Insert URL
        cursor.execute(
            "INSERT INTO urls (user_id, original_url, short_code) VALUES (%s, %s, %s)",
            (user_id, original_url, short_code)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Short URL created successfully",
            "short_code": short_code
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================================
# GET USER URLS (FIXED 🔥)
# ================================
@url_bp.route("/user-urls", methods=["GET"])
def get_user_urls():

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                u.id,
                u.original_url,
                u.short_code,
                u.created_at,
                u.status,
                COUNT(c.id) AS click_count
            FROM urls u
            LEFT JOIN clicks c ON u.id = c.url_id
            WHERE u.user_id = %s
            GROUP BY u.id, u.original_url, u.short_code, u.created_at, u.status
            ORDER BY u.id DESC
        """, (user_id,))

        rows = cursor.fetchall()

        urls = []
        for row in rows:
            urls.append({
                "id": row[0],
                "original_url": row[1],
                "short_code": row[2],
                "created_at": row[3],
                "status": row[4],
                "click_count": row[5]
            })

        cursor.close()
        conn.close()

        return jsonify(urls), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================================
# DELETE URL
# ================================
@url_bp.route("/delete-url/<int:url_id>", methods=["DELETE"])
def delete_url(url_id):

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔹 Verify ownership
        cursor.execute(
            "SELECT id FROM urls WHERE id = %s AND user_id = %s",
            (url_id, user_id)
        )

        if not cursor.fetchone():
            return jsonify({"error": "URL not found or unauthorized"}), 404

        # 🔥 Delete clicks first
        cursor.execute(
            "DELETE FROM clicks WHERE url_id = %s",
            (url_id,)
        )

        # 🔥 Delete URL
        cursor.execute(
            "DELETE FROM urls WHERE id = %s",
            (url_id,)
        )

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "URL deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================================
# ADMIN: GET ALL URLS
# ================================
@url_bp.route("/admin/urls", methods=["GET"])
def get_all_urls():

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    if not is_admin(user_id):
        return jsonify({"error": "Admin access required"}), 403

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                u.id,
                u.original_url,
                u.short_code,
                u.status,
                users.username,
                COUNT(c.id) AS click_count,
                MIN(u.created_at) AS created_at
            FROM urls u
            LEFT JOIN users ON u.user_id = users.id
            LEFT JOIN clicks c ON u.id = c.url_id
            GROUP BY u.id, users.username
        """)

        rows = cursor.fetchall()

        urls = []
        for row in rows:
            urls.append({
                "id": row[0],
                "original_url": row[1],
                "short_code": row[2],
                "status": row[3],
                "created_by": row[4],
                "click_count": row[5],
                "created_at": str(row[6]) if len(row) > 6 else None
            })

        cursor.close()
        conn.close()

        return jsonify(urls), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ================================
# UPDATE LINK STATUS
# ================================
@url_bp.route("/links/<int:url_id>/status", methods=["PATCH"])
def update_link_status(url_id):

    user_id, error, status_code = get_user_from_token()
    if error:
        return error, status_code

    data = request.get_json()
    new_status = data.get("status")

    # ✅ Validate
    if new_status not in ["active", "paused", "disabled"]:
        return jsonify({"error": "Invalid status"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔐 Ownership check
        cursor.execute(
            "SELECT id FROM urls WHERE id = %s AND user_id = %s",
            (url_id, user_id)
        )

        if not cursor.fetchone():
            return jsonify({"error": "Unauthorized"}), 403

        # 🔄 Update
        cursor.execute(
            "UPDATE urls SET status = %s WHERE id = %s RETURNING id, original_url, short_code, status",
            (new_status, url_id)
        )

        updated = cursor.fetchone()

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "id": updated[0],
            "original_url": updated[1],
            "short_code": updated[2],
            "status": updated[3]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ================================
# USER STATS
# ================================
@url_bp.route("/stats", methods=["GET"])
def get_stats():

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔹 Total clicks
        cursor.execute("""
            SELECT COUNT(c.id)
            FROM clicks c
            JOIN urls u ON c.url_id = u.id
            WHERE u.user_id = %s
        """, (user_id,))
        total_clicks = cursor.fetchone()[0]

        # 🔹 Total links
        cursor.execute("""
            SELECT COUNT(*)
            FROM urls
            WHERE user_id = %s
        """, (user_id,))
        total_links = cursor.fetchone()[0]

        # 🔹 Active links
        cursor.execute("""
            SELECT COUNT(*)
            FROM urls
            WHERE user_id = %s AND status = 'active'
        """, (user_id,))
        active_links = cursor.fetchone()[0]

        # 🔹 Clicks per link
        cursor.execute("""
            SELECT 
                u.short_code,
                COUNT(c.id) as clicks
            FROM urls u
            LEFT JOIN clicks c ON u.id = c.url_id
            WHERE u.user_id = %s
            GROUP BY u.id
            ORDER BY clicks DESC
            LIMIT 5
        """, (user_id,))

        top_links = [
            {"short_code": row[0], "clicks": row[1]}
            for row in cursor.fetchall()
        ]

        cursor.close()
        conn.close()

        return jsonify({
            "total_clicks": total_clicks,
            "total_links": total_links,
            "active_links": active_links,
            "top_links": top_links
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ================================
# REDIRECT + ANALYTICS (RESTORED 🔥)
# ================================
@url_bp.route("/<short_code>", methods=["GET"])
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
