from models import Pantry, Product
from database import db


def get_pantry(user_id: str) -> list:
    """Returns all pantry items for the given user."""
    items = Pantry.query.filter_by(user_id=user_id).all()
    return [item.serialize() for item in items]


def add_to_pantry(user_id: str, product_id: str, quantity: float) -> dict:
    """
    Adds a product to the user's pantry.
    Raises ValueError if the product doesn't exist or is already in the pantry.
    """
    product = db.session.get(Product, product_id)
    if not product:
        raise ValueError("Product not found")

    existing = Pantry.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        raise ValueError("Product already in pantry")

    item = Pantry(user_id=user_id, product_id=product_id, quantity=quantity)
    db.session.add(item)
    db.session.commit()
    return item.serialize()


def update_pantry_item(user_id: str, product_id: str, quantity: float) -> dict | None:
    """
    Updates the quantity of a pantry item.
    Returns None if the item is not found.
    """
    item = Pantry.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return None

    item.quantity = quantity
    db.session.commit()
    return item.serialize()


def remove_from_pantry(user_id: str, product_id: str) -> bool:
    """
    Removes an item from the pantry.
    Returns False if the item is not found.
    """
    item = Pantry.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return False

    db.session.delete(item)
    db.session.commit()
    return True
