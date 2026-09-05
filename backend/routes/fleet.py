"""
FastAPI Routes for Fleet Registry, Live Vessel Telemetry & Green Corridors.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["Fleet Management & Telemetry"])

# Initial Fleet In-Memory Store
FLEET_REGISTRY = [
    {
        "id": "VES-901",
        "name": "MV Quanta Horizon",
        "imo": "IMO 9842145",
        "type": "Ultra Large Container Vessel (ULCV)",
        "deadweight_tons": 198000,
        "length_meters": 399.9,
        "beam_meters": 61.3,
        "speed_knots": 18.4,
        "target_speed_knots": 17.2,
        "engine_power_kw": 68400,
        "rpm": 72.4,
        "fuel_rate_mt_per_day": 84.6,
        "fuel_type": "LNG",
        "well_to_wake_emissions": 76.4,
        "tank_to_wake_co2_rate": 232.8,
        "eu_ets_daily_cost_eur": 16296,
        "imo_target_status": "On Track (-42% vs 2008)",
        "cii_rating": "A",
        "cii_score": 2.84,
        "status": "Optimizing",
        "origin": "Port of Singapore (SGSIN)",
        "destination": "Port of Rotterdam (NLRTM)",
        "eta": "2026-09-14 06:00 UTC",
        "lat": 12.842,
        "lng": 45.213,
        "heading": 312,
        "draft_meters": 14.8,
        "trim_meters": 0.35,
        "sea_state_beaufort": 4,
        "wave_height_meters": 2.1,
        "wind_speed_knots": 16.5,
        "quantum_optimized": True,
    },
    {
        "id": "VES-842",
        "name": "MV Stellar Voyager",
        "imo": "IMO 9734589",
        "type": "Capesize Bulk Carrier",
        "deadweight_tons": 179500,
        "length_meters": 292.0,
        "beam_meters": 45.0,
        "speed_knots": 13.8,
        "target_speed_knots": 13.5,
        "engine_power_kw": 18500,
        "rpm": 65.2,
        "fuel_rate_mt_per_day": 42.1,
        "fuel_type": "Biofuel",
        "well_to_wake_emissions": 61.2,
        "tank_to_wake_co2_rate": 114.2,
        "eu_ets_daily_cost_eur": 7994,
        "imo_target_status": "On Track (-45% vs 2008)",
        "cii_rating": "A",
        "cii_score": 2.15,
        "status": "Underway",
        "origin": "Port Hedland (AUPHE)",
        "destination": "Qingdao Port (CNQDG)",
        "eta": "2026-09-09 18:30 UTC",
        "lat": -12.35,
        "lng": 118.44,
        "heading": 355,
        "draft_meters": 16.2,
        "trim_meters": -0.1,
        "sea_state_beaufort": 3,
        "wave_height_meters": 1.4,
        "wind_speed_knots": 11.2,
        "quantum_optimized": True,
    },
    {
        "id": "VES-719",
        "name": "MV Ocean Pioneer",
        "imo": "IMO 9651204",
        "type": "LNG Carrier (Membrane Mark III)",
        "deadweight_tons": 94000,
        "length_meters": 288.0,
        "beam_meters": 44.2,
        "speed_knots": 16.2,
        "target_speed_knots": 15.8,
        "engine_power_kw": 24000,
        "rpm": 68.0,
        "fuel_rate_mt_per_day": 58.4,
        "fuel_type": "VLSFO",
        "well_to_wake_emissions": 91.8,
        "tank_to_wake_co2_rate": 182.2,
        "eu_ets_daily_cost_eur": 12754,
        "imo_target_status": "Action Needed (-24% vs 2008)",
        "cii_rating": "C",
        "cii_score": 4.88,
        "status": "Alert",
        "origin": "Ras Laffan (QARLF)",
        "destination": "Zeebrugge (BEZEE)",
        "eta": "2026-09-18 12:00 UTC",
        "lat": 28.12,
        "lng": 33.45,
        "heading": 330,
        "draft_meters": 11.5,
        "trim_meters": 0.15,
        "sea_state_beaufort": 6,
        "wave_height_meters": 3.8,
        "wind_speed_knots": 27.8,
        "quantum_optimized": False,
    },
    {
        "id": "VES-604",
        "name": "MV Green Aeon",
        "imo": "IMO 9823901",
        "type": "Next-Gen e-Methanol Neo-Panamax",
        "deadweight_tons": 115000,
        "length_meters": 333.0,
        "beam_meters": 48.0,
        "speed_knots": 15.2,
        "target_speed_knots": 15.0,
        "engine_power_kw": 29800,
        "rpm": 64.0,
        "fuel_rate_mt_per_day": 51.2,
        "fuel_type": "e-Methanol",
        "well_to_wake_emissions": 18.5,
        "tank_to_wake_co2_rate": 68.4,
        "eu_ets_daily_cost_eur": 4788,
        "imo_target_status": "Surpassed 2050 Net-Zero",
        "cii_rating": "A",
        "cii_score": 1.08,
        "status": "Underway",
        "origin": "Rotterdam (NLRTM)",
        "destination": "New York (USNYC)",
        "eta": "2026-09-12 14:00 UTC",
        "lat": 44.72,
        "lng": -32.11,
        "heading": 260,
        "draft_meters": 13.4,
        "trim_meters": 0.20,
        "sea_state_beaufort": 3,
        "wave_height_meters": 1.8,
        "wind_speed_knots": 12.4,
        "quantum_optimized": True,
    },
]


class VesselTelemetryUpdate(BaseModel):
    speed_knots: Optional[float] = Field(None, ge=0.0, le=35.0)
    draft_meters: Optional[float] = Field(None, ge=1.0, le=25.0)
    trim_meters: Optional[float] = Field(None, ge=-5.0, le=5.0)
    fuel_type: Optional[str] = None
    fuel_rate_mt_per_day: Optional[float] = None
    quantum_optimized: Optional[bool] = None


@router.get("/fleet", summary="List all active fleet vessels")
@router.get("/v1/fleet/vessels", summary="List all active fleet vessels (v1)")
def get_fleet_vessels() -> Dict[str, Any]:
    """Returns the live fleet vessel registry with current positions, telemetry, and CII ratings."""
    return {
        "status": "success",
        "count": len(FLEET_REGISTRY),
        "data": FLEET_REGISTRY,
    }


@router.get("/fleet/{vessel_id}", summary="Get individual vessel profile & telemetry")
@router.get("/v1/fleet/vessels/{vessel_id}", summary="Get individual vessel profile & telemetry (v1)")
def get_vessel_by_id(vessel_id: str = Path(..., description="Vessel identifier (e.g. VES-901)")) -> Dict[str, Any]:
    """Retrieves full specification, real-time hydrodynamic readings, and CII grade for a specific vessel."""
    vessel = next((v for v in FLEET_REGISTRY if v["id"] == vessel_id), None)
    if not vessel:
        raise HTTPException(status_code=404, detail=f"Vessel with ID '{vessel_id}' not found in active fleet registry.")
    return {
        "status": "success",
        "data": vessel,
    }


@router.patch("/fleet/{vessel_id}/telemetry", summary="Update vessel telemetry or optimization status")
@router.patch("/v1/fleet/vessels/{vessel_id}/telemetry", summary="Update vessel telemetry (v1)")
def update_vessel_telemetry(
    vessel_id: str = Path(..., description="Vessel identifier"),
    update: VesselTelemetryUpdate = ...,
) -> Dict[str, Any]:
    """Updates live operational variables (speed, draft, trim, fuel type) for an active vessel."""
    vessel = next((v for v in FLEET_REGISTRY if v["id"] == vessel_id), None)
    if not vessel:
        raise HTTPException(status_code=404, detail=f"Vessel with ID '{vessel_id}' not found.")
    
    update_data = update.dict(exclude_unset=True)
    vessel.update(update_data)
    
    return {
        "status": "success",
        "message": f"Vessel '{vessel['name']}' telemetry updated successfully.",
        "data": vessel,
    }
