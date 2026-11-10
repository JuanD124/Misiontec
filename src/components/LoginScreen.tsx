import React, { useState } from 'react';
import { Cross, LogIn, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { SesionUsuario } from '../types';

interface LoginScreenProps {
  onLogin: (sesion: SesionUsuario) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [documento, setDocumento] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      onLogin(await api.login(documento.trim(), contrasena));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      <div className="lg:w-1/2 bg-[#0A0A0A] text-white flex flex-col justify-between p-8 lg:p-14">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#262626] border border-[#404040] flex items-center justify-center text-[#FDBA74]">
            <Cross className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-wide">MISION<span className="text-[#FDBA74]">TEC</span></span>
        </div>

        <div className="py-10 lg:py-0">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            Cuidado y seguimiento <span className="text-[#FB923C]">de cada discípulo</span>
          </h1>
          <p className="mt-4 text-sm text-[#D4D4D4] max-w-md leading-relaxed">
            Grupos de comunión, asistencia, formación y acompañamiento pastoral en un solo lugar.
          </p>
        </div>

        <p className="hidden lg:block text-xs text-[#A3A3A3] italic">«Apacienta mis ovejas» — Juan 21:17</p>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-14">
        <form onSubmit={entrar} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-[#0A0A0A]">Iniciar sesión</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Entra con tu documento y tu contraseña.</p>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="documento" className="block text-xs font-semibold text-[#0A0A0A] mb-1.5">Documento de identidad</label>
            <input
              id="documento"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              autoFocus
              required
              value={documento}
              onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
              placeholder="Tu número de documento"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D4D4D4] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-xs font-semibold text-[#0A0A0A] mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                id="contrasena"
                type={verClave ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-[#D4D4D4] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
              />
              <button
                type="button"
                onClick={() => setVerClave(!verClave)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A]"
                title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {enviando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{enviando ? 'Entrando…' : 'Entrar'}</span>
          </button>

          <p className="flex items-start gap-2 text-[11px] text-[#6B6B6B] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#EA580C] shrink-0" />
            Si todavía no tienes acceso, pídele al pastor que te cree uno.
          </p>
        </form>
      </div>
    </div>
  );
};
