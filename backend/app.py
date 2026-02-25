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

# Configure CORS with explicit settings
CORS(
    app,
    origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
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
    logger.info("🚀 Starting Recipe Creator API on http://localhost:5000")
    logger.info("=" * 80)
    app.run(debug=True, port=5000)
