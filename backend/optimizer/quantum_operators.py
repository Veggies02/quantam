"""
Quantum-Inspired Multi-Objective Evolutionary Algorithm (Q-NSGA-II).
Implements Qubit Probability Amplitudes, Quantum Rotation Gate Operator in Hilbert Space,
Quantum Phase Crossover, Pauli-X Quantum Mutation, and Fast Non-Dominated Pareto Sorting.
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import math

try:
    from pymoo.core.mutation import Mutation
    from pymoo.core.crossover import Crossover
    from pymoo.core.population import Population
    PYMOO_AVAILABLE = True
except ImportError:
    Mutation = object
    Crossover = object
    Population = None
    PYMOO_AVAILABLE = False

from backend.optimizer.problem import FleetOptimizationProblem


class QubitPopulation:
    """
    Qubit state representation for a population of quantum chromosomes.
    Each chromosome contains m qubits:
      |q_j> = alpha_j |0> + beta_j |1>
      alpha_j = cos(theta_j), beta_j = sin(theta_j)
      |alpha_j|^2 + |beta_j|^2 = 1
    """

    def __init__(self, pop_size: int, n_qubits: int, init_superposition: bool = True):
        self.pop_size = pop_size
        self.n_qubits = n_qubits
        
        if init_superposition:
            # Initialize in equal superposition |+> = 1/sqrt(2)(|0> + |1>) where theta = pi / 4
            self.thetas = np.full((pop_size, n_qubits), np.pi / 4.0, dtype=float)
        else:
            self.thetas = np.random.uniform(0.0, np.pi / 2.0, size=(pop_size, n_qubits))

    @property
    def alphas(self) -> np.ndarray:
        """Probability amplitude for state |0>: cos(theta)."""
        return np.cos(self.thetas)

    @property
    def betas(self) -> np.ndarray:
        """Probability amplitude for state |1>: sin(theta)."""
        return np.sin(self.thetas)

    def measure(self) -> np.ndarray:
        """
        Quantum Measurement (Collapse to Classical Bitstrings).
        Probability of observing bit 1 is |beta_j|^2 = sin^2(theta_j).
        """
        prob_1 = np.square(self.betas)
        random_matrix = np.random.rand(self.pop_size, self.n_qubits)
        binary_strings = (random_matrix < prob_1).astype(int)
        return binary_strings

    def get_entropy(self) -> float:
        """
        Calculates average Von Neumann / Shannon entropy of the qubit population.
        H = - sum(p0 * log2(p0) + p1 * log2(p1)). Max entropy = 1.0 (pure superposition).
        """
        p1 = np.clip(np.square(self.betas), 1e-12, 1.0 - 1e-12)
        p0 = 1.0 - p1
        entropy = -np.mean(p0 * np.log2(p0) + p1 * np.log2(p1))
        return float(entropy)


class QuantumVariableMapper:
    """
    Encodes problem continuous and discrete decision variables into binary qubit strings
    and decodes collapsed bitstrings back into real continuous parameters.
    """

    def __init__(self, n_legs: int, bits_speed: int = 10, bits_fuel: int = 4, bits_route: int = 3):
        self.n_legs = n_legs
        self.bits_speed = bits_speed
        self.bits_fuel = bits_fuel
        self.bits_route = bits_route

        # Total qubits per chromosome
        self.qubits_per_leg = bits_speed + bits_fuel + bits_route
        self.total_qubits = n_legs * self.qubits_per_leg

        # Speed bounds
        self.v_min = 10.0
        self.v_max = 22.0

    def decode_individual(self, bitstring: np.ndarray) -> np.ndarray:
        """
        Decodes a single 1D binary array of length total_qubits into real decision vector x:
        [v_1, ..., v_n, f_1, ..., f_n, r_1, ..., r_n]
        """
        speeds = []
        fuels = []
        routes = []

        ptr = 0
        # Speeds
        for _ in range(self.n_legs):
            bits = bitstring[ptr : ptr + self.bits_speed]
            int_val = int("".join(map(str, bits)), 2)
            max_val = (1 << self.bits_speed) - 1
            v = self.v_min + (int_val / max_val) * (self.v_max - self.v_min)
            speeds.append(v)
            ptr += self.bits_speed

        # Fuels (0 to 4)
        for _ in range(self.n_legs):
            bits = bitstring[ptr : ptr + self.bits_fuel]
            int_val = int("".join(map(str, bits)), 2)
            fuel_idx = int_val % 5
            fuels.append(fuel_idx)
            ptr += self.bits_fuel

        # Routes (0 to 2)
        for _ in range(self.n_legs):
            bits = bitstring[ptr : ptr + self.bits_route]
            int_val = int("".join(map(str, bits)), 2)
            route_idx = int_val % 3
            routes.append(route_idx)
            ptr += self.bits_route

        return np.array(speeds + fuels + routes, dtype=float)

    def encode_individual(self, x: np.ndarray) -> np.ndarray:
        """
        Encodes a real decision vector x into a binary bitstring.
        """
        bitstring = []
        speeds = x[0 : self.n_legs]
        fuels = x[self.n_legs : 2 * self.n_legs]
        routes = x[2 * self.n_legs : 3 * self.n_legs]

        # Encode speeds
        for v in speeds:
            norm = np.clip((v - self.v_min) / (self.v_max - self.v_min), 0.0, 1.0)
            max_val = (1 << self.bits_speed) - 1
            int_val = int(round(norm * max_val))
            bin_str = f"{int_val:0{self.bits_speed}b}"
            bitstring.extend([int(b) for b in bin_str])

        # Encode fuels
        for f in fuels:
            int_val = int(round(f)) % 5
            bin_str = f"{int_val:0{self.bits_fuel}b}"
            bitstring.extend([int(b) for b in bin_str])

        # Encode routes
        for r in routes:
            int_val = int(round(r)) % 3
            bin_str = f"{int_val:0{self.bits_route}b}"
            bitstring.extend([int(b) for b in bin_str])

        return np.array(bitstring, dtype=int)


class QuantumRotationGate:
    """
    Hilbert Space Quantum Rotation Gate Operator U(delta_theta):
    
      [ alpha^{t+1} ] = [ cos(delta_theta)  -sin(delta_theta) ] [ alpha^t ]
      [ beta^{t+1}  ]   [ sin(delta_theta)   cos(delta_theta) ] [ beta^t  ]
      
    which is isomorphic to phase angle update:
      theta^{t+1} = theta^t + delta_theta
      
    where delta_theta = s(alpha, beta, x, b) * theta_step
    driven by Pareto non-dominated reference guide solutions.
    """

    def __init__(self, theta_step_base: float = 0.05 * np.pi):
        self.theta_step_base = theta_step_base

    def get_rotation_delta(
        self,
        alpha: float,
        beta: float,
        x_bit: int,
        b_bit: int,
        theta_step: float,
    ) -> float:
        """
        Determines the rotation angle delta_theta according to standard quantum evolutionary lookup:
          - If x_bit == 0 and b_bit == 1: rotate towards |1> (increase theta)
          - If x_bit == 1 and b_bit == 0: rotate towards |0> (decrease theta)
          - If x_bit == b_bit: delta_theta = 0
        Preserves phase in [0, pi/2] for canonical first-quadrant representations.
        """
        if x_bit == b_bit:
            return 0.0

        prod = alpha * beta
        if x_bit == 0 and b_bit == 1:
            # Need to increase beta (increase theta towards pi/2)
            if prod > 0:
                sign = 1.0
            elif prod < 0:
                sign = -1.0
            elif alpha == 0:
                sign = 0.0
            else:
                sign = 1.0
            return sign * theta_step
        elif x_bit == 1 and b_bit == 0:
            # Need to increase alpha (decrease theta towards 0)
            if prod > 0:
                sign = -1.0
            elif prod < 0:
                sign = 1.0
            elif beta == 0:
                sign = 0.0
            else:
                sign = -1.0
            return sign * theta_step

        return 0.0

    def apply(
        self,
        qubits: QubitPopulation,
        current_bits: np.ndarray,
        guide_bits: np.ndarray,
        progress_ratio: float = 0.0,
    ) -> None:
        """
        Applies the quantum rotation gate to the entire population based on guide bitstrings.
        Features adaptive dynamic step annealing: theta_step decays as convergence deepens.
        """
        # Dynamic annealing schedule for rotation step
        theta_step = self.theta_step_base * (0.15 + 0.85 * (1.0 - progress_ratio))

        alphas = qubits.alphas
        betas = qubits.betas
        thetas = qubits.thetas

        pop_size, n_qubits = thetas.shape
        delta_thetas = np.zeros_like(thetas)

        for i in range(pop_size):
            x_ind = current_bits[i]
            b_ind = guide_bits[i]
            for j in range(n_qubits):
                delta_thetas[i, j] = self.get_rotation_delta(
                    alpha=alphas[i, j],
                    beta=betas[i, j],
                    x_bit=x_ind[j],
                    b_bit=b_ind[j],
                    theta_step=theta_step,
                )

        # Apply rotation and clamp phase inside [0.01 * pi, 0.49 * pi] to prevent premature qubit collapse
        thetas_new = np.clip(thetas + delta_thetas, 0.01 * np.pi, 0.49 * np.pi)
        qubits.thetas[:] = thetas_new


class QuantumOperators:
    """
    Quantum Crossover and Mutation operators for Qubit populations.
    """

    @staticmethod
    def quantum_phase_interference_crossover(
        qubits: QubitPopulation,
        crossover_rate: float = 0.85,
    ) -> None:
        """
        Hadamard-inspired Phase Interference Crossover:
        Combines parent phase amplitudes with constructive/destructive quantum phase shifts.
        """
        pop_size, n_qubits = qubits.thetas.shape
        for i in range(0, pop_size - 1, 2):
            if np.random.rand() < crossover_rate:
                p1 = qubits.thetas[i].copy()
                p2 = qubits.thetas[i + 1].copy()
                
                # Mixing angle
                gamma = np.random.uniform(0.2, 0.8, size=n_qubits)
                # Interference phase noise
                phase_jitter = np.random.normal(0, 0.02 * np.pi, size=n_qubits)

                child1 = gamma * p1 + (1.0 - gamma) * p2 + phase_jitter
                child2 = (1.0 - gamma) * p1 + gamma * p2 - phase_jitter

                qubits.thetas[i] = np.clip(child1, 0.01 * np.pi, 0.49 * np.pi)
                qubits.thetas[i + 1] = np.clip(child2, 0.01 * np.pi, 0.49 * np.pi)

    @staticmethod
    def pauli_x_quantum_mutation(
        qubits: QubitPopulation,
        mutation_rate: float = 0.03,
    ) -> None:
        """
        Pauli-X Quantum Gate Mutation (Bit-flip in amplitude domain):
          X |q> = X (alpha |0> + beta |1>) = beta |0> + alpha |1>
          corresponds to theta -> pi/2 - theta
        """
        mask = np.random.rand(*qubits.thetas.shape) < mutation_rate
        qubits.thetas[mask] = (np.pi / 2.0) - qubits.thetas[mask]
        qubits.thetas[:] = np.clip(qubits.thetas, 0.01 * np.pi, 0.49 * np.pi)


def fast_non_dominated_sort(objectives: np.ndarray, constraints: Optional[np.ndarray] = None) -> List[List[int]]:
    """
    Deb's Fast Non-Dominated Sorting algorithm with constraint-domination support.
    Returns list of fronts (indices into population).
    """
    n = len(objectives)
    domination_counts = np.zeros(n, dtype=int)
    dominated_solutions = [[] for _ in range(n)]
    fronts = [[]]

    # Compute constraint violations (CV = sum(max(0, G)))
    cv = np.zeros(n)
    if constraints is not None:
        cv = np.sum(np.maximum(0.0, constraints), axis=1)

    for p in range(n):
        for q in range(n):
            if p == q:
                continue

            p_cv = cv[p]
            q_cv = cv[q]

            # Constrained domination rules:
            # 1. Feasible dominates infeasible
            # 2. Both infeasible: lower CV dominates
            # 3. Both feasible: Pareto objective dominance
            p_dominates_q = False
            if p_cv < 1e-5 and q_cv >= 1e-5:
                p_dominates_q = True
            elif p_cv >= 1e-5 and q_cv >= 1e-5:
                p_dominates_q = p_cv < q_cv
            elif p_cv < 1e-5 and q_cv < 1e-5:
                obj_p = objectives[p]
                obj_q = objectives[q]
                p_dominates_q = bool(np.all(obj_p <= obj_q) and np.any(obj_p < obj_q))

            if p_dominates_q:
                dominated_solutions[p].append(q)
            else:
                # Check if q dominates p
                q_dominates_p = False
                if q_cv < 1e-5 and p_cv >= 1e-5:
                    q_dominates_p = True
                elif q_cv >= 1e-5 and p_cv >= 1e-5:
                    q_dominates_p = q_cv < p_cv
                elif q_cv < 1e-5 and p_cv < 1e-5:
                    obj_p = objectives[p]
                    obj_q = objectives[q]
                    q_dominates_p = bool(np.all(obj_q <= obj_p) and np.any(obj_q < obj_p))

                if q_dominates_p:
                    domination_counts[p] += 1

        if domination_counts[p] == 0:
            fronts[0].append(p)

    # Subsequent fronts
    i = 0
    while len(fronts[i]) > 0:
        next_front = []
        for p in fronts[i]:
            for q in dominated_solutions[p]:
                domination_counts[q] -= 1
                if domination_counts[q] == 0:
                    next_front.append(q)
        i += 1
        fronts.append(next_front)

    if len(fronts[-1]) == 0:
        fronts.pop()

    return fronts


def compute_crowding_distance(objectives: np.ndarray, front_indices: List[int]) -> np.ndarray:
    """
    Computes NSGA-II crowding distance for solutions in a given Pareto front.
    """
    l = len(front_indices)
    if l <= 2:
        return np.full(l, np.inf)

    distances = np.zeros(l)
    sub_objs = objectives[front_indices]
    n_obj = sub_objs.shape[1]

    for m in range(n_obj):
        sorted_order = np.argsort(sub_objs[:, m])
        distances[sorted_order[0]] = np.inf
        distances[sorted_order[-1]] = np.inf

        f_min = sub_objs[sorted_order[0], m]
        f_max = sub_objs[sorted_order[-1], m]
        norm = max(f_max - f_min, 1e-8)

        for k in range(1, l - 1):
            prev_idx = sorted_order[k - 1]
            next_idx = sorted_order[k + 1]
            distances[sorted_order[k]] += (sub_objs[next_idx, m] - sub_objs[prev_idx, m]) / norm

    return distances


class QuantumNSGA2:
    """
    Complete Quantum-Inspired Multi-Objective Evolutionary Algorithm (Q-NSGA-II) Solver.
    Uses Hilbert Space Quantum Rotation Gates, Qubit Phase Evolution, and Non-Dominated Archiving.
    """

    def __init__(
        self,
        problem: FleetOptimizationProblem,
        pop_size: int = 40,
        n_gen: int = 50,
        theta_step: float = 0.06 * np.pi,
        mutation_rate: float = 0.04,
        crossover_rate: float = 0.80,
    ):
        self.problem = problem
        self.pop_size = pop_size
        self.n_gen = n_gen
        self.mapper = QuantumVariableMapper(n_legs=problem.n_legs)
        self.qubits = QubitPopulation(pop_size=pop_size, n_qubits=self.mapper.total_qubits)
        self.rotation_gate = QuantumRotationGate(theta_step_base=theta_step)
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate

    def calculate_hypervolume(self, front_objs: np.ndarray, ref_point: np.ndarray) -> float:
        """
        2D Hypervolume indicator calculation.
        """
        if len(front_objs) == 0:
            return 0.0
        # Sort by first objective ascending
        sorted_indices = np.argsort(front_objs[:, 0])
        sorted_f = front_objs[sorted_indices]

        hv = 0.0
        last_y = ref_point[1]

        for pt in sorted_f:
            if pt[0] < ref_point[0] and pt[1] < last_y:
                width = ref_point[0] - pt[0]
                height = last_y - pt[1]
                hv += width * height
                last_y = pt[1]

        return float(hv)

    def solve(self) -> Dict[str, Any]:
        """
        Executes the Q-NSGA-II optimization loop.
        Returns Pareto front solutions, convergence history, quantum entropy, and comparison metrics.
        """
        history = []
        best_archive_x = []
        best_archive_f = []
        best_archive_g = []
        best_archive_bits = []

        # Reference point for 2D Hypervolume calculation (Total Cost, WTW GHG)
        ref_point = np.array([3500000.0, 18000.0])

        for gen in range(self.n_gen):
            progress = gen / max(self.n_gen - 1, 1)

            # 1. Measure / Collapse Qubits into Classical Binary Solutions
            classical_bits = self.qubits.measure()

            # 2. Decode bitstrings into real decision vectors
            x_pop = np.array([self.mapper.decode_individual(b) for b in classical_bits])

            # 3. Evaluate objectives & constraints
            evaluated = [self.problem.evaluate_solution(x) for x in x_pop]
            f_pop = np.array([e["objectives"] for e in evaluated])
            g_pop = np.array([e["constraints"] for e in evaluated])

            # 4. Merge with existing archive if any
            if len(best_archive_x) > 0:
                all_x = np.vstack([x_pop, np.array(best_archive_x)])
                all_f = np.vstack([f_pop, np.array(best_archive_f)])
                all_g = np.vstack([g_pop, np.array(best_archive_g)])
                all_bits = np.vstack([classical_bits, np.array(best_archive_bits)])
            else:
                all_x = x_pop
                all_f = f_pop
                all_g = g_pop
                all_bits = classical_bits

            # 5. Fast Non-Dominated Sort
            fronts = fast_non_dominated_sort(all_f, all_g)

            # Update Pareto Archive (Rank 1 non-dominated solutions)
            rank1_indices = fronts[0] if len(fronts) > 0 else []
            if len(rank1_indices) > 0:
                # Deduplicate and limit archive size
                best_archive_x = [all_x[idx] for idx in rank1_indices]
                best_archive_f = [all_f[idx] for idx in rank1_indices]
                best_archive_g = [all_g[idx] for idx in rank1_indices]
                best_archive_bits = [all_bits[idx] for idx in rank1_indices]

            # 6. Select Guide Vectors for Quantum Rotation
            # For each individual in population, select a guide solution from Rank 1 archive
            guide_bits = np.zeros_like(classical_bits)
            if len(best_archive_bits) > 0:
                archive_objs = np.array(best_archive_f)
                crowd_dist = compute_crowding_distance(archive_objs, list(range(len(best_archive_f))))
                # Tournament or proportional selection from archive based on crowding distance
                for i in range(self.pop_size):
                    cand_a = np.random.randint(0, len(best_archive_bits))
                    cand_b = np.random.randint(0, len(best_archive_bits))
                    best_cand = cand_a if crowd_dist[cand_a] >= crowd_dist[cand_b] else cand_b
                    guide_bits[i] = best_archive_bits[best_cand]
            else:
                guide_bits = classical_bits.copy()

            # 7. Apply Quantum Rotation Gate Operator in Hilbert Space
            self.rotation_gate.apply(
                qubits=self.qubits,
                current_bits=classical_bits,
                guide_bits=guide_bits,
                progress_ratio=progress,
            )

            # 8. Apply Quantum Interference Crossover and Pauli-X Mutation
            QuantumOperators.quantum_phase_interference_crossover(
                qubits=self.qubits,
                crossover_rate=self.crossover_rate,
            )
            QuantumOperators.pauli_x_quantum_mutation(
                qubits=self.qubits,
                mutation_rate=self.mutation_rate,
            )

            # 9. Telemetry & Hypervolume Tracking
            hv = self.calculate_hypervolume(np.array(best_archive_f), ref_point)
            entropy = self.qubits.get_entropy()
            min_cost = float(np.min(all_f[:, 0]))
            min_ghg = float(np.min(all_f[:, 1]))

            history.append({
                "generation": gen + 1,
                "hypervolume": round(hv / 1e10, 4),  # normalized scale
                "qubit_entropy": round(entropy, 4),
                "pareto_solutions_count": len(rank1_indices),
                "min_cost_usd": round(min_cost, 2),
                "min_wtw_ghg_mt": round(min_ghg, 2),
            })

        # Final decode of Pareto Front solutions
        pareto_solutions = []
        seen_hashes = set()

        for x_sol in best_archive_x:
            h = tuple(np.round(x_sol, 1))
            if h in seen_hashes:
                continue
            seen_hashes.add(h)

            eval_res = self.problem.evaluate_solution(x_sol)
            pareto_solutions.append({
                "decision_vector": x_sol.tolist(),
                "total_cost_usd": eval_res["total_cost_usd"],
                "total_wtw_ghg_mt": eval_res["total_wtw_ghg_mt"],
                "total_co2_ttw_mt": eval_res["total_co2_ttw_mt"],
                "total_fuel_mt": eval_res["total_fuel_mt"],
                "total_transit_time_hrs": eval_res["total_transit_time_hrs"],
                "attained_cii": eval_res["attained_cii"],
                "cii_grade": eval_res["cii_grade"],
                "attained_gfi": eval_res["attained_gfi"],
                "is_feasible": eval_res["is_feasible"],
                "leg_details": eval_res["leg_details"],
            })

        # Sort solutions by Total Cost ascending
        pareto_solutions.sort(key=lambda s: s["total_cost_usd"])

        # Identify Knee / Compromise Solution (Normalized minimum Euclidean distance to ideal point)
        knee_idx = self._find_knee_point(pareto_solutions)
        for idx, sol in enumerate(pareto_solutions):
            sol["is_knee_point"] = (idx == knee_idx)

        # Baseline evaluation (Standard speed 18 kts, standard VLSFO, standard route)
        baseline_x = np.array([18.0] * self.problem.n_legs + [0.0] * self.problem.n_legs + [0.0] * self.problem.n_legs)
        baseline_res = self.problem.evaluate_solution(baseline_x)

        return {
            "algorithm": "Q-NSGA-II (Quantum-Inspired Rotation-Gate)",
            "generations": self.n_gen,
            "population_size": self.pop_size,
            "total_pareto_fronts": len(pareto_solutions),
            "pareto_front": pareto_solutions,
            "knee_solution_index": knee_idx,
            "baseline_solution": {
                "decision_vector": baseline_x.tolist(),
                **baseline_res,
            },
            "convergence_history": history,
            "final_qubit_entropy": round(self.qubits.get_entropy(), 4),
        }

    def _find_knee_point(self, solutions: List[Dict[str, Any]]) -> int:
        """Finds the Pareto knee point closest to the utopian normalized ideal origin."""
        if not solutions:
            return 0
        costs = np.array([s["total_cost_usd"] for s in solutions])
        ghgs = np.array([s["total_wtw_ghg_mt"] for s in solutions])

        c_min, c_max = np.min(costs), np.max(costs)
        g_min, g_max = np.min(ghgs), np.max(ghgs)

        norm_c = (costs - c_min) / max(c_max - c_min, 1.0)
        norm_g = (ghgs - g_min) / max(g_max - g_min, 1.0)

        # Distance to ideal (0, 0) in normalized objective space
        dist = np.sqrt(norm_c**2 + norm_g**2)
        return int(np.argmin(dist))
