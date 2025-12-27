import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI';
import { ShieldAlert, Users, Trash2, Search, UserCheck, AlertTriangle, UserX } from 'lucide-react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

export const AdminPanel: React.FC = () => {
  const { user, getAllUsers, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect route logic inside component for double safety
  useEffect(() => {
    if (!user?.isAdmin) {
        navigate('/');
    }
    refreshList();
  }, [user]);

  const refreshList = () => {
    setUsers(getAllUsers());
  };

  const handleDelete = (emailToDelete: string, name: string) => {
    // Safety check
    if (user?.email === emailToDelete) {
        alert("Você não pode remover a si mesmo.");
        return;
    }

    if (window.confirm(`Tem certeza que deseja BANIR e REMOVER o usuário ${name} (${emailToDelete})?\n\nTodos os dados e históricos serão apagados permanentemente.`)) {
        deleteUser(emailToDelete);
        // Optimistic update for immediate UI feedback
        setUsers(prev => prev.filter(u => u.email !== emailToDelete));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             <ShieldAlert className="text-amber-500" size={32} />
             Painel Administrativo
           </h1>
           <p className="text-slate-400">Gerenciamento de usuários e controle de acesso.</p>
        </div>
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-slate-300">
                Admin: <strong>{user?.name}</strong>
            </span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={80} />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total de Usuários</p>
            <h3 className="text-4xl font-bold text-white mt-1">{users.length}</h3>
        </Card>

        <Card className="bg-slate-900/50 border-blue-500/20 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <UserCheck size={80} />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Ativos</p>
            <h3 className="text-4xl font-bold text-white mt-1">
                {users.filter(u => u.onboarded).length}
            </h3>
        </Card>

        <Card className="bg-slate-900/50 border-amber-500/20 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert size={80} />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Admins</p>
            <h3 className="text-4xl font-bold text-white mt-1">
                {users.filter(u => u.isAdmin).length}
            </h3>
        </Card>
      </div>

      {/* Users List */}
      <Card className="p-0 overflow-hidden bg-slate-900 border-slate-800">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-white">Base de Usuários</h3>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar usuário..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                        <th className="p-4 font-medium">Usuário</th>
                        <th className="p-4 font-medium">Email (Clique para Remover)</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                    {filteredUsers.length === 0 ? (
                         <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                Nenhum usuário encontrado.
                            </td>
                         </tr>
                    ) : (
                        filteredUsers.map((u) => (
                            <tr key={u.email} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-900
                                            ${u.isAdmin ? 'bg-amber-500' : 'bg-slate-600'}`}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`font-medium ${u.isAdmin ? 'text-amber-400' : 'text-white'}`}>
                                            {u.name}
                                        </span>
                                    </div>
                                </td>
                                
                                {/* EMAIL CELL - CLICK TO DELETE */}
                                <td 
                                    className={`p-4 transition-all duration-200 font-mono 
                                        ${u.isAdmin 
                                            ? 'text-amber-500/50 cursor-not-allowed' 
                                            : 'text-slate-300 cursor-pointer hover:text-red-400 hover:bg-red-500/5 hover:font-bold'
                                        }`}
                                    onClick={() => !u.isAdmin && handleDelete(u.email, u.name)}
                                    title={u.isAdmin ? "Admins não podem ser removidos aqui" : "Clique para REMOVER este usuário"}
                                >
                                    <div className="flex items-center gap-2">
                                        {u.email}
                                        {!u.isAdmin && <UserX size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />}
                                    </div>
                                </td>

                                <td className="p-4">
                                    {u.onboarded ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
                                            Novo
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {!u.isAdmin && (
                                        <button 
                                            onClick={() => handleDelete(u.email, u.name)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Remover Usuário"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {u.isAdmin && (
                                        <span className="text-xs text-amber-500 font-medium opacity-50">
                                            PROTEGIDO
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </Card>
      
      <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-start gap-3">
         <AlertTriangle className="text-red-400 shrink-0 mt-0.5" />
         <div>
            <h4 className="text-red-200 font-bold text-sm">Zona de Perigo</h4>
            <p className="text-red-200/60 text-xs mt-1">
                Ao clicar no e-mail ou na lixeira, o usuário será removido imediatamente do banco de dados local. Essa ação é irreversível.
            </p>
         </div>
      </div>
    </div>
  );
};