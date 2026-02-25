from models import Product
from database import db


def list_products(search: str = None) -> list:
    """
    Returns all products, optionally filtered by a name substring (case-insensitive).
    """
    query = Product.query.order_by(Product.name)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    return [p.serialize() for p in query.all()]


def get_product(product_id: str) -> dict | None:
    """Returns a single product by ID, or None if not found."""
    product = db.session.get(Product, product_id)
    return product.serialize() if product else None


def create_product(name: str, unit: str) -> dict:
    """
    Creates a new product in the catalog.
    Raises ValueError if a product with the same name already exists.
    """
    if Product.query.filter(Product.name.ilike(name)).first():
        raise ValueError(f"Product '{name}' already exists")

    product = Product(name=name, unit=unit)
    db.session.add(product)
    db.session.commit()
    return product.serialize()


def update_product(product_id: str, data: dict) -> dict | None:
    """
    Updates name and/or unit of a product.
    Returns None if not found.
    Raises ValueError on duplicate name.
    """
    product = db.session.get(Product, product_id)
    if not product:
        return None

    if "name" in data:
        conflict = Product.query.filter(
            Product.name.ilike(data["name"]),
            Product.id != product.id
        ).first()
        if conflict:
            raise ValueError(f"Product '{data['name']}' already exists")
        product.name = data["name"]

    if "unit" in data:
        product.unit = data["unit"]

    db.session.commit()
    return product.serialize()


def delete_product(product_id: str) -> bool:
    """
    Deletes a product from the catalog.
    Returns False if not found.
    """
    product = db.session.get(Product, product_id)
    if not product:
        return False

    db.session.delete(product)
    db.session.commit()
    return True
