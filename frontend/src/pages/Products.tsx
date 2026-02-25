import { useState, useEffect, useRef } from 'react';
import { Package, Plus, Trash2, Pencil, Search, Check, X, AlertCircle } from 'lucide-react';
import { searchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { Product } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

const UNITS = ['g', 'kg', 'ml', 'l', 'pcs', 'tbsp', 'tsp', 'cup', 'oz', 'lb', 'unit'];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  // Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [addErrors, setAddErrors] = useState<{ name?: string; unit?: string }>({});

  // Edit state: keyed by product id
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editErrors, setEditErrors] = useState<{ name?: string; unit?: string }>({});

  // Confirm delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addNameRef = useRef<HTMLInputElement>(null);

  // Debounced load
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await searchProducts(search || undefined);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Focus add form when shown
  useEffect(() => {
    if (showAdd) setTimeout(() => addNameRef.current?.focus(), 50);
  }, [showAdd]);

  // ── Add ──────────────────────────────────────────────────────────────────

  const validateNew = () => {
    const e: { name?: string; unit?: string } = {};
    if (!newName.trim()) e.name = 'Name is required.';
    if (!newUnit.trim()) e.unit = 'Unit is required.';
    setAddErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNew()) return;
    setBusy(true);
    setError('');
    try {
      const product = await createProduct(newName.trim(), newUnit.trim());
      setProducts(prev => [...prev, product].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewUnit('');
      setAddErrors({});
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setBusy(false);
    }
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setNewName('');
    setNewUnit('');
    setAddErrors({});
  };

  // ── Edit ─────────────────────────────────────────────────────────────────

  const startEdit = (product: Product) => {
    setEditId(product.id);
    setEditName(product.name);
    setEditUnit(product.unit);
    setEditErrors({});
    setDeleteId(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditUnit('');
    setEditErrors({});
  };

  const validateEdit = () => {
    const e: { name?: string; unit?: string } = {};
    if (!editName.trim()) e.name = 'Name is required.';
    if (!editUnit.trim()) e.unit = 'Unit is required.';
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = async (product: Product) => {
    if (!validateEdit()) return;
    // No changes
    if (editName.trim() === product.name && editUnit.trim() === product.unit) {
      cancelEdit();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const updated = await updateProduct(product.id, {
        name: editName.trim() !== product.name ? editName.trim() : undefined,
        unit: editUnit.trim() !== product.unit ? editUnit.trim() : undefined,
      });
      setProducts(prev =>
        prev.map(p => (p.id === updated.id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setBusy(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setBusy(true);
    setError('');
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-2.5 py-1.5 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition ${
      err ? 'border-destructive' : 'border-input'
    }`;

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<Package size={24} />}
        title="Product Catalog"
        subtitle="Manage the ingredient catalog used across recipes and pantries"
        actions={
          !showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Add Product
            </button>
          ) : null
        }
      />

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Add Product form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">New Product</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-start">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Name *
              </label>
              <input
                ref={addNameRef}
                className={inputCls(addErrors.name)}
                placeholder="e.g. Olive Oil"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                disabled={busy}
              />
              {addErrors.name && <p className="text-xs text-destructive mt-1">{addErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Unit *
              </label>
              <div className="space-y-1.5">
                <input
                  className={inputCls(addErrors.unit)}
                  placeholder="e.g. ml, g, pcs"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  list="unit-suggestions"
                  disabled={busy}
                />
                <datalist id="unit-suggestions">
                  {UNITS.map(u => <option key={u} value={u} />)}
                </datalist>
              </div>
              {addErrors.unit && <p className="text-xs text-destructive mt-1">{addErrors.unit}</p>}
            </div>

            <div className="flex gap-2 pt-6 sm:pt-[26px]">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? <LoadingSpinner size="sm" /> : <Check size={14} />}
                Save
              </button>
              <button
                type="button"
                onClick={cancelAdd}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-60"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Search Products
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            placeholder="Filter by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" label="Loading products…" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title="No products found"
          description={search ? `No products match "${search}".` : 'Click Add Product to create the first one.'}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_140px_120px] gap-3 px-4 py-2.5 bg-muted/60 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unit</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Actions</span>
          </div>

          {products.map((product, idx) => (
            <div
              key={product.id}
              className={`px-4 py-3 ${idx < products.length - 1 ? 'border-b border-border' : ''}`}
            >
              {editId === product.id ? (
                /* ── Inline edit row ── */
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px] gap-3 items-start">
                  <div>
                    <input
                      className={inputCls(editErrors.name)}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      disabled={busy}
                      autoFocus
                    />
                    {editErrors.name && <p className="text-xs text-destructive mt-1">{editErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      className={inputCls(editErrors.unit)}
                      value={editUnit}
                      onChange={e => setEditUnit(e.target.value)}
                      disabled={busy}
                      list="unit-suggestions"
                    />
                    {editErrors.unit && <p className="text-xs text-destructive mt-1">{editErrors.unit}</p>}
                  </div>
                  <div className="flex gap-1.5 justify-end items-center">
                    <button
                      onClick={() => handleEdit(product)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
                      title="Save"
                    >
                      {busy ? <LoadingSpinner size="sm" /> : <Check size={13} />}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={busy}
                      className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : deleteId === product.id ? (
                /* ── Delete confirmation row ── */
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-foreground font-medium flex-1">
                    Delete <strong>{product.name}</strong>? This cannot be undone.
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? <LoadingSpinner size="sm" /> : <Trash2 size={13} />}
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-border text-xs font-medium text-muted-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X size={13} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Normal row ── */
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px] gap-2 sm:gap-3 items-center">
                  <span className="font-medium text-foreground text-sm">{product.name}</span>
                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                  <div className="flex gap-1.5 justify-start sm:justify-end">
                    <button
                      onClick={() => startEdit(product)}
                      disabled={busy}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => { setDeleteId(product.id); setEditId(null); }}
                      disabled={busy}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : ' in catalog'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
