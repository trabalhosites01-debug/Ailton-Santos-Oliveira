import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatInterface, ChatInterfaceHandle, QuickAction } from '../components/ChatInterface';
import { Utensils, FileText, Pill, MapPin } from 'lucide-react';

export const Nutritionist: React.FC = () => {
  const { user } = useAuth();
  const chatRef = useRef<ChatInterfaceHandle>(null);

  if (!user) return null;

  const quickActions: QuickAction[] = [
    { 
        label: "Plano Alimentar", 
        prompt: "Crie um PLANO ALIMENTAR DIÁRIO completo. Use a Tabela: | Refeição | Alimentos | Quantidade (g) |. É OBRIGATÓRIO colocar o peso exato em gramas de cada alimento.",
        icon: <Utensils size={18} />
    },
    { 
        label: "Laudo Nutricional", 
        prompt: "Gere um LAUDO NUTRICIONAL TÉCNICO para mim. Calcule meu IMC, Taxa Metabólica Basal (TMB) e Gasto Energético Total (GET). Defina a divisão de macros ideal para meu objetivo. Apresente como um documento médico.",
        icon: <FileText size={18} />
    },
    { 
        label: "Suplementação + Laudo", 
        prompt: "Liste TODOS os suplementos que devo tomar. Tabela: | Suplemento | Dosagem | Horário |. No final, adicione um breve LAUDO NUTRICIONAL justificando essas escolhas.",
        icon: <Pill size={18} />
    },
    { 
        label: "Encontrar Locais (Maps)", 
        prompt: "Encontre 'Lojas de Suplementos' e 'Restaurantes de Comida Saudável' próximos a mim ou na minha cidade. Liste 3 opções com endereço.",
        icon: <MapPin size={18} />
    }
  ];

  return (
    <div className="h-full flex flex-col gap-6">
       {/* Header Limpo sem Ícones de Fundo */}
       <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-r from-red-900 via-pink-900 to-blue-900 shadow-2xl border border-white/10">
          <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white mb-4 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Science Based
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">
               NUTRIÇÃO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">INTELIGENTE</span>
             </h1>
             <p className="text-red-100 text-lg md:text-xl max-w-2xl font-light">
               Dietas calculadas, laudos técnicos, mapas de lojas e suplementação completa.
             </p>
          </div>
        </div>

        {/* Organized Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((qa, idx) => (
                <button
                    key={idx}
                    onClick={() => chatRef.current?.sendMessage(qa.prompt!)}
                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
                >
                    <div className="p-3 rounded-full bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-blue-600 text-slate-400 group-hover:text-white transition-all shadow-lg">
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
            type="nutritionist"
            initialMessage={`**Nutricionista Online.**\n\nPosso gerar seu plano alimentar (agora com pesagem em gramas), criar um laudo técnico ou encontrar lojas.`}
            quickActions={[]} 
        />
      </div>
    </div>
  );
};