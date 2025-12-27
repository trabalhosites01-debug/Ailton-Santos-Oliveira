import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  Utensils, 
  ScanLine, 
  Camera, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: AppRoute.DASHBOARD, icon: LayoutDashboard },
    { name: 'Personal Trainer', path: AppRoute.TRAINER, icon: Dumbbell },
    { name: 'Nutricionista', path: AppRoute.NUTRITIONIST, icon: Utensils },
    { name: 'Scanner Corporal', path: AppRoute.BODY_SCAN, icon: ScanLine },
    { name: 'Scanner de Comida', path: AppRoute.FOOD_SCAN, icon: Camera },
  ];

  if (user?.isAdmin) {
    navItems.push({ name: 'Painel Admin', path: AppRoute.ADMIN, icon: ShieldAlert });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-900">FB</div>
            <span className="font-bold text-lg tracking-tight">Fit Boost</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop) / Mobile Drawer */}
      <aside className={`
        fixed md:sticky md:top-0 h-[calc(100vh-65px)] md:h-screen w-full md:w-72 bg-slate-900 border-r border-white/5 z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 top-[65px]' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-white/5">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-xl text-slate-900 shadow-lg shadow-emerald-500/20">FB</div>
           <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Fit Boost</span>
        </div>

        <div className="p-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                            {user?.name?.split(' ')[0]}
                            {user?.isAdmin && <ShieldAlert size={14} className="text-amber-500" />}
                        </p>
                        <p className="text-xs text-slate-400">{user?.isAdmin ? 'Administrador' : user?.goal}</p>
                    </div>
                </div>
            </div>

            <nav className="space-y-1">
            {navItems.map((item) => (
                <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive(item.path) 
                    ? item.path === AppRoute.ADMIN 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
                >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
                </Link>
            ))}
            </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};