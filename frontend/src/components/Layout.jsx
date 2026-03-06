import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Wallet, 
  FileText, 
  Settings, 
  PieChart, 
  Box, 
  Bell, 
  LogOut, 
  Calendar, 
  Filter, 
  Download, 
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Layout({ children, user, onLogout, settings }) {
  if (!user) return null;

  const userInitials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive
        ? "bg-primary/10 text-primary font-bold shadow-sm"
        : "text-text-muted hover:bg-slate-50 hover:text-text-main font-medium"
    }`;

  const navItems = [
    { name: 'Panel de Control', path: '/', icon: LayoutDashboard },
    { name: 'Bancas', path: '/bancas', icon: Layers },
    { name: 'Personal', path: '/empleados', icon: Users },
    { name: 'Operaciones', path: '/operaciones', icon: Receipt },
    { name: 'Gastos', path: '/gastos', icon: Wallet },
    { name: 'Nómina', path: '/nomina', icon: Box },
    { name: 'Reportes', path: '/reportes', icon: PieChart },
  ];

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-border flex flex-col z-30 shadow-xl shadow-slate-200/50">
        {/* LOGO */}
        <div className="p-8 flex items-center space-x-3">
          {settings.logo ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src={`https://api-v2.salamihost.lat${settings.logo}`} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group transition-all hover:bg-primary hover:text-white cursor-pointer">
               <Sparkles size={22} />
            </div>
          )}
          <span className="text-2xl font-black text-text-main tracking-tighter truncate">
            {settings.company_name || 'ERPMOTA'}
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 mt-2">Menú Principal</p>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={navLinkClass}>
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[14px]">{item.name}</span>
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-slate-100">
             <p className="px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Sistema</p>
             <NavLink to="/configuracion" className={navLinkClass}>
                <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                <span className="text-[14px]">Configuración</span>
             </NavLink>
          </div>
        </nav>

        {/* USER ZONE */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group cursor-pointer hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-3">
               <div className="w-8 h-8 rounded-lg bg-accent-orange/10 text-accent-orange flex items-center justify-center font-bold text-xs">AI</div>
               <div className="flex items-center text-[10px] font-black text-text-muted uppercase tracking-wider">
                 <span>Plan Pro</span>
                 <Bell size={12} className="ml-2 animate-bounce" />
               </div>
            </div>
            <button className="w-full bg-white border border-border py-2 px-4 rounded-xl text-xs font-black text-text-main shadow-sm hover:shadow-md transition-all uppercase tracking-widest">
              Gestionar Facturación
            </button>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-text-muted hover:text-accent-red hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[14px] font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-text-main tracking-tight">¡Hola, {user.name.split(' ')[0]}!</h1>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest mt-0.5">
              {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-border px-4 py-2.5 rounded-xl text-[13px] font-bold text-text-main">
              <Calendar size={16} className="text-primary" />
              <span>Resumen de Octubre</span>
              <ChevronDown size={14} className="text-text-muted" />
            </div>

            <button className="p-2.5 border border-border rounded-xl text-text-muted hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
              <Bell size={20} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-text-main text-white rounded-xl text-[13px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              <Download size={16} />
              <span>Exportar</span>
            </button>

            <div className="h-8 w-px bg-border mx-2"></div>

            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-text-main leading-none group-hover:text-primary transition-colors">{user.name}</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter mt-1">{user.role || 'Administrador'}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border-2 border-white overflow-hidden flex items-center justify-center text-primary font-black shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 bg-bg-main custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
          
          <footer className="mt-20 pb-10 text-center">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40">
              &copy; 2026 ERPMOTA V2 &bull; PRECISIÓN & RENDIMIENTO
            </p>
          </footer>
        </div>
      </main>

    </div>
  );
}
