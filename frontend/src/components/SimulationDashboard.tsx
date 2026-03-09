import { Card, SectionTitle } from '@/components/ui';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function SimulationDashboard({ results }: { results: any }) {
    if (!results) return null;

    const { expected_value, lower_bound, upper_bound, var_95, sample_paths } = results.simulation;

    // Transform sample paths into recharts format
    // Recharts expects an array of objects: { day: 1, path0: 100, path1: 105, ... }
    const chartData = [];
    const days = sample_paths[0].length;

    for (let d = 0; d < days; d++) {
        const dataPoint: any = { day: d };
        sample_paths.forEach((path: number[], index: number) => {
            dataPoint[`path${index}`] = path[d];
        });
        chartData.push(dataPoint);
    }

    const formatNumber = (val: number) =>
        new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6 mt-6 animate-in slide-in-from-bottom-8 duration-700 delay-150">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)]">
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">Expected Mean (1Y)</div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(expected_value)}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed mb-2">Average terminal value across all paths.</div>
                    <div className="text-[10px] text-zinc-600 bg-white/5 p-2 rounded border border-white/5">
                        <span className="text-indigo-400 font-semibold">Optimal:</span> Higher is better. Usually targets 8-12% annual growth above risk-free rates for equity portfolios.
                    </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">95% Lower Bound</div>
                    <div className="text-2xl font-bold text-rose-400 mb-1">{formatNumber(lower_bound)}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed mb-2">2.5th percentile limit (Severe downturn limit).</div>
                    <div className="text-[10px] text-zinc-600 bg-white/5 p-2 rounded border border-white/5">
                        <span className="text-indigo-400 font-semibold">Insight:</span> In 95% of simulated scenarios, your portfolio will not fall below this value. Essential for downside protection.
                    </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">95% Upper Bound</div>
                    <div className="text-2xl font-bold text-emerald-400 mb-1">{formatNumber(upper_bound)}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed mb-2">97.5th percentile limit (Bull market limit).</div>
                    <div className="text-[10px] text-zinc-600 bg-white/5 p-2 rounded border border-white/5">
                        <span className="text-indigo-400 font-semibold">Insight:</span> Represents the realistic upside potential of your portfolio during strong market conditions.
                    </div>
                </Card>

                <Card className="bg-zinc-900 border-amber-500/20">
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">Value at Risk (95%)</div>
                    <div className="text-2xl font-bold text-amber-400 mb-1">{formatNumber(var_95)}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed mb-2">Max expected loss relative to initial investment.</div>
                    <div className="text-[10px] text-zinc-600 bg-white/5 p-2 rounded border border-white/5">
                        <span className="text-indigo-400 font-semibold">Optimal:</span> For a balanced profile, VaR should typically not exceed 10-15% of your total invested capital.
                    </div>
                </Card>
            </div>

            <Card className="relative">
                <div className="absolute top-6 right-6 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
                    1,000,000 Simulations
                </div>
                <SectionTitle title="Monte Carlo Paths" subtitle="Geometric Brownian Motion (252 Trading Days)" />

                <div className="h-[400px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#52525b"
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                tickLine={false}
                                tickFormatter={(value) => `${value / 1000}k`}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#e4e4e7' }}
                                formatter={(value: any) => formatNumber(Number(value))}
                                labelFormatter={(label) => `Day ${label}`}
                            />
                            {sample_paths.map((_: any, idx: number) => (
                                <Line
                                    key={`path-${idx}`}
                                    type="monotone"
                                    dataKey={`path${idx}`}
                                    stroke={idx === 0 ? '#6366f1' : 'rgba(99, 102, 241, 0.15)'}
                                    strokeWidth={idx === 0 ? 3 : 1}
                                    dot={false}
                                    activeDot={idx === 0 ? { r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 } : false}
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
