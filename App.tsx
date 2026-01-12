
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
  
  // Lista de códigos autorizados persistida no navegador
  const [authorizedCodes, setAuthorizedCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('toefl_authorized_codes');
    const initial = saved ? JSON.parse(saved) : INITIAL_PERMANENT_KEYS;
    // Garante que o código mestre sempre esteja na lista
    if (!initial.includes('INNER-TEST-24H')) {
      initial.push('INNER-TEST-24H');
    }
    return initial;
  });

  // Progresso e estado do usuário atual
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('toefl_trainer_progress');
    return saved ? JSON.parse(saved) : {
      name: '',
      accessCode: '',
      completedWeekIds: [],
      isAdmin: false
    };
  });

  const [newCode, setNewCode] = useState('');

  // Sincroniza códigos autorizados com o localStorage
  useEffect(() => {
    localStorage.setItem('toefl_authorized_codes', JSON.stringify(authorizedCodes));
  }, [authorizedCodes]);

  // Checagem de sessão existente ao carregar
  useEffect(() => {
    if (progress.accessCode && authorizedCodes.includes(progress.accessCode)) {
      setIsAuthenticated(true);
    }
  }, []);

  // Salva progresso do aluno
  useEffect(() => {
    localStorage.setItem('toefl_trainer_progress', JSON.stringify(progress));
  }, [progress]);

  const handleLogin = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    if (authorizedCodes.includes(upperCode)) {
      const isAdmin = upperCode === 'INNER-TEST-24H';
      setProgress(prev => ({ 
        ...prev, 
        accessCode: upperCode,
        isAdmin: isAdmin
      }));
      setIsAuthenticated(true);
      // Se for admin, redireciona para a aba de alunos automaticamente
      if (isAdmin) setCurrentView('admin');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setProgress({ name: '', accessCode: '', completedWeekIds: [], isAdmin: false });
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const addAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase();
    if (cleanCode && !authorizedCodes.includes(cleanCode)) {
      setAuthorizedCodes(prev => [...prev, cleanCode]);
      setNewCode('');
    }
  };

  const removeAccessCode = (code: string) => {
    if (code === 'INNER-TEST-24H') return; // Não permite remover o mestre
    setAuthorizedCodes(prev => prev.filter(c => c !== code));
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Alunos</h2>
                <p className="text-slate-500 font-medium">Controle quem tem acesso à plataforma TOEFL 2026.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Novo Acesso</h3>
                  <form onSubmit={addAccessCode} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Código de Aluno</label>
                      <input 
                        type="text"
                        placeholder="EX: ALUNO-JOAO-2025"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-[0.98]">
                      Gerar Acesso
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">
                    Dica: Use nomes fáceis para os alunos lembrarem, como "TURMA-A-01".
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Códigos Ativos ({authorizedCodes.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {authorizedCodes.map(code => (
                      <div key={code} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-5">
                          <div className={`w-3 h-3 rounded-full ${code === 'INNER-TEST-24H' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-green-500'}`}></div>
                          <div>
                            <span className="font-mono font-black text-slate-700 text-xl tracking-tight">{code}</span>
                            {code === 'INNER-TEST-24H' && (
                              <div className="flex gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Administrador</span>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Chave Mestra</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {code !== 'INNER-TEST-24H' && (
                          <button 
                            onClick={() => removeAccessCode(code)}
                            className="bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all p-3 rounded-xl"
                            title="Excluir Acesso"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {authorizedCodes.length === 0 && (
                      <div className="p-20 text-center">
                        <p className="text-slate-400 font-bold">Nenhum código cadastrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="max-w-4xl mx-auto py-10">
            <h2 className="text-3xl font-black mb-8">Análise de Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <h3 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Módulos Concluídos</h3>
                <p className="text-5xl font-black text-slate-900">{progress.completedWeekIds.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <h3 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Domínio do Curso</h3>
                <p className="text-5xl font-black text-blue-600">{Math.round((progress.completedWeekIds.length / 24) * 100)}%</p>
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
