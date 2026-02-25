import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { createRecipe, searchIngredientSuggestions } from '@/lib/api';
import { DifficultyLevel, RecipeIngredient } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

const diffActiveCls: Record<DifficultyLevel, string> = {
  Easy: 'bg-secondary text-primary border-primary',
  Medium: 'bg-amber-50 text-amber-700 border-amber-400',
  Hard: 'bg-red-50 text-red-700 border-red-400',
};

const RecipeCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [ingSearch, setIngSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!description.trim()) e.description = 'Description is required.';
    if (!prepTime || Number(prepTime) <= 0) e.prepTime = 'Enter a valid prep time.';
    if (!instructions.trim()) e.instructions = 'Instructions are required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleIngSearch = async (q: string) => {
    setIngSearch(q);
    if (q.trim()) {
      try {
        const results = await searchIngredientSuggestions(q);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const addIngredient = (s: { product_id: string; name: string; unit: string }) => {
    if (ingredients.find(i => i.product_id === s.product_id)) return;
    setIngredients(prev => [...prev, { ...s, quantity: 1 }]);
    setIngSearch('');
    setSuggestions([]);
  };

  const updateIngQty = (product_id: string, qty: number) => {
    setIngredients(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: qty } : i));
  };

  const removeIngredient = (product_id: string) => {
    setIngredients(prev => prev.filter(i => i.product_id !== product_id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const recipe = await createRecipe({
      title,
      description,
      prep_time_minutes: Number(prepTime),
      difficulty_level: difficulty,
      instructions: instructions.split('\n').filter(Boolean),
      ingredients,
    });
    setSubmitting(false);
    navigate(`/recipes/${recipe.id}`);
  };

  const inputCls = (err?: string) =>
    `w-full px-3 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition ${
      err ? 'border-destructive' : 'border-input'
    }`;

  return (
    <div className="page-wrapper">
      {/* Back + heading */}
      <div className="mb-6">
        <Link to="/recipes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline mb-3">
          <ArrowLeft size={14} /> Back to Recipes
        </Link>
        <h1 className="text-2xl font-bold text-foreground font-serif">Create Recipe</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fill in the details to add a new recipe to your collection</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: basic info */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Recipe Details</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Recipe Title *</label>
                <input
                  className={inputCls(errors.title)}
                  placeholder="e.g. Creamy Mushroom Pasta"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
                <textarea
                  className={`${inputCls(errors.description)} resize-none`}
                  placeholder="A brief description of this recipe…"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
              </div>

              {/* Prep time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Prep Time (minutes) *</label>
                <input
                  type="number"
                  min={1}
                  className={inputCls(errors.prepTime)}
                  placeholder="e.g. 30"
                  value={prepTime}
                  onChange={e => setPrepTime(e.target.value)}
                />
                {errors.prepTime && <p className="text-xs text-destructive mt-1">{errors.prepTime}</p>}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Difficulty Level</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                        difficulty === d
                          ? diffActiveCls[d]
                          : 'border-border bg-muted text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <label className="block text-sm font-semibold text-foreground mb-1.5">Instructions *</label>
              <p className="text-xs text-muted-foreground mb-2">Enter each step on a new line.</p>
              <textarea
                className={`${inputCls(errors.instructions)} resize-none`}
                placeholder="Step 1: Heat olive oil in a pan…&#10;Step 2: Add garlic and sauté…"
                rows={8}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
              {errors.instructions && <p className="text-xs text-destructive mt-1">{errors.instructions}</p>}
            </div>
          </div>

          {/* Right column: ingredients */}
          <div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 h-full">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Ingredients</h2>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  className={inputCls()}
                  placeholder="Search and add ingredients…"
                  value={ingSearch}
                  onChange={e => handleIngSearch(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                    {suggestions.map(s => (
                      <button
                        type="button"
                        key={s.product_id}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-0"
                        onClick={() => addIngredient(s)}
                      >
                        <Plus size={13} className="text-primary shrink-0" />
                        <span className="flex-1 font-medium text-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {ingredients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  No ingredients added yet
                </div>
              ) : (
                <div className="overflow-hidden border border-border rounded-lg">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_90px_60px_36px] gap-2 px-3 py-2 bg-muted/60 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingredient</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unit</span>
                    <span />
                  </div>
                  {ingredients.map((ing, idx) => (
                    <div
                      key={ing.product_id}
                      className={`grid grid-cols-[1fr_90px_60px_36px] gap-2 items-center px-3 py-2 ${
                        idx < ingredients.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground truncate">{ing.name}</span>
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={ing.quantity}
                        onChange={e => updateIngQty(ing.product_id, parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-input rounded-md bg-background text-foreground text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <span className="text-xs text-muted-foreground truncate">{ing.unit}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ing.product_id)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border">
          <Link
            to="/recipes"
            className="px-5 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors no-underline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <LoadingSpinner size="sm" /> : <Plus size={15} />}
            {submitting ? 'Creating…' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeCreate;
