from flask import Blueprint, jsonify, request
from config import get_db_connection
from utils.jwt_helper import get_user_from_token, is_admin

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ================================
# 🔒 MIDDLEWARE-LIKE HELPER
# ================================
def admin_required():
    user_id, error, status = get_user_from_token()
    if error:
        return None, error, status
    if not is_admin(user_id):
        return None, jsonify({"error": "Admin access required"}), 403
    return user_id, None, None

# ================================
# 📊 GET USER STATS
# ================================
@admin_bp.route('/user-stats', methods=['GET'])
def get_user_stats():
    _, error, status = admin_required()
    if error: return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
              COUNT(*) AS total_users,
              COUNT(*) FILTER (WHERE is_active = true) AS active_users,
              COUNT(*) FILTER (WHERE is_active = false) AS suspended_users,
              COUNT(*) FILTER (WHERE role = 'admin') AS admin_users,
              COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS new_users
            FROM users;
        """)

        stats = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify({
            "total_users": stats[0],
            "active_users": stats[1],
            "suspended_users": stats[2],
            "admin_users": stats[3],
            "new_users": stats[4]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================
# 📈 GET SIGNUP TREND (Last 7 Days)
# ================================
@admin_bp.route('/signup-trend', methods=['GET'])
def get_signup_trend():
    _, error, status = admin_required()
    if error: return error, status

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Returns count per day for last 7 days
        cur.execute("""
            SELECT 
                DATE(created_at) as day, 
                COUNT(*) as count
            FROM users
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY day
            ORDER BY day ASC;
        """)

        rows = cur.fetchall()
        trend = [{"date": str(row[0]), "count": row[1]} for row in rows]

        cur.close()
        conn.close()
        return jsonify(trend), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================
# 👥 GET ALL USERS (WITH FILTERS & PAGINATION)
# ================================
@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    _, error, status = admin_required()
    if error: return error, status

    search = request.args.get('search', '').strip()
    role = request.args.get('role', 'all')
    status_filter = request.args.get('status', 'all')
    page = int(request.args.get('page', 1))
    per_page = 10
    offset = (page - 1) * per_page

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # 🔹 Build Query Conditions
        conditions = ["1=1"]
        params = []

        if search:
            conditions.append("(u.username ILIKE %s OR u.email ILIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])

        if role != 'all':
            conditions.append("u.role = %s")
            params.append(role)

        if status_filter != 'all':
            is_active = (status_filter == 'active')
            conditions.append("u.is_active = %s")
            params.append(is_active)

        where_clause = " AND ".join(conditions)

        # 🔹 Get Total Count (before pagination)
        count_query = f"SELECT COUNT(*) FROM users u WHERE {where_clause}"
        cur.execute(count_query, params)
        total = cur.fetchone()[0]

        # 🔹 Apply Pagination & Sorting
        query = f"""
            SELECT 
                u.id, u.username, u.email, u.role, u.created_at, u.last_login, u.is_active,
                COUNT(urls.id) as links_count
            FROM users u
            LEFT JOIN urls ON u.id = urls.user_id
            WHERE {where_clause}
            GROUP BY u.id
            ORDER BY u.created_at DESC LIMIT %s OFFSET %s
        """
        
        query_params = params + [per_page, offset]
        
        cur.execute(query, query_params)
        rows = cur.fetchall()
        
        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "created_at": str(row[4]),
                "last_login": str(row[5]) if row[5] else None,
                "is_active": row[6],
                "linksCount": row[7]
            })

        cur.close()
        conn.close()

        return jsonify({
            "users": users,
            "total": total
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================
# 🔗 GET ALL LINKS
# ================================
@admin_bp.route('/links', methods=['GET'])
def get_all_links():
    _, error, status = admin_required()
    if error: return error, status

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT 
                urls.id,
                urls.original_url,
                urls.short_code,
                urls.status,
                users.email
            FROM urls
            LEFT JOIN users ON urls.user_id = users.id
            ORDER BY urls.created_at DESC
        """)

        rows = cur.fetchall()

        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "original_url": row[1],
                "short_code": row[2],
                "status": row[3],
                "email": row[4] if row[4] else "Guest"
            })

        cur.close()
        conn.close()

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================
# 👤 DEACTIVATE USER
# ================================
@admin_bp.route('/users/<int:user_id>/deactivate', methods=['PUT'])
def deactivate_user(user_id):
    _, error, status = admin_required()
    if error: return error, status

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE users
            SET is_active = FALSE
            WHERE id = %s
        """, (user_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "User deactivated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================
# 👤 DELETE USER
# ================================
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    _, error, status = admin_required()
    if error: return error, status

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # 1️⃣ delete clicks of user's URLs
        cur.execute("""
            DELETE FROM clicks
            WHERE url_id IN (
                SELECT id FROM urls WHERE user_id = %s
            )
        """, (user_id,))

        # 2️⃣ delete user's URLs
        cur.execute("DELETE FROM urls WHERE user_id = %s", (user_id,))

        # 3️⃣ delete user
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))

        conn.commit()

        return jsonify({"message": "User and all related data deleted"}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()

# ================================
# 🔗 DISABLE LINK
# ================================
@admin_bp.route('/links/<int:link_id>/disable', methods=['PUT'])
def disable_link(link_id):
    _, error, status = admin_required()
    if error: return error, status

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE urls
            SET status = 'disabled'
            WHERE id = %s
        """, (link_id,))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Link disabled"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
