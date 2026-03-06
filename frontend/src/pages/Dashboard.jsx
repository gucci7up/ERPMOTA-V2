import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MoreVertical, TrendingUp, Users, Box, PieChart as PieIcon, Layers, ChevronUp, ChevronDown, DollarSign, Activity, Home } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const staffData = [
  { name: 'Pendiente', value: 100, color: '#4f46e5' },
  { name: 'Aprobado', value: 60, color: '#10b981' },
  { name: 'Rechazado', value: 40, color: '#f59e0b' },
];

const payrollData = [
  { name: '30 Sep', salario: 400, impuestos: 100, gastos: 50 },
  { name: '10 Oct', salario: 420, impuestos: 110, gastos: 40 },
  { name: '20 Oct', salario: 320, impuestos: 80, gastos: 30 },
  { name: '30 Oct', salario: 450, impuestos: 120, gastos: 60 },
  { name: '10 Nov', salario: 410, impuestos: 105, gastos: 50 },
];

const incomeData = [
  { name: '30 Sep', valor: 1.5 },
  { name: '10 Oct', valor: 3.2 },
  { name: '20 Oct', valor: 8.5 },
  { name: '30 Oct', valor: 4.8 },
  { name: '10 Nov', valor: 11.8 },
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
            
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                  title="Total de Personal" 
                  value={metrics.total_empleados} 
                  trend="+ 12 más que el trimestre pasado" 
                  icon={Users} 
                  color="text-accent-orange" 
                />
                <StatCard 
                  title="Operaciones Totales" 
                  value="200" 
                  trend="+ 0.2% más que el trimestre pasado" 
                  icon={Activity} 
                  color="text-accent-blue" 
                />
                <StatCard 
                  title="Bancas Activas" 
                  value={metrics.total_bancas} 
                  trend="+ 4% más que el trimestre pasado" 
                  icon={Home} 
                  color="text-accent-green" 
                />
                <StatCard 
                  title="Gastos del Mes" 
                  value={`RD$ ${metrics.gastos_mes.toLocaleString()}`} 
                  trend="Sin cambios" 
                  icon={TrendingUp} 
                  color="text-accent-red" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                {/* Annual payroll summary */}
                <div className="bg-white p-10 rounded-[40px] shadow-md border border-border">
                    <div className="w-full flex justify-between items-center mb-8">
                       <div>
                           <h3 className="text-xl font-black text-text-main">Resumen de Nómina Anual</h3>
                           <p className="text-sm text-text-muted font-medium">Distribución de pagos y deducciones</p>
                       </div>
                       <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="salario" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={8} />
                                <Bar dataKey="impuestos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={8} />
                                <Bar dataKey="gastos" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center space-x-6 mt-8">
                       <LegendItem color="#4f46e5" label="Salario Neto" />
                       <LegendItem color="#ef4444" label="Impuestos" />
                       <LegendItem color="#f59e0b" label="Gastos" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Total income */}
                <div className="bg-white p-10 rounded-[40px] shadow-md border border-border">
                    <div className="w-full flex justify-between items-center mb-4">
                       <h3 className="text-xl font-black text-text-main">Ingresos Totales</h3>
                       <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    
                    <div className="mb-8">
                       <span className="text-3xl font-black text-text-main">RD$ {metrics.balance_neto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                       <div className="flex items-center space-x-1 text-accent-green text-sm font-bold mt-1">
                          <ChevronUp size={16} />
                          <span>21% vs el mes pasado</span>
                       </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={incomeData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="valor" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-white rounded-[40px] shadow-md border border-border overflow-hidden">
                    <div className="p-10 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-text-main">Transacciones Recientes</h3>
                            <p className="text-sm text-text-muted font-medium">Últimas operaciones del sistema</p>
                        </div>
                        <button className="text-sm font-black text-primary hover:underline underline-offset-4">Ver todo</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 text-left text-[11px] font-black text-text-muted uppercase tracking-widest">Banca</th>
                                    <th className="px-10 py-5 text-left text-[11px] font-black text-text-muted uppercase tracking-widest">Fecha</th>
                                    <th className="px-10 py-5 text-left text-[11px] font-black text-text-muted uppercase tracking-widest">Monto</th>
                                    <th className="px-10 py-5 text-left text-[11px] font-black text-text-muted uppercase tracking-widest">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[1, 2, 3, 4].map((i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6 font-bold text-text-main text-sm text-nowrap">Central de Apuestas {i}</td>
                                        <td className="px-10 py-6 text-sm font-bold text-text-muted">12 Oct, 2023</td>
                                        <td className="px-10 py-6 font-black text-text-main text-sm text-nowrap">RD$ 1,500.00</td>
                                        <td className="px-10 py-6">
                                            <span className="px-4 py-1.5 bg-green-50 text-accent-green text-[11px] font-black rounded-full uppercase tracking-tighter shadow-sm border border-green-100">
                                                Completado
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
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

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[11px] font-black text-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}
