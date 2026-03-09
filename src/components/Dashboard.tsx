import { Card, SectionTitle } from '@/components/ui';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { InfoTooltip } from './ui';
import { ShieldCheck, AlertTriangle, Activity } from 'lucide-react';

export default function Dashboard({ analysis }: { analysis: any }) {
    if (!analysis) return null;

    const { score, beta, risk_decomposition, sectors } = analysis;

    // Format sector data for pie chart
    const sectorData = Object.entries(sectors.allocations).map(([name, value]) => ({
        name,
        value: Math.round((value as number) * 100),
    }));

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

    // Risk Score UI Color Logic
    const getScoreColor = (value: number) => {
        if (value >= 70) return 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]';
        if (value >= 50) return 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]';
        return 'text-rose-400 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]';
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">

            {/* Top row: Score and Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Risk Score Widget */}
                <Card className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-zinc-900 to-black">
                    <SectionTitle title="Portfolio Score" subtitle="Holistic 0-100 Rating" />
                    <div className={`text-6xl font-black mb-2 ${getScoreColor(score.score)}`}>
                        {score.score.toFixed(0)}
                    </div>
                    <div className="text-sm font-medium px-4 py-1.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest text-zinc-300 mb-4">
                        {score.risk_level}
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="text-xs text-zinc-500 text-left w-full">
                            <span className="text-indigo-400 font-semibold block mb-1">What is this?</span>
                            A holistic 0-100 rating combining Beta, Volatility, and Sector Diversification.
                            A score &gt; 70 indicates a historically optimal balance of risk vs reward.
                        </div>
                    </div>
                </Card>

                {/* Beta & Volatility */}
                <Card className="md:col-span-2 grid grid-cols-2 gap-8 items-center bg-zinc-900/50">
                    <div>
                        <div className="text-zinc-400 text-sm mb-1 uppercase tracking-wider font-semibold">Portfolio Beta</div>
                        <div className="text-4xl font-bold text-white mb-2">{beta.portfolio_beta.toFixed(2)}</div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Measures volatility against the market (NIFTY 50 = 1.0).
                            <span className="text-indigo-400 block mt-1 mb-2">
                                {beta.portfolio_beta > 1.2 ? 'Highly Aggressive' :
                                    beta.portfolio_beta < 0.8 ? 'Defensive' : 'Market Neutral'}
                            </span>
                        </p>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="text-[10px] text-zinc-400">
                                <span className="text-indigo-400 font-semibold">Optimal Range:</span> 0.8 - 1.2 for most investors. Higher values (&gt; 1.2) mean outsized gains/losses. Lower values (&lt; 0.8) offer stability but lower expected returns.
                            </div>
                        </div>
                    </div>

                    <div className="border-l border-white/10 pl-8">
                        <div className="text-zinc-400 text-sm mb-1 uppercase tracking-wider font-semibold">Annual Volatility</div>
                        <div className="text-4xl font-bold text-white mb-2">{(risk_decomposition.portfolio.total_risk * 100).toFixed(1)}%</div>
                        <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                            Standard deviation of daily returns annualized.
                            <span className="block mt-1">
                                Market: {(risk_decomposition.portfolio.market_risk * 100).toFixed(1)}% |
                                Idio: {(risk_decomposition.portfolio.idiosyncratic_risk * 100).toFixed(1)}%
                            </span>
                        </p>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="text-[10px] text-zinc-400">
                                <span className="text-indigo-400 font-semibold">Optimal Range:</span> 10% - 15% for balanced portfolios. Above 20% indicates high short-term price swings. (Market risk = systematic; Idio = asset-specific).
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Second Row: Allocations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Sector Allocation Chart */}
                <Card>
                    <SectionTitle title="Sector Exposure" />
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sectorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e4e4e7' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Sector Recommendations */}
                <Card>
                    <SectionTitle title="Sector Insights" subtitle="Based on broad market benchmarks" />
                    <div className="space-y-6 mt-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 group hover:bg-white/10 transition-colors">
                            <h4 className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Overexposed (&gt;40%)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {sectors.recommendations.overexposed.length > 0 ? (
                                    sectors.recommendations.overexposed.map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm">{s}</span>
                                    ))
                                ) : (
                                    <span className="text-sm text-zinc-500 italic">No overexposed sectors detected.</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 group hover:bg-white/10 transition-colors">
                            <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Missing Key Sectors
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {sectors.recommendations.underexposed.length > 0 ? (
                                    sectors.recommendations.underexposed.map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm">{s}</span>
                                    ))
                                ) : (
                                    <span className="text-sm text-zinc-500 italic">Well diversified across major sectors.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
