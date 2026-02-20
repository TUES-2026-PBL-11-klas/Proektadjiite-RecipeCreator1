from database import db
import uuid
from werkzeug.security import generate_password_hash, check_password_hash


# =========================
# USER
# =========================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    recipes = db.relationship("Recipe", backref="author", cascade="all, delete")
    pantry_items = db.relationship("Pantry", backref="user", cascade="all, delete")

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

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
    name = db.Column(db.String, unique=True, nullable=False, index=True)
    unit = db.Column(db.String, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

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

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    title = db.Column(db.String, nullable=False, index=True)
    description = db.Column(db.Text)

    instructions = db.Column(db.JSON, nullable=False)

    prep_time_minutes = db.Column(db.Integer, nullable=False)

    difficulty_level = db.Column(
        db.Enum("Easy", "Medium", "Hard", name="difficulty_enum"),
        nullable=False
    )

    image_url = db.Column(db.String)

    calories = db.Column(db.Integer)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fat = db.Column(db.Float)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    ingredients = db.relationship(
        "RecipeIngredient",
        backref="recipe",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        db.CheckConstraint("prep_time_minutes > 0", name="check_prep_time_positive"),
        db.Index("idx_recipe_user", "user_id"),
    )

    def serialize(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "instructions": self.instructions,
            "prep_time_minutes": self.prep_time_minutes,
            "difficulty_level": self.difficulty_level,
            "image_url": self.image_url,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "ingredients": [i.serialize() for i in self.ingredients]
        }


# =========================
# RECIPE INGREDIENT
# =========================
class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredients"

    recipe_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("recipes.id", ondelete="CASCADE"),
        primary_key=True
    )

    product_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True
    )

    quantity = db.Column(db.Float, nullable=False)

    product = db.relationship("Product")

    __table_args__ = (
        db.CheckConstraint("quantity > 0", name="check_recipe_quantity_positive"),
    )

    def serialize(self):
        return {
            "product_id": str(self.product_id),
            "product_name": self.product.name if self.product else None,
            "quantity": self.quantity,
            "unit": self.product.unit if self.product else None
        }


# =========================
# PANTRY
# =========================
class Pantry(db.Model):
    __tablename__ = "pantry"

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    product_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True
    )

    quantity = db.Column(db.Float, nullable=False)

    product = db.relationship("Product")

    __table_args__ = (
        db.CheckConstraint("quantity > 0", name="check_pantry_quantity_positive"),
        db.UniqueConstraint("user_id", "product_id", name="unique_user_product"),
    )

    def serialize(self):
        return {
            "product_id": str(self.product_id),
            "product_name": self.product.name if self.product else None,
            "quantity": self.quantity,
            "unit": self.product.unit if self.product else None
        }