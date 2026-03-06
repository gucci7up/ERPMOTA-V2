import React, { useState, useEffect } from 'react';

export default function Bancas() {
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanca, setCurrentBanca] = useState({ id: null, name: '', address: '', phone: '', status: 'active' });

    useEffect(() => {
        fetchBancas();
    }, []);

    const fetchBancas = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/bancas', { credentials: 'true' });
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
            setCurrentBanca({ id: null, name: '', address: '', phone: '', status: 'active' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBanca({ id: null, name: '', address: '', phone: '', status: 'active' });
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
                credentials: 'true',
                body: JSON.stringify(currentBanca)
            });

            if (response.ok) {
                fetchBancas(); // Recargar la lista
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
                credentials: 'true'
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
        <div className="font-sans">
            {/* Header View */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3 block">Gestión de Bancas</h1>
                    <p className="text-slate-500 mt-1 pl-4 text-sm">Administra las sucursales o bancas del sistema ERP.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors font-medium text-sm"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nueva Banca
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Nombre</th>
                                <th className="px-6 py-4 font-semibold">Dirección</th>
                                <th className="px-6 py-4 font-semibold">Teléfono</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        <svg className="animate-spin h-6 w-6 mx-auto text-blue-500 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Cargando bancas...
                                    </td>
                                </tr>
                            ) : bancas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No hay bancas registradas.</td>
                                </tr>
                            ) : (
                                bancas.map((banca) => (
                                    <tr key={banca.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-500">#{banca.id}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{banca.name}</td>
                                        <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{banca.address || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{banca.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${banca.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {banca.status === 'active' ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                            <button onClick={() => handleOpenModal(banca)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(banca.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Editar Banca' : 'Nueva Banca'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                                <input type="text" name="name" required value={currentBanca.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej. Banca Principal" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Dirección</label>
                                <input type="text" name="address" value={currentBanca.address} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej. Av. Central #123" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                                    <input type="text" name="phone" value={currentBanca.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej. 809-555-1234" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
                                    <select name="status" value={currentBanca.status} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="active">Activa</option>
                                        <option value="inactive">Inactiva</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/30 transition-colors">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Banca'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
