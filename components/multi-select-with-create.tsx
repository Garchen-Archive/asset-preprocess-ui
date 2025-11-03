"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MultiSelectWithCreateProps {
  name: string;
  label: string;
  availableItems: { id: string; name: string }[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreateNew: (name: string) => Promise<{ id: string; name: string }>;
  placeholder?: string;
}

export function MultiSelectWithCreate({
  name,
  label,
  availableItems,
  selectedIds,
  onSelectionChange,
  onCreateNew,
  placeholder = "Search or create new...",
}: MultiSelectWithCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItems = availableItems.filter((item) => selectedIds.includes(item.id));

  const filteredItems = availableItems.filter(
    (item) =>
      !selectedIds.includes(item.id) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== itemId));
  };

  const handleCreateNew = async () => {
    if (!searchQuery.trim() || isCreating) return;

    // Check if already exists
    const existing = availableItems.find(
      (item) => item.name.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (existing) {
      handleToggleItem(existing.id);
      setSearchQuery("");
      return;
    }

    setIsCreating(true);
    try {
      const newItem = await onCreateNew(searchQuery.trim());
      onSelectionChange([...selectedIds, newItem.id]);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create new item:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        handleCreateNew();
      }
    }
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {/* Selected items display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1">
              {item.name}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search/Create input */}
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCreateNew}
            disabled={isCreating}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown with available items */}
      {isOpen && (
        <div className="border rounded-md shadow-lg bg-background max-h-60 overflow-y-auto">
          {searchQuery && filteredItems.length === 0 && (
            <div className="p-3 text-sm">
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isCreating}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create &quot;{searchQuery}&quot;
              </button>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="p-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted flex items-center gap-2 text-sm mb-1 border-b"
                >
                  <Plus className="h-4 w-4" />
                  Create &quot;{searchQuery}&quot;
                </button>
              )}
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    handleToggleItem(item.id);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
