from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import typer
from rich import print
from rich.progress import track

from aruco_scale import detect_aruco_scale
from geometry import compute_metrics
from segmentation import segment_roi


app = typer.Typer(add_completion=False)


@app.command()
def main(
    image: Path = typer.Option(..., exists=True, readable=True, help="Input image path"),
    marker_mm: float = typer.Option(20.0, help="Reference marker side length in millimeters"),
    out: Optional[Path] = typer.Option(None, help="Output overlay image path (PNG)"),
    json_out: Optional[Path] = typer.Option(None, help="Output metrics JSON path"),
):
    """
    Analyze a capture image: detect ArUco scale, segment ROI, extract centerline, compute metrics.
    """
    print("[bold]Loading image...[/bold]")
    image_bgr = cv2.imread(str(image))
    if image_bgr is None:
        raise typer.BadParameter("Failed to load image")

    # Step 1: ArUco scale detection
    print("[bold]Detecting calibration marker...[/bold]")
    scale = detect_aruco_scale(image_bgr, marker_length_mm=marker_mm)
    px_per_mm = scale.pixels_per_mm
    if px_per_mm is None:
        print("[yellow]Warning: No calibration marker detected. Results will not be scaled.[/yellow]")

    # Step 2: Segmentation (placeholder)
    print("[bold]Segmenting region of interest...[/bold]")
    mask, seg_debug = segment_roi(image_bgr)

    # Step 3: Geometry and metrics
    print("[bold]Computing centerline and metrics...[/bold]")
    metrics, geom_debug, path = compute_metrics(mask, pixels_per_mm=px_per_mm)

    # Compose overlay
    overlay = image_bgr.copy()
    seg_colored = cv2.addWeighted(overlay, 0.7, seg_debug, 0.3, 0)
    # Paste geometry debug in a corner
    gh, gw = geom_debug.shape[:2]
    seg_colored[0:gh, 0:gw] = geom_debug

    # Annotations
    y0 = 30
    line_h = 28
    texts = [
        f"px/mm: {px_per_mm:.3f}" if px_per_mm else "px/mm: N/A",
        f"Arc length (mm): {metrics.arc_length_mm:.1f}",
        f"Straight length (mm): {metrics.length_mm:.1f}",
        f"Max curvature (deg): {metrics.max_curvature_deg:.1f}",
        f"Hinge location (0-1): {metrics.hinge_location_ratio:.2f}",
        f"Markers detected: {scale.detected_markers}",
    ]
    for i, t in enumerate(texts):
        cv2.putText(seg_colored, t, (10, y0 + i * line_h), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)

    if out is not None:
        cv2.imwrite(str(out), seg_colored)
        print(f"[green]Saved overlay to {out}")

    # JSON output
    result = {
        "pixels_per_mm": px_per_mm,
        "detected_markers": scale.detected_markers,
        "metrics": asdict(metrics),
    }
    if json_out is not None:
        json_out.parent.mkdir(parents=True, exist_ok=True)
        with open(json_out, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
        print(f"[green]Saved metrics JSON to {json_out}")

    # Print to console
    print(result)


if __name__ == "__main__":
    app()

