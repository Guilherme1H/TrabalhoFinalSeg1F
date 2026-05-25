"use client";

import React, { useState } from "react";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { LogIn, Mail, Lock, UserPlus, LifeBuoy, ArrowLeft } from "lucide-react";

export default function LoginScreen() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setErrorMsg("Falha no login com Google.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      if (authMode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await sendPasswordResetEmail(auth, email);
        alert("E-mail de recuperação enviado!");
        setAuthMode("login");
      }
    } catch (err: any) {
      setErrorMsg("Erro: Verifique os dados inseridos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl mb-4 flex items-center justify-center text-white text-3xl font-black shadow-xl">
            G
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            {authMode === "login"
              ? "Bem-vindo"
              : authMode === "signup"
              ? "Nova Conta"
              : "Recuperar"}
          </h1>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {authMode !== "reset" && (
            <div className="relative">
              <Lock
                className="absolute left-4 top-4 text-slate-300"
                size={18}
              />
              <input
                type="password"
                placeholder="Senha"
                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={authMode === "signup" || authMode === "login"}
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-rose-500 text-[10px] font-black text-center uppercase">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading
              ? "Carregando..."
              : authMode === "login"
              ? "Entrar"
              : authMode === "signup"
              ? "Cadastrar"
              : "Enviar Link"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition uppercase"
          >
            Entrar com Google
          </button>

          <div className="flex justify-center gap-6">
            {authMode === "login" ? (
              <>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600"
                >
                  Criar Conta
                </button>
                <button
                  onClick={() => setAuthMode("reset")}
                  className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600"
                >
                  Esqueci a Senha
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthMode("login")}
                className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Voltar ao Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
