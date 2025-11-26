// ========================================================================
// SECCIÓN 1: IMPORTACIONES (Las "Herramientas" que usaremos)
// ========================================================================

import React, { useEffect } from 'react';
// Herramientas para la navegación (enrutamiento) entre las distintas páginas de la aplicación.
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
// Librería de iconos visuales para la interfaz.
import { QrCode, ShieldCheck, Scan, Menu, X, Ticket as TicketIcon, LogOut } from 'lucide-react';

// --- Páginas de la Aplicación ---
import Landing from './pages/Landing';
import Admin from './pages/Admin';
import Ticket from './pages/Ticket';
import Scanner from './pages/Scanner';
import ComprarEntrada from './pages/ComprarEntrada.tsx';
import Login from './pages/Login';

// --- Lógica y Componentes Auxiliares ---
import { seedData } from './services/storage'; // Función para cargar datos de ejemplo al inicio.
import ProtectedRoute from './components/ProtectedRoute'; // El "portero" que protege las rutas de admin.

// ========================================================================
// SECCIÓN 2: COMPONENTE LAYOUT (La "Plantilla" Visual de la App)
// ========================================================================
// Este componente define la estructura que se repite en todas las páginas: 
// la barra de navegación, el pie de página y el contenedor para el contenido principal.
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // --- SUB-SECCIÓN 2.1: LÓGICA DEL LAYOUT ---
  
  const location = useLocation(); // Hook que nos da información sobre la URL actual.
  const [isMenuOpen, setIsMenuOpen] = React.useState(false); // Estado para controlar el menú móvil.

  // Función para determinar si un enlace del menú es el activo, para poder destacarlo visualmente.
  const isActive = (path: string) => location.pathname === path;

  // Lógica de Autenticación: revisa si la "llave" de autenticación existe en el almacenamiento del navegador.
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Lógica Condicional del Menú: decide qué enlaces mostrar basándose en si el usuario está autenticado o no.
  const navItems = isAuthenticated
    ? [ // Si ESTÁ autenticado, muestra el menú de administrador.
        { path: '/gestion', label: 'Gestión', icon: <ShieldCheck size={20} /> },
        { path: '/escaner', label: 'Escáner', icon: <Scan size={20} /> },
      ]
    : [ // Si NO está autenticado, muestra el menú para el público.
        { path: '/comprar-entrada', label: 'Adquirí tu entrada', icon: <TicketIcon size={20} /> },
      ];

  // --- SUB-SECCIÓN 2.2: ESTRUCTURA VISUAL (JSX) DEL LAYOUT ---
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">

      {/* --- Barra de Navegación (Header) --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <Link to="/" className="flex items-center gap-2"> 
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <QrCode size={20} />
              </div>
              <span className="font-serif text-xl font-semibold text-slate-900 tracking-tight">CASONA SESSION</span>
            </Link>

            {/* --- Menú de Escritorio (visible en pantallas grandes) --- */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path) ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    localStorage.removeItem('isAuthenticated');
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              )}
            </div>

            {/* --- Botón de Menú Móvil (visible en pantallas pequeñas) --- */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-400">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- Menú Desplegable Móvil --- */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    isActive(item.path) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    localStorage.removeItem('isAuthenticated');
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50"
                >
                  <LogOut size={20} />
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- Contenido Principal de la Página --- */}
      <main className="flex-grow">{children}</main>

      {/* --- Footer (Pie de página) --- */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-5xl mx-auto py-6 px-4 text-center">
          <p className="text-slate-400 text-sm">"La logística que agota se vuelve conexión que enriquece."</p>
        </div>
      </footer>
    </div>
  );
};

// ========================================================================
// SECCIÓN 3: COMPONENTE PRINCIPAL APP (El "Cerebro" de la App)
// ========================================================================
// Este es el componente raíz que organiza todo el enrutamiento y la estructura.
const App: React.FC = () => {
  // useEffect se ejecuta solo una vez cuando la aplicación carga por primera vez.
  useEffect(() => {
    // NOTA ACLARATORIA: Esta función 'seedData' llena la app con datos de ejemplo
    // para que no empieces con la lista de gestión vacía. 
    // En una aplicación real, probablemente quitarías esto.
    seedData(); 
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* --- Definición de Rutas Públicas (accesibles por todos) --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/comprar-entrada" element={<ComprarEntrada />} />
          <Route path="/login" element={<Login />} />

          {/* --- Definición de Rutas Privadas (protegidas por contraseña) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/gestion" element={<Admin />} />
            <Route path="/escaner" element={<Scanner />} />
            <Route path="/ticket/:ticketCode" element={<Ticket />} />
          </Route>
        </Routes>
      </Layout>
    </HashRouter>
  );
};

// ========================================================================
// SECCIÓN 4: EXPORTACIÓN
// ========================================================================
// Hace que el componente 'App' esté disponible para ser usado por el resto de la aplicación.
export default App;