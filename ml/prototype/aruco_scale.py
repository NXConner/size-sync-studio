from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np


@dataclass
class ArucoScaleResult:
    pixels_per_mm: Optional[float]
    mean_marker_side_px: Optional[float]
    detected_markers: int
    debug_image_bgr: np.ndarray


def detect_aruco_scale(
    image_bgr: np.ndarray,
    marker_length_mm: float = 20.0,
    dictionary_name: int = cv2.aruco.DICT_4X4_50,
) -> ArucoScaleResult:
    """
    Detect ArUco markers and estimate pixels-per-millimeter scale.

    Parameters
    ----------
    image_bgr: np.ndarray
        Input image in BGR color space.
    marker_length_mm: float
        The real-world side length of the calibration square on the card, in millimeters.
    dictionary_name: int
        cv2.aruco dictionary constant, e.g., DICT_4X4_50.

    Returns
    -------
    ArucoScaleResult
        Contains pixels_per_mm (if markers found), marker stats, and a debug render.
    """
    debug = image_bgr.copy()
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    aruco_dict = cv2.aruco.getPredefinedDictionary(dictionary_name)
    parameters = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)

    corners, ids, _ = detector.detectMarkers(gray)

    mean_side_px: Optional[float] = None
    px_per_mm: Optional[float] = None

    if ids is not None and len(ids) > 0:
        cv2.aruco.drawDetectedMarkers(debug, corners, ids)
        side_lengths: list[float] = []
        for marker_corners in corners:
            pts = marker_corners[0]
            # Compute lengths of all 4 sides and average
            perim = 0.0
            sides = []
            for i in range(4):
                p1 = pts[i]
                p2 = pts[(i + 1) % 4]
                sides.append(float(np.linalg.norm(p2 - p1)))
            if len(sides) == 4:
                side_lengths.append(float(np.mean(sides)))

        if len(side_lengths) > 0:
            mean_side_px = float(np.mean(side_lengths))
            if marker_length_mm > 0:
                px_per_mm = mean_side_px / marker_length_mm

            # Draw scale text
            text = f"px/mm: {px_per_mm:.3f}" if px_per_mm else "px/mm: N/A"
            cv2.putText(
                debug,
                text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 0),
                2,
                cv2.LINE_AA,
            )

    detected = 0 if ids is None else len(ids)

    return ArucoScaleResult(
        pixels_per_mm=px_per_mm,
        mean_marker_side_px=mean_side_px,
        detected_markers=detected,
        debug_image_bgr=debug,
    )

