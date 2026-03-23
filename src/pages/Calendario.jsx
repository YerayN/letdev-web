import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Calendar,
  AlertTriangle, Clock, Euro, FileText,
  FolderKanban, CheckCircle2, Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'

// ── Helpers ────────────────────────────────────────────────────────────
const eur     = (n) => Number(n||0).toLocaleString('es-ES', { style:'currency', currency:'EUR' })
const hoy     = new Date(); hoy.setHours(0,0,0,0)
const MESES   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS    = ['L','M','X','J','V','S','D']

// Normaliza una fecha a medianoche local
const toDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
const sameDay = (a, b) => a.toDateString() === b.toDateString()
const fmt = (d) => toDay(d).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })

// ── Tipos de evento con colores ────────────────────────────────────────
const TIPOS_EVENTO = {
  entrega:     { label:'Entrega',          color:'bg-gold',        text:'text-gold-dark',       border:'border-gold/30'         },
  pago:        { label:'Cobro esperado',   color:'bg-emerald-400', text:'text-emerald-700',     border:'border-emerald-200'     },
  presupuesto: { label:'Presupuesto',      color:'bg-blue-400',    text:'text-blue-700',        border:'border-blue-200'        },
  vencimiento: { label:'Vence hoy',        color:'bg-red-400',     text:'text-red-600',         border:'border-red-200'         },
}

