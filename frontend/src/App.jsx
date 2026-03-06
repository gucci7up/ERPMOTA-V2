import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Error Boundary para mostrar errores en vez de pantalla blanca
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 32, fontFamily: 'monospace', background: '#1e293b', color: '#f87171', minHeight: '100vh' }}>
                    <h2 style={{ color: '#fbbf24', marginBottom: 12 }}>⚠️ Error de Renderizado React</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#0f172a', padding: 16, borderRadius: 8 }}>
                        {this.state.error?.toString()}{'\n\n'}{this.state.error?.stack}
                    </pre>
                    <button onClick={() => window.location.reload()} style={{ marginTop: 16, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer' }}>
                        Recargar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Importar Componentes Compartidos
import Layout from './components/Layout';

// Importar Páginas (Vistas)
import Login from './pages/Login';
import Bancas from './pages/Bancas';
import Empleados from './pages/Empleados';
import Operaciones from './pages/Operaciones';
import Gastos from './pages/Gastos';
import Nomina from './pages/Nomina';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Configuration from './pages/Configuration';

/**
 * Rutas Protegidas (Requieren Auth)
 */
const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        // Si no hay sesión iniciada, redirigir al login
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al montar la app, verifica la sesión
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            // Intentamos recuperar la sesión actual. 
            // Por los momentos validamos simulando la lectura local de auth state (simplificado)
            const storedUser = localStorage.getItem('erp_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            // En una implementación real con el backend 100% acoplado se haría:
            /*
            const response = await fetch('https://api-v2.salamihost.lat/api/me', { credentials: 'true' });
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            }
            */
        } catch (error) {
            console.error('Error checking session', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        localStorage.setItem('erp_user', JSON.stringify(userData)); // Guardamos localmente para persistencia simplificada
        // El reac-router hará re-render y lo mandará al Layout protegido
    };

    const handleLogout = async () => {
        try {
            // Destruir sesión en el backend si estuviera conectado completo
            await fetch('https://api-v2.salamihost.lat/api/logout', { method: 'POST', credentials: 'true' });
        } catch (e) { /* ignore */ }

        setUser(null);
        localStorage.removeItem('erp_user');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando sistema...</div>;
    }

    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    {/* RUTA PÚBLICA: Login */}
                    <Route
                        path="/login"
                        element={
                            user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
                        }
                    />

                    {/* RUTAS PRIVADAS: Cascarón del Sistema (Layout) */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute user={user}>
                                <Layout user={user} onLogout={handleLogout}>
                                    <Routes>
                                        {/* Rutas Internas Anidadas */}
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/bancas" element={<Bancas />} />
                                        <Route path="/empleados" element={<Empleados />} />
                                        <Route path="/operaciones" element={<Operaciones />} />
                                        <Route path="/gastos" element={<Gastos />} />
                                        <Route path="/nomina" element={<Nomina />} />
                                        <Route path="/reportes" element={<Reportes />} />
                                        <Route path="/configuracion" element={<Configuration />} />

                                        {/* Fallback para 404 interno */}
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
