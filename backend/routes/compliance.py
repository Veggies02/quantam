"""
FastAPI Routes for IMO CII, FuelEU Maritime, and EU ETS Compliance Calculations.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.compliance.calculator import compliance_calculator

router = APIRouter(tags=["Maritime Regulatory Compliance"])


class ComplianceCalculationRequest(BaseModel):
    vessel_type: str = Field(
        default="container",
        description="Ship category: bulk_carrier, tanker, container, general_cargo, gas_carrier, lng_carrier, ro_ro",
        json_schema_extra={"example": "container"}
    )
    deadweight_tons: float = Field(
        default=120000.0,
        gt=0,
        description="Vessel deadweight capacity in metric tons (DWT)",
        json_schema_extra={"example": 198000.0}
    )
    distance_nm: float = Field(
        default=8500.0,
        gt=0,
        description="Total voyage distance traveled in nautical miles (nm)",
        json_schema_extra={"example": 8420.0}
    )
    fuel_consumption_mt: Optional[Dict[str, float]] = Field(
        default={"LNG": 284.0, "Biofuel_B30": 42.0},
        description="Fuel breakdown consumed during voyage in metric tons",
        json_schema_extra={"example": {"LNG": 284.0, "Biofuel_B30": 42.0}}
    )
    year: int = Field(
        default=2026,
        ge=2023,
        le=2050,
        description="Regulatory compliance evaluation year (2023 to 2050)",
        json_schema_extra={"example": 2026}
    )
    eua_price_eur: float = Field(
        default=85.0,
        ge=30.0,
        le=250.0,
        description="Prevailing EU ETS carbon allowance quota price per ton CO2 (€/MT)",
        json_schema_extra={"example": 92.0}
    )


@router.post(
    "/api/compliance/calculate",
    summary="Calculate IMO CII rating, FuelEU compliance balance & EU ETS liabilities",
    description="Computes attained CII score, boundary ratings (d1-d4), letter grades (A-E), FuelEU Maritime GHG intensity compliance balance, and SEEMP Part III remediation plans.",
)
@router.post(
    "/api/v1/compliance/calculate",
    summary="Calculate compliance audit scenario (v1)",
)
async def calculate_compliance(req: ComplianceCalculationRequest) -> Dict[str, Any]:
    try:
        fuel_dict = req.fuel_consumption_mt or {"VLSFO": 142.0, "LSMGO": 18.0}
        results = compliance_calculator.evaluate_fleet_compliance_scenario(
            vessel_type=req.vessel_type,
            deadweight_tons=req.deadweight_tons,
            distance_nm=req.distance_nm,
            fuel_consumption_mt=fuel_dict,
            year=req.year,
            eua_price_eur=req.eua_price_eur
        )
        return {
            "status": "success",
            "message": "Regulatory compliance metrics calculated successfully",
            "data": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance calculation error: {str(e)}")


@router.get(
    "/api/compliance/defaults",
    summary="Get regulatory standards, reference coefficients, and reduction factors",
)
@router.get(
    "/api/v1/compliance/standards",
    summary="Get regulatory standards and coefficients (v1)",
)
async def get_regulatory_defaults() -> Dict[str, Any]:
    return {
        "status": "success",
        "data": {
            "fuel_specs": compliance_calculator.FUEL_SPECS,
            "cii_reference_params": compliance_calculator.CII_REF_PARAMS,
            "fueleu_baseline_ghg": compliance_calculator.FUELEU_BASELINE_GHG,
            "fueleu_targets": compliance_calculator.FUELEU_TARGETS,
            "ets_surrender_rates": compliance_calculator.EU_ETS_SURRENDER_RATES,
            "statutory_directives": [
                "IMO MEPC.337(76) & MEPC.338(76)",
                "Regulation (EU) 2023/1805 (FuelEU Maritime)",
                "Directive (EU) 2023/959 (EU ETS Maritime Extension)",
            ]
        }
    }
