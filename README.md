# NavOptima — Quantum-Inspired Fuel Prediction & Green Fleet Optimization Platform

> **Smart India Hackathon 2026 | Problem Statement 26138 | Team: Egreen Quanta**  
> *Enterprise Maritime Intelligence, Physics-Informed Neural Networks & Quantum-Inspired Multi-Objective Optimization*

---

## 🌊 Overview

**NavOptima** is an end-to-end maritime decarbonization and fleet optimization platform designed to solve the high-dimensional, non-linear challenges of green shipping. It combines:
1. **Holtrop-Mennen Empirical Hydrodynamic Physics** with an **XGBoost Grey-Box Residual PINN** for ultra-accurate fuel and power prediction ($R^2 = 0.9978$, MAPE $1.76\%$).
2. **Genuinely Quantum-Inspired Multi-Objective Evolutionary Algorithm (Q-NSGA-II)** utilizing Hilbert space unitary rotation gates $U(\Delta\theta)$ with qubit amplitude vectors $[\cos\theta, \sin\theta]^T$, achieving a **50.0% generation budget savings** over classical NSGA-II.
3. **Full Lifecycle (Well-to-Wake) Decarbonization Accounting** compliant with **FuelEU Maritime (Regulation EU 2023/1805)** and **IMO DCS**.
4. **Automated Regulatory Compliance**: Dynamic **IMO Carbon Intensity Indicator (CII)** letter grading (A through E), FuelEU Maritime penalty balance calculation (€2,400/t deficit), and EU ETS allowance quota tracker.
5. **Discrete Berth & Fuel Scheduling via D-Wave QUBO**: Formulated as an Ising/QUBO Hamiltonian solvable on real D-Wave Leap Advantage2 hardware or offline simulated annealer (`dwave-neal`).
6. **2D Geospatial Tactical Green Corridors Command Center**: Interactive maritime routing, weather overlays, ECA emission control boundaries, and 1-Click Executive PDF/JSON Audit Report generation.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Option A: One-Command Full-Stack Launcher (Recommended)
```bash
python run_platform.py
```
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc API Spec**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Option B: Separate Terminals

#### 1. Backend Server
```bash
pip install -r backend/requirements.txt
python backend/run.py
```

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```

---

## 📐 Mathematical Formulation & Technical Highlights

### 1. Quantum Rotation Gate Operator $U(\Delta\theta)$
$$\begin{bmatrix} \alpha_j^{t+1} \\ \beta_j^{t+1} \end{bmatrix} = \begin{bmatrix} \cos(\Delta\theta_j) & -\sin(\Delta\theta_j) \\ \sin(\Delta\theta_j) & \cos(\Delta\theta_j) \end{bmatrix} \begin{bmatrix} \alpha_j^t \\ \beta_j^t \end{bmatrix} \iff \theta_j^{t+1} = \theta_j^t + \Delta\theta_j$$
Where $\Delta\theta_j = s(\alpha_j, \beta_j, x_j, b_j) \cdot \Delta\theta_{\text{step}}$, guided by the non-dominated Pareto leader set ($Rank 1$).

### 2. Grey-Box Residual Hydrodynamics
$$P_{\text{actual}} = P_{\text{Holtrop-Mennen}}(v, T, \text{trim}) + \Delta P_{\text{XGBoost}}(\text{weather}, \text{fouling}, \text{fuel}, \text{engine wear})$$

### 3. Multi-Objective Optimization
$$\min_{v, f, r} \quad \left[ f_1(x) = \text{Total Voyage OPEX } (\$), \quad f_2(x) = \text{Lifecycle WTW GHG } (MT\ CO_2e) \right]$$
$$\text{Subject to: } T_{\text{voyage}} \le T_{\text{max}}, \quad \text{Cargo Demand } \ge D_{\text{req}}, \quad \text{Attained CII } \le \text{Grade C}$$

---

## 📋 SIH 2026 Expected Deliverables Coverage

| S.No | Deliverable | Implemented Solution | Demonstrated Metrics |
| :---: | :--- | :--- | :--- |
| **1** | **Fuel Consumption Prediction Model** | Holtrop-Mennen + XGBoost PINN (`/predict`) | $R^2 = 0.9978$, MAPE $1.76\%$, $RMSE = 985\text{ kW}$ |
| **2** | **Mathematical Optimization Formulation** | Multi-Objective Voyage & Speed Model (`/optimize`) | Cost vs WTW GHG Pareto Frontier with constraint handling |
| **3** | **Quantum-Inspired Optimization Algorithm** | Q-NSGA-II Rotation Gate + D-Wave QUBO (`/benchmark`, `/quantum`) | $50.0\%$ generation budget savings ($G_{95} = 38$), Wilcoxon $p < 0.001$ |
| **4** | **Software Platform / Decision Support System** | Enterprise FastAPI + React 18 / Tailwind GUI (`/dashboard`) | Tactical Map, Scenario Simulator, 1-Click PDF/JSON Audit Reports |
| **5** | **Demonstration & Large-Scale Case Studies** | 5, 20, 50 Vessel Scalability Benchmarks (`/benchmark`, `/compliance`) | $2.42\times$ to $4.84\times$ speedups, SEEMP Part III Corrective Action Plans |

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, SVG Geospatial Mapping
- **Backend**: FastAPI, Uvicorn, Pydantic v2, NumPy, SciPy, Pandas, Scikit-learn, XGBoost
- **Quantum & Optimization**: Custom Q-NSGA-II Hilbert Gate, PyQUBO, `dwave-neal`, D-Wave Ocean SDK
- **Compliance Standards**: IMO MEPC.337(76), FuelEU Maritime (Regulation EU 2023/1805), EU ETS MRV (Directive 2003/87/EC)

---

## 📄 License
Developed for **Smart India Hackathon 2026** (Problem Statement 26138).
