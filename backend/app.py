import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import db
import models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# Disable strict slash enforcement that causes 308 redirects
app.url_map.strict_slashes = False


def _parse_cors_origins(raw: str | None) -> list[str]:
    """
    Parse a comma‑separated list of origins from the CORS_ORIGINS
    environment variable. Falls back to common localhost variants when
    unset so local development "just works".
    """
    if not raw:
        return [
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]

    parts = [origin.strip() for origin in raw.split(",")]
    return [origin for origin in parts if origin]


cors_origins = _parse_cors_origins(os.getenv("CORS_ORIGINS"))

CORS(
    app,
    resources={r"/api/*": {"origins": cors_origins}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True,
)

db.init_app(app)
JWTManager(app)

# ─── Debugging Hooks ──────────────────────────────────────────────────────────

@app.before_request
def log_request():
    logger.info(f"📨 {request.method} {request.path} - Origin: {request.headers.get('Origin', 'N/A')}")

# Register blueprints
from routes.auth import auth_bp
from routes.recipes import recipes_bp
from routes.pantry import pantry_bp
from routes.products import products_bp

app.register_blueprint(auth_bp,     url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(recipes_bp,  url_prefix="/api/recipes")
app.register_blueprint(pantry_bp,   url_prefix="/api/pantry")

try:
    with app.app_context():
        db.create_all()
        logger.info("✓ Database tables created successfully")
except Exception as e:
    logger.error(f"✗ Database connection failed: {e}")
    logger.info("Continuing without database... Check your network/Supabase credentials")


@app.route("/")
def home():
    return jsonify({"message": "Recipe Creator API running"})


if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("🚀 Starting Recipe Creator API on http://localhost:5001")
    logger.info("=" * 80)
    # Bind to all interfaces for network access (e.g. when frontend is
    # visited via the local network IP). Flask defaults to 127.0.0.1 which
    # would make the API unreachable from other machines.
    app.run(host="0.0.0.0", debug=True, port=5001)
