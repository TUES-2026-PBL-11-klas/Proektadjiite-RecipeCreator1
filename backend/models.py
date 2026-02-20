from database import db
import uuid


# =========================
# USER
# =========================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)

    recipes = db.relationship("Recipe", backref="author", cascade="all, delete")
    pantry_items = db.relationship("Pantry", backref="user", cascade="all, delete")

    def serialize(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "username": self.username
        }


# =========================
# PRODUCT
# =========================
class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String, unique=True, nullable=False)
    unit = db.Column(db.String, nullable=False)

    recipe_links = db.relationship("RecipeIngredient", backref="product", cascade="all, delete")
    pantry_links = db.relationship("Pantry", backref="product", cascade="all, delete")

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "unit": self.unit
        }


# =========================
# RECIPE
# =========================
class Recipe(db.Model):
    __tablename__ = "recipes"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    instructions = db.Column(db.JSON, nullable=False)

    prep_time_minutes = db.Column(db.Integer, nullable=False)
    difficulty_level = db.Column(db.String, nullable=False)
    image_url = db.Column(db.String)

    ingredients = db.relationship("RecipeIngredient", backref="recipe", cascade="all, delete")

    def serialize(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "description": self.description,
            "instructions": self.instructions,
            "prep_time_minutes": self.prep_time_minutes,
            "difficulty_level": self.difficulty_level,
            "image_url": self.image_url,
            "ingredients": [ingredient.serialize() for ingredient in self.ingredients]
        }


# =========================
# RECIPE INGREDIENT (Many-to-Many)
# =========================
class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredients"

    recipe_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("recipes.id"),
        primary_key=True
    )

    product_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("products.id"),
        primary_key=True
    )

    quantity = db.Column(db.Float, nullable=False)

    def serialize(self):
        return {
            "product_id": str(self.product_id),
            "product_name": self.product.name if self.product else None,
            "quantity": self.quantity,
            "unit": self.product.unit if self.product else None
        }


# =========================
# PANTRY (User Inventory)
# =========================
class Pantry(db.Model):
    __tablename__ = "pantry"

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        primary_key=True
    )

    product_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("products.id"),
        primary_key=True
    )

    quantity = db.Column(db.Float, nullable=False)

    def serialize(self):
        return {
            "user_id": str(self.user_id),
            "product_id": str(self.product_id),
            "product_name": self.product.name if self.product else None,
            "quantity": self.quantity,
            "unit": self.product.unit if self.product else None
        }