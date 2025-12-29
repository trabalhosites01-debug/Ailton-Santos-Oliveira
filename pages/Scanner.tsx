import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, Camera, AlertTriangle, CheckCircle, RefreshCw, Globe, ExternalLink, Image as ImageIcon, Video, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button, Card, Loader } from '../components/UI';
import { analyzeImage, AIResponse } from '../services/geminiService';
import { AppRoute } from '../types';

export const Scanner: React.FC = () => {
  const location = useLocation();
  const isBodyScan = location.pathname === AppRoute.BODY_SCAN;
  
  // -- STATE GENERAL --
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);

  // -- STATE FOOD SCAN (Single Image or Camera) --
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // -- STATE BODY SCAN (Two Images) --
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const title = isBodyScan ? "Scanner Corporal" : "Scanner de Comida";
  const description = isBodyScan 
    ? "Envie duas fotos (Frente e Costas) para uma análise biomecânica completa."
    : "Use a câmera ou envie uma foto para calcular as calorias.";
  
  const prompt = isBodyScan
    ? "AJA COMO UM TREINADOR DE FISICULTURISMO DE ELITE. Analise estas duas fotos (Frente e Costas) do físico com extremo rigor técnico. 1. Estime o BF% (Gordura Corporal). 2. Identifique ASSIMETRIAS entre os lados. 3. Crie uma lista detalhada dos PONTOS FORTES e PONTOS FRACOS musculares (visão frontal e dorsal). 4. Prescreva uma estratégia de correção. Use TABELAS."
    : "AJA COMO UM NUTRICIONISTA ESPORTIVO. Analise este prato. 1. Identifique todos os alimentos. 2. Crie uma TABELA NUTRICIONAL completa com estimativa de Gramas, Calorias, Proteínas, Carbos e Gorduras para cada item. 3. Calcule o TOTAL da refeição. 4. Dê um veredito técnico sobre a qualidade nutricional.";

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // --- CAMERA LOGIC (Food Scan) ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
      setCameraMode(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFoodImage(dataUrl);
        setCameraMode(false); // Close camera UI after capture
        stopCamera();
      }
    }
  };

  const toggleCamera = () => {
    if (cameraMode) {
      stopCamera();
      setCameraMode(false);
    } else {
      setCameraMode(true);
      setFoodImage(null); // Clear previous image
      setTimeout(startCamera, 100); // Allow render
    }
  };

  // --- FILE UPLOAD LOGIC ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ANALYSIS LOGIC ---
  const handleAnalysis = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      let imagesToSend: string[] = [];

      if (isBodyScan) {
        if (!frontImage || !backImage) return;
        imagesToSend = [frontImage.split(',')[1], backImage.split(',')[1]];
      } else {
        if (!foodImage) return;
        imagesToSend = [foodImage.split(',')[1]];
      }

      const analysis = await analyzeImage(imagesToSend, prompt, isBodyScan ? 'body' : 'food');
      setResult(analysis);
    } catch (error) {
      setResult({ text: "Erro ao analisar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFoodImage(null);
    setFrontImage(null);
    setBackImage(null);
    setResult(null);
    setCameraMode(false);
    stopCamera();
  };

  // --- RENDER HELPERS ---
  const UploadBox = ({ label, imageState, setImageState }: { label: string, imageState: string | null, setImageState: (s: string) => void }) => (
    <Card className={`aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed transition-all relative overflow-hidden group
        ${imageState ? 'border-emerald-500 bg-slate-900' : 'border-slate-700 hover:border-emerald-500/50 bg-slate-900/50'}`}>
        
        {imageState ? (
            <>
            <img src={imageState} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="relative z-10 bg-black/70 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={16} />
                    {label} OK
                </p>
            </div>
            {/* Close/Remove Button */}
            <button 
                onClick={(e) => { e.preventDefault(); setImageState(''); }} 
                className="absolute top-2 right-2 z-20 bg-red-500/80 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
            >
                <X size={14} />
            </button>
            </>
        ) : (
            <div className="relative z-10 text-center p-4">
                <div className="w-14 h-14 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Upload className="text-slate-400 group-hover:text-emerald-400 transition-colors" size={24} />
                </div>
                <p className="text-slate-300 font-bold mb-1">{label}</p>
                <p className="text-xs text-slate-500">Galeria</p>
            </div>
        )}
        
        <input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleFileChange(e, setImageState)}
            onClick={(e) => (e.currentTarget.value = '')}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
        />
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INPUT SECTION */}
        <div className="space-y-6">
            
            {/* --- BODY SCAN UI --- */}
            {isBodyScan && (
                <div className="grid grid-cols-2 gap-4">
                    <UploadBox label="Frente" imageState={frontImage} setImageState={setFrontImage} />
                    <UploadBox label="Costas" imageState={backImage} setImageState={setBackImage} />
                </div>
            )}

            {/* --- FOOD SCAN UI --- */}
            {!isBodyScan && (
                <div className="space-y-4">
                    {/* Toggle Tabs */}
                    <div className="flex p-1 bg-slate-900 rounded-xl border border-white/5">
                        <button 
                            onClick={() => { setCameraMode(false); stopCamera(); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${!cameraMode ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ImageIcon size={16} /> Galeria
                        </button>
                        <button 
                            onClick={() => { setCameraMode(true); setTimeout(startCamera, 100); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${cameraMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Video size={16} /> Câmera Ao Vivo
                        </button>
                    </div>

                    {cameraMode ? (
                        <div className="relative aspect-square bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl">
                             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                             <canvas ref={canvasRef} className="hidden" />
                             
                             {/* Camera Overlay */}
                             <div className="absolute inset-0 pointer-events-none border-[20px] border-black/30 rounded-2xl"></div>
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border-2 border-white/20 rounded-lg dashed"></div>
                             </div>

                             {/* Capture Button */}
                             <div className="absolute bottom-6 left-0 w-full flex justify-center z-30">
                                <button 
                                    onClick={handleCapture}
                                    className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-500"></div>
                                </button>
                             </div>
                        </div>
                    ) : (
                        <Card className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed transition-all relative overflow-hidden group
                            ${foodImage ? 'border-emerald-500 bg-slate-900' : 'border-slate-700 hover:border-emerald-500/50 bg-slate-900/50'}`}>
                            
                            {foodImage ? (
                            <>
                                <img src={foodImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                <div className="relative z-10 bg-black/60 p-4 rounded-xl backdrop-blur-sm">
                                <p className="text-white font-medium flex items-center gap-2">
                                    <CheckCircle className="text-emerald-500" size={20} />
                                    Foto Pronta
                                </p>
                                </div>
                            </>
                            ) : (
                            <div className="relative z-10 text-center p-6">
                                <div className="w-20 h-20 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mx-auto mb-4 transition-colors">
                                <Upload className="text-slate-400 group-hover:text-emerald-400 transition-colors" size={32} />
                                </div>
                                <p className="text-slate-300 font-medium mb-2 text-lg">Enviar foto do prato</p>
                            </div>
                            )}
                            
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setFoodImage)}
                                onClick={(e) => (e.currentTarget.value = '')}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                            />
                        </Card>
                    )}
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-3">
                {(foodImage || frontImage || backImage) && (
                    <Button onClick={resetAll} variant="secondary" className="px-4">
                        <RefreshCw size={20} />
                    </Button>
                )}
                
                <Button 
                    onClick={handleAnalysis} 
                    disabled={
                        loading || 
                        (isBodyScan && (!frontImage || !backImage)) || 
                        (!isBodyScan && !foodImage)
                    } 
                    fullWidth 
                    className="h-14 text-lg shadow-xl shadow-emerald-500/10"
                >
                    {loading ? <Loader /> : (
                        <>
                            <Camera size={20} />
                            {result ? 'Analisar Novamente' : 'Analisar com IA'}
                        </>
                    )}
                </Button>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start">
                <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-200/80">
                <strong>Dica:</strong> {isBodyScan ? "Fotos claras e com roupa de banho/ginástica geram melhores resultados." : "Certifique-se que todos os ingredientes do prato estão visíveis."}
                </p>
            </div>
        </div>

        {/* RESULT SECTION */}
        <div className="relative h-full min-h-[400px]">
            {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/30 p-8 text-center dashed">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                       <Camera size={32} className="opacity-40" />
                    </div>
                    <p className="text-lg font-medium text-slate-400">Aguardando imagens...</p>
                    <p className="text-sm mt-2 max-w-xs">
                        {isBodyScan ? "Envie as duas fotos (Frente e Costas)." : "Tire uma foto ou envie da galeria."}
                    </p>
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
                        <p className="text-emerald-400 font-bold text-lg animate-pulse">Processando Visão Computacional</p>
                        <p className="text-slate-400 text-sm mt-1">Comparando padrões biomecânicos e nutricionais...</p>
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