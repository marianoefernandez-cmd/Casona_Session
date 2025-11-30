// ========================================================================
// SECCIÓN 1: IMPORTACIONES
// ========================================================================
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Registration } from '../types';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
// --- MODIFICACIÓN CLAVE: Cambiamos de librería ---
// NOTA ACLARATORIA: Usaremos 'react-qr-code', una librería moderna y compatible con Vite.
import QRCode from "react-qr-code"; 

// ========================================================================
// SECCIÓN 2: COMPONENTE "VISTA DEL TICKET"
// ========================================================================
const TicketView: React.FC = () => {
  
  // --- SUB-SECCIÓN 2.1: ESTADOS Y LÓGICA DE DATOS ---
  // (Esta sección no necesita cambios)
  const { ticketCode } = useParams<{ ticketCode: string }>(); 
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketCode) {
      setError("No se especificó un código de ticket.");
      setLoading(false);
      return;
    }
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('ticketCode', ticketCode)
          .single();
        if (error) throw error;
        if (data) {
          setRegistration(data);
        } else {
          setError("Ticket no encontrado.");
        }
      } catch (err: any) {
        console.error("Error al buscar el ticket:", err);
        setError("Ticket no encontrado o inválido.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketCode]);

  // ========================================================================
  // SECCIÓN 3: RENDERIZADO CONDICIONAL
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Cargando ticket...
      </div>
    );
  }
  if (error || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center text-rose-500 font-semibold">
        {error || "Ticket no encontrado."}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-fade-in">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-4">
            Acceso Confirmado
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">{registration.fullName}</h1>
          <p className="text-slate-400 text-sm mb-8">Ticket ID: {registration.ticketCode}</p>

          {/* --- MODIFICACIÓN CLAVE: Bloque del Código QR --- */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 inline-block mb-8 relative group">
             {/* NOTA ACLARATORIA: Este contenedor es necesario para aplicar estilos como el borde redondeado, 
                 ya que el componente QRCode de esta librería no acepta 'className' directamente. */}
             <div className="rounded-lg overflow-hidden">
                <QRCode 
                    value={registration.ticketCode}
                    size={200} 
                    level={"H"}
                    bgColor={"#FFFFFF"} // Fondo blanco
                    fgColor={"#000000"} // Código negro
                />
             </div>
             <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-slate-800">Escanea en la entrada</span>
             </div>
          </div>
          
          {/* ... (El resto del código JSX no necesita cambios) ... */}
          {registration.welcomeMessage && (
             <div className="mb-8 relative">
               <div className="text-slate-500 italic font-serif leading-relaxed px-4">
                 "{registration.welcomeMessage}"
               </div>
             </div>
          )}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-slate-600 justify-center">
              <Calendar size={18} className="text-indigo-500" />
              <span>13 de Diciembre, 2025 • 09:00 AM</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 justify-center">
              <MapPin size={18} className="text-indigo-500" />
              <span>Evento Principal, Buenos Aires</span>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-0 w-6 h-6 bg-slate-100 rounded-full -ml-3 -mt-3"></div>
        <div className="absolute top-1/2 right-0 w-6 h-6 bg-slate-100 rounded-full -mr-3 -mt-3"></div>
      </div>
    </div>
  );
};

export default TicketView;