"""
Synthetic Maritime Operational Telemetry Dataset Generator.
Simulates high-frequency vessel sensor data across diverse hydrodynamics,
sea states, biofouling degradation stages, and operational regimes.
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any
from backend.models.physics import physics_engine

def generate_synthetic_telemetry(
    n_samples: int = 5000,
    random_seed: int = 42
) -> pd.DataFrame:
    """
    Generates a rich operational dataset of vessel telemetry.
    Combines Holtrop-Mennen baseline physics with non-linear real-world effects:
    hull biofouling, propeller roughness, shallow water resistance, dynamic sea interactions,
    and sensor noise.
    """
    np.random.seed(random_seed)
    
    # 1. Sample operational parameters
    # Speeds with peaks around eco-steaming (12-14 kts) and design speed (17-19 kts)
    speed_mode = np.random.choice([1, 2, 3], size=n_samples, p=[0.45, 0.40, 0.15])
    speed_knots = np.zeros(n_samples)
    speed_knots[speed_mode == 1] = np.random.normal(13.2, 1.4, size=np.sum(speed_mode == 1))
    speed_knots[speed_mode == 2] = np.random.normal(17.8, 1.2, size=np.sum(speed_mode == 2))
    speed_knots[speed_mode == 3] = np.random.normal(21.5, 1.0, size=np.sum(speed_mode == 3))
    speed_knots = np.clip(speed_knots, 8.0, 24.0)
    
    # Draft & Cargo Load (Ballast vs Laden distribution)
    is_laden = np.random.choice([True, False], size=n_samples, p=[0.68, 0.32])
    cargo_load_percent = np.zeros(n_samples)
    draft_meters = np.zeros(n_samples)
    
    cargo_load_percent[is_laden] = np.random.uniform(70.0, 100.0, size=np.sum(is_laden))
    draft_meters[is_laden] = 13.5 + (cargo_load_percent[is_laden] / 100.0) * 5.5 + np.random.normal(0, 0.3, size=np.sum(is_laden))
    
    cargo_load_percent[~is_laden] = np.random.uniform(10.0, 35.0, size=np.sum(~is_laden))
    draft_meters[~is_laden] = 8.5 + (cargo_load_percent[~is_laden] / 100.0) * 3.0 + np.random.normal(0, 0.2, size=np.sum(~is_laden))
    
    draft_meters = np.clip(draft_meters, 8.0, 22.0)
    
    # Dynamic trim (m) - typically slight stern trim (0.0 to 1.2m)
    trim_meters = np.random.normal(0.45, 0.55, size=n_samples)
    trim_meters = np.clip(trim_meters, -1.5, 2.5)
    
    # Weather & Sea State (Correlated wave height and wind speed)
    wind_speed_knots = np.random.exponential(14.0, size=n_samples)
    wind_speed_knots = np.clip(wind_speed_knots, 0.0, 48.0)
    
    # Significant wave height H_s (m) roughly H_s ≈ 0.02 * V_wind^1.5 + noise
    wave_height_meters = 0.022 * (wind_speed_knots ** 1.45) + np.random.exponential(0.4, size=n_samples)
    wave_height_meters = np.clip(wave_height_meters, 0.1, 8.5)
    
    # Relative wind direction (0° = pure head wind, 90° = beam, 180° = following)
    wind_angle_deg = np.random.uniform(0.0, 180.0, size=n_samples)
    
    # Biofouling degradation (Days since drydock 0 - 730 days)
    days_since_drydock = np.random.uniform(0.0, 730.0, size=n_samples)
    
    # Sea water temperature (°C)
    water_temp_c = np.random.normal(18.5, 5.0, size=n_samples)
    water_temp_c = np.clip(water_temp_c, 4.0, 32.0)
    
    # Water depth (m)
    water_depth_m = np.random.exponential(120.0, size=n_samples) + 25.0
    water_depth_m = np.clip(water_depth_m, 18.0, 500.0)
    
    # 2. Compute physics baseline for each record
    physics_power_kw = np.zeros(n_samples)
    physics_fuel_rate_mt = np.zeros(n_samples)
    r_total_kn = np.zeros(n_samples)
    r_fric_kn = np.zeros(n_samples)
    r_wave_kn = np.zeros(n_samples)
    
    for i in range(n_samples):
        res = physics_engine.calculate_hydrodynamics(
            speed_knots=speed_knots[i],
            draft_meters=draft_meters[i],
            trim_meters=trim_meters[i],
            cargo_load_percent=cargo_load_percent[i],
            wave_height_meters=wave_height_meters[i],
            wind_speed_knots=wind_speed_knots[i],
            wind_angle_deg=wind_angle_deg[i],
            days_since_drydock=days_since_drydock[i]
        )
        physics_power_kw[i] = res["brake_power_kw"]
        physics_fuel_rate_mt[i] = res["fuel_rate_mt_per_day"]
        r_total_kn[i] = res["resistance_total_kn"]
        r_fric_kn[i] = res["resistance_frictional_kn"]
        r_wave_kn[i] = res["resistance_wave_kn"]
        
    # 3. Simulate real telemetry non-linear residual Δ_ML
    # A. Biofouling penalty (increases frictional drag by 3% - 16% over 2 years)
    fouling_factor = 0.015 + 0.00014 * days_since_drydock + 0.00000018 * (days_since_drydock ** 2)
    delta_fouling = physics_power_kw * fouling_factor
    
    # B. Shallow water squatting effect (Schlichting formula scaling)
    depth_to_draft = water_depth_m / draft_meters
    shallow_mask = depth_to_draft < 3.5
    delta_shallow = np.zeros(n_samples)
    delta_shallow[shallow_mask] = physics_power_kw[shallow_mask] * (0.15 / (depth_to_draft[shallow_mask] ** 2))
    
    # C. Non-linear wave-hull interaction in high sea states (Beaufort > 5)
    delta_weather = (wave_height_meters ** 1.8) * (1.0 + 0.8 * np.cos(np.radians(wind_angle_deg))) * (speed_knots ** 1.3) * 12.0
    
    # D. Dynamic trim penalty non-linearity
    delta_trim = physics_power_kw * 0.018 * ((trim_meters - 0.35) ** 2)
    
    # E. Measurement and sensor telemetry noise (1.2% Gaussian)
    telemetry_noise = np.random.normal(0, 0.012 * physics_power_kw, size=n_samples)
    
    # True actual power delivered (kW)
    actual_power_kw = physics_power_kw + delta_fouling + delta_shallow + delta_weather + delta_trim + telemetry_noise
    actual_power_kw = np.maximum(500.0, actual_power_kw)
    
    # True residual to be learned by ML
    residual_power_kw = actual_power_kw - physics_power_kw
    
    # Actual fuel rate with engine aging drift
    engine_sfoc_drift = 1.0 + 0.000035 * days_since_drydock
    actual_fuel_rate_mt = physics_fuel_rate_mt * (actual_power_kw / np.maximum(100.0, physics_power_kw)) * engine_sfoc_drift
    
    df = pd.DataFrame({
        "speed_knots": speed_knots,
        "draft_meters": draft_meters,
        "trim_meters": trim_meters,
        "cargo_load_percent": cargo_load_percent,
        "wave_height_meters": wave_height_meters,
        "wind_speed_knots": wind_speed_knots,
        "wind_angle_deg": wind_angle_deg,
        "days_since_drydock": days_since_drydock,
        "water_temp_c": water_temp_c,
        "water_depth_m": water_depth_m,
        "physics_power_kw": physics_power_kw,
        "physics_fuel_rate_mt": physics_fuel_rate_mt,
        "actual_power_kw": actual_power_kw,
        "actual_fuel_rate_mt": actual_fuel_rate_mt,
        "residual_power_kw": residual_power_kw,
        "r_total_kn": r_total_kn,
        "r_fric_kn": r_fric_kn,
        "r_wave_kn": r_wave_kn,
    })
    
    return df
