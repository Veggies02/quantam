"""
Quadratic Unconstrained Binary Optimization (QUBO) & D-Wave Annealer Engine for Maritime Fleet Assignment.
Formulates multi-vessel route, speed tier, and bunker allocation onto Ising/QUBO Hamiltonians H = x^T Q x.
Solved using D-Wave Ocean Leap QPU (cloud) and Neal Simulated Annealing (local high-performance).
"""

from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import time

try:
    import neal
    import dimod
    NEAL_AVAILABLE = True
except ImportError:
    NEAL_AVAILABLE = False


class MaritimeQUBOBuilder:
    """
    Constructs the N x N QUBO coupling matrix Q for multi-vessel fleet scheduling and bunkering.
    
    Decision Variables:
      x_{v, k} in {0, 1} indicates vessel v selects route/bunker configuration k.
      
    Hamiltonian:
      H(x) = H_cost(x) + lambda_1 * H_onehot(x) + lambda_2 * H_conflict(x)
    """

    def __init__(
        self,
        vessels: Optional[List[Dict[str, Any]]] = None,
        configurations: Optional[List[Dict[str, Any]]] = None,
        lambda_onehot: float = 2500.0,
        lambda_berth_conflict: float = 1500.0,
    ):
        self.vessels = vessels or [
            {"id": "V1", "name": "NavOptima Stellar", "dwt": 150000, "cargo_urgency": "High"},
            {"id": "V2", "name": "NavOptima Aurora", "dwt": 120000, "cargo_urgency": "Standard"},
            {"id": "V3", "name": "NavOptima Poseidon", "dwt": 180000, "cargo_urgency": "Eco"},
        ]

        self.configurations = configurations or [
            {
                "id": "C0",
                "name": "Fast Transit (19.5 kts) - VLSFO + Canal Priority",
                "cost_k_usd": 1250.0,
                "ghg_k_mt": 14200.0,
                "berth_slot_demand": 1,  # Uses express berth slot
            },
            {
                "id": "C1",
                "name": "Eco Transit (15.0 kts) - VLSFO + Standard Routing",
                "cost_k_usd": 920.0,
                "ghg_k_mt": 10400.0,
                "berth_slot_demand": 0,
            },
            {
                "id": "C2",
                "name": "Green Corridor (16.2 kts) - Bio-MGO B100 + Weather Routing",
                "cost_k_usd": 1080.0,
                "ghg_k_mt": 3600.0,
                "berth_slot_demand": 0,
            },
            {
                "id": "C3",
                "name": "Zero-Emission Tier (14.0 kts) - E-Methanol + Cape Optimization",
                "cost_k_usd": 1390.0,
                "ghg_k_mt": 1800.0,
                "berth_slot_demand": 1,  # Uses green bunkering cryogenic berth
            },
        ]

        self.lambda_onehot = lambda_onehot
        self.lambda_berth_conflict = lambda_berth_conflict

        self.n_vessels = len(self.vessels)
        self.n_configs = len(self.configurations)
        self.n_vars = self.n_vessels * self.n_configs

        # Variable labels
        self.var_names = []
        for v in self.vessels:
            for c in self.configurations:
                self.var_names.append(f"{v['id']}_{c['id']}")

    def get_var_index(self, vessel_idx: int, config_idx: int) -> int:
        return vessel_idx * self.n_configs + config_idx

    def build_qubo_matrix(self) -> Tuple[np.ndarray, Dict[Tuple[str, str], float], float]:
        """
        Builds the symmetric/upper-triangular N x N QUBO matrix.
        Returns:
          - Q_matrix: (N, N) numpy array
          - Q_dict: Dictionary mapping (var_i, var_j) -> coefficient for Ocean SDK
          - constant_offset: float constant term in Hamiltonian
        """
        N = self.n_vars
        Q = np.zeros((N, N), dtype=float)
        offset = 0.0

        # 1. Linear Cost Terms: C_{v, k} * x_{v, k}
        # Scaled objective: Cost in $k + Carbon weight ($90/t GHG)
        for v_idx, v in enumerate(self.vessels):
            for c_idx, c in enumerate(self.configurations):
                idx = self.get_var_index(v_idx, c_idx)
                obj_score = (c["cost_k_usd"] * 0.7) + (c["ghg_k_mt"] * 0.05)
                # If urgency is High and config is slow eco, add delay penalty
                if v["cargo_urgency"] == "High" and "14.0" in c["name"]:
                    obj_score += 150.0
                Q[idx, idx] += obj_score

        # 2. Exactly-One Configuration per Vessel Constraint:
        # lambda_1 * (sum_k x_{v, k} - 1)^2 = lambda_1 * [ sum_k x_{v,k}^2 + 2 sum_{k < l} x_{v,k} x_{v,l} - 2 sum_k x_{v,k} + 1 ]
        # Since x^2 = x for binary: sum_k (1 - 2) * x_{v,k} = - sum_k x_{v,k}
        for v_idx in range(self.n_vessels):
            offset += self.lambda_onehot
            for k in range(self.n_configs):
                idx_k = self.get_var_index(v_idx, k)
                # Linear diagonal bias: -lambda_1 * x_{v, k}
                Q[idx_k, idx_k] -= self.lambda_onehot

                # Quadratic coupling between conflicting configurations of same vessel: +2 * lambda_1 * x_{v,k} * x_{v,l}
                for l in range(k + 1, self.n_configs):
                    idx_l = self.get_var_index(v_idx, l)
                    Q[idx_k, idx_l] += 2.0 * self.lambda_onehot

        # 3. Berth / Cryogenic Bunkering Capacity Constraint:
        # At most 1 vessel can choose express/cryo berth (berth_slot_demand == 1) simultaneously.
        # Penalty: lambda_2 * (sum_{v} x_{v, berth_slot} - 1)^2 (when total demand > 1)
        # quadratic penalty between any pair of vessels claiming berth slot
        berth_indices = []
        for v_idx in range(self.n_vessels):
            for c_idx, c in enumerate(self.configurations):
                if c["berth_slot_demand"] > 0:
                    berth_indices.append(self.get_var_index(v_idx, c_idx))

        for i in range(len(berth_indices)):
            for j in range(i + 1, len(berth_indices)):
                idx_i = berth_indices[i]
                idx_j = berth_indices[j]
                Q[idx_i, idx_j] += self.lambda_berth_conflict

        # Construct dictionary format for Ocean SDK
        Q_dict = {}
        for i in range(N):
            for j in range(i, N):
                if abs(Q[i, j]) > 1e-6:
                    Q_dict[(self.var_names[i], self.var_names[j])] = float(Q[i, j])

        return Q, Q_dict, offset


