"""
Fleet Multi-Objective Optimization Problem for NavOptima.
Implements IMO CII, FuelEU Maritime, hydrodynamic resistance, and EU ETS cost models.
Compatible with pymoo Problem interface and standalone vector evaluation.
"""

from typing import Dict, List, Any, Optional, Tuple
import numpy as np

try:
    from pymoo.core.problem import ElementwiseProblem
    PYMOO_AVAILABLE = True
except ImportError:
    ElementwiseProblem = object
    PYMOO_AVAILABLE = False


# Fuel properties database
# LCV (MJ/kg), Price ($/MT), CF (tCO2/tFuel TTW), WTW GHG intensity (gCO2e/MJ), GFI (gCO2e/MJ)
FUEL_DATABASE = {
    0: {
        "name": "VLSFO",
        "lcv_mj_kg": 40.5,
        "price_usd_per_mt": 620.0,
        "cf_ttw": 3.114,
        "wtw_ghg_intensity_g_mj": 91.6,
        "gfi_g_mj": 91.6,
        "category": "fossil",
    },
    1: {
        "name": "LNG",
        "lcv_mj_kg": 48.0,
        "price_usd_per_mt": 760.0,
        "cf_ttw": 2.750,
        "wtw_ghg_intensity_g_mj": 78.2,
        "gfi_g_mj": 78.2,
        "category": "transitional",
    },
    2: {
        "name": "Bio-MGO (B30/B100)",
        "lcv_mj_kg": 42.5,
        "price_usd_per_mt": 1180.0,
        "cf_ttw": 0.450,  # Net fossil TTW accounting for biogenic crediting
        "wtw_ghg_intensity_g_mj": 22.8,
        "gfi_g_mj": 22.8,
        "category": "biofuel",
    },
    3: {
        "name": "E-Methanol",
        "lcv_mj_kg": 19.9,
        "price_usd_per_mt": 1450.0,
        "cf_ttw": 0.150,  # Recycled carbon / RFNBO
        "wtw_ghg_intensity_g_mj": 11.5,
        "gfi_g_mj": 11.5,
        "category": "e-fuel",
    },
    4: {
        "name": "Green Ammonia",
        "lcv_mj_kg": 18.6,
        "price_usd_per_mt": 1680.0,
        "cf_ttw": 0.000,  # Zero-carbon molecule
        "wtw_ghg_intensity_g_mj": 4.8,
        "gfi_g_mj": 4.8,
        "category": "zero-carbon",
    },
}

# Standard 4-leg East-West intercontinental corridor (e.g. Shanghai to Rotterdam)
DEFAULT_LEGS = [
    {
        "id": 1,
        "name": "Shanghai -> Singapore (Malacca Strait)",
        "base_distance_nm": 2250.0,
        "weather_factors": [1.02, 0.92, 1.05],  # [standard, weather-opt, eca-avoid]
        "distance_multipliers": [1.00, 1.035, 1.060],
        "canal_port_fee_usd": 45000.0,
        "eca_fraction": 0.0,
    },
    {
        "id": 2,
        "name": "Singapore -> Colombo (Indian Ocean)",
        "base_distance_nm": 1580.0,
        "weather_factors": [1.06, 0.88, 1.08],
        "distance_multipliers": [1.00, 1.042, 1.070],
        "canal_port_fee_usd": 25000.0,
        "eca_fraction": 0.0,
    },
    {
        "id": 3,
        "name": "Colombo -> Suez / Port Said (Red Sea)",
        "base_distance_nm": 2120.0,
        "weather_factors": [1.00, 0.95, 1.02],
        "distance_multipliers": [1.00, 1.020, 1.040],
        "canal_port_fee_usd": 480000.0,  # Suez canal transit toll
        "eca_fraction": 0.15,
    },
    {
        "id": 4,
        "name": "Port Said -> Rotterdam (Med & Atlantic)",
        "base_distance_nm": 3280.0,
        "weather_factors": [1.08, 0.91, 1.04],
        "distance_multipliers": [1.00, 1.045, 1.080],
        "canal_port_fee_usd": 85000.0,
        "eca_fraction": 0.65,  # EU ETS and Med ECA
    },
]

