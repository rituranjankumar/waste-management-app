"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const months = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function MonthlyChart({ data }) {
  if (!data) return null;

  const formatted = data?.map((item) => ({
    name: months[item.month],
    tasks: item.totalTasks,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={formatted}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="tasks" fill="#16a34a" maxBarSize={50} />
      </BarChart>
    </ResponsiveContainer>
  );
}
