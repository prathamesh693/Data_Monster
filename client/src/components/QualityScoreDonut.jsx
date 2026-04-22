import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function QualityScoreDonut({ score = 0 }) {
  const getScoreColor = (val) => {
    if (val > 80) return "#10b981"; // Green
    if (val > 60) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  const data = [
    { name: "Score", value: score, color: getScoreColor(score) },
  ];

  const backgroundData = [
    { name: "Full", value: 100 },
  ];

  return (
    <div className="h-[280px] w-full relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <span className="text-3xl font-black" style={{ color: getScoreColor(score) }}>{score}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Quality Health</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Background Arc */}
          <Pie
            data={backgroundData}
            cx="50%"
            cy="70%"
            innerRadius={75}
            outerRadius={95}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill="var(--bg-toggle)" />
          </Pie>
          {/* Value Arc */}
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            innerRadius={75}
            outerRadius={95}
            startAngle={180}
            endAngle={180 - (score * 1.8)}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            animationDuration={1500}
            animationBegin={200}
          >
            <Cell fill={getScoreColor(score)} className="transition-all duration-500 hover:opacity-80 cursor-pointer" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default QualityScoreDonut;
