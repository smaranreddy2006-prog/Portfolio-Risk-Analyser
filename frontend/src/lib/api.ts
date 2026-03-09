import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

export interface PortfolioItem {
  ticker: string;
  amount: number;
  avg_price?: number;
}

export const fetchPortfolioAnalysis = async (items: PortfolioItem[]) => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze portfolio');
  }

  return response.json();
};

export const fetchPortfolioSimulation = async (items: PortfolioItem[]) => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/simulation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to simulate portfolio');
  }

  return response.json();
};
