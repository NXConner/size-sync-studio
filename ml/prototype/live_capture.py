from __future__ import annotations

import json
import time
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Deque, Optional, Tuple

import cv2
import numpy as np
import typer
from collections import deque
from rich import print

from aruco_scale import detect_aruco_scale
from geometry import compute_metrics
from segmentation import segment_roi


app = typer.Typer(add_completion=False)


def _brightness_score(gray: np.ndarray) -> Tuple[float, bool]:
    mean = float(np.mean(gray))
    # Normalize 0..255 -> 0..1 around ideal ~140
    ideal = 140.0
    spread = 60.0
    score = max(0.0, 1.0 - abs(mean - ideal) / spread)
    ok = 80.0 <= mean <= 200.0
    return score, ok


def _stability_score(prev_gray: Optional[np.ndarray], gray: np.ndarray) -> Tuple[float, bool]:
    if prev_gray is None:
        return 0.5, False
    diff = cv2.absdiff(prev_gray, gray)
    motion = float(np.mean(diff))  # 0..255
    # Lower motion -> higher score
    score = max(0.0, min(1.0, 1.0 - (motion / 20.0)))
    ok = motion < 8.0
    return score, ok


def _marker_distance_score(side_px: Optional[float], frame_diag_px: float) -> Tuple[float, bool]:
    if side_px is None or side_px <= 0:
        return 0.0, False
    # Heuristic: ideal marker side size ~ 6% of frame diagonal
    ideal = 0.06 * frame_diag_px
    err = abs(side_px - ideal)
    score = max(0.0, 1.0 - (err / (0.04 * frame_diag_px)))
    ok = 0.035 * frame_diag_px <= side_px <= 0.09 * frame_diag_px
    return score, ok


def _roi_area_score(mask: np.ndarray) -> Tuple[float, bool]:
    area = float(np.count_nonzero(mask))
    total = float(mask.size)
    ratio = area / total if total > 0 else 0.0
    # Ideal area ratio between 3% and 30%
    ok = 0.03 <= ratio <= 0.30
    # Score peaks at 0.12
    ideal = 0.12
    score = max(0.0, 1.0 - (abs(ratio - ideal) / 0.12))
    return score, ok


