"""
FastAPI Routes for Fleet Multi-Objective Optimization & Quantum Annealing.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.optimizer.problem import FleetOptimizationProblem, DEFAULT_LEGS, DEFAULT_VESSEL_SPECS
from backend.optimizer.quantum_operators import QuantumNSGA2
from backend.optimizer.qubo_annealer import MaritimeQUBOBuilder, QuantumAnnealingSimulator

router = APIRouter(tags=["Multi-Objective Optimization & Quantum Annealing"])


class OptimizationRequest(BaseModel):
    algorithm: str = Field(
        default="q_nsga2",
        description="Optimization algorithm: 'q_nsga2' (Quantum-Inspired Rotation Gate) or 'nsga2' (Classical)",
        json_schema_extra={"example": "q_nsga2"}
    )
    generations: int = Field(
        default=35,
        ge=5,
        le=200,
        description="Evolutionary generations budget",
        json_schema_extra={"example": 35}
    )
    population_size: int = Field(
        default=32,
        ge=8,
        le=120,
        description="Qubit chromosome population size",
        json_schema_extra={"example": 32}
    )
    max_transit_time_hours: float = Field(
        default=540.0,
        description="Max total voyage transit time constraint (ETA window)",
        json_schema_extra={"example": 540.0}
    )
    cargo_load_ratio: float = Field(
        default=0.85,
        ge=0.1,
        le=1.0,
        description="Vessel cargo payload capacity ratio",
        json_schema_extra={"example": 0.85}
    )
    ets_carbon_tax_rate: float = Field(
        default=92.0,
        description="EU ETS / Carbon tax rate $/MT CO2",
        json_schema_extra={"example": 92.0}
    )
    custom_legs: Optional[List[Dict[str, Any]]] = None
    vessel_specs: Optional[Dict[str, Any]] = None


class QUBOCalculationRequest(BaseModel):
    num_reads: int = Field(
        default=1000,
        ge=10,
        le=10000,
        description="Number of annealing reads / sample bitstrings",
        json_schema_extra={"example": 1000}
    )
    annealing_time_us: float = Field(
        default=20.0,
        ge=1.0,
        le=2000.0,
        description="QPU annealing duration in microseconds (1 to 2000 µs)",
        json_schema_extra={"example": 20.0}
    )
    chain_strength: float = Field(
        default=2.5,
        description="Minor embedding chain strength gamma",
        json_schema_extra={"example": 2.5}
    )
    lambda_onehot: float = Field(
        default=2500.0,
        description="Lagrange multiplier penalty for 1-hot vessel assignment constraints",
        json_schema_extra={"example": 2500.0}
    )
    lambda_berth_conflict: float = Field(
        default=1500.0,
        description="Lagrange multiplier penalty for berth slot time conflicts",
        json_schema_extra={"example": 1500.0}
    )
    use_leap_cloud: bool = Field(
        default=False,
        description="Flag for real D-Wave Leap Cloud Quantum Hardware execution",
        json_schema_extra={"example": False}
    )
    leap_token: Optional[str] = Field(
        default=None,
        description="Optional D-Wave Leap Cloud API Token"
    )


@router.post(
    "/api/optimize",
    summary="Execute Fleet Multi-Objective Routing & Speed Optimization",
    description="Executes Quantum-Inspired NSGA-II (Q-NSGA-II) or Classical NSGA-II to find the Pareto non-dominated frontier (Voyage Cost vs Lifecycle WTW Emissions).",
)
@router.post(
    "/api/v1/optimize/fleet",
    summary="Execute Fleet Multi-Objective Optimization (v1)",
)
async def run_optimization(request: OptimizationRequest):
    try:
        problem = FleetOptimizationProblem(
            legs=request.custom_legs or DEFAULT_LEGS,
            vessel_specs=request.vessel_specs or DEFAULT_VESSEL_SPECS,
            max_transit_time_hours=request.max_transit_time_hours,
            cargo_load_ratio=request.cargo_load_ratio,
            ets_carbon_tax_rate=request.ets_carbon_tax_rate,
        )

        solver = QuantumNSGA2(
            problem=problem,
            pop_size=request.population_size,
            n_gen=request.generations,
            theta_step=0.06 * 3.1415926535,
        )

        results = solver.solve()
        return {
            "status": "success",
            "message": "Quantum-inspired multi-objective optimization converged successfully",
            "data": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@router.post(
    "/api/quantum/qubo",
    summary="Solve Discrete Fleet Berth-Fuel Allocation via D-Wave QUBO",
    description="Formulates the discrete scheduling problem as an Ising/QUBO Hamiltonian solved on D-Wave Advantage QPU or Neal Simulated Annealer.",
)
@router.post(
    "/api/v1/optimize/quantum/qubo",
    summary="Solve D-Wave QUBO Berth-Fuel Problem (v1)",
)
async def run_quantum_qubo(request: QUBOCalculationRequest):
    try:
        builder = MaritimeQUBOBuilder(
            lambda_onehot=request.lambda_onehot,
            lambda_berth_conflict=request.lambda_berth_conflict,
        )

        result = QuantumAnnealingSimulator.solve_qubo(
            builder=builder,
            num_reads=request.num_reads,
            annealing_time_us=request.annealing_time_us,
            chain_strength=request.chain_strength,
            use_leap_cloud=request.use_leap_cloud,
            leap_token=request.leap_token,
        )

        return {
            "status": "success",
            "message": "QUBO ground state and energy spectrum computed successfully",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QUBO execution failed: {str(e)}")


@router.get(
    "/api/optimize/health",
    summary="Check optimizer engine status and capabilities",
)
@router.get(
    "/api/v1/optimize/status",
    summary="Check optimizer status (v1)",
)
async def optimizer_health():
    return {
        "status": "healthy",
        "engine": "NavOptima Quantum Multi-Objective Optimization Core",
        "quantum_operators": "Hilbert Space Rotation Gate U(Δθ) with Pareto-guided lookup",
        "annealing_solvers": ["dwave-neal", "Ocean SDK Leap Cloud", "Simulated Annealing Engine"],
        "supported_fuels": ["VLSFO", "LNG", "Bio-MGO", "E-Methanol", "Green Ammonia"],
        "default_legs_count": len(DEFAULT_LEGS),
    }
