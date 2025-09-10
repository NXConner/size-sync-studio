import { getMeasurements, exportAll } from "@/utils/storage";
import type { Measurement } from "@/types";
import { getPhoto } from "@/utils/storage";

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

// End-to-end encrypted JSON export using PBKDF2 + AES-GCM
async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
}

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

export async function exportAllEncrypted(password: string): Promise<void> {
  const plainBlob = await exportAll();
  const json = await plainBlob.text();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveAesKey(password, salt);
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(json));
  const payload = {
    v: 1,
    alg: 'AES-GCM',
    kdf: 'PBKDF2-SHA256-150k',
    salt_b64: toB64(salt),
    iv_b64: toB64(iv),
    data_b64: toB64(cipher),
    note: 'SizeSeeker encrypted export',
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  downloadBlob(`health_data_encrypted_${new Date().toISOString()}.json`, blob);
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

export async function exportAppointmentSummaryPdf(): Promise<void> {
  const jsPDF = (await import('jspdf')).jsPDF;
  const doc = new jsPDF();
  const measurements = getMeasurements().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = measurements[measurements.length - 1];
  doc.setFontSize(16); doc.text('Appointment Summary', 14, 16);
  doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
  let y = 32;
  doc.setFontSize(12); doc.text('Key Measurements', 14, y); y += 6;
  if (latest) {
    doc.setFontSize(10);
    doc.text(`Date: ${latest.date}`, 14, y); y += 5;
    doc.text(`Length: ${latest.length}`, 14, y); y += 5;
    doc.text(`Girth: ${latest.girth}`, 14, y); y += 5;
  } else {
    doc.setFontSize(10); doc.text('No measurements available.', 14, y); y += 5;
  }
  doc.save(`appointment_summary_${new Date().toISOString().slice(0,10)}.pdf`);
}

export async function exportClinicalPdf(): Promise<void> {
  const jsPDF = (await import('jspdf')).jsPDF;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 40;
  doc.setFontSize(18); doc.text('Clinical Health Report', 40, y); y += 20;
  doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y); y += 20;

  const measurements = getMeasurements().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const xs = measurements.map((m, i) => i);
  const lenVals = measurements.map(m => m.length);
  const girVals = measurements.map(m => m.girth);

  // Draw simple line charts
  const chart = (title: string, values: number[], color: string) => {
    doc.setFontSize(12); doc.text(title, 40, y); y += 6;
    const left = 40, top = y, width = pageW - 80, height = 120;
    doc.setDrawColor(200); doc.rect(left, top, width, height);
    if (values.length >= 2) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = Math.max(0.0001, max - min);
      doc.setDrawColor(color);
      for (let i = 0; i < values.length; i++) {
        const x = left + (i / (values.length - 1)) * width;
        const v = values[i];
        const yv = top + height - ((v - min) / range) * height;
        if (i === 0) doc.line(x, yv, x, yv); else doc.line(prevX, prevY, x, yv);
        var prevX = x, prevY = yv;
      }
    } else {
      doc.setFontSize(10); doc.text('Not enough data', left + 10, top + 20);
    }
    y = top + height + 20;
  }

  chart('Length Trend', lenVals, '#3b82f6');
  chart('Girth Trend', girVals, '#f59e0b');

  // Insert first available photo
  for (const m of measurements) {
    if (m.photoUrl) {
      try {
        const blob = await getPhoto(m.id);
        if (blob) {
          const dataUrl = await new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(blob) });
          const imgW = (pageW - 80);
          const imgH = imgW * 0.5625;
          doc.setFontSize(12); doc.text('Progress Photo', 40, y); y += 6;
          doc.addImage(dataUrl, 'JPEG', 40, y, imgW, imgH, undefined, 'FAST');
          y += imgH + 20;
        }
      } catch {}
      break;
    }
  }

  doc.save(`clinical_report_${new Date().toISOString().slice(0,10)}.pdf`);
}

