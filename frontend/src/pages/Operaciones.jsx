import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, ArrowRight, MapPin } from 'lucide-react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                  <h1 className="text-3xl font-bold text-text-main">Operations Records</h1>
                  <p className="text-text-muted mt-1">Monitor daily sales, prizes, and branch balances.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  <span>New Entry</span>
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-[32px] border border-border flex flex-wrap items-center gap-4 shadow-sm">
                <div className="flex items-center space-x-2 text-text-muted">
                    <Filter size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Filters:</span>
                </div>
                <select 
                  value={filter.banca_id} 
                  onChange={e => setFilter({ ...filter, banca_id: e.target.value })} 
                  className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none cursor-pointer appearance-none pr-8"
                >
                    <option value="">All Locations</option>
                    {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex items-center space-x-2">
                  <input type="date" value={filter.start_date} onChange={e => setFilter({ ...filter, start_date: e.target.value })} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                  <ArrowRight size={14} className="text-text-muted" />
                  <input type="date" value={filter.end_date} onChange={e => setFilter({ ...filter, end_date: e.target.value })} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                </div>
            </div>

            {/* Totales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Gross Sales', val: totals.total_ventas, color: 'accent-green', icon: TrendingUp },
                  { label: 'Prizes Paid', val: totals.total_premios, color: 'accent-red', icon: TrendingDown },
                  { label: 'Branch Expenses', val: totals.total_gastos, color: 'accent-orange', icon: DollarSign },
                  { label: 'Net Balance', val: totals.balance_neto, color: 'primary', icon: DollarSign }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-border shadow-sm">
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl font-black mt-1 ${stat.label === 'Net Balance' ? (parseFloat(stat.val) >= 0 ? 'text-primary' : 'text-accent-red') : 'text-text-main'}`}>
                          RD$ {fmt(stat.val)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-border overflow-hidden p-8 shadow-sm">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-slate-50">
                                    <th className="pb-4 px-4 font-bold">Date</th>
                                    <th className="pb-4 px-4 font-bold">Location</th>
                                    <th className="pb-4 px-4 text-right font-bold">Gross Sales</th>
                                    <th className="pb-4 px-4 text-right font-bold">Prizes</th>
                                    <th className="pb-4 px-4 text-right font-bold">Expenses</th>
                                    <th className="pb-4 px-4 text-right font-bold">Net Balance</th>
                                    <th className="pb-4 px-4 text-right font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {rows.map(r => (
                                    <tr key={r.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-5 px-4">
                                          <div className="flex items-center space-x-2">
                                            <Calendar size={14} className="text-text-muted" />
                                            <span className="font-bold text-text-main">{r.operation_date}</span>
                                          </div>
                                        </td>
                                        <td className="py-5 px-4">
                                          <div className="flex items-center text-text-muted font-bold">
                                            <MapPin size={14} className="mr-1 text-primary/60" />
                                            {r.banca_name}
                                          </div>
                                        </td>
                                        <td className="py-5 px-4 text-right text-accent-green font-bold">+{fmt(r.ventas_brutas)}</td>
                                        <td className="py-5 px-4 text-right text-accent-red font-medium">-{fmt(r.premios_pagados)}</td>
                                        <td className="py-5 px-4 text-right text-accent-orange font-medium">-{fmt(r.gastos_banca)}</td>
                                        <td className={`py-5 px-4 text-right font-black text-base ${parseFloat(r.balance_neto) >= 0 ? 'text-primary' : 'text-accent-red'}`}>
                                          RD$ {fmt(r.balance_neto)}
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(r)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-2 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="py-12 text-center text-text-muted font-medium">No operations records match the criteria.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-text-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md border border-border relative">
                        <button 
                          onClick={() => setShowModal(false)}
                          className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors p-2 hover:bg-slate-50 rounded-full"
                        >
                          <X size={24} />
                        </button>

                        <div className="mb-8">
                             <h2 className="text-3xl font-bold text-text-main">{current ? 'Edit Entry' : 'Manual Entry'}</h2>
                             <p className="text-text-muted">Register daily operational figures.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Location / Branch</label>
                              <select required value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                  <option value="">Select Location</option>
                                  {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Date of Operation</label>
                              <input required type="date" value={form.operation_date} onChange={e => setForm({ ...form, operation_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="relative">
                                <span className="absolute left-4 top-3.5 text-accent-green text-sm font-bold">RD$</span>
                                <input required placeholder="Gross Sales" type="number" step="0.01" value={form.ventas_brutas} onChange={e => setForm({ ...form, ventas_brutas: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold" />
                              </div>
                              <div className="relative">
                                <span className="absolute left-4 top-3.5 text-accent-red text-sm font-bold">RD$</span>
                                <input required placeholder="Prizes Paid" type="number" step="0.01" value={form.premios_pagados} onChange={e => setForm({ ...form, premios_pagados: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold" />
                              </div>
                              <div className="relative">
                                <span className="absolute left-4 top-3.5 text-accent-orange text-sm font-bold">RD$</span>
                                <input required placeholder="Branch Expenses" type="number" step="0.01" value={form.gastos_banca} onChange={e => setForm({ ...form, gastos_banca: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold" />
                              </div>
                            </div>

                            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider leading-none">Net Balance:</span>
                                <span className="text-xl font-black text-primary">
                                  RD$ {fmt((parseFloat(form.ventas_brutas) || 0) - (parseFloat(form.premios_pagados) || 0) - (parseFloat(form.gastos_banca) || 0))}
                                </span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 rounded-2xl text-sm font-bold border border-border text-text-main hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-4 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all">
                                  {current ? 'Update entry' : 'Confirm & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
