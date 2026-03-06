import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, MapPin, Phone, Info, ChevronRight, MoreVertical } from 'lucide-react';

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
                    <h1 className="text-3xl font-bold text-text-main leading-tight">Locations & Branches</h1>
                    <p className="text-text-muted mt-1">Manage all your physical locations and their operational status.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center space-x-2 whitespace-nowrap"
                >
                    <Plus size={18} />
                    <span>Create Location</span>
                </button>
            </div>

            {/* Grid for Stats or Info - Optional but adds to premium feel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-text-main">{bancas.length}</span>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Total Locations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-accent-green animate-pulse"></div>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-text-main">
                        {bancas.filter(b => b.status === 'Activa' || b.status === 'active').length}
                      </span>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Active Branches</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                        <Info size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main">System Health</p>
                        <p className="text-xs text-text-muted">All terminals online</p>
                      </div>
                   </div>
                   <ChevronRight size={20} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-border overflow-hidden p-8 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-slate-50">
                                <th className="pb-4 px-4">Location Name</th>
                                <th className="pb-4 px-4">Address / Contact</th>
                                <th className="pb-4 px-4">Status</th>
                                <th className="pb-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-4 text-text-muted font-medium">Loading branch records...</p>
                                    </td>
                                </tr>
                            ) : bancas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center">
                                      <p className="text-text-muted font-medium">No locations registered in the system.</p>
                                    </td>
                                </tr>
                            ) : (
                                bancas.map((banca) => (
                                    <tr key={banca.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                    {banca.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-text-main">{banca.name}</span>
                                                  <span className="text-xs text-text-muted font-medium">ID: #{banca.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-text-main font-medium">{banca.address || 'No address provided'}</span>
                                                <div className="flex items-center text-xs text-text-muted mt-1">
                                                  <Phone size={12} className="mr-1" />
                                                  <span>{banca.phone || 'No phone'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                              (banca.status === 'Activa' || banca.status === 'active') 
                                                ? 'bg-green-50 text-accent-green' 
                                                : 'bg-red-50 text-accent-red'
                                            }`}>
                                                {banca.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleOpenModal(banca)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(banca.id)} className="p-2 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-text-main/20 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg border border-border overflow-hidden p-10">
                        <button 
                          onClick={handleCloseModal}
                          className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors p-2 hover:bg-slate-50 rounded-full"
                        >
                          <X size={24} />
                        </button>

                        <div className="mb-8">
                             <h3 className="text-3xl font-bold text-text-main">{isEditing ? 'Edit Location' : 'New Location'}</h3>
                             <p className="text-text-muted">Enter the details of the physical branch.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Branch Name</label>
                                <input type="text" name="name" required value={currentBanca.name} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="e.g. Main Plaza" />
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Physical Address</label>
                                <input type="text" name="address" value={currentBanca.address} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="e.g. 123 Central Ave" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Contact Phone</label>
                                    <input type="text" name="phone" value={currentBanca.phone} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="809-XXX-XXXX" />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Status</label>
                                    <select name="status" value={currentBanca.status} onChange={handleInputChange} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3.5 text-sm ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none appearance-none cursor-pointer">
                                        <option value="active">Activa</option>
                                        <option value="inactive">Inactiva</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-4 rounded-2xl text-sm font-bold border border-border text-text-main hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-[2] bg-primary text-white px-4 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all">
                                    {isEditing ? 'Save branch changes' : 'Create location'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
