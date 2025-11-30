import React, { useState } from 'react';
import { Send, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { RegistrationStatus } from '../types';
import toast from 'react-hot-toast';

const ComprarEntrada: React.FC = () => {
  
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Por favor, ingresa tu nombre completo.');
      return;
    }
    if (!file) {
      toast.error('Por favor, sube tu comprobante de pago.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(fileName);

      const newRegistration = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: RegistrationStatus.PENDING,
        registrationDate: new Date().toISOString(),
        ticketCode: `${formData.fullName.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        paymentProofUrl: urlData.publicUrl,
      };
      
      const { error: insertError } = await supabase.from('registrations').insert([newRegistration]);

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);

    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      toast.error('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 text-center animate-fade-in">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">¡Tu solicitud ha sido recibida!</h2>
        <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
          Hemos recibido tu solicitud. Una vez que validemos tu comprobante de pago, te enviaremos la entrada con tu código QR al correo proporcionado. ¡Nos vemos en la Cassona!
        </p>
        <button 
          onClick={() => { 
            setSubmitted(false); 
            setFormData({fullName:'', email:'', phone:''}); 
            setFile(null); 
          }}
          className="mt-8 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Realizar otro registro
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="bg-slate-900 text-white pt-20 pb-32 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
           <img src="/fondo.jpg" alt="Fondo del evento Cassona Session" className="w-full h-full object-cover opacity-40" />
        </div>  
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-200 text-sm mb-6">
            13 de Diciembre, 2025
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            ÚLTIMA Cassona Session 2025
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Espacio donde el caos se transforma en danza. Reserva tu lugar y sé parte de la experiencia.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border">
          <h2 className="text-2xl font-serif font-semibold text-slate-800 mb-8 text-center">Registro de Asistencia</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-slate-50 border focus:border-indigo-500 outline-none" placeholder="Tu nombre" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-slate-50 border focus:border-indigo-500 outline-none" placeholder="correo@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Teléfono (Opcional)</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-slate-50 border focus:border-indigo-500 outline-none" placeholder="+52 ..." />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">
                Comprobante de Pago <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-all group">
                  <Upload className="text-slate-400 group-hover:text-indigo-500" size={20} />
                  <span className="text-slate-500 group-hover:text-indigo-600">{file ? file.name : 'Subir imagen o PDF'}</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {isSubmitting ? (<><Loader2 className="animate-spin" size={20} /> Procesando...</>) : (<>Confirmar mi lugar <Send size={18} /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComprarEntrada;