import { Card, SectionTitle } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingDown, TrendingUp, AlertOctagon } from 'lucide-react';
import { InfoTooltip } from './ui';

export default function SimulationDashboard({ simulation }: { simulation: any }) {
    if (!simulation) return null;

    const { summary, percentiles, paths } = simulation;

    // Transform sample paths into recharts format
    // Recharts expects an array of objects: { day: 1, path0: 100, path1: 105, ... }
    const chartData = [];
    const days = paths[0].length;

    for (let d = 0; d < days; d++) {
        const dataPoint: any = { day: d };
        paths.forEach((path: number[], index: number) => {
            dataPoint[`path${index}`] = path[d];
        });
        chartData.push(dataPoint);
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6 mt-6 animate-in slide-in-from-bottom-8 duration-700 delay-150">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                    <div className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
                        <Target size={16} className="text-zinc-500" /> Current Value
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {formatCurrency(summary.initial_investment)}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] rounded-xl p-4 flex flex-col justify-between group hover:bg-white/10 transition-colors">
                    <div className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-500" /> Expected (Median)
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-emerald-400">
                            {formatCurrency(summary.expected_value)}
                        </div>
                        <div className="text-xs text-emerald-500/70 mt-1">50th Percentile</div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] rounded-xl p-4 flex flex-col justify-between group hover:bg-white/10 transition-colors">
                    <div className="text-zinc-400 text-sm mb-2 flex items-center gap-1">
                        <TrendingDown size={16} className="text-amber-500" /> Downside (95% VaR) <InfoTooltip text="Value at Risk. You have a 95% mathematical probability of maintaining at least this value." />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-amber-400">
                            {formatCurrency(summary.value_at_risk_95)}
                        </div>
                        <div className="text-xs text-amber-500/70 mt-1">5th Percentile</div>
                    </div>
                </div>

                <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-xl p-4 flex flex-col justify-between group hover:bg-red-500/10 transition-colors">
                    <div className="text-zinc-400 text-sm mb-2 flex items-center gap-1">
                        <AlertOctagon size={16} className="text-red-500" /> Severe (99% VaR) <InfoTooltip text="Extreme tail risk. In a severe 1-in-100 market crash, your portfolio could fall to this localized level." />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-red-400">
                            {formatCurrency(summary.value_at_risk_99)}
                        </div>
                        <div className="text-xs text-red-500/70 mt-1">1st Percentile</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Probability Distribution</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-400">10th Percentile (Bear)</span>
                            <span className="font-mono text-white">{formatCurrency(percentiles['10'])}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 50th Percentile (Expected)</span>
                            <span className="font-mono text-emerald-400 font-bold">{formatCurrency(percentiles['50'])}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-400">75th Percentile (Bull)</span>
                            <span className="font-mono text-white">{formatCurrency(percentiles['75'])}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-zinc-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> 90th Percentile (Optimistic)</span>
                            <span className="font-mono text-indigo-400 font-bold">{formatCurrency(percentiles['90'])}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Simulation Methodology</h4>
                    <div className="text-sm text-zinc-400 space-y-3 leading-relaxed">
                        <p>
                            We executed <strong className="text-indigo-400">{summary.total_simulations.toLocaleString()}</strong> independent random walk simulations using Geometric Brownian Motion (GBM).
                        </p>
                        <p>
                            This physics-engine approach models the mathematical drift and volatility of your exact asset allocation over 252 trading days (1 Year), exposing the hidden "fat-tail" risks that standard metrics miss.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="relative">
                <div className="absolute top-4 right-4 bg-indigo-500/20 text-indigo-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded inline-flex items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    {summary.total_simulations.toLocaleString()} Simulations
                </div>
                <SectionTitle title="Monte Carlo Paths" subtitle="Geometric Brownian Motion (252 Trading Days)" />

                <div className="h-96 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `Day ${val}`}
                            />
                            <YAxis
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Value']}
                                labelFormatter={(label: any) => `Trading Day ${label}`}
                            />
                            {paths.map((_: any, index: number) => (
                                <Line
                                    key={index}
                                    type="monotone"
                                    dataKey={`path${index}`}
                                    stroke="url(#colorGradient)"
                                    strokeWidth={1}
                                    dot={false}
                                    opacity={0.3}
                                    isAnimationActive={true}
                                />
                            ))}
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#4f46e5" />
                                    <stop offset="50%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