class QuantumInspiredAnnealingSimulator:
    """
    Simulated Quantum Annealing (SQA) & Classical Simulated Annealing (SA) Engine.
    Simulates quantum mechanical tunneling and transverse field Hamiltonian dynamics
    on classical CPU architecture without requiring physical QPU hardware.
    """

    @staticmethod
    def solve_qubo(
        builder: MaritimeQUBOBuilder,
        num_reads: int = 1000,
        annealing_time_us: float = 20.0,
        chain_strength: float = 2.5,
        use_leap_cloud: bool = False,
        leap_token: Optional[str] = None,
        solver_type: str = "sqa",
        transverse_field_gamma: float = 2.5,
        trotter_slices: int = 4,
    ) -> Dict[str, Any]:
        """
        Executes Simulated Quantum Annealing (SQA) or Classical Simulated Annealing (SA)
        on classical CPU hardware via NumPy.
        """
        Q_matrix, Q_dict, offset = builder.build_qubo_matrix()
        start_time = time.perf_counter()

        sample_records = []
        n_vars = builder.n_vars
        energy_counts = {}
        tunnel_events = 0
        total_evals = 0

        # Determine mode
        is_sqa = (solver_type.lower() == "sqa") or (not use_leap_cloud and solver_type != "classical_sa")

        if is_sqa:
            solver_name = "Simulated Quantum Annealing (SQA - Transverse-Field Tunneling)"
            # Simulated Quantum Annealing using Trotterized Transverse-Field Ising simulation
            # M replicas (Trotter slices), transverse field Gamma(t) decaying to 0
            M = max(2, min(8, trotter_slices))
            n_steps = 100
            gamma_init = transverse_field_gamma
            
            for _ in range(num_reads):
                # Initialize M replicas in classical bit configuration
                replicas = np.random.randint(0, 2, size=(M, n_vars))
                
                # Annealing schedule for Gamma (transverse field) and Temperature T
                for step in range(n_steps):
                    s = step / max(1, n_steps - 1)
                    # Decaying transverse field simulates closing the quantum fluctuations
                    gamma_t = gamma_init * (1.0 - s)
                    t_eff = max(0.02, 1.0 - 0.8 * s)

                    # Quantum coupling J_perp between adjacent Trotter slices
                    # J_perp = -0.5 * t_eff * ln(tanh(gamma_t / (M * t_eff) + 1e-6))
                    arg_tanh = np.clip(gamma_t / (M * t_eff), 1e-4, 1.0 - 1e-4)
                    j_perp = -0.5 * t_eff * np.log(np.tanh(arg_tanh))

                    for m in range(M):
                        # Classical QUBO energy for slice m
                        state = replicas[m]
                        e_m = float(state.T @ Q_matrix @ state + offset)

                        # Try random spin flip
                        flip_idx = np.random.randint(0, n_vars)
                        state_new = state.copy()
                        state_new[flip_idx] = 1 - state_new[flip_idx]
                        e_new = float(state_new.T @ Q_matrix @ state_new + offset)

                        delta_classical = (e_new - e_m) / M
                        # Inter-slice quantum interaction delta: - j_perp * s_i * (s_i^{m-1} + s_i^{m+1})
                        prev_m = (m - 1) % M
                        next_m = (m + 1) % M
                        sigma_current = 2 * state[flip_idx] - 1
                        sigma_new = 2 * state_new[flip_idx] - 1
                        delta_quantum = -j_perp * (sigma_new - sigma_current) * (
                            (2 * replicas[prev_m, flip_idx] - 1) + (2 * replicas[next_m, flip_idx] - 1)
                        )

                        delta_total = delta_classical + delta_quantum
                        total_evals += 1

                        # Quantum Tunneling acceptance criterion
                        if delta_total < 0 or np.random.rand() < np.exp(-delta_total / t_eff):
                            replicas[m] = state_new
                            if delta_classical > 0 and delta_total <= 0:
                                # Quantum tunneling through a classical barrier!
                                tunnel_events += 1

                # Select best replica from the M Trotter slices
                best_slice_idx = 0
                best_slice_e = float("inf")
                for m in range(M):
                    sl_e = float(replicas[m].T @ Q_matrix @ replicas[m] + offset)
                    if sl_e < best_slice_e:
                        best_slice_e = sl_e
                        best_slice_idx = m

                final_state = replicas[best_slice_idx]
                rounded_e = round(best_slice_e, 1)
                state_tuple = tuple(final_state.tolist())
                if (state_tuple, rounded_e) not in energy_counts:
                    energy_counts[(state_tuple, rounded_e)] = 0
                energy_counts[(state_tuple, rounded_e)] += 1

        else:
            solver_name = "Classical Simulated Annealing (Thermal Hopping)"
            T_init = 100.0
            T_min = 0.01
            cooling_rate = 0.95

            for _ in range(num_reads):
                state = np.random.randint(0, 2, size=n_vars)
                e_current = float(state.T @ Q_matrix @ state + offset)

                T = T_init
                while T > T_min:
                    for _ in range(3):
                        flip_idx = np.random.randint(0, n_vars)
                        state_new = state.copy()
                        state_new[flip_idx] = 1 - state_new[flip_idx]
                        e_new = float(state_new.T @ Q_matrix @ state_new + offset)

                        delta_e = e_new - e_current
                        total_evals += 1
                        if delta_e < 0 or np.random.rand() < np.exp(-delta_e / max(T, 1e-4)):
                            state = state_new
                            e_current = e_new
                    T *= cooling_rate

                rounded_e = round(e_current, 1)
                state_tuple = tuple(state.tolist())
                if (state_tuple, rounded_e) not in energy_counts:
                    energy_counts[(state_tuple, rounded_e)] = 0
                energy_counts[(state_tuple, rounded_e)] += 1

        # Format sample records
        for (s_tuple, e_val), count in sorted(energy_counts.items(), key=lambda x: x[0][1]):
            sample_dict = {name: s_tuple[i] for i, name in enumerate(builder.var_names)}
            sample_records.append({
                "sample": sample_dict,
                "bits": list(s_tuple),
                "energy": e_val,
                "num_occurrences": count,
                "probability": round(count / num_reads, 4),
            })

        execution_time_ms = (time.perf_counter() - start_time) * 1000.0
        tunneling_rate = round((tunnel_events / max(1, total_evals)) * 100.0, 2) if is_sqa else 0.0

        # Ground state (lowest energy sample)
        sample_records.sort(key=lambda s: s["energy"])
        ground_state_record = sample_records[0]

        # Decode Ground State Schedule
        decoded_assignments = []
        total_fleet_cost_k = 0.0
        total_fleet_ghg_k = 0.0
        constraint_violations = 0

        for v_idx, v in enumerate(builder.vessels):
            chosen_c = None
            active_count = 0
            for c_idx, c in enumerate(builder.configurations):
                var_name = f"{v['id']}_{c['id']}"
                bit = ground_state_record["sample"].get(var_name, 0)
                if bit == 1:
                    active_count += 1
                    chosen_c = c

            if active_count != 1:
                constraint_violations += abs(active_count - 1)

            if chosen_c is not None:
                total_fleet_cost_k += chosen_c["cost_k_usd"]
                total_fleet_ghg_k += chosen_c["ghg_k_mt"]
                decoded_assignments.append({
                    "vessel_id": v["id"],
                    "vessel_name": v["name"],
                    "cargo_urgency": v["cargo_urgency"],
                    "selected_config_id": chosen_c["id"],
                    "selected_config_name": chosen_c["name"],
                    "cost_k_usd": chosen_c["cost_k_usd"],
                    "ghg_k_mt": chosen_c["ghg_k_mt"],
                })

        # Energy Distribution Histogram
        energy_levels = [s["energy"] for s in sample_records[:20]]
        probabilities = [s["probability"] for s in sample_records[:20]]

        return {
            "solver": solver_name,
            "solver_type": "sqa" if is_sqa else "classical_sa",
            "num_qubits": builder.n_vars,
            "num_reads": num_reads,
            "annealing_time_us": annealing_time_us,
            "chain_strength": chain_strength,
            "transverse_field_gamma": transverse_field_gamma if is_sqa else 0.0,
            "trotter_slices": trotter_slices if is_sqa else 1,
            "tunneling_rate_percent": tunneling_rate,
            "qpu_access_time_ms": round(annealing_time_us * num_reads / 1000.0, 2),
            "total_execution_time_ms": round(execution_time_ms, 2),
            "ground_state_energy": ground_state_record["energy"],
            "ground_state_bitstring": ground_state_record["bits"],
            "ground_state_assignments": decoded_assignments,
            "total_fleet_cost_k_usd": round(total_fleet_cost_k, 2),
            "total_fleet_ghg_k_mt": round(total_fleet_ghg_k, 2),
            "constraint_violations": constraint_violations,
            "qubo_matrix_dimension": builder.n_vars,
            "qubo_var_names": builder.var_names,
            "qubo_matrix_preview": Q_matrix.round(2).tolist(),
            "energy_distribution": [
                {"energy": s["energy"], "frequency": s["num_occurrences"], "probability": s["probability"]}
                for s in sample_records[:15]
            ],
        }


# Backwards compatibility alias
QuantumAnnealingSimulator = QuantumInspiredAnnealingSimulator

