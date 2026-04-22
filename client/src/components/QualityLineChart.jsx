import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceDot,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl border bg-subtle shadow-xl backdrop-blur-md" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border-default)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs font-medium text-secondary">Quality Score</span>
            <span className="text-xs font-black text-primary">{data.quality}%</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs font-medium text-secondary">Total Rows</span>
            <span className="text-xs font-bold text-secondary">{data.rows?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs font-medium text-secondary">Failed Checks</span>
            <span className={`text-xs font-bold ${data.failed > 0 ? 'text-error' : 'text-success'}`}>{data.failed}</span>
          </div>
        </div>
        {data.anomaly && (
          <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-2 text-[10px] font-bold text-error uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            Anomaly Detected
          </div>
        )}
      </div>
    );
  }
  return null;
};

function QualityLineChart({ data = [], compareData = [] }) {
  const chartData = data.map(item => ({
    ...item,
    name: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) : item.name,
    quality: item.score || item.quality,
    compareQuality: compareData.find(c => c.date === item.date)?.score || null
  }));

  const anomalies = chartData.filter(d => d.anomaly);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.1} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {compareData.length > 0 && (
            <Area
              type="monotone"
              dataKey="compareQuality"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorCompare)"
            />
          )}

          <Area
            type="monotone"
            dataKey="quality"
            stroke="#06b6d4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorQuality)"
            animationDuration={1500}
          />

          {anomalies.map((entry, index) => (
            <ReferenceDot
              key={`anomaly-${index}`}
              x={entry.name}
              y={entry.quality}
              r={6}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
              isFront={true}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default QualityLineChart;
