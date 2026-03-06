import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MoreVertical, TrendingUp, Users, Box, PieChart as PieIcon, Layers, ChevronUp, ChevronDown } from 'lucide-react';

const COLORS = ['#8b5cf6', '#f97316', '#fbbf24'];

const staffData = [
  { name: 'Pending', value: 100, color: '#8b5cf6' },
  { name: 'Approved', value: 60, color: '#f97316' },
  { name: 'Rejected', value: 40, color: '#fbbf24' },
];

const payrollData = [
  { name: '30 Sep', salary: 400, tax: 100, loan: 50 },
  { name: '10 Oct', salary: 420, tax: 110, loan: 40 },
  { name: '20 Oct', salary: 320, tax: 80, loan: 30 },
  { name: '30 Oct', salary: 450, tax: 120, loan: 60 },
  { name: '10 Nov', salary: 410, tax: 105, loan: 50 },
];

const incomeData = [
  { name: '30 Sep', value: 1.5 },
  { name: '10 Oct', value: 3.2 },
  { name: '20 Oct', value: 8.5 },
  { name: '30 Oct', value: 4.8 },
  { name: '10 Nov', value: 11.8 },
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
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total number of staff" 
                  value={metrics.total_empleados} 
                  trend="+ 12 more than last quarter" 
                  icon={Users} 
                  iconColor="text-accent-orange" 
                  iconBg="bg-accent-orange/10" 
                />
                <StatCard 
                  title="Total application" 
                  value="200" 
                  trend="+ 0.2% more than last quarter" 
                  icon={Box} 
                  iconColor="text-accent-red" 
                  iconBg="bg-accent-red/10" 
                />
                <StatCard 
                  title="Total projects" 
                  value="38" 
                  trend="+ 4% more than last quarter" 
                  icon={PieIcon} 
                  iconColor="text-accent-purple" 
                  iconBg="bg-accent-purple/10" 
                />
                <StatCard 
                  title="Total departments" 
                  value="8" 
                  trend="Without changes" 
                  icon={Layers} 
                  iconColor="text-accent-blue" 
                  iconBg="bg-accent-blue/10" 
                  isStable
                />
            </div>

            {/* MIDDLE CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Staff applications card */}
                <div className="bg-white p-8 rounded-[32px] border border-border flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8">
                       <h3 className="text-xl font-bold text-text-main">Staff applications card</h3>
                       <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    
                    <div className="relative w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={staffData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {staffData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-text-main">200</span>
                            <span className="text-xs text-text-muted">Total application</span>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-50">
                        {staffData.map((item) => (
                           <div key={item.name} className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-2xl font-bold text-text-main">{item.value}</span>
                              </div>
                              <span className="text-xs text-text-muted ml-3">{item.name}</span>
                           </div>
                        ))}
                    </div>
                </div>

                {/* Annual payroll summary */}
                <div className="bg-white p-8 rounded-[32px] border border-border">
                    <div className="w-full flex justify-between items-center mb-8">
                       <h3 className="text-xl font-bold text-text-main">Annual payroll summary</h3>
                       <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="salary" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={8} />
                                <Bar dataKey="tax" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={8} />
                                <Bar dataKey="loan" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center space-x-4 mt-8">
                       <LegendItem color="#ef4444" label="Net salary" />
                       <LegendItem color="#fbbf24" label="Tax" />
                       <LegendItem color="#8b5cf6" label="Loan" />
                    </div>
                </div>

                {/* Total income */}
                <div className="bg-white p-8 rounded-[32px] border border-border">
                    <div className="w-full flex justify-between items-center mb-4">
                       <h3 className="text-xl font-bold text-text-main">Total income</h3>
                       <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    
                    <div className="mb-8">
                       <span className="text-3xl font-bold text-text-main">${metrics.balance_neto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                       <div className="flex items-center space-x-1 text-accent-green text-sm font-semibold mt-1">
                          <ChevronUp size={16} />
                          <span>21% vs last month</span>
                       </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={incomeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* BOTTOM TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment vouchers */}
                <div className="bg-white p-8 rounded-[32px] border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-text-main">Payment vouchers</h3>
                        <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                    <th className="pb-4">S/N</th>
                                    <th className="pb-4">Subject</th>
                                    <th className="pb-4">Date</th>
                                    <th className="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <TableRow sn="01" subject="Request for FARS for October 2022" date="25/10/2025" status="Pending" />
                                <TableRow sn="02" subject="Request for project proposal fee" date="19/10/2025" status="Approved" />
                                <TableRow sn="03" subject="Request for FARS for October 2022" date="10/10/2025" status="Approved" />
                                <TableRow sn="04" subject="Request for project proposal fee" date="03/10/2025" status="Pending" />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Budget history */}
                <div className="bg-white p-8 rounded-[32px] border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-text-main">Budget history</h3>
                        <MoreVertical size={20} className="text-text-muted cursor-pointer" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                    <th className="pb-4">S/N</th>
                                    <th className="pb-4">Budget No.</th>
                                    <th className="pb-4">Budgeted Amunt (N)</th>
                                    <th className="pb-4">Actual Amount (N)</th>
                                    <th className="pb-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <BudgetRow sn="01" no="00211235" budget="1,400,000.00" actual="1,380,000.00" date="25/10/2025" />
                                <BudgetRow sn="02" no="36211235" budget="400,000.00" actual="500,000.00" date="22/10/2025" />
                                <BudgetRow sn="03" no="00214465" budget="2,000,000.00" actual="1,400,000.00" date="20/10/2025" />
                                <BudgetRow sn="04" no="00214465" budget="800,000.00" actual="1,800,000.00" date="20/10/2025" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, iconColor, iconBg, isStable }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-border hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-4xl font-bold text-text-main">{value}</span>
        <h3 className="text-sm font-medium text-text-muted">{title}</h3>
      </div>
      <div className={`mt-6 flex items-center space-x-1 text-xs font-bold ${isStable ? 'text-accent-green' : 'text-accent-green'}`}>
        {!isStable && <ChevronUp size={14} />}
        {isStable && <TrendingUp size={14} />}
        <span>{trend}</span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-xs font-bold text-text-muted">{label}</span>
    </div>
  );
}

function TableRow({ sn, subject, date, status }) {
  const statusStyles = {
    'Pending': 'text-amber-500 bg-amber-50',
    'Approved': 'text-accent-green bg-green-50',
  };

  return (
    <tr className="border-t border-slate-50 group hover:bg-slate-50 transition-colors">
      <td className="py-4 font-bold text-text-main">{sn}</td>
      <td className="py-4 text-text-muted">{subject}</td>
      <td className="py-4 text-text-muted">{date}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function BudgetRow({ sn, no, budget, actual, date }) {
  return (
    <tr className="border-t border-slate-50 group hover:bg-slate-50 transition-colors">
      <td className="py-4 font-bold text-text-main">{sn}</td>
      <td className="py-4 text-text-muted">{no}</td>
      <td className="py-4 font-bold text-text-main">RD$ {budget}</td>
      <td className="py-4 font-bold text-text-main">RD$ {actual}</td>
      <td className="py-4 text-text-muted">{date}</td>
    </tr>
  );
}
