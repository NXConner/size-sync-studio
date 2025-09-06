from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

import cv2
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
import typer


app = typer.Typer(add_completion=False)


def _draw_header(c: canvas.Canvas, title: str):
    c.setFont("Helvetica-Bold", 16)
    c.drawString(36, 750, title)
    c.setFont("Helvetica", 9)
    c.drawString(36, 735, f"Generated: {datetime.utcnow().isoformat()}Z")
    c.line(36, 730, 575, 730)


def _draw_kv(c: canvas.Canvas, x: int, y: int, key: str, value: str):
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, key)
    c.setFont("Helvetica", 10)
    c.drawString(x + 180, y, value)


@app.command()
def generate(
    metrics_json: Path = typer.Option(..., exists=True, readable=True, help="Metrics JSON produced by analyze_capture"),
    overlay_image: Optional[Path] = typer.Option(None, exists=True, readable=True, help="Overlay PNG to embed"),
    pdq_summary: Optional[Path] = typer.Option(None, exists=True, readable=True, help="Optional PDQ summary JSON"),
    out_pdf: Path = typer.Option(Path("curvature_report.pdf"), help="Output PDF path"),
):
    """
    Generate a clinician-style PDF report containing curvature metrics, uncertainty (if present), and an annotated image.
    """
    data = json.loads(metrics_json.read_text(encoding="utf-8"))
    metrics = data.get("metrics", {})

    c = canvas.Canvas(str(out_pdf), pagesize=letter)
    _draw_header(c, "Curvature Screening Report (Non-Diagnostic)")

    y = 705
    _draw_kv(c, 36, y, "Straight Length (mm):", f"{metrics.get('length_mm', 0):.1f}")
    y -= 16
    _draw_kv(c, 36, y, "Arc Length (mm):", f"{metrics.get('arc_length_mm', 0):.1f}")
    y -= 16
    _draw_kv(c, 36, y, "Max Curvature (deg):", f"{metrics.get('max_curvature_deg', 0):.1f}")
    y -= 16
    _draw_kv(c, 36, y, "Hinge Location (0–1):", f"{metrics.get('hinge_location_ratio', 0):.2f}")

    y -= 20
    c.setFont("Helvetica", 9)
    c.drawString(36, y, "Interpretation: Screening/tracking only. Not a diagnosis. Consider clinician review for concerns.")

    # PDQ summary section (optional)
    if pdq_summary is not None:
        try:
            pdq = json.loads(pdq_summary.read_text(encoding="utf-8"))
            y -= 24
            c.setFont("Helvetica-Bold", 12)
            c.drawString(36, y, "PDQ Summary")
            y -= 16
            for k, v in pdq.items():
                _draw_kv(c, 36, y, f"{k}:", str(v))
                y -= 14
        except Exception:
            pass

    # Image embedding (overlay)
    if overlay_image is not None:
        try:
            # Fit into a rectangle
            img_path = str(overlay_image)
            img = cv2.imread(img_path)
            if img is not None:
                c.setFont("Helvetica-Bold", 12)
                c.drawString(36, 380, "Annotated Capture")
                # Reserve area approx 520x320
                c.drawImage(img_path, 36, 60, width=520, height=300, preserveAspectRatio=True, anchor='sw')
        except Exception:
            pass

    # Footer
    c.setFont("Helvetica", 8)
    c.drawString(36, 44, "This report is not a medical diagnosis. Consult a clinician for evaluation.")
    c.showPage()
    c.save()

    typer.echo(f"Saved PDF to {out_pdf}")


if __name__ == "__main__":
    app()

