from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200

def test_portfolio_analysis():
    payload = {
        "items": [
            {"ticker": "AAPL", "amount": 5000},
            {"ticker": "MSFT", "amount": 5000}
        ]
    }
    response = client.post("/portfolio/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "beta" in data
    assert "score" in data

