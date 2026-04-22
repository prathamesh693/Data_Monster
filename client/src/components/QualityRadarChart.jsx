import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function QualityRadarChart({ data = {} }) {
  const chartData = [
    { subject: "Completeness", value: data.completeness || 0, fullMark: 100 },
    { subject: "Timeliness", value: data.timeliness || 0, fullMark: 100 },
    { subject: "Uniqueness", value: data.uniqueness || 0, fullMark: 100 },
    { subject: "Consistency", value: data.consistency || 0, fullMark: 100 },
    { subject: "Validity", value: data.validity || 0, fullMark: 100 },
  ];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#1e293b" opacity={0.2} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "12px"
            }}
          />
          <Radar
            name="Quality"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default QualityRadarChart;
