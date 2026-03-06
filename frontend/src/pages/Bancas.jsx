import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, MapPin, Phone, Info, ChevronRight, MoreVertical, ChevronDown } from 'lucide-react';

export default function Bancas() {
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanca, setCurrentBanca] = useState({ id: null, name: '', address: '', phone: '', status: 'Activa' });

    useEffect(() => {
        fetchBancas();
    }, []);

    const fetchBancas = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/bancas', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setBancas(data);
            }
        } catch (error) {
            console.error('Error fetching bancas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (banca = null) => {
        if (banca) {
            setIsEditing(true);
            setCurrentBanca(banca);
        } else {
            setIsEditing(false);
            setCurrentBanca({ id: null, name: '', address: '', phone: '', status: 'Activa' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBanca({ id: null, name: '', address: '', phone: '', status: 'Activa' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentBanca(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isEditing
            ? `https://api-v2.salamihost.lat/api/bancas/${currentBanca.id}`
            : 'https://api-v2.salamihost.lat/api/bancas';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(currentBanca)
            });

            if (response.ok) {
                fetchBancas();
                handleCloseModal();
            } else {
                const err = await response.json();
                alert(err.error || 'Ocurrió un error al guardar');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error de conexión con el backend.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta banca? Esta acción no se puede deshacer.')) return;

        try {
            const response = await fetch(`https://api-v2.salamihost.lat/api/bancas/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                fetchBancas();
            } else {
                alert('Error al eliminar banca');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header View */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-main leading-tight tracking-tight">Ubicaciones y Bancas</h1>
                    <p className="text-text-muted mt-1 font-medium">Gestione todos sus puntos físicos y su estado operativo.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} />
                    <span>Nueva Ubicación</span>
                </button>
            </div>

            {/* Grid for Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <span className="text-3xl font-black text-text-main tracking-tighter">{bancas.length}</span>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total de Bancas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-accent-green animate-pulse"></div>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-text-main tracking-tighter">
                        {bancas.filter(b => b.status === 'Activa' || b.status === 'active').length}
                      </span>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Bancas Activas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-border flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                   <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                        <Info size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-main">Salud del Sistema</p>
                        <p className="text-xs font-bold text-text-muted">Terminales en línea</p>
                      </div>
                   </div>
                   <ChevronRight size={20} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Nombre de Ubicación</th>
                                <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Dirección / Contacto</th>
                                <th className="px-10 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">Estado</th>
                                <th className="px-10 py-5 text-right text-[11px] font-black text-text-muted uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-10 py-20 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-6 text-text-muted font-bold text-sm">Cargando registros...</p>
                                    </td>
                                </tr>
                            ) : bancas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-10 py-20 text-center text-text-muted font-bold">
                                      No hay ubicaciones registradas en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                bancas.map((banca) => (
                                    <tr key={banca.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                                                    {banca.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-text-main text-sm">{banca.name}</span>
                                                  <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter mt-0.5">ID: #{banca.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-text-main font-bold text-sm">{banca.address || 'Sin dirección'}</span>
                                                <div className="flex items-center text-[11px] font-bold text-text-muted mt-1">
                                                  <Phone size={12} className="mr-1.5 text-primary/50" />
                                                  <span>{banca.phone || 'Sin teléfono'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                                              (banca.status === 'Activa' || banca.status === 'active') 
                                                ? 'bg-green-50 text-accent-green border-green-100' 
                                                : 'bg-red-50 text-accent-red border-red-100'
                                            }`}>
                                                {banca.status === 'active' ? 'Activa' : (banca.status === 'inactive' ? 'Inactiva' : banca.status)}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => handleOpenModal(banca)} className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(banca.id)} className="p-2.5 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal CRUD Bancas */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-text-main/30 backdrop-blur-md" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-lg border border-border overflow-hidden p-12">
                        <button 
                          onClick={handleCloseModal}
                          className="absolute top-10 right-10 text-text-muted hover:text-text-main transition-colors p-2.5 hover:bg-slate-50 rounded-full"
                        >
                          <X size={28} />
                        </button>

                        <div className="mb-10 text-center sm:text-left">
                             <h3 className="text-3xl font-black text-text-main tracking-tight">{isEditing ? 'Editar Ubicación' : 'Nueva Ubicación'}</h3>
                             <p className="text-text-muted font-medium mt-1">Ingrese los detalles de la banca física.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Nombre de la Banca</label>
                                <input type="text" name="name" required value={currentBanca.name} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="Ej. Sucursal Central" />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Dirección Física</label>
                                <input type="text" name="address" value={currentBanca.address} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="Ej. Calle Principal #123" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Teléfono de Contacto</label>
                                    <input type="text" name="phone" value={currentBanca.phone} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="809-XXX-XXXX" />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Estado</label>
                                    <select name="status" value={currentBanca.status} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                        <option value="active">Activa</option>
                                        <option value="inactive">Inactiva</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-6 bottom-5 text-text-muted pointer-events-none" />
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-6 py-4 rounded-2xl text-sm font-black border border-border text-text-main hover:bg-slate-50 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Ubicación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
