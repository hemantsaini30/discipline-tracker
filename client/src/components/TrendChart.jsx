import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { scoreToColor } from '../utils/scoreColors.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <div className="text-text-muted mb-1">{label}</div>
        <div className="font-mono font-medium" style={{ color: scoreToColor(payload[0].value) }}>
          {payload[0].value}%
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [], height = 120 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(d) => d.slice(5)}
          tick={{ fill: '#55556a', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={6}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#55556a', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={60} stroke="#2a2a32" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
