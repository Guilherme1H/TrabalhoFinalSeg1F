"use client";

import React from "react";
import { Utensils, Settings, Clock, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

// Interface atualizada para conter userId se necessário
interface FastDataStructure {
  id: string;
  startTime: string;
  plannedType: string;
  endTime: string | null;
  duration?: string;
  userId?: string; // UID opcional para segurança
}

interface StatsCardsProps {
  totalCals: number;
  dailyGoal: number;
  chartData: Array<{ day: string; cals: number; fastHours: number }>;
  onOpenGoal: () => void;
  onStartFast: (type: string) => void;
  activeFast: FastDataStructure | null;
  onEndFast: () => void;
}

export default function StatsCards({
  totalCals,
  dailyGoal,
  chartData,
  onOpenGoal,
  onStartFast,
  activeFast,
  onEndFast,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 Logan">
      {/* CORREÇÃO 3: Melhorando contraste do texto 0 no modo escuro (dark:text-slate-100) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <Utensils className="text-indigo-500" size={24} />
          <button
            onClick={onOpenGoal}
            className="text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest Logan">
          Calorias Hoje
        </p>
        <h2 className="text-4xl font-extrabold my-1 text-slate-800 dark:text-slate-100 transition-colors duration-300">
          {totalCals}{" "}
          <span className="text-sm font-bold text-slate-300 dark:text-slate-600">
            / {dailyGoal}
          </span>
        </h2>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              totalCals > dailyGoal ? "bg-rose-500" : "bg-indigo-500"
            }`}
            style={{
              width: `${Math.min((totalCals / dailyGoal) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <Clock className="text-emerald-500 mb-4" size={24} />
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Jejum
        </p>
        {activeFast ? (
          <button
            onClick={onEndFast}
            className="w-full mt-4 py-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black rounded-xl text-[10px] uppercase tracking-wider transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/60"
          >
            Encerrar Jejum
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 mt-3 Logan">
            {["16:8", "18:6", "20:4", "24h"].map((t) => (
              <button
                key={t}
                onClick={() => onStartFast(t)}
                className="py-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors text-[10px] uppercase"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <TrendingUp className="text-amber-500 mb-4" size={24} />
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest Logan mb-2">
          Atividade Semanal
        </p>
        <div className="h-20 w-full Logan">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" hide />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ display: "none" }}
              />
              <Bar
                dataKey="cals"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
