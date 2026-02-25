import { PantryItem, Recipe, GenerateResponse, RecipeFiltersState } from '@/types';
import { computeRecipeNutrition } from '@/lib/nutrition';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Herb Omelette',
    description: 'A fluffy omelette packed with fresh herbs and creamy filling.',
    prep_time_minutes: 10,
    difficulty_level: 'Easy',
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
    instructions: ['Beat 3 eggs with salt and pepper.', 'Heat butter in pan.', 'Pour eggs, add herbs.', 'Fold and serve.'],
    ingredients: [
      { product_id: 'egg', name: 'Eggs', unit: 'pcs', quantity: 3 },
      { product_id: 'butter', name: 'Butter', unit: 'tbsp', quantity: 1 },
      { product_id: 'parsley', name: 'Parsley', unit: 'tbsp', quantity: 2 },
    ],
  },
  {
    id: '2',
    title: 'Pasta Aglio e Olio',
    description: 'Classic Roman pasta with garlic, olive oil, and chili flakes.',
    prep_time_minutes: 20,
    difficulty_level: 'Easy',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
    instructions: ['Cook pasta al dente.', 'Sauté garlic in olive oil.', 'Toss pasta with oil and chili.', 'Add parsley and parmesan.'],
    ingredients: [
      { product_id: 'pasta', name: 'Spaghetti', unit: 'g', quantity: 200 },
      { product_id: 'garlic', name: 'Garlic', unit: 'cloves', quantity: 4 },
      { product_id: 'olive_oil', name: 'Olive Oil', unit: 'tbsp', quantity: 4 },
    ],
  },
  {
    id: '3',
    title: 'Chicken Stir-Fry',
    description: 'Quick wok-fried chicken with colorful vegetables and soy sauce.',
    prep_time_minutes: 30,
    difficulty_level: 'Medium',
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
    instructions: ['Marinate chicken in soy sauce.', 'Stir-fry vegetables.', 'Add chicken and sauce.', 'Serve over rice.'],
    ingredients: [
      { product_id: 'chicken', name: 'Chicken Breast', unit: 'g', quantity: 300 },
      { product_id: 'soy', name: 'Soy Sauce', unit: 'tbsp', quantity: 3 },
      { product_id: 'broccoli', name: 'Broccoli', unit: 'g', quantity: 200 },
    ],
  },
  {
    id: '4',
    title: 'Beef Bourguignon',
    description: 'Slow-braised beef in burgundy wine with mushrooms and root vegetables.',
    prep_time_minutes: 180,
    difficulty_level: 'Hard',
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80',
    instructions: ['Brown beef in batches.', 'Deglaze with wine.', 'Add vegetables and broth.', 'Braise for 2.5 hours.'],
    ingredients: [
      { product_id: 'beef', name: 'Beef Chuck', unit: 'kg', quantity: 1 },
      { product_id: 'wine', name: 'Red Wine', unit: 'ml', quantity: 500 },
      { product_id: 'mushroom', name: 'Mushrooms', unit: 'g', quantity: 200 },
    ],
  },
  {
    id: '5',
    title: 'Avocado Toast',
    description: 'Creamy smashed avocado on sourdough with everything bagel seasoning.',
    prep_time_minutes: 8,
    difficulty_level: 'Easy',
    image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80',
    instructions: ['Toast sourdough bread.', 'Mash avocado with lemon.', 'Season and top bread.', 'Add toppings.'],
    ingredients: [
      { product_id: 'avo', name: 'Avocado', unit: 'pcs', quantity: 1 },
      { product_id: 'bread', name: 'Sourdough', unit: 'slices', quantity: 2 },
      { product_id: 'lemon', name: 'Lemon', unit: 'pcs', quantity: 0.5 },
    ],
  },
  {
    id: '6',
    title: 'Mushroom Risotto',
    description: 'Creamy arborio rice with mixed mushrooms and parmesan.',
    prep_time_minutes: 45,
    difficulty_level: 'Medium',
    image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
    instructions: ['Toast rice in butter.', 'Add warm broth ladle by ladle.', 'Stir in mushrooms.', 'Finish with parmesan.'],
    ingredients: [
      { product_id: 'arborio', name: 'Arborio Rice', unit: 'g', quantity: 300 },
      { product_id: 'mushroom', name: 'Mixed Mushrooms', unit: 'g', quantity: 250 },
      { product_id: 'parmesan', name: 'Parmesan', unit: 'g', quantity: 60 },
    ],
  },
];

const MOCK_PANTRY: PantryItem[] = [
  { product_id: 'egg', name: 'Eggs', unit: 'pcs', quantity: 6 },
  { product_id: 'butter', name: 'Butter', unit: 'g', quantity: 200 },
  { product_id: 'pasta', name: 'Spaghetti', unit: 'g', quantity: 400 },
  { product_id: 'garlic', name: 'Garlic', unit: 'cloves', quantity: 8 },
  { product_id: 'olive_oil', name: 'Olive Oil', unit: 'ml', quantity: 500 },
  { product_id: 'parsley', name: 'Parsley', unit: 'g', quantity: 30 },
];

