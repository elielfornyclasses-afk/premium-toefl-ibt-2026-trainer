
import React, { useState } from 'react';
import { PhaseData, WeekData, UserProgress } from '../types';

interface DashboardProps {
  phases: PhaseData[];
  progress: UserProgress;
  onSelectWeek: (week: WeekData, phaseId: number) => void;
  onToggleAdmin: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ phases, progress, onSelectWeek, onToggleAdmin }) => {
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState(1);
  
  const totalWeeks = 24;
  const completedCount = progress.completedWeekIds.length;
  const completionPercentage = Math.round((completedCount / totalWeeks) * 100);
  const weeksLeft = totalWeeks - completedCount;

  const activePhase = phases.find(p => p.id === activePhaseId) || phases[0];

  const handleResumeDiagnostic = () => {
    const week1 = phases[0].weeks.find(w => w.id === 1);
    if (week1) onSelectWeek(week1, phases[0].id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      {/* Syllabus Modal */}
      {showSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Plano de Estudos Completo</h3>
              <button onClick={() => setShowSyllabus(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-6">
              {phases.map(p => (
                <div key={p.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded-r-xl pr-4">
                  <h4 className="font-bold text-slate-900">{p.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{p.description} ({p.weeksRange})</p>
                  <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {p.weeks.length} Módulos de Treinamento
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowSyllabus(false)}
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-900">Domínio do TOEFL</h2>
          <p className="text-slate-500 font-medium mt-1">Trilha Premium TOEFL iBT 2026</p>
        </div>
        
        <div className="flex items-center gap-12 bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-600">{completionPercentage}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progresso</span>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-slate-900">{weeksLeft}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Semanas</span>
          </div>
        </div>
      </section>

      {/* Admin Quick Link - VISÍVEL APENAS PARA QUEM LOGAR COM A CHAVE MESTRA */}
      {progress.isAdmin && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <button 
            onClick={onToggleAdmin}
            className="w-full bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-black transition-all shadow-xl shadow-slate-900/10"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white italic tracking-tight">Painel Administrativo</h3>
                <p className="text-slate-500 font-medium text-sm">Gerenciar acessos e visualizar base de alunos</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7" /></svg>
            </div>
          </button>
        </section>
      )}

      {/* Phase Selection Tabs */}
      <section>
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhaseId(phase.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activePhaseId === phase.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Fase {phase.id}
            </button>
          ))}
        </div>

        {/* Active Phase Display */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/10">
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">
                Foco Atual: {activePhase.weeksRange}
              </span>
              <h3 className="text-2xl font-bold mb-2">{activePhase.title}</h3>
              <p className="text-blue-100 font-medium max-w-xl">{activePhase.description}</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <PhaseIcon id={activePhaseId} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePhase.weeks.map((week) => {
              const isCompleted = progress.completedWeekIds.includes(week.id);
              return (
                <button
                  key={week.id}
                  onClick={() => onSelectWeek(week, activePhase.id)}
                  className={`group p-6 rounded-3xl text-left transition-all duration-300 border-2 bg-white border-white shadow-sm hover:border-blue-500 hover:shadow-xl hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      S{week.id}
                    </div>
                    {isCompleted && <CheckIcon />}
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {week.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {week.objective}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-slate-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-4xl font-black mb-6 leading-tight tracking-tight">Pronto para quebrar a barreira?</h2>
            <p className="text-slate-400 text-lg mb-0 font-medium leading-relaxed">
              Não estude apenas. Transforme seu pensamento. Acesse o currículo completo de 24 semanas agora.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={handleResumeDiagnostic}
              className="bg-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 active:scale-95 text-center"
            >
              Retomar Treino
            </button>
            <button 
              onClick={() => setShowSyllabus(true)}
              className="bg-white/10 backdrop-blur px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition border border-white/10 active:scale-95 text-center"
            >
              Ver Currículo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const PhaseIcon = ({ id }: { id: number }) => {
  const icons = [
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3.5A1.5 1.5 0 0 0 18.5 2h-12A2.5 2.5 0 0 0 4 4.5v15z" /></svg>,
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" /></svg>,
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" /></svg>,
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.45L20.55 19H3.45L12 5.45z" /></svg>
  ];
  return icons[id - 1] || icons[0];
};

const CheckIcon = () => (
  <div className="bg-green-500 rounded-full p-1 shadow-sm">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </div>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
  </svg>
);
