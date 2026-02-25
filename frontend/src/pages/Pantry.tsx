import { useState, useEffect } from "react";
import {
  ShoppingBasket,
  Plus,
  Trash2,
  Save,
  Search,
  Check,
  AlertCircle,
  Package,
} from "lucide-react";
import {
  getPantry,
  addToPantry,
  updatePantryItem,
  removeFromPantry,
  searchProducts,
} from "@/lib/api";
import { PantryItem, Product } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";

const Pantry = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // Load pantry + all products on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [pantryData, productsData] = await Promise.all([
          getPantry(),
          searchProducts(),
        ]);
        setItems(pantryData);
        setAllProducts(productsData);
        const drafts: Record<string, string> = {};
        pantryData.forEach((item) => {
          drafts[item.product_id] = String(item.quantity);
        });
        setQtyDraft(drafts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pantry");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Products not yet in the pantry, optionally filtered by name
  const pantryIds = new Set(items.map((i) => i.product_id));
  const availableProducts = allProducts.filter(
    (p) =>
      !pantryIds.has(p.id) &&
      p.name.toLowerCase().includes(productFilter.toLowerCase()),
  );

  // Add a product to pantry with qty 1
  const addIngredient = async (product: Product) => {
    setSaving(true);
    setError("");
    try {
      const result = await addToPantry(product.id, 1);
      setItems((prev) => [...prev, result]);
      setQtyDraft((prev) => ({
        ...prev,
        [result.product_id]: String(result.quantity),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ingredient");
    } finally {
      setSaving(false);
    }
  };

  // Update quantity draft (while typing)
  const handleQtyChange = (productId: string, raw: string) => {
    setQtyDraft((prev) => ({ ...prev, [productId]: raw }));
  };

  // Commit draft to item on blur
  const commitQty = (productId: string) => {
    const parsed = parseFloat(qtyDraft[productId]);
    if (!isNaN(parsed) && parsed > 0) {
      setItems((prev) =>
        prev.map((i) =>
          i.product_id === productId ? { ...i, quantity: parsed } : i,
        ),
      );
    } else {
      const current = items.find((i) => i.product_id === productId);
      if (current)
        setQtyDraft((prev) => ({
          ...prev,
          [productId]: String(current.quantity),
        }));
    }
  };

  // Remove ingredient from pantry
  const removeItem = async (productId: string) => {
    setSaving(true);
    setError("");
    try {
      await removeFromPantry(productId);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setSaving(false);
    }
  };

  // Save all pantry quantities
  const handleSave = async () => {
    const invalid = items.find((i) => i.quantity <= 0);
    if (invalid) {
      setError("All quantities must be greater than 0.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      for (const item of items) {
        await updatePantryItem(item.product_id, item.quantity);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pantry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        icon={<ShoppingBasket size={24} />}
        title="My Pantry"
        subtitle="Add products from the catalog and manage your quantities"
        actions={
          <button
            onClick={handleSave}
            disabled={saving || loading || items.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              saved
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            {saved ? "Saved!" : saving ? "Saving…" : "Save Pantry"}
          </button>
        }
      />

      {/* Error */}
      {error && (
        <div className="mb-5 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" label="Loading pantry…" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ── Left: My Pantry list ──────────────────────────────── */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShoppingBasket size={15} className="text-primary" />
                My Pantry
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <ShoppingBasket
                  size={36}
                  className="text-muted-foreground/30 mb-3"
                />
                <p className="text-sm font-medium text-muted-foreground">
                  Your pantry is empty
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Add products from the catalog on the right.
                </p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_120px_72px_40px] gap-3 px-4 py-2.5 bg-muted/60 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Ingredient
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Quantity
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Unit
                  </span>
                  <span />
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item.product_id}
                    className={`flex flex-col sm:grid sm:grid-cols-[1fr_120px_72px_40px] gap-2 sm:gap-3 items-start sm:items-center px-4 py-3 ${
                      idx < items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="font-medium text-foreground text-sm">
                      {item.product_name || item.product_id}
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={qtyDraft[item.product_id] ?? ""}
                        onChange={(e) =>
                          handleQtyChange(item.product_id, e.target.value)
                        }
                        onBlur={() => commitQty(item.product_id)}
                        className="w-24 sm:w-full px-2.5 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="qty"
                        disabled={saving}
                      />
                      <span className="text-sm text-muted-foreground sm:hidden">
                        {item.unit}
                      </span>
                    </div>

                    <span className="hidden sm:block text-sm text-muted-foreground">
                      {item.unit}
                    </span>

                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer sm:mx-auto disabled:opacity-50"
                      title="Remove"
                      disabled={saving}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <div className="px-4 py-2.5 border-t border-border bg-muted/40">
                  <span className="text-xs text-muted-foreground">
                    {items.length} ingredient{items.length !== 1 ? "s" : ""} in
                    pantry
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Right: Available Products ─────────────────────────── */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <Package size={15} className="text-primary" />
                Available Products
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({availableProducts.length})
                </span>
              </h2>
              {/* Filter input */}
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="Filter products…"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                />
              </div>
            </div>

            {availableProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Package size={28} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {productFilter
                    ? `No products match "${productFilter}"`
                    : "All products are in your pantry!"}
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto divide-y divide-border">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => addIngredient(product)}
                      disabled={saving}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Add ${product.name} to pantry`}
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pantry;
