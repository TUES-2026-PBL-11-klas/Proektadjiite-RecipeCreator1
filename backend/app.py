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

# Configure CORS with explicit settings (include common dev ports)
# During development we allow any origin (the frontend may be accessed via
# localhost, 127.0.0.1 or a local network address such as 172.20.x.x).
# The previous hard‑coded list did not include the address shown in the
# browser console (`172.20.10.2:8080`), which caused the preflight OPTIONS
# request to be rejected with a 403 and meant login/signup could never
# reach the API. Using a wildcard here (and echoing back the Origin in
# after_request) ensures the request succeeds. In production you would
# tighten this up again or read from an environment variable.
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True,
    send_wildcard=False,
)

db.init_app(app)
JWTManager(app)

# ─── Debugging Hooks ──────────────────────────────────────────────────────────

@app.before_request
def log_request():
    logger.info(f"📨 {request.method} {request.path} - Origin: {request.headers.get('Origin', 'N/A')}")

@app.after_request
def after_request(response):
    # Ensure CORS headers are always present
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    logger.info(f"✓ Response: {response.status_code}")
    return response

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
