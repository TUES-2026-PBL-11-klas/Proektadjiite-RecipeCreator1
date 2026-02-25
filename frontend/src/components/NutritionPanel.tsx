import { Nutrition } from '@/types';
import { Flame, Droplet, Wheat, AlertCircle } from 'lucide-react';

interface NutritionPanelProps {
  nutrition?: Nutrition;
}

export const NutritionPanel = ({ nutrition }: NutritionPanelProps) => {
  if (!nutrition) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
      {/* Header with disclaimer */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-500" />
          <h3 className="text-sm font-semibold text-foreground">Nutrition Facts</h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950 rounded text-xs text-amber-700 dark:text-amber-200">
          <AlertCircle size={12} />
          <span>Estimated</span>
        </div>
      </div>

      {/* Main calorie display */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {nutrition.calories_kcal}
          </div>
          <div className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">calories</div>
        </div>
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Protein */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplet size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Protein</span>
          </div>
          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {nutrition.protein_g}
            <span className="text-xs font-normal text-blue-600/70 dark:text-blue-400/70 ml-1">g</span>
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Wheat size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Carbs</span>
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
            {nutrition.carbs_g}
            <span className="text-xs font-normal text-amber-600/70 dark:text-amber-400/70 ml-1">g</span>
          </div>
        </div>

        {/* Fat */}
        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-lg p-3 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Fat</span>
          </div>
          <div className="text-lg font-bold text-rose-700 dark:text-rose-300">
            {nutrition.fat_g}
            <span className="text-xs font-normal text-rose-600/70 dark:text-rose-400/70 ml-1">g</span>
          </div>
        </div>

        {/* Sugar */}
        <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-3 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">Sugar</span>
          </div>
          <div className="text-lg font-bold text-pink-700 dark:text-pink-300">
            {nutrition.sugar_g}
            <span className="text-xs font-normal text-pink-600/70 dark:text-pink-400/70 ml-1">g</span>
          </div>
        </div>
      </div>

      {/* Disclaimer footer */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2.5 leading-relaxed">
        <p className="font-medium mb-1">ℹ️ Estimated values</p>
        <p>Nutrition information is calculated based on ingredient databases and may vary depending on preparation method and specific brands used.</p>
      </div>
    </div>
  );
};
