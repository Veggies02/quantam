"""
Comprehensive Test Suite for NavOptima Multi-Objective Fleet Optimizer & Quantum Annealer.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import unittest
import numpy as np

from backend.optimizer.problem import FleetOptimizationProblem, FUEL_DATABASE, DEFAULT_LEGS
from backend.optimizer.quantum_operators import (
    QubitPopulation,
    QuantumVariableMapper,
    QuantumRotationGate,
    QuantumNSGA2,
    fast_non_dominated_sort,
)
from backend.optimizer.qubo_annealer import (
    MaritimeQUBOBuilder,
    QuantumAnnealingSimulator,
)


class TestFleetOptimizer(unittest.TestCase):
    def setUp(self):
        self.problem = FleetOptimizationProblem()

    def test_problem_evaluation(self):
        # 4 legs: speeds=15.0, fuels=VLSFO(0), routes=Standard(0)
        x = np.array([15.0, 15.0, 15.0, 15.0, 0, 0, 0, 0, 0, 0, 0, 0], dtype=float)
        res = self.problem.evaluate_solution(x)

        self.assertIn("objectives", res)
        self.assertEqual(len(res["objectives"]), 2)
        self.assertGreater(res["total_cost_usd"], 500000.0)
        self.assertGreater(res["total_wtw_ghg_mt"], 1000.0)
        self.assertEqual(len(res["leg_details"]), 4)

    def test_qubit_population_and_measurement(self):
        pop = QubitPopulation(pop_size=20, n_qubits=36)
        # Verify initial amplitudes are in equal superposition (theta = pi/4)
        np.testing.assert_allclose(pop.alphas, 1.0 / np.sqrt(2.0), atol=1e-4)
        np.testing.assert_allclose(pop.betas, 1.0 / np.sqrt(2.0), atol=1e-4)
        
        # Verify Von Neumann entropy is ~ 1.0
        self.assertAlmostEqual(pop.get_entropy(), 1.0, places=2)

        # Measurement generates valid binary array of shape (20, 36)
        bits = pop.measure()
        self.assertEqual(bits.shape, (20, 36))
        self.assertTrue(np.all((bits == 0) | (bits == 1)))

    def test_quantum_rotation_gate_unitarity(self):
        pop = QubitPopulation(pop_size=10, n_qubits=24)
        rot_gate = QuantumRotationGate(theta_step_base=0.08 * np.pi)

        current_bits = pop.measure()
        guide_bits = np.ones_like(current_bits)  # Guide towards 1

        rot_gate.apply(qubits=pop, current_bits=current_bits, guide_bits=guide_bits, progress_ratio=0.5)

        # Unitarity preservation: cos^2(theta) + sin^2(theta) == 1
        probs = np.square(pop.alphas) + np.square(pop.betas)
        np.testing.assert_allclose(probs, 1.0, atol=1e-5)

    def test_q_nsga2_optimization(self):
        solver = QuantumNSGA2(self.problem, pop_size=16, n_gen=12)
        res = solver.solve()

        self.assertEqual(res["algorithm"], "Q-NSGA-II (Quantum-Inspired Rotation-Gate)")
        self.assertGreater(len(res["pareto_front"]), 0)
        self.assertIn("knee_solution_index", res)
        self.assertEqual(len(res["convergence_history"]), 12)
        self.assertLess(res["final_qubit_entropy"], 1.0)

    def test_qubo_matrix_and_annealing(self):
        builder = MaritimeQUBOBuilder()
        Q_matrix, Q_dict, offset = builder.build_qubo_matrix()

        self.assertEqual(Q_matrix.shape, (12, 12))
        self.assertGreater(len(Q_dict), 0)

        # Solve via simulated annealer
        anneal_res = QuantumAnnealingSimulator.solve_qubo(builder, num_reads=100)
        self.assertIn("ground_state_energy", anneal_res)
        self.assertEqual(len(anneal_res["ground_state_bitstring"]), 12)
        self.assertEqual(len(anneal_res["ground_state_assignments"]), 3)
        self.assertEqual(anneal_res["constraint_violations"], 0)


if __name__ == "__main__":
    unittest.main()
