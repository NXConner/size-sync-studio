from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple

import cv2
import numpy as np


@dataclass
class Metrics:
    arc_length_mm: float
    max_curvature_deg: float
    length_mm: float
    hinge_location_ratio: float


def _skeletonize(mask: np.ndarray) -> np.ndarray:
    """
    Morphological skeletonization for binary masks (uint8 0/255).
    """
    size = np.size(mask)
    skel = np.zeros(mask.shape, np.uint8)
    element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    done = False

    work = (mask > 0).astype(np.uint8) * 255

    while not done:
        eroded = cv2.erode(work, element)
        temp = cv2.dilate(eroded, element)
        temp = cv2.subtract(work, temp)
        skel = cv2.bitwise_or(skel, temp)
        work = eroded.copy()

        zeros = size - cv2.countNonZero(work)
        if zeros == size:
            done = True

    return skel


def _extract_centerline_points(skeleton: np.ndarray) -> List[Tuple[int, int]]:
    """
    Extract an ordered centerline path from a skeleton by following endpoints.
    """
    # Find endpoints: pixels with exactly one neighbor in 8-connectivity
    ys, xs = np.where(skeleton > 0)
    if len(xs) == 0:
        return []

    img = (skeleton > 0).astype(np.uint8)
    h, w = img.shape

    def neighbors(y: int, x: int) -> List[Tuple[int, int]]:
        res = []
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and img[ny, nx] > 0:
                    res.append((ny, nx))
        return res

    endpoints: List[Tuple[int, int]] = []
    for y, x in zip(ys, xs):
        if len(neighbors(y, x)) == 1:
            endpoints.append((y, x))

    if not endpoints:
        # Fall back to any point as start
        start = (int(ys[0]), int(xs[0]))
    else:
        # Choose the endpoint with smallest y (topmost) as start for determinism
        start = sorted(endpoints)[0]

    # Follow the path greedily
    path: List[Tuple[int, int]] = []
    visited = set()
    current = start
    prev = None
    while True:
        path.append(current)
        visited.add(current)
        nbrs = neighbors(*current)
        # Prefer neighbor that is not the previous pixel
        next_candidates = [p for p in nbrs if p != prev and p not in visited]
        if not next_candidates:
            # Try any unvisited neighbor
            next_candidates = [p for p in nbrs if p not in visited]
        if not next_candidates:
            break
        # Choose the closest to maintain continuity
        def dist2(a: Tuple[int, int], b: Tuple[int, int]) -> int:
            return (a[0]-b[0])**2 + (a[1]-b[1])**2
        nxt = min(next_candidates, key=lambda p: dist2(p, current))
        prev, current = current, nxt

    return path


def _polyline_length(points: List[Tuple[int, int]]) -> float:
    if len(points) < 2:
        return 0.0
    total = 0.0
    for (y1, x1), (y2, x2) in zip(points[:-1], points[1:]):
        total += float(np.hypot(y2 - y1, x2 - x1))
    return total


def _max_curvature_angle(points: List[Tuple[int, int]]) -> Tuple[float, int]:
    """
    Estimate maximum curvature angle along the centerline using local tangent vectors.
    Returns (max_angle_deg, index_of_hinge).
    """
    if len(points) < 5:
        return 0.0, 0

    pts = np.array(points, dtype=np.float32)
    # Smooth with a small window
    kernel = np.ones(5, dtype=np.float32) / 5.0
    ys = np.convolve(pts[:, 0], kernel, mode='same')
    xs = np.convolve(pts[:, 1], kernel, mode='same')

    # Compute tangent angles
    dy = np.gradient(ys)
    dx = np.gradient(xs)
    angles = np.arctan2(dy, dx)

    # Reference: straight line between endpoints
    ref_angle = math.degrees(math.atan2(ys[-1] - ys[0], xs[-1] - xs[0]))

    # Curvature angle as deviation from reference
    angle_deg = np.degrees(angles)
    deviation = np.abs((angle_deg - ref_angle + 180) % 360 - 180)
    idx = int(np.argmax(deviation))
    max_angle = float(deviation[idx])
    return max_angle, idx


def compute_metrics(
    mask: np.ndarray,
    pixels_per_mm: float | None,
) -> Tuple[Metrics, np.ndarray, List[Tuple[int, int]]]:
    """
    Compute curvature metrics from a binary mask and optional scale.

    Returns metrics, a debug image, and the centerline points.
    """
    if mask.dtype != np.uint8:
        mask = mask.astype(np.uint8)
    skel = _skeletonize(mask)
    path = _extract_centerline_points(skel)

    h, w = mask.shape[:2]
    debug = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
    for (y, x) in path:
        cv2.circle(debug, (x, y), 1, (0, 0, 255), -1)

    px_per_mm = pixels_per_mm if pixels_per_mm and pixels_per_mm > 0 else None

    arc_len_px = _polyline_length(path)
    max_curve_deg, hinge_idx = _max_curvature_angle(path)

    # Straight-line length (base to tip)
    if len(path) >= 2:
        y0, x0 = path[0]
        y1, x1 = path[-1]
        straight_px = float(np.hypot(y1 - y0, x1 - x0))
    else:
        straight_px = 0.0

    if px_per_mm:
        arc_len_mm = arc_len_px / px_per_mm
        length_mm = straight_px / px_per_mm
    else:
        arc_len_mm = 0.0
        length_mm = 0.0

    hinge_ratio = float(hinge_idx / max(1, len(path) - 1)) if len(path) > 1 else 0.0

    metrics = Metrics(
        arc_length_mm=arc_len_mm,
        max_curvature_deg=max_curve_deg,
        length_mm=length_mm,
        hinge_location_ratio=hinge_ratio,
    )

    # Draw annotations
    if len(path) >= 2:
        base = (path[0][1], path[0][0])
        tip = (path[-1][1], path[-1][0])
        cv2.line(debug, base, tip, (255, 0, 0), 1)
        if 0 <= hinge_idx < len(path):
            hr = path[hinge_idx]
            cv2.circle(debug, (hr[1], hr[0]), 4, (0, 255, 255), -1)

    return metrics, debug, path

