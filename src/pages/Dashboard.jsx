import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, FolderKanban, FileText, TrendingUp, TrendingDown,
  ArrowRight, Clock, CheckCircle2, AlertCircle, Euro, BarChart3, Target,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'

const eur = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
const pct = (n) => `${Number(n || 0).toFixed(1)}%`

function DeltaBadge({ actual, anterior }) {
  if (!anterior || anterior === 0) return null
  const diff = ((actual - anterior) / anterior) * 100
  const pos = diff > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${pos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
      {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(diff).toFixed(0)}%
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color = 'gold', delta, deltaAnterior }) {
  const colors = {
    gold: 'bg-gold/10 text-gold', blue: 'bg-blue-50 text-blue-500',
    emerald: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-500',
    purple: 'bg-purple-50 text-purple-500',
  }
  return (
    <Card>
      <Card.Body className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon size={15} strokeWidth={1.8} />
          </div>
          {delta !== undefined && <DeltaBadge actual={delta} anterior={deltaAnterior} />}
        </div>
        <div>
          <p className="font-display font-bold text-xl text-navy tracking-tight leading-none">{value}</p>
          <p className="text-xs text-navy/40 mt-1">{label}</p>
        </div>
        {sub && <p className="text-[11px] text-navy/30">{sub}</p>}
      </Card.Body>
    </Card>
  )
}

