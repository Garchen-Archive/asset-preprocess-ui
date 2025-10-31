"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ColumnConfig = {
  key: string;
  label: string;
  visible: boolean;
};

type ColumnVisibilityToggleProps = {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
  storageKey?: string;
};

export function ColumnVisibilityToggle({
  columns,
  onChange,
  storageKey = "table-columns-visibility",
}: ColumnVisibilityToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load saved preferences from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const savedColumns = JSON.parse(saved);
          // Merge saved preferences with current columns
          const merged = columns.map((col) => {
            const savedCol = savedColumns.find((s: ColumnConfig) => s.key === col.key);
            return savedCol ? { ...col, visible: savedCol.visible } : col;
          });
          onChange(merged);
        } catch (e) {
          // Invalid saved data, ignore
        }
      }
    }
  }, []);

  const handleToggle = (key: string) => {
    const updated = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onChange(updated);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const handleShowAll = () => {
    const updated = columns.map((col) => ({ ...col, visible: true }));
    onChange(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const handleHideAll = () => {
    const updated = columns.map((col) => ({ ...col, visible: false }));
    onChange(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  if (!mounted) return null;

  const visibleCount = columns.filter((col) => col.visible).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="3" x2="21" y1="9" y2="9" />
            <line x1="9" x2="9" y1="21" y2="9" />
          </svg>
          Columns ({visibleCount}/{columns.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={column.visible}
            onCheckedChange={() => handleToggle(column.key)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex gap-2 px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={handleShowAll}
          >
            Show All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={handleHideAll}
          >
            Hide All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
