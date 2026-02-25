import { PantryItem, RecipeIngredient } from "@/types";

interface IngredientListProps {
  items: (PantryItem | RecipeIngredient)[];
  missing?: string[];
  showQuantity?: boolean;
}

export function IngredientList({
  items,
  missing = [],
  showQuantity = true,
}: IngredientListProps) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No ingredients listed.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isMissing = missing.includes(item.product_id);
        return (
          <li
            key={item.product_id}
            className={`flex items-center gap-2.5 text-sm py-1 border-b border-border last:border-0 ${isMissing ? "text-destructive" : "text-foreground"}`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${isMissing ? "bg-destructive" : "bg-primary"}`}
            />
            <span className="flex-1 font-medium">
              {"product_name" in item ? item.product_name : item.product_id}
            </span>
            {showQuantity && (
              <span className="text-muted-foreground text-xs">
                {item.quantity} {item.unit}
              </span>
            )}
            {isMissing && (
              <span className="text-xs font-semibold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                Missing
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
