import yfinance as yf

# Map Yahoo Finance exchange codes → (readable label, country flag)
# Covers all major global exchanges
EXCHANGE_META = {
    # 🇺🇸 United States
    "NMS": ("NASDAQ", "🇺🇸"),
    "NYQ": ("NYSE", "🇺🇸"),
    "NGM": ("NASDAQ", "🇺🇸"),
    "NCM": ("NASDAQ", "🇺🇸"),
    "ASE": ("AMEX", "🇺🇸"),
    "PCX": ("NYSE Arca", "🇺🇸"),
    "OQB": ("OTC", "🇺🇸"),
    "OQX": ("OTC", "🇺🇸"),
    "OTC": ("OTC", "🇺🇸"),
    "PNK": ("Pink Sheets", "🇺🇸"),
    "BTS": ("BATS", "🇺🇸"),
    "CXI": ("CBOE", "🇺🇸"),
    # 🇮🇳 India
    "NSI": ("NSE India", "🇮🇳"),
    "BSE": ("BSE India", "🇮🇳"),
    # 🇬🇧 United Kingdom
    "LSE": ("London SE", "🇬🇧"),
    "IOB": ("London IOB", "🇬🇧"),
    # 🇩🇪 Germany
    "FRA": ("Frankfurt", "🇩🇪"),
    "GER": ("XETRA", "🇩🇪"),
    "STU": ("Stuttgart", "🇩🇪"),
    "HAM": ("Hamburg", "🇩🇪"),
    "DUS": ("Düsseldorf", "🇩🇪"),
    "BER": ("Berlin", "🇩🇪"),
    "MUN": ("Munich", "🇩🇪"),
    # 🇨🇦 Canada
    "TOR": ("Toronto", "🇨🇦"),
    "TSX": ("TSX", "🇨🇦"),
    "VAN": ("TSX Venture", "🇨🇦"),
    "CNQ": ("CNSX", "🇨🇦"),
    # 🇦🇺 Australia
    "ASX": ("ASX", "🇦🇺"),
    # 🇯🇵 Japan
    "TYO": ("Tokyo", "🇯🇵"),
    "JPX": ("JPX", "🇯🇵"),
    # 🇨🇳 China
    "SHH": ("Shanghai", "🇨🇳"),
    "SHE": ("Shenzhen", "🇨🇳"),
    "SHG": ("Shanghai", "🇨🇳"),
    # 🇭🇰 Hong Kong
    "HKG": ("HK Exchange", "🇭🇰"),
    "HKE": ("HK Exchange", "🇭🇰"),
    # 🇸🇬 Singapore
    "SGX": ("SGX", "🇸🇬"),
    # 🇰🇷 South Korea
    "KSC": ("Korea SE", "🇰🇷"),
    "KOE": ("KOSDAQ", "🇰🇷"),
    # 🇹🇼 Taiwan
    "TAI": ("Taiwan SE", "🇹🇼"),
    "TWO": ("Taipei OTC", "🇹🇼"),
    # 🇫🇷 France
    "PAR": ("Euronext Paris", "🇫🇷"),
    # 🇳🇱 Netherlands
    "AMS": ("Euronext Amsterdam", "🇳🇱"),
    # 🇧🇪 Belgium
    "BRU": ("Euronext Brussels", "🇧🇪"),
    # 🇵🇹 Portugal
    "LIS": ("Euronext Lisbon", "🇵🇹"),
    # 🇪🇸 Spain
    "MCE": ("Bolsa de Madrid", "🇪🇸"),
    "MAD": ("Bolsa de Madrid", "🇪🇸"),
    # 🇨🇭 Switzerland
    "EBS": ("SIX Swiss", "🇨🇭"),
    "VTX": ("SIX Swiss", "🇨🇭"),
    # 🇮🇹 Italy
    "MIL": ("Borsa Italiana", "🇮🇹"),
    "BIT": ("Borsa Italiana", "🇮🇹"),
    # 🇸🇪 Sweden
    "STO": ("Nasdaq Stockholm", "🇸🇪"),
    "NGM": ("NGM", "🇸🇪"),
    # 🇩🇰 Denmark
    "CPH": ("Nasdaq Copenhagen", "🇩🇰"),
    # 🇳🇴 Norway
    "OSL": ("Oslo Børs", "🇳🇴"),
    # 🇫🇮 Finland
    "HEL": ("Nasdaq Helsinki", "🇫🇮"),
    # 🇦🇹 Austria
    "VSE": ("Vienna SE", "🇦🇹"),
    # 🇵🇱 Poland
    "WSE": ("Warsaw SE", "🇵🇱"),
    # 🇷🇺 Russia
    "MCX": ("Moscow Exchange", "🇷🇺"),
    # 🇧🇷 Brazil
    "SAO": ("B3 Brazil", "🇧🇷"),
    "SAE": ("B3 Brazil", "🇧🇷"),
    # 🇲🇽 Mexico
    "MEX": ("BMV Mexico", "🇲🇽"),
    # 🇦🇷 Argentina
    "BUE": ("BYMA Argentina", "🇦🇷"),
    # 🇿🇦 South Africa
    "JSE": ("JSE", "🇿🇦"),
    # 🇪🇬 Egypt
    "CAI": ("Egyptian Exchange", "🇪🇬"),
    # 🇮🇱 Israel
    "TLV": ("Tel Aviv SE", "🇮🇱"),
    # 🇸🇦 Saudi Arabia
    "SAU": ("Tadawul", "🇸🇦"),
    # 🇶🇦 Qatar
    "DOH": ("Qatar Exchange", "🇶🇦"),
    # 🇦🇪 UAE
    "DFM": ("Dubai Financial", "🇦🇪"),
    "ADX": ("Abu Dhabi SE", "🇦🇪"),
    # 🇹🇭 Thailand
    "SET": ("Stock Exchange of Thailand", "🇹🇭"),
    # 🇲🇾 Malaysia
    "KLS": ("Bursa Malaysia", "🇲🇾"),
    # 🇮🇩 Indonesia
    "JKT": ("IDX Indonesia", "🇮🇩"),
    # 🇵🇭 Philippines
    "PSE": ("Philippine SE", "🇵🇭"),
    # 🇳🇿 New Zealand
    "NZE": ("NZX", "🇳🇿"),
    # 🇨🇿 Czech Republic
    "PRA": ("Prague SE", "🇨🇿"),
    # 🇭🇺 Hungary
    "BUD": ("Budapest SE", "🇭🇺"),
    # 🇬🇷 Greece
    "ATH": ("Athens SE", "🇬🇷"),
    # 🇹🇷 Turkey
    "IST": ("Borsa Istanbul", "🇹🇷"),
    # 🇵🇰 Pakistan
    "KAR": ("Pakistan SE", "🇵🇰"),
    # 🇧🇩 Bangladesh
    "DHA": ("Dhaka SE", "🇧🇩"),
    # 🇻🇳 Vietnam
    "HSX": ("Ho Chi Minh SE", "🇻🇳"),
}

VALID_QUOTE_TYPES = {"EQUITY", "ETF", "MUTUALFUND"}


def search_ticker(query: str, max_results: int = 8) -> list[dict]:
    """
    Search Yahoo Finance for tickers matching a company name or partial ticker.
    Uses yfinance.Search which handles authentication/cookies automatically.
    Completely free — no API key required.
    """
    query = query.strip()
    if not query or len(query) < 1:
        return []

    try:
        search = yf.Search(query, max_results=max_results, enable_fuzzy_query=True)
        raw_quotes = search.quotes or []
    except Exception:
        return []

    results = []
    for q in raw_quotes:
        quote_type = q.get("quoteType", "").upper()
        if quote_type not in VALID_QUOTE_TYPES:
            continue

        symbol = q.get("symbol", "")
        if not symbol:
            continue

        name = q.get("longname") or q.get("shortname") or symbol
        exchange_code = q.get("exchange", "")
        exchange_label, flag = EXCHANGE_META.get(exchange_code, (exchange_code or "Unknown", "🌐"))

        results.append({
            "symbol": symbol,
            "name": name,
            "exchange": exchange_label,
            "flag": flag,
            "type": quote_type.capitalize(),
        })

        if len(results) >= max_results:
            break

    return results
