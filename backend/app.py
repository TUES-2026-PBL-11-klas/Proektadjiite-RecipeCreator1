from flask import Flask, jsonify
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

CORS(app)
db.init_app(app)
JWTManager(app)

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
    app.run(debug=True, port=5000)
