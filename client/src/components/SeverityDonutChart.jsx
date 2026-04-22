import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function SeverityDonutChart({ data = {}, onSegmentClick }) {
  const chartData = [
    { name: "Critical", value: data.critical || 0, color: "#ef4444" },
    { name: "Error", value: data.error || 0, color: "#f97316" },
    { name: "Warning", value: data.warning || 0, color: "#eab308" },
    { name: "Info", value: data.info || 0, color: "#3b82f6" },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-[300px] w-full relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '42%', transform: 'translateY(-50%)' }}>
        <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>{total}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Total Issues</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            onClick={(data) => onSegmentClick && onSegmentClick(data.name)}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
            animationDuration={1000}
            animationBegin={300}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontSize: "12px"
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SeverityDonutChart;
