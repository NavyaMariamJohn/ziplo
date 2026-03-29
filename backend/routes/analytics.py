from flask import Blueprint, jsonify
from flask import request 
from datetime import datetime, timedelta
from config import get_db_connection
from utils.jwt_helper import get_user_from_token, is_admin

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api")


# ================================
# GET ANALYTICS FOR A SHORT URL
# ================================
@analytics_bp.route("/analytics/<short_code>", methods=["GET"])
def get_analytics(short_code):

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔐 Get URL (ownership check)
        cursor.execute(
            "SELECT id, original_url FROM urls WHERE short_code = %s AND user_id = %s",
            (short_code, user_id)
        )

        url = cursor.fetchone()

        if not url:
            return jsonify({"error": "URL not found or unauthorized"}), 404

        url_id, original_url = url

        # ================================
        # 📊 TOTAL CLICKS
        # ================================
        cursor.execute("SELECT COUNT(*) FROM clicks WHERE url_id = %s", (url_id,))
        total_clicks = cursor.fetchone()[0]

        # ================================
        # 📅 TODAY CLICKS
        # ================================
        cursor.execute("""
            SELECT COUNT(*) 
            FROM clicks 
            WHERE url_id = %s 
            AND DATE(timestamp) = CURRENT_DATE
        """, (url_id,))
        today_clicks = cursor.fetchone()[0]

        # ================================
        # 📆 WEEK CLICKS
        # ================================
        cursor.execute("""
            SELECT COUNT(*) 
            FROM clicks 
            WHERE url_id = %s 
            AND timestamp >= NOW() - INTERVAL '7 days'
        """, (url_id,))
        week_clicks = cursor.fetchone()[0]

        # ================================
        # 👤 UNIQUE CLICKS
        # ================================
        cursor.execute("""
            SELECT COUNT(DISTINCT ip_address)
            FROM clicks 
            WHERE url_id = %s
        """, (url_id,))
        unique_clicks = cursor.fetchone()[0]

        # ================================
        # 📋 CLICK DETAILS
        # ================================
        cursor.execute("""
            SELECT ip_address, location, city, region, timestamp 
            FROM clicks 
            WHERE url_id = %s 
            ORDER BY timestamp DESC
        """, (url_id,))

        rows = cursor.fetchall()

        click_details = []
        for row in rows:
            country = row[1] or "Unknown"
            city = row[2] or "Unknown"
            region = row[3] or "Unknown"
            
            loc_parts = []
            if city != "Unknown" and city != "Local Test": loc_parts.append(city)
            if region != "Unknown" and region != "Local Test": loc_parts.append(region)
            if country != "Unknown" and country != "Local Test": loc_parts.append(country)
            
            full_location = ", ".join(loc_parts) if loc_parts else country
            if not full_location: full_location = "Unknown"
            if full_location == "Local Test": full_location = "Local Test"

            click_details.append({
                "ip": row[0],
                "location": full_location,
                "timestamp": row[4].isoformat() + "Z" if hasattr(row[4], "isoformat") else str(row[4])
            })

        # ================================
        # 📈 CLICK TREND (FIXED POSITION)
        # ================================
        cursor.execute("""
            SELECT DATE(timestamp) as day, COUNT(*) 
            FROM clicks
            WHERE url_id = %s
            AND timestamp >= NOW() - INTERVAL '7 days'
            GROUP BY day
            ORDER BY day ASC
        """, (url_id,))

        trend_rows = cursor.fetchall()

        click_trend = [
            {
                "date": row[0].isoformat() if hasattr(row[0], "isoformat") else str(row[0]),
                "clicks": row[1]
            }
            for row in trend_rows
        ]

        cursor.close()
        conn.close()

        # ================================
        # 🚀 FINAL RESPONSE
        # ================================
        return jsonify({
            "short_code": short_code,
            "original_url": original_url,
            "total_clicks": total_clicks,
            "today_clicks": today_clicks,
            "week_clicks": week_clicks,
            "unique_clicks": unique_clicks,
            "click_details": click_details,
            "click_trend": click_trend  # ✅ FIXED
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
# ================================
# COUNTRY / LOCATION STATS
# ================================
@analytics_bp.route("/location-clicks/<short_code>", methods=["GET"])
def location_clicks(short_code):

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 🔐 Get URL ID
        cursor.execute(
            "SELECT id FROM urls WHERE short_code = %s AND user_id = %s",
            (short_code, user_id)
        )

        url = cursor.fetchone()

        if not url:
            return jsonify({"error": "URL not found"}), 404

        url_id = url[0]

        # 🔥 FILTERED QUERY (THIS WAS MISSING)
        cursor.execute("""
            SELECT city, region, location, COUNT(*) 
            FROM clicks 
            WHERE url_id = %s
            GROUP BY city, region, location
        """, (url_id,))

        rows = cursor.fetchall()

        data = []
        for row in rows:
            city = row[0] or "Unknown"
            region = row[1] or "Unknown"
            country = row[2] or "Unknown"
            
            loc_parts = []
            if city != "Unknown" and city != "Local Test": loc_parts.append(city)
            if region != "Unknown" and region != "Local Test": loc_parts.append(region)
            if country != "Unknown" and country != "Local Test": loc_parts.append(country)
            
            full_location = ", ".join(loc_parts) if loc_parts else country
            if not full_location: full_location = "Unknown"
            if full_location == "Local Test": full_location = "Local Test"
            
            data.append({
                "location": full_location,
                "clicks": row[3]
            })

        cursor.close()
        conn.close()

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
# ================================
# OS STATS
# ================================
@analytics_bp.route("/os-clicks/<short_code>", methods=["GET"])
def os_clicks(short_code):
    user_id, error, status = get_user_from_token()
    if error: return error, status
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM urls WHERE short_code = %s AND user_id = %s", (short_code, user_id))
        url = cursor.fetchone()
        if not url: return jsonify({"error": "URL not found"}), 404
        url_id = url[0]
        cursor.execute("SELECT os, COUNT(*) FROM clicks WHERE url_id = %s GROUP BY os", (url_id,))
        rows = cursor.fetchall()
        data = [{"os": row[0] or "Unknown", "clicks": row[1]} for row in rows]
        cursor.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ================================
# BROWSER STATS
# ================================
@analytics_bp.route("/browser-clicks/<short_code>", methods=["GET"])
def browser_clicks(short_code):
    user_id, error, status = get_user_from_token()
    if error: return error, status
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM urls WHERE short_code = %s AND user_id = %s", (short_code, user_id))
        url = cursor.fetchone()
        if not url: return jsonify({"error": "URL not found"}), 404
        url_id = url[0]
        cursor.execute("SELECT browser, COUNT(*) FROM clicks WHERE url_id = %s GROUP BY browser", (url_id,))
        rows = cursor.fetchall()
        data = [{"browser": row[0] or "Unknown", "clicks": row[1]} for row in rows]
        cursor.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@analytics_bp.route("/admin/analytics", methods=["GET"])
def system_analytics():

    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    if not is_admin(user_id):
        return jsonify({"error": "Admin access required"}), 403

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Total URLs
        cursor.execute("SELECT COUNT(*) FROM urls")
        total_urls = cursor.fetchone()[0]

        # Total clicks
        cursor.execute("SELECT COUNT(*) FROM clicks")
        total_clicks = cursor.fetchone()[0]

        # Top URLs
        cursor.execute("""
            SELECT urls.short_code, COUNT(clicks.id) as clicks
            FROM urls
            LEFT JOIN clicks ON urls.id = clicks.url_id
            GROUP BY urls.short_code
            ORDER BY clicks DESC
            LIMIT 5
        """)

        rows = cursor.fetchall()

        top_urls = []
        for row in rows:
            top_urls.append({
                "short_code": row[0],
                "clicks": row[1]
            })

        cursor.close()
        conn.close()

        return jsonify({
            "total_urls": total_urls,
            "total_clicks": total_clicks,
            "top_urls": top_urls
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@analytics_bp.route("/analytics-overview", methods=["GET"])
def analytics_overview():

    # 🔐 AUTH (same as other routes)
    user_id, error, status = get_user_from_token()
    if error:
        return error, status

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # ================================
        # 📊 TOTAL CLICKS
        # ================================
        cursor.execute("""
            SELECT COUNT(*) 
            FROM clicks c
            JOIN urls u ON c.url_id = u.id
            WHERE u.user_id = %s
        """, (user_id,))
        total_clicks = cursor.fetchone()[0]

        # ================================
        # 👤 UNIQUE CLICKS
        # ================================
        cursor.execute("""
            SELECT COUNT(DISTINCT c.ip_address)
            FROM clicks c
            JOIN urls u ON c.url_id = u.id
            WHERE u.user_id = %s
        """, (user_id,))
        unique_clicks = cursor.fetchone()[0]

        # ================================
        # 🔝 TOP LINKS
        # ================================
        cursor.execute("""
            SELECT u.id, u.short_code, COUNT(c.id) as clicks
            FROM urls u
            LEFT JOIN clicks c ON u.id = c.url_id
            WHERE u.user_id = %s
            GROUP BY u.id
            ORDER BY clicks DESC
            LIMIT 5
        """, (user_id,))

        rows = cursor.fetchall()

        top_links = [
            {
                "id": row[0],
                "short_code": row[1],
                "click_count": row[2]
            }
            for row in rows
        ]

        top_link = top_links[0] if top_links else None

        # ================================
        # 📈 PERFECT TREND (LAST 7 DAYS)
        # ================================
        today = datetime.utcnow().date()
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]

        # get actual clicks per day
        cursor.execute("""
            SELECT DATE(c.timestamp) as day, COUNT(*)
            FROM clicks c
            JOIN urls u ON c.url_id = u.id
            WHERE u.user_id = %s
            AND c.timestamp >= NOW() - INTERVAL '7 days'
            GROUP BY day
        """, (user_id,))

        trend_rows = cursor.fetchall()

        trend_map = {str(row[0]): row[1] for row in trend_rows}

        # 🔥 fill missing days (IMPORTANT FIX)
        trend = []
        for d in days:
            key = str(d)
            trend.append({
                "date": key,  # Already a string ISO YYYY-MM-DD
                "clicks": trend_map.get(key, 0)
            })

        # ================================
        # 📊 AVG PER DAY
        # ================================
        avg_per_day = round(total_clicks / 7) if total_clicks else 0

        cursor.close()
        conn.close()

        # ================================
        # 🚀 FINAL RESPONSE
        # ================================
        return jsonify({
            "totalClicks": total_clicks,
            "uniqueClicks": unique_clicks,
            "avgPerDay": avg_per_day,
            "topLink": top_link,
            "topLinks": top_links,
            "trend": trend
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400