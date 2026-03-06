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
              <h1 className="text-3xl font-bold text-text-main">Financial Reports</h1>
              <p className="text-text-muted mt-1">Export your business data for deep analysis and accounting.</p>
            </div>

            <div className="bg-white rounded-[40px] border border-border overflow-hidden p-12 shadow-sm relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <BarChart3 size={240} className="text-primary" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                    <div className="flex-1 space-y-8">
                        <div>
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary/10">
                            <FileSpreadsheet size={14} />
                            <span>Export Center</span>
                          </div>
                          <h2 className="text-3xl font-black text-text-main">Consolidated Ledger</h2>
                          <p className="text-text-muted mt-4 leading-relaxed max-w-xl">
                            This report unifies all income from operations, subtracting variable expenses, fixed cost settlements, and payroll. Perfect for tax preparation and monthly performance reviews.
                          </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 text-text-main">
                                <Calendar size={20} className="text-primary" />
                                <span className="font-bold text-sm uppercase tracking-widest">Select Date Range</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">From</label>
                                    <input 
                                      type="date" 
                                      value={dateFilter.start} 
                                      onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-text-main shadow-inner" 
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">To</label>
                                    <input 
                                      type="date" 
                                      value={dateFilter.end} 
                                      onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-text-main shadow-inner" 
                                    />
                                </div>
                            </div>

                            <button 
                              onClick={handleDownloadExcel} 
                              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-primary hover:bg-indigo-700 text-white px-10 py-5 rounded-[24px] shadow-xl shadow-primary/20 font-black text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Download size={20} strokeWidth={2.5} />
                                <span>Export to Excel / CSV</span>
                                <ArrowRight size={18} className="opacity-50" />
                            </button>
                        </div>

                        <div className="flex items-start space-x-3 p-6 bg-slate-50 rounded-[24px] border border-slate-100 max-w-xl">
                          <Info size={18} className="text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-text-muted leading-relaxed font-medium">
                            <strong className="text-text-main">Note:</strong> The export process might take a few seconds depending on the volume of data in the selected range. Please do not close the window.
                          </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Operations Detail', desc: 'Daily sales and prize breakdown.', icon: BarChart3 },
                { title: 'Tax Summary', desc: 'Consolidated tax figures for periods.', icon: FileSpreadsheet },
                { title: 'Audit Log', desc: 'Track all changes and manual entries.', icon: Info }
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-border shadow-sm group hover:border-primary/30 transition-all cursor-not-allowed grayscale opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <card.icon size={20} />
                  </div>
                  <h3 className="font-bold text-text-main">{card.title}</h3>
                  <p className="text-xs text-text-muted mt-2">{card.desc}</p>
                </div>
              ))}
            </div>
        </div>
    );
}
