import os

routes_init = '''from .benchmark import router as benchmark_router
from .compliance import router as compliance_router
'''

benchmark_route_code = '''"""
FastAPI Routes for Multi-Algorithm Benchmarking.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from backend.benchmark.comparator import benchmark_comparator

router = APIRouter(prefix="/api/benchmark", tags=["Benchmark"])


class BenchmarkRunRequest(BaseModel):
    fleet_size: int = Field(default=20, description="Fleet size: 5, 20, or 50 vessels")
    max_generations: int = Field(default=200, ge=10, le=500, description="Generation budget")
    pop_size: int = Field(default=100, ge=20, le=300, description="Population size per generation")
    algorithm_types: Optional[List[str]] = Field(default=["Quantum-NSGA-II", "Classical-NSGA-II", "MOEA/D"])


@router.post("/run")
async def run_benchmark(req: BenchmarkRunRequest) -> Dict[str, Any]:
    """
    Executes or returns high-fidelity multi-trial benchmark comparison between
    Quantum-Inspired NSGA-II, Classical NSGA-II, and MOEA/D.
    """
    try:
        results = benchmark_comparator.generate_benchmark_suite(
            fleet_size=req.fleet_size,
            max_generations=req.max_generations,
            pop_size=req.pop_size
        )
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark execution error: {str(e)}")


@router.get("/scalability")
async def get_scalability_metrics() -> Dict[str, Any]:
    """
    Returns pre-computed scalability benchmarks across 5, 20, and 50 vessel fleets.
    """
    suite = benchmark_comparator.generate_benchmark_suite(fleet_size=20)
    return {"status": "success", "data": suite["scalability"]}
'''

compliance_route_code = '''"""
FastAPI Routes for IMO CII, FuelEU Maritime, and EU ETS Compliance Calculations.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from backend.compliance.calculator import compliance_calculator

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])


class FuelMixInput(BaseModel):
    VLSFO: float = Field(default=142.0, ge=0.0, description="VLSFO consumption in MT")
    LSMGO: float = Field(default=18.0, ge=0.0, description="LSMGO consumption in MT")
    LNG: float = Field(default=0.0, ge=0.0, description="LNG consumption in MT")
    Biofuel_B30: float = Field(default=0.0, ge=0.0, description="Biofuel B30 consumption in MT")
    Biofuel_B100: float = Field(default=0.0, ge=0.0, description="Biofuel B100 consumption in MT")
    E_Methanol: float = Field(default=0.0, ge=0.0, description="E-Methanol consumption in MT")


class ComplianceCalculationRequest(BaseModel):
    vessel_type: str = Field(default="container", description="bulk_carrier, tanker, container, general_cargo, gas_carrier, lng_carrier, ro_ro")
    deadweight_tons: float = Field(default=120000.0, gt=0, description="Vessel DWT capacity")
    distance_nm: float = Field(default=8500.0, gt=0, description="Voyage distance in nautical miles")
    fuel_consumption_mt: Optional[Dict[str, float]] = Field(
        default={"VLSFO": 142.0, "LSMGO": 18.0},
        description="Fuel breakdown in metric tons"
    )
    year: int = Field(default=2026, ge=2023, le=2050, description="Regulatory compliance year")
    eua_price_eur: float = Field(default=85.0, ge=30.0, le=250.0, description="EU ETS carbon allowance price per ton")


@router.post("/calculate")
async def calculate_compliance(req: ComplianceCalculationRequest) -> Dict[str, Any]:
    """
    Calculates exact IMO CII rating, FuelEU Maritime GFI balance & penalty,
    and EU ETS surrender liability for a vessel voyage scenario.
    """
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
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance calculation error: {str(e)}")


@router.get("/defaults")
async def get_regulatory_defaults() -> Dict[str, Any]:
    """
    Returns reference specifications for fuels, CII parameters, and FuelEU reduction targets.
    """
    return {
        "status": "success",
        "data": {
            "fuel_specs": compliance_calculator.FUEL_SPECS,
            "cii_reference_params": compliance_calculator.CII_REF_PARAMS,
            "fueleu_baseline_ghg": compliance_calculator.FUELEU_BASELINE_GHG,
            "fueleu_targets": compliance_calculator.FUELEU_TARGETS,
            "ets_surrender_rates": compliance_calculator.EU_ETS_SURRENDER_RATES
        }
    }
'''

main_code = '''"""
NavOptima Fleet Management Dashboard - FastAPI Backend Server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.benchmark import router as benchmark_router
from backend.routes.compliance import router as compliance_router

app = FastAPI(
    title="NavOptima Maritime AI & Quantum Benchmarking API",
    description="Backend API for Maritime Vessel Optimization, Quantum-Classical Benchmarking, and IMO/FuelEU/ETS Compliance.",
    version="1.0.0"
)

# Enable CORS for Frontend Vite Dev and Production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(benchmark_router)
app.include_router(compliance_router)


@app.get("/")
async def root():
    return {
        "name": "NavOptima API",
        "status": "operational",
        "endpoints": [
            "/api/benchmark/run",
            "/api/benchmark/scalability",
            "/api/compliance/calculate",
            "/api/compliance/defaults"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''

with open('backend/routes/__init__.py', 'w', encoding='utf-8') as f:
    f.write(routes_init)
with open('backend/routes/benchmark.py', 'w', encoding='utf-8') as f:
    f.write(benchmark_route_code)
with open('backend/routes/compliance.py', 'w', encoding='utf-8') as f:
    f.write(compliance_route_code)
with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(main_code)

print("Routes and FastAPI main.py written successfully!")
