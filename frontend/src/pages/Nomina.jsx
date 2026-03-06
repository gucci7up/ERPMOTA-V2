import React, { useState, useEffect } from 'react';

export default function Nomina() {
    const [pagos, setPagos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const currentMonthYear = new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });

    const [currentPago, setCurrentPago] = useState({
        id: null,
        empleado_id: '',
        monto_pagado: '',
        fecha_pago: today,
        periodo: currentMonthYear
    });

    useEffect(() => {
        fetchPagos();
        fetchEmpleados();
    }, []);

    const fetchPagos = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/pagos-nomina', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setPagos(data);
            }
        } catch (error) {
            console.error('Error fetching pagos: ', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/empleados', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setEmpleados(data); // El endopint ya filtra role='empleado'
            }
        } catch (error) {
            console.error('Error fetching empleados:', error);
        }
    };

    const handleOpenModal = (pago = null) => {
        if (pago) {
            setIsEditing(true);
            setCurrentPago(pago);
        } else {
            setIsEditing(false);
            setCurrentPago({ id: null, empleado_id: '', monto_pagado: '', fecha_pago: today, periodo: currentMonthYear });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPago(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPago.empleado_id || !currentPago.monto_pagado || !currentPago.periodo) {
            alert("Completar campos requeridos");
            return;
        }

        const payload = { ...currentPago, monto_pagado: parseFloat(currentPago.monto_pagado) };

        const url = isEditing
            ? `https://api-v2.salamihost.lat/api/pagos-nomina/${currentPago.id}`
            : 'https://api-v2.salamihost.lat/api/pagos-nomina';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchPagos();
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
        if (!window.confirm('¿Eliminar definitivamente este pago de nómina?')) return;

        try {
            const response = await fetch(`https://api-v2.salamihost.lat/api/pagos-nomina/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) fetchPagos();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-3">Nómina y Pagos</h1>
                    <p className="text-slate-500 mt-1 pl-4 text-sm">Historial de pagos salariales a los empleados.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium text-sm transition-colors whitespace-nowrap">
                    + Realizar Pago
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4">Fecha Pago</th>
                                <th className="px-6 py-4">Empleado Asalariado</th>
                                <th className="px-6 py-4">Período Laboral</th>
                                <th className="px-6 py-4 text-right">Monto Pagado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 animate-pulse">Cargando pagos...</td></tr>
                            ) : pagos.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-400">No hay pagos de nómina registrados.</td></tr>
                            ) : (
                                pagos.map((pago) => (
                                    <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 tabular-nums whitespace-nowrap">{pago.fecha_pago}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{pago.empleado_name}</td>
                                        <td className="px-6 py-4 text-slate-600 capitalize">{pago.periodo}</td>
                                        <td className="px-6 py-4 text-right font-bold tabular-nums text-indigo-700 bg-indigo-50/50">
                                            RD$ {parseFloat(pago.monto_pagado).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleOpenModal(pago)} className="text-indigo-600 bg-indigo-50 p-1.5 rounded-md hover:bg-indigo-100">✏️</button>
                                            <button onClick={() => handleDelete(pago.id)} className="text-red-500 bg-red-50 p-1.5 rounded-md hover:bg-red-100">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{isEditing ? 'Editar Pago' : 'Efectuar Pago'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Empleado Destino</label>
                                <select name="empleado_id" required value={currentPago.empleado_id} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">-- Seleccione un Empleado --</option>
                                    {empleados.map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Monto Acreditado</label>
                                    <input type="number" step="0.01" min="0" name="monto_pagado" required value={currentPago.monto_pagado} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Fecha Efectiva</label>
                                    <input type="date" name="fecha_pago" required value={currentPago.fecha_pago} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Período Laboral</label>
                                <input type="text" name="periodo" required value={currentPago.periodo} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ej. Quincena 1 - Marzo 2024" />
                            </div>

                            <div className="pt-5 mt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">
                                    {isEditing ? 'Actualizar Registro' : 'Registrar Pago'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
