from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Dict, List, Optional, Tuple


# Simple rule engine for STD triage aligned with high-level public guidance.
# Not a diagnosis. Always direct users to lab testing and clinician follow-up where appropriate.


def _days_since(iso_date: str) -> Optional[int]:
    try:
        d = datetime.fromisoformat(iso_date).date()
        return (date.today() - d).days
    except Exception:
        return None


@dataclass
class Exposure:
    date: str
    site: str  # 'oral' | 'vaginal' | 'anal' | 'blood' | 'other'
    condom_used: bool = False
    partner_known_positive: List[str] = field(default_factory=list)  # e.g., ['hiv', 'syphilis']


@dataclass
class Symptoms:
    discharge: bool = False
    sores_ulcers: bool = False
    rash_palmar_plantar: bool = False
    dysuria_pain_urination: bool = False
    pelvic_or_testicular_pain: bool = False
    fever: bool = False
    sore_throat: bool = False
    rectal_pain_bleeding: bool = False


@dataclass
class Profile:
    user_age: int
    hepatitis_b_vaccinated: bool = False
    injection_drug_use: bool = False
    on_prep: bool = False


@dataclass
class Recommendation:
    panel_code: str
    reason: str
    test_now: bool
    retest_days: Optional[int] = None


@dataclass
class TriageResult:
    recommendations: List[Recommendation]
    urgency_flags: List[str]
    guidance: List[str]


def _recommend_cg_naat(exposures: List[Exposure], symptoms: Symptoms) -> List[Recommendation]:
    recs: List[Recommendation] = []
    sites = set()
    for e in exposures:
        if e.site in {"oral", "vaginal", "anal"}:
            sites.add(e.site)
    # Map sites to specimen types
    site_to_panel = {
        "oral": "CG_NAAT_PHARYNGEAL",
        "vaginal": "CG_NAAT_URINE_OR_VAGINAL_SWAB",
        "anal": "CG_NAAT_RECTAL",
    }
    for e in exposures:
        if e.site not in site_to_panel:
            continue
        days = _days_since(e.date)
        panel = site_to_panel[e.site]
        test_now = True
        retest: Optional[int] = None
        reason_parts = ["Exposure at site: "+e.site]
        # Window: NAAT typically ≥7 days post-exposure
        if days is not None and days < 7:
            retest = 14
            reason_parts.append("Exposure <7 days, plan retest at 14 days")
        if symptoms.discharge or symptoms.dysuria_pain_urination or symptoms.rectal_pain_bleeding or symptoms.sore_throat:
            reason_parts.append("Symptoms suggest bacterial STI at this site")
        recs.append(Recommendation(panel, "; ".join(reason_parts), test_now, retest))
    return recs


def _recommend_hiv(exposures: List[Exposure], profile: Profile) -> List[Recommendation]:
    recs: List[Recommendation] = []
    # Any sexual exposure or blood exposure -> HIV Ag/Ab with retest guidance
    relevant = [e for e in exposures if e.site in {"oral", "vaginal", "anal", "blood"}]
    if not relevant:
        return recs
    soonest_days = min([_days_since(e.date) or 0 for e in relevant]) if relevant else None
    reason = "Sexual/blood exposure; 4th-gen HIV Ag/Ab recommended."
    retest = 42  # 6 weeks
    recs.append(Recommendation("HIV_AGAB_4TH_GEN", reason, True, retest_days=retest))
    # If very recent exposure (<14 days), consider RNA
    if soonest_days is not None and soonest_days < 14:
        recs.append(Recommendation("HIV_RNA_PCR", "Recent exposure <14 days; RNA test can detect earlier infection.", True, retest_days=14))
    return recs


def _recommend_syphilis(exposures: List[Exposure], symptoms: Symptoms) -> List[Recommendation]:
    recs: List[Recommendation] = []
    if not exposures:
        return recs
    reason_parts = ["Sexual exposure"]
    retest = 42  # 6 weeks
    if symptoms.sores_ulcers or symptoms.rash_palmar_plantar:
        reason_parts.append("Symptoms possibly consistent with syphilis")
    recs.append(Recommendation("SYPHILIS_RPR_TPPA", "; ".join(reason_parts), True, retest_days=retest))
    return recs


def _recommend_hepatitis(exposures: List[Exposure], profile: Profile) -> List[Recommendation]:
    recs: List[Recommendation] = []
    # HBV: if unvaccinated and sexual/blood exposure
    if not profile.hepatitis_b_vaccinated and any(e.site in {"vaginal", "anal", "blood"} for e in exposures):
        recs.append(Recommendation("HBV_PANEL (HBsAg, anti-HBs, anti-HBc)", "Unvaccinated with sexual/blood exposure.", True, retest_days=60))
    # HCV: if blood exposure or IDU
    if profile.injection_drug_use or any(e.site == "blood" for e in exposures):
        recs.append(Recommendation("HCV_AB (with reflex RNA)", "Blood exposure/IDU risk; reflex to RNA if positive.", True, retest_days=60))
    return recs


def _urgency_flags(symptoms: Symptoms) -> List[str]:
    flags: List[str] = []
    if symptoms.fever and (symptoms.discharge or symptoms.pelvic_or_testicular_pain):
        flags.append("Fever with urogenital symptoms — seek urgent care")
    if symptoms.pelvic_or_testicular_pain:
        flags.append("Severe pelvic/testicular pain — urgent evaluation recommended")
    if symptoms.sores_ulcers and symptoms.fever:
        flags.append("Painful ulcers with systemic symptoms — urgent evaluation")
    return flags


def _general_guidance(exposures: List[Exposure], profile: Profile) -> List[str]:
    g: List[str] = []
    if any(e.condom_used is False for e in exposures):
        g.append("Condomless exposure increases risk; consider comprehensive panel.")
    if profile.on_prep:
        g.append("Continue HIV PrEP as prescribed; maintain quarterly screening.")
    if not profile.hepatitis_b_vaccinated:
        g.append("Consider Hepatitis B vaccination with your clinician.")
    return g


def triage(
    exposures: List[Exposure],
    symptoms: Symptoms,
    profile: Profile,
) -> TriageResult:
    recs: List[Recommendation] = []
    recs.extend(_recommend_cg_naat(exposures, symptoms))
    recs.extend(_recommend_hiv(exposures, profile))
    recs.extend(_recommend_syphilis(exposures, symptoms))
    recs.extend(_recommend_hepatitis(exposures, profile))

    # Deduplicate by panel_code while keeping the earliest retest recommendation
    by_code: Dict[str, Recommendation] = {}
    for r in recs:
        if r.panel_code not in by_code:
            by_code[r.panel_code] = r
        else:
            existing = by_code[r.panel_code]
            # Prefer the smaller retest_days if both present
            if r.retest_days is not None and (
                existing.retest_days is None or r.retest_days < existing.retest_days
            ):
                by_code[r.panel_code] = r

    flags = _urgency_flags(symptoms)
    guidance = _general_guidance(exposures, profile)
    return TriageResult(list(by_code.values()), flags, guidance)

