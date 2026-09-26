"""
Well-to-Wake (WTW) Lifecycle Fuel Emissions Engine.
Compliant with IMO DCS and FuelEU Maritime (Regulation EU 2023/1805) Annex I.
Provides Well-to-Tank (WTT) upstream and Tank-to-Wake (TTW) combustion emissions factors.
"""

from typing import Dict, Any

# FuelEU Maritime reference baseline: 91.16 g CO2eq / MJ
FUELEU_BASELINE_GHG_INTENSITY = 91.16

# Comprehensive Lifecycle Fuel Database
# LCV in MJ/g (MJ/kg / 1000 = MJ/g, or MJ/kg)
FUEL_DATABASE: Dict[str, Dict[str, Any]] = {
    "VLSFO": {
        "name": "Very Low Sulphur Fuel Oil (0.5% S)",
        "category": "Fossil Heavy Fuel",
        "lcv_mj_per_kg": 41.0,         # Lower Calorific Value [MJ/kg]
        "cf_ttw_co2": 3.114,           # Tank-to-Wake CO2 factor [g CO2 / g fuel]
        "ttw_ghg_g_per_mj": 75.95,     # TTW GHG intensity [g CO2e / MJ]
        "wtt_ghg_g_per_mj": 13.50,     # WTT Upstream GHG intensity [g CO2e / MJ]
        "wtw_ghg_g_per_mj": 89.45,     # Total Well-to-Wake GHG intensity [g CO2e / MJ]
        "price_usd_per_mt": 620.0,     # Typical bunker benchmark price [USD/MT]
        "fueleu_compliant_2025": True, # Target 89.34 (borderline / benchmark)
        "bio_fraction": 0.0,
        "color_hex": "#64748B"
    },
    "MGO": {
        "name": "Marine Gas Oil (0.1% S DMA)",
        "category": "Fossil Distillate",
        "lcv_mj_per_kg": 42.7,
        "cf_ttw_co2": 3.206,
        "ttw_ghg_g_per_mj": 75.08,
        "wtt_ghg_g_per_mj": 14.40,
        "wtw_ghg_g_per_mj": 89.48,
        "price_usd_per_mt": 780.0,
        "fueleu_compliant_2025": True,
        "bio_fraction": 0.0,
        "color_hex": "#0284C7"
    },
    "LNG": {
        "name": "Liquefied Natural Gas (Otto Dual-Fuel)",
        "category": "Fossil Gas / Cryogenic",
        "lcv_mj_per_kg": 49.1,
        "cf_ttw_co2": 2.750,
        "ttw_ghg_g_per_mj": 68.00,     # Including methane slip (3.1% slip Otto 4-stroke / 0.2% 2-stroke)
        "wtt_ghg_g_per_mj": 18.50,
        "wtw_ghg_g_per_mj": 86.50,
        "price_usd_per_mt": 650.0,
        "fueleu_compliant_2025": True,
        "bio_fraction": 0.0,
        "color_hex": "#0D9488"
    },
    "Bio-MGO B30": {
        "name": "Bio-MGO B30 (30% HVO Hydrotreated Vegetable Oil)",
        "category": "Advanced Biofuel Blend",
        "lcv_mj_per_kg": 41.8,
        "cf_ttw_co2": 2.244,           # Fossil equivalent accounted combustion
        "ttw_ghg_g_per_mj": 52.60,     # 70% fossil MGO + 30% biogenic net-zero
        "wtt_ghg_g_per_mj": 9.50,      # RED II certified waste-feedstock supply chain
        "wtw_ghg_g_per_mj": 62.10,     # -31.7% vs FuelEU baseline
        "price_usd_per_mt": 960.0,
        "fueleu_compliant_2025": True,
        "bio_fraction": 0.30,
        "color_hex": "#10B981"
    },
    "e-Methanol": {
        "name": "e-Methanol (PtX Green Carbon Recycled)",
        "category": "Synthetic Renewable",
        "lcv_mj_per_kg": 19.9,
        "cf_ttw_co2": 1.375,           # Biogenic / captured CO2 (net neutral)
        "ttw_ghg_g_per_mj": 0.00,      # Net zero combustion accounting
        "wtt_ghg_g_per_mj": 12.00,     # Renewable wind/solar electrolysis & direct air capture
        "wtw_ghg_g_per_mj": 12.00,     # -86.8% vs FuelEU baseline
        "price_usd_per_mt": 1150.0,
        "fueleu_compliant_2025": True,
        "bio_fraction": 1.00,
        "color_hex": "#8B5CF6"
    },
    "Green Ammonia": {
        "name": "Green Ammonia (NH3 Renewable Hydrogen)",
        "category": "Zero-Carbon Fuel",
        "lcv_mj_per_kg": 18.6,
        "cf_ttw_co2": 0.000,           # Zero carbon molecule
        "ttw_ghg_g_per_mj": 2.00,      # Minor N2O formation & pilot fuel allowance
        "wtt_ghg_g_per_mj": 8.50,      # Green Haber-Bosch process with renewable power
        "wtw_ghg_g_per_mj": 10.50,     # -88.5% vs FuelEU baseline
        "price_usd_per_mt": 890.0,
        "fueleu_compliant_2025": True,
        "bio_fraction": 1.00,
        "color_hex": "#06B6D4"
    },
    "Liquid Hydrogen": {
        "name": "Liquid Green Hydrogen (LH2 Cryogenic)",
        "category": "Zero-Carbon Cryogenic",
        "lcv_mj_per_kg": 120.0,        # High energy density per mass [MJ/kg]
        "cf_ttw_co2": 0.000,           # Zero carbon molecule
        "ttw_ghg_g_per_mj": 0.00,      # Zero stack emissions (PEM fuel cell)
        "wtt_ghg_g_per_mj": 5.00,      # Renewable water electrolysis & liquefaction
        "wtw_ghg_g_per_mj": 5.00,      # -94.4% vs FuelEU baseline
        "price_usd_per_mt": 3800.0,    # Cryogenic green LH2 benchmark [USD/MT]
        "fueleu_compliant_2025": True,
        "bio_fraction": 1.00,
        "color_hex": "#38BDF8"
    },
    "Shore Power (OPS)": {
        "name": "Onshore Power Supply (OPS / Cold Ironing)",
        "category": "Zero-Emission Port Power",
        "lcv_mj_per_kg": 3.6,          # 1 kWh = 3.6 MJ equivalent
        "cf_ttw_co2": 0.000,           # Zero port auxiliary engine combustion
        "ttw_ghg_g_per_mj": 0.00,      # Zero local emissions at berth
        "wtt_ghg_g_per_mj": 8.00,      # European clean grid average
        "wtw_ghg_g_per_mj": 8.00,      # -91.2% vs FuelEU baseline
        "price_usd_per_mt": 420.0,     # Equivalent green electricity tariff [USD/MWh eq]
        "fueleu_compliant_2025": True,
        "bio_fraction": 1.00,
        "color_hex": "#14B8A6"
    }
}

