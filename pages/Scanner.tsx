import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, Camera, AlertTriangle, CheckCircle, RefreshCw, Globe, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button, Card, Loader } from '../components/UI';
import { analyzeImage, AIResponse } from '../services/geminiService';
import { AppRoute } from '../types';

export const Scanner: React.FC = () => {
  const location = useLocation();
  const isBodyScan = location.pathname === AppRoute.BODY_SCAN;
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isBodyScan ? "Scanner Corporal" : "Scanner de Comida";
  const description = isBodyScan 
    ? "Envie uma foto de corpo inteiro para análise biomecânica e recomendação de treinos corretivos."
    : "Envie uma foto do seu prato para calcular calorias e macros.";
  
  // PROMPTS ATUALIZADOS PARA RESPOSTAS LONGAS E PROFISSIONAIS
  const prompt = isBodyScan
    ? "AJA COMO UM TREINADOR DE FISICULTURISMO DE ELITE. Analise este físico com extremo rigor técnico. 1. Estime o BF% (Gordura Corporal). 2. Crie uma lista detalhada dos PONTOS FORTES e PONTOS FRACOS musculares. 3. Para cada ponto fraco, prescreva uma estratégia de correção (exercícios, séries, repetições). 4. Use TABELAS e FORMATO MARKDOWN profissional. Seja longo e detalhista."
    : "AJA COMO UM NUTRICIONISTA ESPORTIVO. Analise este prato. 1. Identifique todos os alimentos. 2. Crie uma TABELA NUTRICIONAL completa com estimativa de Gramas, Calorias, Proteínas, Carbos e Gorduras para cada item. 3. Calcule o TOTAL da refeição. 4. Dê um veredito técnico sobre a qualidade nutricional. Resposta longa e profissional.";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true); // Temporary loading state for file reading
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset previous result
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
      // Extract base64 content
      const base64Data = image.split(',')[1];
      const analysis = await analyzeImage(base64Data, prompt, isBodyScan ? 'body' : 'food');
      setResult(analysis);
    } catch (error) {
      setResult({ text: "Erro ao analisar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed transition-all relative overflow-hidden group
            ${image ? 'border-emerald-500 bg-slate-900' : 'border-slate-700 hover:border-emerald-500/50 bg-slate-900/50'}`}>
            
            {image ? (
              <>
                <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="relative z-10 bg-black/60 p-4 rounded-xl backdrop-blur-sm">
                   <p className="text-white font-medium flex items-center gap-2">
                     <CheckCircle className="text-emerald-500" size={20} />
                     Foto Carregada
                   </p>
                   <p className="text-xs text-slate-300 mt-1 text-center">Clique para trocar</p>
                </div>
              </>
            ) : (
              <div className="relative z-10 text-center p-6">
                <div className="w-20 h-20 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload className="text-slate-400 group-hover:text-emerald-400 transition-colors" size={32} />
                </div>
                <p className="text-slate-300 font-medium mb-2 text-lg">Toque para enviar foto</p>
                <p className="text-sm text-slate-500">Galeria ou Câmera</p>
              </div>
            )}
            
            {/* IMPORTANT: z-20 ensures this input is always above the decorative elements */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              onClick={(e) => (e.currentTarget.value = '')}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
            />
          </Card>

          <div className="flex gap-3">
             {image && (
               <Button onClick={resetScanner} variant="secondary" className="px-4">
                 <RefreshCw size={20} />
               </Button>
             )}
             
             <Button 
                onClick={handleAnalysis} 
                disabled={!image || loading} 
                fullWidth 
                className="h-14 text-lg shadow-xl shadow-emerald-500/10"
              >
                {loading ? <Loader /> : (
                  <>
                    <Camera size={20} />
                    {result ? 'Analisar Novamente' : 'Enviar para IA'}
                  </>
                )}
             </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start">
             <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
             <p className="text-xs text-blue-200/80">
               <strong>Nota Profissional:</strong> Esta análise gera um laudo detalhado. Aguarde o processamento completo.
             </p>
          </div>
        </div>

        {/* Result Section */}
        <div className="relative h-full min-h-[400px]">
            {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/30 p-8 text-center dashed">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                       <Camera size={32} className="opacity-40" />
                    </div>
                    <p className="text-lg font-medium text-slate-400">Aguardando imagem...</p>
                    <p className="text-sm mt-2 max-w-xs">Tire uma foto clara e bem iluminada para obter a melhor análise possível.</p>
                </div>
            )}

            {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-6 bg-slate-900/50 rounded-2xl border border-white/5">
                    <div className="relative">
                        <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-emerald-400 font-bold text-lg animate-pulse">Processando Imagem</p>
                        <p className="text-slate-400 text-sm mt-1">Gerando laudo técnico detalhado...</p>
                    </div>
                </div>
            )}

            {result && !loading && (
                <Card className="h-full overflow-y-auto bg-slate-800/80 border-emerald-500/30 shadow-2xl shadow-emerald-900/20 custom-scrollbar max-h-[600px]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5 sticky top-0 bg-slate-800/95 backdrop-blur-xl z-10 -mx-2 px-2 pt-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Relatório da Análise</h3>
                            <p className="text-xs text-slate-400">Gerado via Gemini Vision + Search</p>
                        </div>
                    </div>
                    
                    <div className="prose prose-invert prose-sm prose-emerald prose-headings:text-white prose-strong:text-emerald-300">
                        <ReactMarkdown>{result.text}</ReactMarkdown>
                    </div>

                    {/* Grounding Sources */}
                    {result.groundingMetadata?.groundingChunks && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3 text-slate-400">
                                <Globe size={14} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Fontes Google</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                                    if (chunk.web?.uri) {
                                        return (
                                            <a 
                                                key={i} 
                                                href={chunk.web.uri} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white hover:border-emerald-500 transition-colors"
                                            >
                                                <span>{chunk.web.title || "Fonte Externa"}</span>
                                                <ExternalLink size={10} className="shrink-0 opacity-50" />
                                            </a>
                                        )
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};