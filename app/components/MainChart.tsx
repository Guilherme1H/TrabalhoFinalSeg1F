"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function MainChart({ data, dailyGoal }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <h3 className="font-black uppercase tracking-[0.2em] text-[10px] mb-10 text-slate-400 dark:text-slate-500">
        Progresso Semanal (kcal)
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
              className="dark:stroke-slate-700"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: "bold" }}
            />
            <YAxis hide domain={[0, "dataMax + 800"]} />
            <Tooltip
              contentStyle={{
                borderRadius: "20px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              }}
            />
            <ReferenceLine
              y={dailyGoal}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              label={{
                position: "top",
                value: "META",
                fill: "#f43f5e",
                fontSize: 10,
                fontWeight: "bold",
              }}
            />
            <Line
              type="monotone"
              dataKey="cals"
              stroke="#4f46e5"
              strokeWidth={5}
              dot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
