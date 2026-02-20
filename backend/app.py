from flask import Flask, jsonify
from flask_cors import CORS
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

@app.route("/api/health")
def health():
    try:
        db.session.execute("SELECT 1")
        return jsonify({"status": "healthy", "database": "connected"})
    except:
        return jsonify({"status": "healthy", "database": "disconnected"}), 503

if __name__ == "__main__":
    app.run(debug=True, port=5000)