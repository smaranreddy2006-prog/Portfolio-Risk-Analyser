'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  fetchPortfolioAnalysis,
  fetchPortfolioSimulation,
  PortfolioItem
} from '@/lib/api';
import { PlusCircle, Play, Trash2, LineChart, Shield, Zap, AlertCircle } from 'lucide-react';
import { Card, SectionTitle, Button } from '@/components/ui';

// High-performance Code Splitting for ultra-fast Vercel TTFB
const Dashboard = dynamic(() => import('@/components/Dashboard'), { loading: () => <div className="animate-pulse h-96 bg-white/5 rounded-2xl border border-white/10" /> });
const SimulationDashboard = dynamic(() => import('@/components/SimulationDashboard'), { loading: () => <div className="animate-pulse h-96 bg-white/5 rounded-2xl border border-white/10" /> });

export default function Home() {
  const [items, setItems] = useState<PortfolioItem[]>([
    { ticker: '', amount: 0, avg_price: undefined }
  ]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'analysis' | 'simulation'>('analysis');

  const addItem = () => {
    setItems([...items, { ticker: '', amount: 0, avg_price: undefined }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PortfolioItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const analyzePortfolio = async () => {
    try {
      setLoading(true);
      setError('');
      setAnalysis(null);
      setSimulation(null);

      // Basic validation
      const validItems = items.filter(i => i.ticker.trim() !== '' && i.amount > 0);
      if (validItems.length === 0) {
        throw new Error("Please enter at least one valid ticker and investment amount.");
      }

      // Execute both analysis and simulation requests concurrently
      const [analysisData, simRes] = await Promise.all([
        fetchPortfolioAnalysis(validItems),
        fetchPortfolioSimulation(validItems)
      ]);

      setAnalysis(analysisData);
      setSimulation(simRes.simulation);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Animated Glowing Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen pointer-events-none animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-600/15 blur-[100px] mix-blend-screen pointer-events-none animate-[pulse_10s_ease-in-out_infinite_reverse]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest text-indigo-400 mb-4 uppercase">
              <Zap size={14} className="animate-pulse" /> Finance Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Risk Engine <span className="text-transparent border-none text-white/20 font-light">|</span> AI
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light max-w-2xl">
              Deep-quant portfolio mathematics, interactive physics-based Monte Carlo simulations, and real-time stress testing.
            </p>
          </div>
        </div>
        <Card className="mb-10 lg:w-[80%] xl:w-[70%] z-20 relative">
          <SectionTitle
            title="Portfolio Builder"
            subtitle="Enter ticker symbols and amounts to run the engine."
          />

          <div className="space-y-4 mb-8 mt-6">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500 pb-3 border-b border-white/5 px-2">
              <div className="col-span-4">Asset Ticker</div>
              <div className="col-span-3">Investment Amount</div>
              <div className="col-span-3">Avg Price Bought (Opt)</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center group relative bg-white/[0.02] hover:bg-white/[0.04] transition-colors md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none border border-white/5 md:border-none">

                  <div className="w-full md:col-span-4 relative">
                    <label className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-wider block md:hidden">Asset Ticker</label>
                    <input
                      type="text"
                      value={item.ticker}
                      onChange={(e) => updateItem(index, 'ticker', e.target.value.toUpperCase())}
                      placeholder="AAPL, MSFT, RELIANCE.NS..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-semibold uppercase shadow-inner"
                    />
                  </div>
                  <div className="w-full md:col-span-3 relative">
                    <label className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-wider block md:hidden">Investment Amount</label>
                    <input
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value))}
                      placeholder="1000"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono font-medium shadow-inner"
                    />
                  </div>
                  <div className="w-full md:col-span-3 relative">
                    <label className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-wider block md:hidden">Avg Price Bought (Optional)</label>
                    <input
                      type="number"
                      value={item.avg_price || ''}
                      onChange={(e) => updateItem(index, 'avg_price', parseFloat(e.target.value))}
                      placeholder="Optional"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono font-medium shadow-inner"
                    />
                  </div>
                  <div className="w-full md:col-span-2 flex justify-end mt-3 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-none">
                    <button
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="p-3 w-full md:w-auto flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-600"
                    >
                      <Trash2 size={18} />
                      <span className="text-sm font-semibold block md:hidden">Remove Asset</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
            <Button variant="secondary" onClick={addItem} className="flex-1 sm:flex-none">
              <PlusCircle size={18} /> Add Asset
            </Button>
            <Button onClick={analyzePortfolio} disabled={loading} className="flex-1 sm:flex-none sm:ml-auto">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
              {loading ? 'Crunching Numbers...' : 'Run Engine'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </Card>

        {/* Dashboards */}
        {analysis && simulation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex gap-3 mb-8 bg-black/40 p-1.5 rounded-2xl w-fit backdrop-blur-xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 ${activeTab === 'analysis'
                  ? 'bg-white text-black shadow-lg translate-y-[-2px]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Shield size={16} /> Risk Analysis
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 ${activeTab === 'simulation'
                  ? 'bg-white text-black shadow-lg translate-y-[-2px]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <LineChart size={16} /> Physics Monte Carlo
              </button>
            </div>

            <div className="transition-all duration-500 relative">
              {activeTab === 'analysis' ? (
                <div className="animate-[slideUp_0.4s_ease-out]"><Dashboard analysis={analysis} /></div>
              ) : (
                <div className="animate-[slideUp_0.4s_ease-out]"><SimulationDashboard simulation={simulation} /></div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
