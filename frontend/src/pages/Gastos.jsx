import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Calendar, DollarSign, Wallet, ArrowDownCircle, MapPin, ChevronDown } from 'lucide-react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
            const data = await r.json();
            setGastos(Array.isArray(data) ? data : []);
        } catch (e) { setGastos([]); } finally { setLoading(false); }
    };

    const fetchBancas = async () => {
        try {
            const r = await fetch(`${API}/bancas`, { credentials: 'include' });
            const data = await r.json();
            setBancas(Array.isArray(data) ? data : []);
        } catch (e) { setBancas([]); }
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-text-main leading-tight tracking-tight">Control de Gastos</h1>
                  <p className="text-text-muted mt-1 font-medium">Gestione y categorice los flujos de salida de su negocio.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={18} />
                  <span>Registrar Gasto</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total de Gastos', value: `RD$ ${fmt(gastos.reduce((acc, g) => acc + parseFloat(g.amount || 0), 0))}`, icon: Wallet, color: 'accent-orange' },
                  { label: 'Gastos del Mes', value: `RD$ ${fmt(gastos.filter(g => g.expense_date.startsWith(new Date().toISOString().slice(0, 7))).reduce((acc, g) => acc + parseFloat(g.amount || 0), 0))}`, icon: Calendar, color: 'primary' },
                  { label: 'Categoría Principal', value: gastos.length ? [...new Set(gastos.map(g => g.category))].sort((a,b) => gastos.filter(g => g.category === b).length - gastos.filter(g => g.category === a).length)[0] : 'N/A', icon: Tag, color: 'accent-blue' },
                  { label: 'Gasto Promedio', value: `RD$ ${fmt(gastos.length ? gastos.reduce((acc, g) => acc + parseFloat(g.amount || 0), 0) / gastos.length : 0)}`, icon: ArrowDownCircle, color: 'accent-red' }
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
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Descripción</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Categoría</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Monto</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Fecha</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Ubicación</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {gastos.map(g => (
                                    <tr key={g.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6 font-bold text-text-main text-sm">{g.description}</td>
                                        <td className="px-10 py-6">
                                            <span className="px-4 py-1.5 bg-orange-50 text-accent-orange border border-orange-100 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                                {g.category}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right text-accent-red font-black text-base tracking-tighter">-RD$ {fmt(g.amount)}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-2 text-text-muted font-bold text-sm">
                                                <Calendar size={14} className="text-primary/40" />
                                                <span>{g.expense_date}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                          <div className="flex items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <MapPin size={14} className="mr-2 text-primary/40" />
                                            {g.banca_name || '—'}
                                          </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => openEdit(g)} className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(g.id)} className="p-2.5 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {gastos.length === 0 && (
                                  <tr>
                                    <td colSpan={6} className="px-10 py-20 text-center text-text-muted font-bold">No hay gastos registrados aún.</td>
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
                          <h2 className="text-3xl font-black text-text-main tracking-tight">{current ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
                          <p className="text-text-muted font-medium mt-1">Complete los detalles del nuevo gasto comercial.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Descripción</label>
                              <input required placeholder="¿Para qué fue esto?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2 relative">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Categoría</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                    {categorias.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Fecha</label>
                                <input required type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                              </div>
                            </div>

                            <div className="space-y-2 relative">
                              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Ubicación / Banca (Opcional)</label>
                              <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                  <option value="">Sin Ubicación</option>
                                  {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Monto</label>
                              <div className="relative">
                                <span className="absolute left-6 top-4 text-accent-red text-[11px] font-black tracking-widest">RD$</span>
                                <input required placeholder="0.00" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-2xl ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-black text-accent-red tracking-tighter shadow-inner" />
                              </div>
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
