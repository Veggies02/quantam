"""
Holtrop-Mennen Empirical Naval Architecture Physics Model.
Implements resistance components: R_total = R_F*(1+k1) + R_APP + R_W + R_B + R_TR + R_A + R_weather
Computes Effective Power (P_E), Propulsive Efficiency (eta_D), Brake Power (P_B),
and Specific Fuel Oil Consumption (SFOC) curves.
"""

import math
from typing import Dict, Any

# Physical constants
RHO_SEAWATER = 1025.0  # kg/m^3 (seawater density at 15°C)
RHO_AIR = 1.225        # kg/m^3 (air density at 15°C)
NU_SEAWATER = 1.188e-6 # m^2/s (kinematic viscosity of seawater at 15°C)
GRAVITY = 9.80665      # m/s^2

# Default Reference Vessel Characteristics (Post-Panamax Container / Bulk Carrier)
DEFAULT_VESSEL = {
    "length_oa": 366.0,        # Length overall [m]
    "length_wl": 350.0,        # Length on waterline [m]
    "length_bp": 340.0,        # Length between perpendiculars [m]
    "beam": 51.2,              # Moulded breadth [m]
    "draft_design": 15.0,      # Design draft [m]
    "c_b": 0.65,               # Block coefficient
    "c_m": 0.98,               # Midship section coefficient
    "c_wp": 0.78,              # Waterplane area coefficient
    "lcb_percent": -1.2,       # Longitudinal center of buoyancy (% L_BP forward of midships)
    "transom_area": 18.0,      # Transom area A_T [m^2]
    "bulb_area": 24.0,         # Bulbous bow transversal area A_BT [m^2]
    "bulb_center_height": 5.2, # Center of bulb area above keel h_B [m]
    "app_wetted_area": 95.0,   # Appendage wetted area S_APP [m^2]
    "frontal_wind_area": 980.0,# Transverse projected windage area A_V [m^2]
    "mcr_power_kw": 62000.0,   # Maximum Continuous Rating engine power [kW]
    "sfoc_base": 168.0,        # Base SFOC at optimal load (75-85% MCR) [g/kWh]
}

def knots_to_ms(knots: float) -> float:
    return knots * 0.514444

def ms_to_knots(ms: float) -> float:
    return ms / 0.514444

