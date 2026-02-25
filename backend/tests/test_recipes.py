from models import User, Recipe


def test_list_recipes_empty(client, auth_headers):
    resp = client.get("/api/recipes/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_create_recipe_manually_not_allowed(client, auth_headers, test_product):
    """POST /api/recipes/ endpoint should return 405 (removed in favor of AI generation)."""
    resp = client.post("/api/recipes/", headers=auth_headers, json={
        "title": "Manual Recipe",
        "instructions": ["Step 1"],
        "prep_time_minutes": 15,
        "difficulty_level": "Easy",
        "ingredients": [{"product_id": str(test_product.id), "quantity": 100}],
    })
    assert resp.status_code == 405  # Method not allowed


def test_create_recipe_missing_fields(client, auth_headers):
    """POST /api/recipes/ endpoint should return 405 (removed in favor of AI generation)."""
    resp = client.post("/api/recipes/", headers=auth_headers, json={
        "title": "Incomplete",
    })
    assert resp.status_code == 405  # Method not allowed


def test_create_recipe_invalid_difficulty(client, auth_headers):
    """POST /api/recipes/ endpoint should return 405 (removed in favor of AI generation)."""
    resp = client.post("/api/recipes/", headers=auth_headers, json={
        "title": "Cake",
        "instructions": ["Mix"],
        "prep_time_minutes": 30,
        "difficulty_level": "Super Hard",
        "ingredients": [],
    })
    assert resp.status_code == 405  # Method not allowed


def test_get_recipe(client, auth_headers, test_recipe):
    resp = client.get(f"/api/recipes/{test_recipe.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["title"] == "Test Cake"


def test_get_other_users_recipe_returns_404(client, auth_headers, db):
    other_user = User(email="other@example.com", username="other")
    other_user.set_password("pass")
    db.session.add(other_user)
    db.session.commit()

    recipe = Recipe(
        user_id=other_user.id,
        title="Private Recipe",
        instructions=["Step 1"],
        prep_time_minutes=10,
        difficulty_level="Easy",
    )
    db.session.add(recipe)
    db.session.commit()

    resp = client.get(f"/api/recipes/{recipe.id}", headers=auth_headers)
    assert resp.status_code == 404


def test_update_recipe_title_only(client, auth_headers, test_recipe):
    """PUT /api/recipes/<id> now only updates the title field."""
    resp = client.put(f"/api/recipes/{test_recipe.id}", headers=auth_headers, json={
        "title": "Updated Cake",
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["title"] == "Updated Cake"
    # Other fields should remain unchanged
    assert data["prep_time_minutes"] == 30
    assert data["difficulty_level"] == "Easy"


def test_update_recipe_missing_title_returns_400(client, auth_headers, test_recipe):
    """PUT /api/recipes/<id> requires title field."""
    resp = client.put(f"/api/recipes/{test_recipe.id}", headers=auth_headers, json={
        "instructions": ["New step"],
    })
    assert resp.status_code == 400


def test_delete_recipe(client, auth_headers, test_recipe):
    resp = client.delete(f"/api/recipes/{test_recipe.id}", headers=auth_headers)
    assert resp.status_code == 204

    # Verify it's gone
    resp2 = client.get(f"/api/recipes/{test_recipe.id}", headers=auth_headers)
    assert resp2.status_code == 404


def test_search_recipes_by_title(client, auth_headers, test_recipe):
    resp = client.get("/api/recipes/?search=cake", headers=auth_headers)
    assert resp.status_code == 200
    results = resp.get_json()
    assert len(results) == 1
    assert results[0]["title"] == "Test Cake"


def test_search_recipes_no_match(client, auth_headers, test_recipe):
    resp = client.get("/api/recipes/?search=pizza", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_filter_by_max_prep_time_includes(client, auth_headers, test_recipe):
    # test_recipe has 30 min
    resp = client.get("/api/recipes/?max_prep_time=30", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1


def test_filter_by_max_prep_time_excludes(client, auth_headers, test_recipe):
    # test_recipe has 30 min — 10 min filter should exclude it
    resp = client.get("/api/recipes/?max_prep_time=10", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() == []
