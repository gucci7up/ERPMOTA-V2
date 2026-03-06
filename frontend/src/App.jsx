import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// Error Boundary for a premium error state
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center border border-border">
                        <div className="w-20 h-20 bg-red-50 text-accent-red rounded-3xl flex items-center justify-center mx-auto mb-8">
                          <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-text-main mb-4">Error Interno del Sistema</h2>
                        <p className="text-text-muted mb-8 leading-relaxed font-medium">
                          Algo salió mal al cargar esta página. Nuestro equipo técnico ha sido notificado.
                        </p>
                        <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left overflow-auto max-h-40 border border-slate-100">
                          <pre className="text-[10px] text-slate-500 font-mono leading-tight">
                            {this.state.error?.toString()}
                          </pre>
                        </div>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <RefreshCw size={18} />
                            <span>Recargar Aplicación</span>
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Import Shared Components
import Layout from './components/Layout';

// Import Pages
import Login from './pages/Login';
import Bancas from './pages/Bancas';
import Empleados from './pages/Empleados';
import Operaciones from './pages/Operaciones';
import Gastos from './pages/Gastos';
import Nomina from './pages/Nomina';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Configuration from './pages/Configuration';

const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default function App() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({ company_name: 'ERPMOTA', logo: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/settings', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const checkSession = async () => {
        try {
            const storedUser = localStorage.getItem('erp_user');
            if (storedUser) {
                // Verify session actively with the server
                const response = await fetch('https://api-v2.salamihost.lat/api/settings', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUser(JSON.parse(storedUser));
                    setSettings(data);
                } else if (response.status === 401) {
                    // Session is invalid on server side
                    console.warn('Session expired or invalid. Clearing state.');
                    localStorage.removeItem('erp_user');
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Error checking session:', error);
        } finally {
            // Artificial delay for premium feel loading
            setTimeout(() => setLoading(false), 800);
        }
    };

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        localStorage.setItem('erp_user', JSON.stringify(userData));
    };

    const handleLogout = async () => {
        try {
            await fetch('https://api-v2.salamihost.lat/api/logout', { method: 'POST', credentials: 'include' });
        } catch (e) { /* ignore */ }

        setUser(null);
        localStorage.removeItem('erp_user');
    };

    if (loading) {
        return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/5 rounded-[32px] animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h2 className="mt-8 text-xl font-black text-text-main tracking-tight animate-pulse uppercase">ERPMOTA</h2>
              <div className="mt-4 flex items-center space-x-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
              </div>
          </div>
        );
    }

    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
                        }
                    />

                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute user={user}>
                                <Layout user={user} onLogout={handleLogout} settings={settings}>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/bancas" element={<Bancas />} />
                                        <Route path="/empleados" element={<Empleados />} />
                                        <Route path="/operaciones" element={<Operaciones />} />
                                        <Route path="/gastos" element={<Gastos />} />
                                        <Route path="/nomina" element={<Nomina />} />
                                        <Route path="/reportes" element={<Reportes />} />
                                        <Route path="/configuracion" element={<Configuration onSettingsUpdate={fetchSettings} />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}
