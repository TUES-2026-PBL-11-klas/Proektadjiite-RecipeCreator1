import { useState, useEffect } from 'react';
import { Sparkles, ShoppingBasket, BookmarkPlus, RefreshCw, Clock, ChefHat } from 'lucide-react';
import { getPantry, generateRecipe } from '@/lib/api';
import { PantryItem, GenerateResponse } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { IngredientList } from '@/components/IngredientList';
import { MissingIngredients } from '@/components/MissingIngredients';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

const diffClass: Record<string, string> = {
  Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard',
};

const Generate = () => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPantry().then(data => { setPantry(data); setLoadingPantry(false); });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    setSaved(false);
    const response = await generateRecipe(pantry);
    setResult(response);
    setGenerating(false);
  };

  const missingIds = result?.missing_ingredients.map(m => m.product_id) || [];

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<Sparkles size={24} />}
        title="AI Chef"
        subtitle="Generate a recipe from your pantry"
      />

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
            disabled={generating || loadingPantry || pantry.length === 0}
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
                    <h2 className="text-xl font-bold text-foreground font-serif mt-0.5">{result.recipe.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{result.recipe.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={13} />{result.recipe.prep_time_minutes} min
                  </span>
                  <span className={diffClass[result.recipe.difficulty_level] ?? 'badge-easy'}>
                    {result.recipe.difficulty_level}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={() => setSaved(true)}
                    disabled={saved}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                      saved ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <BookmarkPlus size={14} />
                    {saved ? 'Saved!' : 'Save to Collection'}
                  </button>
                </div>
              </div>

              {/* Ingredients */}
              {result.recipe.ingredients && result.recipe.ingredients.length > 0 && (
                <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Ingredients</h3>
                  <IngredientList items={result.recipe.ingredients} missing={missingIds} />
                </div>
              )}

              {/* Missing */}
              <MissingIngredients missing={result.missing_ingredients} />

              {/* Instructions */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {(Array.isArray(result.recipe.instructions)
                    ? result.recipe.instructions
                    : [result.recipe.instructions]
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
