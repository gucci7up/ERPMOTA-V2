import React, { useState, useEffect } from 'react';
import { Save, Upload, Building2, Globe, CheckCircle2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';

export default function Configuration() {
    const [settings, setSettings] = useState({
        company_name: '',
        system_currency: 'USD',
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
                    credentials: 'true',
                    body: formData
                });

                if (logoRes.ok) {
                    const logoData = await logoRes.json();
                    currentSettings.logo = logoData.url;
                    setSettings(prev => ({ ...prev, logo: logoData.url }));
                } else {
                    const lData = await logoRes.json();
                    throw new Error(lData.error || 'Error uploading logo');
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
                setMessage({ text: 'Settings updated successfully', type: 'success' });
                setLogoFile(null);
            } else {
                throw new Error('Error saving data');
            }

        } catch (error) {
            console.error(error);
            setMessage({ text: error.message || 'Connection error', type: 'error' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
              <h1 className="text-3xl font-bold text-text-main">System Settings</h1>
              <p className="text-text-muted mt-1">Global configuration and branding for your organization.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-border overflow-hidden p-12 shadow-sm relative">
                {message.text && (
                    <div className={`p-6 mb-8 rounded-[24px] font-bold text-sm flex items-center animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-accent-green border border-green-100' : 'bg-red-50 text-accent-red border border-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} className="mr-3" /> : <AlertCircle size={20} className="mr-3" />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                                <Building2 size={14} className="mr-2" /> Company Identity
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                value={settings.company_name}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-text-main"
                                placeholder="e.g. Orlando Enterprises S.A."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                                <Globe size={14} className="mr-2" /> Currency System
                            </label>
                            <select
                                name="system_currency"
                                value={settings.system_currency}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-text-main appearance-none cursor-pointer"
                            >
                                <option value="USD">United States Dollar (USD)</option>
                                <option value="DOP">Dominican Peso (DOP)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="MXN">Mexican Peso (MXN)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                            <ImageIcon size={14} className="mr-2" /> Visual Identity
                        </label>
                        
                        <div 
                          className="h-56 w-full flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-border overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-all hover:bg-slate-100/50"
                          onClick={() => document.getElementById('logoInput').click()}
                        >
                            {settings.logo ? (
                                <img
                                    src={`https://api-v2.salamihost.lat${settings.logo}`}
                                    alt="Brand Logo"
                                    className="max-h-32 max-w-[80%] object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-text-muted group-hover:text-primary transition-colors">
                                    <div className="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center mb-4 group-hover:bg-primary/10">
                                      <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-bold">No logo defined</p>
                                    <p className="text-[10px] mt-1 uppercase tracking-widest font-black opacity-50">Click to upload</p>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white px-6 py-2.5 rounded-full shadow-lg text-primary text-xs font-black uppercase tracking-widest">
                                  Change Logo
                                </div>
                            </div>
                        </div>

                        <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                        {logoFile && (
                            <div className="flex items-center justify-between p-4 bg-primary/5 text-primary rounded-2xl border border-primary/10 animate-in fade-in duration-300">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <ImageIcon size={16} />
                                  </div>
                                  <span className="text-sm font-bold truncate max-w-[200px]">{logoFile.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-tighter">
                                  Ready to sync
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-10 border-t border-border flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-3 bg-primary hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <Save size={20} />
                        )}
                        <span>{loading ? 'Saving Changes...' : 'Save Configuration'}</span>
                    </button>
                </div>
            </form>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-text-muted">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">System Environment</h4>
                  <p className="text-xs text-text-muted mt-1">Running on API v2.0-stable | Node 18 | Production Environment</p>
                </div>
              </div>
            </div>
        </div>
    );
}
