import React, { useState, useEffect } from 'react';

export default function Gastos() {
    const [gastos, setGastos] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const [currentGasto, setCurrentGasto] = useState({
        id: null,
        banca_id: '',
        concepto: '',
        monto: '',
        fecha: today,
        estado: 'Pendiente'
    });

    useEffect(() => {
        fetchGastos();
        fetchBancas();
    }, []);

    const fetchGastos = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/gastos', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setGastos(data);
            }
        } catch (error) {
            console.error('Error fetching gastos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBancas = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/bancas', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setBancas(data.filter(b => b.status === 'active'));
            }
        } catch (error) {
            console.error('Error fetching bancas:', error);
        }
    };

    const handleOpenModal = (gasto = null) => {
        if (gasto) {
            setIsEditing(true);
            setCurrentGasto(gasto);
        } else {
            setIsEditing(false);
            setCurrentGasto({ id: null, banca_id: '', concepto: '', monto: '', fecha: today, estado: 'Pendiente' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentGasto(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentGasto.banca_id || !currentGasto.concepto || !currentGasto.monto) {
            alert("Completar campos requeridos");
            return;
        }

        const payload = { ...currentGasto, monto: parseFloat(currentGasto.monto) };

        const url = isEditing
            ? `http://localhost:8000/api/gastos/${currentGasto.id}`
            : 'http://localhost:8000/api/gastos';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchGastos();
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
        if (!window.confirm('¿Eliminar definitivamente este gasto?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/gastos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                fetchGastos();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAsPaid = async (gasto) => {
        try {
            const payload = { ...gasto, estado: 'Pagado' };
            const response = await fetch(`http://localhost:8000/api/gastos/${gasto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            if (response.ok) fetchGastos();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-rose-600 pl-3">Gastos Fijos y Operativos</h1>
                    <p className="text-slate-500 mt-1 pl-4 text-sm">Control de luz, agua, alquileres y gastos de sucursal.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium text-sm transition-colors whitespace-nowrap">
                    + Registrar Gasto
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Sucursal</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-400 animate-pulse">Cargando gastos...</td></tr>
                            ) : gastos.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-400">No hay gastos registrados.</td></tr>
                            ) : (
                                gastos.map((gasto) => (
                                    <tr key={gasto.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 tabular-nums whitespace-nowrap">{gasto.fecha}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{gasto.concepto}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">{gasto.banca_name || 'General'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold tabular-nums text-slate-700">
                                            RD$ {parseFloat(gasto.monto).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {gasto.estado === 'Pagado' ? (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    PAGADO
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                    PENDIENTE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            {gasto.estado === 'Pendiente' && (
                                                <button onClick={() => markAsPaid(gasto)} className="text-emerald-600 bg-emerald-50 p-1.5 rounded-md hover:bg-emerald-100" title="Marcar como Pagado">✓</button>
                                            )}
                                            <button onClick={() => handleOpenModal(gasto)} className="text-blue-600 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100">✏️</button>
                                            <button onClick={() => handleDelete(gasto.id)} className="text-red-500 bg-red-50 p-1.5 rounded-md hover:bg-red-100">🗑️</button>
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
                            <h3 className="font-bold text-lg text-slate-800">{isEditing ? 'Editar Gasto' : 'Registrar Gasto'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Concepto</label>
                                <input type="text" name="concepto" required value={currentGasto.concepto} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="Ej. Alquiler de local" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Monto (RD$)</label>
                                    <input type="number" step="0.01" min="0" name="monto" required value={currentGasto.monto} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Fecha</label>
                                    <input type="date" name="fecha" required value={currentGasto.fecha} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Sucursal a la que aplica</label>
                                <select name="banca_id" required value={currentGasto.banca_id} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                                    <option value="">-- Seleccione una banca --</option>
                                    {bancas.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Estado de Pago</label>
                                <select name="estado" required value={currentGasto.estado} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                                    <option value="Pendiente">Pendiente (Por Pagar)</option>
                                    <option value="Pagado">Pagado</option>
                                </select>
                            </div>

                            <div className="pt-5 mt-2 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors">
                                    {isEditing ? 'Guardar Cambios' : 'Anexar Gasto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
