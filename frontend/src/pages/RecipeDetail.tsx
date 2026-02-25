import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, ArrowLeft, Trash2, Pencil, Check, X } from 'lucide-react';
import { getRecipeById, deleteRecipe, renameRecipe } from '@/lib/api';
import { normalizeRecipe } from '@/lib/utils';
import { Recipe } from '@/types';
import { IngredientList } from '@/components/IngredientList';
import { NutritionPanel } from '@/components/NutritionPanel';
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

  // Rename state
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState('');

  useEffect(() => {
    if (!id) return;
    getRecipeById(id)
      .then(data => {
        setRecipe(normalizeRecipe(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!recipe || !confirm(`Delete "${recipe.title}"?`)) return;
    setDeleting(true);
    await deleteRecipe(recipe.id);
    navigate('/recipes');
  };

  const startRename = () => {
    if (!recipe) return;
    setRenameValue(recipe.title);
    setRenameError('');
    setRenaming(true);
  };

  const cancelRename = () => {
    setRenaming(false);
    setRenameValue('');
    setRenameError('');
  };

  const handleRename = async () => {
    if (!recipe) return;
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenameError('Title cannot be empty.'); return; }
    if (trimmed === recipe.title) { cancelRename(); return; }
    setRenameSaving(true);
    setRenameError('');
    try {
      const updated = await renameRecipe(recipe.id, trimmed);
      setRecipe(prev => prev ? { ...prev, title: updated.title } : prev);
      cancelRename();
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Failed to rename');
    } finally {
      setRenameSaving(false);
    }
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
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline mb-5"
      >
        <ArrowLeft size={14} /> Back to Recipes
      </Link>

      {/* Centered page header */}
      <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
          <ChefHat size={24} />
        </div>

        {renaming ? (
          <div className="w-full max-w-sm space-y-2">
            <input
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring transition font-serif ${
                renameError ? 'border-destructive' : 'border-input'
              }`}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') cancelRename(); }}
              autoFocus
              disabled={renameSaving}
            />
            {renameError && <p className="text-xs text-destructive">{renameError}</p>}
            <div className="flex justify-center gap-2">
              <button
                onClick={handleRename}
                disabled={renameSaving}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {renameSaving ? <LoadingSpinner size="sm" /> : <Check size={12} />}
                Save
              </button>
              <button
                onClick={cancelRename}
                disabled={renameSaving}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-xs font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-foreground font-serif leading-tight">{recipe.title}</h1>
        )}

        <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">{recipe.description}</p>

        <div className="flex flex-wrap justify-center gap-2 mt-3">
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

        {/* Actions */}
        {!renaming && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={startRename}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 py-2 px-4 border border-border rounded-lg text-sm font-medium text-muted-foreground bg-muted hover:bg-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {deleting ? <LoadingSpinner size="sm" /> : <Trash2 size={14} />}
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Body: image + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left: image */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-56 object-cover"
            />
          ) : (
            <div className="w-full h-56 bg-muted flex items-center justify-center">
              <ChefHat size={48} className="text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Right: ingredients + nutrition + instructions */}
        <div className="space-y-5">
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-foreground font-serif mb-4">Ingredients</h2>
              <IngredientList items={recipe.ingredients} />
            </div>
          )}

          <NutritionPanel nutrition={recipe.nutrition} />

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