class FuelLifecycleCalculator:
    def __init__(self, database: Dict[str, Dict[str, Any]] = None):
        self.db = database or FUEL_DATABASE

    def get_fuel_info(self, fuel_type: str) -> Dict[str, Any]:
        return self.db.get(fuel_type, self.db["VLSFO"])

    def calculate_emissions(
        self,
        fuel_type: str,
        fuel_rate_mt_per_day: float,
        energy_req_mj_per_day: float = None,
        reference_vlsfo_mt_per_day: float = None
    ) -> Dict[str, Any]:
        """
        Calculates Tank-to-Wake (TTW), Well-to-Tank (WTT), and Well-to-Wake (WTW)
        emissions compliant with FuelEU Maritime Regulation EU 2023/1805.
        """
        fuel = self.get_fuel_info(fuel_type)
        vlsfo = self.get_fuel_info("VLSFO")
        
        # Energy equivalence: if switching fuel type, scale mass by lower calorific value (LCV)
        # 1 MT VLSFO = 41,000 MJ
        lcv = fuel["lcv_mj_per_kg"]
        
        # Total daily energy consumed in MegaJoules (MJ)
        # fuel_rate_mt_per_day * 1000 kg/MT * lcv MJ/kg
        daily_mass_kg = fuel_rate_mt_per_day * 1000.0
        total_energy_mj = daily_mass_kg * lcv
        
        # 1. Tank-to-Wake (TTW) Direct Combustion CO2
        # For carbon-neutral / biogenic fuels, TTW net fossil CO2 uses ttw_ghg_g_per_mj
        ttw_co2_mt_per_day = (total_energy_mj * fuel["ttw_ghg_g_per_mj"]) / 1e6
        # Chemical combustion CO2 (gross stack release before biogenic credits)
        gross_combustion_co2_mt_per_day = fuel_rate_mt_per_day * fuel["cf_ttw_co2"]
        
        # 2. Well-to-Tank (WTT) Upstream Supply Chain GHG
        wtt_ghg_mt_per_day = (total_energy_mj * fuel["wtt_ghg_g_per_mj"]) / 1e6
        
        # 3. Total Well-to-Wake (WTW) Lifecycle GHG
        wtw_ghg_mt_per_day = (total_energy_mj * fuel["wtw_ghg_g_per_mj"]) / 1e6
        
        # Baseline Comparison (vs standard VLSFO equivalent energy)
        baseline_vlsfo_energy_mj = total_energy_mj
        baseline_wtw_ghg_mt = (baseline_vlsfo_energy_mj * vlsfo["wtw_ghg_g_per_mj"]) / 1e6
        ghg_reduction_percent = ((baseline_wtw_ghg_mt - wtw_ghg_mt_per_day) / max(0.001, baseline_wtw_ghg_mt)) * 100.0
        
        # FuelEU Maritime Compliance Index
        ghg_intensity = fuel["wtw_ghg_g_per_mj"]
        fueleu_deficit_or_surplus = FUELEU_BASELINE_GHG_INTENSITY - ghg_intensity # Positive is surplus (cleaner)
        
        # Fuel Cost
        daily_fuel_cost_usd = fuel_rate_mt_per_day * fuel["price_usd_per_mt"]
        
        return {
            "fuel_type": fuel_type,
            "fuel_name": fuel["name"],
            "category": fuel["category"],
            "lcv_mj_per_kg": lcv,
            "fuel_rate_mt_per_day": round(fuel_rate_mt_per_day, 2),
            "total_energy_mj_per_day": round(total_energy_mj, 1),
            "ttw_co2_mt_per_day": round(ttw_co2_mt_per_day, 2),
            "gross_combustion_co2_mt_per_day": round(gross_combustion_co2_mt_per_day, 2),
            "wtt_upstream_ghg_mt_per_day": round(wtt_ghg_mt_per_day, 2),
            "wtw_lifecycle_ghg_mt_per_day": round(wtw_ghg_mt_per_day, 2),
            "ghg_intensity_g_per_mj": round(ghg_intensity, 2),
            "fueleu_baseline_g_per_mj": FUELEU_BASELINE_GHG_INTENSITY,
            "ghg_reduction_percent": round(ghg_reduction_percent, 1),
            "fueleu_compliant": ghg_intensity <= FUELEU_BASELINE_GHG_INTENSITY,
            "daily_fuel_cost_usd": round(daily_fuel_cost_usd, 2),
            "color_hex": fuel["color_hex"]
        }

lifecycle_engine = FuelLifecycleCalculator()
