
import React from 'react';
import { ViewType, UserProgress } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  progress: UserProgress;
  onUpdateName: (name: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, progress, onUpdateName, onLogout }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-blue-500/20 italic">IV</div>
            <span className="text-slate-100 tracking-tight italic">Inner Voice</span>
          </h1>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2">
          <NavItem 
            active={currentView === 'dashboard'} 
            onClick={() => setView('dashboard')}
            icon={<DashboardIcon />}
            label="Plano de Treino"
          />
          {progress.isAdmin && (
            <NavItem 
              active={currentView === 'admin'} 
              onClick={() => setView('admin')}
              icon={<AdminIcon />}
              label="Gestão de Alunos"
            />
          )}
          <NavItem 
            active={currentView === 'stats'} 
            onClick={() => setView('stats')}
            icon={<ChartIcon />}
            label="Minha Performance"
          />
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-4 mb-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white shrink-0 border-2 border-white/10">
                {progress.name ? progress.name[0].toUpperCase() : (progress.isAdmin ? 'A' : 'S')}
              </div>
              <div className="flex-1 min-w-0">
                <input 
                  type="text" 
                  value={progress.name}
                  onChange={(e) => onUpdateName(e.target.value)}
                  placeholder="Seu nome..."
                  className="bg-transparent text-sm font-bold text-white focus:outline-none w-full border-b border-transparent focus:border-blue-500 pb-0.5 placeholder:text-slate-600"
                />
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mt-0.5">
                  {progress.isAdmin ? 'Administrador' : 'Aluno Verificado'}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full px-4 py-3 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-red-500/10 font-bold flex items-center gap-3 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    <span className={active ? 'text-white' : 'text-slate-500'}>{icon}</span>
    {label}
  </button>
);

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
