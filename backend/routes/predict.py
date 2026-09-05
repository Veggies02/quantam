"""
FastAPI Routes for Vessel Power, Fuel Consumption & Lifecycle Emissions Predictions.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel, Field

from backend.models.ml_predictor import ml_predictor_engine
from backend.models.fuel_lifecycle import FUEL_DATABASE, FUELEU_BASELINE_GHG_INTENSITY

router = APIRouter(tags=["Physics & Machine Learning Prediction"])


class PredictionRequest(BaseModel):
    speed_knots: float = Field(
        default=17.5,
        ge=5.0,
        le=28.0,
        description="Speed Over Ground (SOG) in knots",
        json_schema_extra={"example": 17.5}
    )
    draft_meters: float = Field(
        default=14.8,
        ge=5.0,
        le=25.0,
        description="Mean vessel draft in meters",
        json_schema_extra={"example": 14.8}
    )
    trim_meters: float = Field(
        default=0.4,
        ge=-3.0,
        le=4.0,
        description="Dynamic trim in meters (+ by stern, - by head)",
        json_schema_extra={"example": 0.35}
    )
    cargo_load_percent: float = Field(
        default=85.0,
        ge=0.0,
        le=100.0,
        description="Cargo payload capacity utilization %",
        json_schema_extra={"example": 85.0}
    )
    wave_height_meters: float = Field(
        default=1.5,
        ge=0.0,
        le=12.0,
        description="Significant wave height H_s in meters",
        json_schema_extra={"example": 2.1}
    )
    wind_speed_knots: float = Field(
        default=14.0,
        ge=0.0,
        le=60.0,
        description="True/Relative wind speed in knots",
        json_schema_extra={"example": 16.5}
    )
    wind_angle_deg: float = Field(
        default=30.0,
        ge=0.0,
        le=180.0,
        description="Relative wind angle in degrees (0=headwind, 90=beam, 180=following)",
        json_schema_extra={"example": 30.0}
    )
    days_since_drydock: float = Field(
        default=180.0,
        ge=0.0,
        le=1500.0,
        description="Days elapsed since last hull coating drydock",
        json_schema_extra={"example": 180.0}
    )
    fuel_type: str = Field(
        default="VLSFO",
        description="Fuel type: VLSFO, MGO, LNG, Bio-MGO B30, e-Methanol, Green Ammonia",
        json_schema_extra={"example": "LNG"}
    )


@router.post(
    "/api/predict",
    summary="Predict vessel power, fuel burn, and lifecycle emissions",
    description="Computes Holtrop-Mennen physical resistance components + XGBoost grey-box residual power and Full Well-to-Wake (WTW) lifecycle emissions.",
)
@router.post(
    "/api/v1/predict/hydrodynamics",
    summary="Predict vessel hydrodynamics and emissions (v1)",
)
def predict_vessel_performance(req: PredictionRequest) -> Dict[str, Any]:
    try:
        result = ml_predictor_engine.predict(
            speed_knots=req.speed_knots,
            draft_meters=req.draft_meters,
            trim_meters=req.trim_meters,
            cargo_load_percent=req.cargo_load_percent,
            wave_height_meters=req.wave_height_meters,
            wind_speed_knots=req.wind_speed_knots,
            wind_angle_deg=req.wind_angle_deg,
            days_since_drydock=req.days_since_drydock,
            fuel_type=req.fuel_type
        )
        return {
            "status": "success",
            "message": "Hydrodynamic and emissions prediction calculated successfully",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline error: {str(e)}")


@router.get(
    "/api/predict/metrics",
    summary="Get model validation metrics and speed-power benchmark curves",
    description="Returns statistical accuracy benchmarks (R², RMSE, MAPE), Shapley feature importances, and multi-model speed-power curves.",
)
@router.get(
    "/api/v1/predict/metrics",
    summary="Get model validation metrics (v1)",
)
def get_prediction_metrics(
    draft_meters: float = Query(14.8, ge=5.0, le=25.0, description="Draft in meters"),
    trim_meters: float = Query(0.4, ge=-3.0, le=4.0, description="Trim in meters"),
    cargo_load_percent: float = Query(85.0, ge=0.0, le=100.0, description="Cargo load %"),
    wave_height_meters: float = Query(1.5, ge=0.0, le=12.0, description="Significant wave height"),
    wind_speed_knots: float = Query(14.0, ge=0.0, le=60.0, description="Wind speed in knots"),
    days_since_drydock: float = Query(180.0, ge=0.0, le=1500.0, description="Fouling days"),
    fuel_type: str = Query("VLSFO", description="Fuel pathway"),
) -> Dict[str, Any]:
    try:
        curves = ml_predictor_engine.generate_speed_power_curves(
            draft_meters=draft_meters,
            trim_meters=trim_meters,
            cargo_load_percent=cargo_load_percent,
            wave_height_meters=wave_height_meters,
            wind_speed_knots=wind_speed_knots,
            days_since_drydock=days_since_drydock,
            fuel_type=fuel_type
        )
        
        return {
            "status": "success",
            "data": {
                "metrics": ml_predictor_engine.metrics,
                "speed_power_curves": curves,
                "fuel_database": FUEL_DATABASE,
                "fueleu_baseline": FUELEU_BASELINE_GHG_INTENSITY,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics retrieval error: {str(e)}")


@router.get(
    "/api/predict/fuels",
    summary="List supported maritime fuels with WTW factors and pricing",
)
@router.get(
    "/api/v1/predict/fuels",
    summary="List supported maritime fuels (v1)",
)
def list_supported_fuels() -> Dict[str, Any]:
    return {
        "status": "success",
        "count": len(FUEL_DATABASE),
        "data": FUEL_DATABASE,
    }
