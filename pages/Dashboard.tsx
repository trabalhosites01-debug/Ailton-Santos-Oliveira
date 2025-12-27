import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Utensils, ScanLine, Camera, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppRoute } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const modules = [
    {
      title: "Personal Trainer AI",
      desc: "Treinos personalizados, cronogramas e suporte 24h.",
      icon: Dumbbell,
      color: "from-blue-500 to-indigo-600",
      path: AppRoute.TRAINER,
      action: "Acessar Treino"
    },
    {
      title: "Nutricionista AI",
      desc: "Dietas calculadas, laudos e ajustes de macros.",
      icon: Utensils,
      color: "from-emerald-500 to-teal-500",
      path: AppRoute.NUTRITIONIST,
      action: "Ver Dieta"
    },
    {
      title: "Scanner Corporal",
      desc: "Análise visual de composição e pontos de melhoria.",
      icon: ScanLine,
      color: "from-violet-500 to-purple-600",
      path: AppRoute.BODY_SCAN,
      action: "Escanear Agora"
    },
    {
      title: "Scanner de Comida",
      desc: "Foto das refeições para cálculo automático de calorias.",
      icon: Camera,
      color: "from-orange-500 to-amber-500",
      path: AppRoute.FOOD_SCAN,
      action: "Escanear Prato"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400">Seu painel de controle para {user?.goal?.toLowerCase()}.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(mod.path)}
            className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.color} opacity-10 blur-3xl rounded-full transform translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="p-8">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-6 shadow-lg`}>
                <mod.icon className="text-white" size={28} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{mod.title}</h3>
              <p className="text-slate-400 mb-8 min-h-[3rem]">{mod.desc}</p>
              
              <div className="flex items-center text-white font-medium group-hover:gap-2 transition-all">
                <span>{mod.action}</span>
                <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900/50 rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Evolução Semanal</h3>
          <p className="text-slate-400 text-sm">Seu progresso é monitorado automaticamente pelas IAs.</p>
        </div>
        <div className="flex gap-4">
            <div className="text-center px-6 py-3 bg-slate-800 rounded-2xl border border-white/5">
                <span className="block text-2xl font-bold text-emerald-400">3</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Treinos</span>
            </div>
            <div className="text-center px-6 py-3 bg-slate-800 rounded-2xl border border-white/5">
                <span className="block text-2xl font-bold text-blue-400">92%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Dieta</span>
            </div>
        </div>
      </div>
    </div>
  );
};