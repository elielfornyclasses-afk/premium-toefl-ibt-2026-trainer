
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (code: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Atalho para facilitar a vida do administrador sem expor um botão público
  const handleLogoClick = () => {
    setCode('INNER-TEST-24H');
  };

  const executeLogin = (accessCode: string) => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      const success = onLogin(accessCode);
      if (!success) {
        setError('Acesso negado. Código inválido ou expirado.');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    executeLogin(code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          {/* O logotipo agora funciona como um botão de preenchimento para o dono do site */}
          <button 
            onClick={handleLogoClick}
            title="Acesso Administrativo"
            className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl shadow-blue-500/30 mx-auto mb-6 italic transform hover:scale-110 active:scale-95 transition-all duration-300"
          >
            IV
          </button>
          <h1 className="text-4xl font-black tracking-tight mb-2 italic">Inner Voice</h1>
          <p className="text-slate-500 font-medium tracking-wide">Portal do Aluno • TOEFL iBT 2026</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">
                Código de Acesso
              </label>
              <input 
                type="text" 
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Insira seu código..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold placeholder:text-slate-800 text-lg tracking-widest uppercase text-center"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold py-4 px-4 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Acessar Plataforma</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
              Consulte seu instrutor para obter<br/>um código de acesso individual.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center opacity-40">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
             © 2026 Inner Voice Method • Secure Access Point
           </p>
        </div>
      </div>
    </div>
  );
};
