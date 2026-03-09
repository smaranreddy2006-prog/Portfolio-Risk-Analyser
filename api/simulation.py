import numpy as np
import pandas as pd

def run_monte_carlo(returns: pd.DataFrame, weights: dict[str, float], initial_investment: float, days: int = 252, simulations: int = 1000000) -> dict:
    """
    Runs a highly optimized Monte Carlo simulation for the portfolio.
    Uses Geometric Brownian Motion (GBM) exact solution for terminal values (1M sims)
    and a small subset of path generations for UI charts to save memory & bandwidth.
    """
    
    # Calculate portfolio daily returns series to get mu and sigma
    portfolio_daily_returns = pd.Series(0.0, index=returns.index)
    for ticker, weight in weights.items():
        portfolio_daily_returns += returns[ticker] * weight
        
    mu = portfolio_daily_returns.mean()
    sigma = portfolio_daily_returns.std()
    
    # 1. Generate final values analytically using exact GBM solution for N simulations
    # S_T = S_0 * exp((mu - 0.5 * sigma^2) * T + sigma * sqrt(T) * Z)
    
    Z_final = np.random.standard_normal(simulations)
    drift_total = (mu - 0.5 * sigma**2) * days
    diffusion_total = sigma * np.sqrt(days) * Z_final
    final_values = initial_investment * np.exp(drift_total + diffusion_total)
    
    # Calculate key metrics
    expected_value = np.mean(final_values)
    lower_bound = np.percentile(final_values, 2.5) # 95% Confidence Interval
    upper_bound = np.percentile(final_values, 97.5) # 95% Confidence Interval
    var_95 = initial_investment - np.percentile(final_values, 5.0) # 95% Value at Risk
    
    # 2. For the frontend visualization, simulate ~50 actual paths over time.
    # Otherwise, returning 1M paths * 252 days would crash the browser and server memory.
    sample_sims = 50
    dt = 1
    paths = np.zeros((sample_sims, days))
    paths[:, 0] = initial_investment
    Z_path = np.random.standard_normal((sample_sims, days - 1))
    
    drift_step = (mu - 0.5 * sigma**2) * dt
    diffusion_step = sigma * np.sqrt(dt) * Z_path
    daily_returns_simulated = np.exp(drift_step + diffusion_step)
    
    for t in range(1, days):
        paths[:, t] = paths[:, t-1] * daily_returns_simulated[:, t-1]
        
    sample_paths = paths.tolist()
    
    # Return histogram bins of the final distribution for frontend visualization
    hist, bins = np.histogram(final_values, bins=50)
    
    return {
        "summary": {
            "initial_investment": initial_investment,
            "expected_value": expected_value,
            "value_at_risk_95": var_95,
            "value_at_risk_99": initial_investment - np.percentile(final_values, 1.0),
            "total_simulations": simulations
        },
        "percentiles": {
            "10": np.percentile(final_values, 10.0),
            "50": np.percentile(final_values, 50.0),
            "75": np.percentile(final_values, 75.0),
            "90": np.percentile(final_values, 90.0)
        },
        "sample_paths": sample_paths,
        "distribution": {
            "counts": hist.tolist(),
            "bins": bins.tolist()
        }
    }
