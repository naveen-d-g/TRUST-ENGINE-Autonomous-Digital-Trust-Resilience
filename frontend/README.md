# Autonomous Digital Trust Platform Dashboard

A production-grade React dashboard for visualizing and interacting with ML-driven trust decisions.

## 🚀 Getting Started

### 1. Prerequisites

Ensure the **Flask Backend** is running on `http://localhost:5000`.

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

## 🛡️ Features

- **Executive Dashboard**: High-level metrics, decision distribution, and risk vector analysis.
- **Session Explorer**: Full audit trail of individual session decisions with search and filtering.
- **Live Evaluation**: Interactive simulator to test session features against the ML engine.
- **Batch Processing**: Secure CSV upload for bulk auditing.
- **Security-First UI**: Dark-themed, analyst-friendly design with color-coded decision status.

## 📁 Architecture

- `src/services/api.js`: Centralized Axios service with error handling.
- `src/context/AppContext.jsx`: Global state for system health and aggregate metrics.
- `src/components/layout/`: Persistent navigation and structural components.
- `src/pages/`: Modular route-based views.

## 📊 Visualizations

Built with **Recharts** for performant, responsive security analytics.

- **Shield Gauges**: Real-time Trust Integrity scoring.
- **Radar & Bar Charts**: Primary cause and detection bias analysis.
- **Policy Badges**: Immediate visual identification of ALLOW/RESTRICT/ESCALATE states.
