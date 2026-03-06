import React, { useState, useEffect, useMemo } from 'react';

export default function Operaciones() {
    const [operaciones, setOperaciones] = useState([]);
    const [bancas, setBancas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros de fecha
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const [currentOp, setCurrentOp] = useState({
        id: null,
        banca_id: '',
        fecha: today,
        tipo: 'ingreso',
        descripcion: '',
        monto: ''
    });

    useEffect(() => {
        fetchBancas();
    }, []);

    // Fetch Operations dependiente de los filtros
    useEffect(() => {
        fetchOperaciones();
    }, [dateFilter]);

    const fetchOperaciones = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:8000/api/operaciones';
            if (dateFilter.start && dateFilter.end) {
                url += `?start_date=${dateFilter.start}&end_date=${dateFilter.end}`;
            }

            const response = await fetch(url, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setOperaciones(data);
            }
        } catch (error) {
            console.error('Error fetching Operaciones:', error);
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

    const handleOpenModal = (op = null) => {
        if (op) {
            setIsEditing(true);
            setCurrentOp(op);
        } else {
            setIsEditing(false);
            setCurrentOp({ id: null, banca_id: '', fecha: today, tipo: 'ingreso', descripcion: '', monto: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentOp(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentOp.banca_id || !currentOp.monto || !currentOp.descripcion) {
            alert("Completar campos requeridos");
            return;
        }

        const payload = { ...currentOp, monto: parseFloat(currentOp.monto) };

        const url = isEditing
            ? `http://localhost:8000/api/operaciones/${currentOp.id}`
            : 'http://localhost:8000/api/operaciones';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchOperaciones();
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
        if (!window.confirm('¿Eliminar definitivamente esta operación financiera?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/operaciones/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                fetchOperaciones();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Cálculo rápido del total neto
    const netTotal = useMemo(() => {
        return operaciones.reduce((acc, op) => {
            const amount = parseFloat(op.monto);
            if (op.tipo === 'ingreso') return acc + amount;
            if (op.tipo === 'gasto') return acc - amount;
            return acc;
        }, 0);
    }, [operaciones]);

    return (
        <div className="font-sans">

            {/* HEADER y KPIs */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Operaciones Financieras</h1>
                        <p className="text-slate-500 mt-1 pl-4 text-sm">Registro de ingresos y gastos de las bancas.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium text-sm transition-colors whitespace-nowrap">
                        + Registrar Operación
                    </button>
                </div>

                {/* Tarjeta de Total Neto */}
                <div className="mt-6">
                    <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-xl shadow-sm border ${netTotal >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                        <div className="p-3 bg-white/60 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold opacity-80 uppercase tracking-widest">Balance Neto</p>
                            <h2 className="text-3xl font-black">
                                RD$ {netTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTROS */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Desde</label>
                    <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Hasta</label>
                    <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" />
                </div>
                <div>
                    <button
                        onClick={() => setDateFilter({ start: '', end: '' })}
                        className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium">
                        Limpiar
                    </button>
                </div>
            </div>

            {/* TABLA DE OPERACIONES */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4">Banca</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-400 animate-pulse">Consultando operaciones...</td></tr>
                            ) : operaciones.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-400">No hay operaciones registradas en este rango.</td></tr>
                            ) : (
                                operaciones.map((op) => (
                                    <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 tabular-nums">{op.fecha}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{op.descripcion}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">{op.banca_name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {op.tipo === 'ingreso' ? (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                                    INGRESO
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                                    GASTO
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold tabular-nums ${op.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                                            {op.tipo === 'ingreso' ? '+' : '-'} {parseFloat(op.monto).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleOpenModal(op)} className="text-slate-400 hover:text-blue-600 transition-colors">✏️</button>
                                            <button onClick={() => handleDelete(op.id)} className="text-slate-400 hover:text-red-600 transition-colors">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL / DIALOG */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{isEditing ? 'Editar Operación' : 'Registrar Operación'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">

                            {/* Selector de Tipo (Ingreso vs Gasto) con diseño de tabs */}
                            <div className="flex p-1 bg-slate-100 rounded-lg">
                                <button type="button" onClick={() => setCurrentOp({ ...currentOp, tipo: 'ingreso' })} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${currentOp.tipo === 'ingreso' ? 'bg-white text-green-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                    📈 Ingreso
                                </button>
                                <button type="button" onClick={() => setCurrentOp({ ...currentOp, tipo: 'gasto' })} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${currentOp.tipo === 'gasto' ? 'bg-white text-red-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                    📉 Gasto
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Monto (RD$)</label>
                                    <input type="number" step="0.01" min="0" name="monto" required value={currentOp.monto} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Fecha</label>
                                    <input type="date" name="fecha" required value={currentOp.fecha} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Sucursal (Banca)</label>
                                <select name="banca_id" required value={currentOp.banca_id} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">-- Seleccione una banca --</option>
                                    {bancas.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Concepto / Descripción</label>
                                <input type="text" name="descripcion" required value={currentOp.descripcion} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej. Venta del día, Pago de Luz..." />
                            </div>

                            <div className="pt-5 mt-2 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className={`px-5 py-2.5 font-medium text-white rounded-lg shadow-sm transition-colors ${currentOp.tipo === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                    {isEditing ? 'Actualizar' : 'Guardar Operación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
