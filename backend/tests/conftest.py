import pytest
from app import app as flask_app
from database import db as _db
from models import User, Product, Recipe, RecipeIngredient, Pantry


@pytest.fixture(scope="session")
def app():
    """Configure the app with an in-memory SQLite database for testing."""
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-jwt-secret-key-minimum-32-bytes!!",
    })
    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def clean_db(app):
    """Roll back all changes after each test to keep tests isolated."""
    with app.app_context():
        yield
        _db.session.rollback()
        # Clear all tables between tests
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()


@pytest.fixture
def db(app):
    with app.app_context():
        yield _db


@pytest.fixture
def test_user(db):
    user = User(email="test@example.com", username="testuser")
    user.set_password("password123")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Returns Authorization headers with a valid JWT for test_user."""
    resp = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123",
    })
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_product(db):
    product = Product(name="Flour", unit="grams")
    db.session.add(product)
    db.session.commit()
    return product


@pytest.fixture
def test_recipe(db, test_user, test_product):
    """Creates a recipe with one ingredient (200g Flour, 30 min, Easy)."""
    recipe = Recipe(
        user_id=test_user.id,
        title="Test Cake",
        instructions=["Mix flour", "Bake at 180C"],
        prep_time_minutes=30,
        difficulty_level="Easy",
    )
    db.session.add(recipe)
    db.session.flush()

    ing = RecipeIngredient(
        recipe_id=recipe.id,
        product_id=test_product.id,
        quantity=200,
    )
    db.session.add(ing)
    db.session.commit()
    return recipe
