import React, { useState, useEffect } from 'react';
import { Save, Upload, Building2, Globe, CheckCircle2, AlertCircle, Image as ImageIcon, X, ChevronDown } from 'lucide-react';

export default function Configuration() {
    const [settings, setSettings] = useState({
        company_name: '',
        system_currency: 'DOP',
        logo: ''
    });

    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/settings', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            let currentSettings = { ...settings };

            if (logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);

                const logoRes = await fetch('https://api-v2.salamihost.lat/api/settings/logo', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (logoRes.ok) {
                    const logoData = await logoRes.json();
                    currentSettings.logo = logoData.url;
                    setSettings(prev => ({ ...prev, logo: logoData.url }));
                } else {
                    const lData = await logoRes.json();
                    throw new Error(lData.error || 'Error al subir el logo');
                }
            }

            const res = await fetch('https://api-v2.salamihost.lat/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'true',
                body: JSON.stringify({
                    company_name: currentSettings.company_name,
                    system_currency: currentSettings.system_currency
                })
            });

            if (res.ok) {
                setMessage({ text: 'Configuración actualizada con éxito', type: 'success' });
                setLogoFile(null);
            } else {
                throw new Error('Error al guardar los datos');
            }

        } catch (error) {
            console.error(error);
            setMessage({ text: error.message || 'Error de conexión', type: 'error' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
              <h1 className="text-3xl font-black text-text-main tracking-tight leading-tight">Configuración del Sistema</h1>
              <p className="text-text-muted mt-1 font-medium">Configuración global e identidad visual para su organización.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[48px] border border-border overflow-hidden p-12 shadow-md relative">
                {message.text && (
                    <div className={`p-6 mb-8 rounded-[24px] font-bold text-sm flex items-center animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-accent-green border border-green-100' : 'bg-red-50 text-accent-red border border-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} className="mr-3" /> : <AlertCircle size={20} className="mr-3" />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                                <Building2 size={14} className="mr-2 text-primary" /> Identidad de la Empresa
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                value={settings.company_name}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none text-text-main shadow-inner"
                                placeholder="Ej: Orlando Enterprises S.A."
                                required
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                                <Globe size={14} className="mr-2 text-primary" /> Sistema de Moneda
                            </label>
                            <select
                                name="system_currency"
                                value={settings.system_currency}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none text-text-main appearance-none cursor-pointer shadow-inner pr-12"
                            >
                                <option value="USD">Dólar Estadounidense (USD)</option>
                                <option value="DOP">Peso Dominicano (RD$)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="MXN">Peso Mexicano (MXN)</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                            <ImageIcon size={14} className="mr-2 text-primary" /> Identidad Visual (Logo)
                        </label>
                        
                        <div 
                          className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 rounded-[40px] border-2 border-dashed border-border overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-all hover:bg-slate-100/50 shadow-inner"
                          onClick={() => document.getElementById('logoInput').click()}
                        >
                            {settings.logo ? (
                                <img
                                    src={`https://api-v2.salamihost.lat${settings.logo}`}
                                    alt="Logo de la Marca"
                                    className="max-h-32 max-w-[80%] object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-text-muted group-hover:text-primary transition-colors p-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
                                      <Upload size={32} className="text-primary/40 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-sm font-black text-text-main">No hay logo definido</p>
                                    <p className="text-[10px] mt-2 uppercase tracking-[0.2em] font-black opacity-40">Click para subir imagen</p>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white px-8 py-3 rounded-full shadow-2xl text-primary text-xs font-black uppercase tracking-[0.2em]">
                                  Cambiar Logo
                                </div>
                            </div>
                        </div>

                        <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                        {logoFile && (
                            <div className="flex items-center justify-between p-6 bg-primary/5 text-primary rounded-[32px] border border-primary/10 animate-in fade-in duration-300 shadow-sm">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <ImageIcon size={20} />
                                  </div>
                                  <span className="text-sm font-black truncate max-w-[180px]">{logoFile.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 px-4 py-1.5 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                  Listo para Sincronizar
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-16 pt-10 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-4 bg-primary hover:bg-indigo-700 text-white font-black py-5 px-12 rounded-[28px] shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <Save size={22} strokeWidth={2.5} />
                        )}
                        <span className="text-sm uppercase tracking-widest">{loading ? 'Guardando Cambios...' : 'Guardar Configuración'}</span>
                    </button>
                </div>
            </form>

            <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 shadow-inner flex items-center space-x-6">
                <div className="w-16 h-16 rounded-[24px] bg-white border border-border/50 flex items-center justify-center text-primary/40 shadow-sm">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h4 className="font-black text-text-main tracking-tight">Entorno del Sistema</h4>
                  <p className="text-xs text-text-muted mt-1 font-bold">API v2.0-stable | Node 18 | Entorno de Producción</p>
                </div>
            </div>
        </div>
    );
}
