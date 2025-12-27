import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { UserGoal, TrainingLevel, AppRoute } from '../types';

export const Onboarding: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    level: TrainingLevel.BEGINNER,
    goal: UserGoal.LOSE_FAT
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
      level: formData.level,
      goal: formData.goal,
      onboarded: true
    });
    navigate(AppRoute.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-slate-800 bg-slate-900/90">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Configuração do Perfil</h2>
          <p className="text-slate-400">
            Precisamos desses dados para calibrar as IAs do Personal e Nutricionista. 
            <br/><span className="text-emerald-500 font-medium">Esta etapa é única e obrigatória.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              label="Idade" 
              name="age" 
              type="number" 
              placeholder="Anos" 
              value={formData.age} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Altura (cm)" 
              name="height" 
              type="number" 
              placeholder="175" 
              value={formData.height} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Peso (kg)" 
              name="weight" 
              type="number" 
              placeholder="70.5" 
              value={formData.weight} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nível de Experiência</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(TrainingLevel).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({...formData, level})}
                  className={`p-4 rounded-xl border-2 transition-all text-center font-medium
                    ${formData.level === level 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Objetivo Principal</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(UserGoal).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFormData({...formData, goal})}
                  className={`p-4 rounded-xl border-2 transition-all text-left font-medium flex items-center gap-3
                    ${formData.goal === goal 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  <span className="text-xl">
                    {goal === UserGoal.LOSE_FAT ? '🔥' : 
                     goal === UserGoal.GAIN_MUSCLE ? '💪' : 
                     goal === UserGoal.HYPERTROPHY ? '🏋️' : '⚖️'}
                  </span>
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <Button type="submit" fullWidth className="text-lg py-4">
              Salvar Perfil e Acessar Dashboard
            </Button>
            <p className="text-center text-xs text-slate-500 mt-4">
              🔒 Seus dados são salvos localmente e usados apenas para gerar seus treinos e dieta.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};