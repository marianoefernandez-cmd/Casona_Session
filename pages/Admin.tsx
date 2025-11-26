import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Search, Filter, Sparkles, ChevronRight, Mail, Loader2 } from 'lucide-react';
import { getRegistrations, updateRegistrationStatus } from '../services/storage';
import { generatePoeticWelcome } from '../services/geminiService';
import { Registration, RegistrationStatus } from '../types';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // State for Approval Modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const data = getRegistrations();
    // Sort by date desc
    setRegistrations(data.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()));
  }, [loadingId]); // Refresh when loading finishes

  const filtered = filter === 'ALL' 
    ? registrations 
    : registrations.filter(r => r.status === filter);

  const handleApproveClick = async (reg: Registration) => {
    setSelectedReg(reg);
    setIsGenerating(true);
    // Generate AI message
    const msg = await generatePoeticWelcome(reg.fullName, "Encuentro Anual de Diseño");
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  const confirmApproval = () => {
    if (!selectedReg) return;
    setLoadingId(selectedReg.id);
    
    setTimeout(() => {
      updateRegistrationStatus(selectedReg.id, RegistrationStatus.APPROVED, generatedMessage);
      setLoadingId(null);
      setSelectedReg(null);
    }, 800);
  };

  const handleReject = (id: string) => {
    if(!window.confirm('¿Rechazar esta solicitud?')) return;
    setLoadingId(id);
    setTimeout(() => {
      updateRegistrationStatus(id, RegistrationStatus.REJECTED);
      setLoadingId(null);
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Centro de Mando</h1>
          <p className="text-slate-500 mt-1">Donde cada historia reposa esperando tu gesto.</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 text-center">
            <span className="block text-2xl font-bold text-indigo-600">{registrations.filter(r => r.status === 'PENDING').length}</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pendientes</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 text-center">
            <span className="block text-2xl font-bold text-emerald-600">{registrations.filter(r => r.status === 'APPROVED').length}</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aprobados</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === f 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendientes' : f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Filter className="mx-auto mb-3 opacity-20" size={48} />
            <p>No hay registros en esta categoría.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((reg) => (
              <div key={reg.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${
                    reg.status === 'APPROVED' ? 'bg-emerald-500' : 
                    reg.status === 'REJECTED' ? 'bg-rose-500' : 
                    reg.status === 'CHECKED_IN' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>
                    {reg.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                      {reg.fullName}
                      {reg.paymentProofUrl && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Con Comprobante</span>}
                    </h3>
                    <p className="text-sm text-slate-500">{reg.email} • {reg.phone}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> 
                      {new Date(reg.registrationDate).toLocaleDateString()} {new Date(reg.registrationDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                   {/* View Ticket Link if approved */}
                   {reg.status === 'APPROVED' && (
                     <a href={`/#/ticket/${reg.ticketCode}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mr-2">
                       <Sparkles size={12} /> Ver Ticket
                     </a>
                   )}

                   {reg.status === 'PENDING' && (
                     <>
                       <button 
                         onClick={() => handleReject(reg.id)}
                         disabled={loadingId === reg.id}
                         className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                         title="Rechazar"
                       >
                         <X size={20} />
                       </button>
                       <button 
                         onClick={() => handleApproveClick(reg)}
                         disabled={loadingId === reg.id}
                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all flex items-center gap-2"
                       >
                         {loadingId === reg.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                         Aprobar
                       </button>
                     </>
                   )}
                   {reg.status !== 'PENDING' && (
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        reg.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                        reg.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                     }`}>
                       {reg.status}
                     </span>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in-up">
            <h3 className="text-xl font-serif font-semibold mb-4 text-slate-800">Confirmar Aprobación</h3>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Susurro Digital (Mensaje de Bienvenida)</label>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative min-h-[100px]">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-24 text-indigo-500 gap-2">
                    <Sparkles className="animate-pulse" />
                    <span className="text-sm">La IA está escribiendo...</span>
                  </div>
                ) : (
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-700 italic font-serif text-sm resize-none h-24"
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                  />
                )}
                <div className="absolute bottom-2 right-2">
                  <Sparkles size={14} className="text-indigo-300" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Este mensaje se incluirá en su ticket digital.</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmApproval}
                disabled={isGenerating}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all font-medium flex items-center gap-2"
              >
                <Mail size={16} />
                Enviar Llave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;