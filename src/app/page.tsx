'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, SectionTitle } from '@/components/ui';
import { Plus, Trash2, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { fetchPortfolioAnalysis, fetchPortfolioSimulation, PortfolioItem } from '@/lib/api';

// Dynamically import heavy charting components to reduce initial bundle size on Vercel
const Dashboard = dynamic(() => import('@/components/Dashboard').then(mod => mod.Dashboard), { ssr: false });
const SimulationDashboard = dynamic(() => import('@/components/SimulationDashboard').then(mod => mod.SimulationDashboard), { ssr: false });

export default function Home() {
  const [items, setItems] = useState<PortfolioItem[]>([
    { ticker: 'AAPL', amount: 5000, avg_price: undefined },
    { ticker: 'MSFT', amount: 5000, avg_price: undefined }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [simulationResults, setSimulationResults] = useState<any | null>(null);

  const addItem = () => {
    setItems([...items, { ticker: '', amount: 1000, avg_price: undefined }]);
  };

  const updateItem = (index: number, field: keyof PortfolioItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const analyzePortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      const validItems = items.filter(i => i.ticker.trim() !== '' && i.amount > 0);
      if (validItems.length === 0) {
        throw new Error("Please enter at least one valid ticker and investment amount.");
      }

      // Execute both analysis and simulation requests concurrently
      const [analysisData, simulationData] = await Promise.all([
        fetchPortfolioAnalysis(validItems),
        fetchPortfolioSimulation(validItems)
      ]);

      setResults(analysisData);
      setSimulationResults(simulationData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred analyzing the portfolio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Quantify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Risk Exposure</span>
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Input your current investments to generate a deep statistical analysis of your portfolio's beta, tail risk, and sector exposure.
        </p>
      </div>

      <Card>
        <SectionTitle
          title="Portfolio Builder"
          subtitle="Add your stocks, ETFs, or mutual funds to begin analysis."
        />

        <div className="space-y-4 mb-6">
          <div className="hidden md:grid grid-cols-12 gap-3 text-sm font-medium text-zinc-400 pb-2 border-b border-white/5 px-2">
            <div className="col-span-4">Asset Ticker</div>
            <div className="col-span-3">Investment Amount</div>
            <div className="col-span-3">Avg Price Bought (Opt)</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center group relative bg-white/5 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border border-white/5 md:border-none">

              <div className="w-full md:col-span-4 relative">
                <label className="text-xs text-zinc-500 mb-1.5 font-semibold uppercase tracking-wider block md:hidden">Asset Ticker</label>
                <input
                  type="text"
                  value={item.ticker}
                  onChange={(e) => updateItem(index, 'ticker', e.target.value.toUpperCase())}
                  placeholder="e.g. AAPL, RELIANCE.NS"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all uppercase"
                />
              </div>
              <div className="w-full md:col-span-3 relative">
                <label className="text-xs text-zinc-500 mb-1.5 font-semibold uppercase tracking-wider block md:hidden">Investment Amount</label>
                <input
                  type="number"
                  value={item.amount || ''}
                  onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value))}
                  placeholder="1000"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              <div className="w-full md:col-span-3 relative">
                <label className="text-xs text-zinc-500 mb-1.5 font-semibold uppercase tracking-wider block md:hidden">Avg Price Bought (Optional)</label>
                <input
                  type="number"
                  value={item.avg_price || ''}
                  onChange={(e) => updateItem(index, 'avg_price', parseFloat(e.target.value))}
                  placeholder="Optional"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              <div className="w-full md:col-span-2 flex justify-end mt-2 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-none">
                <button
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  className="p-2 w-full md:w-auto flex items-center justify-center gap-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                >
                  <Trash2 size={16} />
                  <span className="text-sm font-medium block md:hidden">Remove Asset</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-2 rounded-lg hover:bg-indigo-500/10"
          >
            <Plus size={16} /> Add Asset
          </button>

          <button
            onClick={analyzePortfolio}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
            {loading ? 'Analyzing...' : 'Analyze Portfolio'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </Card>

      {/* Dashboards */}
      {results && (
        <div className="space-y-8 mt-12 pb-12">
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500 py-2 border-b border-white/5">
            Statistical & Risk Profile
          </h3>
          <Dashboard results={results} />

          {simulationResults && (
            <>
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500 py-2 border-b border-white/5 mt-16 pb-2">
                Monte Carlo Simulation
              </h3>
              <SimulationDashboard results={simulationResults} />
            </>
          )}
        </div>
      )}

    </div>
  );
}
