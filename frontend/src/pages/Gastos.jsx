import React, { useState, useEffect } from 'react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

export default function Gastos() {
    const [gastos, setGastos] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState({ description: '', category: 'Operativo', amount: '', expense_date: new Date().toISOString().split('T')[0], banca_id: '' });

    useEffect(() => { fetchGastos(); fetchBancas(); }, []);

    const fetchGastos = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/gastos`, { credentials: 'include' });
            setGastos(await r.json());
        } finally { setLoading(false); }
    };

    const fetchBancas = async () => {
        const r = await fetch(`${API}/bancas`, { credentials: 'include' });
        setBancas(await r.json());
    };

    const openCreate = () => { setCurrent(null); setForm({ description: '', category: 'Operativo', amount: '', expense_date: new Date().toISOString().split('T')[0], banca_id: '' }); setShowModal(true); };
    const openEdit = (g) => { setCurrent(g); setForm({ description: g.description, category: g.category, amount: g.amount, expense_date: g.expense_date, banca_id: g.banca_id || '' }); setShowModal(true); };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const url = current ? `${API}/gastos/${current.id}` : `${API}/gastos`;
        const method = current ? 'PUT' : 'POST';
        await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); fetchGastos();
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar gasto?')) return;
        await fetch(`${API}/gastos/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchGastos();
    };

    const categorias = ['Operativo', 'Arriendo', 'Servicios', 'Suministros', 'Mantenimiento', 'Otro'];

    return (
        <div className="font-sans">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-orange-500 pl-3">Gastos</h1>
                <button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">+ Nuevo Gasto</button>
            </div>

            {loading ? <p className="text-slate-500">Cargando...</p> : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Descripción</th>
                                <th className="px-4 py-3 text-left">Categoría</th>
                                <th className="px-4 py-3 text-right">Monto</th>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-left">Banca</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastos.map(g => (
                                <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{g.description}</td>
                                    <td className="px-4 py-3"><span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">{g.category}</span></td>
                                    <td className="px-4 py-3 text-right text-red-600 font-semibold">-RD$ {fmt(g.amount)}</td>
                                    <td className="px-4 py-3 text-slate-600">{g.expense_date}</td>
                                    <td className="px-4 py-3 text-slate-600">{g.banca_name || '—'}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEdit(g)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                        <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            {gastos.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No hay gastos registrados</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">{current ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input required placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                {categorias.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <input required placeholder="Monto" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input required type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="">Sin Banca</option>
                                {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border">Cancelar</button>
                                <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
