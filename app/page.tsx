"use client";

import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Trash2,
  Calendar,
  LogOut,
  Edit2,
  AlertCircle,
  Loader2,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { z } from "zod";

import LoginScreen from "./login";
import StatsCards from "./components/StatsCards";
import MainChart from "./components/MainChart";

interface MealData {
  id: string;
  description: string;
  calories: number;
  date: string;
  time: string;
  type: "Café" | "Almoço" | "Lanche" | "Jantar" | "Ceia";
  userId?: string;
}

interface FastData {
  id: string;
  startTime: string;
  plannedType: string;
  endTime: string | null;
  duration?: string;
  userId?: string;
}

interface UserAuth {
  uid: string;
  email: string | null;
}

const mealSchema = z.object({
  description: z.string().min(2, "Descrição muito curta"),
  calories: z.number().min(1, "Mínimo 1 kcal"),
  date: z.string(),
  time: z.string(),
  type: z.enum(["Café", "Almoço", "Lanche", "Jantar", "Ceia"]),
});

export default function FitTrackApp() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserAuth | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [fasts, setFasts] = useState<FastData[]>([]);
  const [activeFast, setActiveFast] = useState<FastData | null>(null);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealData | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser({ uid: u.uid, email: u.email });
        try {
          const goalSnap = await getDoc(doc(db, "userSettings", u.uid));
          if (goalSnap.exists()) setDailyGoal(goalSnap.data().dailyGoal);

          const qMeals = query(
            collection(db, "meals"),
            where("userId", "==", u.uid)
          );
          onSnapshot(qMeals, (snap) =>
            setMeals(
              snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealData))
            )
          );

          const qFasts = query(
            collection(db, "fasts"),
            where("userId", "==", u.uid)
          );
          onSnapshot(qFasts, (snap) => {
            const allFasts = snap.docs.map(
              (d) => ({ id: d.id, ...d.data() } as FastData)
            );
            setFasts(allFasts);
            setActiveFast(allFasts.find((f) => !f.endTime) || null);
          });
        } catch {
          setError("Erro de conexão com o banco.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  const exportToJSON = () => {
    try {
      if (!user) return;
      const data = {
        projeto: "trabalho final Jejum",
        usuario: user.email,
        exportadoEm: new Date().toLocaleString("pt-BR"),
        meta: dailyGoal,
        refeicoes: meals.map((m) => {
          const { id, userId, ...rest } = m;
          return rest;
        }),
        jejuns: fasts
          .filter((f) => f.endTime)
          .map((f) => {
            const { id, userId, ...rest } = f;
            return rest;
          }),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trabalho-final-jejum-backup.json`;

      document.body.appendChild(link);
      setTimeout(() => {
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch {
      alert("Erro ao exportar o arquivo.");
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const saveDailyGoal = async () => {
    if (!user) return;
    await setDoc(
      doc(db, "userSettings", user.uid),
      { dailyGoal },
      { merge: true }
    );
    setShowGoalModal(false);
  };

  const chartData = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().split("T")[0];
      return {
        day: d.toLocaleDateString("pt-BR", { weekday: "short" }),
        cals: meals
          .filter((m) => m.date?.startsWith(ds))
          .reduce((acc, m) => acc + m.calories, 0),
        fastHours: fasts
          .filter((f) => f.endTime?.startsWith(ds))
          .reduce((acc, f) => acc + Number(f.duration || 0), 0),
      };
    });
  }, [meals, fasts]);

  const filteredMeals = meals.filter((m) => m.date?.startsWith(filterDate));
  const totalCals = filteredMeals.reduce((acc, m) => acc + m.calories, 0);

  if (!mounted || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2
          className="animate-spin text-indigo-600 dark:text-indigo-400"
          size={40}
        />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const handleSubmitMeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const mealType = fd.get("type") as string;
    const finalType = ["Café", "Almoço", "Lanche", "Jantar", "Ceia"].includes(
      mealType
    )
      ? (mealType as "Café" | "Almoço" | "Lanche" | "Jantar" | "Ceia")
      : "Almoço";

    const raw = {
      description: fd.get("description") as string,
      calories: Number(fd.get("calories")),
      date: fd.get("date") as string,
      time: fd.get("time") as string,
      type: finalType,
    };
    const result = mealSchema.safeParse(raw);
    if (!result.success) return setError(result.error.issues[0].message);

    const finalData = {
      ...result.data,
      userId: user.uid,
      date: `${result.data.date}T${result.data.time}`,
    };
    if (editingMeal) {
      await updateDoc(doc(db, "meals", editingMeal.id), finalData);
    } else {
      await addDoc(collection(db, "meals"), finalData);
    }
    setShowMealModal(false);
    setEditingMeal(null);
  };

  return (
    <div
      className={`${
        darkMode
          ? "dark bg-slate-900 text-slate-100"
          : "bg-slate-50 text-slate-900"
      } min-h-screen transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 dark:shadow-none">
              J
            </div>
            <h1 className="font-black text-slate-800 dark:text-white hidden sm:block uppercase tracking-tighter italic">
              trabalho final Jejum
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={exportToJSON}
              title="Baixar JSON"
              className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => signOut(auth)}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors ml-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <StatsCards
          totalCals={totalCals}
          dailyGoal={dailyGoal}
          chartData={chartData}
          activeFast={activeFast}
          onOpenGoal={() => setShowGoalModal(true)}
          onStartFast={(t: string) =>
            addDoc(collection(db, "fasts"), {
              userId: user.uid,
              startTime: new Date().toISOString(),
              plannedType: t,
              endTime: null,
            })
          }
          onEndFast={async () => {
            if (!activeFast) return;
            const duration = (
              (new Date().getTime() -
                new Date(activeFast.startTime).getTime()) /
              3600000
            ).toFixed(2);
            await updateDoc(doc(db, "fasts", activeFast.id), {
              endTime: new Date().toISOString(),
              duration,
            });
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <MainChart data={chartData} dailyGoal={dailyGoal} />
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400">
                Refeições
              </h3>
              <Calendar
                className="text-slate-300 dark:text-slate-500"
                size={16}
              />
            </div>

            <div className="mb-4">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs border border-transparent focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
              {filteredMeals.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all"
                >
                  <div>
                    <p className="font-bold text-sm dark:text-slate-200">
                      {m.description}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      {m.type} • {m.calories} kcal
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingMeal(m);
                        setShowMealModal(true);
                      }}
                      className="text-indigo-600 dark:text-indigo-400"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Excluir esta refeição?"))
                          deleteDoc(doc(db, "meals", m.id));
                      }}
                      className="text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredMeals.length === 0 && (
                <p className="text-center py-10 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase italic">
                  Sem registros para este dia
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setEditingMeal(null);
                setShowMealModal(true);
              }}
              className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-colors"
            >
              + Novo Registro
            </button>
          </div>
        </div>

        {showMealModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleSubmitMeal}
              className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[3rem] w-full max-w-md shadow-2xl transition-colors duration-300 border border-transparent dark:border-slate-700"
            >
              <h2 className="text-2xl font-black mb-6 uppercase italic text-slate-800 dark:text-white tracking-tighter">
                {editingMeal ? "Editar Registro" : "Novo Registro"}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl text-[10px] font-black flex items-center gap-2 uppercase">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={
                      editingMeal ? editingMeal.date.split("T")[0] : filterDate
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs dark:text-white"
                  />
                  <input
                    name="time"
                    type="time"
                    required
                    defaultValue={
                      editingMeal ? editingMeal.date.split("T")[1] : "12:00"
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs dark:text-white"
                  />
                </div>
                <input
                  name="description"
                  placeholder="O que você comeu?"
                  required
                  defaultValue={editingMeal?.description}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs dark:text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="calories"
                    type="number"
                    placeholder="Kcal"
                    required
                    defaultValue={editingMeal?.calories}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs dark:text-white"
                  />
                  <select
                    name="type"
                    defaultValue={editingMeal?.type || "Almoço"}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-[10px] uppercase dark:text-white"
                  >
                    <option value="Café">☕ Café</option>
                    <option value="Almoço">🥗 Almoço</option>
                    <option value="Lanche">🥪 Lanche</option>
                    <option value="Jantar">🍲 Jantar</option>
                    <option value="Ceia">🥛 Ceia</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowMealModal(false)}
                  className="flex-1 font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase transition-colors hover:text-slate-600"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}

        {showGoalModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl text-center border border-transparent dark:border-slate-700 transition-colors duration-300">
              <h2 className="text-xl font-black mb-4 uppercase italic dark:text-white tracking-tighter">
                META DIÁRIA
              </h2>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-3xl outline-none font-black text-center text-3xl text-indigo-600 dark:text-indigo-400 mb-6"
              />
              <button
                onClick={saveDailyGoal}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
