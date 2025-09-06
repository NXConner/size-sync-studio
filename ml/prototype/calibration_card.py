from __future__ import annotations

from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import typer


app = typer.Typer(add_completion=False)


def _draw_aruco_grid(image: np.ndarray, dict_name: int, squares_x: int, squares_y: int, square_px: int, margin_px: int) -> np.ndarray:
    aruco = cv2.aruco
    dictionary = aruco.getPredefinedDictionary(dict_name)
    board = aruco.CharucoBoard((squares_x, squares_y), square_px, int(square_px * 0.7), dictionary)
    board_img = board.generateImage((squares_x * square_px + 2 * margin_px, squares_y * square_px + 2 * margin_px))
    return board_img


@app.command()
def generate(
    out_pdf: Path = typer.Option(Path("calibration_card.pdf"), help="Output PDF path"),
    dict_name: int = typer.Option(cv2.aruco.DICT_4X4_50, help="ArUco dictionary identifier"),
    squares_x: int = typer.Option(6, help="Squares in X"),
    squares_y: int = typer.Option(4, help="Squares in Y"),
    square_mm: float = typer.Option(10.0, help="Square size (mm)"),
):
    """
    Generate a printable Charuco calibration card PDF.
    Print at 100% scale (no fit-to-page). Matte paper recommended.
    """
    page_w, page_h = letter
    c = canvas.Canvas(str(out_pdf), pagesize=letter)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(36, page_h - 54, "Calibration Card — Print at 100% scale (no fit-to-page)")
    c.setFont("Helvetica", 10)
    c.drawString(36, page_h - 70, "Use in frame for accurate scaling. Keep flat and well-lit.")

    # Compute pixel sizes for preview generation
    square_px = 80
    margin_px = 20
    img = _draw_aruco_grid(np.zeros((10, 10), dtype=np.uint8), dict_name, squares_x, squares_y, square_px, margin_px)

    # Save temporary PNG and place into PDF with mm-based sizing
    tmp_png = Path("_cal_card_tmp.png")
    cv2.imwrite(str(tmp_png), img)

    total_w_mm = squares_x * square_mm + (2 * square_mm)  # add margins
    total_h_mm = squares_y * square_mm + (2 * square_mm)
    width_pt = total_w_mm * 72.0 / 25.4
    height_pt = total_h_mm * 72.0 / 25.4

    # Center on page
    x = (page_w - width_pt) / 2
    y = (page_h - height_pt) / 2 - 20
    c.drawImage(str(tmp_png), x, y, width=width_pt, height=height_pt, preserveAspectRatio=True, anchor='sw')

    c.setFont("Helvetica", 9)
    c.drawString(36, 40, f"Square size: {square_mm:.1f} mm; Dictionary: {dict_name}")
    c.showPage()
    c.save()

    try:
        tmp_png.unlink()
    except Exception:
        pass

    typer.echo(f"Saved calibration card PDF to {out_pdf}")


if __name__ == "__main__":
    app()

