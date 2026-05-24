from flask import Blueprint, request, send_file
import qrcode
import io

qr_bp = Blueprint("qr", __name__)

@qr_bp.route("/generate-qr")
def generate_qr():
    url = request.args.get("url")

    if not url:
        return {"error": "URL required"}, 400

    # Generate QR
    img = qrcode.make(url)

    # Convert to bytes
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return send_file(buffer, mimetype="image/png")
