import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface DeFiPoolVizProps {
  tokenA: number;
  tokenB: number;
  k: number;
}

const DeFiPoolViz: React.FC<DeFiPoolVizProps> = ({ tokenA, tokenB, k }) => {
  const data = useMemo(() => {
    const points = [];
    // Center the view around the current tokenA, but ensure we show a good curve range
    // Range: [0.25 * current, 4 * current] seems reasonable to show the hyperbolic shape
    const minX = Math.max(1, tokenA * 0.2);
    const maxX = Math.max(tokenA * 4, 100); // Ensure some range even if small

    // Create smooth curve points
    const steps = 100;
    // Use logarithmic scale for steps to get better distribution at lower values if needed,
    // but linear steps are fine for this range.
    const stepSize = (maxX - minX) / steps;

    for (let i = 0; i <= steps; i++) {
      const x = minX + i * stepSize;
      const y = k / x;
      points.push({ x, y });
    }
    return points;
  }, [tokenA, k]);

  return (
    <div className="bg-secondary-bg/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-6 text-text-primary">Constant Product AMM (x * y = k)</h3>

      <div className="h-[250px] md:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="x"
              type="number"
              domain={['dataMin', 'dataMax']}
              label={{ value: 'Token A Reserve', position: 'bottom', offset: 0, fill: '#9ca3af' }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0)}
              stroke="#4b5563"
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={['dataMin', 'dataMax']}
              label={{ value: 'Token B Reserve', angle: -90, position: 'insideLeft', fill: '#9ca3af', offset: 10 }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0)}
              stroke="#4b5563"
            />
            <Tooltip
              formatter={(value: number) => [value.toFixed(2), '']}
              labelFormatter={(label: number) => `Token A: ${label.toFixed(2)}`}
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
              activeDot={false}
              isAnimationActive={false} // Disable line animation to prevent jumping, we want dot to move
            />
            <ReferenceDot
              x={tokenA}
              y={tokenB}
              r={6}
              fill="#ec4899"
              stroke="#fff"
              strokeWidth={2}
              isFront={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-tertiary-bg/50 p-4 rounded-xl border border-white/5">
          <div className="text-sm text-text-secondary mb-1">Price (1 A = ? B)</div>
          <div className="text-xl font-bold text-accent">{(tokenB / tokenA).toFixed(4)} B</div>
        </div>
        <div className="bg-tertiary-bg/50 p-4 rounded-xl border border-white/5">
          <div className="text-sm text-text-secondary mb-1">Constant (k)</div>
          <div className="text-xl font-bold text-white">{k.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-tertiary-bg/50 p-4 rounded-xl border border-white/5">
          <div className="text-sm text-text-secondary mb-1">Total Liquidity</div>
          <div className="text-xl font-bold text-success">{(tokenA + tokenB).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  );
};

export default DeFiPoolViz;
