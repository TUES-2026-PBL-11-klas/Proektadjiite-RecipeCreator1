import { Clock, ChefHat, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
}

const diffClass: Record<string, string> = {
  Easy: 'badge-easy',
  Medium: 'badge-medium',
  Hard: 'badge-hard',
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-muted">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={32} className="text-muted-foreground/40" />
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 ${diffClass[recipe.difficulty_level] ?? 'badge-easy'}`}>
          {recipe.difficulty_level}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-foreground text-base leading-tight mb-1.5 line-clamp-1">{recipe.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-3">{recipe.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              {recipe.prep_time_minutes} min
            </span>
            {recipe.ingredients && (
              <span className="text-xs text-muted-foreground">{recipe.ingredients.length} ingredients</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="skeleton-pulse h-44" />
      <div className="p-4 space-y-2">
        <div className="skeleton-pulse h-5 w-2/3" />
        <div className="skeleton-pulse h-3.5 w-full" />
        <div className="skeleton-pulse h-3.5 w-4/5" />
        <div className="skeleton-pulse h-3 w-1/3 mt-3" />
      </div>
    </div>
  );
}
