import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from cachetools import cached, TTLCache, keys

def make_hashable(*args, **kwargs):
    new_args = tuple(tuple(arg) if isinstance(arg, list) else arg for arg in args)
    new_kwargs = {k: tuple(v) if isinstance(v, list) else v for k, v in kwargs.items()}
    return keys.hashkey(*new_args, **new_kwargs)


def get_benchmark(tickers: list[str]) -> str:
    """
    Select the appropriate market benchmark based on the portfolio tickers.
    Indian portfolios (.NS / .BO) -> NIFTY 50 (^NSEI)
    All others                    -> S&P 500  (^GSPC)
    """
    is_indian = any(t.endswith(('.NS', '.BO')) for t in tickers)
    return "^NSEI" if is_indian else "^GSPC"


# Cache yfinance responses for 1 hour to heavily reduce Vercel serverless latency
@cached(cache=TTLCache(maxsize=100, ttl=3600), key=make_hashable)
def fetch_historical_data(tickers: list[str], period: str = "1y", benchmark: str = "^GSPC") -> pd.DataFrame:
    """
    Fetches historical adjusted close prices for a list of tickers plus the chosen benchmark.
    benchmark: '^GSPC' for S&P 500 (US stocks), '^NSEI' for NIFTY 50 (Indian stocks)
    """
    all_tickers = tickers + [benchmark]
    
    # Download data
    data = yf.download(all_tickers, period=period, progress=False)
    
    # Check if download succeeded by looking for 'Adj Close' or 'Close'
    if 'Adj Close' in data:
        prices = data['Adj Close']
    elif 'Close' in data:
        prices = data['Close']
    else:
        raise ValueError("Could not find Close or Adj Close prices in fetched data")
        
    # Drop rows where benchmark data is missing, then forward fill other missing values
    prices = prices.dropna(subset=[benchmark])
    prices = prices.ffill()
    
    return prices

@cached(cache=TTLCache(maxsize=100, ttl=3600), key=make_hashable)
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
