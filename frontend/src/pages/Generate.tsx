import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ShoppingBasket, BookOpen, RefreshCw, Clock, ChefHat,
  AlertCircle, Zap, Flame, Beef, Wheat, Droplets, UtensilsCrossed,
} from 'lucide-react';
import { getPantry, generateRecipeFromPantry, generateRecipeAIEnhanced } from '@/lib/api';
import { normalizeRecipe } from '@/lib/utils';
import { PantryItem, Recipe } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

type GenerateMode = 'pantry-only' | 'ai-enhanced';

const diffBadge: Record<string, string> = {
  Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard',
};

const Generate = () => {
  const navigate = useNavigate();
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<GenerateMode>('pantry-only');

  useEffect(() => {
    getPantry()
      .then(data => setPantry(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load pantry'))
      .finally(() => setLoadingPantry(false));
  }, []);

  const handleGenerate = async () => {
    if (pantry.length === 0) { setError('Add items to your pantry first.'); return; }
    setGenerating(true);
    setResult(null);
    setError('');
    try {
      const ids = pantry.map(i => i.product_id);
      const raw = mode === 'ai-enhanced'
        ? await generateRecipeAIEnhanced(ids)
        : await generateRecipeFromPantry(ids);
      setResult(normalizeRecipe(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
    } finally {
      setGenerating(false);
    }
  };

  const instructions: string[] = result
    ? Array.isArray(result.instructions)
      ? result.instructions
      : result.instructions.split('\n').filter(Boolean)
    : [];

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<Sparkles size={24} />}
        title="AI Chef"
        subtitle="Generate a recipe from your pantry — saved automatically"
      />

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">

        {/* ── Left panel ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Mode toggle */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Generation Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'pantry-only' as GenerateMode, icon: ShoppingBasket, label: 'Pantry Only',  desc: 'Uses only what you have' },
                { id: 'ai-enhanced'  as GenerateMode, icon: Zap,           label: 'AI Enhanced',   desc: 'May suggest extra ingredients' },
              ]).map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex flex-col gap-1 px-3 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    mode === id
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border bg-muted/50 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Icon size={13} /> {label}
                  </span>
                  <span className="text-xs leading-tight opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pantry summary */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBasket size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Your Pantry</h2>
              {!loadingPantry && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {pantry.length} item{pantry.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {loadingPantry ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" label="Loading…" />
              </div>
            ) : pantry.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">Your pantry is empty.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {pantry.map(item => (
                  <span key={item.product_id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                    {item.product_name}
                    <span className="text-muted-foreground opacity-70">· {item.quantity} {item.unit}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || loadingPantry || pantry.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {generating
              ? <><LoadingSpinner size="sm" /> Generating…</>
              : <><Sparkles size={16} /> Generate Recipe</>}
          </button>

          {generating && (
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              {mode === 'ai-enhanced'
                ? 'AI is crafting an enhanced recipe — this may take a moment…'
                : 'Analyzing your pantry and crafting a recipe…'}
            </p>
          )}
        </div>

        {/* ── Right panel ─────────────────────────────────────────── */}
        <div>
          {!result && !generating && (
            <div className="bg-card border border-dashed border-border rounded-xl p-10">
              <EmptyState
                icon={<ChefHat size={44} />}
                title="No recipe yet"
                description="Choose a mode and click Generate Recipe."
              />
            </div>
          )}

          {generating && (
            <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center justify-center gap-3 min-h-64">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground animate-pulse">Crafting your recipe…</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">

              {/* ── Hero card ── */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                <div className="p-6">

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wide">
                      <Sparkles size={10} />
                      {mode === 'ai-enhanced' ? 'AI Enhanced' : 'AI Generated'}
                    </span>
                    <span className="ml-auto text-xs text-primary bg-primary/8 border border-primary/20 px-2.5 py-0.5 rounded-full font-medium">
                      ✓ Saved to collection
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground font-serif leading-tight mb-2">
                    {result.title}
                  </h2>

                  {result.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {result.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      <Clock size={12} /> {result.prep_time_minutes} min
                    </span>
                    <span className={diffBadge[result.difficulty_level] ?? 'badge-easy'}>
                      {result.difficulty_level}
                    </span>
                    {result.ingredients && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <UtensilsCrossed size={12} /> {result.ingredients.length} ingredients
                      </span>
                    )}
                  </div>

                  {/* Nutrition bar */}
                  {result.nutrition && (
                    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-xl border border-border mb-5">
                      <div className="flex flex-col items-center gap-0.5">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-base font-bold text-foreground leading-none mt-0.5">
                          {result.nutrition.calories_kcal}
                        </span>
                        <span className="text-[10px] text-muted-foreground">kcal</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Beef size={14} className="text-blue-500" />
                        <span className="text-base font-bold text-foreground leading-none mt-0.5">
                          {result.nutrition.protein_g}g
                        </span>
                        <span className="text-[10px] text-muted-foreground">protein</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Wheat size={14} className="text-amber-500" />
                        <span className="text-base font-bold text-foreground leading-none mt-0.5">
                          {result.nutrition.carbs_g}g
                        </span>
                        <span className="text-[10px] text-muted-foreground">carbs</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Droplets size={14} className="text-rose-500" />
                        <span className="text-base font-bold text-foreground leading-none mt-0.5">
                          {result.nutrition.fat_g}g
                        </span>
                        <span className="text-[10px] text-muted-foreground">fat</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={13} /> Regenerate
                    </button>
                    <button
                      onClick={() => navigate(`/recipes/${result.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <BookOpen size={13} /> View Full Recipe
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Ingredients + Instructions ── */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.7fr] gap-4">

                {/* Ingredients */}
                {result.ingredients && result.ingredients.length > 0 && (
                  <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <UtensilsCrossed size={14} className="text-primary" /> Ingredients
                    </h3>
                    <ul className="space-y-0">
                      {result.ingredients.map((ing) => (
                        <li key={ing.product_id} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="flex-1 text-sm font-medium text-foreground">{ing.product_name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {ing.quantity} {ing.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ChefHat size={14} className="text-primary" /> Instructions
                  </h3>
                  <ol className="space-y-4">
                    {instructions.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground leading-relaxed pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;
