import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatInterface, ChatInterfaceHandle, QuickAction } from '../components/ChatInterface';
import { X, Check, Calendar, BicepsFlexed, ClipboardList, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute } from '../types';

export const PersonalTrainer: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const chatRef = useRef<ChatInterfaceHandle>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modals State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Schedule State
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  // Check for auto-prompt from Calendar
  useEffect(() => {
    if (location.state && (location.state as any).autoPrompt && chatRef.current) {
        const prompt = (location.state as any).autoPrompt;
        // Small timeout to ensure chat is mounted
        setTimeout(() => {
            chatRef.current?.sendMessage(prompt);
            // Clear state so it doesn't trigger on refresh
            window.history.replaceState({}, document.title);
        }, 500);
    }
  }, [location.state]);

  if (!user) return null;

  // --- SCHEDULE LOGIC ---
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreatePlan = () => {
    if (selectedDays.length < 1) return;
    
    // INTEGRATION: Save days to profile for Calendar module
    updateProfile({ workoutDays: selectedDays });

    setIsScheduleModalOpen(false);
    
    // PROMPT TREINO
    const prompt = `
    Crie um CRONOGRAMA DE TREINO para: **${selectedDays.join(', ')}**.
    Objetivo: ${user.goal}.
    
    REGRAS:
    1. Tabela Limpa: | Exercício | Séries | Repetições |. (SEM CADÊNCIA, SEM TEMPO).
    2. Detalhamento: Resuma a execução em 1 parágrafo de 3 linhas para os principais exercícios.
    `;
    
    chatRef.current?.sendMessage(prompt);
  };

  const quickActions: QuickAction[] = [
    { 
      label: "Criar Cronograma", 
      action: () => setIsScheduleModalOpen(true),
      icon: <Calendar size={18} />
    },
    {
      label: "Listar Máquinas",
      prompt: "Liste as melhores máquinas de academia para HIPERTROFIA RÁPIDA de TODO O CORPO. Organize em uma tabela: | Grupo Muscular | Máquina | Benefício Principal |. Cubra Peito, Costas, Pernas, Ombros e Braços.",
      icon: <ClipboardList size={18} />
    },
    { 
      label: "Dica Hipertrofia", 
      prompt: "Dê 3 dicas essenciais para hipertrofia. Use tópicos e explique cada um em 3 linhas.",
      icon: <BicepsFlexed size={18} />
    }
  ];

  return (
    <>
      <div className="h-full flex flex-col gap-6">
        {/* Header Limpo - SEM ÍCONES DE FUNDO */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-red-900 shadow-2xl border border-white/10">
          <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white mb-4 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                AI Powered Pro
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">
               PERSONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">TRAINER</span>
             </h1>
             <p className="text-blue-100 text-lg md:text-xl max-w-2xl font-light">
               Cronogramas diretos, tabelas simplificadas e correção de técnica com vídeos.
             </p>

             {/* CALENDAR INTEGRATION BADGE */}
             {user.workoutDays && user.workoutDays.length > 0 && (
                <div className="mt-6 flex items-center gap-4 animate-fade-in">
                    <div className="bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                        <Calendar size={16} className="text-green-400" />
                        <span className="text-sm text-slate-200">
                            Agenda ativa: <strong className="text-white">{user.workoutDays.length} dias/semana</strong>
                        </span>
                    </div>
                    <button 
                        onClick={() => navigate(AppRoute.CALENDAR)}
                        className="text-sm font-semibold text-white hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                        Ver Calendário <ArrowRight size={14} />
                    </button>
                </div>
             )}
          </div>
        </div>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((qa, idx) => (
                <button
                    key={idx}
                    onClick={() => qa.action ? qa.action() : chatRef.current?.sendMessage(qa.prompt!)}
                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-slate-800 transition-all group"
                >
                    <div className="p-3 rounded-full bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-red-600 text-slate-400 group-hover:text-white transition-all shadow-lg">
                        {qa.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-white">{qa.label}</span>
                </button>
            ))}
        </div>

        <div className="flex-1 min-h-[500px]">
             <ChatInterface 
                ref={chatRef}
                user={user}
                type="trainer"
                initialMessage={`**Sessão Iniciada.**\n\nSou seu treinador. Para treinos, tabelas simples. Posso criar seu cronograma e salvar no calendário.`}
                quickActions={[]} 
            />
        </div>
      </div>

      {/* MODAL: SCHEDULE SELECTION */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-red-600"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="text-red-500" /> Dias de Treino
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Selecione os dias. Eles serão salvos no seu calendário.</p>
                </div>
                <button onClick={() => setIsScheduleModalOpen(false)}><X className="text-slate-400" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 pr-2 grid gap-3">
                  {daysOfWeek.map(day => (
                    <button key={day} onClick={() => toggleDay(day)}
                        className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${selectedDays.includes(day) ? 'bg-blue-900/20 border-blue-500 text-white' : 'bg-slate-800 border-transparent text-slate-400'}`}>
                        <span className="font-bold">{day}</span>
                        {selectedDays.includes(day) && <Check size={16} />}
                    </button>
                  ))}
              </div>

              <button onClick={handleCreatePlan} disabled={selectedDays.length === 0}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-lg disabled:opacity-50">
                GERAR CRONOGRAMA E SALVAR
              </button>
           </div>
        </div>
      )}
    </>
  );
};