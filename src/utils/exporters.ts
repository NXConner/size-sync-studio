import { getMeasurements, exportAll } from "@/utils/storage";
import type { Measurement } from "@/types";

// Lightweight browser download helper
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function measurementsToCsv(measurements: Measurement[]): string {
  const headers = [
    "id",
    "date",
    "length",
    "girth",
    "notes",
    "sessionId",
    "photoUrl",
    "isPreSession",
  ];
  const rows = measurements
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => [
      m.id,
      m.date,
      String(m.length ?? ""),
      String(m.girth ?? ""),
      (m.notes ?? "").split("\n").join(" ").split('"').join('""'),
      m.sessionId ?? "",
      m.photoUrl ?? "",
      String(Boolean(m.isPreSession)),
    ]);
  const headerLine = headers.join(",");
  const dataLines = rows
    .map((cols) =>
      cols
        .map((val) => {
          const str = String(val);
          const needsQuotes = /[",\n]/.test(str);
          const v = str.split('"').join('""');
          return needsQuotes ? `"${v}"` : v;
        })
        .join(","),
    )
    .join("\n");
  return `${headerLine}\n${dataLines}`;
}

export function exportMeasurementsCsv(): void {
  const csv = measurementsToCsv(getMeasurements());
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(`measurements_${new Date().toISOString()}.csv`, blob);
}

export async function exportAllJson(): Promise<void> {
  const blob = await exportAll();
  downloadBlob(`health_data_${new Date().toISOString()}.json`, blob);
}

// Simple PDF summary (no charts) using jsPDF
export async function exportPdfSummary(): Promise<void> {
  const jsPDF = (await import("jspdf")).jsPDF;
  const doc = new jsPDF();

  const measurements = getMeasurements()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = measurements[measurements.length - 1];

  let y = 15;
  doc.setFontSize(16);
  doc.text("Health Report", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 8;

  doc.setFontSize(12);
  doc.text("Latest Measurement", 14, y);
  y += 6;
  if (latest) {
    doc.setFontSize(10);
    doc.text(`Date: ${latest.date}`, 14, y); y += 5;
    doc.text(`Length: ${latest.length}`, 14, y); y += 5;
    doc.text(`Girth: ${latest.girth}`, 14, y); y += 5;
    if (latest.notes) { doc.text(`Notes: ${latest.notes.slice(0, 90)}`, 14, y); y += 5; }
  } else {
    doc.setFontSize(10);
    doc.text("No measurements found.", 14, y); y += 5;
  }

  // Basic trend summary
  const first = measurements[0];
  if (first && latest) {
    y += 6;
    doc.setFontSize(12);
    doc.text("Trend Summary", 14, y); y += 6;
    doc.setFontSize(10);
    doc.text(`Length change: ${(latest.length - first.length).toFixed(2)}`, 14, y); y += 5;
    doc.text(`Girth change: ${(latest.girth - first.girth).toFixed(2)}`, 14, y); y += 5;
  }

  doc.save(`health_report_${new Date().toISOString().slice(0,10)}.pdf`);
}

