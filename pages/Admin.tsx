// ========================================================================
// SECCIÓN 1: IMPORTACIONES Y CONFIGURACIÓN
// ========================================================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Clock, Filter, Sparkles, Mail, Loader2, FileText } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
// NOTA ACLARATORIA: Aunque no la usamos ahora, mantenemos la importación para el futuro.
import { generatePoeticWelcome } from '../services/geminiService';
import { Registration, RegistrationStatus } from '../types';

// ========================================================================
// SECCIÓN 2: COMPONENTE DEL PANEL DE ADMINISTRACIÓN
// ========================================================================
const AdminDashboard: React.FC = () => {
  
  // --- SUB-SECCIÓN 2.1: ESTADOS DEL COMPONENTE ---
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false); // Lo mantenemos por si lo reactivamos.
  
  // --- SUB-SECCIÓN 2.2: LÓGICA DE DATOS ---
  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setRegistrations(data);
    } catch (err: any) {
      console.error("Error al obtener registros:", err);
    }
  };
  
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = filter === 'ALL' ? registrations : registrations.filter(r => r.status === filter);

  // --- SUB-SECCIÓN 2.3: LÓGICA DE ACCIONES (CON MODIFICACIÓN) ---
  
  // MODIFICACIÓN: La llamada a Gemini ha sido desactivada temporalmente.
  const handleApproveClick = (reg: Registration) => {
    setSelectedReg(reg);
    
    // MENSAJE DE BIENVENIDA POR DEFECTO (SIN IA)
    const defaultMsg = `¡Bienvenido/a, ${reg.fullName}! Tu asistencia a ÚLTIMA Cassona Session 2025 ha sido confirmada.`;
    setGeneratedMessage(defaultMsg);

    // Como ya no hay llamada a la API, no necesitamos 'isGenerating'.
  };

  const confirmApproval = async () => {
    if (!selectedReg) return;
    setLoadingId(selectedReg.id);
    try {
      const { error } = await supabase.from('registrations').update({ status: RegistrationStatus.APPROVED, welcomeMessage: generatedMessage }).eq('id', selectedReg.id);
      if (error) throw error;
      await fetchRegistrations();
    } catch (err) {
      console.error("Error al aprobar:", err);
    } finally {
      setLoadingId(null);
      setSelectedReg(null);
    }
  };
  
  const handleReject = async (id: string) => {
    if(!window.confirm('¿Rechazar esta solicitud?')) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from('registrations').update({ status: RegistrationStatus.REJECTED }).eq('id', id);
      if (error) throw error;
      await fetchRegistrations();
    } catch (err) {
      console.error("Error al rechazar:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // ========================================================================
  // SECCIÓN 3: RENDERIZADO (JSX)
  // ========================================================================
  // NOTA ACLARATORIA: El código JSX no necesita cambios, ya que la lógica 'isGenerating'
  // simplemente no se activará, mostrando el textarea del modal directamente.
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      {/* ... (Todo el resto del código JSX es idéntico y no necesita cambios) ... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Centro de Mando</h1>
          <p className="text-slate-500 mt-1">Donde cada historia reposa esperando tu gesto.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-center">
            <span className="block text-2xl font-bold text-indigo-600">{registrations.filter(r => r.status === 'PENDING').length}</span>
            <span className="text-xs text-slate-400 font-medium uppercase">Pendientes</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-center">
            <span className="block text-2xl font-bold text-emerald-600">{registrations.filter(r => r.status === 'APPROVED').length}</span>
            <span className="text-xs text-slate-400 font-medium uppercase">Aprobados</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border'
            }`}
          >
            {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendientes' : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Filter className="mx-auto mb-3 opacity-20" size={48} />
            <p>No hay registros en esta categoría.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((reg) => (
              <div key={reg.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${
                    reg.status === 'APPROVED' ? 'bg-emerald-500' : reg.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}>
                    {reg.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{reg.fullName}</h3>
                    <p className="text-sm text-slate-500">{reg.email} • {reg.phone}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(reg.registrationDate).toLocaleString()}
                    </p>
                    {reg.paymentProofUrl && (
                      <a 
                        href={reg.paymentProofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                      >
                        <FileText size={12} />
                        Ver Comprobante
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end md:self-auto">
                   {reg.status === 'APPROVED' && (
                     <Link to={`/ticket/${reg.ticketCode}`} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mr-2">
                       <Sparkles size={12} /> Ver Ticket
                     </Link>
                   )}
                   {reg.status === 'PENDING' && (
                     <>
                       <button onClick={() => handleReject(reg.id)} disabled={loadingId === reg.id} className="p-2 rounded-full text-slate-400 hover:text-rose-600" title="Rechazar"><X size={20} /></button>
                       <button onClick={() => handleApproveClick(reg)} disabled={loadingId === reg.id} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                         {loadingId === reg.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Aprobar
                       </button>
                     </>
                   )}
                   {reg.status !== 'PENDING' && (
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                     }`}>{reg.status}</span>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReg && (
         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-serif font-semibold mb-4">Confirmar Aprobación</h3>
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mensaje de Bienvenida</label>
              <div className="bg-slate-50 p-4 rounded-lg border relative min-h-[100px]">
                {/* NOTA: 'isGenerating' siempre será false, por lo que el estado de carga no se mostrará */}
                {isGenerating ? (
                  <div className="flex items-center justify-center h-24 text-indigo-500 gap-2"><Sparkles className="animate-pulse" /><span>La IA está escribiendo...</span></div>
                ) : (
                  <textarea className="w-full bg-transparent border-none focus:ring-0 text-slate-700 italic font-serif resize-none h-24" value={generatedMessage} onChange={(e) => setGeneratedMessage(e.target.value)} />
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelectedReg(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
              <button onClick={confirmApproval} disabled={isGenerating} className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-lg font-medium flex items-center gap-2"><Mail size={16} /> Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
