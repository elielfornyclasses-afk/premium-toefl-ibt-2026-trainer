
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (code: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const executeLogin = (accessCode: string) => {
    setIsLoading(true);
    setError('');
    
    // Simula processamento para feedback visual
    setTimeout(() => {
      const success = onLogin(accessCode);
      if (!success) {
        setError('Acesso negado. Código inválido.');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    executeLogin(code);
  };

  const handleAdminShortcut = () => {
    setCode('INNER-TEST-24H');
    executeLogin('INNER-TEST-24H');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      {/* Decoração de Fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl shadow-blue-500/20 mx-auto mb-6 italic">IV</div>
          <h1 className="text-4xl font-black tracking-tight mb-2 italic">Inner Voice</h1>
          <p className="text-slate-500 font-medium">Portal do Aluno • TOEFL 2026</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Código de Acesso</label>
              <input 
                type="text" 
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Insira seu código..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold placeholder:text-slate-800 text-lg tracking-wide uppercase"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold py-4 px-4 rounded-2xl text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={handleAdminShortcut}
              type="button"
              className="group flex flex-col items-center mx-auto space-y-2"
            >
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">
                Acesso Privilegiado
              </span>
              <span className="text-xs font-bold text-blue-500/80 bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
                Painel Administrativo
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
