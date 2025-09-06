from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import typer
from rich import print


DATA_ROOT = Path(__file__).parent / "lab_stub_data"
ORDERS_DIR = DATA_ROOT / "orders"
RESULTS_DIR = DATA_ROOT / "results"


app = typer.Typer(add_completion=False)


def _now_iso() -> str:
    return f"{datetime.utcnow().isoformat()}Z"


def _ensure_dirs() -> None:
    ORDERS_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)


@app.command()
def create_order(
    user_id: str = typer.Option(..., help="User identifier"),
    panel_codes: List[str] = typer.Option(..., help="Panel codes, e.g., CG_NAAT HIV_AGAB SYPHILIS_RPR_TPPA"),
    facility: str = typer.Option("in_person:DemoLab:Site001", help="facility string: type:labName:siteId"),
    out: Optional[Path] = typer.Option(None, help="Optional explicit path for order JSON"),
):
    """
    Create a sandbox lab order and persist it locally.
    """
    _ensure_dirs()
    order_id = f"ord_{uuid.uuid4().hex[:12]}"
    parts = facility.split(":")
    facility_obj = {
        "type": parts[0] if len(parts) > 0 else "in_person",
        "lab": parts[1] if len(parts) > 1 else "DemoLab",
        "siteId": parts[2] if len(parts) > 2 else "Site001",
    }
    order = {
        "orderId": order_id,
        "userId": user_id,
        "panelCodes": panel_codes,
        "facility": facility_obj,
        "status": "sent",
        "createdAt": _now_iso(),
    }
    path = out if out else ORDERS_DIR / f"{order_id}.json"
    path.write_text(json.dumps(order, indent=2), encoding="utf-8")
    print(f"[green]Created order {order_id} at {path}")


@app.command()
def list_orders():
    _ensure_dirs()
    for p in sorted(ORDERS_DIR.glob("*.json")):
        print(p.name)


@app.command()
def get_order(order_id: str):
    _ensure_dirs()
    p = ORDERS_DIR / f"{order_id}.json"
    if not p.exists():
        raise typer.BadParameter("Order not found")
    print(json.loads(p.read_text(encoding="utf-8")))


def _demo_result_for_panels(panel_codes: List[str]) -> dict:
    analytes = []
    for code in panel_codes:
        if code.startswith("CG_NAAT"):
            analytes.append({"code": code, "value": "negative", "loinc": "43305-2"})
        elif code == "HIV_AGAB_4TH_GEN":
            analytes.append({"code": code, "value": "nonreactive", "loinc": "56888-1"})
        elif code == "HIV_RNA_PCR":
            analytes.append({"code": code, "value": "not detected", "loinc": "25835-0"})
        elif code == "SYPHILIS_RPR_TPPA":
            analytes.append({"code": code, "value": "nonreactive", "loinc": "20507-0"})
        elif code.startswith("HBV_PANEL"):
            analytes.append({"code": "HBsAg", "value": "nonreactive", "loinc": "5196-1"})
            analytes.append({"code": "anti-HBs", "value": "nonreactive", "loinc": "22322-2"})
            analytes.append({"code": "anti-HBc", "value": "nonreactive", "loinc": "22321-4"})
        elif code.startswith("HCV_AB"):
            analytes.append({"code": code, "value": "nonreactive", "loinc": "13955-0"})
        else:
            analytes.append({"code": code, "value": "unknown", "loinc": ""})
    interpretation = "See individual analytes. Follow guideline-based retesting windows if recent exposure."
    return {"analytes": analytes, "interpretation": interpretation}


@app.command()
def simulate_result(order_id: str = typer.Option(..., help="Order to complete")):
    """
    Simulate a lab result for a given order. Updates order status and writes a DiagnosticReport-like JSON.
    """
    _ensure_dirs()
    p = ORDERS_DIR / f"{order_id}.json"
    if not p.exists():
        raise typer.BadParameter("Order not found")
    order = json.loads(p.read_text(encoding="utf-8"))

    result_id = f"res_{uuid.uuid4().hex[:12]}"
    body = _demo_result_for_panels(order.get("panelCodes", []))
    report = {
        "resultId": result_id,
        "orderId": order_id,
        "createdAt": _now_iso(),
        "report": body,
        "status": "final",
    }
    rp = RESULTS_DIR / f"{result_id}.json"
    rp.write_text(json.dumps(report, indent=2), encoding="utf-8")

    order["status"] = "completed"
    order["completedAt"] = _now_iso()
    p.write_text(json.dumps(order, indent=2), encoding="utf-8")
    print(f"[green]Created result {result_id} for {order_id}")


@app.command()
def list_results():
    _ensure_dirs()
    for p in sorted(RESULTS_DIR.glob("*.json")):
        print(p.name)


@app.command()
def get_result(result_id: str):
    _ensure_dirs()
    p = RESULTS_DIR / f"{result_id}.json"
    if not p.exists():
        raise typer.BadParameter("Result not found")
    print(json.loads(p.read_text(encoding="utf-8")))


if __name__ == "__main__":
    app()

