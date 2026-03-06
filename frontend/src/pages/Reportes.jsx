import React, { useState } from 'react';
import { Download, Calendar, BarChart3, FileSpreadsheet, ArrowRight, Info } from 'lucide-react';

export default function Reportes() {
    const [dateFilter, setDateFilter] = useState({
        start: '',
        end: new Date().toISOString().split('T')[0]
    });

    const handleDownloadExcel = () => {
        let url = 'https://api-v2.salamihost.lat/api/reportes/excel';

        const params = new URLSearchParams();
        if (dateFilter.start) params.append('start_date', dateFilter.start);
        if (dateFilter.end) params.append('end_date', dateFilter.end);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        window.open(url, '_blank');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
              <h1 className="text-3xl font-black text-text-main tracking-tight leading-tight">Reportes Financieros</h1>
              <p className="text-text-muted mt-1 font-medium">Exporte los datos de su negocio para análisis profundo y contabilidad.</p>
            </div>

            <div className="bg-white rounded-[48px] border border-border overflow-hidden p-12 shadow-sm relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <BarChart3 size={240} className="text-primary" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                    <div className="flex-1 space-y-10">
                        <div>
                          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-primary/10">
                            <FileSpreadsheet size={14} />
                            <span>Centro de Exportación</span>
                          </div>
                          <h2 className="text-4xl font-black text-text-main tracking-tight">Libro Mayor Consolidado</h2>
                          <p className="text-text-muted mt-6 text-base leading-relaxed max-w-xl font-medium">
                            Este reporte unifica todos los ingresos de las operaciones, restando gastos variables, liquidaciones de costos fijos y nómina. Ideal para preparación de impuestos y revisiones de desempeño mensual.
                          </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center space-x-3 text-text-main">
                                <Calendar size={20} className="text-primary" />
                                <span className="font-black text-xs uppercase tracking-[0.2em]">Seleccionar Rango de Fechas</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1 space-y-2">
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Desde</label>
                                    <input 
                                      type="date" 
                                      value={dateFilter.start} 
                                      onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-text-main shadow-inner" 
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Hasta</label>
                                    <input 
                                      type="date" 
                                      value={dateFilter.end} 
                                      onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-text-main shadow-inner" 
                                    />
                                </div>
                            </div>

                            <button 
                              onClick={handleDownloadExcel} 
                              className="w-full sm:w-auto inline-flex items-center justify-center space-x-4 bg-primary hover:bg-indigo-700 text-white px-12 py-5 rounded-[28px] shadow-2xl shadow-primary/30 font-black text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Download size={20} strokeWidth={2.5} />
                                <span>Exportar a Excel / CSV</span>
                                <ArrowRight size={18} className="opacity-40" />
                            </button>
                        </div>

                        <div className="flex items-start space-x-4 p-8 bg-slate-50 rounded-[32px] border border-slate-100 max-w-xl shadow-inner">
                          <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-text-muted leading-relaxed font-bold">
                            <strong className="text-text-main font-black">Nota:</strong> El proceso de exportación puede tardar unos segundos dependiendo del volumen de datos en el rango seleccionado. Por favor, no cierre la ventana.
                          </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Detalle de Operaciones', desc: 'Desglose diario de ventas y premios.', icon: BarChart3 },
                { title: 'Resumen Fiscal', desc: 'Cifras fiscales consolidadas por periodos.', icon: FileSpreadsheet },
                { title: 'Registro de Auditoría', desc: 'Seguimiento de todos los cambios.', icon: Info }
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-border shadow-sm group hover:border-primary/20 transition-all cursor-not-allowed grayscale opacity-60">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <card.icon size={22} />
                  </div>
                  <h3 className="font-black text-text-main text-sm tracking-tight">{card.title}</h3>
                  <p className="text-[11px] text-text-muted mt-2 font-medium leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
        </div>
    );
}