class HoltropMennenPhysicsModel:
    def __init__(self, vessel_params: Dict[str, Any] = None):
        self.params = vessel_params or DEFAULT_VESSEL

    def calculate_hydrodynamics(
        self,
        speed_knots: float,
        draft_meters: float,
        trim_meters: float = 0.0,
        cargo_load_percent: float = 85.0,
        wave_height_meters: float = 1.2,
        wind_speed_knots: float = 12.0,
        wind_angle_deg: float = 30.0,
        days_since_drydock: float = 120.0
    ) -> Dict[str, Any]:
        """
        Calculates all Holtrop-Mennen resistance components, effective power,
        propulsive efficiencies, shaft power, and fuel rate.
        """
        V = knots_to_ms(max(0.5, speed_knots))
        L = self.params["length_wl"]
        L_bp = self.params["length_bp"]
        B = self.params["beam"]
        T = max(5.0, draft_meters)
        T_design = self.params["draft_design"]
        
        # Adjust block coefficient & displacement based on draft & cargo load
        c_b = min(0.85, max(0.55, self.params["c_b"] * (0.92 + 0.08 * (cargo_load_percent / 100.0))))
        c_m = self.params["c_m"]
        c_p = c_b / c_m
        c_wp = self.params["c_wp"]
        
        # Displacement volume (nabla) in m^3 and displacement mass in MT
        nabla = c_b * L_bp * B * T
        displacement_mt = nabla * (RHO_SEAWATER / 1000.0)
        
        # Wetted Surface Area (S) Holtrop formulation
        a_bt = self.params["bulb_area"]
        s_term = 0.453 + 0.4425 * c_b - 0.2862 * c_m - 0.00346 * (B / T) + 0.3696 * c_wp
        wetted_surface = L * (2.0 * T + B) * math.sqrt(c_m) * s_term + 2.38 * (a_bt / max(0.5, c_b))
        
        # Reynolds number & ITTC-1957 friction coefficient
        Rn = (V * L) / NU_SEAWATER
        log_rn = math.log10(max(1e5, Rn))
        c_f = 0.075 / ((log_rn - 2.0) ** 2)
        
        # 1. Frictional Resistance R_F
        r_f = 0.5 * RHO_SEAWATER * (V ** 2) * wetted_surface * c_f  # Newtons
        
        # Form Factor (1 + k1) Holtrop (1984)
        lcb = self.params["lcb_percent"]
        l_r = L * (1.0 - c_p + 0.06 * c_p * lcb / (4.0 * c_p - 1.0)) if (4.0 * c_p - 1.0) != 0 else L * 0.35
        l_r = max(0.1 * L, min(0.6 * L, l_r))
        c14 = 1.0
        
        term_b_l = (B / L) ** 1.06806
        term_t_l = (T / L) ** 0.46106
        term_l_lr = (L / l_r) ** 0.121563
        term_vol = ((L ** 3) / nabla) ** 0.36486
        term_cp = (1.0 - c_p) ** (-0.604247)
        
        form_factor_1pk1 = 0.93 + 0.487118 * c14 * term_b_l * term_t_l * term_l_lr * term_vol * term_cp
        form_factor_1pk1 = max(1.05, min(1.35, form_factor_1pk1))
        
        # 2. Appendage Resistance R_APP
        s_app = self.params["app_wetted_area"]
        k2_eq = 1.5
        r_app = 0.5 * RHO_SEAWATER * (V ** 2) * s_app * k2_eq * c_f
        
        # 3. Wave Making Resistance R_W
        Fn = V / math.sqrt(GRAVITY * L)
        c1_coeff = (c_b ** 3.78613) * ((T / B) ** 1.07961) * ((75.0) ** (-1.37565))
        c1 = 2223105.0 * c1_coeff
        c2 = 1.0
        c5 = 1.0 - 0.8 * (self.params["transom_area"] / (B * T * c_m))
        d_val = -0.9
        m1 = 0.0140407 * (L / T) - 1.75254 * (nabla ** (1/3) / L) - 4.79323 * (B / L) - 0.01
        m4 = 0.4 * c1 * math.exp(-0.034 * (Fn ** (-3.29)))
        m4 = min(50.0, max(-50.0, m4))
        lambda_val = 1.446 * c_p - 0.03 * (L / B)
        
        r_w_exponent = m1 * (Fn ** d_val) + m4 * math.cos(max(0.1, lambda_val * (Fn ** (-2))))
        r_w_exponent = max(-20.0, min(15.0, r_w_exponent))
        r_w = max(0.0, c1 * c2 * c5 * nabla * RHO_SEAWATER * GRAVITY * math.exp(r_w_exponent) * 1e-9)
        # Empirical wave resistance stabilization
        r_w_empirical = 0.5 * RHO_SEAWATER * (V ** 2) * (B * T) * (0.0012 + 0.0065 * (Fn ** 3.8) + 0.012 * (Fn ** 5.2))
        r_w = 0.4 * r_w + 0.6 * r_w_empirical
        
        # 4. Bulbous Bow Resistance R_B
        h_b = self.params["bulb_center_height"]
        f_ni = V / math.sqrt(GRAVITY * (T - h_b + 0.001))
        p_b = 0.56 * math.sqrt(a_bt) / (T - 1.5 * h_b + 0.001)
        r_b = 0.11 * math.exp(-3.0 * (p_b ** -2)) * (f_ni ** 3) * (a_bt ** 1.5) * RHO_SEAWATER * GRAVITY / (1.0 + f_ni ** 2)
        r_b = max(0.0, r_b)
        
        # 5. Transom Stern Resistance R_TR
        f_nt = V / math.sqrt(2.0 * GRAVITY * (self.params["transom_area"] / (B + B * c_wp)))
        c6 = 0.2 * (1.0 - 0.22 * f_nt) if f_nt < 5.0 else 0.0
        r_tr = 0.5 * RHO_SEAWATER * (V ** 2) * self.params["transom_area"] * max(0.0, c6)
        
        # 6. Model-Ship Correlation Allowance R_A
        c_a = 0.0015 + 0.0011 * math.sqrt(L) - 0.00005 * L
        c_a = max(0.0002, min(0.0008, c_a))
        r_a = 0.5 * RHO_SEAWATER * (V ** 2) * wetted_surface * c_a
        
        # 7. Calm-Water Total Resistance R_calm
        r_calm = r_f * form_factor_1pk1 + r_app + r_w + r_b + r_tr + r_a
        
        # 8. Environmental Weather Resistance R_weather
        h_s = max(0.0, wave_height_meters)
        wave_param = (h_s / 2.0) ** 2
        r_waves = 0.5 * RHO_SEAWATER * GRAVITY * wave_param * B * math.sqrt(B / max(1.0, L)) * (1.0 + 0.8 * Fn) * 1.8
        
        # Aerodynamic Wind Resistance
        v_wind_ms = knots_to_ms(max(0.0, wind_speed_knots))
        wind_angle_rad = math.radians(wind_angle_deg)
        v_rel_x = V + v_wind_ms * math.cos(wind_angle_rad)
        v_rel_y = v_wind_ms * math.sin(wind_angle_rad)
        v_rel = math.sqrt(v_rel_x ** 2 + v_rel_y ** 2)
        c_aa = 0.75 * math.cos(wind_angle_rad) + 0.25 * math.sin(wind_angle_rad)
        a_v = self.params["frontal_wind_area"]
        r_wind = max(0.0, 0.5 * RHO_AIR * (v_rel ** 2) * a_v * c_aa)
        
        # 9. Dynamic Trim Resistance Penalty
        trim_deviation = abs(trim_meters - 0.4)
        r_trim_penalty = r_calm * (0.015 * (trim_deviation ** 1.6))
        
        # Total Resistance R_total
        r_total_n = r_calm + r_waves + r_wind + r_trim_penalty
        r_total_kn = r_total_n / 1000.0
        
        # Effective Power P_E [kW]
        p_e_kw = (r_total_n * V) / 1000.0
        
        # Propulsive Efficiency Components
        w = 0.11 + 0.16 * c_b
        t = 0.10 + 0.14 * c_b
        eta_h = (1.0 - t) / (1.0 - w)
        eta_o = max(0.55, min(0.72, 0.68 - 0.08 * (Fn - 0.18)))
        eta_r = 1.01
        eta_d = eta_h * eta_o * eta_r
        eta_s = 0.985
        
        # Shaft & Brake Power P_B [kW]
        p_d_kw = p_e_kw / max(0.4, eta_d)
        p_b_kw = p_d_kw / eta_s
        
        # Specific Fuel Oil Consumption (SFOC)
        mcr = self.params["mcr_power_kw"]
        engine_load = min(1.15, max(0.15, p_b_kw / mcr))
        sfoc_base = self.params["sfoc_base"]
        sfoc_factor = 1.0 + 1.25 * ((engine_load - 0.78) ** 2)
        sfoc = sfoc_base * sfoc_factor  # g/kWh
        
        fuel_rate_kg_per_h = (p_b_kw * sfoc) / 1000.0
        fuel_rate_mt_per_day = (fuel_rate_kg_per_h * 24.0) / 1000.0
        
        return {
            "speed_knots": speed_knots,
            "speed_ms": V,
            "froude_number": round(Fn, 4),
            "reynolds_number": round(Rn, 1),
            "displacement_mt": round(displacement_mt, 1),
            "wetted_surface_m2": round(wetted_surface, 1),
            "resistance_frictional_kn": round((r_f * form_factor_1pk1) / 1000.0, 2),
            "resistance_wave_kn": round(r_w / 1000.0, 2),
            "resistance_app_kn": round(r_app / 1000.0, 2),
            "resistance_bulb_kn": round(r_b / 1000.0, 2),
            "resistance_transom_kn": round(r_tr / 1000.0, 2),
            "resistance_correlation_kn": round(r_a / 1000.0, 2),
            "resistance_waves_kn": round(r_waves / 1000.0, 2),
            "resistance_wind_kn": round(r_wind / 1000.0, 2),
            "resistance_trim_kn": round(r_trim_penalty / 1000.0, 2),
            "resistance_total_kn": round(r_total_kn, 2),
            "form_factor": round(form_factor_1pk1, 3),
            "effective_power_kw": round(p_e_kw, 1),
            "propulsive_efficiency": round(eta_d, 3),
            "hull_efficiency": round(eta_h, 3),
            "propeller_efficiency": round(eta_o, 3),
            "shaft_power_kw": round(p_d_kw, 1),
            "brake_power_kw": round(p_b_kw, 1),
            "engine_load_percent": round(engine_load * 100.0, 1),
            "sfoc_g_per_kwh": round(sfoc, 2),
            "fuel_rate_kg_per_h": round(fuel_rate_kg_per_h, 2),
            "fuel_rate_mt_per_day": round(fuel_rate_mt_per_day, 2),
        }

physics_engine = HoltropMennenPhysicsModel()
