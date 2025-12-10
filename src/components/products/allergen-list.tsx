import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface AllergenListProps {
  allergens: string[];
}

// Map allergen names to display labels and colors
const allergenConfig: Record<string, { label: string; color: string }> = {
  wheat: { label: 'Wheat', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  gluten: { label: 'Gluten', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  dairy: { label: 'Dairy', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  eggs: { label: 'Eggs', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  nuts: { label: 'Tree Nuts', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  peanuts: { label: 'Peanuts', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  soy: { label: 'Soy', color: 'bg-green-100 text-green-800 border-green-200' },
  sesame: { label: 'Sesame', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export function AllergenList({ allergens }: AllergenListProps) {
  if (!allergens || allergens.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          No major allergens detected in this product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <span>Contains Allergens:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {allergens.map((allergen) => {
          const config = allergenConfig[allergen.toLowerCase()] || {
            label: allergen,
            color: 'bg-gray-100 text-gray-800 border-gray-200',
          };

          return (
            <Badge
              key={allergen}
              variant="outline"
              className={`${config.color} px-3 py-1 text-xs font-medium`}
            >
              {config.label}
            </Badge>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        Please review all ingredients if you have severe allergies. Made in a facility that processes wheat, dairy, eggs, and nuts.
      </p>
    </div>
  );
}
