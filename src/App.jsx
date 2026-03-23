import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Layouts
import PublicLayout  from '@/components/layout/PublicLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Páginas públicas
import Home       from '@/pages/Home'
import Servicios  from '@/pages/Servicios'
import Contacto   from '@/pages/Contacto'
import Login      from '@/pages/Login'

// Páginas de la intranet
import Dashboard           from '@/pages/Dashboard'
import Clientes            from '@/pages/Clientes'
import ClienteDetalle      from '@/pages/ClienteDetalle'
import Calendario          from '@/pages/Calendario'
import Proyectos           from '@/pages/Proyectos'
import Presupuestos        from '@/pages/Presupuestos'
import Configuracion        from '@/pages/Configuracion'
import PresupuestoGenerator from '@/components/PresupuestoGenerator'

// Pantalla de carga mientras Supabase decide si hay sesión
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <span className="text-gold/60 font-body text-sm tracking-widest uppercase">Cargando</span>
      </div>
    </div>
  )
}

// Guarda de rutas privadas — si no hay sesión, al login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── WEB PÚBLICA ──────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"          element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto"  element={<Contacto />} />
        </Route>

        <Route path="/login" element={<Login />} />

        {/* ── INTRANET (rutas protegidas) ───────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* /dashboard carga el panel principal por defecto */}
          <Route index element={<Dashboard />} />
          <Route path="calendario"                       element={<Calendario />} />
          <Route path="clientes"                         element={<Clientes />} />
          <Route path="clientes/:id"                     element={<ClienteDetalle />} />
          <Route path="proyectos"                        element={<Proyectos />} />
          <Route path="presupuestos"                     element={<Presupuestos />} />
          <Route path="presupuestos/nuevo"               element={<PresupuestoGenerator />} />
          <Route path="presupuestos/:id/editar"          element={<PresupuestoGenerator />} />
          <Route path="configuracion"                    element={<Configuracion />} />
        </Route>

        {/* Cualquier ruta que no exista va a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
