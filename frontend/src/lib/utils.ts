import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Recipe } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maps flat nutrition fields returned by the backend (calories, protein, carbs, fat)
 * into the nested Nutrition object expected by NutritionPanel.
 */
export function normalizeRecipe(recipe: Recipe): Recipe {
  if (recipe.nutrition) return recipe;
  if (
    recipe.calories != null ||
    recipe.protein != null ||
    recipe.carbs != null ||
    recipe.fat != null
  ) {
    return {
      ...recipe,
      nutrition: {
        calories_kcal: recipe.calories ?? 0,
        protein_g: recipe.protein ?? 0,
        carbs_g: recipe.carbs ?? 0,
        fat_g: recipe.fat ?? 0,
        sugar_g: 0,
      },
    };
  }
  return recipe;
}
