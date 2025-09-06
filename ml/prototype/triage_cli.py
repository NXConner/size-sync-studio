from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import List

import typer
from rich import print

from triage_rules import Exposure, Profile, Symptoms, triage


app = typer.Typer(add_completion=False)


@app.command()
def run(
    exposures_json: Path = typer.Option(..., exists=True, readable=True, help="Path to exposures JSON"),
    symptoms_json: Path = typer.Option(..., exists=True, readable=True, help="Path to symptoms JSON"),
    profile_json: Path = typer.Option(..., exists=True, readable=True, help="Path to profile JSON"),
    out: Path = typer.Option(Path("triage_result.json"), help="Output JSON path"),
):
    """
    STD triage rule engine — reads exposures, symptoms, and profile JSON inputs and produces recommendations.

    Example JSON:
    exposures: [{"date":"2025-08-01","site":"vaginal","condom_used":false}]
    symptoms: {"discharge":true,"dysuria_pain_urination":true}
    profile: {"user_age":25,"hepatitis_b_vaccinated":false,"injection_drug_use":false}
    """
    exposures_data = json.loads(exposures_json.read_text(encoding="utf-8"))
    symptoms_data = json.loads(symptoms_json.read_text(encoding="utf-8"))
    profile_data = json.loads(profile_json.read_text(encoding="utf-8"))

    exposures: List[Exposure] = [Exposure(**e) for e in exposures_data]
    symptoms = Symptoms(**symptoms_data)
    profile = Profile(**profile_data)

    result = triage(exposures, symptoms, profile)
    out.write_text(json.dumps({
        "recommendations": [asdict(r) for r in result.recommendations],
        "urgency_flags": result.urgency_flags,
        "guidance": result.guidance,
    }, indent=2), encoding="utf-8")

    print(f"[green]Saved triage result to {out}")


if __name__ == "__main__":
    app()

