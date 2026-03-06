import React, { useState } from 'react';

export default function Reportes() {
    const [dateFilter, setDateFilter] = useState({
        start: '',
        end: new Date().toISOString().split('T')[0]
    });

    const handleDownloadExcel = () => {
        let url = 'http://localhost:8000/api/reportes/excel';

        const params = new URLSearchParams();
        if (dateFilter.start) params.append('start_date', dateFilter.start);
        if (dateFilter.end) params.append('end_date', dateFilter.end);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        // Abre el stream PHP para desencadenar el header de descarga
        window.open(url, '_blank');
    };

    return (
        <div className="font-sans max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-amber-500 pl-3">Reportes Financieros</h1>
                <p className="text-slate-500 mt-1 pl-4 text-sm">Centra de exportación global del ERP en formato Excel (CSV).</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Libro Mayor Consolidado</h3>
                        <p className="text-sm text-slate-500 mb-6">Este reporte unifica cronológicamente todos los ingresos procedentes de operaciones, descontando los gastos variables, liquidación de gastos fijos y nómina.</p>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Desde</label>
                                <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg w-full text-sm bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Hasta</label>
                                <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg w-full text-sm bg-slate-50" />
                            </div>
                        </div>

                        <button onClick={handleDownloadExcel} className="inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl shadow-md font-bold transition-all transform hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span>Descargar Reporte Excel / CSV</span>
                        </button>
                    </div>

                    <div className="w-48 hidden md:block opacity-80">
                        <svg className="text-amber-100 w-full h-full" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"></path></svg>
                    </div>

                </div>
            </div>
        </div>
    );
}