function EventoDot({ tipo }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${TIPOS_EVENTO[tipo]?.color || 'bg-navy/20'}`} />
}

// ── Construye el grid del mes ──────────────────────────────────────────
function buildCalendar(year, month) {
  const first   = new Date(year, month, 1)
  const last    = new Date(year, month + 1, 0)
  // Lunes = 0, ajustamos para que semana empiece en lunes
  const startDow = (first.getDay() + 6) % 7
  const days = []
  // Días del mes anterior para rellenar
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i); days.push({ date: d, current: false })
  }
  // Días del mes
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true })
  }
  // Días del mes siguiente para completar la última fila
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), current: false })
    }
  }
  return days
}

// ── Componente principal ───────────────────────────────────────────────
export default function Calendario() {
  const [year,    setYear]    = useState(hoy.getFullYear())
  const [month,   setMonth]   = useState(hoy.getMonth())
  const [eventos, setEventos] = useState([])
  const [alertas, setAlertas] = useState({ cobros:[], vencimientos:[], parados:[] })
  const [loading, setLoading] = useState(true)
  const [diaSelec, setDiaSelec] = useState(null)

  useEffect(() => {
    async function cargar() {
      const [{ data: proyectos }, { data: presupuestos }, { data: clientes }] = await Promise.all([
        supabase.from('proyectos').select('id,nombre,estado,fecha_entrega_estimada,fecha_entrega_real,importe_acordado,importe_cobrado,fecha_cobro,cliente_id'),
        supabase.from('presupuestos').select('id,numero,titulo,estado,fecha_validez,fecha_emision,total,cliente_id'),
        supabase.from('clientes').select('id,nombre,empresa'),
      ])

      const cMap = Object.fromEntries((clientes||[]).map(c => [c.id, c]))
      const evs  = []

      // Eventos de proyectos
      ;(proyectos||[]).forEach(p => {
        const cliente = cMap[p.cliente_id]?.empresa || cMap[p.cliente_id]?.nombre || ''
        // Fecha de entrega estimada
        if (p.fecha_entrega_estimada && !['cancelado'].includes(p.estado)) {
          evs.push({
            id:      `ent-${p.id}`,
            fecha:   toDay(p.fecha_entrega_estimada),
            tipo:    'entrega',
            titulo:  p.nombre,
            sub:     cliente,
            link:    '/dashboard/proyectos',
            importe: null,
          })
        }
        // Cobro esperado
        if (p.fecha_cobro && p.importe_acordado && Number(p.importe_cobrado||0) < Number(p.importe_acordado)) {
          evs.push({
            id:      `pago-${p.id}`,
            fecha:   toDay(p.fecha_cobro),
            tipo:    'pago',
            titulo:  `Cobro — ${p.nombre}`,
            sub:     cliente,
            link:    '/dashboard/proyectos',
            importe: Number(p.importe_acordado) - Number(p.importe_cobrado||0),
          })
        }
      })

      // Vencimientos de presupuestos
      ;(presupuestos||[]).forEach(p => {
        if (p.fecha_validez && ['enviado','visto'].includes(p.estado)) {
          const cliente = cMap[p.cliente_id]?.empresa || cMap[p.cliente_id]?.nombre || ''
          evs.push({
            id:      `pres-${p.id}`,
            fecha:   toDay(p.fecha_validez),
            tipo:    'presupuesto',
            titulo:  `Vence — ${p.numero}`,
            sub:     `${p.titulo} · ${cliente}`,
            link:    `/dashboard/presupuestos/${p.id}/editar`,
            importe: Number(p.total||0),
          })
        }
      })

      setEventos(evs)

      // ── Alertas ──────────────────────────────────────────────────
      const cobros = (proyectos||[]).filter(p =>
        p.importe_acordado &&
        Number(p.importe_cobrado||0) < Number(p.importe_acordado) &&
        !['cancelado','presupuestado'].includes(p.estado)
      ).map(p => ({
        ...p,
        cliente:   cMap[p.cliente_id]?.empresa || cMap[p.cliente_id]?.nombre || '—',
        pendiente: Number(p.importe_acordado) - Number(p.importe_cobrado||0),
      })).sort((a,b) => b.pendiente - a.pendiente)

      const vencimientos = (presupuestos||[]).filter(p => {
        if (!p.fecha_validez || !['enviado','visto'].includes(p.estado)) return false
        const dias = Math.ceil((toDay(p.fecha_validez) - hoy) / 86400000)
        return dias <= 7
      }).map(p => ({
        ...p,
        cliente: cMap[p.cliente_id]?.empresa || cMap[p.cliente_id]?.nombre || '—',
        dias:    Math.ceil((toDay(p.fecha_validez) - hoy) / 86400000),
      })).sort((a,b) => a.dias - b.dias)

      // Proyectos activos sin fecha de entrega o con entrega pasada sin entregar
      const parados = (proyectos||[]).filter(p => {
        if (!['en_curso','pausado'].includes(p.estado)) return false
        if (!p.fecha_entrega_estimada) return true
        return toDay(p.fecha_entrega_estimada) < hoy && p.estado !== 'entregado'
      }).map(p => ({
        ...p,
        cliente: cMap[p.cliente_id]?.empresa || cMap[p.cliente_id]?.nombre || '—',
        retraso: p.fecha_entrega_estimada
          ? Math.ceil((hoy - toDay(p.fecha_entrega_estimada)) / 86400000)
          : null,
      }))

      setAlertas({ cobros, vencimientos, parados })
      setLoading(false)
    }
    cargar()
  }, [])

  // Navegar meses
  const mesAnterior = () => {
    if (month === 0) { setYear(y => y-1); setMonth(11) }
    else setMonth(m => m-1)
    setDiaSelec(null)
  }
  const mesSiguiente = () => {
    if (month === 11) { setYear(y => y+1); setMonth(0) }
    else setMonth(m => m+1)
    setDiaSelec(null)
  }

  const days = buildCalendar(year, month)

  // Eventos del día seleccionado
  const eventosDia = diaSelec
    ? eventos.filter(e => sameDay(e.fecha, diaSelec))
    : []

  // Eventos de hoy para badge del topbar
  const eventosHoy = eventos.filter(e => sameDay(e.fecha, hoy))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-navy/20" />
    </div>
  )

  const totalAlertas = alertas.cobros.length + alertas.vencimientos.length + alertas.parados.length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">Calendario</h1>
          <p className="text-navy/40 text-sm mt-0.5">
            {eventosHoy.length > 0
              ? `${eventosHoy.length} evento${eventosHoy.length>1?'s':''} hoy`
              : 'Sin eventos hoy'}
            {totalAlertas > 0 && ` · ${totalAlertas} alerta${totalAlertas>1?'s':''} pendientes`}
          </p>
        </div>
        {/* Leyenda */}
        <div className="hidden sm:flex items-center gap-3 flex-wrap">
          {Object.entries(TIPOS_EVENTO).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${v.color}`} />
              <span className="text-xs text-navy/40">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── CALENDARIO ─────────────────────────────────────────────── */}
        <Card>
          {/* Navegación */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <button onClick={mesAnterior} className="p-1.5 rounded-lg hover:bg-surface-100 text-navy/40 hover:text-navy transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-display font-bold text-navy text-base tracking-tight">
              {MESES[month]} {year}
            </h2>
            <button onClick={mesSiguiente} className="p-1.5 rounded-lg hover:bg-surface-100 text-navy/40 hover:text-navy transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Grid */}
          <div className="p-3 md:p-4">
            {/* Cabecera días */}
            <div className="grid grid-cols-7 mb-1">
              {DIAS.map(d => (
                <div key={d} className="text-center text-[10px] font-mono uppercase tracking-widest text-navy/30 py-1">{d}</div>
              ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map(({ date, current }, i) => {
                const esHoy      = sameDay(date, hoy)
                const esSelec    = diaSelec && sameDay(date, diaSelec)
                const evsDia     = eventos.filter(e => sameDay(e.fecha, date))
                const tieneEvs   = evsDia.length > 0

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!current) return
                      setDiaSelec(esSelec ? null : date)
                    }}
                    className={`
                      relative flex flex-col items-center py-1.5 rounded-xl transition-all
                      ${!current ? 'opacity-20 cursor-default' : 'cursor-pointer hover:bg-surface-50'}
                      ${esSelec  ? 'bg-navy hover:bg-navy' : ''}
                      ${esHoy && !esSelec ? 'ring-2 ring-gold ring-offset-1' : ''}
                    `}
                  >
                    <span className={`text-xs font-medium leading-none mb-1 ${
                      esSelec ? 'text-gold' : esHoy ? 'text-navy font-bold' : current ? 'text-navy' : 'text-navy/30'
                    }`}>
                      {date.getDate()}
                    </span>
                    {/* Puntos de eventos */}
                    {tieneEvs && (
                      <div className="flex gap-0.5 flex-wrap justify-center max-w-[28px]">
                        {evsDia.slice(0,3).map((e, j) => (
                          <EventoDot key={j} tipo={e.tipo} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Leyenda móvil */}
          <div className="sm:hidden flex flex-wrap gap-3 px-4 pb-4">
            {Object.entries(TIPOS_EVENTO).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${v.color}`} />
                <span className="text-xs text-navy/40">{v.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── PANEL LATERAL ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Eventos del día seleccionado */}
          {diaSelec ? (
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-navy/40" />
                  <h3 className="font-display font-semibold text-navy text-sm">{fmt(diaSelec)}</h3>
                </div>
              </Card.Header>
              <Card.Body className="space-y-2 p-3">
                {eventosDia.length === 0 ? (
                  <p className="text-xs text-navy/30 text-center py-3">Sin eventos este día</p>
                ) : (
                  eventosDia.map(ev => {
                    const t = TIPOS_EVENTO[ev.tipo]
                    return (
                      <Link key={ev.id} to={ev.link}
                        className={`block p-3 rounded-xl border ${t.border} bg-white hover:shadow-sm transition-all`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${t.color} shrink-0`} />
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.text}`}>{t.label}</span>
                        </div>
                        <p className="font-medium text-navy text-sm leading-snug">{ev.titulo}</p>
                        {ev.sub && <p className="text-xs text-navy/40 truncate mt-0.5">{ev.sub}</p>}
                        {ev.importe > 0 && (
                          <p className="text-xs font-mono font-semibold text-emerald-600 mt-1">{eur(ev.importe)}</p>
                        )}
                      </Link>
                    )
                  })
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="py-8 text-center">
                <Calendar size={24} className="text-navy/15 mx-auto mb-2" />
                <p className="text-xs text-navy/30">Selecciona un día para ver sus eventos</p>
              </Card.Body>
            </Card>
          )}

          {/* Próximos eventos — 5 más cercanos */}
          {(() => {
            const proximos = eventos
              .filter(e => e.fecha >= hoy)
              .sort((a,b) => a.fecha - b.fecha)
              .slice(0, 5)
            if (proximos.length === 0) return null
            return (
              <Card>
                <Card.Header>
                  <h3 className="font-display font-semibold text-navy text-sm">Próximos eventos</h3>
                </Card.Header>
                <div className="divide-y divide-surface-100">
                  {proximos.map(ev => {
                    const t    = TIPOS_EVENTO[ev.tipo]
                    const dias = Math.ceil((ev.fecha - hoy) / 86400000)
                    return (
                      <Link key={ev.id} to={ev.link}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${t.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{ev.titulo}</p>
                          <p className="text-xs text-navy/40">{ev.sub}</p>
                        </div>
                        <span className={`text-[11px] font-mono font-semibold shrink-0 ${
                          dias === 0 ? 'text-red-400' : dias <= 3 ? 'text-orange-400' : 'text-navy/30'
                        }`}>
                          {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias}d`}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </Card>
            )
          })()}
        </div>
      </div>

      {/* ── ALERTAS ────────────────────────────────────────────────────── */}
      {totalAlertas > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-orange-400" />
            <h2 className="font-display font-semibold text-navy text-sm">
              Alertas <span className="text-navy/30 font-normal">({totalAlertas})</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {/* Cobros pendientes */}
            {alertas.cobros.length > 0 && (
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <Euro size={14} className="text-emerald-500" />
                    <h3 className="font-display font-semibold text-navy text-sm">
                      Cobros pendientes <span className="text-navy/30">({alertas.cobros.length})</span>
                    </h3>
                  </div>
                </Card.Header>
                <div className="divide-y divide-surface-100">
                  {alertas.cobros.slice(0,5).map(p => (
                    <Link key={p.id} to="/dashboard/proyectos"
                      className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{p.nombre}</p>
                        <p className="text-xs text-navy/40 truncate">{p.cliente}</p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-emerald-600 shrink-0">
                        {eur(p.pendiente)}
                      </span>
                    </Link>
                  ))}
                </div>
                {alertas.cobros.length > 5 && (
                  <div className="px-4 py-2 border-t border-surface-100">
                    <p className="text-xs text-navy/30 text-center">+{alertas.cobros.length-5} más</p>
                  </div>
                )}
              </Card>
            )}

            {/* Presupuestos por vencer */}
            {alertas.vencimientos.length > 0 && (
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" />
                    <h3 className="font-display font-semibold text-navy text-sm">
                      Presupuestos por vencer <span className="text-navy/30">({alertas.vencimientos.length})</span>
                    </h3>
                  </div>
                </Card.Header>
                <div className="divide-y divide-surface-100">
                  {alertas.vencimientos.map(p => (
                    <Link key={p.id} to={`/dashboard/presupuestos/${p.id}/editar`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{p.titulo}</p>
                        <p className="text-xs text-navy/40 truncate">{p.cliente}</p>
                      </div>
                      <span className={`text-[11px] font-mono font-semibold shrink-0 px-2 py-0.5 rounded-full ${
                        p.dias <= 0 ? 'bg-red-50 text-red-400' :
                        p.dias <= 3 ? 'bg-orange-50 text-orange-400' :
                        'bg-blue-50 text-blue-400'
                      }`}>
                        {p.dias <= 0 ? 'Vencido' : p.dias === 1 ? 'Mañana' : `${p.dias}d`}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Proyectos con retraso o parados */}
            {alertas.parados.length > 0 && (
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <FolderKanban size={14} className="text-orange-400" />
                    <h3 className="font-display font-semibold text-navy text-sm">
                      Proyectos con retraso <span className="text-navy/30">({alertas.parados.length})</span>
                    </h3>
                  </div>
                </Card.Header>
                <div className="divide-y divide-surface-100">
                  {alertas.parados.map(p => (
                    <Link key={p.id} to="/dashboard/proyectos"
                      className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{p.nombre}</p>
                        <p className="text-xs text-navy/40 truncate">{p.cliente}</p>
                      </div>
                      <span className={`text-[11px] font-mono font-semibold shrink-0 px-2 py-0.5 rounded-full ${
                        p.retraso ? 'bg-red-50 text-red-400' : 'bg-orange-50 text-orange-400'
                      }`}>
                        {p.retraso ? `+${p.retraso}d` : 'Sin fecha'}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Sin alertas */}
      {totalAlertas === 0 && !loading && (
        <Card>
          <Card.Body className="py-8 text-center">
            <CheckCircle2 size={28} className="text-emerald-300 mx-auto mb-3" />
            <p className="font-medium text-navy/40 text-sm">Todo al día</p>
            <p className="text-xs text-navy/25 mt-1">Sin cobros pendientes ni presupuestos por vencer</p>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