function ProgressBar({ value, max }) {
  const p = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${p}%` }} />
    </div>
  )
}

const ESTADO_PROYECTO = {
  presupuestado: { label: 'Presupuesto', cls: 'bg-blue-50 text-blue-500' },
  en_curso:      { label: 'En curso',    cls: 'bg-gold/10 text-gold-dark' },
  pausado:       { label: 'Pausado',     cls: 'bg-orange-50 text-orange-500' },
  entregado:     { label: 'Entregado',   cls: 'bg-emerald-50 text-emerald-600' },
  cancelado:     { label: 'Cancelado',   cls: 'bg-red-50 text-red-400' },
  mantenimiento: { label: 'Mantenim.',   cls: 'bg-purple-50 text-purple-500' },
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-6">
      <AlertCircle size={20} className="text-navy/15 mx-auto mb-1.5" />
      <p className="text-xs text-navy/30">{text}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [kpis,    setKpis]    = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [actividad, setActividad] = useState([])
  const [meses,   setMeses]   = useState([])
  const [loading, setLoading] = useState(true)

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0]

  useEffect(() => {
    async function cargar() {
      const [{ data: kpisData }, { data: proyData }, { data: actData }, { data: cliData }] = await Promise.all([
        supabase.from('vista_kpis').select('*').single(),
        supabase.from('proyectos')
          .select('*')
          .in('estado', ['en_curso','presupuestado','pausado'])
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('interacciones')
          .select('*')
          .order('fecha', { ascending: false }).limit(6),
        supabase.from('clientes').select('id,nombre,empresa'),
      ])

      // Cruzamos en frontend para no depender del schema cache
      const cMap = Object.fromEntries((cliData || []).map(c => [c.id, c]))
      const proyConCliente = (proyData || []).map(p => ({ ...p, clientes: cMap[p.cliente_id] || null }))
      const actConCliente  = (actData  || []).map(a => ({ ...a, clientes: cMap[a.cliente_id] || null }))

      let mensualData = []
      try {
        const { data } = await supabase.rpc('facturacion_por_mes', { meses: 6 })
        mensualData = data || []
      } catch (_) {}

      setKpis(kpisData || {})
      setProyectos(proyConCliente)
      setActividad(actConCliente)
      setMeses(mensualData)
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-navy/10 border-t-navy/40 rounded-full animate-spin" />
    </div>
  )

  const k = kpis || {}
  const maxMes = Math.max(...meses.map(m => m?.total || 0), 1)

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Saludo */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">
            Buenos días, {displayName} 👋
          </h1>
          <p className="text-navy/40 text-sm mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/dashboard/presupuestos/nuevo"
          className="shrink-0 inline-flex items-center gap-1.5 bg-gold hover:bg-gold-light text-navy font-semibold text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg transition-colors">
          + Presupuesto
        </Link>
      </div>

      {/* KPIs — 2 cols móvil, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Users}       label="Clientes activos"    value={k.clientes_activos ?? '—'}        sub={`+${k.clientes_nuevo_mes ?? 0} este mes`}  color="blue" />
        <KpiCard icon={FolderKanban} label="Proyectos en curso" value={k.proyectos_en_curso ?? '—'}       sub={`${k.proyectos_entregados ?? 0} entregados`} color="purple" />
        <KpiCard icon={Euro}         label="Facturación mes"    value={eur(k.facturacion_mes_actual)}     color="gold"   delta={k.facturacion_mes_actual} deltaAnterior={k.facturacion_mes_anterior} />
        <KpiCard icon={Clock}        label="Pendiente cobro"    value={eur(k.pendiente_cobro)}            color="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={FileText}     label="Presupuestos enviados" value={k.presupuestos_pendientes ?? '—'} sub="Sin respuesta"  color="blue" />
        <KpiCard icon={CheckCircle2} label="Tasa conversión"       value={pct(k.tasa_conversion_pct)}       sub={`${k.presupuestos_aceptados ?? 0} aceptados`} color="emerald" />
        <KpiCard icon={TrendingUp}   label="Total cobrado"         value={eur(k.total_cobrado)}             color="emerald" />
        <KpiCard icon={Target}       label="Mes anterior"          value={eur(k.facturacion_mes_anterior)}  color="purple" />
      </div>

      {/* Gráfico + proyectos */}
      <div className="grid lg:grid-cols-3 gap-5">

        <Card className="lg:col-span-1">
          <Card.Header>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-navy/40" />
              <h2 className="font-display font-semibold text-navy text-sm">Facturación mensual</h2>
            </div>
          </Card.Header>
          <Card.Body className="space-y-3">
            {meses.length === 0 ? <EmptyState text="Sin datos aún" /> : meses.map(m => (
              <div key={m.mes}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-navy/50 capitalize">{m.mes}</span>
                  <span className="font-mono font-medium text-navy">{eur(m.total)}</span>
                </div>
                <ProgressBar value={m.total} max={maxMes} />
              </div>
            ))}
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban size={14} className="text-navy/40" />
              <h2 className="font-display font-semibold text-navy text-sm">Proyectos activos</h2>
            </div>
            <Link to="/dashboard/proyectos" className="text-xs text-gold hover:text-gold-dark">Ver todos →</Link>
          </Card.Header>
          <div className="divide-y divide-surface-100">
            {proyectos.length === 0
              ? <div className="px-5 py-6"><EmptyState text="No hay proyectos activos" /></div>
              : proyectos.map(p => {
                const cobrado  = Number(p.importe_cobrado || 0)
                const acordado = Number(p.importe_acordado || 0)
                const est = ESTADO_PROYECTO[p.estado] || { label: p.estado, cls: 'bg-surface-100 text-navy/50' }
                return (
                  <div key={p.id} className="px-4 md:px-5 py-3 flex items-center gap-3 hover:bg-surface-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-navy text-sm truncate">{p.nombre}</p>
                        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${est.cls}`}>{est.label}</span>
                      </div>
                      <p className="text-xs text-navy/40 truncate">{p.clientes?.empresa || p.clientes?.nombre || '—'}</p>
                      {acordado > 0 && (
                        <div className="mt-1.5">
                          <ProgressBar value={cobrado} max={acordado} />
                          <p className="text-[10px] text-navy/30 mt-0.5">{eur(cobrado)} de {eur(acordado)}</p>
                        </div>
                      )}
                    </div>
                    {p.fecha_entrega_estimada && (
                      <div className="shrink-0 text-right hidden sm:block">
                        <p className="text-[10px] text-navy/30">Entrega</p>
                        <p className="text-xs font-mono text-navy/60">
                          {new Date(p.fecha_entrega_estimada).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-navy/40" />
            <h2 className="font-display font-semibold text-navy text-sm">Actividad reciente</h2>
          </div>
          <Link to="/dashboard/clientes" className="text-xs text-gold hover:text-gold-dark">Ver clientes →</Link>
        </Card.Header>
        <div className="divide-y divide-surface-100">
          {actividad.length === 0
            ? <div className="px-5 py-6"><EmptyState text="Sin actividad registrada" /></div>
            : actividad.map(a => {
              const iconos = { llamada:'📞', email:'✉️', reunion:'🤝', whatsapp:'💬', nota:'📝', otro:'•' }
              return (
                <div key={a.id} className="px-4 md:px-5 py-3 flex items-start gap-3">
                  <span className="text-base mt-0.5 shrink-0">{iconos[a.tipo] || '•'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy font-medium truncate">{a.titulo}</p>
                    <p className="text-xs text-navy/40">
                      {a.clientes?.nombre} · {new Date(a.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
        </div>
      </Card>
    </div>
  )
}
