import React, { useState, useEffect } from 'react';

export default function Empleados() {
    const [empleados, setEmpleados] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmpleado, setCurrentEmpleado] = useState({ id: null, name: '', email: '', password: '', phone: '', banca_id: '' });

    useEffect(() => {
        fetchEmpleados();
    }, []);

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/empleados', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setEmpleados(data);
            }
        } catch (error) {
            console.error('Error fetching empleados:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBancas = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/bancas', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                // Filtramos solo las bancas activas para la asignación
                setBancas(data.filter(b => b.status === 'active'));
            }
        } catch (error) {
            console.error('Error fetching bancas para el select:', error);
        }
    };

    const handleOpenModal = async (empleado = null) => {
        // Al abrir el modal (crear o editar), cargamos la lista de bancas del servidor
        await fetchBancas();

        if (empleado) {
            setIsEditing(true);
            setCurrentEmpleado({
                ...empleado,
                password: '', // En edición, viene vacío por seguridad
                phone: empleado.phone || '',
                banca_id: empleado.banca_id || ''
            });
        } else {
            setIsEditing(false);
            setCurrentEmpleado({ id: null, name: '', email: '', password: '', phone: '', banca_id: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentEmpleado({ id: null, name: '', email: '', password: '', phone: '', banca_id: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEmpleado(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditing && !currentEmpleado.password) {
            alert("La contraseña es requerida para el registro de nuevos empleados.");
            return;
        }

        const payload = { ...currentEmpleado };
        if (!payload.banca_id) payload.banca_id = null; // Enviar null explícito si está vacío

        const url = isEditing
            ? `http://localhost:8000/api/empleados/${currentEmpleado.id}`
            : 'http://localhost:8000/api/empleados';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchEmpleados();
                handleCloseModal();
            } else {
                const err = await response.json();
                alert(err.error || 'Ocurrió un error al guardar');
            }
        } catch (error) {
            alert('Error de conexión con el backend.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar definitivamente a este empleado?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/empleados/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                fetchEmpleados();
            } else {
                alert('Error al eliminar empleado');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="font-sans">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Empleados</h1>
                    <p className="text-slate-500 mt-1 pl-4 text-sm">Gestiona personal y asígnalos a sus respectivas Bancas.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium text-sm transition-colors">
                    + Nuevo Empleado
                </button>
            </div>

            {/* TABLA DE EMPLEADOS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Banca Asignada</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-6 text-slate-400 animate-pulse">Cargando datos...</td></tr>
                            ) : empleados.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-6 text-slate-400">No hay empleados registrados.</td></tr>
                            ) : (
                                empleados.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase text-xs">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{emp.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 uppercase">
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {emp.banca_name ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                                                    {emp.banca_name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Sin Banca</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleOpenModal(emp)} className="text-blue-600 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100">✏️</button>
                                            <button onClick={() => handleDelete(emp.id)} className="text-red-500 bg-red-50 p-1.5 rounded-md hover:bg-red-100">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL / DIALOG PARA EMPLEADO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between">
                            <h3 className="font-bold text-slate-800">{isEditing ? 'Editar Empleado' : 'Registrar Empleado'}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Nombre Completo</label>
                                    <input type="text" name="name" required value={currentEmpleado.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ej. Ana Reyes" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-slate-700">Email (Acceso)</label>
                                        <input type="email" name="email" required value={currentEmpleado.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="ana@empresa.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-slate-700">Teléfono</label>
                                        <input type="text" name="phone" value={currentEmpleado.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="809..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">
                                        Contraseña {isEditing && <span className="text-xs font-normal text-slate-400">(Opcional para mantener)</span>}
                                    </label>
                                    <input type="password" name="password" required={!isEditing} value={currentEmpleado.password} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
                                    <label className="block text-sm font-semibold text-slate-800 mb-2">🏢 Asignación de Banca</label>
                                    <select name="banca_id" value={currentEmpleado.banca_id} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">-- No Asignar a Ninguna Banca --</option>
                                        {bancas.map(b => (
                                            <option key={b.id} value={b.id}>{b.name} ({b.address || 'Sin dir'})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1.5">Un empleado asignado a una banca solo despachará operaciones dentro de esta sucursal.</p>
                                </div>
                            </div>

                            <div className="pt-4 mt-6 border-t flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">{isEditing ? 'Guardar Cambios' : 'Registrar Empleado'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
