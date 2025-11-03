"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import type { Category } from "@/lib/db/schema";

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategoryName("");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(
          categories
            .map((c) => (c.id === id ? updatedCategory : c))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        setEditingName("");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This will remove it from all events and sessions.")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-4">
      {/* Create new category */}
      <div className="rounded-lg border p-4 bg-muted/20">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
            placeholder="Enter new category name..."
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={isCreating || !newCategoryName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories list */}
      <div className="rounded-lg border">
        <div className="p-4 border-b bg-muted/50">
          <h2 className="font-semibold">All Categories ({categories.length})</h2>
        </div>
        <div className="divide-y">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No categories yet. Create one above to get started.
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4 flex items-center gap-3 hover:bg-muted/50">
                {editingId === category.id ? (
                  <>
                    <Input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdate(category.id);
                        } else if (e.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdate(category.id)}
                      disabled={!editingName.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 font-medium">{category.name}</div>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