const INGREDIENT_SUGGESTIONS = [
  { product_id: 'egg', name: 'Eggs', unit: 'pcs' },
  { product_id: 'butter', name: 'Butter', unit: 'g' },
  { product_id: 'milk', name: 'Milk', unit: 'ml' },
  { product_id: 'pasta', name: 'Spaghetti', unit: 'g' },
  { product_id: 'garlic', name: 'Garlic', unit: 'cloves' },
  { product_id: 'olive_oil', name: 'Olive Oil', unit: 'ml' },
  { product_id: 'parsley', name: 'Parsley', unit: 'g' },
  { product_id: 'chicken', name: 'Chicken Breast', unit: 'g' },
  { product_id: 'beef', name: 'Beef Chuck', unit: 'g' },
  { product_id: 'mushroom', name: 'Mushrooms', unit: 'g' },
  { product_id: 'tomato', name: 'Tomatoes', unit: 'pcs' },
  { product_id: 'onion', name: 'Onion', unit: 'pcs' },
  { product_id: 'carrot', name: 'Carrot', unit: 'pcs' },
  { product_id: 'potato', name: 'Potato', unit: 'pcs' },
  { product_id: 'flour', name: 'All-Purpose Flour', unit: 'g' },
  { product_id: 'sugar', name: 'Sugar', unit: 'g' },
  { product_id: 'salt', name: 'Salt', unit: 'tsp' },
  { product_id: 'pepper', name: 'Black Pepper', unit: 'tsp' },
  { product_id: 'rice', name: 'White Rice', unit: 'g' },
  { product_id: 'lemon', name: 'Lemon', unit: 'pcs' },
  { product_id: 'broccoli', name: 'Broccoli', unit: 'g' },
  { product_id: 'cheese', name: 'Cheddar Cheese', unit: 'g' },
  { product_id: 'parmesan', name: 'Parmesan', unit: 'g' },
  { product_id: 'avocado', name: 'Avocado', unit: 'pcs' },
  { product_id: 'bread', name: 'Sourdough Bread', unit: 'slices' },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('No API base');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export async function getRecipes(filters?: Partial<RecipeFiltersState>): Promise<Recipe[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.maxTime) params.set('maxTime', String(filters.maxTime));
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    return await apiFetch<Recipe[]>(`/api/recipes?${params}`);
  } catch {
    await new Promise(r => setTimeout(r, 600));
    let results = [...MOCK_RECIPES];
    if (filters?.search) {
      results = results.filter(r => r.title.toLowerCase().includes(filters.search!.toLowerCase()));
    }
    if (filters?.maxTime && filters.maxTime < 180) {
      results = results.filter(r => r.prep_time_minutes <= filters.maxTime!);
    }
    if (filters?.difficulty) {
      results = results.filter(r => r.difficulty_level === filters.difficulty);
    }
    return results;
  }
}

export async function getRecipeById(id: string): Promise<Recipe> {
  try {
    return await apiFetch<Recipe>(`/api/recipes/${id}`);
  } catch {
    await new Promise(r => setTimeout(r, 400));
    const recipe = MOCK_RECIPES.find(r => r.id === id);
    if (!recipe) throw new Error('Recipe not found');
    return recipe;
  }
}

export async function createRecipe(data: Omit<Recipe, 'id'>): Promise<Recipe> {
  try {
    return await apiFetch<Recipe>('/api/recipes', { method: 'POST', body: JSON.stringify(data) });
  } catch {
    await new Promise(r => setTimeout(r, 500));
    const newRecipe: Recipe = { ...data, id: String(Date.now()) };
    MOCK_RECIPES.push(newRecipe);
    return newRecipe;
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/api/recipes/${id}`, { method: 'DELETE' });
  } catch {
    await new Promise(r => setTimeout(r, 300));
    const idx = MOCK_RECIPES.findIndex(r => r.id === id);
    if (idx !== -1) MOCK_RECIPES.splice(idx, 1);
  }
}

// ─── Pantry ──────────────────────────────────────────────────────────────────

export async function getPantry(): Promise<PantryItem[]> {
  try {
    return await apiFetch<PantryItem[]>('/api/pantry');
  } catch {
    await new Promise(r => setTimeout(r, 500));
    return [...MOCK_PANTRY];
  }
}

export async function savePantry(items: PantryItem[]): Promise<PantryItem[]> {
  try {
    return await apiFetch<PantryItem[]>('/api/pantry', { method: 'POST', body: JSON.stringify(items) });
  } catch {
    await new Promise(r => setTimeout(r, 400));
    MOCK_PANTRY.splice(0, MOCK_PANTRY.length, ...items);
    return [...items];
  }
}

// ─── Generate ────────────────────────────────────────────────────────────────

export async function generateRecipe(pantry: PantryItem[]): Promise<GenerateResponse> {
  try {
    return await apiFetch<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ pantry }),
    });
  } catch {
    await new Promise(r => setTimeout(r, 1800));
    const ingredients = pantry.slice(0, 4).map(p => ({
      product_id: p.product_id,
      name: p.name || p.product_id,
      unit: p.unit || 'pcs',
      quantity: p.quantity,
    }));
    const nutrition = computeRecipeNutrition(ingredients);
    return {
      recipe: {
        id: `gen-${Date.now()}`,
        title: 'AI Chef\'s Pantry Special',
        description: 'A creative dish generated from your available pantry ingredients. Made with what you have!',
        prep_time_minutes: 25,
        difficulty_level: 'Medium',
        instructions: [
          'Heat olive oil in a large pan over medium heat.',
          'Sauté garlic until fragrant, about 1 minute.',
          'Add your main protein and cook through.',
          'Toss in vegetables and season generously.',
          'Combine with pasta or rice and serve hot.',
          'Garnish with fresh herbs and enjoy!',
        ],
        ingredients,
        nutrition,
      },
      missing_ingredients: [
        { product_id: 'cream', name: 'Heavy Cream', unit: 'ml', quantity: 100 },
        { product_id: 'thyme', name: 'Fresh Thyme', unit: 'sprigs', quantity: 3 },
      ],
    };
  }
}

// ─── Ingredient Search ───────────────────────────────────────────────────────

export function searchIngredientSuggestions(query: string) {
  if (!query.trim()) return [];
  return INGREDIENT_SUGGESTIONS.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);
}
