import os

calculator_code = '''"""
Maritime Regulatory Compliance Engine for NavOptima.
Implements:
1. IMO Carbon Intensity Indicator (CII): Resolution MEPC.337(76) & MEPC.338(76),
   required CII, attained CII, d1-d4 rating boundaries, letter grade A-E, and SEEMP Part III Corrective Action Plans.
2. FuelEU Maritime & IMO GHG Fuel Intensity (GFI): Well-to-Wake (WtW) GHG intensity,
   2025-2050 regulatory reduction timeline, Compliance Balance (CB), and financial penalties (€2,400/t VLSFO eq).
3. EU ETS Maritime Allowance Calculator: Phase-in surrender obligations (2024: 40%, 2025: 70%, 2026+: 100%),
   scope allocation (intra-EU vs extra-EU), EUA carbon cost exposure and optimization savings.
"""

from typing import Dict, List, Any, Optional
import math


class MaritimeComplianceCalculator:
    """
    Comprehensive compliance calculator covering IMO CII, FuelEU Maritime, and EU ETS regulations.
    """

    # IMO MEPC.337(76) Reference Line Parameters: CII_ref = a * Capacity^(-c)
    CII_REF_PARAMS = {
        "bulk_carrier": {"a": 4745.0, "c": 0.622, "cap_type": "DWT"},
        "tanker": {"a": 5247.0, "c": 0.610, "cap_type": "DWT"},
        "container": {"a": 1984.0, "c": 0.489, "cap_type": "DWT"},
        "general_cargo": {"a": 31940.0, "c": 0.792, "cap_type": "DWT"},
        "gas_carrier": {"a": 9827.0, "c": 0.556, "cap_type": "DWT"},
        "lng_carrier": {"a": 9.827, "c": 0.000, "cap_type": "DWT"},
        "ro_ro": {"a": 5739.0, "c": 0.631, "cap_type": "GT"}
    }

    # IMO Annual Reduction Factors Z (%) relative to 2019 baseline
    CII_Z_FACTORS = {
        2023: 5.0,
        2024: 7.0,
        2025: 9.0,
        2026: 11.0,
        2027: 13.0,
        2028: 15.0,
        2029: 17.0,
        2030: 19.0
    }

    # FuelEU Maritime Target GHG Intensity Reductions vs 91.16 gCO2e/MJ baseline
    FUELEU_BASELINE_GHG = 91.16  # gCO2e/MJ
    FUELEU_TARGETS = {
        2025: 0.020,  # -2% -> 89.34 gCO2e/MJ
        2030: 0.060,  # -6% -> 85.69 gCO2e/MJ
        2035: 0.145,  # -14.5% -> 77.94 gCO2e/MJ
        2040: 0.310,  # -31% -> 62.90 gCO2e/MJ
        2045: 0.620,  # -62% -> 34.64 gCO2e/MJ
        2050: 0.800   # -80% -> 18.23 gCO2e/MJ
    }

    # Standard Fuel Specifications: LCV (MJ/kg), WtW GHG (gCO2e/MJ), CF (tCO2/t fuel)
    FUEL_SPECS = {
        "VLSFO": {"lcv_mj_per_kg": 41.0, "wtw_ghg_g_per_mj": 91.16, "cf_tco2_per_t": 3.114, "name": "Very Low Sulphur Fuel Oil"},
        "LSMGO": {"lcv_mj_per_kg": 42.7, "wtw_ghg_g_per_mj": 89.50, "cf_tco2_per_t": 3.206, "name": "Low Sulphur Marine Gas Oil"},
        "LNG": {"lcv_mj_per_kg": 49.1, "wtw_ghg_g_per_mj": 75.80, "cf_tco2_per_t": 2.750, "name": "Liquefied Natural Gas (Dual-Fuel)"},
        "Biofuel_B30": {"lcv_mj_per_kg": 39.8, "wtw_ghg_g_per_mj": 63.81, "cf_tco2_per_t": 2.180, "name": "Biofuel B30 Drop-in Blend"},
        "Biofuel_B100": {"lcv_mj_per_kg": 44.0, "wtw_ghg_g_per_mj": 15.20, "cf_tco2_per_t": 0.000, "name": "Hydrotreated Vegetable Oil (HVO 100)"},
        "E_Methanol": {"lcv_mj_per_kg": 19.9, "wtw_ghg_g_per_mj": 8.50, "cf_tco2_per_t": 0.000, "name": "E-Methanol (Renewable)"},
        "E_Ammonia": {"lcv_mj_per_kg": 18.6, "wtw_ghg_g_per_mj": 2.00, "cf_tco2_per_t": 0.000, "name": "Green Ammonia"}
    }

    # EU ETS Surrender Rates by Year
    EU_ETS_SURRENDER_RATES = {
        2024: 0.40,
        2025: 0.70,
        2026: 1.00
    }

    def get_cii_z_factor(self, year: int) -> float:
        if year in self.CII_Z_FACTORS:
            return self.CII_Z_FACTORS[year]
        elif year < 2023:
            return 0.0
        else:
            # Linear projection beyond 2030 (+2% per year)
            return min(50.0, 19.0 + (year - 2030) * 2.0)

    def get_fueleu_target_ghg(self, year: int) -> float:
        if year < 2025:
            return self.FUELEU_BASELINE_GHG
        if year >= 2050:
            reduction = 0.80
        elif year >= 2045:
            r0, r1 = 0.62, 0.80
            reduction = r0 + (r1 - r0) * ((year - 2045) / 5.0)
        elif year >= 2040:
            r0, r1 = 0.31, 0.62
            reduction = r0 + (r1 - r0) * ((year - 2040) / 5.0)
        elif year >= 2035:
            r0, r1 = 0.145, 0.31
            reduction = r0 + (r1 - r0) * ((year - 2035) / 5.0)
        elif year >= 2030:
            r0, r1 = 0.060, 0.145
            reduction = r0 + (r1 - r0) * ((year - 2030) / 5.0)
        else:
            r0, r1 = 0.020, 0.060
            reduction = r0 + (r1 - r0) * ((year - 2025) / 5.0)
            
        return self.FUELEU_BASELINE_GHG * (1.0 - reduction)

    def calculate_imo_cii(
        self,
        vessel_type: str,
        deadweight_tons: float,
        distance_nm: float,
        fuel_consumption_mt: Dict[str, float],
        year: int = 2026
    ) -> Dict[str, Any]:
        """
        Calculates Required CII, Attained CII, d1-d4 rating boundaries, and assigned Letter Grade.
        """
        v_key = vessel_type.lower().replace(" ", "_").replace("-", "_")
        params = self.CII_REF_PARAMS.get(v_key, self.CII_REF_PARAMS["container"])
        
        # Reference CII
        if params["c"] == 0.0:
            cii_ref = params["a"]
        else:
            cii_ref = params["a"] * (deadweight_tons ** (-params["c"]))
            
        z_factor = self.get_cii_z_factor(year)
        cii_required = cii_ref * (1.0 - z_factor / 100.0)
        
        # Calculate Total CO2 emissions (MT)
        total_co2_mt = 0.0
        for fuel_type, mt in fuel_consumption_mt.items():
            spec = self.FUEL_SPECS.get(fuel_type, self.FUEL_SPECS["VLSFO"])
            total_co2_mt += mt * spec["cf_tco2_per_t"]
            
        # Attained CII = (sum(FC * CF) * 1e6) / (Capacity * Distance) [gCO2 / (DWT * nm)]
        if deadweight_tons > 0 and distance_nm > 0:
            cii_attained = (total_co2_mt * 1e6) / (deadweight_tons * distance_nm)
        else:
            cii_attained = 0.0
            
        # Boundary limits d1, d2, d3, d4 based on IMO MEPC.338(76)
        # Vector multipliers relative to required CII:
        # Grade A: < d1 (0.82)
        # Grade B: d1 <= CII < d2 (0.93)
        # Grade C: d2 <= CII < d3 (1.08)
        # Grade D: d3 <= CII < d4 (1.19)
        # Grade E: >= d4
        d1 = 0.82 * cii_required
        d2 = 0.93 * cii_required
        d3 = 1.08 * cii_required
        d4 = 1.19 * cii_required
        
        if cii_attained <= d1:
            rating = "A"
            rating_desc = "Superior Performance"
            status_color = "#00D4B8"  # Teal
        elif cii_attained <= d2:
            rating = "B"
            rating_desc = "Minor Superior Performance"
            status_color = "#3B82F6"  # Blue
        elif cii_attained <= d3:
            rating = "C"
            rating_desc = "Moderate / Compliant Performance"
            status_color = "#10B981"  # Emerald
        elif cii_attained <= d4:
            rating = "D"
            rating_desc = "Minor Inferior (Corrective Plan Required if 3 yrs)"
            status_color = "#F59E0B"  # Amber
        else:
            rating = "E"
            rating_desc = "Inferior (Immediate SEEMP Part III Corrective Action Plan Required)"
            status_color = "#EF4444"  # Red
            
        # Corrective action recommendations
        corrective_plan = None
        if rating in ["D", "E"]:
            # Target is reaching Grade C (below d3)
            target_cii = 0.98 * d2  # Target middle of Grade B/C
            target_co2_mt = (target_cii * deadweight_tons * distance_nm) / 1e6
            reduction_mt_needed = max(0.0, total_co2_mt - target_co2_mt)
            reduction_pct_needed = (reduction_mt_needed / total_co2_mt * 100.0) if total_co2_mt > 0 else 0.0
            
            # Speed reduction estimation: Fuel ~ Speed^3 -> delta_v / v approx delta_fuel / 3
            speed_reduction_knots = round(reduction_pct_needed / 3.0 * 0.15, 1)
            biofuel_b30_fraction_needed = min(100.0, round(reduction_pct_needed * 3.3, 1))
            
            corrective_plan = {
                "mandated_by_imo": True,
                "seemp_part_iii_flag": True,
                "target_grade": "C",
                "emission_reduction_needed_mt": round(reduction_mt_needed, 1),
                "emission_reduction_pct": round(reduction_pct_needed, 1),
                "recommended_actions": [
                    f"Speed derating: Reduce voyage transit speed by {speed_reduction_knots} knots (~{round(reduction_pct_needed, 1)}% fuel savings).",
                    f"Fuel transition: Blend {biofuel_b30_fraction_needed}% Biofuel B30 into main bunker to immediately attain Grade C.",
                    "Hull cleaning & silicone fouling-release coating application to reduce hydrodynamic frictional resistance by 6-9%.",
                    "Quantum route & weather micro-routing adoption for dynamic current and sea-state avoidance."
                ]
            }

        return {
            "year": year,
            "vessel_type": vessel_type,
            "deadweight_tons": deadweight_tons,
            "distance_nm": distance_nm,
            "total_co2_emissions_mt": round(total_co2_mt, 2),
            "cii_reference": round(cii_ref, 4),
            "z_reduction_factor_pct": z_factor,
            "cii_required": round(cii_required, 4),
            "cii_attained": round(cii_attained, 4),
            "rating": rating,
            "rating_description": rating_desc,
            "status_color": status_color,
            "boundaries": {
                "d1_a_b": round(d1, 4),
                "d2_b_c": round(d2, 4),
                "d3_c_d": round(d3, 4),
                "d4_d_e": round(d4, 4)
            },
            "corrective_action_plan": corrective_plan
        }

    def calculate_fueleu_maritime(
        self,
        fuel_consumption_mt: Dict[str, float],
        year: int = 2026,
        consecutive_deficit_years: int = 1
    ) -> Dict[str, Any]:
        """
        Calculates Well-to-Wake GHG Intensity (gCO2e/MJ), FuelEU Target, Compliance Balance (CB),
        and regulatory penalty (€2,400 per ton VLSFO equivalent).
        """
        target_ghg = self.get_fueleu_target_ghg(year)
        
        total_energy_mj = 0.0
        total_wtw_ghg_g = 0.0
        
        for fuel_type, mt in fuel_consumption_mt.items():
            spec = self.FUEL_SPECS.get(fuel_type, self.FUEL_SPECS["VLSFO"])
            kg = mt * 1000.0
            energy_mj = kg * spec["lcv_mj_per_kg"]
            ghg_g = energy_mj * spec["wtw_ghg_g_per_mj"]
            
            total_energy_mj += energy_mj
            total_wtw_ghg_g += ghg_g
            
        attained_ghg = (total_wtw_ghg_g / total_energy_mj) if total_energy_mj > 0 else self.FUELEU_BASELINE_GHG
        
        # Compliance Balance (CB) in gCO2eq: CB = (Target - Attained) * Total Energy (MJ)
        compliance_balance_g = (target_ghg - attained_ghg) * total_energy_mj
        compliance_balance_tco2e = compliance_balance_g / 1e6
        
        # Penalty Calculation:
        # If CB < 0: Deficit = |CB| (in gCO2eq).
        # Penalty (€) = (|CB| / (41,000 MJ/t * Target_GHG)) * €2,400 * penalty_factor
        penalty_factor = 1.0 + (consecutive_deficit_years - 1) * 0.10
        
        if compliance_balance_g < 0:
            deficit_g = abs(compliance_balance_g)
            # 41,000 MJ per ton of VLSFO eq
            vlsfo_equivalent_tons = deficit_g / (41000.0 * target_ghg)
            penalty_eur = vlsfo_equivalent_tons * 2400.0 * penalty_factor
            is_compliant = False
        else:
            vlsfo_equivalent_tons = 0.0
            penalty_eur = 0.0
            is_compliant = True
            
        # Generate 2025-2050 timeline points
        trajectory_timeline = []
        timeline_years = [2025, 2028, 2030, 2035, 2040, 2045, 2050]
        for y in timeline_years:
            t_ghg = self.get_fueleu_target_ghg(y)
            # Project attained GHG under current fuel mix vs quantum-optimized alternative blend
            trajectory_timeline.append({
                "year": y,
                "regulatory_target_ghg": round(t_ghg, 2),
                "business_as_usual_ghg": round(attained_ghg, 2),
                "quantum_bio_transition_ghg": round(max(15.0, attained_ghg * (1.0 - (y - 2025) * 0.032)), 2)
            })

        return {
            "year": year,
            "baseline_ghg_intensity": self.FUELEU_BASELINE_GHG,
            "target_ghg_intensity": round(target_ghg, 2),
            "attained_ghg_intensity": round(attained_ghg, 2),
            "intensity_delta_pct": round(((attained_ghg - target_ghg) / target_ghg) * 100.0, 2),
            "total_energy_consumed_gj": round(total_energy_mj / 1000.0, 2),
            "compliance_balance_tco2e": round(compliance_balance_tco2e, 2),
            "is_compliant": is_compliant,
            "deficit_vlsfo_equivalent_tons": round(vlsfo_equivalent_tons, 2),
            "penalty_eur": round(penalty_eur, 2),
            "penalty_factor": penalty_factor,
            "trajectory_timeline": trajectory_timeline
        }

    def calculate_eu_ets_maritime(
        self,
        total_co2_emissions_mt: float,
        year: int = 2026,
        eua_price_eur_per_ton: float = 85.0,
        intra_eu_share: float = 0.60,
        extra_eu_share: float = 0.40
    ) -> Dict[str, Any]:
        """
        Calculates EU ETS maritime allowance surrender obligation and EUA exposure cost.
        - Intra-EU voyages + at EU berth: 100% scope
        - Extra-EU incoming / outgoing: 50% scope
        - Phase-in: 2024 (40%), 2025 (70%), 2026+ (100%)
        """
        surrender_phase_in = self.EU_ETS_SURRENDER_RATES.get(year, 1.00 if year >= 2026 else 0.40)
        
        # Scope-adjusted emissions
        # intra: 100% * intra_share
        # extra: 50% * extra_share
        effective_scope_fraction = (1.00 * intra_eu_share) + (0.50 * extra_eu_share)
        reportable_emissions_mt = total_co2_emissions_mt * effective_scope_fraction
        surrender_obligation_mt = reportable_emissions_mt * surrender_phase_in
        
        eua_total_cost_eur = surrender_obligation_mt * eua_price_eur_per_ton
        
        # Potential quantum optimization savings (assuming 12.8% voyage emission reduction)
        optimized_co2_mt = total_co2_emissions_mt * (1.0 - 0.128)
        optimized_surrender_mt = (optimized_co2_mt * effective_scope_fraction) * surrender_phase_in
        optimized_cost_eur = optimized_surrender_mt * eua_price_eur_per_ton
        annual_savings_eur = eua_total_cost_eur - optimized_cost_eur

        return {
            "year": year,
            "eua_price_eur_per_ton": eua_price_eur_per_ton,
            "surrender_phase_in_pct": round(surrender_phase_in * 100.0, 1),
            "gross_emissions_mt": round(total_co2_emissions_mt, 2),
            "reportable_emissions_mt": round(reportable_emissions_mt, 2),
            "surrender_obligation_allowances": round(surrender_obligation_mt, 1),
            "total_eua_liability_eur": round(eua_total_cost_eur, 2),
            "quantum_optimized_liability_eur": round(optimized_cost_eur, 2),
            "potential_annual_savings_eur": round(annual_savings_eur, 2)
        }

    def evaluate_fleet_compliance_scenario(
        self,
        vessel_type: str = "container",
        deadweight_tons: float = 120000.0,
        distance_nm: float = 8500.0,
        fuel_consumption_mt: Optional[Dict[str, float]] = None,
        year: int = 2026,
        eua_price_eur: float = 85.0
    ) -> Dict[str, Any]:
        """
        Executes complete multi-regulation compliance assessment for a vessel or voyage.
        """
        if fuel_consumption_mt is None:
            # Default representative container vessel consumption (VLSFO + Biofuel mix)
            fuel_consumption_mt = {"VLSFO": 142.0, "LSMGO": 18.0}
            
        cii_result = self.calculate_imo_cii(
            vessel_type=vessel_type,
            deadweight_tons=deadweight_tons,
            distance_nm=distance_nm,
            fuel_consumption_mt=fuel_consumption_mt,
            year=year
        )
        
        fueleu_result = self.calculate_fueleu_maritime(
            fuel_consumption_mt=fuel_consumption_mt,
            year=year
        )
        
        ets_result = self.calculate_eu_ets_maritime(
            total_co2_emissions_mt=cii_result["total_co2_emissions_mt"],
            year=year,
            eua_price_eur_per_ton=eua_price_eur
        )
        
        total_regulatory_liability_eur = fueleu_result["penalty_eur"] + ets_result["total_eua_liability_eur"]

        return {
            "vessel_summary": {
                "vessel_type": vessel_type,
                "deadweight_tons": deadweight_tons,
                "distance_nm": distance_nm,
                "fuel_consumption_mt": fuel_consumption_mt,
                "year": year
            },
            "imo_cii": cii_result,
            "fueleu_maritime": fueleu_result,
            "eu_ets": ets_result,
            "total_regulatory_cost_eur": round(total_regulatory_liability_eur, 2),
            "quantum_potential_annual_savings_eur": round(ets_result["potential_annual_savings_eur"] + fueleu_result["penalty_eur"] * 0.75, 2)
        }


compliance_calculator = MaritimeComplianceCalculator()
'''

with open('backend/compliance/calculator.py', 'w', encoding='utf-8') as f:
    f.write(calculator_code)
with open('backend/compliance/__init__.py', 'w', encoding='utf-8') as f:
    f.write('from .calculator import MaritimeComplianceCalculator, compliance_calculator\n')

print("Compliance files written successfully!")
