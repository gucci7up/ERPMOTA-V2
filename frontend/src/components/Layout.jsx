import { NavLink } from 'react-router-dom';

export default function Layout({ children, user, onLogout }) {
  if (!user) {
    return null; // O redirigir a login si estuviera en un Router real
  }

  const userInitials = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all font-medium"
      : "flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-medium";

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">

      {/* SIDEBAR (Menú Lateral Izquierdo) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">

        {/* LOGO & BRANDING */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50 bg-slate-950/30">
          <h1 className="text-xl font-bold tracking-widest text-blue-400">
            ERP<span className="text-white">MOTA</span>
          </h1>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <NavLink to="/" end className={navLinkClass}>
            <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11l1.293-1.293a1 1 0 011.414 0L21 12m-2 10v-3a1 1 0 00-1-1h-3"></path></svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/bancas" className={navLinkClass}>
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <span>Bancas</span>
          </NavLink>

          <NavLink to="/empleados" className={navLinkClass}>
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span>Empleados</span>
          </NavLink>

          <NavLink to="/operaciones" className={navLinkClass}>
            <span>💰</span>
            Operaciones
          </NavLink>
          <NavLink to="/gastos" className={navLinkClass}>
            <span>🧾</span>
            Gastos Fijos
          </NavLink>
          <NavLink to="/nomina" className={navLinkClass}>
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            <span>Nómina</span>
          </NavLink>

          <NavLink to="/reportes" className={navLinkClass}>
            <span>📊</span>
            Reportes
          </NavLink>

          <div className="pt-4 mt-4 border-t border-slate-700/50">
            <NavLink to="/configuracion" className={navLinkClass}>
              <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>Configuración</span>
            </NavLink>
          </div>
        </nav>

        {/* CERRAR SESIÓN */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button
            onClick={onLogout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-slate-800 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          {/* Breadcrumb / Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-800">Panel de Control</h2>
            <p className="text-xs text-slate-500 font-medium">Bienvenido de nuevo, visualiza tus métricas.</p>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">
              {user.name} <span className="text-xs text-slate-400 ml-1">({user.role})</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 shadow-md shadow-blue-500/30 flex items-center justify-center text-white text-xs font-bold tracking-wider">
              {userInitials}
            </div>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO (Vistas de React) */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50 relative">
          {/* Fondo decorativo sutil */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
