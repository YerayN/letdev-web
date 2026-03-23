import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileText, CheckCircle2, XCircle, Clock, Edit2, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const eur = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

const ESTADOS = {
  borrador:  { label:'Borrador',   cls:'bg-surface-100 text-navy/50' },
  enviado:   { label:'Enviado',    cls:'bg-blue-50 text-blue-500'    },
  visto:     { label:'Visto',      cls:'bg-purple-50 text-purple-500'},
  aceptado:  { label:'Aceptado',   cls:'bg-emerald-50 text-emerald-600'},
  rechazado: { label:'Rechazado',  cls:'bg-red-50 text-red-400'      },
  caducado:  { label:'Caducado',   cls:'bg-surface-200 text-navy/30' },
}

export default function Presupuestos() {
  const navigate = useNavigate()
  const [lista,   setLista]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro,  setFiltro]  = useState('todos')

  useEffect(() => {
    async function cargar() {
      const [{ data: pres }, { data: clis }] = await Promise.all([
        supabase.from('presupuestos').select('*').order('created_at', { ascending: false }),
        supabase.from('clientes').select('id,nombre,empresa'),
      ])
      const cMap = Object.fromEntries((clis || []).map(c => [c.id, c]))
      setLista((pres || []).map(p => ({ ...p, clientes: cMap[p.cliente_id] || null })))
      setLoading(false)
    }
    cargar()
  }, [])

  const totales = {
    pendiente: lista.filter(p => p.estado === 'enviado').length,
    aceptado:  lista.filter(p => p.estado === 'aceptado').length,
    rechazado: lista.filter(p => p.estado === 'rechazado').length,
  }
  const facturacion = lista.filter(p => p.estado === 'aceptado').reduce((s, p) => s + Number(p.total || 0), 0)
  const tasa = totales.aceptado + totales.rechazado > 0
    ? Math.round((totales.aceptado / (totales.aceptado + totales.rechazado)) * 100) : 0

  const filtrados = filtro === 'todos' ? lista : lista.filter(p => p.estado === filtro)

  return (
    <div className="space-y-5">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">Presupuestos</h1>
          <p className="text-navy/40 text-sm mt-0.5">{lista.length} en total</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/configuracion"
            className="hidden sm:flex items-center gap-1.5 text-xs text-navy/35 hover:text-navy/60 transition-colors">
            <Settings size={13} /> Configuración
          </Link>
          <Button icon={Plus} onClick={() => navigate('/dashboard/presupuestos/nuevo')}>
            <span className="hidden sm:inline">Nuevo presupuesto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* KPIs — 2 cols en móvil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total',      value:lista.length,       icon:FileText,     cls:'bg-surface-100 text-navy/50' },
          { label:'Pendientes', value:totales.pendiente,  icon:Clock,        cls:'bg-blue-50 text-blue-500'    },
          { label:'Aceptados',  value:totales.aceptado,   icon:CheckCircle2, cls:'bg-emerald-50 text-emerald-600'},
          { label:'Rechazados', value:totales.rechazado,  icon:XCircle,      cls:'bg-red-50 text-red-400'      },
        ].map(({ label, value, icon: Icon, cls }) => (
          <Card key={label}>
            <Card.Body className="flex items-center gap-2.5 p-3 md:p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
                <Icon size={14} />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-navy leading-none">{value}</p>
                <p className="text-[11px] text-navy/40">{label}</p>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Métricas conversión */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <Card.Body className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-navy/40 mb-0.5">Tasa de conversión</p>
              <p className="font-display font-bold text-2xl text-navy">{tasa}%</p>
              <p className="text-xs text-navy/30 mt-0.5">{totales.aceptado} de {totales.aceptado + totales.rechazado} cerrados</p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-surface-100 flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#F0C419" strokeWidth="4"
                  strokeDasharray={`${tasa * 1.382} 138.2`} strokeLinecap="round" />
              </svg>
              <span className="font-mono text-[11px] font-bold text-navy">{tasa}%</span>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="p-4">
            <p className="text-xs text-navy/40 mb-0.5">Facturación generada</p>
            <p className="font-display font-bold text-2xl text-navy">{eur(facturacion)}</p>
            <p className="text-xs text-navy/30 mt-0.5">De {totales.aceptado} presupuestos aceptados</p>
          </Card.Body>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        {/* Filtros */}
        <Card.Header className="flex flex-wrap gap-1.5 overflow-x-auto">
          {[
            { key:'todos',     label:'Todos'      },
            { key:'borrador',  label:'Borradores' },
            { key:'enviado',   label:'Enviados'   },
            { key:'aceptado',  label:'Aceptados'  },
            { key:'rechazado', label:'Rechazados' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filtro === key ? 'bg-navy text-gold' : 'text-navy/50 hover:bg-surface-100'
              }`}>
              {label}
            </button>
          ))}
        </Card.Header>

        {loading ? (
          <Card.Body className="py-12 text-center">
            <div className="w-5 h-5 border-2 border-navy/10 border-t-navy/40 rounded-full animate-spin mx-auto" />
          </Card.Body>
        ) : filtrados.length === 0 ? (
          <Card.Body className="py-12 text-center">
            <FileText size={24} className="text-navy/15 mx-auto mb-2" />
            <p className="text-sm text-navy/30 mb-4">No hay presupuestos aquí</p>
            <Button size="sm" icon={Plus} onClick={() => navigate('/dashboard/presupuestos/nuevo')}>Crear primero</Button>
          </Card.Body>
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="hidden md:block divide-y divide-surface-100">
              <div className="grid grid-cols-12 gap-3 px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-navy/35 bg-surface-50">
                <span className="col-span-2">Número</span>
                <span className="col-span-3">Cliente</span>
                <span className="col-span-3">Título</span>
                <span className="col-span-2">Estado</span>
                <span className="col-span-1 text-right">Total</span>
                <span className="col-span-1 text-right">Edit.</span>
              </div>
              {filtrados.map(p => {
                const est = ESTADOS[p.estado] || ESTADOS.borrador
                return (
                  <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors">
                    <span className="col-span-2 font-mono text-xs text-navy/60 truncate">{p.numero}</span>
                    <span className="col-span-3 text-sm text-navy truncate">{p.clientes?.empresa || p.clientes?.nombre || '—'}</span>
                    <span className="col-span-3 text-sm text-navy/60 truncate">{p.titulo}</span>
                    <span className="col-span-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${est.cls}`}>{est.label}</span>
                    </span>
                    <span className="col-span-1 text-right font-mono text-sm font-semibold text-navy">{eur(p.total)}</span>
                    <div className="col-span-1 flex justify-end">
                      <Link to={`/dashboard/presupuestos/${p.id}/editar`}
                        className="p-1.5 rounded-lg hover:bg-surface-100 text-navy/30 hover:text-navy transition-all">
                        <Edit2 size={13} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Móvil: cards */}
            <div className="md:hidden divide-y divide-surface-100">
              {filtrados.map(p => {
                const est = ESTADOS[p.estado] || ESTADOS.borrador
                return (
                  <div key={p.id} className="px-4 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-navy/40">{p.numero}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${est.cls}`}>{est.label}</span>
                      </div>
                      <p className="font-medium text-navy text-sm truncate">{p.titulo}</p>
                      <p className="text-xs text-navy/50 truncate">{p.clientes?.empresa || p.clientes?.nombre || '—'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono font-semibold text-navy text-sm">{eur(p.total)}</p>
                      <Link to={`/dashboard/presupuestos/${p.id}/editar`}
                        className="inline-flex items-center gap-1 text-[11px] text-gold hover:text-gold-dark mt-1">
                        <Edit2 size={11} /> Editar
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
