import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Sparkles, History, PlusCircle, MessageSquare, Trash2, X, Globe, ExternalLink, Info } from 'lucide-react';
import { ChatMessage, UserProfile, ChatSession } from '../types';
import { sendMessageToAI } from '../services/geminiService';

export interface ChatInterfaceHandle {
  sendMessage: (text: string) => void;
}

export interface QuickAction {
  label: string;
  prompt?: string;
  action?: () => void;
  icon?: React.ReactNode;
}

interface ChatInterfaceProps {
  user: UserProfile;
  type: 'trainer' | 'nutritionist';
  initialMessage: string;
  quickActions: QuickAction[];
}

export const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(({ user, type, initialMessage, quickActions }, ref) => {
  // --- STATE ---
  const [sessionId, setSessionId] = useState<string>(() => Date.now().toString());
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: initialMessage, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE & HISTORY LOGIC ---

  const loadHistoryList = () => {
    try {
      if (!user?.email) return;
      const key = `fitboost_history_${user.email}_${type}`;
      const data = localStorage.getItem(key);
      if (data) {
        setSavedSessions(JSON.parse(data).sort((a: ChatSession, b: ChatSession) => b.timestamp - a.timestamp));
      }
    } catch (e) {
      console.error("Error loading history", e);
      setSavedSessions([]);
    }
  };

  const saveCurrentSession = (currentMessages: ChatMessage[]) => {
    if (currentMessages.length <= 1 || !user?.email) return;

    try {
      const key = `fitboost_history_${user.email}_${type}`;
      const sessions = JSON.parse(localStorage.getItem(key) || '[]');
      
      const newSession: ChatSession = {
        id: sessionId,
        userId: user.email,
        type,
        timestamp: Date.now(),
        lastMessage: currentMessages[currentMessages.length - 1].text.substring(0, 60) + '...',
        messages: currentMessages
      };

      const filtered = sessions.filter((s: ChatSession) => s.id !== sessionId);
      const updated = [newSession, ...filtered];
      
      localStorage.setItem(key, JSON.stringify(updated));
      setSavedSessions(updated);
    } catch (e) {
      console.error("Error saving session", e);
    }
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    setSessionId(newId);
    setMessages([{ id: '1', role: 'model', text: initialMessage, timestamp: Date.now() }]);
    setIsHistoryOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const key = `fitboost_history_${user.email}_${type}`;
    const updated = savedSessions.filter(s => s.id !== idToDelete);
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedSessions(updated);
    
    if (idToDelete === sessionId) {
      startNewChat();
    }
  };

  useEffect(() => {
    loadHistoryList();
  }, [user.email, type]);

  useEffect(() => {
    if (messages.length > 1) {
      saveCurrentSession(messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // --- SENDING MESSAGES ---

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.text && m.text.trim() !== '')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const response = await sendMessageToAI(text, history, user, type);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingMetadata: response.groundingMetadata,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Desculpe, ocorreu um erro na comunicação. Tente novamente.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    sendMessage: handleSend
  }));

  // Define colors based on "Red and Blue" theme request
  const primaryGradient = "bg-gradient-to-r from-blue-600 to-red-600";
  const userBubbleColor = "bg-slate-700";
  const botBubbleColor = "bg-slate-800/80 border border-white/5 shadow-xl";

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative backdrop-blur-sm">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-950/30 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-1
              ${msg.role === 'model' 
                ? `${primaryGradient} text-white` 
                : 'bg-slate-700 text-slate-300'}`}>
              {msg.role === 'model' ? <Bot size={20} /> : <User size={20} />}
            </div>
            
            {/* Message Bubble */}
            <div className={`max-w-[95%] md:max-w-[85%] flex flex-col gap-2`}>
                <div className={`rounded-2xl p-6 text-sm md:text-base leading-relaxed shadow-lg overflow-hidden
                    ${msg.role === 'user' 
                    ? `${userBubbleColor} text-white rounded-tr-none` 
                    : `${botBubbleColor} text-slate-200 rounded-tl-none`}`}>
                    
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // TABLE: Stylish, Organized
                            table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-6 rounded-xl border border-white/10 shadow-md">
                                    <table className="w-full text-left border-collapse bg-slate-900/80" {...props} />
                                </div>
                            ),
                            thead: ({node, ...props}) => (
                                <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-xs uppercase tracking-wider text-blue-200" {...props} />
                            ),
                            th: ({node, ...props}) => (
                                <th className="px-5 py-4 font-bold border-b border-white/10" {...props} />
                            ),
                            td: ({node, ...props}) => (
                                <td className="px-5 py-4 border-b border-white/5 text-sm whitespace-pre-wrap align-top" {...props} />
                            ),
                            // HEADERS: Red/Blue Gradient
                            h1: ({node, ...props}) => <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-400 to-red-500 mb-6 mt-4 tracking-tight pb-2 border-b border-white/5" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mb-4 mt-8 flex items-center gap-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-blue-300 mb-3 mt-6 border-l-4 border-red-500 pl-4 py-1 bg-gradient-to-r from-red-500/10 to-transparent rounded-r-lg" {...props} />,
                            
                            // EMPHASIS: Highlighted in Red/Blue as requested
                            strong: ({node, ...props}) => <strong className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400" {...props} />,
                            
                            // LISTS: More spacing for readability
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-4 marker:text-red-500 text-slate-300" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 my-4 marker:text-blue-500 text-slate-300" {...props} />,
                            
                            // PARAGRAPHS & SEPARATORS
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-loose" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-8 border-none h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" {...props} />,
                            
                            // BLOCKQUOTES: Professional Notes
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-blue-500 bg-blue-900/10 pl-4 py-3 my-6 rounded-r-xl italic text-slate-300 relative">
                                <span className="absolute -top-3 left-2 bg-slate-900 px-2 text-xs font-bold text-blue-400">Nota Profissional</span>
                                {props.children}
                              </blockquote>
                            )
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                </div>

                {/* Grounding Sources */}
                {msg.groundingMetadata?.groundingChunks && (
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 text-xs w-fit mt-1">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Globe size={12} />
                            <span className="font-semibold uppercase tracking-wider">Fontes Verificadas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                                if (chunk.web?.uri) {
                                    return (
                                        <a 
                                            key={i} 
                                            href={chunk.web.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 hover:text-white transition-colors truncate max-w-[200px]"
                                        >
                                            <span className="truncate">{chunk.web.title || "Fonte"}</span>
                                            <ExternalLink size={10} className="shrink-0" />
                                        </a>
                                    )
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${primaryGradient}`}>
              <Bot size={20} className="text-white animate-pulse" />
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5 flex flex-col gap-2 max-w-[300px]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 font-bold">Analisando dados...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Consultando protocolos avançados e gerando tabela detalhada.
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/90 border-t border-white/5 backdrop-blur-md">
        
        {/* Quick Actions in Input Area */}
        <div className="flex justify-between items-center mb-3">
             <button 
                onClick={startNewChat}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors group"
             >
                <PlusCircle size={14} className="group-hover:text-blue-400" /> Novo Tópico
             </button>
             <button 
                onClick={() => { loadHistoryList(); setIsHistoryOpen(true); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors group"
             >
                <History size={14} className="group-hover:text-red-400" /> Histórico
             </button>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3 relative"
        >
          <div className="relative flex-1 group">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre treinos, dietas ou suplementação..."
                className="w-full bg-slate-800/50 text-white rounded-2xl pl-5 pr-4 py-4 border border-white/5 focus:border-blue-500/50 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500 shadow-inner"
                disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className={`aspect-square h-14 ${primaryGradient} disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-blue-900/20`}
          >
            <Send size={24} />
          </button>
        </form>
      </div>

      {/* HISTORY DRAWER */}
      {isHistoryOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="flex-1 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryOpen(false)}></div>
          
          <div className="w-80 h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
             <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <History size={18} className="text-blue-400" />
                  Histórico
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full">
                  <X size={18} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                {savedSessions.length === 0 ? (
                  <div className="text-center mt-10 text-slate-500">
                    <History size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum histórico encontrado.</p>
                  </div>
                ) : (
                    savedSessions.map((session) => (
                      <div 
                        key={session.id} 
                        onClick={() => loadSession(session)}
                        className={`group p-4 rounded-xl cursor-pointer border transition-all 
                          ${session.id === sessionId 
                            ? 'bg-gradient-to-br from-blue-900/20 to-red-900/20 border-blue-500/30' 
                            : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-slate-700'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={(e) => deleteSession(e, session.id)}
                            className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 leading-snug mb-2 font-medium">
                          {session.lastMessage || "Nova conversa..."}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-md border border-white/5">
                                {session.messages.length} msgs
                            </span>
                        </div>
                      </div>
                    ))
                )}
             </div>

             <div className="p-4 border-t border-white/5 bg-slate-900">
                <button 
                  onClick={startNewChat}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold border border-white/5"
                >
                  <PlusCircle size={16} className="text-blue-400" />
                  Nova Conversa
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
});
ChatInterface.displayName = 'ChatInterface';