"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface MultiSelectWithCreateProps {
  name: string;
  label: string;
  availableItems: { id: string; name: string }[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function MultiSelectWithCreate({
  name,
  label,
  availableItems,
  selectedIds,
  onSelectionChange,
}: MultiSelectWithCreateProps) {
  const selectedItems = availableItems.filter((item) => selectedIds.includes(item.id));
  const unselectedItems = availableItems.filter((item) => !selectedIds.includes(item.id));

  const handleAdd = (itemId: string) => {
    onSelectionChange([...selectedIds, itemId]);
  };

  const handleRemove = (itemId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== itemId));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Selected items display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20 min-h-[40px]">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1">
              {item.name}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown to add items */}
      {unselectedItems.length > 0 && (
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAdd(e.target.value);
              e.target.value = "";
            }
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Add {label.toLowerCase()}...</option>
          {unselectedItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}

      {/* Hidden inputs for form submission */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
