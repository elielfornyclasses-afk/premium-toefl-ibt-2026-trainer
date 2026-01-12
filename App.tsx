
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TrainerSession } from './components/TrainerSession';
import { Login } from './components/Login';
import { ViewType, WeekData, UserProgress } from './types';
import { COURSE_PHASES } from './constants';
import { INITIAL_PERMANENT_KEYS } from './data/access';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1);
  
  const authorizedCodes = INITIAL_PERMANENT_KEYS;
  const MASTER_ADMIN_KEY = 'INNER-TEST-24H';

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('toefl_trainer_progress');
    return saved ? JSON.parse(saved) : {
      name: '',
      accessCode: '',
      completedWeekIds: [],
      isAdmin: false
    };
  });

  useEffect(() => {
    if (progress.accessCode) {
      const isValid = authorizedCodes.includes(progress.accessCode);
      if (isValid) {
        setIsAuthenticated(true);
        const isAdmin = progress.accessCode === MASTER_ADMIN_KEY;
        if (progress.isAdmin !== isAdmin) {
          setProgress(prev => ({ ...prev, isAdmin }));
        }
      } else {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('toefl_trainer_progress', JSON.stringify(progress));
  }, [progress]);

  const handleLogin = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    
    if (authorizedCodes.includes(upperCode)) {
      const isAdmin = upperCode === MASTER_ADMIN_KEY;
      
      setProgress(prev => ({ 
        ...prev, 
        accessCode: upperCode,
        isAdmin: isAdmin
      }));
      
      setIsAuthenticated(true);
      setCurrentView(isAdmin ? 'admin' : 'dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setProgress({ name: '', accessCode: '', completedWeekIds: [], isAdmin: false });
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    localStorage.removeItem('toefl_trainer_progress');
  };

  const startSession = (week: WeekData, phaseId: number) => {
    setSelectedWeek(week);
    setSelectedPhaseId(phaseId);
    setCurrentView('session');
  };

  const markWeekComplete = (id: number) => {
    if (!progress.completedWeekIds.includes(id)) {
      setProgress(prev => ({
        ...prev,
        completedWeekIds: [...prev.completedWeekIds, id]
      }));
    }
  };

  const updateName = (name: string) => setProgress(prev => ({ ...prev, name }));

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            phases={COURSE_PHASES} 
            progress={progress}
            onSelectWeek={startSession} 
            onToggleAdmin={() => setCurrentView('admin')}
          />
        );
      case 'session':
        return selectedWeek ? (
          <TrainerSession 
            week={selectedWeek} 
            phaseId={selectedPhaseId} 
            onExit={() => setCurrentView('dashboard')} 
            onComplete={() => markWeekComplete(selectedWeek.id)}
          />
        ) : <Dashboard phases={COURSE_PHASES} progress={progress} onSelectWeek={startSession} onToggleAdmin={() => {}} />;
      case 'admin':
        return (
          <div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Inner Circle</h2>
                  <p className="text-slate-500 font-medium mt-2">Gestão Estratégica de Alunos</p>
                </div>
                <div className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                  Administrador
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Fluxo de Cadastro</h3>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Este sistema opera via <span className="font-bold text-slate-900">Configuração como Código</span>. Para adicionar alunos de forma segura e permanente:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">1</div>
                        <span className="text-xs font-bold text-slate-700">Abra o arquivo <code className="bg-slate-200 px-1 rounded text-blue-600">data/access.ts</code> no GitHub.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">2</div>
                        <span className="text-xs font-bold text-slate-700">Adicione o código do aluno na lista de chaves.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">3</div>
                        <span className="text-xs font-bold text-slate-700">Faça o Commit. O Netlify atualizará em segundos.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Alunos com Acesso ({authorizedCodes.length})</h3>
                  <div className="bg-white border rounded-3xl divide-y overflow-hidden max-h-[440px] overflow-y-auto shadow-sm">
                    {authorizedCodes.map(code => (
                      <div key={code} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${code === MASTER_ADMIN_KEY ? 'bg-blue-600' : 'bg-green-500'}`}></div>
                          <span className="font-mono font-black text-slate-700 tracking-tighter">{code}</span>
                        </div>
                        {code === MASTER_ADMIN_KEY ? (
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Master</span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ativo</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-700">
            <h2 className="text-4xl font-black mb-10 tracking-tight italic">Performance Insight</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" /></svg>
                </div>
                <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Módulos Concluídos</h3>
                <p className="text-7xl font-black text-slate-900 leading-none">{progress.completedWeekIds.length}</p>
                <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  <span>Progresso Constante</span>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-20 h-20 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L20.55 19H3.45L12 5.45z" /></svg>
                </div>
                <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Nível de Domínio</h3>
                <p className="text-7xl font-black text-blue-500 leading-none">{Math.round((progress.completedWeekIds.length / 24) * 100)}%</p>
                <div className="mt-6 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(progress.completedWeekIds.length / 24) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard phases={COURSE_PHASES} progress={progress} onSelectWeek={startSession} onToggleAdmin={() => {}} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      progress={progress}
      onUpdateName={updateName}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
