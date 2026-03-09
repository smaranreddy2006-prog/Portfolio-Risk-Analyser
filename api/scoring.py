def calculate_portfolio_score(
    portfolio_beta: float, 
    volatility: float, 
    diversification_metric: float, 
    sector_allocations: dict[str, float]
) -> dict:
    """
    Calculates a 0-100 score based on portfolio characteristics.
    Weights:
    25 Diversification
    20 Risk stability (Volatility)
    20 Beta balance
    20 Sharpe ratio (Approximate proxy here)
    15 Sector balance
    """
    
    score = 0
    
    # 1. Diversification (Max 25 points)
    # Penalize if one asset holds too much weight. Assume diversification_metric is the max asset weight.
    if diversification_metric <= 0.15:
        score += 25
    elif diversification_metric <= 0.25:
        score += 20
    elif diversification_metric <= 0.40:
        score += 12
    else:
        score += 5
        
    # 2. Risk Stability / Volatility (Max 20 points)
    # Annualized volatility ranges
    if volatility < 0.10:
        score += 20
    elif volatility < 0.18:
        score += 15
    elif volatility < 0.25:
        score += 10
    else:
        score += 5
        
    # 3. Beta Balance (Max 20 points)
    # Optimal beta is usually around 0.9 to 1.1 for standard risk
    if 0.9 <= portfolio_beta <= 1.1:
        score += 20
    elif 0.8 <= portfolio_beta < 0.9 or 1.1 < portfolio_beta <= 1.2:
        score += 15
    elif 0.5 <= portfolio_beta < 0.8 or 1.2 < portfolio_beta <= 1.5:
        score += 8
    else:
        score += 3
        
    # 4. Sector Balance (Max 15 points)
    # Penalize heavy concentration in a single sector
    max_sector_exposure = max(sector_allocations.values()) if sector_allocations else 1.0
    if max_sector_exposure <= 0.25:
        score += 15
    elif max_sector_exposure <= 0.40:
        score += 10
    elif max_sector_exposure <= 0.60:
        score += 5
    else:
        score += 0
        
    # 5. Base bonus (Proxy for Sharpe/Other factors not fully calculated here)
    score += 20
    
    # Cap between 0 and 100
    final_score = max(0, min(100, score))
    
    # Determine Risk Level
    if score >= 70:
        risk_level = "Balanced / Moderate"
    elif score >= 50:
        if portfolio_beta > 1.2:
            risk_level = "Aggressive"
        else:
            risk_level = "Sub-optimal Defensive"
    else:
        risk_level = "Highly Concentrated / High Risk"
        
    return {
        "score": final_score,
        "risk_level": risk_level
    }

def analyze_sectors(tickers: list[str], weights: dict[str, float], sector_info: dict[str, str]) -> dict:
    """
    Calculates total portfolio exposure per sector
    """
    allocations = {}
    for ticker, weight in weights.items():
        sector = sector_info.get(ticker, "Unknown")
        allocations[sector] = allocations.get(sector, 0.0) + weight
        
    # Generate simple recommendations
    overexposed = [s for s, w in allocations.items() if w > 0.40]
    
    # Major sectors to check if underexposed
    major_sectors = ["Technology", "Financial Services", "Healthcare", "Consumer Defensive"]
    present_sectors = list(allocations.keys())
    underexposed = [s for s in major_sectors if s not in present_sectors]
    
    return {
        "allocations": allocations,
        "recommendations": {
            "overexposed": overexposed,
            "underexposed": underexposed
        }
    }
