import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, Loader } from '../components/UI';
import { AppRoute } from '../types';
import { AlertCircle, Mail, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Por favor, digite seu Gmail.");
      return;
    }

    if (!email.includes('@')) {
        setError("Digite um e-mail válido.");
        return;
    }

    setLoading(true);

    try {
      // Login automatically registers if user doesn't exist
      await login(email);
      navigate(AppRoute.DASHBOARD);
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      setError("Ocorreu um erro ao acessar o aplicativo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <span className="text-3xl font-bold text-slate-900">FB</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Fit Boost AI</h1>
          <p className="text-slate-400">Entre para transformar seu corpo</p>
        </div>

        <Card className="backdrop-blur-xl bg-slate-900/90 border-slate-700/50 shadow-2xl animate-fade-in relative overflow-hidden">
          {/* Top colored line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

          <div className="mb-6">
             <h2 className="text-xl font-bold text-white text-center">
                Acesso Rápido
             </h2>
             <p className="text-center text-slate-400 text-sm mt-1">
                Insira seu e-mail para entrar ou cadastrar automaticamente.
             </p>
          </div>

          <form onSubmit={handleLoginSubmit} autoComplete="on">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl flex items-center gap-2 text-sm mb-4 animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
                <div className="animate-fade-in">
                    <Input 
                        type="email" 
                        label="Seu Gmail" 
                        placeholder="exemplo@gmail.com" 
                        name="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        autoComplete="email"
                        icon={<Mail size={18} />}
                        autoFocus
                    />
                </div>

                <Button type="submit" fullWidth className="mt-6 h-12 text-lg" disabled={loading}>
                    {loading ? <Loader /> : (
                        <span className="flex items-center gap-2">
                            Entrar no App
                            <ArrowRight size={18} />
                        </span>
                    )}
                </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
             <p className="text-xs text-slate-500">
                Ao continuar, seus dados serão salvos localmente no dispositivo.
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
};