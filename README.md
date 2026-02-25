# Trust Engine – Autonomous Digital Trust & Resilience

![Trust Engine Logo](https://img.shields.io/badge/Security-Autonomous_SOC-indigo?style=for-the-badge) ![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python) ![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)

## 📌 Overview

**Trust Engine** is an AI-powered Security Operations Center (SOC) platform designed to monitor, detect, prevent, and recover from digital threats in real-time. Moving beyond traditional rule-based networking barriers, this platform autonomously evaluates risk and enforces adaptive security controls across digital ecosystems using Machine Learning, Behavioral Analytics, and Intelligent Automation.

It focuses on building continuous digital trust through:

- 🔍 **Real-time Monitoring**: Streaming telemetry and session tracking.
- 🧠 **AI-Based Threat Detection**: Identifying anomalies and calculating behavioral risk.
- 🛡 **Adaptive Prevention**: Automatically enforcing session termination, MFA triggers, or quarantines.
- 🔄 **Automated Recovery**: Rolling back risky sessions and assisting in rapid incident resilience.
- 🔐 **Secure Authentication & Access Control**

---

## 🧠 Core Modules

**1️⃣ Monitoring Engine**

- Continuous session tracking
- User behavior analytics
- Event logging & telemetry collection
- Risk signal aggregation

**2️⃣ Detection Engine**

- Anomaly detection using ML models
- Risk scoring algorithm
- Fraud pattern recognition
- Behavioral deviation analysis

**3️⃣ Prevention Engine**

- Dynamic access control
- Policy-based enforcement
- Bot Activity Detection & Mitigation
- Step-up authentication triggers
- Suspicious activity blocking

**4️⃣ Recovery & Resilience Engine**

- Automated incident response
- Account isolation & restoration
- Rollback & mitigation workflows
- Resilience recommendation system

**5️⃣ Authentication & Trust Engine**

- Token-based authentication
- Role-Based Access Control (RBAC)
- Multi-Factor Authentication support
- Trust score evaluation per user/session

---

## � Architecture & System Layers

The project is structured into several core layers operating in a synchronized loop:

### 1. The Target Application Layer (`target_app/`)

A simulated vulnerable web application ("Acme Corp Gateway") that acts as the telemetry source. It generates real-time events (logins, dummy data submissions, simulated attacks) and streams them to the Trust Engine via ingestion APIs.

### 2. The Observation & Ingestion Layer (`backend/ingestion/`)

Acts as the sensory organ of the platform. It ingests HTTP events, API calls, and Network Signals via REST endpoints (and Kafka, if configured). It normalizes raw telemetry into standardized Event Schemas and passes them to the Engine.

### 3. The ML Detection & Inference Layer (`backend/services/inference_service.py`)

This layer analyzes aggregated session data. Using supervised and unsupervised models, it:

- Generates a **Risk Score (0-100)** and a **Trust Score**.
- Identifies **Bot Activity** (via speed, headless execution, or repetitive heuristics).
- Classifies the severity of the threat and predicts the primary cause.

### 4. The Orchestration & Enforcement Layer (`backend/api/enforcement_routes.py`)

Based on the ML Inference decision (`ALLOW`, `RESTRICT`, `ESCALATE`, `DENY`, `TERMINATE`), the enforcement layer executes actions. It triggers webhooks back to the Target App to instantly drop malicious sessions, force password resets, or isolate endpoints.

### 5. The Presentation Layer (`frontend/`)

A high-fidelity React dashboard tailored for SOC Analysts. Features include:

- **Trust Evaluation Matrix**: Real-time visualization of live user sessions and bot detections.
- **Threat Heatmap**: Graphical overview of system stability.
- **Session Explorer**: Drill-down analysis into individual actor trajectories.
- **Live Attack Monitor**: Streaming logs of intercepts and verdicts.

## 🏗 System Architecture Flow

User Activity → Monitoring Engine

Activity Data → Detection Engine

ML Model → Risk Score Generation

Risk Score → Prevention Engine

High Risk → Recovery & Resilience

All Events → Audit Logs & Dashboard

---

## 📊 Machine Learning Models Used

Logistic Regression

Random Forest

Isolation Forest (Anomaly Detection)

Risk Classification Models

These models enable:

Fraud Detection

Behavioral Anomaly Detection

Dynamic Risk Prediction

Trust Score Calculation

---

## 🔐 Key Features

Real-time anomaly & bot detection
AI-driven trust scoring
Autonomous threat response
Secure REST APIs
Role-based Access Control (RBAC)

Automated resilience workflows

Scalable cloud-ready architecture

---

## ⚙️ Installation & Setup

## 🛠 Technology Stack

**Backend**

- Python
- Flask
- Flask-RESTful / Blueprints
- Flask-SQLAlchemy

**Database**

- PostgreSQL

**Machine Learning**

- Scikit-learn
- Pandas
- NumPy

**Security**

- JWT Authentication
- Token Authentication
- RBAC Implementation

**Tools**

- Postman (API Testing)
- Git & GitHub

---

### Prerequisites

- **Python 3.10+**
- **Node.js (v18+) & npm**
- **PostgreSQL (14+)**

### 1. Clone the Repository

```bash
git clone https://github.com/naveen-d-g/TRUST-ENGINE-Autonomous-Digital-Trust-Resilience.git
cd TRUST-ENGINE-Autonomous-Digital-Trust-Resilience
```

### 2. Configure the Database

Ensure your local PostgreSQL service is running. Create a database named `trust_engine_db`.

```sql
CREATE DATABASE trust_engine_db;
```

Configure your credentials by editing the `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/trust_engine_db
```

### 3. Setup the Backend (Flask)

```bash
# Create and activate virtual environment
python -m venv env
# Windows: env\Scripts\activate
# Mac/Linux: source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Backend Server (Runs on port 5000)
python backend/app.py
```

### 4. Setup the Target Application

Open a **new terminal tab** and activate the environment:

```bash
# Windows: env\Scripts\activate
# Mac/Linux: source env/bin/activate

# Start the Target App (Runs on port 3001)
python target_app/app.py
```

### 5. Setup the Frontend (React Vite)

Open a **third terminal tab**:

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## ⚔️ Detailed Usage & Simulation Lab

The best way to understand the Trust Engine is to attack it via the provided simulation scripts.

### 1. The Trust Evaluation Dashboard

Navigate to `http://localhost:5173/trust-eval`. Watch the **Active Users Matrix** — this will display users interfacing with the Target App in real-time.

### 2. Run Bot Simulations

Open a terminal (ensure your python `env` is active) and run the automated bot scripts to trigger the engine's defenses:

**Simulate a Headless Browser (Selenium) Attack:**

```bash
python bots/selenium_form_bot.py --count 5
```

_Effect:_ The bot logs into the Target App, bypasses standard auth, and rapidly submits data. The SOC dashboard will instantly flag `BOT ACTIVITY DETECTED`, mark the user as 'Offline', and terminate the session.

**Simulate a High-Velocity API Credential Stuffing Attack:**

```bash
python bots/api_bot.py --count 10
```

_Effect:_ The engine identifies the missing JavaScript fingerprints and non-standard generic User-Agents, blocking the session at the root layer.

### 3. Manual Verification

Navigate to the Target App (`http://localhost:3001`). Login genuinely as `demo_user`. Unlike the bot, human typing and interaction duration will safely pass the ML threshold, marking you as `Online` and `ALLOW`ed in the SOC dashboard. Click "Simulate Attack" inside the Target App's dashboard to observe forced Session Terminations gracefully enforce password resets.

---

## 👨‍💻 Author

**Naveen D G**  
_Final Year Computer Science Student_  
AI | Machine Learning | Backend Developer

- LinkedIn: [linkedin.com/in/naveen-d-g](https://www.linkedin.com/in/naveen-d-g)
- GitHub: [github.com/naveen-d-g](https://github.com/naveen-d-g)
