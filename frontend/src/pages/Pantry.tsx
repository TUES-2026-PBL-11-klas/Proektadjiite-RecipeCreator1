import { useState, useEffect, useRef } from 'react';
import { ShoppingBasket, Plus, Trash2, Save, Search, Check } from 'lucide-react';
import { getPantry, savePantry, searchIngredientSuggestions } from '@/lib/api';
import { PantryItem } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

const Pantry = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchIngredientSuggestions>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPantry().then(data => { setItems(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setSuggestions(searchIngredientSuggestions(search));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addIngredient = (item: { product_id: string; name: string; unit: string }) => {
    if (items.find(i => i.product_id === item.product_id)) return;
    setItems(prev => [...prev, { ...item, quantity: 1 }]);
    setSearch('');
    setShowSuggestions(false);
  };

  const updateQuantity = (product_id: string, qty: number) => {
    setItems(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: qty } : i));
  };

  const removeItem = (product_id: string) => {
    setItems(prev => prev.filter(i => i.product_id !== product_id));
  };

  const handleSave = async () => {
    const invalid = items.find(i => i.quantity <= 0);
    if (invalid) { alert('All quantities must be greater than 0.'); return; }
    setSaving(true);
    await savePantry(items);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<ShoppingBasket size={24} />}
        title="My Pantry"
        subtitle="Manage your available ingredients"
        actions={
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              saved
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {saving ? <LoadingSpinner size="sm" /> : saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Pantry'}
          </button>
        }
      />

      {/* Search */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6" ref={searchRef}>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Add Ingredient
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="Search ingredients to add (e.g. Egg, Tomato…)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => search && setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
              {suggestions.map(s => (
                <button
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
      </div>

      {/* Pantry List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" label="Loading pantry…" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket size={48} />}
          title="Your pantry is empty"
          description="Search above to add your first ingredient."
        />
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_80px_48px] gap-3 px-4 py-2.5 bg-muted/60 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingredient</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantity</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unit</span>
            <span />
          </div>

          {/* Rows */}
          {items.map((item, idx) => (
            <div
              key={item.product_id}
              className={`flex flex-col sm:grid sm:grid-cols-[1fr_120px_80px_48px] gap-2 sm:gap-3 items-start sm:items-center px-4 py-3 ${
                idx < items.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Mobile label */}
              <span className="font-medium text-foreground text-sm">{item.name || item.product_id}</span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Mobile: qty + unit inline */}
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={item.quantity}
                  onChange={e => updateQuantity(item.product_id, parseFloat(e.target.value) || 0)}
                  className="w-24 sm:w-full px-2.5 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <span className="text-sm text-muted-foreground sm:hidden">{item.unit}</span>
              </div>

              <span className="hidden sm:block text-sm text-muted-foreground">{item.unit}</span>

              <button
                onClick={() => removeItem(item.product_id)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer sm:mx-auto"
                title="Remove"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {/* Footer count */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">{items.length} ingredient{items.length !== 1 ? 's' : ''} in pantry</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pantry;
