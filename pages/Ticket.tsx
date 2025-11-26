import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRegistrationByCode } from '../services/storage';
import { Calendar, MapPin } from 'lucide-react';

declare const QRious: any;

const TicketView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const registration = getRegistrationByCode(code || '');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (registration && canvasRef.current) {
      new QRious({
        element: canvasRef.current,
        value: registration.ticketCode,
        size: 200,
        level: 'H'
      });
    }
  }, [registration]);

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Ticket no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Top Decoration */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-4">
            Acceso Confirmado
          </span>
          
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">{registration.fullName}</h1>
          <p className="text-slate-400 text-sm mb-8">Ticket ID: {registration.ticketCode}</p>

          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 inline-block mb-8 relative group">
             <canvas ref={canvasRef} className="rounded-lg" />
             <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-slate-800">Escanea en la entrada</span>
             </div>
          </div>

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
              <span>24 de Octubre, 2025 • 09:00 AM</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 justify-center">
              <MapPin size={18} className="text-indigo-500" />
              <span>Gran Salón de Cristal, CDMX</span>
            </div>
          </div>
        </div>

        {/* Ticket Cutout Effect */}
        <div className="absolute top-1/2 left-0 w-6 h-6 bg-slate-100 rounded-full -ml-3 -mt-3"></div>
        <div className="absolute top-1/2 right-0 w-6 h-6 bg-slate-100 rounded-full -mr-3 -mt-3"></div>
      </div>
    </div>
  );
};

export default TicketView;