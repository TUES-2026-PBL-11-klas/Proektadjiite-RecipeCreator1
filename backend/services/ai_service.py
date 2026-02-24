import os
import json
from openai import OpenAI


def generate_recipe_from_ingredients(selected_items: list, preferences: str = None) -> dict:
    """
    PANTRY-ONLY mode: generates a recipe using STRICTLY the selected pantry products.
    The AI must not invent or add any ingredient that is not in selected_items.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")

    client = OpenAI(api_key=api_key)

    ingredient_lines = "\n".join(
        f'- id: "{item["product_id"]}", name: "{item["product_name"]}", '
        f'available: {item["available_quantity"]} {item["unit"]}'
        for item in selected_items
    )

    pref_line = f'\nUser preferences / notes: "{preferences}"' if preferences else ""

    prompt = f"""You are a helpful chef assistant.
The user wants to cook a recipe using some or all of the following ingredients from their pantry:
{ingredient_lines}{pref_line}

IMPORTANT: You must use ONLY the ingredients listed above. Do NOT add any ingredient that is not in this list.

Generate ONE detailed recipe. Respond with a single JSON object only — no explanation, no markdown.
Use realistic quantities that do not exceed the available amounts.
Estimate realistic macronutrients for the ENTIRE recipe (not per serving).

The JSON must have exactly these fields:
{{
  "title": "Recipe Name",
  "description": "One or two sentence description of the dish",
  "difficulty_level": "Easy" | "Medium" | "Hard",
  "prep_time_minutes": <integer>,
  "calories": <integer, estimated total kcal for the whole recipe>,
  "protein": <number, estimated total grams of protein>,
  "carbs": <number, estimated total grams of carbohydrates>,
  "fat": <number, estimated total grams of fat>,
  "instructions": ["Step 1 description", "Step 2 description", "..."],
  "ingredients": [
    {{ "product_id": "<exact id from the list above>", "quantity": <number> }},
    ...
  ]
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1400,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()

    recipe_data = json.loads(raw)

    required_keys = {"title", "description", "difficulty_level", "prep_time_minutes",
                     "instructions", "ingredients"}
    if not required_keys.issubset(recipe_data.keys()):
        raise ValueError(f"AI response missing keys: {required_keys - recipe_data.keys()}")
    if not isinstance(recipe_data["instructions"], list):
        raise ValueError("AI 'instructions' field must be a list")
    if not isinstance(recipe_data["ingredients"], list):
        raise ValueError("AI 'ingredients' field must be a list")

    return recipe_data


def generate_recipe_ai_enhanced(selected_items: list, preferences: str = None) -> dict:
    """
    AI-ENHANCED mode: generates a recipe using the selected pantry products as the base,
    but the AI is also free to suggest extra ingredients it thinks would improve the dish.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")

    client = OpenAI(api_key=api_key)

    ingredient_lines = "\n".join(
        f'- id: "{item["product_id"]}", name: "{item["product_name"]}", '
        f'available: {item["available_quantity"]} {item["unit"]}'
        for item in selected_items
    )

    pref_line = f'\nUser preferences / notes: "{preferences}"' if preferences else ""

    prompt = f"""You are a helpful chef assistant.
The user has selected these ingredients from their pantry as a starting point:
{ingredient_lines}{pref_line}

You may use all or some of these pantry ingredients, AND you may also suggest a small number of
additional common ingredients to make the recipe better (e.g. salt, oil, spices, etc.).

Generate ONE detailed recipe. Respond with a single JSON object only — no explanation, no markdown.
Estimate realistic macronutrients for the ENTIRE recipe (not per serving).

The JSON must have exactly these fields:
{{
  "title": "Recipe Name",
  "description": "One or two sentence description of the dish",
  "difficulty_level": "Easy" | "Medium" | "Hard",
  "prep_time_minutes": <integer>,
  "calories": <integer, estimated total kcal for the whole recipe>,
  "protein": <number, estimated total grams of protein>,
  "carbs": <number, estimated total grams of carbohydrates>,
  "fat": <number, estimated total grams of fat>,
  "instructions": ["Step 1 description", "Step 2 description", "..."],
  "pantry_ingredients": [
    {{ "product_id": "<exact id from the pantry list above>", "quantity": <number> }},
    ...
  ],
  "extra_ingredients": [
    {{ "name": "<ingredient name>", "unit": "<unit e.g. grams, ml, tsp>", "quantity": <number> }},
    ...
  ]
}}

If no extra ingredients are needed, set "extra_ingredients" to an empty array [].
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1400,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()

    recipe_data = json.loads(raw)

    required_keys = {"title", "description", "difficulty_level", "prep_time_minutes",
                     "instructions", "pantry_ingredients", "extra_ingredients"}
    if not required_keys.issubset(recipe_data.keys()):
        raise ValueError(f"AI response missing keys: {required_keys - recipe_data.keys()}")
    if not isinstance(recipe_data["instructions"], list):
        raise ValueError("AI 'instructions' field must be a list")
    if not isinstance(recipe_data["pantry_ingredients"], list):
        raise ValueError("AI 'pantry_ingredients' field must be a list")
    if not isinstance(recipe_data["extra_ingredients"], list):
        raise ValueError("AI 'extra_ingredients' field must be a list")

    return recipe_data

