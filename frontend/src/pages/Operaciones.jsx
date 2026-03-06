import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, ArrowRight, MapPin } from 'lucide-react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Operaciones() {
    const [rows, setRows] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [totals, setTotals] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ banca_id: '', start_date: '', end_date: '' });
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState({ banca_id: '', operation_date: new Date().toISOString().split('T')[0], ventas_brutas: '', premios_pagados: '', gastos_banca: '' });

    useEffect(() => { fetchData(); fetchBancas(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.banca_id) params.append('banca_id', filter.banca_id);
        if (filter.start_date) params.append('start_date', filter.start_date);
        if (filter.end_date) params.append('end_date', filter.end_date);
        try {
            const r = await fetch(`${API}/operaciones?${params}`, { credentials: 'include' });
            const res = await r.json();
            setRows(Array.isArray(res.data) ? res.data : []);
            setTotals(res && typeof res === 'object' ? res : {});
        } catch (e) { setRows([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filter]);

    const fetchBancas = async () => {
        try {
            const r = await fetch(`${API}/bancas`, { credentials: 'include' });
            const data = await r.json();
            setBancas(Array.isArray(data) ? data : []);
        } catch (e) { setBancas([]); }
    };

    const openCreate = () => { setCurrent(null); setForm({ banca_id: '', operation_date: new Date().toISOString().split('T')[0], ventas_brutas: '', premios_pagados: '', gastos_banca: '' }); setShowModal(true); };
    const openEdit = (r) => { setCurrent(r); setForm({ banca_id: r.banca_id, operation_date: r.operation_date, ventas_brutas: r.ventas_brutas, premios_pagados: r.premios_pagados, gastos_banca: r.gastos_banca }); setShowModal(true); };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const url = current ? `${API}/operaciones/${current.id}` : `${API}/operaciones`;
        const method = current ? 'PUT' : 'POST';
        await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); fetchData();
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar operación?')) return;
        await fetch(`${API}/operaciones/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchData();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-text-main leading-tight tracking-tight">Registro de Operaciones</h1>
                  <p className="text-text-muted mt-1 font-medium">Monitoree ventas diarias, premios y balances de bancas.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={18} />
                  <span>Nueva Operación</span>
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-border flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3 text-text-muted">
                    <Filter size={20} className="text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Filtros:</span>
                </div>
                <div className="relative">
                    <select 
                      value={filter.banca_id} 
                      onChange={e => setFilter({ ...filter, banca_id: e.target.value })} 
                      className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none cursor-pointer appearance-none pr-10"
                    >
                        <option value="">Todas las Ubicaciones</option>
                        {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 bottom-3.5 text-text-muted pointer-events-none" />
                </div>
                <div className="flex items-center space-x-3 bg-slate-50 p-1.5 rounded-2xl ring-1 ring-border">
                  <input type="date" value={filter.start_date} onChange={e => setFilter({ ...filter, start_date: e.target.value })} className="bg-transparent border-none px-3 py-1.5 text-sm font-bold outline-none" />
                  <ArrowRight size={14} className="text-text-muted" />
                  <input type="date" value={filter.end_date} onChange={e => setFilter({ ...filter, end_date: e.target.value })} className="bg-transparent border-none px-3 py-1.5 text-sm font-bold outline-none" />
                </div>
            </div>

            {/* Totales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Ventas Brutas', val: totals.total_ventas, color: 'accent-green', icon: TrendingUp },
                  { label: 'Premios Pagados', val: totals.total_premios, color: 'accent-red', icon: TrendingDown },
                  { label: 'Gastos de Bancas', val: totals.total_gastos, color: 'accent-orange', icon: DollarSign },
                  { label: 'Balance Neto', val: totals.balance_neto, color: 'primary', icon: DollarSign }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-border group hover:border-primary/20 transition-all">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color} flex items-center justify-center mb-6`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <p className={`text-2xl font-black tracking-tighter ${stat.label === 'Balance Neto' ? (parseFloat(stat.val) >= 0 ? 'text-primary' : 'text-accent-red') : 'text-text-main'}`}>
                          RD$ {fmt(stat.val)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Fecha</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Ubicación</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Ventas Brutas</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Premios</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Gastos</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Balance Neto</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map(r => (
                                    <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                          <div className="flex items-center space-x-3">
                                            <Calendar size={14} className="text-primary/50" />
                                            <span className="font-bold text-text-main text-sm">{r.operation_date}</span>
                                          </div>
                                        </td>
                                        <td className="px-10 py-6">
                                          <div className="flex items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <MapPin size={14} className="mr-2 text-primary/40" />
                                            {r.banca_name}
                                          </div>
                                        </td>
                                        <td className="px-10 py-6 text-right text-accent-green font-bold text-sm">+{fmt(r.ventas_brutas)}</td>
                                        <td className="px-10 py-6 text-right text-accent-red font-bold text-sm">-{fmt(r.premios_pagados)}</td>
                                        <td className="px-10 py-6 text-right text-accent-orange font-bold text-sm">-{fmt(r.gastos_banca)}</td>
                                        <td className={`px-10 py-6 text-right font-black text-base tracking-tighter ${parseFloat(r.balance_neto) >= 0 ? 'text-primary' : 'text-accent-red'}`}>
                                          RD$ {fmt(r.balance_neto)}
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => openEdit(r)} className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-2.5 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="px-10 py-20 text-center text-text-muted font-bold">No hay registros de operaciones que coincidan con los criterios.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-text-main/30 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-lg border border-border overflow-hidden p-12">
                        <button 
                          onClick={() => setShowModal(false)}
                          className="absolute top-10 right-10 text-text-muted hover:text-text-main transition-colors p-2.5 hover:bg-slate-50 rounded-full"
                        >
                          <X size={28} />
                        </button>

                        <div className="mb-10 text-center sm:text-left">
                             <h2 className="text-3xl font-black text-text-main tracking-tight">{current ? 'Editar Registro' : 'Entrada Manual'}</h2>
                             <p className="text-text-muted font-medium mt-1">Registre las cifras operativas diarias.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2 space-y-2 relative">
                                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Ubicación / Banca</label>
                                  <select required value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                      <option value="">Seleccione Ubicación</option>
                                      {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                  </select>
                                  <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Fecha de Operación</label>
                                  <input required type="date" value={form.operation_date} onChange={e => setForm({ ...form, operation_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Ventas Brutas</label>
                                  <div className="relative">
                                    <span className="absolute left-6 top-4 text-accent-green text-[11px] font-black tracking-widest">RD$</span>
                                    <input required placeholder="0.00" type="number" step="0.01" value={form.ventas_brutas} onChange={e => setForm({ ...form, ventas_brutas: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-black" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Premios Pagados</label>
                                  <div className="relative">
                                    <span className="absolute left-6 top-4 text-accent-red text-[11px] font-black tracking-widest">RD$</span>
                                    <input required placeholder="0.00" type="number" step="0.01" value={form.premios_pagados} onChange={e => setForm({ ...form, premios_pagados: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-black" />
                                  </div>
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Gastos de Banca</label>
                                  <div className="relative">
                                    <span className="absolute left-6 top-4 text-accent-orange text-[11px] font-black tracking-widest">RD$</span>
                                    <input required placeholder="0.00" type="number" step="0.01" value={form.gastos_banca} onChange={e => setForm({ ...form, gastos_banca: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-black" />
                                  </div>
                                </div>
                            </div>

                            <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 flex justify-between items-center shadow-inner">
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Balance Neto:</span>
                                <span className="text-2xl font-black text-primary tracking-tighter">
                                  RD$ {fmt((parseFloat(form.ventas_brutas) || 0) - (parseFloat(form.premios_pagados) || 0) - (parseFloat(form.gastos_banca) || 0))}
                                </span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 rounded-2xl text-sm font-black border border-border text-text-main hover:bg-slate-50 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                  {current ? 'Guardar Cambios' : 'Confirmar y Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
