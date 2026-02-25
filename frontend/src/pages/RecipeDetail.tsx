import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { getRecipeById, deleteRecipe } from '@/lib/api';
import { Recipe } from '@/types';
import { IngredientList } from '@/components/IngredientList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

const diffClass: Record<string, string> = {
  Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard',
};

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRecipeById(id)
      .then(data => { setRecipe(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!recipe || !confirm(`Delete "${recipe.title}"?`)) return;
    setDeleting(true);
    await deleteRecipe(recipe.id);
    navigate('/recipes');
  };

  if (loading) return (
    <div className="page-wrapper flex items-center justify-center py-24">
      <LoadingSpinner size="lg" label="Loading recipe…" />
    </div>
  );

  if (!recipe) return (
    <div className="page-wrapper">
      <EmptyState
        icon={<ChefHat size={48} />}
        title="Recipe not found"
        description="This recipe may have been deleted or doesn't exist."
        action={
          <Link to="/recipes" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg no-underline hover:bg-primary/90 transition-colors">
            Back to Recipes
          </Link>
        }
      />
    </div>
  );

  const instructions = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : recipe.instructions.split('\n').filter(Boolean);

  return (
    <div className="page-wrapper">
      {/* Back link */}
      <Link
        to="/recipes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline mb-6"
      >
        <ArrowLeft size={14} /> Back to Recipes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left: image + summary + actions */}
        <div className="space-y-4">
          {/* Image */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <ChefHat size={40} className="text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Summary card */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-3">
            <h1 className="text-xl font-bold text-foreground font-serif leading-tight">{recipe.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{recipe.description}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                <Clock size={12} /> {recipe.prep_time_minutes} min
              </span>
              <span className={diffClass[recipe.difficulty_level] ?? 'badge-easy'}>
                {recipe.difficulty_level}
              </span>
              {recipe.ingredients && (
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {recipe.ingredients.length} ingredients
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              disabled
              title="Edit (coming soon)"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 border border-border rounded-lg text-sm font-medium text-muted-foreground bg-muted opacity-50 cursor-not-allowed"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {deleting ? <LoadingSpinner size="sm" /> : <Trash2 size={14} />}
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Right: ingredients + instructions */}
        <div className="space-y-5">
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-foreground font-serif mb-4">Ingredients</h2>
              <IngredientList items={recipe.ingredients} />
            </div>
          )}

          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-foreground font-serif mb-4">Instructions</h2>
            <ol className="space-y-4">
              {instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
