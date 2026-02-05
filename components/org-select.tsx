"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

export interface OrgOption {
  id: string;
  code: string;
  name: string;
}

interface OrgSelectProps {
  organizations: OrgOption[];
  defaultValue?: string | null;
  value?: string | null;
  onChange?: (orgId: string) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function OrgSelect({
  organizations,
  defaultValue,
  value,
  onChange,
  name = "organizationId",
  label,
  placeholder = "Search orgs by code or name...",
  required = false,
  disabled = false,
}: OrgSelectProps) {
  const [search, setSearch] = useState("");
  const [internalSelectedId, setInternalSelectedId] = useState<string>(defaultValue || "");
  const selectedId = value !== undefined ? (value || "") : internalSelectedId;
  const setSelectedId = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalSelectedId(id);
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  const filteredOrgs = useMemo(() => {
    if (!search) return organizations;
    const searchLower = search.toLowerCase();
    return organizations.filter(
      (org) =>
        org.code.toLowerCase().includes(searchLower) ||
        org.name.toLowerCase().includes(searchLower)
    );
  }, [organizations, search]);

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  const getOrgLabel = (org: OrgOption) => `${org.code} - ${org.name}`;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={isOpen ? search : (selectedOrg ? getOrgLabel(selectedOrg) : "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        />

        <input type="hidden" name={name} value={selectedId} />

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
              onClick={() => {
                setSelectedId("");
                setSearch("");
                setIsOpen(false);
              }}
            >
              <span className="text-muted-foreground">None</span>
            </div>
            {filteredOrgs.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No orgs found
              </div>
            ) : (
              filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm ${
                    selectedId === org.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(org.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <span className="font-mono text-xs text-muted-foreground">{org.code}</span>
                  <span className="ml-2">{org.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
