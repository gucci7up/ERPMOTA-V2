import React, { useState, useEffect } from 'react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

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
        <div className="font-sans">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-emerald-500 pl-3">Operaciones</h1>
                <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm">+ Nueva Operación</button>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 flex flex-wrap gap-3">
                <select value={filter.banca_id} onChange={e => setFilter({ ...filter, banca_id: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
                    <option value="">Todas las Bancas</option>
                    {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input type="date" value={filter.start_date} onChange={e => setFilter({ ...filter, start_date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={filter.end_date} onChange={e => setFilter({ ...filter, end_date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            </div>

            {/* Totales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[['Ventas Brutas', totals.total_ventas, 'green'], ['Premios Pagados', totals.total_premios, 'red'], ['Gastos Banca', totals.total_gastos, 'orange'], ['Balance Neto', totals.balance_neto, totals.balance_neto >= 0 ? 'emerald' : 'red']].map(([label, val, color]) => (
                    <div key={label} className="bg-white p-4 rounded-xl border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                        <p className={`text-xl font-bold text-${color}-600`}>RD$ {fmt(val)}</p>
                    </div>
                ))}
            </div>

            {loading ? <p className="text-slate-500">Cargando...</p> : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-left">Banca</th>
                                <th className="px-4 py-3 text-right">Ventas</th>
                                <th className="px-4 py-3 text-right">Premios</th>
                                <th className="px-4 py-3 text-right">Gastos</th>
                                <th className="px-4 py-3 text-right">Neto</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3">{r.operation_date}</td>
                                    <td className="px-4 py-3 font-medium">{r.banca_name}</td>
                                    <td className="px-4 py-3 text-right text-green-700">+{fmt(r.ventas_brutas)}</td>
                                    <td className="px-4 py-3 text-right text-red-600">-{fmt(r.premios_pagados)}</td>
                                    <td className="px-4 py-3 text-right text-orange-600">-{fmt(r.gastos_banca)}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${parseFloat(r.balance_neto) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(r.balance_neto)}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No hay operaciones registradas</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">{current ? 'Editar Operación' : 'Nueva Operación'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <select required value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="">Seleccionar Banca</option>
                                {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <input required type="date" value={form.operation_date} onChange={e => setForm({ ...form, operation_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input required placeholder="Ventas Brutas" type="number" step="0.01" value={form.ventas_brutas} onChange={e => setForm({ ...form, ventas_brutas: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input required placeholder="Premios Pagados" type="number" step="0.01" value={form.premios_pagados} onChange={e => setForm({ ...form, premios_pagados: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input required placeholder="Gastos de Banca" type="number" step="0.01" value={form.gastos_banca} onChange={e => setForm({ ...form, gastos_banca: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <p className="text-sm text-slate-500">Balance Neto = {fmt((parseFloat(form.ventas_brutas) || 0) - (parseFloat(form.premios_pagados) || 0) - (parseFloat(form.gastos_banca) || 0))}</p>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border">Cancelar</button>
                                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
