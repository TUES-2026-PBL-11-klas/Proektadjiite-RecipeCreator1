def test_list_pantry_empty(client, auth_headers):
    resp = client.get("/api/pantry/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_add_to_pantry(client, auth_headers, test_product):
    resp = client.post("/api/pantry/", headers=auth_headers, json={
        "product_id": str(test_product.id),
        "quantity": 500,
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["quantity"] == 500
    assert data["product_name"] == "Flour"
    assert data["unit"] == "grams"


def test_add_nonexistent_product(client, auth_headers):
    resp = client.post("/api/pantry/", headers=auth_headers, json={
        "product_id": "00000000-0000-0000-0000-000000000000",
        "quantity": 100,
    })
    assert resp.status_code == 404


def test_add_duplicate_product_returns_409(client, auth_headers, test_product):
    client.post("/api/pantry/", headers=auth_headers, json={
        "product_id": str(test_product.id),
        "quantity": 100,
    })
    resp = client.post("/api/pantry/", headers=auth_headers, json={
        "product_id": str(test_product.id),
        "quantity": 200,
    })
    assert resp.status_code == 409


def test_update_pantry_item(client, auth_headers, test_product):
    client.post("/api/pantry/", headers=auth_headers, json={
        "product_id": str(test_product.id),
        "quantity": 100,
    })
    resp = client.put(f"/api/pantry/{test_product.id}", headers=auth_headers, json={
        "quantity": 250,
    })
    assert resp.status_code == 200
    assert resp.get_json()["quantity"] == 250


def test_update_missing_pantry_item(client, auth_headers, test_product):
    resp = client.put(f"/api/pantry/{test_product.id}", headers=auth_headers, json={
        "quantity": 100,
    })
    assert resp.status_code == 404


def test_remove_pantry_item(client, auth_headers, test_product):
    client.post("/api/pantry/", headers=auth_headers, json={
        "product_id": str(test_product.id),
        "quantity": 100,
    })
    resp = client.delete(f"/api/pantry/{test_product.id}", headers=auth_headers)
    assert resp.status_code == 204

    # Verify it's gone
    resp2 = client.get("/api/pantry/", headers=auth_headers)
    assert resp2.get_json() == []


def test_remove_missing_pantry_item(client, auth_headers, test_product):
    resp = client.delete(f"/api/pantry/{test_product.id}", headers=auth_headers)
    assert resp.status_code == 404


def test_add_pantry_missing_fields(client, auth_headers):
    resp = client.post("/api/pantry/", headers=auth_headers, json={"quantity": 100})
    assert resp.status_code == 400
