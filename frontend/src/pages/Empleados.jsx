import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, User, Briefcase, Phone, Mail, DollarSign, MapPin, ChevronDown } from 'lucide-react';

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-text-main leading-tight tracking-tight">Gestión de Personal</h1>
                  <p className="text-text-muted mt-1 font-medium">Administre sus empleados y asígnelos a ubicaciones específicas.</p>
                </div>
                <button 
                  onClick={openCreate} 
                  className="bg-primary hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={18} />
                  <span>Añadir Empleado</span>
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-border overflow-hidden">
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
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Cargo / Contacto</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Ubicación</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Salario</th>
                                    <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Estado</th>
                                    <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {empleados.map(e => (
                                    <tr key={e.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                                                    {e.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-text-main text-sm">{e.name}</span>
                                                  <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter mt-0.5">ID: #{e.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-text-main font-bold text-sm">{e.role}</span>
                                                <div className="flex items-center text-[11px] font-bold text-text-muted mt-1">
                                                  <Phone size={12} className="mr-1.5 text-primary/50" />
                                                  <span>{e.phone || 'Sin teléfono'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center text-[11px] font-bold text-text-muted">
                                                <MapPin size={14} className="mr-1.5 text-primary/50" />
                                                <span className="uppercase tracking-wider">{e.banca_name || 'No asignado'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-black text-text-main text-sm">
                                            RD$ {parseFloat(e.salary || 0).toLocaleString('es-DO')}
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${e.status === 'Activo' ? 'bg-green-50 text-accent-green border-green-100' : 'bg-red-50 text-accent-red border-red-100'}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => openEdit(e)} className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(e.id)} className="p-2.5 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {empleados.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center text-text-muted font-bold">
                                            No se encontraron empleados en los registros.
                                        </td>
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
                          <h2 className="text-3xl font-black text-text-main tracking-tight">{current ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                          <p className="text-text-muted font-medium mt-1">Por favor complete la información del personal.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="sm:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-4 text-text-muted" size={18} />
                                    <input 
                                      required 
                                      placeholder="Ej. Juan Pérez" 
                                      value={form.name} 
                                      onChange={e => setForm({ ...form, name: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                    />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Cargo</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-6 top-4 text-text-muted" size={18} />
                                    <input 
                                      placeholder="Ej. Administrador" 
                                      value={form.role} 
                                      onChange={e => setForm({ ...form, role: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                    />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-4 text-text-muted" size={18} />
                                    <input 
                                      placeholder="809-XXX-XXXX" 
                                      value={form.phone} 
                                      onChange={e => setForm({ ...form, phone: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                    />
                                </div>
                              </div>
                              <div className="sm:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-4 text-text-muted" size={18} />
                                    <input 
                                      placeholder="correo@ejemplo.com" 
                                      value={form.email} 
                                      onChange={e => setForm({ ...form, email: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                      type="email" 
                                    />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Salario (RD$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-4 text-text-muted" size={18} />
                                    <input 
                                      placeholder="0.00" 
                                      value={form.salary} 
                                      onChange={e => setForm({ ...form, salary: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" 
                                      type="number" 
                                    />
                                </div>
                              </div>
                              <div className="space-y-2 relative">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Estado</label>
                                <select 
                                  value={form.status} 
                                  onChange={e => setForm({ ...form, status: e.target.value })} 
                                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                                >
                                  <option>Activo</option>
                                  <option>Inactivo</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                              </div>
                              <div className="sm:col-span-2 space-y-2 relative">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Asignar a Banca</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-4 text-text-muted" size={18} />
                                    <select 
                                      value={form.banca_id} 
                                      onChange={e => setForm({ ...form, banca_id: e.target.value })} 
                                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-10 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Seleccione una ubicación</option>
                                        {bancas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 pt-8">
                                <button 
                                  type="button" 
                                  onClick={() => setShowModal(false)} 
                                  className="flex-1 px-6 py-4 rounded-2xl text-sm font-black border border-border text-text-main hover:bg-slate-50 transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button 
                                  type="submit" 
                                  className="flex-[2] bg-primary text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  {current ? 'Guardar Cambios' : 'Crear Empleado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
