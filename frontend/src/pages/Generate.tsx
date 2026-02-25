import { useState, useEffect } from 'react';
import { Sparkles, ShoppingBasket, BookmarkPlus, RefreshCw, Clock, ChefHat, AlertCircle } from 'lucide-react';
import { getPantry, generateRecipeFromPantry, createRecipe } from '@/lib/api';
import { PantryItem, Recipe } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { IngredientList } from '@/components/IngredientList';
import { NutritionPanel } from '@/components/NutritionPanel';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

const diffClass: Record<string, string> = {
  Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard',
};

const Generate = () => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load pantry on mount
  useEffect(() => {
    const loadPantry = async () => {
      try {
        setError('');
        const data = await getPantry();
        setPantry(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pantry');
      } finally {
        setLoadingPantry(false);
      }
    };
    loadPantry();
  }, []);

  // Generate recipe from selected pantry items
  const handleGenerate = async () => {
    if (pantry.length === 0) {
      setError('Please add items to your pantry first');
      return;
    }

    setGenerating(true);
    setResult(null);
    setSaved(false);
    setError('');
    
    try {
      const productIds = pantry.map(item => item.product_id);
      const recipe = await generateRecipeFromPantry(productIds);
      setResult(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
    } finally {
      setGenerating(false);
    }
  };

  // Save generated recipe
  const handleSaveRecipe = async () => {
    if (!result) return;

    setSaving(true);
    setError('');
    try {
      await createRecipe({
        title: result.title,
        description: result.description,
        instructions: result.instructions,
        prep_time_minutes: result.prep_time_minutes,
        difficulty_level: result.difficulty_level,
        image_url: result.image_url,
        ingredients: result.ingredients?.map(ing => ({
          product_id: ing.product_id,
          quantity: ing.quantity,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<Sparkles size={24} />}
        title="AI Chef"
        subtitle="Generate a recipe from your pantry"
      />

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pantry + generate */}
        <div className="space-y-4">
          {/* Pantry Summary */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBasket size={17} className="text-primary" />
              <h2 className="text-base font-semibold text-foreground">Your Pantry</h2>
              {!loadingPantry && (
                <span className="ml-auto text-xs text-muted-foreground">{pantry.length} items</span>
              )}
            </div>

            {loadingPantry ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner size="sm" label="Loading pantry…" />
              </div>
            ) : pantry.length === 0 ? (
              <EmptyState
                icon={<ShoppingBasket size={32} />}
                title="Pantry is empty"
                description="Add some ingredients to your pantry first."
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {pantry.map(item => (
                  <span
                    key={item.product_id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                  >
                    {item.name}
                    <span className="text-muted-foreground">· {item.quantity} {item.unit}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || loadingPantry || pantry.length === 0 || saving}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-xl text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                Generating recipe…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Recipe
              </>
            )}
          </button>

          {generating && (
            <p className="text-sm text-center text-muted-foreground animate-pulse">
              The AI Chef is analyzing your pantry and crafting a recipe…
            </p>
          )}
        </div>

        {/* Right: Result */}
        <div>
          {!result && !generating && (
            <div className="bg-card border border-dashed border-border rounded-xl p-8">
              <EmptyState
                icon={<ChefHat size={40} />}
                title="No recipe generated yet"
                description="Click Generate Recipe to let the AI Chef create something from your pantry."
              />
            </div>
          )}

          {generating && (
            <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center min-h-48">
              <LoadingSpinner size="lg" label="Crafting your recipe…" />
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Recipe header card */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Generated</span>
                    <h2 className="text-xl font-bold text-foreground font-serif mt-0.5">{result.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{result.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={13} />{result.prep_time_minutes} min
                  </span>
                  <span className={diffClass[result.difficulty_level] ?? 'badge-easy'}>
                    {result.difficulty_level}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={handleSaveRecipe}
                    disabled={saved || saving}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                      saved ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <BookmarkPlus size={14} />
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save to Collection'}
                  </button>
                </div>
              </div>

              {/* Ingredients */}
              {result.ingredients && result.ingredients.length > 0 && (
                <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Ingredients</h3>
                  <IngredientList items={result.ingredients} missing={[]} />
                </div>
              )}

              {/* Nutrition */}
              <NutritionPanel nutrition={result.nutrition} />

              {/* Instructions */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {(Array.isArray(result.instructions)
                    ? result.instructions
                    : [result.instructions]
                  ).map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;

