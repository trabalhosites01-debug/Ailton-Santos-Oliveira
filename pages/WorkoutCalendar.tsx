import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/UI';
import { CalendarDays, CheckCircle, Clock, ChevronLeft, ChevronRight, Dumbbell, Flame, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

export const WorkoutCalendar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const fullDaysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Current Date Logic
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDayIndex = today.getDay();
  const currentDayName = fullDaysOfWeek[currentDayIndex];
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Helper: Check if a day is a workout day
  const isWorkoutDay = (dayIndex: number) => {
    if (!user?.workoutDays) return false;
    const dayName = fullDaysOfWeek[dayIndex];
    return user.workoutDays.includes(dayName);
  };

  const isTodayWorkoutDay = isWorkoutDay(currentDayIndex);

  // Helper: Generate Split Logic (A, B, C...) based on active days
  const getWorkoutSplit = () => {
    if (!user?.workoutDays) return [];
    
    // Sort active days based on their index in the week
    const sortedActiveDays = [...user.workoutDays].sort((a, b) => {
        return fullDaysOfWeek.indexOf(a) - fullDaysOfWeek.indexOf(b);
    });

    return sortedActiveDays.map((day, index) => {
        const splitLetter = String.fromCharCode(65 + index); // A, B, C...
        return {
            day,
            split: `Treino ${splitLetter}`,
            index
        };
    });
  };

  const workoutSchedule = getWorkoutSplit();

  // Navigation to Trainer to see details
  const handleOpenWorkout = (day: string, split: string) => {
    // We send a specific prompt to the trainer via navigation state
    navigate(AppRoute.TRAINER, { state: { 
        autoPrompt: `Quais são os exercícios do meu **${split}** de **${day}**? Meu objetivo é ${user?.goal}.` 
    }});
  };

  // Generate Calendar Grid
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, active: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dayOfWeek = date.getDay();
    calendarDays.push({
      day: i,
      active: isWorkoutDay(dayOfWeek),
      isToday: i === today.getDate(),
      dateObj: date
    });
  }

  const monthName = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
       <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-r from-pink-900 via-rose-900 to-red-900 shadow-2xl border border-white/10">
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CalendarDays className="text-pink-300" size={24} />
                 </div>
                 <h1 className="text-3xl font-bold text-white">Calendário de Treino</h1>
             </div>
             <p className="text-pink-100 text-lg max-w-2xl font-light">
               Seu cronograma ativo. Os dias em vermelho indicam seus dias de treino.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CALENDAR GRID */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-900 border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white capitalize">{monthName}</h2>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
                            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {daysOfWeek.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`
                                    min-h-[80px] rounded-xl border flex flex-col items-start justify-between p-2 transition-all relative
                                    ${!item.day ? 'border-transparent bg-transparent' : 
                                      item.active 
                                        ? 'bg-gradient-to-br from-pink-900/40 to-red-900/40 border-pink-500/30 shadow-lg shadow-pink-900/10' 
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}
                                    ${item.isToday ? 'ring-2 ring-emerald-500' : ''}
                                `}
                            >
                                {item.day && (
                                    <>
                                        <span className={`text-sm font-bold ${item.isToday ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {item.day}
                                        </span>
                                        {item.active && (
                                            <div className="mt-auto w-full">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-pink-300 bg-pink-500/10 px-1.5 py-1 rounded-md w-full truncate">
                                                    <Dumbbell size={10} />
                                                    Treino
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* WORKOUT OF THE DAY & LIST */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Flame className="text-orange-500" />
                        Sua Rotina de Treinos
                    </h3>

                    {/* TODAY'S HIGHLIGHT */}
                    {isTodayWorkoutDay ? (
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 shadow-xl border border-white/10 mb-6 relative overflow-hidden group cursor-pointer"
                             onClick={() => {
                                 const todaySplit = workoutSchedule.find(s => s.day === currentDayName);
                                 handleOpenWorkout(currentDayName, todaySplit?.split || 'Treino do Dia');
                             }}
                        >
                            <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                                <Dumbbell size={150} className="text-white" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-black/30 rounded-full text-xs font-bold text-orange-200 mb-2 uppercase tracking-wider">
                                        Hoje • {currentDayName}
                                    </span>
                                    <h2 className="text-3xl font-black text-white leading-tight">
                                        DIA DE TREINO
                                    </h2>
                                    <p className="text-orange-100 mt-1">
                                        {workoutSchedule.find(s => s.day === currentDayName)?.split} disponível.
                                    </p>
                                </div>
                                <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold border-none shadow-lg">
                                    <Play size={18} fill="currentColor" />
                                    Iniciar Agora
                                </Button>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 mb-6 flex items-center justify-between">
                             <div>
                                <h2 className="text-xl font-bold text-slate-300">Hoje é Descanso</h2>
                                <p className="text-slate-500 text-sm">Recupere-se para o próximo treino.</p>
                             </div>
                             <Clock className="text-slate-600" size={32} />
                         </div>
                    )}

                    {/* LIST OF ALL WORKOUTS */}
                    <div className="space-y-3">
                        {workoutSchedule.length === 0 ? (
                            <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                                <p className="text-slate-500 mb-2">Você ainda não configurou seus dias.</p>
                                <Button variant="outline" onClick={() => navigate(AppRoute.TRAINER)}>
                                    Configurar no Personal
                                </Button>
                            </div>
                        ) : (
                            workoutSchedule.map((item) => (
                                <div 
                                    key={item.day}
                                    onClick={() => handleOpenWorkout(item.day, item.split)}
                                    className={`
                                        group flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer
                                        ${item.day === currentDayName 
                                            ? 'bg-slate-800 border-orange-500/50 shadow-lg shadow-orange-900/10' 
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                                            ${item.day === currentDayName ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'}
                                        `}>
                                            {item.split.split(' ')[1]}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${item.day === currentDayName ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                {item.day}
                                            </h4>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                                                {item.day === currentDayName ? 'Treino de Hoje' : 'Ver Detalhes'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-blue-400 transition-colors">
                                        Ver Treino
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* SIDEBAR INFO */}
            <div className="space-y-6">
                <Card className="bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-blue-400" size={20} />
                        Resumo
                    </h3>
                    
                    <div className="space-y-4">
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                             <span className="text-slate-400">Frequência</span>
                             <span className="font-bold text-white">{workoutSchedule.length}x / semana</span>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                             <span className="text-slate-400">Objetivo</span>
                             <span className="font-bold text-emerald-400">{user?.goal || 'Geral'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <span className="text-slate-400">Nível</span>
                             <span className="font-bold text-white">{user?.level || 'Iniciante'}</span>
                         </div>
                    </div>
                </Card>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                     <div className="mt-1"><CheckCircle size={16} className="text-blue-400" /></div>
                     <p className="text-xs text-blue-200">
                        <strong>Dica:</strong> Ao clicar em um treino, a IA buscará os melhores exercícios para aquele dia específico baseada no seu perfil.
                     </p>
                </div>
            </div>
        </div>
    </div>
  );
};