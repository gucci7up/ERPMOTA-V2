import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, Calendar, DollarSign, PieChart, CreditCard, ChevronRight, Calculator, ChevronDown } from 'lucide-react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                  <h1 className="text-3xl font-black text-text-main leading-tight tracking-tight">Gestión de Nómina</h1>
                  <p className="text-text-muted mt-1 font-medium">Siga y gestione los pagos y deducciones de sus empleados.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={18} />
                  <span>Registrar Pago</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Nómina Total', value: `RD$ ${fmt(pagos.reduce((acc, p) => acc + parseFloat(p.net_pay || 0), 0))}`, icon: DollarSign, color: 'primary' },
                  { label: 'Pagados este Mes', value: pagos.filter(p => p.status === 'Pagado').length.toString(), icon: CreditCard, color: 'accent-green' },
                  { label: 'Pagos Pendientes', value: pagos.filter(p => p.status === 'Pendiente').length.toString(), icon: Calendar, color: 'accent-red' },
                  { label: 'Sueldo Promedio', value: `RD$ ${fmt(pagos.length ? pagos.reduce((acc, p) => acc + parseFloat(p.base_salary || 0), 0) / pagos.length : 0)}`, icon: PieChart, color: 'accent-blue' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] shadow-md border border-border transition-all hover:border-primary/20">
                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color} flex items-center justify-center mb-6`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className="text-2xl font-black text-text-main tracking-tighter">{stat.value}</p>
                  </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] shadow-md border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Empleado</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Periodo</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Sueldo Base</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Deducciones</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Bonos</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Pago Neto</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Estado</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pagos.map(p => (
                                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6 font-bold text-text-main text-sm">{p.empleado_name}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-2 text-text-muted font-bold text-sm">
                                                <Calendar size={14} className="text-primary/40" />
                                                <span>{p.month_year}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right text-text-main font-bold text-sm">RD$ {fmt(p.base_salary)}</td>
                                        <td className="px-10 py-6 text-right text-accent-red font-bold text-sm">-{fmt(p.deductions)}</td>
                                        <td className="px-10 py-6 text-right text-accent-green font-bold text-sm">+{fmt(p.bonuses)}</td>
                                        <td className="px-10 py-6 text-right font-black text-primary text-base tracking-tighter">RD$ {fmt(p.net_pay)}</td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${p.status === 'Pagado' ? 'bg-green-50 text-accent-green border-green-100' : 'bg-yellow-50 text-accent-yellow border-yellow-100'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => openEdit(p)} className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2.5 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pagos.length === 0 && (
                                  <tr>
                                    <td colSpan={8} className="px-10 py-20 text-center text-text-muted font-bold">No hay registros de nómina encontrados.</td>
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
                    <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border overflow-hidden p-12">
                        <button 
                          onClick={() => setShowModal(false)}
                          className="absolute top-10 right-10 text-text-muted hover:text-text-main transition-colors p-2.5 hover:bg-slate-50 rounded-full"
                        >
                          <X size={28} />
                        </button>

                        <div className="mb-10 text-center sm:text-left">
                          <h2 className="text-3xl font-black text-text-main tracking-tight">{current ? 'Editar Pago' : 'Nueva Entrada de Nómina'}</h2>
                          <p className="text-text-muted font-medium mt-1">Sueldo y compensación para el personal seleccionado.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2 relative">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Empleado</label>
                                <select required value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                    <option value="">Seleccione Empleado</option>
                                    {empleados.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                              </div>
                              <div className="space-y-2 relative">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Ubicación / Banca</label>
                                <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                    <option value="">Sin Ubicación</option>
                                    {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Periodo (Mes)</label>
                                <input type="month" value={form.month_year} onChange={e => setForm({ ...form, month_year: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Fecha de Pago</label>
                                <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                              </div>
                            </div>

                            <div className="p-10 bg-slate-50 rounded-[40px] space-y-8 border border-border shadow-inner">
                              <div className="space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center">
                                  <Calculator size={14} className="mr-2 text-primary" /> Detalles de Cálculo
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Sueldo Base</label>
                                    <div className="relative">
                                      <span className="absolute left-6 top-4 text-text-muted text-[11px] font-black tracking-widest">RD$</span>
                                      <input required placeholder="0.00" type="number" step="0.01" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} className="w-full bg-white border-none rounded-2xl pl-16 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Bonos</label>
                                    <div className="relative">
                                      <span className="absolute left-6 top-4 text-accent-green text-[11px] font-black tracking-widest">+</span>
                                      <input placeholder="0.00" type="number" step="0.01" value={form.bonuses} onChange={e => setForm({ ...form, bonuses: e.target.value })} className="w-full bg-white border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none text-accent-green" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Deducciones</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">ARS (Salud)</label>
                                      <div className="relative">
                                        <input type="number" step="0.01" value={form.ars_deduction} onChange={e => setForm({ ...form, ars_deduction: e.target.value })} className="w-full bg-white border-none rounded-2xl px-5 py-3.5 text-xs font-black ring-1 ring-border focus:ring-2 focus:ring-accent-red transition-all outline-none text-accent-red" />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">AFP (Pensión)</label>
                                      <div className="relative">
                                        <input type="number" step="0.01" value={form.afp_deduction} onChange={e => setForm({ ...form, afp_deduction: e.target.value })} className="w-full bg-white border-none rounded-2xl px-5 py-3.5 text-xs font-black ring-1 ring-border focus:ring-2 focus:ring-accent-red transition-all outline-none text-accent-red" />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Otros</label>
                                      <div className="relative">
                                        <input type="number" step="0.01" value={form.other_deductions} onChange={e => setForm({ ...form, other_deductions: e.target.value })} className="w-full bg-white border-none rounded-2xl px-5 py-3.5 text-xs font-black ring-1 ring-border focus:ring-2 focus:ring-accent-red transition-all outline-none text-accent-red" />
                                      </div>
                                    </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-primary/10 rounded-3xl border border-primary/20 gap-6">
                                <div>
                                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Monto Neto a Pagar:</p>
                                  <p className="text-4xl font-black text-primary mt-1 tracking-tighter">RD$ {fmt(calcNeto(form))}</p>
                                </div>
                                <div className="text-right w-full sm:w-auto">
                                   <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 block">Estado del Pago</label>
                                   <div className="relative">
                                     <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full sm:w-auto bg-white border-none rounded-2xl px-6 py-3 text-sm font-black ring-1 ring-primary/30 outline-none cursor-pointer appearance-none pr-10">
                                          <option>Pagado</option>
                                          <option>Pendiente</option>
                                      </select>
                                      <ChevronDown size={14} className="absolute right-3.5 bottom-3.5 text-primary pointer-events-none" />
                                   </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 rounded-2xl text-sm font-black border border-border text-text-main hover:bg-slate-50 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                  {current ? 'Guardar Cambios' : 'Confirmar y Registrar Pago'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
