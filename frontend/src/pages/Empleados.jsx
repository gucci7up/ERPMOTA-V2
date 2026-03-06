import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, User, Briefcase, Phone, Mail, DollarSign, MapPin } from 'lucide-react';

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
            const data = await r.json();
            setEmpleados(Array.isArray(data) ? data : []);
        } catch (e) { setEmpleados([]); } finally { setLoading(false); }
    };

    const fetchBancas = async () => {
        try {
            const r = await fetch(`${API}/bancas`, { credentials: 'include' });
            const data = await r.json();
            setBancas(Array.isArray(data) ? data : []);
        } catch (e) { setBancas([]); }
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-text-main">Staff Management</h1>
                  <p className="text-text-muted">Manage your employees and assign them to specific locations.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Employee</span>
                </button>
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
                                    <th className="pb-4 px-4">Role / Contact</th>
                                    <th className="pb-4 px-4">Location</th>
                                    <th className="pb-4 px-4">Salary</th>
                                    <th className="pb-4 px-4">Status</th>
                                    <th className="pb-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {empleados.map(e => (
                                    <tr key={e.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    {e.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-text-main">{e.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-text-main font-medium">{e.role}</span>
                                                <span className="text-xs text-text-muted">{e.phone || 'No phone'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center text-text-muted">
                                                <MapPin size={14} className="mr-1" />
                                                <span>{e.banca_name || 'Not assigned'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-text-main text-base">
                                            RD$ {parseFloat(e.salary || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${e.status === 'Activo' ? 'bg-green-50 text-accent-green' : 'bg-red-50 text-accent-red'}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(e)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(e.id)} className="p-2 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {empleados.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <p className="text-text-muted font-medium">No employees found in the records.</p>
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
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border border-border relative">
                        <button 
                          onClick={() => setShowModal(false)}
                          className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors p-2 hover:bg-slate-50 rounded-full"
                        >
                          <X size={24} />
                        </button>

                        <div className="mb-8">
                          <h2 className="text-3xl font-bold text-text-main">{current ? 'Edit Employee' : 'New Employee'}</h2>
                          <p className="text-text-muted">Please fill out the information below.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 relative">
                                <User className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                <input 
                                  required 
                                  placeholder="Full Name" 
                                  value={form.name} 
                                  onChange={e => setForm({ ...form, name: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                />
                              </div>
                              <div className="relative">
                                <Briefcase className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                <input 
                                  placeholder="Role / Position" 
                                  value={form.role} 
                                  onChange={e => setForm({ ...form, role: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                />
                              </div>
                              <div className="relative">
                                <Phone className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                <input 
                                  placeholder="Phone" 
                                  value={form.phone} 
                                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                />
                              </div>
                              <div className="col-span-2 relative">
                                <Mail className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                <input 
                                  placeholder="Email Address" 
                                  value={form.email} 
                                  onChange={e => setForm({ ...form, email: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                  type="email" 
                                />
                              </div>
                              <div className="relative">
                                <DollarSign className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                <input 
                                  placeholder="Salary" 
                                  value={form.salary} 
                                  onChange={e => setForm({ ...form, salary: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                  type="number" 
                                />
                              </div>
                              <select 
                                value={form.status} 
                                onChange={e => setForm({ ...form, status: e.target.value })} 
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                              >
                                <option>Activo</option>
                                <option>Inactivo</option>
                              </select>
                              <div className="col-span-2 relative">
                                <MapPin className="absolute left-4 top-3.5 text-text-muted" size={18} />
                                <select 
                                  value={form.banca_id} 
                                  onChange={e => setForm({ ...form, banca_id: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Assign to Location (Banca)</option>
                                    {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 pt-6">
                                <button 
                                  type="button" 
                                  onClick={() => setShowModal(false)} 
                                  className="flex-1 px-4 py-4 rounded-2xl text-sm font-bold border border-border text-text-main hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit" 
                                  className="flex-[2] bg-primary text-white px-4 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all"
                                >
                                  {current ? 'Update employee data' : 'Create new employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
