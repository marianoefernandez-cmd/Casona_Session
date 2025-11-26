import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ¡¡¡CAMBIA ESTA CONTRASEÑA POR UNA SECRETA!!!
    const ADMIN_PASSWORD = "Legobenja88"; 

    if (password === ADMIN_PASSWORD) {
      // Si la contraseña es correcta, guardamos la "llave" en el navegador
      localStorage.setItem('isAuthenticated', 'true');
      // Y enviamos al usuario a la página de gestión
      navigate('/gestion'); // Asegúrate de que '/gestion' es la ruta correcta a tu panel de admin
    } else {
      // Si no, mostramos un error
      setError('Contraseña incorrecta');
    }
  };

  // ESTA ES LA PARTE VISUAL QUE TE FALTABA (EL "return")
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-3xl font-bold text-center text-slate-800 font-serif">Acceso de Administrador</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-slate-600"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-1 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            />
          </div>

          {/* Esto muestra el mensaje de error solo si existe */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg transition-all shadow-md hover:shadow-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;