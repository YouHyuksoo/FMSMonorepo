"use client";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps {
  data: any[];
  xField?: string;
  yField?: string;
  angleField?: string;
  colorField?: string;
  height?: number;
}

export function LineChart({
  data,
  xField = "date",
  yField = "value",
  height = 300,
}: ChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={yField}
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({
  data,
  xField = "department",
  yField = "value",
  height = 300,
}: ChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yField} fill="#8884d8" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({
  data,
  angleField = "value",
  colorField = "facility",
  height = 300,
}: ChartProps) {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            dataKey={angleField}
            nameKey={colorField}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
