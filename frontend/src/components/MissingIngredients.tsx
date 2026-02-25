import { PantryItem } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface MissingIngredientsProps {
  missing: PantryItem[];
}

export function MissingIngredients({ missing }: MissingIngredientsProps) {
  if (!missing || missing.length === 0) return null;

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-destructive shrink-0" />
        <span className="text-sm font-semibold text-destructive">Missing from Pantry</span>
      </div>
      <ul className="space-y-1.5">
        {missing.map((item) => (
          <li key={item.product_id} className="flex items-center gap-2.5 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
            <span className="font-medium text-foreground">{item.name || item.product_id}</span>
            <span className="text-muted-foreground ml-auto text-xs">{item.quantity} {item.unit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
