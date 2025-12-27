import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatInterface, ChatInterfaceHandle, QuickAction } from '../components/ChatInterface';
import { X, Check, Calendar, BicepsFlexed, ClipboardList, Zap, ChevronRight, PlayCircle, AlertCircle } from 'lucide-react';

// Database for Technique Correction Flow
const exerciseDatabase: Record<string, string[]> = {
  "Peitoral (Peito)": ["Supino Reto com Barra", "Supino Inclinado com Halteres", "Crossover (Polia Alta)", "Peck Deck (Voador)", "Flexão de Braço"],
  "Dorsais (Costas)": ["Puxada Alta (Pulldown)", "Remada Curvada com Barra", "Remada Baixa (Triângulo)", "Levantamento Terra", "Barra Fixa"],
  "Membros Inferiores (Pernas)": ["Agachamento Livre", "Leg Press 45", "Cadeira Extensora", "Mesa Flexora", "Stiff", "Elevação Pélvica"],
  "Ombros (Deltoides)": ["Desenvolvimento Militar", "Elevação Lateral", "Elevação Frontal", "Crucifixo Inverso"],
  "Braços (Bíceps/Tríceps)": ["Rosca Direta", "Rosca Martelo", "Tríceps Polia (Corda)", "Tríceps Testa"]
};

export const PersonalTrainer: React.FC = () => {
  const { user } = useAuth();
  const chatRef = useRef<ChatInterfaceHandle>(null);
  
  // Modals State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTechniqueModalOpen, setIsTechniqueModalOpen] = useState(false);
  
  // Schedule State
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // Technique State
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

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

  // --- TECHNIQUE LOGIC ---
  const handleTechniqueSelect = (exercise: string) => {
    setIsTechniqueModalOpen(false);
    setSelectedBodyPart(null); // Reset for next time

    // PROMPT CORREÇÃO TÉCNICA COM FALLBACK SEGURO
    // Forçamos a IA a usar um link de busca se ela não achar um vídeo direto, garantindo que sempre haja um link funcional.
    const searchUrl = `https://www.youtube.com/results?search_query=tecnica+correta+${exercise.replace(/ /g, '+')}`;
    
    const prompt = `
    AÇÃO: Corrigir técnica do exercício **${exercise}**.
    
    PASSO 1 (VIDEO - OBRIGATÓRIO):
    - Pesquise um vídeo demonstrativo no Google/YouTube.
    - Se encontrar um vídeo ESPECÍFICO de alta qualidade, use a URL dele.
    - SE NÃO TIVER CERTEZA ou a busca falhar, USE ESTA URL DE BUSCA EXATA: ${searchUrl}
    - OBRIGATÓRIO: Coloque o link no TOPO DA RESPOSTA no formato: [Assistir Vídeo no YouTube](URL_ESCOLHIDA)
    
    PASSO 2 (CORREÇÃO):
    - Liste 3 pontos essenciais para a execução correta.
    - Liste 1 erro comum a evitar.
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
      label: "Corrigir Técnica", 
      action: () => setIsTechniqueModalOpen(true), 
      icon: <Zap size={18} />
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
          </div>
        </div>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                initialMessage={`**Sessão Iniciada.**\n\nSou seu treinador. Para treinos, tabelas simples. Para técnica, envio o link do vídeo.`}
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Calendar className="text-red-500" /> Dias de Treino
                </h2>
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
                GERAR CRONOGRAMA
              </button>
           </div>
        </div>
      )}

      {/* MODAL: TECHNIQUE CORRECTION (Steps) */}
      {isTechniqueModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-red-600"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-blue-500" /> Corrigir Técnica
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {selectedBodyPart ? `Selecione o exercício de ${selectedBodyPart}:` : "Selecione o grupo muscular:"}
                    </p>
                </div>
                <button onClick={() => { setIsTechniqueModalOpen(false); setSelectedBodyPart(null); }}><X className="text-slate-400" /></button>
              </div>

              {/* AVISO IMPORTANTE SOBRE VIDEOS */}
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mb-4 flex items-start gap-3">
                  <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-blue-200">
                    <strong>Aviso:</strong> Nem todos os exercícios possuem vídeos exatos no YouTube para adicionar a URL, mas buscaremos a melhor alternativa possível.
                  </p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid gap-3">
                  {!selectedBodyPart ? (
                      // STEP 1: Body Parts
                      Object.keys(exerciseDatabase).map(part => (
                          <button 
                            key={part} 
                            onClick={() => setSelectedBodyPart(part)}
                            className="p-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-blue-500 flex items-center justify-between group transition-all"
                          >
                             <span className="font-bold text-lg text-white">{part}</span>
                             <ChevronRight className="text-slate-500 group-hover:text-blue-400" />
                          </button>
                      ))
                  ) : (
                      // STEP 2: Machines / Exercises
                      <>
                        <button 
                            onClick={() => setSelectedBodyPart(null)} 
                            className="text-sm text-slate-400 hover:text-white mb-2 flex items-center gap-1"
                        >
                            ← Voltar
                        </button>
                        {exerciseDatabase[selectedBodyPart].map(exercise => (
                            <button 
                                key={exercise}
                                onClick={() => handleTechniqueSelect(exercise)}
                                className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-red-500 flex items-center justify-between group transition-all text-left"
                            >
                                <span className="font-medium text-slate-200 group-hover:text-white">{exercise}</span>
                                <PlayCircle className="text-slate-500 group-hover:text-red-500" size={20} />
                            </button>
                        ))}
                      </>
                  )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};