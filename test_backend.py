import json
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("==================================================")
print("  NAVOPTIMA ENTERPRISE BACKEND TEST SUITE")
print("==================================================")

print("\n--- 1. Root, Health, Status & Fleet ---")
res = client.get("/")
assert res.status_code == 200, f"Root failed: {res.status_code}"
print("Root OK:", res.json()["service"])

res = client.get("/api/health")
assert res.status_code == 200, f"Health check failed: {res.status_code}"
print("Health OK:", res.json()["status"], "| Subsystems:", len(res.json()["subsystems"]))

res = client.get("/api/v1/system/status")
assert res.status_code == 200, f"Status failed: {res.status_code}"
print("Status (v1) OK:", res.json()["platform"], "| Version:", res.json()["version"])

res = client.get("/api/v1/fleet/vessels")
assert res.status_code == 200, f"Fleet vessels failed: {res.status_code}"
print("Fleet Registry OK | Active Vessels:", res.json()["count"])

print("\n--- 2. PINN Predict Engine ---")
pred_payload = {
    "speed_knots": 17.5,
    "draft_meters": 14.8,
    "trim_meters": 0.4,
    "cargo_load_percent": 85.0,
    "wave_height_meters": 1.5,
    "wind_speed_knots": 14.0,
    "wind_angle_deg": 30.0,
    "days_since_drydock": 180.0,
    "fuel_type": "VLSFO"
}
res = client.post("/api/v1/predict/hydrodynamics", json=pred_payload)
assert res.status_code == 200, f"Predict failed: {res.status_code}"
pred_json = res.json()["data"]
print("Power (kW):", pred_json["predictions"]["predicted_power_kw"])
print("Fuel Rate (MT/d):", pred_json["predictions"]["predicted_fuel_rate_mt_day"])
print("Residual Delta (kW):", pred_json["comparison"]["residual_power_delta_kw"])

res = client.get("/api/v1/predict/metrics")
assert res.status_code == 200, f"Predict metrics failed: {res.status_code}"
print("Metrics OK | Speed-power points:", len(res.json()["data"]["speed_power_curves"]))

res = client.get("/api/v1/predict/fuels")
assert res.status_code == 200, f"Predict fuels failed: {res.status_code}"
print("Fuels DB OK | Supported fuels:", len(res.json()["data"]))

print("\n--- 3. Multi-Objective Route & Speed Optimizer ---")
opt_payload = {
    "algorithm": "q_nsga2",
    "generations": 10,
    "population_size": 16,
    "max_transit_time_hours": 550.0,
    "cargo_load_ratio": 0.85,
    "ets_carbon_tax_rate": 92.0
}
res = client.post("/api/v1/optimize/fleet", json=opt_payload)
assert res.status_code == 200, f"Optimize failed: {res.status_code}"
opt_json = res.json()["data"]
print("Optimizer OK | Algorithm:", opt_json["algorithm"])
print("Pareto Front Size:", len(opt_json["pareto_front"]))
print("Knee Solution Index:", opt_json["knee_solution_index"])

print("\n--- 4. D-Wave Quantum QUBO Annealer ---")
qubo_payload = {
    "num_reads": 50,
    "annealing_time_us": 20.0,
    "chain_strength": 2.5,
    "lambda_onehot": 2500.0,
    "lambda_berth_conflict": 1500.0,
    "use_leap_cloud": False
}
res = client.post("/api/v1/optimize/quantum/qubo", json=qubo_payload)
assert res.status_code == 200, f"QUBO failed: {res.status_code}"
qubo_json = res.json()["data"]
print("QUBO OK | Ground Energy:", qubo_json["ground_state_energy"])
print("Fleet Assignments:", len(qubo_json["ground_state_assignments"]))
print("Constraint Violations:", qubo_json["constraint_violations"])

print("\n--- 5. Benchmark Comparator Suite ---")
bench_payload = {
    "fleet_size": 20,
    "max_generations": 50,
    "pop_size": 50
}
res = client.post("/api/v1/benchmark/run", json=bench_payload)
assert res.status_code == 200, f"Benchmark run failed: {res.status_code}"
bench_json = res.json()["data"]
print("Benchmark OK | Quantum HV:", bench_json["summary_kpis"]["quantum_hv"])
print("Classical HV:", bench_json["summary_kpis"]["classical_hv"])
print("Generations points:", len(bench_json["convergence_history"]))

res = client.get("/api/v1/benchmark/scalability")
assert res.status_code == 200, f"Benchmark scalability failed: {res.status_code}"
print("Scalability OK | Fleets tested:", len(res.json()["data"]))

print("\n--- 6. Regulatory Compliance Engine ---")
comp_payload = {
    "vessel_type": "container",
    "deadweight_tons": 120000.0,
    "distance_nm": 8500.0,
    "fuel_consumption_mt": {"VLSFO": 142.0, "Biofuel_B30": 25.0},
    "year": 2026,
    "eua_price_eur": 85.0
}
res = client.post("/api/v1/compliance/calculate", json=comp_payload)
assert res.status_code == 200, f"Compliance calc failed: {res.status_code}"
comp_json = res.json()["data"]
print("Compliance OK | Attained CII:", comp_json["imo_cii"]["cii_attained"])
print("CII Grade:", comp_json["imo_cii"]["rating"])
print("FuelEU Penalty EUR:", comp_json["fueleu_maritime"]["penalty_eur"])
print("EU ETS Liability EUR:", comp_json["eu_ets"]["total_eua_liability_eur"])

res = client.get("/api/v1/compliance/standards")
assert res.status_code == 200, f"Compliance standards failed: {res.status_code}"
print("Compliance Standards OK | Fuel specs:", len(res.json()["data"]["fuel_specs"]))

print("\n==================================================")
print("  ALL ENTERPRISE API ROUTES & MODULES VERIFIED 100% OK! ")
print("==================================================")
