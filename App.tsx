import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, QrCode, ShieldCheck, Scan, Menu, X } from 'lucide-react';
import Landing from './pages/Landing';
import AdminDashboard from './pages/Admin';
import TicketView from './pages/Ticket';
import Scanner from './pages/Scanner';
import { seedData } from './services/storage';

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/admin', label: 'Gestión', icon: <ShieldCheck size={20} /> },
    { path: '/scan', label: 'Escáner', icon: <Scan size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <QrCode size={20} />
              </div>
              <span className="font-serif text-xl font-semibold text-slate-900 tracking-tight">CASONA SESSION</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path) 
                      ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full' 
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-400 hover:text-indigo-600 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 animate-fade-in-down">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm font-light">
            "La logística que agota se vuelve conexión que enriquece."
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    seedData();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/ticket/:code" element={<TicketView />} />
          <Route path="/scan" element={<Scanner />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;