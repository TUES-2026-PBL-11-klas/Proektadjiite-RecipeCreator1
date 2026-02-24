import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.recipe_service import (
    get_user_recipes,
    get_recipe,
    create_recipe,
    rename_recipe,
    delete_recipe,
)
from sqlalchemy import func
from services.ai_service import (
    generate_recipe_from_ingredients,
    generate_recipe_ai_enhanced,
)
from models import Pantry, Product
from database import db

logger = logging.getLogger(__name__)
recipes_bp = Blueprint("recipes", __name__)


def _collect_pantry_items(user_id, product_ids):
    pantry_rows = (
        Pantry.query
        .filter(Pantry.user_id == user_id, Pantry.product_id.in_(product_ids))
        .all()
    )
    found_ids = {str(row.product_id) for row in pantry_rows}
    missing = [pid for pid in product_ids if pid not in found_ids]
    if missing:
        return None, missing

    selected_items = []
    for row in pantry_rows:
        product = db.session.get(Product, row.product_id)
        selected_items.append({
            "product_id": str(row.product_id),
            "product_name": product.name,
            "available_quantity": row.quantity,
            "unit": product.unit,
        })
    return selected_items, []

@recipes_bp.route("/generate/pantry-only", methods=["POST"])
@jwt_required()
def generate_pantry_only():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("product_ids"):
        return jsonify({"error": "product_ids (non-empty list) is required"}), 400

    selected_items, missing = _collect_pantry_items(user_id, data["product_ids"])
    if missing:
        return jsonify({"error": "Some product_ids are not in your pantry", "missing": missing}), 404

    try:
        ai_recipe = generate_recipe_from_ingredients(selected_items, preferences=data.get("preferences"))
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.error(f"AI pantry-only generation error: {e}")
        return jsonify({"error": f"AI generation failed: {e}"}), 502

    try:
        recipe = create_recipe(user_id, ai_recipe)
        return jsonify(recipe), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Save pantry-only recipe error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@recipes_bp.route("/generate/ai-enhanced", methods=["POST"])
@jwt_required()
def generate_ai_enhanced_recipe():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("product_ids"):
        return jsonify({"error": "product_ids (non-empty list) is required"}), 400

    selected_items, missing = _collect_pantry_items(user_id, data["product_ids"])
    if missing:
        return jsonify({"error": "Some product_ids are not in your pantry", "missing": missing}), 404

    try:
        ai_recipe = generate_recipe_ai_enhanced(selected_items, preferences=data.get("preferences"))
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.error(f"AI enhanced generation error: {e}")
        return jsonify({"error": f"AI generation failed: {e}"}), 502

    # Resolve extra ingredients: find by name in catalog or auto-create
    extra_ingredients_added = []
    resolved_extras = []
    for extra in ai_recipe.get("extra_ingredients", []):
        name = extra.get("name", "").strip()
        unit = extra.get("unit", "unit").strip()
        quantity = extra.get("quantity", 1)
        if not name:
            continue
        existing = Product.query.filter(func.lower(Product.name) == name.lower()).first()
        if existing:
            prod_id = str(existing.id)
        else:
            new_product = Product(name=name, unit=unit)
            db.session.add(new_product)
            db.session.flush()  # obtain new_product.id before committing
            prod_id = str(new_product.id)
            extra_ingredients_added.append({"name": name, "unit": unit, "id": prod_id})
        resolved_extras.append({"product_id": prod_id, "quantity": quantity})

    # Merge pantry ingredients with resolved extras into a unified list
    all_ingredients = ai_recipe.get("pantry_ingredients", []) + resolved_extras
    recipe_data = {
        "title": ai_recipe["title"],
        "description": ai_recipe["description"],
        "difficulty_level": ai_recipe["difficulty_level"],
        "prep_time_minutes": ai_recipe["prep_time_minutes"],
        "instructions": ai_recipe["instructions"],
        "ingredients": all_ingredients,
        "calories": ai_recipe.get("calories"),
        "protein": ai_recipe.get("protein"),
        "carbs": ai_recipe.get("carbs"),
        "fat": ai_recipe.get("fat"),
    }

    try:
        recipe = create_recipe(user_id, recipe_data)
        response = dict(recipe)
        if extra_ingredients_added:
            response["extra_ingredients_added"] = extra_ingredients_added
        return jsonify(response), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Save ai-enhanced recipe error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@recipes_bp.route("/", methods=["GET"])
@jwt_required()
def list_recipes():
    user_id = get_jwt_identity()
    search = request.args.get("search")
    max_prep_time = request.args.get("max_prep_time", type=int)

    recipes = get_user_recipes(user_id, search=search, max_prep_time=max_prep_time)
    return jsonify(recipes), 200


@recipes_bp.route("/<recipe_id>", methods=["GET"])
@jwt_required()
def get(recipe_id):
    """GET /api/recipes/<recipe_id> — returns the recipe if owned by the current user."""
    user_id = get_jwt_identity()
    recipe = get_recipe(recipe_id, user_id)
    if recipe is None:
        return jsonify({"error": "Recipe not found"}), 404
    return jsonify(recipe), 200


@recipes_bp.route("/<recipe_id>", methods=["PUT"])
@jwt_required()
def update(recipe_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("title"):
        return jsonify({"error": "'title' is required"}), 400

    try:
        recipe = rename_recipe(recipe_id, user_id, data["title"])
        if recipe is None:
            return jsonify({"error": "Recipe not found"}), 404
        return jsonify(recipe), 200
    except Exception as e:
        logger.error(f"Rename recipe error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@recipes_bp.route("/<recipe_id>", methods=["DELETE"])
@jwt_required()
def delete(recipe_id):
    user_id = get_jwt_identity()
    deleted = delete_recipe(recipe_id, user_id)
    if not deleted:
        return jsonify({"error": "Recipe not found"}), 404
    return "", 204
