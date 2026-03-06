import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, Calendar, DollarSign, PieChart, CreditCard, ChevronRight, Calculator } from 'lucide-react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Nomina() {
    const [pagos, setPagos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(null);
    const initForm = { 
        empleado_id: '', 
        banca_id: '', 
        month_year: new Date().toISOString().slice(0, 7), 
        payment_date: new Date().toISOString().split('T')[0], 
        base_salary: '', 
        ars_deduction: '0', 
        afp_deduction: '0', 
        other_deductions: '0', 
        bonuses: '0', 
        status: 'Pagado' 
    };
    const [form, setForm] = useState(initForm);

    useEffect(() => { fetchPagos(); fetchEmpleados(); fetchBancas(); }, []);

    const fetchPagos = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/pagos-nomina`, { credentials: 'include' });
            const data = await r.json();
            setPagos(Array.isArray(data) ? data : []);
        } catch (e) { setPagos([]); } finally { setLoading(false); }
    };

    const fetchEmpleados = async () => {
        try {
            const r = await fetch(`${API}/empleados`, { credentials: 'include' });
            const data = await r.json();
            setEmpleados(Array.isArray(data) ? data : []);
        } catch (e) { setEmpleados([]); }
    };

    const fetchBancas = async () => {
        try {
            const r = await fetch(`${API}/bancas`, { credentials: 'include' });
            const data = await r.json();
            setBancas(Array.isArray(data) ? data : []);
        } catch (e) { setBancas([]); }
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-main">Payroll Management</h1>
                  <p className="text-text-muted mt-1">Track and manage employee payments and deductions.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  <span>Register Payment</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Payroll', value: `RD$ ${fmt(pagos.reduce((acc, p) => acc + parseFloat(p.net_pay || 0), 0))}`, icon: DollarSign, color: 'primary' },
                  { label: 'Paid This Month', value: pagos.filter(p => p.status === 'Pagado').length.toString(), icon: CreditCard, color: 'accent-green' },
                  { label: 'Pending Payments', value: pagos.filter(p => p.status === 'Pendiente').length.toString(), icon: Calendar, color: 'accent-red' },
                  { label: 'Avg Salary', value: `RD$ ${fmt(pagos.length ? pagos.reduce((acc, p) => acc + parseFloat(p.base_salary || 0), 0) / pagos.length : 0)}`, icon: PieChart, color: 'accent-blue' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-border">
                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-main mt-1">{stat.value}</p>
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
                                    <th className="pb-4 px-4">Employee</th>
                                    <th className="pb-4 px-4">Period</th>
                                    <th className="pb-4 px-4 text-right">Base Salary</th>
                                    <th className="pb-4 px-4 text-right">Deductions</th>
                                    <th className="pb-4 px-4 text-right">Bonuses</th>
                                    <th className="pb-4 px-4 text-right">Net Pay</th>
                                    <th className="pb-4 px-4">Status</th>
                                    <th className="pb-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {pagos.map(p => (
                                    <tr key={p.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-5 px-4 font-bold text-text-main">{p.empleado_name}</td>
                                        <td className="py-5 px-4 text-text-muted font-medium">{p.month_year}</td>
                                        <td className="py-5 px-4 text-right text-text-main">RD$ {fmt(p.base_salary)}</td>
                                        <td className="py-5 px-4 text-right text-accent-red font-medium">-{fmt(p.deductions)}</td>
                                        <td className="py-5 px-4 text-right text-accent-green font-medium">+{fmt(p.bonuses)}</td>
                                        <td className="py-5 px-4 text-right font-black text-primary text-base">RD$ {fmt(p.net_pay)}</td>
                                        <td className="py-5 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'Pagado' ? 'bg-green-50 text-accent-green' : 'bg-yellow-50 text-accent-yellow'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(p)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pagos.length === 0 && (
                                  <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                      <p className="text-text-muted font-medium">No payroll records found.</p>
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-text-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border relative">
                        <button 
                          onClick={() => setShowModal(false)}
                          className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors p-2 hover:bg-slate-50 rounded-full"
                        >
                          <X size={24} />
                        </button>

                        <div className="mb-8">
                          <h2 className="text-3xl font-bold text-text-main">{current ? 'Edit Payment' : 'New Payroll Entry'}</h2>
                          <p className="text-text-muted">Calculate and register employee compensation.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Employee</label>
                                <select required value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none cursor-pointer appearance-none">
                                    <option value="">Select Employee</option>
                                    {empleados.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Branch / Location</label>
                                <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none cursor-pointer appearance-none">
                                    <option value="">No Location</option>
                                    {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Period (Month)</label>
                                <input type="month" value={form.month_year} onChange={e => setForm({ ...form, month_year: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Payment Date</label>
                                <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                              </div>
                            </div>

                            <div className="p-8 bg-slate-50 rounded-[32px] space-y-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 flex items-center">
                                  <Calculator size={14} className="mr-1" /> Calculation Details
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-text-muted text-sm font-bold">RD$</span>
                                    <input required placeholder="Base Salary" type="number" step="0.01" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold" />
                                  </div>
                                  <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-accent-green text-sm font-bold">+</span>
                                    <input placeholder="Bonuses" type="number" step="0.01" value={form.bonuses} onChange={e => setForm({ ...form, bonuses: e.target.value })} className="w-full bg-white border-none rounded-2xl pl-10 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-bold text-accent-green" />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Deductions</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="relative">
                                      <span className="text-[10px] absolute top-1 left-3 text-text-muted font-bold">ARS</span>
                                      <input type="number" step="0.01" value={form.ars_deduction} onChange={e => setForm({ ...form, ars_deduction: e.target.value })} className="w-full bg-white border-none rounded-xl px-3 pt-4 pb-2 text-xs ring-1 ring-border outline-none font-medium text-accent-red" />
                                    </div>
                                    <div className="relative">
                                      <span className="text-[10px] absolute top-1 left-3 text-text-muted font-bold">AFP</span>
                                      <input type="number" step="0.01" value={form.afp_deduction} onChange={e => setForm({ ...form, afp_deduction: e.target.value })} className="w-full bg-white border-none rounded-xl px-3 pt-4 pb-2 text-xs ring-1 ring-border outline-none font-medium text-accent-red" />
                                    </div>
                                    <div className="relative">
                                      <span className="text-[10px] absolute top-1 left-3 text-text-muted font-bold">OTHER</span>
                                      <input type="number" step="0.01" value={form.other_deductions} onChange={e => setForm({ ...form, other_deductions: e.target.value })} className="w-full bg-white border-none rounded-xl px-3 pt-4 pb-2 text-xs ring-1 ring-border outline-none font-medium text-accent-red" />
                                    </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-6 bg-primary/10 rounded-2xl border border-primary/20">
                                <div>
                                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Net Amount to Pay</p>
                                  <p className="text-3xl font-black text-primary mt-1">RD$ {fmt(calcNeto(form))}</p>
                                </div>
                                <div className="text-right">
                                   <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Status</label>
                                   <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-white border-none rounded-xl px-4 py-2 text-sm font-bold ring-1 ring-primary/30 outline-none cursor-pointer">
                                        <option>Pagado</option>
                                        <option>Pendiente</option>
                                    </select>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 rounded-2xl text-sm font-bold border border-border text-text-main hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-4 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all">
                                  {current ? 'Update payment record' : 'Confirm & register payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
