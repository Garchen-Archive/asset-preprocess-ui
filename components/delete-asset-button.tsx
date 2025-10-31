"use client";

import { Button } from "@/components/ui/button";
import { deleteAsset } from "@/lib/actions";
import { useState } from "react";

export function DeleteAssetButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!showConfirm) {
    return (
      <Button
        type="button"
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      >
        Delete Asset
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-destructive font-medium">Are you sure?</span>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => deleteAsset(id)}
      >
        Yes, Delete
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