@app.command()
def live(
    marker_mm: float = typer.Option(20.0, help="Calibration marker side length in millimeters"),
    burst_frames: int = typer.Option(6, min=3, max=12, help="Frames to capture in a burst"),
    threshold: int = typer.Option(85, help="Good shot score threshold (0-100)"),
    consecutive: int = typer.Option(10, help="Consecutive frames above threshold before capture"),
    camera_index: int = typer.Option(0, help="OpenCV camera index"),
    out_dir: Path = typer.Option(Path("captures"), help="Output directory for captures and results"),
):
    """
    Live capture with overlays and auto-capture based on quality thresholds.
    Saves a burst of frames and analyzes the best frame to produce overlay and JSON metrics.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError("Could not open camera")

    prev_gray: Optional[np.ndarray] = None
    above_counter = 0
    font = cv2.FONT_HERSHEY_SIMPLEX
    last_capture_time = 0.0

    print("[bold]Starting live view. Press 'q' to quit.[/bold]")
    while True:
        ok, frame = cap.read()
        if not ok:
            break

        display = frame.copy()
        h, w = display.shape[:2]
        diag = float(np.hypot(h, w))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Scale detection
        scale = detect_aruco_scale(frame, marker_length_mm=marker_mm)
        px_per_mm = scale.pixels_per_mm
        mean_side_px = scale.mean_marker_side_px

        # Segmentation (placeholder)
        mask, seg_debug = segment_roi(frame)

        # Quality components
        b_score, b_ok = _brightness_score(gray)
        s_score, s_ok = _stability_score(prev_gray, gray)
        d_score, d_ok = _marker_distance_score(mean_side_px, diag)
        r_score, r_ok = _roi_area_score(mask)

        comps = [b_score, s_score, d_score, r_score]
        weights = [0.25, 0.25, 0.25, 0.25]
        good_score = int(100 * sum(w * c for w, c in zip(weights, comps)))
        all_ok = b_ok and s_ok and d_ok and r_ok and (scale.detected_markers > 0)

        # Draw overlays
        # Blend segmentation mask
        overlay = display.copy()
        overlay[mask > 0] = (0, 255, 0)
        display = cv2.addWeighted(display, 0.7, overlay, 0.3, 0)
        # Draw ArUco markers
        display = scale.debug_image_bgr

        # HUD text
        y0 = 24
        dy = 22
        hud = [
            f"Good score: {good_score}",
            f"Lighting: {'OK' if b_ok else 'Fix'}",
            f"Stability: {'OK' if s_ok else 'Hold steady'}",
            f"Marker: {'OK' if scale.detected_markers>0 else 'Show card'}",
            f"Distance: {'OK' if d_ok else 'Adjust'}",
            f"Framing: {'OK' if r_ok else 'Reframe'}",
        ]
        for i, t in enumerate(hud):
            cv2.putText(display, t, (10, y0 + i * dy), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

        # Auto-capture logic
        if all_ok and good_score >= threshold:
            above_counter += 1
        else:
            above_counter = 0

        cv2.putText(
            display,
            f"Hold steady... {above_counter}/{consecutive}",
            (10, h - 20),
            font,
            0.7,
            (0, 255, 255) if above_counter < consecutive else (0, 165, 255),
            2,
            cv2.LINE_AA,
        )

        now = time.time()
        if above_counter >= consecutive and now - last_capture_time > 2.0:
            last_capture_time = now
            # Capture burst
            frames = []
            qualities = []
            for _ in range(burst_frames):
                ok2, f2 = cap.read()
                if not ok2:
                    break
                g2 = cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY)
                b2, _ = _brightness_score(g2)
                s2, _ = _stability_score(gray, g2)
                mask2, _ = segment_roi(f2)
                r2, _ = _roi_area_score(mask2)
                scale2 = detect_aruco_scale(f2, marker_length_mm=marker_mm)
                d2, _ = _marker_distance_score(scale2.mean_marker_side_px, diag)
                score2 = sum(w * s for w, s in zip(weights, [b2, s2, d2, r2]))
                frames.append((f2, scale2, mask2))
                qualities.append(score2)
                time.sleep(0.03)

            if frames:
                best_idx = int(np.argmax(qualities))
                best_frame, best_scale, best_mask = frames[best_idx]
                # Analyze best frame
                m, geom_debug, path = compute_metrics(best_mask, best_scale.pixels_per_mm)
                result_overlay = best_frame.copy()
                gh, gw = geom_debug.shape[:2]
                result_overlay[0:gh, 0:gw] = geom_debug
                # Annotations
                y = 28
                for t in [
                    f"px/mm: {best_scale.pixels_per_mm:.3f}" if best_scale.pixels_per_mm else "px/mm: N/A",
                    f"Arc length (mm): {m.arc_length_mm:.1f}",
                    f"Straight length (mm): {m.length_mm:.1f}",
                    f"Max curvature (deg): {m.max_curvature_deg:.1f}",
                    f"Hinge loc (0-1): {m.hinge_location_ratio:.2f}",
                ]:
                    cv2.putText(result_overlay, t, (10, y), font, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
                    y += 26

                ts = datetime.utcnow().strftime("%Y%m%dT%H%M%S%fZ")
                out_img = out_dir / f"capture_{ts}.png"
                out_json = out_dir / f"metrics_{ts}.json"
                cv2.imwrite(str(out_img), result_overlay)
                with open(out_json, "w", encoding="utf-8") as f:
                    json.dump(
                        {
                            "pixels_per_mm": best_scale.pixels_per_mm,
                            "detected_markers": best_scale.detected_markers,
                            "metrics": asdict(m),
                        },
                        f,
                        indent=2,
                    )

                above_counter = 0
                cv2.putText(display, "Captured!", (w - 160, 30), font, 1.0, (0, 200, 0), 2, cv2.LINE_AA)
                print(f"[green]Saved {out_img} and {out_json}")

        prev_gray = gray

        cv2.imshow("Live Capture (press q to quit)", display)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    app()

