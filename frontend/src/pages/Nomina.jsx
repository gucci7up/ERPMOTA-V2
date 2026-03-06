import React, { useState, useEffect } from 'react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

export default function Nomina() {
    const [pagos, setPagos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(null);
    const initForm = { empleado_id: '', banca_id: '', month_year: new Date().toISOString().slice(0, 7), payment_date: new Date().toISOString().split('T')[0], base_salary: '', ars_deduction: '0', afp_deduction: '0', other_deductions: '0', bonuses: '0', status: 'Pagado' };
    const [form, setForm] = useState(initForm);

    useEffect(() => { fetchPagos(); fetchEmpleados(); fetchBancas(); }, []);

    const fetchPagos = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/pagos-nomina`, { credentials: 'include' });
            setPagos(await r.json());
        } finally { setLoading(false); }
    };

    const fetchEmpleados = async () => {
        const r = await fetch(`${API}/empleados`, { credentials: 'include' });
        setEmpleados(await r.json());
    };

    const fetchBancas = async () => {
        const r = await fetch(`${API}/bancas`, { credentials: 'include' });
        setBancas(await r.json());
    };

    const calcNeto = (f) => (parseFloat(f.base_salary) || 0) - (parseFloat(f.ars_deduction) || 0) - (parseFloat(f.afp_deduction) || 0) - (parseFloat(f.other_deductions) || 0) + (parseFloat(f.bonuses) || 0);

    const openCreate = () => { setCurrent(null); setForm(initForm); setShowModal(true); };
    const openEdit = (p) => { setCurrent(p); setForm({ empleado_id: p.empleado_id, banca_id: p.banca_id || '', month_year: p.month_year, payment_date: p.payment_date, base_salary: p.base_salary, ars_deduction: p.ars_deduction, afp_deduction: p.afp_deduction, other_deductions: p.other_deductions, bonuses: p.bonuses, status: p.status }); setShowModal(true); };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const url = current ? `${API}/pagos-nomina/${current.id}` : `${API}/pagos-nomina`;
        const method = current ? 'PUT' : 'POST';
        await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setShowModal(false); fetchPagos();
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar pago?')) return;
        await fetch(`${API}/pagos-nomina/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchPagos();
    };

    return (
        <div className="font-sans">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-violet-600 pl-3">Nómina</h1>
                <button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-semibold text-sm">+ Registrar Pago</button>
            </div>

            {loading ? <p className="text-slate-500">Cargando...</p> : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Empleado</th>
                                <th className="px-4 py-3 text-left">Periodo</th>
                                <th className="px-4 py-3 text-right">Salario Base</th>
                                <th className="px-4 py-3 text-right">Deducciones</th>
                                <th className="px-4 py-3 text-right">Bonos</th>
                                <th className="px-4 py-3 text-right">Neto</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map(p => (
                                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{p.empleado_name}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.month_year}</td>
                                    <td className="px-4 py-3 text-right">RD$ {fmt(p.base_salary)}</td>
                                    <td className="px-4 py-3 text-right text-red-600">-{fmt(p.deductions)}</td>
                                    <td className="px-4 py-3 text-right text-green-600">+{fmt(p.bonuses)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-violet-700">RD$ {fmt(p.net_pay)}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            {pagos.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-400">No hay pagos registrados</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">{current ? 'Editar Pago' : 'Registrar Pago de Nómina'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <select required value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="">Seleccionar Empleado</option>
                                {empleados.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="">Sin Banca</option>
                                {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs text-slate-500">Período (YYYY-MM)</label><input type="month" value={form.month_year} onChange={e => setForm({ ...form, month_year: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                                <div><label className="text-xs text-slate-500">Fecha Pago</label><input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                            </div>
                            <input required placeholder="Salario Base" type="number" step="0.01" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <div className="grid grid-cols-3 gap-2">
                                <input placeholder="ARS" type="number" step="0.01" value={form.ars_deduction} onChange={e => setForm({ ...form, ars_deduction: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="AFP" type="number" step="0.01" value={form.afp_deduction} onChange={e => setForm({ ...form, afp_deduction: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="Otros" type="number" step="0.01" value={form.other_deductions} onChange={e => setForm({ ...form, other_deductions: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <input placeholder="Bonos / Horas Extra" type="number" step="0.01" value={form.bonuses} onChange={e => setForm({ ...form, bonuses: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <div className="bg-violet-50 rounded-lg px-4 py-2 text-sm font-semibold text-violet-800">Neto a Pagar: RD$ {fmt(calcNeto(form))}</div>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option>Pagado</option><option>Pendiente</option>
                            </select>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border">Cancelar</button>
                                <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
