import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function TableCheckBreakdownChart({ data = {} }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-xs text-muted font-bold uppercase tracking-widest bg-subtle rounded-xl border border-dashed border-default">
        No breakdown data available
      </div>
    );
  }

  // data format: { table1: { Structural: 5, Content: 2 }, table2: { Security: 1 } }
  const chartData = Object.entries(data).map(([table, categories]) => ({
    name: table,
    ...categories
  }));

  const categories = Array.from(new Set(
    Object.values(data).flatMap(cat => Object.keys(cat))
  ));

  const colors = {
    Structural: "#3b82f6",
    Content: "#10b981",
    Statistical: "#8b5cf6",
    Security: "#ef4444",
    Operational: "#f59e0b"
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontSize: "12px"
            }}
            cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            formatter={(value) => (
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{value}</span>
            )}
          />
          {categories.map(cat => (
            <Bar 
              key={cat} 
              dataKey={cat} 
              stackId="a" 
              fill={colors[cat] || "#94a3b8"} 
              radius={[0, 0, 0, 0]}
              barSize={32}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TableCheckBreakdownChart;
