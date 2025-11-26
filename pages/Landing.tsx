import React, { useState } from 'react';
import { Send, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { saveRegistration } from '../services/storage';
import { Registration, RegistrationStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate upload delay & processing
    setTimeout(() => {
      const newRegistration: Registration = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: RegistrationStatus.PENDING,
        registrationDate: new Date().toISOString(),
        ticketCode: `${formData.fullName.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        paymentProofUrl: file ? URL.createObjectURL(file) : undefined
      };

      saveRegistration(newRegistration);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in">
        <div className="bg-green-50 p-4 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">Tu intención ha sido recibida</h2>
        <p className="text-slate-600 max-w-md mb-8 text-lg leading-relaxed">
          Gracias por dar este paso. Tu lugar está siendo preparado. Recibirás el susurro digital en tu correo pronto.
        </p>
        <button 
          onClick={() => { setSubmitted(false); setFormData({fullName:'', email:'', phone:''}); setFile(null); }}
          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Realizar otro registro
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-32 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
           <img 
             src="/fondo.jpg
             alt= "Fondo del evento Cassona Session
             className="w-full h-full object-cover opacity-40"
           />
        </div>  
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm font-medium mb-6">
            13 de Diciembre, 2025
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            ÚLTIMA Cassona Session 2025
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Espacio donde el caos se transforma en danza. 
            Reserva tu lugar y sé parte de la experiencia.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100">
          <h2 className="text-2xl font-serif font-semibold text-slate-800 mb-8 text-center">Registro de Asistencia</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Correo Electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Teléfono (Opcional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="+52 ..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Comprobante de Pago</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group"
                >
                  <Upload className="text-slate-400 group-hover:text-indigo-500" size={20} />
                  <span className="text-slate-500 group-hover:text-indigo-600">
                    {file ? file.name : 'Subir imagen o PDF'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-400 text-center">Formatos aceptados: JPG, PNG, PDF. Máx 5MB.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar mi lugar
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;