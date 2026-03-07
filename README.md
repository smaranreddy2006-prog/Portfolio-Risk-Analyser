# Portfolio Risk Analyzer & Simulation Engine

An AI-powered portfolio analytics platform built with Python (FastAPI), Next.js, and Tailwind CSS. It calculates advanced risk metrics (Beta, Covariance, Risk Decomposition) and runs Monte Carlo simulations (Geometric Brownian Motion) on live equity data.

## Features
- **Live Data Intake**: Uses `yfinance` to grab the latest historical data.
- **Dynamic Input**: Supports both USD and INR natively without hardcoded currencies. Add average bought prices to automatically calculate dynamic weights and real-time portfolio value.
- **Math Engine**: Computes Portfolio Beta, Volatility, Market vs Idiosyncratic risk, and optimal sector exposures.
- **Monte Carlo Engine**: Runs 1,000,000 simulations using vectorized geometric brownian motion formulas for lightning-fast VaR, Expectation, and Probability Bounds calculations.
- **Sleek UI**: App Router Next.js with a dark-glassmorphism Tailwind v4 design and Recharts data visualization.

## One-Click Run
You can run the entire application (both frontend and backend servers) with a single command:
```bash
./run.sh
```

### Manual Setup
If you prefer starting them manually:

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn yfinance pandas numpy scipy scikit-learn PyPortfolioOpt pydantic
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000) and the backend API on [http://localhost:8000](http://localhost:8000).
