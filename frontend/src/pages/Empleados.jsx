import React, { useState, useEffect } from 'react';

const API = 'https://api-v2.salamihost.lat/api';

export default function Empleados() {
    const [empleados, setEmpleados] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', salary: '', status: 'Activo', banca_id: '' });

    useEffect(() => { fetchEmpleados(); fetchBancas(); }, []);

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/empleados`, { credentials: 'include' });
            setEmpleados(await r.json());
        } finally { setLoading(false); }
    };

    const fetchBancas = async () => {
        const r = await fetch(`${API}/bancas`, { credentials: 'include' });
        setBancas(await r.json());
    };

    const openCreate = () => { setCurrent(null); setForm({ name: '', role: '', email: '', phone: '', salary: '', status: 'Activo', banca_id: '' }); setShowModal(true); };
    const openEdit = (e) => { setCurrent(e); setForm({ name: e.name, role: e.role || '', email: e.email || '', phone: e.phone || '', salary: e.salary || '', status: e.status, banca_id: e.banca_id || '' }); setShowModal(true); };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const url = current ? `${API}/empleados/${current.id}` : `${API}/empleados`;
        const method = current ? 'PUT' : 'POST';
        await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); fetchEmpleados();
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar empleado?')) return;
        await fetch(`${API}/empleados/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchEmpleados();
    };

    return (
        <div className="font-sans">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-3">Empleados</h1>
                <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm">+ Nuevo Empleado</button>
            </div>

            {loading ? <p className="text-slate-500">Cargando...</p> : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Rol</th>
                                <th className="px-4 py-3 text-left">Teléfono</th>
                                <th className="px-4 py-3 text-left">Salario</th>
                                <th className="px-4 py-3 text-left">Banca</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleados.map(e => (
                                <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{e.role}</td>
                                    <td className="px-4 py-3 text-slate-600">{e.phone}</td>
                                    <td className="px-4 py-3 text-slate-600">RD$ {parseFloat(e.salary || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-slate-600">{e.banca_name || '—'}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{e.status}</span></td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEdit(e)} className="text-indigo-600 hover:underline text-xs">Editar</button>
                                        <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            {empleados.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No hay empleados registrados</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">{current ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input required placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input placeholder="Rol / Cargo" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" type="email" />
                            <input placeholder="Salario" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" type="number" />
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option>Activo</option><option>Inactivo</option>
                            </select>
                            <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="">Sin Banca</option>
                                {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border">Cancelar</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
