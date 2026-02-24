import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.pantry_service import (
    get_pantry,
    add_to_pantry,
    update_pantry_item,
    remove_from_pantry,
)

logger = logging.getLogger(__name__)
pantry_bp = Blueprint("pantry", __name__)


@pantry_bp.route("/", methods=["GET"])
@jwt_required()
def list_items():
    user_id = get_jwt_identity()
    items = get_pantry(user_id)
    return jsonify(items), 200


@pantry_bp.route("/", methods=["POST"])
@jwt_required()
def add_item():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not all(k in data for k in ("product_id", "quantity")):
        return jsonify({"error": "product_id and quantity are required"}), 400

    try:
        item = add_to_pantry(user_id, data["product_id"], data["quantity"])
        return jsonify(item), 201
    except ValueError as e:
        error_msg = str(e)
        status = 409 if "already in pantry" in error_msg else 404
        return jsonify({"error": error_msg}), status
    except Exception as e:
        logger.error(f"Add to pantry error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@pantry_bp.route("/<product_id>", methods=["PUT"])
@jwt_required()
def update_item(product_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or "quantity" not in data:
        return jsonify({"error": "quantity is required"}), 400

    item = update_pantry_item(user_id, product_id, data["quantity"])
    if item is None:
        return jsonify({"error": "Item not found in pantry"}), 404
    return jsonify(item), 200


@pantry_bp.route("/<product_id>", methods=["DELETE"])
@jwt_required()
def remove_item(product_id):
    user_id = get_jwt_identity()
    removed = remove_from_pantry(user_id, product_id)
    if not removed:
        return jsonify({"error": "Item not found in pantry"}), 404
    return "", 204
