import { RecipeIngredient } from '@/types';

/**
 * Nutrition data per 100g for common ingredients
 * Values: calories (kcal), protein (g), carbs (g), fat (g), sugar (g)
 */
interface NutritionData {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
}

const NUTRITION_DB: Record<string, NutritionData> = {
  // Proteins
  egg: { calories_kcal: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11, sugar_g: 0.6 },
  chicken: { calories_kcal: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, sugar_g: 0 },
  beef: { calories_kcal: 250, protein_g: 26, carbs_g: 0, fat_g: 15, sugar_g: 0 },
  fish: { calories_kcal: 100, protein_g: 20, carbs_g: 0, fat_g: 1.3, sugar_g: 0 },
  salmon: { calories_kcal: 208, protein_g: 20, carbs_g: 0, fat_g: 13, sugar_g: 0 },
  shrimp: { calories_kcal: 99, protein_g: 24, carbs_g: 0, fat_g: 0.3, sugar_g: 0 },
  
  // Dairy
  milk: { calories_kcal: 61, protein_g: 3.2, carbs_g: 4.8, fat_g: 3.3, sugar_g: 5 },
  cheese: { calories_kcal: 402, protein_g: 25, carbs_g: 1.3, fat_g: 33, sugar_g: 0.7 },
  parmesan: { calories_kcal: 431, protein_g: 38, carbs_g: 4.1, fat_g: 29, sugar_g: 0.2 },
  butter: { calories_kcal: 717, protein_g: 0.9, carbs_g: 0.1, fat_g: 81, sugar_g: 0 },
  cream: { calories_kcal: 340, protein_g: 2.2, carbs_g: 2.7, fat_g: 35, sugar_g: 2.6 },
  
  // Grains & Carbs
  pasta: { calories_kcal: 371, protein_g: 13, carbs_g: 75, fat_g: 1.1, sugar_g: 0.6 },
  rice: { calories_kcal: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, sugar_g: 0 },
  arborio: { calories_kcal: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, sugar_g: 0 },
  bread: { calories_kcal: 265, protein_g: 9, carbs_g: 49, fat_g: 3.3, sugar_g: 4 },
  flour: { calories_kcal: 364, protein_g: 10, carbs_g: 76, fat_g: 1, sugar_g: 0.3 },
  
  // Vegetables
  broccoli: { calories_kcal: 34, protein_g: 2.8, carbs_g: 7, fat_g: 0.4, sugar_g: 1.4 },
  tomato: { calories_kcal: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, sugar_g: 2.3 },
  onion: { calories_kcal: 40, protein_g: 1.1, carbs_g: 9, fat_g: 0.1, sugar_g: 4.4 },
  carrot: { calories_kcal: 41, protein_g: 0.9, carbs_g: 10, fat_g: 0.2, sugar_g: 4.7 },
  potato: { calories_kcal: 77, protein_g: 2, carbs_g: 17, fat_g: 0.1, sugar_g: 0.8 },
  mushroom: { calories_kcal: 22, protein_g: 3.1, carbs_g: 3.3, fat_g: 0.3, sugar_g: 1 },
  garlic: { calories_kcal: 149, protein_g: 6.4, carbs_g: 33, fat_g: 0.5, sugar_g: 1 },
  parsley: { calories_kcal: 36, protein_g: 3, carbs_g: 6.3, fat_g: 0.8, sugar_g: 0.9 },
  
  // Fruits
  avocado: { calories_kcal: 160, protein_g: 2, carbs_g: 9, fat_g: 15, sugar_g: 0.7 },
  lemon: { calories_kcal: 29, protein_g: 1.1, carbs_g: 9, fat_g: 0.3, sugar_g: 2.5 },
  
  // Oils & Condiments
  olive_oil: { calories_kcal: 884, protein_g: 0, carbs_g: 0, fat_g: 100, sugar_g: 0 },
  soy: { calories_kcal: 53, protein_g: 8, carbs_g: 5, fat_g: 0, sugar_g: 0.8 },
  salt: { calories_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0 },
  pepper: { calories_kcal: 251, protein_g: 10, carbs_g: 64, fat_g: 3.3, sugar_g: 0.6 },
  sugar: { calories_kcal: 387, protein_g: 0, carbs_g: 100, fat_g: 0, sugar_g: 100 },
  wine: { calories_kcal: 83, protein_g: 0.1, carbs_g: 2.6, fat_g: 0, sugar_g: 2.4 },
  thyme: { calories_kcal: 101, protein_g: 5.6, carbs_g: 24, fat_g: 1.7, sugar_g: 0 },
};

/**
 * Unit conversion to grams
 * Based on approximations for cooking
 */
const UNIT_TO_GRAMS: Record<string, number> = {
  // Weight units
  'g': 1,
  'kg': 1000,
  'mg': 0.001,
  
  // Volume units (approximate for water/neutral items)
  'ml': 1, // 1ml ≈ 1g for liquids
  'l': 1000,
  'tsp': 5, // teaspoon
  'tbsp': 15, // tablespoon
  'cup': 240,
  'fl oz': 30,
  
  // Count units (approximations)
  'pcs': 100, // average piece
  'cloves': 3, // garlic clove
  'slices': 30, // bread slice
  'sprigs': 5, // herb sprig
};

/**
 * Convert quantity from unit to grams
 */
export function convertToGrams(quantity: number, unit: string): number {
  const gramsPerUnit = UNIT_TO_GRAMS[unit.toLowerCase()] || 100;
  return quantity * gramsPerUnit;
}

/**
 * Get nutrition data for a product (per 100g)
 */
export function getNutritionPer100g(productId: string): NutritionData | null {
  return NUTRITION_DB[productId.toLowerCase()] || null;
}

/**
 * Calculate nutrition for a single ingredient
 */
export function calculateIngredientNutrition(ingredient: RecipeIngredient): NutritionData {
  const nutrition = getNutritionPer100g(ingredient.product_id);
  if (!nutrition) {
    return { calories_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, sugar_g: 0 };
  }

  const grams = convertToGrams(ingredient.quantity, ingredient.unit);
  const multiplier = grams / 100;

  return {
    calories_kcal: Math.round(nutrition.calories_kcal * multiplier),
    protein_g: Math.round(nutrition.protein_g * multiplier * 10) / 10,
    carbs_g: Math.round(nutrition.carbs_g * multiplier * 10) / 10,
    fat_g: Math.round(nutrition.fat_g * multiplier * 10) / 10,
    sugar_g: Math.round(nutrition.sugar_g * multiplier * 10) / 10,
  };
}

/**
 * Calculate total nutrition for all ingredients in a recipe
 */
export function computeRecipeNutrition(ingredients: RecipeIngredient[]): {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
} {
  const totals = {
    calories_kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    sugar_g: 0,
  };

  for (const ingredient of ingredients) {
    const nutrition = calculateIngredientNutrition(ingredient);
    totals.calories_kcal += nutrition.calories_kcal;
    totals.protein_g += nutrition.protein_g;
    totals.carbs_g += nutrition.carbs_g;
    totals.fat_g += nutrition.fat_g;
    totals.sugar_g += nutrition.sugar_g;
  }

  return {
    calories_kcal: Math.round(totals.calories_kcal),
    protein_g: Math.round(totals.protein_g * 10) / 10,
    carbs_g: Math.round(totals.carbs_g * 10) / 10,
    fat_g: Math.round(totals.fat_g * 10) / 10,
    sugar_g: Math.round(totals.sugar_g * 10) / 10,
  };
}
