"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importOrganizationsFromCSV } from "@/lib/actions";

interface CSVRow {
  Code: string;
  Name: string;
  Type: string;
  Alternative_Names?: string;
  Location_Name: string;
  Location_Type: string;
  Location_Full_Address: string;
  Location_City: string;
  Location_Country: string;
  Location_State: string;
  Location_Postal_Code: string;
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v.trim())) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx]?.trim() || "";
    });

    rows.push(row as unknown as CSVRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = false;
      }
    } else if ((char === "," || char === "\t") && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

export default function ImportOrganizationsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      setPreview(rows);

      if (rows.length === 0) {
        setError("No valid data rows found in CSV");
      }
    } catch (err) {
      setError("Failed to parse CSV file");
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const response = await importOrganizationsFromCSV(preview);
      setResult(response);

      if ((response.created > 0 || response.updated > 0) && response.errors.length === 0) {
        // All successful, redirect after a short delay
        setTimeout(() => {
          router.push("/organizations");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/organizations"
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          &larr; Back to Organizations
        </Link>
        <h1 className="text-3xl font-bold">Import Organizations from CSV</h1>
        <p className="text-muted-foreground mt-2">
          Upload a CSV file to bulk import organizations with their locations and addresses.
        </p>
      </div>

      {/* Expected Format */}
      <div className="rounded-lg border p-4 bg-muted/30">
        <h2 className="font-semibold mb-2">Expected CSV Columns</h2>
        <code className="text-xs block whitespace-pre-wrap text-muted-foreground">
          Code, Name, Type, Alternative_Names, Location_Name, Location_Type, Location_Full_Address, Location_City, Location_State, Location_Country, Location_Postal_Code
        </code>
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <p><strong>New orgs:</strong> Creates organization, primary location, and primary address linked together.</p>
          <p><strong>Existing orgs:</strong> Updates org name/type, location name/type. Address fields are only filled if currently empty (merge/fill-only).</p>
        </div>
      </div>

      {/* File Upload */}
      <div className="rounded-lg border p-6">
        <Label htmlFor="csvFile">Select CSV File</Label>
        <Input
          id="csvFile"
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFileChange}
          className="mt-2"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className={`rounded-lg border p-4 ${result.errors.length > 0 ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"}`}>
          <div className="font-medium space-y-1">
            {result.created > 0 && (
              <p className="text-green-700">Created {result.created} new organization(s).</p>
            )}
            {result.updated > 0 && (
              <p className="text-blue-700">Updated {result.updated} existing organization(s).</p>
            )}
            {result.created === 0 && result.updated === 0 && result.errors.length === 0 && (
              <p className="text-muted-foreground">No changes made.</p>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-yellow-700 font-medium">Errors ({result.errors.length}):</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside mt-1">
                {result.errors.slice(0, 10).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {result.errors.length > 10 && (
                  <li>...and {result.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Preview ({preview.length} rows)</h2>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : `Import/Update ${preview.length} Organizations`}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Location Name</th>
                  <th className="px-3 py-2 text-left font-medium">Location Type</th>
                  <th className="px-3 py-2 text-left font-medium">City</th>
                  <th className="px-3 py-2 text-left font-medium">Country</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="px-3 py-2 font-mono">{row.Code || "—"}</td>
                    <td className="px-3 py-2">{row.Name || "—"}</td>
                    <td className="px-3 py-2">{row.Type || "—"}</td>
                    <td className="px-3 py-2">{row.Location_Name || "—"}</td>
                    <td className="px-3 py-2">{row.Location_Type || "—"}</td>
                    <td className="px-3 py-2">{row.Location_City || "—"}</td>
                    <td className="px-3 py-2">{row.Location_Country || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 20 && (
              <p className="text-sm text-muted-foreground p-3 text-center">
                ...and {preview.length - 20} more rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/organizations">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
