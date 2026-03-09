import pandas as pd
import numpy as np

def calculate_daily_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """Calculates daily percentage returns from a price dataframe"""
    return prices.pct_change().dropna()

def calculate_portfolio_beta(returns: pd.DataFrame, weights: dict[str, float]) -> dict:
    """
    Calculates the individual beta of each asset and the overall portfolio beta
    against the NIFTY 50 (^NSEI) index.
    """
    if "^NSEI" not in returns.columns:
        raise ValueError("Market Benchmark (^NSEI) missing from data")
    
    market_returns = returns["^NSEI"]
    market_var = market_returns.var()
    
    asset_betas = {}
    portfolio_beta = 0.0
    
    for ticker, weight in weights.items():
        if ticker == "^NSEI":
            continue
        
        asset_returns = returns[ticker]
        covariance = asset_returns.cov(market_returns)
        beta = covariance / market_var
        
        asset_betas[ticker] = beta
        portfolio_beta += beta * weight
        
    return {
        "portfolio_beta": portfolio_beta,
        "asset_betas": asset_betas
    }

def calculate_covariance_matrix(returns: pd.DataFrame, tickers: list[str]) -> pd.DataFrame:
    """
    Calculates the annualised covariance matrix for a list of tickers
    """
    asset_returns = returns[tickers]
    # Annualize covariance by multiplying by 252 (trading days)
    cov_matrix = asset_returns.cov() * 252 
    return cov_matrix

def decompose_risk(returns: pd.DataFrame, asset_betas: dict[str, float], weights: dict[str, float]) -> dict:
    """
    Decomposes total risk into market risk and idiosyncratic risk based on CAPM
    """
    market_returns = returns["^NSEI"]
    market_variance = market_returns.var() * 252 # Annualized
    
    portfolio_beta = sum(asset_betas[ticker] * weights[ticker] for ticker in weights)
    portfolio_market_risk = (portfolio_beta ** 2) * market_variance
    
    # Calculate portfolio idiosyncratic risk
    portfolio_idiosyncratic_risk = 0.0
    asset_risks = {}
    
    for ticker, weight in weights.items():
        asset_returns = returns[ticker]
        total_variance = asset_returns.var() * 252
        beta = asset_betas[ticker]
        market_risk = (beta ** 2) * market_variance
        idio_risk = max(0, total_variance - market_risk)  # Handle minor floating point negatives
        
        asset_risks[ticker] = {
            "total_risk": np.sqrt(total_variance),
            "market_risk": np.sqrt(market_risk),
            "idiosyncratic_risk": np.sqrt(idio_risk)
        }
        
        # Approximation for portfolio level (assuming idiosyncratic risks are uncorrelated)
        portfolio_idiosyncratic_risk += (weight ** 2) * idio_risk
        
    total_portfolio_risk = portfolio_market_risk + portfolio_idiosyncratic_risk
    
    return {
        "portfolio": {
            "total_risk": np.sqrt(total_portfolio_risk),
            "market_risk": np.sqrt(portfolio_market_risk),
            "idiosyncratic_risk": np.sqrt(portfolio_idiosyncratic_risk)
        },
        "assets": asset_risks
    }

def central_limit_theorem_analysis(returns: pd.DataFrame, weights: dict[str, float]) -> dict:
    """
    Calculates portfolio returns over time and fits Normal and Cauchy distributions
    to demonstrate fat tail risks. Returns PDF data for visualization.
    """
    # Calculate daily portfolio returns
    portfolio_returns = pd.Series(0.0, index=returns.index)
    for ticker, weight in weights.items():
        portfolio_returns += returns[ticker] * weight
        
    # Generate x values for the PDF (from slightly below min to slightly above max)
    x = np.linspace(portfolio_returns.min() - 0.05, portfolio_returns.max() + 0.05, 100)
    
    # Fit Normal Distribution
    mu = np.mean(portfolio_returns)
    std = np.std(portfolio_returns, ddof=0)
    # Handle zero std
    if std == 0: std = 1e-6
    pdf_norm = (1 / (std * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / std) ** 2)
    
    # Fit Cauchy Distribution (Using Median/IQR for approximation)
    loc = np.median(portfolio_returns)
    q75, q25 = np.percentile(portfolio_returns, [75, 25])
    scale = (q75 - q25) / 2
    if scale == 0: scale = 1e-6
    pdf_cauchy = 1 / (np.pi * scale * (1 + ((x - loc) / scale) ** 2))
    
    # Calculate empirical histogram
    hist_counts, hist_bins = np.histogram(portfolio_returns, bins=50, density=True)
    
    return {
        "x": x.tolist(),
        "pdf_normal": pdf_norm.tolist(),
        "pdf_cauchy": pdf_cauchy.tolist(),
        "histogram": {
            "counts": hist_counts.tolist(),
            "bins": hist_bins.tolist()
        },
        "params": {
            "normal": {"mu": mu, "std": std},
            "cauchy": {"loc": loc, "scale": scale}
        }
    }
