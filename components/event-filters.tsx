"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollapsibleFilterSection } from "@/components/collapsible-filter-section";

interface EventFiltersProps {
  search: string;
  viewFilter: string;
  statusFilter: string;
  typeFilter: string;
  sourceFilter: string;
  organizerFilter: string;
  hostingCenterFilter: string;
  countryFilter: string;
  locationRawFilter: string;
  metadataSearch: string;
  dateFromFilter: string;
  dateToFilter: string;
  topicFilter: string;
  categoryFilter: string;
  availableTypes: { type: string | null }[];
  availableOrganizers: { id: string; name: string }[];
  availableHostingCenters: string[];
  availableCountries: string[];
  availableLocationTexts: string[];
  availableTopics: string[];
  availableCategories: string[];
}

export function EventFilters({
  search,
  viewFilter,
  statusFilter,
  typeFilter,
  sourceFilter,
  organizerFilter,
  hostingCenterFilter,
  countryFilter,
  locationRawFilter,
  metadataSearch,
  dateFromFilter,
  dateToFilter,
  topicFilter,
  categoryFilter,
  availableTypes,
  availableOrganizers,
  availableHostingCenters,
  availableCountries,
  availableLocationTexts,
  availableTopics,
  availableCategories,
}: EventFiltersProps) {
  const dateFilterCount = (dateFromFilter ? 1 : 0) + (dateToFilter ? 1 : 0);

  const contentFilterCount =
    (topicFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (organizerFilter ? 1 : 0);

  const metadataFilterCount =
    (hostingCenterFilter ? 1 : 0) +
    (countryFilter ? 1 : 0) +
    (locationRawFilter ? 1 : 0) +
    (metadataSearch ? 1 : 0);

  const hasActiveFilters =
    search ||
    viewFilter !== "all" ||
    statusFilter ||
    typeFilter ||
    sourceFilter ||
    organizerFilter ||
    hostingCenterFilter ||
    countryFilter ||
    locationRawFilter ||
    metadataSearch ||
    dateFromFilter ||
    dateToFilter ||
    topicFilter ||
    categoryFilter;

  return (
    <form className="rounded-lg border p-4" method="GET">
      {/* Primary filters - always visible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1.5 block">Search</label>
          <Input
            name="search"
            placeholder="Search by event name..."
            defaultValue={search}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">View</label>
          <select
            name="view"
            defaultValue={viewFilter}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
          >
            <option value="top-level">Top-Level Events</option>
            <option value="all">All Events</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Status</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="null">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
            <option value="Needs Review">Needs Review</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Type</label>
          <select
            name="type"
            defaultValue={typeFilter}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            {availableTypes.map((t) => (
              <option key={t.type} value={t.type!}>
                {t.type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Source</label>
          <select
            name="source"
            defaultValue={sourceFilter}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Sources</option>
            <option value="admin_tool">Admin Tool</option>
            <option value="google_sheet">Google Sheet</option>
            <option value="migration">Migration</option>
            <option value="null">No Source</option>
          </select>
        </div>
      </div>

      {/* Date Range Filter */}
      <CollapsibleFilterSection
        title="Date Range"
        badge={dateFilterCount}
        defaultOpen={dateFilterCount > 0}
      >
        <p className="text-xs text-muted-foreground mb-3">
          Filter events by start date range
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">From</label>
            <Input
              type="date"
              name="dateFrom"
              defaultValue={dateFromFilter}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">To</label>
            <Input
              type="date"
              name="dateTo"
              defaultValue={dateToFilter}
            />
          </div>
        </div>
      </CollapsibleFilterSection>

      {/* Topic, Category, Organizer Filters */}
      <CollapsibleFilterSection
        title="Topic / Category / Organizer"
        badge={contentFilterCount}
        defaultOpen={contentFilterCount > 0}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableTopics.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Topic</label>
              <select
                name="topic"
                defaultValue={topicFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Topics</option>
                {availableTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <select
                name="category"
                defaultValue={categoryFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableOrganizers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Organizer</label>
              <select
                name="organizer"
                defaultValue={organizerFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Organizers</option>
                {availableOrganizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CollapsibleFilterSection>

      {/* Sheet Metadata Filters */}
      <CollapsibleFilterSection
        title="Additional Metadata"
        badge={metadataFilterCount}
        defaultOpen={metadataFilterCount > 0}
      >
        <p className="text-xs text-muted-foreground mb-3">
          Raw values imported from Google Sheets (stored in additional_metadata)
        </p>
        <div className="mb-4">
          <label className="text-sm font-medium mb-1.5 block">Search All Metadata</label>
          <Input
            name="metadataSearch"
            placeholder="Search across all metadata fields..."
            defaultValue={metadataSearch}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableHostingCenters.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">hosting_center</label>
              <select
                name="hostingCenter"
                defaultValue={hostingCenterFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Hosting Centers</option>
                {availableHostingCenters.map((hc) => (
                  <option key={hc} value={hc}>
                    {hc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableCountries.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">country_raw</label>
              <select
                name="country"
                defaultValue={countryFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Countries</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableLocationTexts.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">location_raw</label>
              <select
                name="locationRaw"
                defaultValue={locationRawFilter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Locations</option>
                {availableLocationTexts.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CollapsibleFilterSection>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button type="submit">Apply Filters</Button>
        {hasActiveFilters && (
          <Button type="button" variant="outline" asChild>
            <Link href="/events">Clear All</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
