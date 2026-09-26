// app/lib/csv.ts
// Utilidad compartida para exportar colecciones a CSV y descargarlas.

/** Escapa cada celda y las une con comas en una fila CSV. */
export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;

  return [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");
}

/**
 * Genera un CSV y dispara su descarga. El BOM inicial hace que Excel
 * reconozca correctamente los acentos en UTF-8.
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const blob = new Blob(["\uFEFF" + toCSV(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Sufijo de fecha para los nombres de archivo: 2026-09-25 */
export function todayStamp(): string {
  return new Date().toISOString().split("T")[0];
}
