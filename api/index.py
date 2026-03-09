from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import concurrent.futures
from .models import PortfolioRequest
from . import data_service
from . import risk_metrics
from . import scoring
from . import simulation
from . import ticker_search

app = FastAPI(title="Portfolio Risk Analyzer API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Portfolio Risk Analyzer API"}


@app.get("/api/ticker/search")
def search_ticker_endpoint(q: str = Query(..., min_length=1, description="Company name or partial ticker")):
    """
    Search Yahoo Finance for ticker symbols matching a company name.
    Completely free — uses Yahoo Finance public search endpoint.
    """
    results = ticker_search.search_ticker(q)
    return {"results": results}

def calculate_weights_and_value(items, data):
    current_prices = data.iloc[-1]
    current_values = {}
    is_indian = any(item.ticker.endswith(('.NS', '.BO')) for item in items)
    currency = "INR" if is_indian else "USD"
    
    for item in items:
        if item.avg_price is not None and item.avg_price > 0:
            shares = item.amount / item.avg_price
            current_values[item.ticker] = float(shares * current_prices[item.ticker])
        else:
            current_values[item.ticker] = item.amount
            
    total_current_value = sum(current_values.values())
    if total_current_value <= 0:
        raise ValueError("Total current portfolio value must be positive")
        
    weights = {ticker: float(value / total_current_value) for ticker, value in current_values.items()}
    return weights, total_current_value, currency

@app.post("/api/portfolio/analysis")
def fetch_portfolio_analysis(request: PortfolioRequest):
    try:
        tickers = [item.ticker for item in request.items]
        
        # 1. Fetch Data Concurrently
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_data = executor.submit(data_service.fetch_historical_data, tickers, "2y")
            future_sectors = executor.submit(data_service.fetch_sector_info, tickers)
            
            data = future_data.result()
            sectors = future_sectors.result()
        
        # Calculate dynamic weights based on avg_price
        weights, total_current_value, currency = calculate_weights_and_value(request.items, data)
        
        # Calculate returns
        returns = risk_metrics.calculate_daily_returns(data)
        
        # 2. Key Risk Metrics
        beta_info = risk_metrics.calculate_portfolio_beta(returns, weights)
        cov_matrix = risk_metrics.calculate_covariance_matrix(returns, tickers)
        risk_decomp = risk_metrics.decompose_risk(returns, beta_info["asset_betas"], weights)
        clt_data = risk_metrics.central_limit_theorem_analysis(returns, weights)
        
        # 3. Scoring & Allocation
        sector_allocations = scoring.analyze_sectors(tickers, weights, sectors)
        max_asset_weight = max(weights.values())
        portfolio_volatility = risk_decomp["portfolio"]["total_risk"]
        
        score_info = scoring.calculate_portfolio_score(
            portfolio_beta=beta_info["portfolio_beta"],
            volatility=portfolio_volatility,
            diversification_metric=max_asset_weight,
            sector_allocations=sector_allocations["allocations"]
        )
        
        return {
            "status": "success",
            "weights": weights,
            "beta": beta_info,
            "covariance_matrix": cov_matrix.to_dict(),
            "risk_decomposition": risk_decomp,
            "clt_analysis": clt_data,
            "sectors": sector_allocations,
            "score": score_info,
            "currency": currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/portfolio/simulation")
def fetch_portfolio_simulation(request: PortfolioRequest):
    try:
        tickers = [item.ticker for item in request.items]
        
        # Fetch data
        data = data_service.fetch_historical_data(tickers, "2y")
        returns = risk_metrics.calculate_daily_returns(data)
        
        # Calculate dynamic weights and current value based on avg_price
        weights, total_current_value, currency = calculate_weights_and_value(request.items, data)
        
        # Run Simulation
        sim_data = simulation.run_monte_carlo(
            returns=returns, 
            weights=weights, 
            initial_investment=total_current_value,
            days=252,
            simulations=1000000
        )
        
        return {
            "status": "success",
            "simulation": sim_data,
            "currency": currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
