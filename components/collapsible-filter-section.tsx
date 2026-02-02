"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleFilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: number; // Show count of active filters
}

export function CollapsibleFilterSection({
  title,
  defaultOpen = false,
  children,
  badge,
}: CollapsibleFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 rounded-lg border bg-muted/30 px-4 py-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-semibold hover:text-foreground/80"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="mt-3 pt-3 border-t space-y-3">{children}</div>}
    </div>
  );
}
