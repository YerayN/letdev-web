import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, FolderKanban, Calendar,
  LogOut, ChevronLeft, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LetDevLogo } from '@/components/Navbar'

const SIDEBAR_LINKS = [
  { to: '/dashboard',              label: 'Panel',        icon: LayoutDashboard, end: true },
  { to: '/dashboard/clientes',     label: 'Clientes',     icon: Users },
  { to: '/dashboard/proyectos',    label: 'Proyectos',    icon: FolderKanban },
  { to: '/dashboard/presupuestos', label: 'Presupuestos', icon: FileText },
  { to: '/dashboard/calendario',   label: 'Calendario',   icon: Calendar },
]

function NavItem({ to, label, icon: Icon, end, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive ? 'bg-gold text-navy' : 'text-white/60 hover:text-white hover:bg-white/8'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

export default function DashboardLayout() {
  const { user, signOut }   = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-white/10 ${isMobile ? 'px-5 justify-between' : collapsed ? 'justify-center px-3' : 'px-4 justify-between'}`}>
        {(!collapsed || isMobile) && <LetDevLogo />}
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white p-1">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 sidebar-scroll overflow-y-auto">
        {SIDEBAR_LINKS.map(({ to, label, icon, end }) => (
          <NavItem key={to} to={to} label={label} icon={icon} end={end}
            collapsed={collapsed && !isMobile} onClick={() => isMobile && setMobileOpen(false)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/10 space-y-0.5">
        {(!collapsed || isMobile) && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Sesión</p>
            <p className="text-xs text-white/60 truncate mt-0.5">{user?.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Cerrar sesión</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-surface-100">

      {/* ── SIDEBAR DESKTOP ─────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col bg-navy transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent(false)}
      </aside>

      {/* ── SIDEBAR MÓVIL (overlay) ─────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] flex flex-col bg-navy animate-slide-up shadow-2xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-14 md:h-16 bg-white border-b border-surface-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
          {/* Hamburger solo en móvil */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-navy/50 hover:text-navy hover:bg-surface-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          {/* Logo móvil centrado */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2">
            <span className="font-display font-bold text-navy text-lg">
              Let<span className="text-gold">Dev</span>
            </span>
          </div>
          <div className="hidden md:block" />
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-gold font-display font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </header>

        {/* Área de trabajo */}
        <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
