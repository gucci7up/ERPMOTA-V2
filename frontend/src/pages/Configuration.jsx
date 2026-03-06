import React, { useState, useEffect } from 'react';

export default function Configuration() {
    const [settings, setSettings] = useState({
        company_name: '',
        system_currency: 'USD',
        logo: ''
    });

    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Cargar configuraciones iniciales
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/settings', {
                credentials: 'true'
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
            // 1. Si hay un archivo nuevo, lo subimos primero
            let currentSettings = { ...settings };

            if (logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);

                const logoRes = await fetch('http://localhost:8000/api/settings/logo', {
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
                    throw new Error(lData.error || 'Error al subir el logo');
                }
            }

            // 2. Guardar el resto de configuraciones JSON
            const res = await fetch('http://localhost:8000/api/settings', {
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
                setMessage({ text: 'Configuraciones guardadas correctamente', type: 'success' });
                setLogoFile(null); // Resetear el input file tras éxito
            } else {
                throw new Error('Error al guardar datos');
            }

        } catch (error) {
            console.error(error);
            setMessage({ text: error.message || 'Error de conexión', type: 'error' });
        } finally {
            setLoading(false);
            // Ocultar mensaje después de unos segundos
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto my-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Ajustes del Sistema</h1>
                <p className="text-slate-500 mt-2 pl-5">Administra la información pública y moneda de la empresa.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg font-medium text-sm flex items-center shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <svg className="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {message.type === 'success' ?
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> :
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                        </svg>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Lado Izquierdo: Formularios Texto */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nombre de la Empresa
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                value={settings.company_name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner text-slate-800"
                                placeholder="Ej. Mi ERP S.A."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Moneda del Sistema
                            </label>
                            <select
                                name="system_currency"
                                value={settings.system_currency}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
                            >
                                <option value="USD">Dólares (USD)</option>
                                <option value="DOP">Pesos Dominicanos (DOP)</option>
                                <option value="EUR">Euros (EUR)</option>
                                <option value="MXN">Pesos Mexicanos (MXN)</option>
                            </select>
                        </div>
                    </div>

                    {/* Lado Derecho: Logo Upload o Preview */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative shadow-inner">

                        <h3 className="text-sm font-semibold text-slate-700 w-full text-center border-b border-slate-200 pb-3 mb-4">
                            Logotipo Actual
                        </h3>

                        <div className="h-40 w-full flex items-center justify-center bg-white rounded-lg border border-slate-300 overflow-hidden relative shadow-sm mb-6 group cursor-pointer" onClick={() => document.getElementById('logoInput').click()}>
                            {settings.logo ? (
                                <img
                                    src={`http://localhost:8000${settings.logo}`}
                                    alt="Logo Empresa"
                                    className="max-h-full max-w-full object-contain p-2"
                                />
                            ) : (
                                <span className="text-slate-400 text-sm font-medium flex flex-col items-center">
                                    <svg className="w-8 h-8 mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Sin logo definido
                                </span>
                            )}

                            {/* Overlay de Carga Visual */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Click para cambiar</span>
                            </div>
                        </div>

                        <input
                            id="logoInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {logoFile && (
                            <div className="w-full flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200">
                                <span className="truncate max-w-[200px]">{logoFile.name}</span>
                                <span className="font-semibold px-2 py-0.5 bg-blue-200 text-blue-800 rounded">Listo para subir</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        )}
                        <span>{loading ? 'Guardando Cambios...' : 'Guardar Ajustes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
