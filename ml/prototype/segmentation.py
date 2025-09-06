from __future__ import annotations

from typing import Tuple

import cv2
import numpy as np


def segment_roi(image_bgr: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Produce a binary mask for the region of interest using classical image processing.
    This is a placeholder for a learned segmentation model.

    Returns
    -------
    mask: np.ndarray (uint8)
        Binary mask with foreground=255 and background=0.
    debug_bgr: np.ndarray
        Debug visualization image.
    """
    image = image_bgr.copy()
    h, w = image.shape[:2]

    # Preprocess: blur and convert to HSV for robust thresholding
    blurred = cv2.GaussianBlur(image, (5, 5), 0)
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

    # Broad thresholds to isolate skin-like regions; parameters will be tuned later
    lower = np.array([0, 20, 50], dtype=np.uint8)
    upper = np.array([25, 255, 255], dtype=np.uint8)
    mask_hsv = cv2.inRange(hsv, lower, upper)

    # Edge emphasis
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 60, 150)
    edges = cv2.dilate(edges, None, iterations=1)

    # Combine
    combined = cv2.bitwise_or(mask_hsv, edges)
    combined = cv2.medianBlur(combined, 5)

    # Morphological cleanup
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    closed = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=2)
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=1)

    # Keep the largest contour as ROI
    contours, _ = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros((h, w), dtype=np.uint8)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        cv2.drawContours(mask, [largest], -1, 255, thickness=cv2.FILLED)

    # Debug visualization
    debug = image.copy()
    overlay = debug.copy()
    overlay[mask > 0] = (0, 255, 0)
    debug_vis = cv2.addWeighted(debug, 0.7, overlay, 0.3, 0)

    return mask, debug_vis