# Baseline vessel parameters: 15,000 TEU Neo-Panamax Container Vessel
DEFAULT_VESSEL_SPECS = {
    "name": "NavOptima Stellar Horizon",
    "vessel_type": "Container (15,000 TEU)",
    "dwt": 150000.0,
    "design_speed_knots": 19.5,
    "design_power_kw": 42000.0,
    "sfoc_baseline_g_kwh": 165.0,
    "aux_power_kw": 2800.0,
    "boiler_fuel_mt_day": 1.2,
    "charter_rate_usd_day": 28000.0,
    "ets_carbon_price_usd_ton": 92.0,
    "cii_ref_g_dwt_nm": 4.15,  # IMO CII Baseline for Container Ship 150k DWT
    "cii_target_grade_c": 3.85,  # Target Grade C boundary
    "fueleu_gfi_target": 84.5,  # FuelEU 2026-2030 target gCO2e/MJ
}


class FleetOptimizationProblem(ElementwiseProblem if PYMOO_AVAILABLE else object):
    """
    Fleet Multi-Objective Optimization Problem.
    
    Decision Variables per leg i:
      - x[i] in [10.0, 22.0]: Vessel Speed v_i (knots)
      - x[n_legs + i] in [0, 4]: Fuel Selection f_i (Discrete Index)
      - x[2*n_legs + i] in [0, 2]: Route Choice r_i (Discrete Index)
      
    Objectives:
      - F[0]: Total Voyage Cost ($USD: Fuel + Carbon Tax + Charter Time + Fees)
      - F[1]: Total Well-to-Wake Lifecycle GHG Emissions (MT CO2e)
      
    Constraints:
      - G[0]: Total Voyage Time (Hours) - Max Allowed Duration <= 0
      - G[1]: Attained CII Rating - Grade C CII Threshold <= 0
      - G[2]: Attained GFI - FuelEU Maritime Target <= 0
      - G[3]: Minimum Safe Navigation Speed Margin <= 0
    """

    def __init__(
        self,
        legs: Optional[List[Dict[str, Any]]] = None,
        vessel_specs: Optional[Dict[str, Any]] = None,
        max_transit_time_hours: float = 540.0,
        cargo_load_ratio: float = 0.85,
        ets_carbon_tax_rate: float = 92.0,
    ):
        self.legs = legs or DEFAULT_LEGS
        self.vessel_specs = {**DEFAULT_VESSEL_SPECS, **(vessel_specs or {})}
        self.max_transit_time_hours = max_transit_time_hours
        self.cargo_load_ratio = cargo_load_ratio
        self.ets_carbon_tax_rate = ets_carbon_tax_rate
        self.n_legs = len(self.legs)

        # Dimension of decision variables: n_legs (speed) + n_legs (fuel) + n_legs (route)
        self.n_var = 3 * self.n_legs
        self.n_obj = 2
        self.n_ieq_constr = 4

        # Bounds
        # Speeds: 10.0 to 22.0 kts
        # Fuel index: 0 to 4 (rounded/cast in eval)
        # Route index: 0 to 2 (rounded/cast in eval)
        self.xl = np.array([10.0] * self.n_legs + [0.0] * self.n_legs + [0.0] * self.n_legs)
        self.xu = np.array([22.0] * self.n_legs + [4.0] * self.n_legs + [2.0] * self.n_legs)

        if PYMOO_AVAILABLE:
            super().__init__(
                n_var=self.n_var,
                n_obj=self.n_obj,
                n_ieq_constr=self.n_ieq_constr,
                xl=self.xl,
                xu=self.xu,
            )

    def decode_decision_vector(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Split and cast continuous/discrete decision variables."""
        speeds = np.clip(x[0 : self.n_legs], 10.0, 22.0)
        fuels = np.clip(np.round(x[self.n_legs : 2 * self.n_legs]), 0, 4).astype(int)
        routes = np.clip(np.round(x[2 * self.n_legs : 3 * self.n_legs]), 0, 2).astype(int)
        return speeds, fuels, routes

    def compute_leg_metrics(
        self,
        leg: Dict[str, Any],
        speed: float,
        fuel_idx: int,
        route_idx: int,
    ) -> Dict[str, float]:
        """
        Calculates hydrodynamic power, fuel consumption, costs, and emissions for a single leg.
        """
        fuel_prop = FUEL_DATABASE[fuel_idx]
        route_multiplier = leg["distance_multipliers"][route_idx]
        weather_factor = leg["weather_factors"][route_idx]
        distance_nm = leg["base_distance_nm"] * route_multiplier

        # Transit time on this leg (hours)
        transit_time_hrs = distance_nm / max(speed, 5.0)
        transit_days = transit_time_hrs / 24.0

        # Hydrodynamic propulsion power estimation (Cubic/Admiralty law with weather resistance)
        # P_me = P_ref * (v / v_ref)^3.2 * (Displacement / Disp_ref)^(2/3) * weather_factor
        v_ref = self.vessel_specs["design_speed_knots"]
        p_ref = self.vessel_specs["design_power_kw"]
        load_factor = (0.7 + 0.3 * self.cargo_load_ratio) ** (2.0 / 3.0)
        
        # Main engine power (kW)
        p_me_kw = p_ref * ((speed / v_ref) ** 3.2) * load_factor * weather_factor
        p_me_kw = np.clip(p_me_kw, 3500.0, p_ref * 1.05)  # Physical engine envelope

        # Auxiliary engine power (constant electric load + reefer)
        p_aux_kw = self.vessel_specs["aux_power_kw"]

        # Energy consumption (MJ)
        # SFOC base for VLSFO (40.5 MJ/kg) -> energy equivalent for alternative fuels
        base_sfoc_g_kwh = self.vessel_specs["sfoc_baseline_g_kwh"]  # g/kWh
        base_efficiency = 3600.0 / (base_sfoc_g_kwh * 40.5)  # thermal efficiency ~48%
        
        fuel_lcv = fuel_prop["lcv_mj_kg"]
        specific_fuel_rate_g_kwh = 3600.0 / (base_efficiency * fuel_lcv)  # g/kWh for chosen fuel

        # Total energy consumed (GJ) and fuel consumed (Metric Tons)
        me_energy_mwh = (p_me_kw * transit_time_hrs) / 1000.0
        aux_energy_mwh = (p_aux_kw * transit_time_hrs) / 1000.0
        total_energy_mwh = me_energy_mwh + aux_energy_mwh
        total_energy_mj = total_energy_mwh * 3600.0

        # Fuel burned (MT)
        fuel_mt = (total_energy_mwh * specific_fuel_rate_g_kwh) / 1000.0
        fuel_mt += self.vessel_specs["boiler_fuel_mt_day"] * transit_days

        # Financial costs ($USD)
        fuel_cost_usd = fuel_mt * fuel_prop["price_usd_per_mt"]
        charter_time_cost_usd = transit_days * self.vessel_specs["charter_rate_usd_day"]
        port_canal_fee_usd = leg["canal_port_fee_usd"]

        # EU ETS and Carbon taxation
        # TTW CO2 emissions (MT)
        co2_ttw_mt = fuel_mt * fuel_prop["cf_ttw"]
        # In EU waters / ECA fraction, 100% ETS applies; otherwise voyage inbound/outbound 50%
        ets_applicable_fraction = min(1.0, leg["eca_fraction"] + 0.35)
        ets_cost_usd = co2_ttw_mt * ets_applicable_fraction * self.ets_carbon_tax_rate

        total_leg_cost_usd = fuel_cost_usd + charter_time_cost_usd + port_canal_fee_usd + ets_cost_usd

        # Well-to-Wake Lifecycle GHG Emissions (MT CO2e)
        wtw_ghg_intensity = fuel_prop["wtw_ghg_intensity_g_mj"]
        wtw_ghg_mt = (total_energy_mj * wtw_ghg_intensity) / 1e6

        # FuelEU GFI metrics
        gfi_weighted_energy = total_energy_mj * fuel_prop["gfi_g_mj"]

        return {
            "distance_nm": distance_nm,
            "transit_time_hrs": transit_time_hrs,
            "transit_days": transit_days,
            "p_me_kw": p_me_kw,
            "fuel_mt": fuel_mt,
            "fuel_cost_usd": fuel_cost_usd,
            "charter_cost_usd": charter_time_cost_usd,
            "port_canal_fee_usd": port_canal_fee_usd,
            "ets_cost_usd": ets_cost_usd,
            "total_cost_usd": total_leg_cost_usd,
            "co2_ttw_mt": co2_ttw_mt,
            "wtw_ghg_mt": wtw_ghg_mt,
            "total_energy_mj": total_energy_mj,
            "gfi_weighted_energy": gfi_weighted_energy,
        }

    def evaluate_solution(self, x: np.ndarray) -> Dict[str, Any]:
        """
        Evaluates a complete decision vector x and returns objectives, constraints, and metrics.
        """
        speeds, fuels, routes = self.decode_decision_vector(x)

        total_cost_usd = 0.0
        total_wtw_ghg_mt = 0.0
        total_co2_ttw_mt = 0.0
        total_fuel_mt = 0.0
        total_distance_nm = 0.0
        total_transit_time_hrs = 0.0
        total_energy_mj = 0.0
        total_gfi_weighted = 0.0

        leg_details = []

        for i, leg in enumerate(self.legs):
            metrics = self.compute_leg_metrics(
                leg=leg,
                speed=float(speeds[i]),
                fuel_idx=int(fuels[i]),
                route_idx=int(routes[i]),
            )
            total_cost_usd += metrics["total_cost_usd"]
            total_wtw_ghg_mt += metrics["wtw_ghg_mt"]
            total_co2_ttw_mt += metrics["co2_ttw_mt"]
            total_fuel_mt += metrics["fuel_mt"]
            total_distance_nm += metrics["distance_nm"]
            total_transit_time_hrs += metrics["transit_time_hrs"]
            total_energy_mj += metrics["total_energy_mj"]
            total_gfi_weighted += metrics["gfi_weighted_energy"]

            leg_details.append({
                "leg_id": leg["id"],
                "name": leg["name"],
                "speed_knots": round(float(speeds[i]), 2),
                "fuel_type": FUEL_DATABASE[int(fuels[i])]["name"],
                "fuel_idx": int(fuels[i]),
                "route_type": ["Standard", "Weather-Optimized", "ECA-Avoiding"][int(routes[i])],
                "route_idx": int(routes[i]),
                **{k: round(v, 2) for k, v in metrics.items()},
            })

        # IMO CII calculation (Attained CII in g CO2 / (DWT * NM))
        dwt = self.vessel_specs["dwt"]
        attained_cii = (total_co2_ttw_mt * 1e6) / (dwt * max(total_distance_nm, 100.0))
        cii_grade_c_target = self.vessel_specs["cii_target_grade_c"]

        # CII Rating Letter (A, B, C, D, E) based on IMO boundaries
        ref_cii = self.vessel_specs["cii_ref_g_dwt_nm"]
        ratio = attained_cii / ref_cii
        if ratio <= 0.83:
            cii_grade = "A"
        elif ratio <= 0.94:
            cii_grade = "B"
        elif ratio <= 1.06:
            cii_grade = "C"
        elif ratio <= 1.19:
            cii_grade = "D"
        else:
            cii_grade = "E"

        # FuelEU GFI (Greenhouse Gas Intensity in g CO2e / MJ)
        attained_gfi = total_gfi_weighted / max(total_energy_mj, 1.0)
        fueleu_target = self.vessel_specs["fueleu_gfi_target"]

        # Constraints (G <= 0 is feasible)
        g1_time = total_transit_time_hrs - self.max_transit_time_hours
        g2_cii = attained_cii - cii_grade_c_target
        g3_gfi = attained_gfi - fueleu_target
        g4_min_speed = np.sum(np.maximum(0.0, 10.5 - speeds))

        objectives = np.array([total_cost_usd, total_wtw_ghg_mt], dtype=float)
        constraints = np.array([g1_time, g2_cii, g3_gfi, g4_min_speed], dtype=float)

        return {
            "objectives": [float(v) for v in objectives],
            "constraints": [float(v) for v in constraints],
            "total_cost_usd": float(round(total_cost_usd, 2)),
            "total_wtw_ghg_mt": float(round(total_wtw_ghg_mt, 2)),
            "total_co2_ttw_mt": float(round(total_co2_ttw_mt, 2)),
            "total_fuel_mt": float(round(total_fuel_mt, 2)),
            "total_distance_nm": float(round(total_distance_nm, 2)),
            "total_transit_time_hrs": float(round(total_transit_time_hrs, 2)),
            "attained_cii": float(round(attained_cii, 2)),
            "cii_grade": str(cii_grade),
            "attained_gfi": float(round(attained_gfi, 2)),
            "is_feasible": bool(np.all(constraints <= 1e-4)),
            "leg_details": leg_details,
        }

    def _evaluate(self, x, out, *args, **kwargs):
        """Pymoo interface evaluation step."""
        res = self.evaluate_solution(x)
        out["F"] = np.array(res["objectives"], dtype=float)
        out["G"] = np.array(res["constraints"], dtype=float)

