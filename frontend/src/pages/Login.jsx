import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (onLoginSuccess) {
                    onLoginSuccess(data.user);
                }
                navigate('/', { replace: true });
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setError('Server connection error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-[48px] shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row border border-border min-h-[600px]">
                
                {/* Left Side: Branding/Visual */}
                <div className="md:w-1/2 bg-primary p-12 flex flex-col justify-between relative overflow-hidden text-white">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
                  </div>

                  <div className="relative z-10 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight">ERPMOTA</span>
                  </div>

                  <div className="relative z-10">
                    <h1 className="text-5xl font-black leading-tight">Modern Business <br/>Intelligence.</h1>
                    <p className="mt-6 text-indigo-100 text-lg font-medium opacity-80 max-w-sm">
                      Streamline your financial operations with our next-generation ERP platform. Designed for precision and speed.
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-indigo-50">Trusted by 500+ teams</p>
                  </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
                    <div className="mb-10">
                      <h2 className="text-3xl font-black text-text-main">Welcome Back</h2>
                      <p className="text-text-muted mt-2 font-medium">Please enter your details to access your account.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2 bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-accent-red font-bold flex items-center">
                                <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-text-main font-bold placeholder-slate-400 ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none"
                                    placeholder="admin@erpmota.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-text-main font-bold placeholder-slate-400 ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-border" />
                            <span className="text-sm font-bold text-text-muted">Remember me</span>
                          </label>
                          <a href="#" className="text-sm font-black text-primary hover:text-indigo-700 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center space-x-3 py-4 px-6 bg-primary hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-primary/20 font-black text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 group"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                  <span>Sign in to System</span>
                                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-border text-center">
                      <p className="text-sm text-text-muted font-medium">
                        Don't have an account? <a href="#" className="text-primary font-black hover:underline underline-offset-4">Contact Support</a>
                      </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
