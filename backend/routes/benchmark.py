"""
FastAPI Routes for Multi-Algorithm Benchmarking.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from backend.benchmark.comparator import benchmark_comparator

router = APIRouter(tags=["Multi-Algorithm Benchmarking"])


class BenchmarkRunRequest(BaseModel):
    fleet_size: int = Field(
        default=20,
        description="Fleet scale size: 5 (Feeder), 20 (Regional), or 50 (Global) vessels",
        json_schema_extra={"example": 20}
    )
    max_generations: int = Field(
        default=200,
        ge=10,
        le=500,
        description="Total generation evaluation budget",
        json_schema_extra={"example": 200}
    )
    pop_size: int = Field(
        default=100,
        ge=20,
        le=300,
        description="Population size per generation",
        json_schema_extra={"example": 100}
    )
    algorithm_types: Optional[List[str]] = Field(
        default=["Quantum-NSGA-II", "Classical-NSGA-II", "MOEA/D"],
        description="List of algorithms to benchmark"
    )


@router.post(
    "/api/benchmark/run",
    summary="Run or retrieve multi-algorithm benchmark comparison suite",
    description="Compares Quantum-Inspired NSGA-II vs Classical NSGA-II vs MOEA/D across Hypervolume, Generational Distance, Spacing, and Wilcoxon statistical significance.",
)
@router.post(
    "/api/v1/benchmark/run",
    summary="Run benchmark suite (v1)",
)
async def run_benchmark(req: BenchmarkRunRequest) -> Dict[str, Any]:
    try:
        results = benchmark_comparator.generate_benchmark_suite(
            fleet_size=req.fleet_size,
            max_generations=req.max_generations,
            pop_size=req.pop_size
        )
        return {
            "status": "success",
            "message": "Benchmark comparison completed with statistical significance verification",
            "data": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark execution error: {str(e)}")


@router.get(
    "/api/benchmark/scalability",
    summary="Get computational scalability benchmarks (5, 20, 50 vessels)",
    description="Returns runtime execution time (ms), memory footprint (MB), and speedup factors for 5, 20, and 50 vessel fleet scheduling.",
)
@router.get(
    "/api/v1/benchmark/scalability",
    summary="Get scalability metrics (v1)",
)
async def get_scalability_metrics() -> Dict[str, Any]:
    try:
        suite = benchmark_comparator.generate_benchmark_suite(fleet_size=20)
        return {
            "status": "success",
            "data": suite["scalability"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scalability retrieval error: {str(e)}")
