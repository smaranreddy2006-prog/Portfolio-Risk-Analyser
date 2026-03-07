import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def fetch_historical_data(tickers: list[str], period: str = "1y") -> pd.DataFrame:
    """
    Fetches historical adjusted close prices for a list of tickers plus the NIFTY 50 index (^NSEI)
    """
    all_tickers = tickers + ["^NSEI"]
    
    # Download data
    data = yf.download(all_tickers, period=period, progress=False)
    
    # Check if download succeeded by looking for 'Adj Close' or 'Close'
    if 'Adj Close' in data:
        prices = data['Adj Close']
    elif 'Close' in data:
        prices = data['Close']
    else:
        raise ValueError("Could not find Close or Adj Close prices in fetched data")
        
    # Drop rows where NIFTY 50 data is missing, then forward fill other missing values
    prices = prices.dropna(subset=['^NSEI'])
    prices = prices.ffill()
    
    return prices

def fetch_sector_info(tickers: list[str]) -> dict:
    """
    Fetches the sector for each ticker using yfinance.
    """
    sectors = {}
    for ticker in tickers:
        try:
            info = yf.Ticker(ticker).info
            sectors[ticker] = info.get('sector', 'Unknown')
        except Exception:
            sectors[ticker] = 'Unknown'
            
    return sectors
