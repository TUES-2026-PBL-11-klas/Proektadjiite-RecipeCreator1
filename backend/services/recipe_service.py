from models import Recipe, RecipeIngredient, Product
from database import db

VALID_DIFFICULTY_LEVELS = ("Easy", "Medium", "Hard")


def get_user_recipes(user_id: str, search: str = None, max_prep_time: int = None) -> list:
    """
    Returns all recipes belonging to user_id.
    Optionally filters by title substring (search) and max prep time.
    """
    query = Recipe.query.filter_by(user_id=user_id)

    if search:
        query = query.filter(Recipe.title.ilike(f"%{search}%"))

    if max_prep_time is not None:
        query = query.filter(Recipe.prep_time_minutes <= max_prep_time)

    return [recipe.serialize() for recipe in query.all()]


def get_recipe(recipe_id: str, user_id: str) -> dict | None:
    """
    Returns a single recipe by ID, only if it belongs to the given user.
    Returns None if not found or owned by another user.
    """
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first()
    if not recipe:
        return None
    return recipe.serialize()


def create_recipe(user_id: str, data: dict) -> dict:
    """
    Creates a recipe with its ingredients.
    Raises ValueError for invalid difficulty level or missing required fields.
    """
    # Normalise to title-case so "easy" / "EASY" / "Easy" all work
    difficulty = data.get("difficulty_level", "")
    difficulty = difficulty.strip().capitalize() if difficulty else difficulty
    if difficulty not in VALID_DIFFICULTY_LEVELS:
        raise ValueError(f"difficulty_level must be one of: {', '.join(VALID_DIFFICULTY_LEVELS)}")

    recipe = Recipe(
        user_id=user_id,
        title=data["title"],
        description=data.get("description"),
        instructions=data["instructions"],
        prep_time_minutes=data["prep_time_minutes"],
        difficulty_level=difficulty,
        image_url=data.get("image_url"),
        calories=data.get("calories"),
        protein=data.get("protein"),
        carbs=data.get("carbs"),
        fat=data.get("fat"),
    )
    db.session.add(recipe)
    db.session.flush()  # get recipe.id before committing

    _add_ingredients(recipe.id, data.get("ingredients", []))

    db.session.commit()
    return recipe.serialize()


def rename_recipe(recipe_id: str, user_id: str, title: str) -> dict | None:
    """
    Updates only the title of a recipe.
    Returns None if the recipe is not found or not owned by the user.
    """
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first()
    if not recipe:
        return None

    recipe.title = title.strip()
    db.session.commit()
    return recipe.serialize()


def delete_recipe(recipe_id: str, user_id: str) -> bool:
    """
    Deletes a recipe (cascade removes its ingredients).
    Returns False if the recipe is not found or not owned by the user.
    """
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first()
    if not recipe:
        return False

    db.session.delete(recipe)
    db.session.commit()
    return True


def _add_ingredients(recipe_id, ingredients: list) -> None:
    """Helper: validates and inserts RecipeIngredient rows for a given recipe."""
    for item in ingredients:
        product = db.session.get(Product, item["product_id"])
        if not product:
            raise ValueError(f"Product not found: {item['product_id']}")

        ing = RecipeIngredient(
            recipe_id=recipe_id,
            product_id=product.id,
            quantity=item["quantity"],
        )
        db.session.add(ing)
