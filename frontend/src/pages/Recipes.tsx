import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Plus, SlidersHorizontal, ChefHat, BookMarked } from 'lucide-react';
import { getRecipes } from '@/lib/api';
import { Recipe, DifficultyLevel } from '@/types';
import { RecipeCard, RecipeCardSkeleton } from '@/components/RecipeCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxTime, setMaxTime] = useState(180);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      getRecipes({ search, maxTime, difficulty }).then(d => { setRecipes(d); setLoading(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [search, maxTime, difficulty]);

  const diffBtnClass = (d: DifficultyLevel | '') => {
    const isActive = difficulty === d;
    if (!isActive) return 'px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-muted-foreground bg-muted hover:bg-secondary hover:text-primary transition-colors cursor-pointer';
    const map: Record<string, string> = {
      '': 'px-3 py-1.5 rounded-full border border-primary text-xs font-semibold bg-secondary text-primary cursor-pointer',
      Easy: 'px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer badge-easy border-primary/30',
      Medium: 'px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer badge-medium border-amber-300',
      Hard: 'px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer badge-hard border-red-300',
    };
    return map[d] ?? map[''];
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<BookOpen size={24} />}
        title="Recipes"
        subtitle="Discover and explore your recipe collection"
        actions={
          <Link
            to="/recipes/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors no-underline"
          >
            <Plus size={15} />
            New Recipe
          </Link>
        }
      />

      {/* Filters card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6 space-y-4">
        {/* Search + filter toggle */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
              placeholder="Search recipes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              showFilters
                ? 'border-primary bg-secondary text-primary'
                : 'border-border bg-muted text-muted-foreground hover:bg-secondary hover:text-primary'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="border-t border-border pt-4 flex flex-wrap gap-6">
            <div className="flex flex-col gap-2 min-w-48 flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Max Prep Time: <strong className="text-foreground">{maxTime >= 180 ? 'Any' : `${maxTime} min`}</strong>
              </label>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={maxTime}
                onChange={e => setMaxTime(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span><span>3 hrs</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Difficulty</label>
              <div className="flex gap-2 flex-wrap">
                {(['', ...DIFFICULTIES] as (DifficultyLevel | '')[]).map(d => (
                  <button key={d || 'all'} onClick={() => setDifficulty(d)} className={diffBtnClass(d)}>
                    {d || 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<BookMarked size={48} />}
          title="No recipes found"
          description="Try adjusting your search or filters."
          action={
            <Link to="/recipes/create" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors no-underline">
              <Plus size={15} /> Create First Recipe
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
};

export default Recipes;
