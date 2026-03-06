import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Calendar, DollarSign, Wallet, ArrowDownCircle, MapPin } from 'lucide-react';

const API = 'https://api-v2.salamihost.lat/api';
const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                  <h1 className="text-3xl font-bold text-text-main">Expense Tracking</h1>
                  <p className="text-text-muted mt-1">Manage and categorize your business outflows.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  <span>Log Expense</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Expenses', value: `RD$ ${fmt(gastos.reduce((acc, g) => acc + parseFloat(g.amount || 0), 0))}`, icon: Wallet, color: 'accent-orange' },
                  { label: 'This Month', value: `RD$ ${fmt(gastos.filter(g => g.expense_date.startsWith(new Date().toISOString().slice(0, 7))).reduce((acc, g) => acc + parseFloat(g.amount || 0), 0))}`, icon: Calendar, color: 'primary' },
                  { label: 'Key Category', value: gastos.length ? [...new Set(gastos.map(g => g.category))].sort((a,b) => gastos.filter(g => g.category === b).length - gastos.filter(g => g.category === a).length)[0] : 'N/A', icon: Tag, color: 'accent-blue' },
                  { label: 'Avg Expense', value: `RD$ ${fmt(gastos.length ? gastos.reduce((acc, g) => acc + parseFloat(g.amount || 0), 0) / gastos.length : 0)}`, icon: ArrowDownCircle, color: 'accent-red' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-border shadow-sm">
                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-text-main mt-1">{stat.value}</p>
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
                                    <th className="pb-4 px-4 font-bold">Description</th>
                                    <th className="pb-4 px-4 font-bold">Category</th>
                                    <th className="pb-4 px-4 text-right font-bold">Amount</th>
                                    <th className="pb-4 px-4 font-bold">Date</th>
                                    <th className="pb-4 px-4 font-bold">Location</th>
                                    <th className="pb-4 px-4 text-right font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {gastos.map(g => (
                                    <tr key={g.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-5 px-4 font-bold text-text-main">{g.description}</td>
                                        <td className="py-5 px-4">
                                            <span className="px-3 py-1 bg-orange-50 text-accent-orange rounded-full text-xs font-bold uppercase tracking-tight">
                                                {g.category}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-right text-accent-red font-black text-base">-RD$ {fmt(g.amount)}</td>
                                        <td className="py-5 px-4 text-text-muted font-medium">{g.expense_date}</td>
                                        <td className="py-5 px-4">
                                          <div className="flex items-center text-text-muted font-bold">
                                            <MapPin size={14} className="mr-1 text-primary/60" />
                                            {g.banca_name || '—'}
                                          </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(g)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(g.id)} className="p-2 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {gastos.length === 0 && (
                                  <tr>
                                    <td colSpan={6} className="py-12 text-center text-text-muted font-medium">No expenses recorded yet.</td>
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
                          <h2 className="text-3xl font-bold text-text-main">{current ? 'Edit Expense' : 'New Expense'}</h2>
                          <p className="text-text-muted">Fill in the details for the new business expense.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Description</label>
                              <input required placeholder="What was this for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-medium" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                    {categorias.map(c => <option key={c}>{c}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Date</label>
                                <input required type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Location / Branch (Optional)</label>
                              <select value={form.banca_id} onChange={e => setForm({ ...form, banca_id: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                  <option value="">No Location</option>
                                  {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Amount</label>
                              <div className="relative">
                                <span className="absolute left-4 top-3.5 text-text-muted text-sm font-bold">RD$</span>
                                <input required placeholder="0.00" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-lg ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none font-black text-accent-red" />
                              </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 rounded-2xl text-sm font-bold border border-border text-text-main hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-4 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all">
                                  {current ? 'Update expense' : 'Confirm & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
