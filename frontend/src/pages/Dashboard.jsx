import React, { useState, useEffect } from 'react';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
        total_bancas: 0,
        total_empleados: 0,
        ingresos_mes: 0,
        gastos_mes: 0,
        balance_neto: 0,
        periodo: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/dashboard', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse text-slate-500 font-medium">Cargando métricas...</div>;
    }

    return (
        <div className="font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Panel Principal</h1>
                <p className="text-slate-500 mt-2 pl-5">Métricas correspondientes al período: <span className="font-semibold text-slate-700 capitalize">{metrics.periodo}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Balance Neto */}
                <div className={`p-6 rounded-2xl shadow-sm border ${metrics.balance_neto >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} lg:col-span-2`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold uppercase tracking-wider text-sm ${metrics.balance_neto >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Balance Neto</h3>
                        <div className={`p-2 rounded-lg ${metrics.balance_neto >= 0 ? 'bg-emerald-100/50' : 'bg-red-100/50'}`}>
                            <svg className={`w-6 h-6 ${metrics.balance_neto >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <p className={`text-4xl font-black ${metrics.balance_neto >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                        RD$ {metrics.balance_neto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-4 flex gap-4 text-sm font-medium">
                        <span className="text-green-700 bg-green-100/50 px-2 py-1 rounded">Ingresos: +{metrics.ingresos_mes.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                        <span className="text-red-700 bg-red-100/50 px-2 py-1 rounded">Gastos: -{metrics.gastos_mes.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Bancas Reales */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Bancas Activas</h3>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{metrics.total_bancas}</p>
                </div>

                {/* Empleados Reales */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Plantilla</h3>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{metrics.total_empleados}</p>
                </div>

            </div>
        </div>
    );
}
