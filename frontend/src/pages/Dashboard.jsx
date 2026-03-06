import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MoreVertical, TrendingUp, Users, Box, PieChart as PieIcon, Layers, ChevronUp, ChevronDown, DollarSign, Activity, Home, Calendar } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const flowData = [
  { name: 'Lun', ingresos: 40, ganancia: 24, premios: 10 },
  { name: 'Mar', ingresos: 30, ganancia: 13, premios: 22 },
  { name: 'Mie', ingresos: 20, ganancia: 58, premios: 23 },
  { name: 'Jue', ingresos: 27, ganancia: 39, premios: 20 },
  { name: 'Vie', ingresos: 18, ganancia: 48, premios: 11 },
  { name: 'Sab', ingresos: 23, ganancia: 38, premios: 12 },
  { name: 'Dom', ingresos: 34, ganancia: 43, premios: 15 },
];

const weeklyData = [
  { name: 'Mon', valor: 0.1 },
  { name: 'Tue', valor: 0.1 },
  { name: 'Wed', valor: 0.1 },
  { name: 'Thu', valor: 0.1 },
  { name: 'Fri', valor: 0.1 },
  { name: 'Sat', valor: 0.1 },
  { name: 'Sun', valor: 0.1 },
];

const staffData = [
  { name: 'Pendiente', value: 100, color: '#4f46e5' },
  { name: 'Aprobado', value: 60, color: '#10b981' },
  { name: 'Rechazado', value: 40, color: '#f59e0b' },
];

const payrollData = [
  { name: 'Nov', salario: 400, impuestos: 100, gastos: 50 },
  { name: 'Dic', salario: 420, impuestos: 110, gastos: 40 },
  { name: 'Ene', salario: 320, impuestos: 80, gastos: 30 },
  { name: 'Feb', salario: 450, impuestos: 120, gastos: 60 },
  { name: 'Mar', salario: 410, impuestos: 105, gastos: 50 },
];

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
        total_bancas: 0,
        total_empleados: 0,
        ingresos_mes: 0,
        gastos_mes: 0,
        balance_neto: 0,
        periodo: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await fetch('https://api-v2.salamihost.lat/api/dashboard', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* TOP ROW: FLOW STATS & BALANCE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* FLOW STATISTICS */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-md border border-border">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-text-main">Estadísticas de Flujo</h3>
                        <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-6">
                            <FlowIndicator 
                                icon={<div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600"><DollarSign size={20}/></div>}
                                label="Ingresos Totales"
                                value={`RD$ ${metrics.ingresos_mes.toLocaleString()}`}
                            />
                            <FlowIndicator 
                                icon={<div className="bg-green-100 p-3 rounded-2xl text-green-600"><Calendar size={20}/></div>}
                                label="Ganancia Semanal"
                                value="RD$ 0.00"
                            />
                            <FlowIndicator 
                                icon={<div className="bg-red-100 p-3 rounded-2xl text-red-600"><Activity size={20}/></div>}
                                label="Premios Pagados"
                                value="RD$ 0.00"
                            />
                        </div>

                        <div className="md:col-span-3 h-64 relative">
                            <div className="absolute top-0 right-0 text-[10px] font-black text-text-muted uppercase tracking-widest">Max</div>
                            <div className="absolute bottom-4 right-0 text-[10px] font-black text-text-muted uppercase tracking-widest">Min</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={flowData} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                                    <Bar dataKey="ingresos" fill="#f59e0b" radius={[4, 4, 4, 4]} barSize={6} />
                                    <Bar dataKey="ganancia" fill="#10b981" radius={[4, 4, 4, 4]} barSize={6} />
                                    <Bar dataKey="premios" fill="#ef4444" radius={[4, 4, 4, 4]} barSize={6} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* MY BALANCE CARD */}
                <div className="space-y-10">
                    <div className="bg-gradient-to-br from-primary to-indigo-800 p-10 rounded-[40px] shadow-2xl shadow-primary/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold opacity-80">Mi Balance</h3>
                            </div>
                            
                            <div>
                                <p className="text-sm font-medium opacity-70 mb-1">Balance General</p>
                                <p className="text-4xl font-black tracking-tighter">RD$ {metrics.balance_neto.toLocaleString()}</p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-medium opacity-70 mb-1">Ganancia Computada</p>
                                    <p className="text-xl font-black">RD$ 0.00</p>
                                </div>
                                <div className="bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black backdrop-blur-md">
                                    +10%
                                </div>
                            </div>

                            <div className="flex justify-center space-x-2 pt-4">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-md border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-text-main">Operaciones Top</h3>
                            <MoreVertical size={18} className="text-text-muted cursor-pointer" />
                        </div>
                        <p className="text-sm text-text-muted font-bold text-center py-4">Sin historial de operaciones registradas.</p>
                    </div>
                </div>
            </div>

            {/* SECOND ROW: WEEKLY PERFORMANCE & OTHER STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-text-main">Rendimiento Semanal</h3>
                        <div className="flex space-x-2">
                            <button className="p-2 rounded-full bg-white border border-border text-text-muted hover:text-primary transition-all"><ChevronDown className="rotate-90" size={18}/></button>
                            <button className="p-2 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all"><ChevronDown className="-rotate-90" size={18}/></button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-10 rounded-[40px] shadow-md border border-border">
                        <h4 className="text-sm font-black text-text-main mb-8">Distribución de Ventas</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} domain={[0, 4]} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="valor" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorWeekly)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[40px] shadow-md border border-border">
                        <div className="flex justify-between items-center mb-8">
                           <h3 className="text-lg font-black text-text-main">Resumen Mensual</h3>
                           <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                        </div>
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={staffData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {staffData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-text-main">100%</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase">Meta</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <LegendItem color="#4f46e5" label="Personal" />
                            <LegendItem color="#10b981" label="Ingresos" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlowIndicator({ icon, label, value }) {
    return (
        <div className="flex items-center space-x-4">
            {icon}
            <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">{label}</p>
                <p className="text-sm font-extrabold text-text-main">{value}</p>
            </div>
        </div>
    );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[10px] font-black text-text-muted uppercase tracking-wider whitespace-nowrap">{label}</span>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }) {
    return (
        <div className="bg-white p-10 rounded-[40px] shadow-md border border-border group hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-slate-300/50">
            <div className={`w-14 h-14 ${color.replace('text', 'bg')}/10 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
            </div>
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{title}</h4>
            <p className="text-3xl font-black text-text-main tracking-tighter">{value}</p>
            <div className="mt-4 flex items-center space-x-1 text-[11px] font-bold text-accent-green uppercase tracking-wider">
               <ChevronUp size={14} />
               <span>{trend}</span>
            </div>
        </div>
    );
}
