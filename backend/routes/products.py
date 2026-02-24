import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.product_service import (
    list_products,
    get_product,
    create_product,
    update_product,
    delete_product,
)

logger = logging.getLogger(__name__)
products_bp = Blueprint("products", __name__)


@products_bp.route("/", methods=["GET"])
def list_all():
    search = request.args.get("search")
    products = list_products(search=search)
    return jsonify(products), 200


@products_bp.route("/<product_id>", methods=["GET"])
def get_one(product_id):
    product = get_product(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product), 200


@products_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    data = request.get_json()

    if not data or not all(k in data for k in ("name", "unit")):
        return jsonify({"error": "name and unit are required"}), 400

    try:
        product = create_product(data["name"].strip(), data["unit"].strip())
        return jsonify(product), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        logger.error(f"Create product error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@products_bp.route("/<product_id>", methods=["PUT"])
@jwt_required()
def update(product_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    if not any(k in data for k in ("name", "unit")):
        return jsonify({"error": "At least one of name or unit is required"}), 400

    try:
        product = update_product(product_id, data)
        if product is None:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        logger.error(f"Update product error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@products_bp.route("/<product_id>", methods=["DELETE"])
@jwt_required()
def delete(product_id):
    deleted = delete_product(product_id)
    if not deleted:
        return jsonify({"error": "Product not found"}), 404
    return "", 204
