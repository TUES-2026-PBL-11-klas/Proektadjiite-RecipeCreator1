export interface Product {
  id: string;
  name: string;
  unit: string;
}

export interface PantryItem {
  product_id: string;
  product_name?: string;
  unit?: string;
  quantity: number;
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface RecipeIngredient {
  product_id: string;
  product_name: string;
  unit: string;
  quantity: number;
}

export interface Nutrition {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string | string[];
  prep_time_minutes: number;
  difficulty_level: DifficultyLevel;
  image_url?: string;
  ingredients?: RecipeIngredient[];
  nutrition?: Nutrition;
  // flat nutrition fields returned directly by the backend
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

export interface GenerateResponse {
  recipe: Recipe;
  missing_ingredients: PantryItem[];
}

export interface RecipeFiltersState {
  search: string;
  maxTime: number;
  difficulty: DifficultyLevel | '';
}
