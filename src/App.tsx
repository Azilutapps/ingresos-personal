/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  ShieldCheck, 
  HeartHandshake, 
  Truck, 
  Copy, 
  Check, 
  Smartphone, 
  Send, 
  Share2, 
  FileText, 
  Mail, 
  Award, 
  PenTool, 
  Users, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  Printer, 
  Download, 
  RefreshCw, 
  Eye, 
  ExternalLink,
  ChevronDown,
  Search,
  BookMarked,
  Info,
  Layers,
  FileCheck2,
  Lock,
  Calendar,
  Layers2,
  HelpCircle,
  FileSpreadsheet,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  POLICIES, 
  REGULATIONS, 
  WHATS_APP_TEMPLATES, 
  EMAIL_TEMPLATE_HTML,
  PolicySection,
  RegulationItem
} from "./data";

export default function App() {
  // Determina si estamos en la vista de operario exclusivo desde la URL (?mode=operario or ?mode=worker)
  const isWorkerOnly = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("mode") === "operario" ||
    new URLSearchParams(window.location.search).get("mode") === "worker"
  );

  // Mobile Simulator state
  const [currentTab, setCurrentTab] = useState<"booklet" | "reglamento" | "firma">("booklet");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("politica-integrada");
  const [searchText, setSearchText] = useState<string>("");
  const [showFullVerbatim, setShowFullVerbatim] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Regulation Checkboxes state
  const [checkedRegulations, setCheckedRegulations] = useState<Record<string, boolean>>({});
  
  // Signature & Work details
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("Operario de Obra");
  const [userDni, setUserDni] = useState<string>("");
  const [workDuration, setWorkDuration] = useState<string>("");
  const [workName, setWorkName] = useState<string>("");
  const [hasSubmittedSignature, setHasSubmittedSignature] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [certificateCode, setCertificateCode] = useState<string>("");

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Administrative Panel State
  const [selectedWaTemplate, setSelectedWaTemplate] = useState<string>("wa-oficial");
  const [customAppLink, setCustomAppLink] = useState<string>(window.location.origin || "https://azilut-manual.com");
  const [waMessageText, setWaMessageText] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("DIFUSIÓN OFICIAL: Manual de Bolsillo y Políticas Integradas Azilut S.A.");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [copyHtmlClicked, setCopyHtmlClicked] = useState<boolean>(false);

  // Onboarding metric slider
  const [rosterSize, setRosterSize] = useState<number>(180);
  const [communicationScore, setCommunicationScore] = useState<string>("interactive"); // offline vs email vs interactive

  // Synchronize WhatsApp template text whenever Link or template changes
  useEffect(() => {
    const template = WHATS_APP_TEMPLATES.find(t => t.id === selectedWaTemplate);
    if (template) {
      const updatedText = template.text.replace("[URL_DEL_MANUAL]", customAppLink);
      setWaMessageText(updatedText);
    }
  }, [selectedWaTemplate, customAppLink]);

  // Sync canvas filling when signature tab is rendered
  useEffect(() => {
    if (currentTab === "firma" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [currentTab]);

  // Auto scroll to signatures once they are submitted or when changing tab to keep visual flow
  const handleRegulationToggle = (id: string) => {
    setCheckedRegulations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAllRegulations = () => {
    const allChecked: Record<string, boolean> = {};
    REGULATIONS.forEach(item => {
      allChecked[item.id] = true;
    });
    setCheckedRegulations(allChecked);
  };

  const handleClearAllRegulations = () => {
    setCheckedRegulations({});
  };

  const getRegulationsProgress = () => {
    const total = REGULATIONS.length;
    const checkedCount = Object.values(checkedRegulations).filter(Boolean).length;
    const isCompleted = checkedCount === total;
    return {
      total,
      checkedCount,
      percent: Math.round((checkedCount / total) * 100),
      isCompleted
    };
  };

  // Canvas Handlers for Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = "#0f172a"; // dark blueprint ink
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;
    
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    const actualX = x * (canvas.width / rect.width);
    const actualY = y * (canvas.height / rect.height);
    
    ctx.beginPath();
    ctx.moveTo(actualX, actualY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;
    
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    const actualX = x * (canvas.width / rect.width);
    const actualY = y * (canvas.height / rect.height);
    
    ctx.lineTo(actualX, actualY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Submit commitment and create unique reference hash
  const handleSubmitEngagement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userDni.trim() || !workDuration.trim() || !workName.trim()) return;

    // Create unique credential code
    const uniqueHash = `AZ-${Math.floor(100000 + Math.random() * 900000)}-${userRole.substring(0,3).toUpperCase()}`;
    setCertificateCode(uniqueHash);
    setHasSubmittedSignature(true);
    
    // Simulate celebration
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const progress = getRegulationsProgress();
  const sortedRegulations = REGULATIONS;

  // Efficiency statistics based on rosterSize (Calculado con la nueva norma de 4 hojas A4 y 2 horas optimizadas por persona)
  const papersSaved = rosterSize * 4; // 4 hojas A4 por trabajador (1 por cada una de las 3 políticas + 1 para firmar la declaración)
  const logisticsSavedCostUSD = rosterSize * 12; // promedio de $12 USD de logística, impresión y distribución física por trabajador
  const processHoursSaved = rosterSize * 2; // 2 horas de lectura, comprensión y firma física por persona

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col premium-dark-grid relative overflow-x-hidden">
      
      {/* BACKGROUND GRAPHIC ORBITS */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-650/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* AZILUT RED LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-red-650 rounded-lg text-white font-extrabold text-3xl shadow-lg shadow-red-600/20">
                A
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-widest text-white flex items-center gap-1.5">
                  AZILUT <span className="text-red-500 text-sm font-mono tracking-normal border border-red-500/30 px-1.5 py-0.5 rounded uppercase">S.A.</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono">INTEGRATED MANAGEMENT MANUAL • ANEXO III • DIGITAL PORTABLE SUITE</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-full border border-slate-850">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300 font-mono">100% Cero Papel — WhatsApp & Mail Ready</span>
          </div>
        </div>
      </header>

      {/* SUB-HEADER CONCEPT CAROUSAL */}
      <div className="bg-gradient-to-r from-red-950/20 via-slate-900/90 to-slate-950 border-b border-slate-850 px-6 py-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 bg-red-900/30 text-red-400 border border-red-800/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" /> DIFUSIÓN OFICIAL DE SISTEMA INTEGRADO
            </div>
            <h2 className="text-2xl md:text-3.5xl font-extrabold text-white tracking-tight">
              Anexo III: Compendio Digital de Bolsillo
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Diseño interactivo de alta gama para auditar y difundir los Reglamentos de la Empresa sin demoras ni carpetas físicas. Sustituye las evaluaciones tradicionales por un 
              <strong className="text-white"> Checklist de Aceptación Obligatoria de 21 Declaraciones</strong>. Su aprobación íntegra habilita el panel para asentar la firma, generando el comprobante digital instantáneo.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-inner gap-2.5 justify-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest text-center">Garantía Corporativa S.A.</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/90 p-2 rounded border border-slate-850">
                <div className="text-md font-bold text-red-500">FIDELIDAD</div>
                <div className="text-[9px] text-slate-400 font-mono">100% Textual</div>
              </div>
              <div className="bg-slate-950/90 p-2 rounded border border-slate-850">
                <div className="text-md font-bold text-amber-500">CERO</div>
                <div className="text-[9px] text-slate-400 font-mono">Infantilismo</div>
              </div>
              <div className="bg-slate-950/90 p-2 rounded border border-slate-850">
                <div className="text-md font-bold text-blue-550">PREMIUM</div>
                <div className="text-[9px] text-slate-400 font-mono">Formatos Pro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL WORKSPACE SECTION */}
      <main className={`flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 gap-8 items-start ${
        isWorkerOnly ? "flex justify-center" : "grid grid-cols-1 lg:grid-cols-12"
      }`}>
        
        {/* SIMULADOR DE CELULAR POCKET */}
        <div className={isWorkerOnly ? "w-full max-w-[360px] flex flex-col items-center" : "lg:col-span-5 flex flex-col items-center"}>
          <div className="w-full max-w-[350px]">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-red-500" /> Simulación de Bolsillo
              </span>
              <span className="text-xs font-mono text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Interactivo PWA
              </span>
            </div>

            {/* CELULAR Renders */}
            <div className="relative mx-auto w-full aspect-[9/19] bg-slate-950 rounded-[48px] border-[12px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden ring-1 ring-slate-700/50">
              
              {/* CAMERA NOTCH */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-36 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-900 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-3 border border-slate-800" />
              </div>

              {/* PHONE STATUS BAR */}
              <div className="bg-slate-900 text-slate-400 text-[10px] font-mono px-6 pt-5 pb-2.5 flex justify-between items-center z-40 select-none border-b border-slate-850">
                <span>15:30 <span className="text-[8px]">PM</span></span>
                <span className="text-[9px] text-red-500 font-extrabold tracking-widest uppercase">Azilut S.A.</span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px]">5G</span>
                  <span className="text-[9.5px]">🔋 100%</span>
                </div>
              </div>

              {/* CELULAR INTERIOR NAV HEADER */}
              <div className="bg-slate-900 p-3 flex items-center justify-between z-30 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded flex items-center justify-center font-extrabold text-md text-white shadow-sm shadow-red-550/20">A</div>
                  <div>
                    <div className="text-[12px] font-extrabold tracking-white leading-none text-white">AZILUT S.A.</div>
                    <div className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">Manual de Bolsillo</div>
                  </div>
                </div>
                <div className="text-[9px] font-mono font-bold bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded uppercase">Anexo III</div>
              </div>

              {/* COMPLEMENTARY PROCESS BAR */}
              <div className="bg-slate-950 px-3 py-2 border-b border-slate-850 flex items-center justify-between text-[10px] z-30">
                <span className="font-mono text-slate-400">Declaraciones confirmadas:</span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${progress.isCompleted ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-amber-400'}`}>
                  {progress.checkedCount} / {progress.total}
                </span>
              </div>

              {/* SIMULATOR TAB CONTENT WINDOW - SCROLL INDEPENDENT */}
              <div className="flex-grow overflow-y-auto bg-slate-900 text-slate-200 p-3 text-xs flex flex-col relative select-none">
                
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: MANUAL DE LECTURA */}
                  {currentTab === "booklet" && (
                    <motion.div
                      key="booklet"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex flex-col flex-grow"
                    >
                      <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                        Estas son las tres directrices de cumplimiento irrestricto:
                      </p>

                      {/* Selector de Políticas */}
                      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-slate-850">
                        {POLICIES.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPolicyId(p.id);
                              setShowFullVerbatim(true); // default expand in pocket model
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                              selectedPolicyId === p.id 
                                ? "bg-red-650 text-white shadow-md shadow-red-750/35" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-850"
                            }`}
                          >
                            <span>{p.code}</span>
                          </button>
                        ))}
                      </div>

                      {/* Política Seleccionada Display */}
                      {(() => {
                        const policy = POLICIES.find(p => p.id === selectedPolicyId);
                        if (!policy) return null;
                        return (
                          <div className="flex flex-col flex-grow">
                            <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl mb-3">
                              <span className="text-[8.5px] font-mono text-red-500 font-bold uppercase tracking-widest">{policy.code}</span>
                              <h3 className="text-[12px] font-extrabold text-white leading-tight mt-0.5">{policy.title}</h3>
                              <p className="text-slate-350 text-[10px] mt-2 leading-relaxed bg-slate-900 border-l-2 border-red-500 p-2 rounded italic">
                                "{policy.summary}"
                              </p>
                            </div>

                            {/* TEXTO OFICIAL COPIA FIEL COMPROMISE */}
                            <div className="flex justify-between items-center mb-1 px-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Texto oficial</span>
                              <span className="text-[8.5px] text-red-400 font-mono">100% Completo y Fiel</span>
                            </div>

                            <div className="bg-slate-950 max-h-[160px] overflow-y-auto border border-slate-850 rounded-xl p-3 text-[9px] text-slate-300 leading-relaxed font-sans text-justify shadow-inner">
                              <pre className="whitespace-pre-wrap font-sans">
                                {policy.verbatim}
                              </pre>
                            </div>

                            <div className="mt-auto pt-3">
                              <button
                                onClick={() => setCurrentTab("reglamento")}
                                className="w-full bg-red-650 hover:bg-red-700 text-white font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] shadow-lg shadow-red-905/10"
                              >
                                Ir a Declaración de Conocimiento →
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* TAB 2: REGLAMENTO (21 OBLIGATIONAL CHECKBOXES) */}
                  {currentTab === "reglamento" && (
                    <motion.div
                      key="reglamento"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex flex-col flex-grow"
                    >
                      <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl mb-2 flex items-start gap-2">
                        <FileCheck2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-[11px] text-white uppercase tracking-wider">Aprobación del Reglamento</h4>
                          <p className="text-slate-400 text-[8.5px] leading-relaxed mt-0.5">
                            El operario debe aceptar individualmente los 21 puntos obligatorios de convivencia, seguridad e higiene para poder firmar.
                          </p>
                        </div>
                      </div>

                      {/* FAST GROUP SELECTORS TO FACILITATE DEMO */}
                      <div className="flex justify-between gap-2.5 mb-2.5 px-0.5">
                        <button 
                          onClick={handleSelectAllRegulations}
                          className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 p-1.5 rounded-lg text-[9px] font-bold text-slate-300 transition-all font-mono"
                        >
                          ✓ Confirmar Todo (Sí)
                        </button>
                        <button 
                          onClick={handleClearAllRegulations}
                          className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 p-1.5 rounded-lg text-[9px] font-bold text-slate-300 transition-all font-mono"
                        >
                          ✕ Limpiar Selección
                        </button>
                      </div>

                      {/* CHECKLIST SCROLL WINDOW */}
                      <div className="flex-grow overflow-y-auto max-h-[220px] bg-slate-950 rounded-xl p-2 border border-slate-850 gap-2 flex flex-col shadow-inner">
                        {sortedRegulations.map((item, index) => {
                          const isChecked = !!checkedRegulations[item.id];
                          return (
                            <div 
                              key={item.id}
                              onClick={() => handleRegulationToggle(item.id)}
                              className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                                isChecked 
                                  ? "bg-slate-900 border-red-500/20 text-white" 
                                  : "bg-slate-950/60 border-slate-900 hover:bg-slate-900/30 text-slate-400"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 shrink-0 select-none">
                                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                    isChecked 
                                      ? "bg-red-650 border-red-500 text-white" 
                                      : "border-slate-700 bg-slate-950"
                                  }`}>
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>
                                <div className="flex-grow">
                                  <div className="text-[9.5px] leading-relaxed text-slate-200">
                                    <strong className="text-red-500 mr-1 font-mono">#{index + 1}</strong>
                                    {item.text}
                                  </div>
                                  <span className="text-[7.5px] text-slate-500 font-mono tracking-wider block mt-1 uppercase">
                                    Categoría: {item.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* UNLOCK CRITERIA STATE */}
                      <div className="mt-2.5 pt-2 border-t border-slate-850">
                        {progress.isCompleted ? (
                          <div className="bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 p-2 rounded-xl text-[9px] leading-tight flex items-center gap-2 mb-2">
                            <span className="flex h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                            <span><strong>¡REGLAMENTO LEÍDO AL 100%!</strong> Se ha desbloqueado correctamente tu panel de Firma.</span>
                          </div>
                        ) : (
                          <div className="bg-amber-950/30 text-amber-400 border border-amber-900/20 p-2 rounded-xl text-[9.5px] leading-tight flex items-start gap-2 mb-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-0.5" />
                            <span>Debes tildar las 21 pautas del reglamento interno anteriores para habilitar la Firma. Falta tildar <strong>{progress.total - progress.checkedCount}</strong> declaraciones.</span>
                          </div>
                        )}

                        <button
                          disabled={!progress.isCompleted}
                          onClick={() => setCurrentTab("firma")}
                          className={`w-full py-2.5 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                            progress.isCompleted
                              ? "bg-red-650 hover:bg-red-700 text-white shadow shadow-red-600/10"
                              : "bg-slate-800 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {progress.isCompleted ? "Continuar a colocar Firma →" : "Tilda todas las declaraciones para continuar"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: FIRMA DIGITAL & CERTIFICADOS */}
                  {currentTab === "firma" && (
                    <motion.div
                      key="firma"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex flex-col flex-grow"
                    >
                      {!hasSubmittedSignature ? (
                        <form onSubmit={handleSubmitEngagement} className="flex flex-col flex-grow text-slate-300 text-[10.5px]">
                          
                          {/* Guard check */}
                          {!progress.isCompleted && (
                            <div className="bg-amber-950/40 text-amber-400 p-3 rounded-lg border border-amber-900/30 text-[9px] mb-3">
                              ⚠️ <strong>Bloqueado</strong>: Se requiere tildar 'Sí' en las 21 declaraciones del Reglamento Interno antes de firmar la conformidad.
                              <button 
                                type="button" 
                                onClick={() => setCurrentTab("reglamento")}
                                className="block mt-1 font-bold underline cursor-pointer"
                              >
                                Volver al Reglamento
                              </button>
                            </div>
                          )}

                          {/* OBLIGATORY FORMS */}
                          <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl mb-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Nombre Completo</label>
                                <input 
                                  type="text" 
                                  required
                                  disabled={!progress.isCompleted}
                                  value={userName}
                                  onChange={(e) => setUserName(e.target.value)}
                                  placeholder="Ej: Marcelo Gómez"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Número de D.N.I.</label>
                                <input 
                                  type="text" 
                                  required
                                  disabled={!progress.isCompleted}
                                  value={userDni}
                                  onChange={(e) => setUserDni(e.target.value)}
                                  placeholder="Ej: 30.567.890"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pb-1">
                              <div>
                                <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Duración (Ej: 6 meses)</label>
                                <input 
                                  type="text" 
                                  required
                                  disabled={!progress.isCompleted}
                                  value={workDuration}
                                  onChange={(e) => setWorkDuration(e.target.value)}
                                  placeholder="Parada / Duración..."
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Obra correspondiente</label>
                                <input 
                                  type="text" 
                                  required
                                  disabled={!progress.isCompleted}
                                  value={workName}
                                  onChange={(e) => setWorkName(e.target.value)}
                                  placeholder="Obra / Proyecto"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Rol / Puesto laboral</label>
                              <select 
                                value={userRole}
                                disabled={!progress.isCompleted}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                              >
                                <option value="Operario de Obra">Operario de Obra / Planta</option>
                                <option value="Conductor de Flota">Conductor Chofer Registrado</option>
                                <option value="Supervisor de Obra">Supervisor / Capataz</option>
                                <option value="Contratista Externo">Socio / Contratista Externo</option>
                                <option value="Gerente Jerárquico">Director / Gerencia</option>
                              </select>
                            </div>
                          </div>

                          {/* CANVAS SIGN BOARD */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1.5 px-1">
                              <label className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <PenTool className="w-3 h-3 text-red-500 animate-pulse" /> Firma obligatoria
                              </label>
                              <button 
                                type="button"
                                disabled={!progress.isCompleted}
                                onClick={clearSignature}
                                className="text-[8.5px] text-red-400 hover:underline disabled:opacity-50"
                              >
                                Limpiar Trazo
                              </button>
                            </div>
                            
                            <div className="bg-white rounded-xl overflow-hidden border border-slate-805 touch-none relative shadow-md">
                              <canvas
                                ref={canvasRef}
                                width={300}
                                height={90}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-[90px] cursor-crosshair bg-white"
                              />
                            </div>
                            <span className="text-[7.5px] text-slate-500 text-center block mt-1.5 italic">Escribe tu firma con el dedo o el mouse dentro del recuadro blanco</span>
                          </div>

                          {/* COMPLETED AGREEMENT SUBMIT */}
                          <button
                            type="submit"
                            disabled={!progress.isCompleted || !userName.trim() || !userDni.trim() || !workDuration.trim() || !workName.trim()}
                            className={`w-full py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                              progress.isCompleted && userName.trim() && userDni.trim() && workDuration.trim() && workName.trim()
                                ? "bg-red-650 hover:bg-red-700 text-white shadow-lg shadow-red-700/20"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <Lock className="w-4 h-4" />
                            Firmar y Generar Acta
                          </button>
                        </form>
                      ) : (
                        
                        /* Renders BREATHTAKING DIGITAL TICKET */
                        <div className="flex flex-col flex-grow items-center text-center">
                          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-1.5 animate-bounce">
                            <Check className="w-5.5 h-5.5 stroke-[3]" />
                          </div>
                          
                          <h4 className="text-white font-extrabold text-xs tracking-tight">
                            ¡CONFORMIDAD REGISTRADA!
                          </h4>
                          <p className="text-[8px] text-slate-400 mt-0.5 leading-relaxed max-w-[240px]">
                            Se guardó tu rúbrica digital sobre el Anexo III de Azilut S.A.
                          </p>

                          {/* TICKET CARD PREVIEW */}
                          <div className="w-full bg-white text-slate-900 rounded-xl p-3 my-3 text-left relative premium-paper-bg shadow-2xl border border-slate-350 transform rotate-1">
                            <div className="absolute top-0 right-0 px-1.5 py-0.5 font-mono text-[6px] text-slate-400 bg-slate-100 rounded-bl-lg border-l border-b border-slate-200 uppercase font-bold">
                              ID: {certificateCode.split('-')[1]}
                            </div>

                            <div className="border-b border-dashed border-slate-300 pb-1.5 mb-1.5 flex items-center gap-1.5">
                              <span className="w-4 h-4 bg-red-650 text-white font-extrabold text-[9px] rounded flex items-center justify-center">A</span>
                              <div>
                                <span className="font-extrabold text-[9px] tracking-wider block text-slate-900 leading-none">AZILUT S.A.</span>
                                <span className="text-[6.5px] text-slate-500 font-mono block leading-none mt-0.5">SISTEMA INTEGRADO DE COMPROMISO</span>
                              </div>
                            </div>

                            <div className="space-y-1 text-slate-900">
                              <div>
                                <div className="text-[6px] font-mono text-slate-500">TRABAJADOR NOTIFICADO</div>
                                <div className="text-[9.5px] font-extrabold uppercase leading-none">{userName}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                <div>
                                  <div className="text-[6px] font-mono text-slate-500">D.N.I. Nº</div>
                                  <div className="text-[8px] font-bold font-mono text-slate-800">{userDni}</div>
                                </div>
                                <div>
                                  <div className="text-[6px] font-mono text-slate-500">ROL DE OBRA</div>
                                  <div className="text-[8px] font-bold text-slate-800 tracking-tight truncate">{userRole}</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-slate-100 mt-1">
                                <div>
                                  <div className="text-[6px] font-mono text-slate-500">DURACIÓN NOTIFICADA</div>
                                  <div className="text-[8px] font-bold text-slate-800 tracking-tight">{workDuration}</div>
                                </div>
                                <div>
                                  <div className="text-[6px] font-mono text-slate-500">OBRA DE INGRESO</div>
                                  <div className="text-[8px] font-bold text-slate-800 tracking-tight truncate">{workName}</div>
                                </div>
                              </div>

                              {/* EXPLICIT ACCEPTANCE REGULATION LABEL */}
                              <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200/60 mt-1.5 text-[7px] text-slate-600 leading-tight">
                                ✓ Declara conocer y comprender las 21 pautas del Manual de Gestión Integrado, Alcohol, Drogas y Conducción Vehicular.
                              </div>

                              {/* SIGNATURE RENDERS */}
                              <div className="border-t border-dashed border-slate-300 pt-1.5 mt-2 flex justify-between items-end">
                                <div>
                                  <span className="text-[6px] font-mono text-slate-500 block leading-none mb-1">FIRMA</span>
                                  <div className="h-6 w-24 bg-slate-50 rounded border border-slate-200/50 flex items-center justify-center font-mono text-[7px] text-slate-400 italic">
                                    [ Rúbrica Digital Registrada ]
                                  </div>
                                </div>
                                
                                {/* SECURE QR CODE */}
                                <div className="w-8 h-8 border border-slate-200 p-0.5 bg-white rounded flex justify-center items-center">
                                  <div className="grid grid-cols-3 gap-0.5 w-[24px] h-[24px]">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`w-[7.5px] h-[7.5px] ${
                                          i % 2 === 0 || i === 7 ? 'bg-slate-900' : 'bg-slate-100'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full mt-1.5">
                            <button
                              onClick={() => {
                                setHasSubmittedSignature(false);
                                setUserName("");
                                setUserDni("");
                                setWorkDuration("");
                                setWorkName("");
                                handleClearAllRegulations();
                                setCurrentTab("booklet");
                              }}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 rounded-lg text-[9px] transition-all"
                            >
                              Nuevo Registro
                            </button>
                            <button
                              onClick={() => handleCopy(`Azilut S.A. | Rúbrica oficial Código: ${certificateCode}. Trabajador: ${userName} DNI: ${userDni} para Obra: ${workName}. 21 declaraciones aprobadas.`, "certificado")}
                              className="flex-1 bg-red-650 hover:bg-red-700 text-white font-bold py-1.5 rounded-lg text-[9px] transition-all flex items-center justify-center gap-1"
                            >
                              {copiedText === "certificado" ? <Check className="w-3 w-3" /> : <Copy className="w-3 w-3" />}
                              {copiedText === "certificado" ? "Copiado" : "Copiar Hash"}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

              {/* PHONE FOOTER NAVEGACIÓN */}
              <div className="bg-slate-950 border-t border-slate-850 p-2 grid grid-cols-3 gap-1 z-30 select-none">
                <button
                  onClick={() => setCurrentTab("booklet")}
                  className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                    currentTab === "booklet" ? "text-red-500 bg-slate-900/40" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[8px] font-mono uppercase tracking-wider">Políticas</span>
                </button>

                <button
                  onClick={() => setCurrentTab("reglamento")}
                  className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                    currentTab === "reglamento" ? "text-red-505 bg-slate-900/40" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  <FileCheck2 className={`w-4 h-4 ${progress.isCompleted ? 'text-emerald-500' : ''}`} />
                  <span className="text-[8px] font-mono uppercase tracking-wider">Reglamento</span>
                </button>

                <button
                  onClick={() => setCurrentTab("firma")}
                  className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl transition-all ${
                    currentTab === "firma" ? "text-red-500 bg-slate-900/40" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  <span className="text-[8px] font-mono uppercase tracking-wider">Firma</span>
                </button>
              </div>

              {/* SMARTPHONE HOME LINE BUTTON BUTTON */}
              <div className="bg-slate-950 pb-2 pt-1 flex justify-center z-40 select-none">
                <div className="w-24 h-1 bg-slate-800 rounded-full hover:bg-slate-705 cursor-pointer" />
              </div>

            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (DESCENTRALIZACIÓN, COMPARTIR Y ADMÍN DESK) - 7 SPAN */}
        {!isWorkerOnly && (
          <div className="lg:col-span-7 space-y-6">
          
          {/* SECCIÓN 1: RECOMENDACIÓN DIGITAL DE FORMATOS DE COMPARTIR */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600/10 text-red-500 rounded-xl">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Estrategia de Difusión del Manual de Bolsillo</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-1">
                  La nueva Gerencia busca eficiencia. Compartir el manual de bolsillo interactivo por <strong>WhatsApp de Obra</strong> y por <strong>Correo Corporativo HTML</strong> son los dos mejores canales. Aquí tienes las herramientas premium listas para usar:
                </p>
              </div>
            </div>

            {/* TABULACIÓN DE COMPARTIR */}
            <div className="mt-6 col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* WHATSAPP CONTAINER COPIER */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Canal 1. WhatsApp / SMS / Telegram</span>
                    <span className="bg-emerald-950 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-mono">Alta Lectura (98%)</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Mensaje Dinámico de Obra</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">
                    Incluye negritas de WhatsApp y el link directo al dispositivo móvil del operario en el obrador.
                  </p>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3 text-xs text-slate-300 font-mono max-h-[140px] overflow-y-auto whitespace-pre-wrap select-all">
                    {waMessageText}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Selector rápido de plantilla para WhatsApp */}
                  <div className="flex gap-2">
                    {WHATS_APP_TEMPLATES.map(temp => (
                      <button
                        key={temp.id}
                        onClick={() => setSelectedWaTemplate(temp.id)}
                        className={`text-[9.5px] px-2 py-1 rounded border font-sans ${
                          selectedWaTemplate === temp.id 
                            ? "bg-emerald-950 border-emerald-800 text-emerald-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {temp.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(waMessageText, "wa")}
                      className="flex-1 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      {copiedText === "wa" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedText === "wa" ? "¡Mensaje Copiado!" : "Copiar Texto Directo"}
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(waMessageText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1 shadow shadow-emerald-700/10"
                      title="Compartir por WhatsApp Web"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Probar Envío
                    </a>
                  </div>
                </div>
              </div>

              {/* EMAIL MAILING COMPONENT */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">Canal 2. Correo Corporativo</span>
                    <span className="bg-blue-950 text-blue-400 text-[9px] px-1.5 py-0.5 rounded font-mono">MailChimp / Outlook</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Boletín Oficial Integrado HTML</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">
                    Boletín HTML autoadaptable de etiqueta premium para notificación y auditoría con los colores oficiales de Azilut S.A.
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[9.5px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <Mail className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">Asunto: {emailSubject}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-2 border-t border-slate-900">
                  <div className="p-2.5 bg-slate-900 rounded-lg text-slate-500 font-mono text-[8px] max-h-[85px] overflow-y-auto block leading-tight border border-slate-850">
                    {EMAIL_TEMPLATE_HTML.substring(0, 300) + "\n\n/* ... código de diseño autoadaptable de Azilut ... */"}
                  </div>

                  <button
                    onClick={() => {
                      const completeTemp = EMAIL_TEMPLATE_HTML.replace("[URL_DEL_MANUAL]", customAppLink);
                      handleCopy(completeTemp, "html");
                      setCopyHtmlClicked(true);
                      setTimeout(() => setCopyHtmlClicked(false), 3000);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedText === "html" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                        <span>¡Código HTML Copiado!</span>
                      </>
                    ) : (
                      <>
                        <CodeIcon className="w-3.5 h-3.5" />
                        <span>Copiar Código HTML Adaptable</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* URL SETTING AT BASE OF COMPONENT */}
            <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-red-500" />
                <span className="text-slate-300 font-sans"><strong>Simula tu Link Oficial para la difusición:</strong></span>
              </div>
              <div className="flex-grow max-w-sm">
                <input 
                  type="text" 
                  value={customAppLink}
                  onChange={(e) => setCustomAppLink(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11.5px] w-full text-slate-200 font-mono focus:outline-none focus:border-red-500"
                  placeholder="Insertar URL para las plantillas"
                />
              </div>
            </div>

          </div>

          {/* SECCIÓN 2: CALCULADOR DE IMPACTO ECOLÓGICO Y MONETARIO DE DIFUSIÓN DE BOLSILLO */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-650/10 text-emerald-500 rounded-lg">
                  <FileSpreadsheet className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Calculador de Retorno de Inversión (ROI)</h3>
                  <p className="text-slate-400 text-xs font-mono">SIMULACIÓN DE IMPACTO DE DIGITALIZACIÓN DE AZILUT S.A.</p>
                </div>
              </div>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold">ECO - Friendly</span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Ajusta el personal total a capacitar de la Empresa para dimensionar el ahorro monetario, ecológico, logístico y de horas de administración al reemplazar el papel físico:
            </p>

            {/* SLIDER DE COMUNIDAD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-850 mb-6">
              <div className="col-span-2 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-bold text-slate-300">Nómina del Proyecto (Trabajadores):</span>
                  <span className="text-red-500 font-mono font-extrabold text-sm">{rosterSize} colab.</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="1200" 
                  step="10" 
                  value={rosterSize}
                  onChange={(e) => setRosterSize(parseInt(e.target.value))}
                  className="w-full accent-red-650 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none mt-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Método Previo</label>
                <div className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-1.5 rounded border border-slate-800">Carpeta Física con firmas</div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sustituto Premium</label>
                <div className="text-xs font-bold text-emerald-450 bg-emerald-950/20 px-2 py-1.5 rounded border border-emerald-900/20 flex items-center gap-1">
                  🌐 Suite Móvil PWA
                </div>
              </div>
            </div>

            {/* INDICADORES DEL CALCULO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Papel & Resmas Ahorradas</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono flex items-baseline gap-1">
                  {papersSaved.toLocaleString()} 
                  <span className="text-xs font-normal text-slate-450 uppercase">hojas</span>
                </div>
                <p className="text-[9.5px] text-slate-550 mt-1 leading-tight">Calculado sobre 4 hojas A4 por trabajador (3 de políticas + 1 de firma). Equivale a {Math.round(papersSaved / 500)} resmas.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Ahorro Logístico Total</div>
                <div className="text-2xl font-extrabold text-blue-400 mt-2 font-mono flex items-baseline gap-1">
                  ${logisticsSavedCostUSD.toLocaleString()}
                  <span className="text-xs font-normal text-slate-450 uppercase">USD</span>
                </div>
                <p className="text-[9.5px] text-slate-550 mt-1 leading-tight">Eliminación de imprenta, distribución física a obras dispersas y almacenamiento de legajos.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Tiempo de Productividad Optimizado</div>
                <div className="text-2xl font-extrabold text-amber-500 mt-2 font-mono flex items-baseline gap-1">
                  {Math.round(processHoursSaved)}
                  <span className="text-xs font-normal text-slate-450 uppercase">Hs</span>
                </div>
                <p className="text-[9.5px] text-slate-550 mt-1 leading-tight">Tiempo total de lectura, comprensión y firma física optimizado sobre un promedio de 2 hs por persona.</p>
              </div>

            </div>
          </div>

          {/* SECCIÓN 3: ESTRUCTURA DEL MANUAL DE GESTIÓN CORPORATIVO */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-base font-extrabold text-white mb-3">Estructura del Manual de Gestión S.A.</h3>
            <p className="text-slate-350 text-xs leading-relaxed mb-4">
              Cada anexo representa un valor fundamental de Azilut S.A. Aquí se demuestra cómo el diseño digital interactivo mejora el acceso a normativas clave:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div onClick={() => { setSelectedPolicyId("politica-integrada"); setCurrentTab("booklet"); }} className="p-3.5 bg-slate-950/60 border border-slate-850 hover:bg-slate-900 rounded-xl cursor-pointer transition-all">
                <div className="w-8 h-8 rounded-lg bg-red-650/10 text-red-500 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-slate-450 uppercase tracking-wider block">ANEXO III</span>
                <span className="text-xs font-extrabold text-white leading-tight block mt-0.5">Política Integrada</span>
                <p className="text-[9px] text-slate-405 mt-1 leading-relaxed leading-snug">Calidad, seguridad vial, salud y protección ambiental en cada obrador de la empresa.</p>
              </div>

              <div onClick={() => { setSelectedPolicyId("alcohol-drogas"); setCurrentTab("booklet"); }} className="p-3.5 bg-slate-950/60 border border-slate-850 hover:bg-slate-900 rounded-xl cursor-pointer transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-655/10 text-amber-500 flex items-center justify-center mb-2">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-slate-455 uppercase tracking-wider block">ANEXO III.A</span>
                <span className="text-xs font-extrabold text-white leading-tight block mt-0.5">Alcohol & Drogas</span>
                <p className="text-[9px] text-slate-405 mt-1 leading-relaxed leading-snug">Tolerancia Cero. Exámenes clínicos de ingreso y cesantía automática por alteraciones.</p>
              </div>

              <div onClick={() => { setSelectedPolicyId("conduccion-vehicular"); setCurrentTab("booklet"); }} className="p-3.5 bg-slate-950/60 border border-slate-850 hover:bg-slate-900 rounded-xl cursor-pointer transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-650/10 text-blue-500 flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-slate-450 uppercase tracking-wider block">ANEXO III.B</span>
                <span className="text-xs font-extrabold text-white leading-tight block mt-0.5">Conducción Segura</span>
                <p className="text-[9px] text-slate-405 mt-1 leading-relaxed leading-snug">Defensa vial, seguros al día, habilitación nacional y pautas previas a iniciar marcha.</p>
              </div>
            </div>
          </div>

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950/90 border-t border-slate-850 py-8 px-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
          <div>
            <span className="font-extrabold text-sm tracking-widest text-slate-300">AZILUT S.A.</span>
            <span className="text-[10px] text-slate-500 block mt-1">Manual de Gestión Integrado • Derechos Reservados © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 font-mono text-[11px]">
            <span>Estilo: Corporativo Premium</span>
            <span>Versión: 1.8.4 Mobile-Responsive</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Simple layout support icon missing in lucide-react standard declarations
function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
