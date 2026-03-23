import { useState, useEffect } from 'react'
import {
  Plus, X, Save, ArrowLeft, Loader2,
  Calendar, Euro, Clock, ExternalLink, Github,
  ChevronRight, Layers
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// ── Constantes ─────────────────────────────────────────────────────────
const ESTADOS_KANBAN = [
  { key: 'presupuestado', label: 'Presupuestado', color: 'border-blue-200 bg-blue-50',    dot: 'bg-blue-400'    },
  { key: 'en_curso',      label: 'En curso',      color: 'border-gold/30 bg-gold/5',      dot: 'bg-gold'        },
  { key: 'pausado',       label: 'Pausado',       color: 'border-orange-200 bg-orange-50', dot: 'bg-orange-400' },
]

const TODOS_ESTADOS = [
  { key: 'presupuestado', label: 'Presupuestado', cls: 'bg-blue-50 text-blue-500'         },
  { key: 'en_curso',      label: 'En curso',      cls: 'bg-gold/10 text-gold-dark'         },
  { key: 'pausado',       label: 'Pausado',       cls: 'bg-orange-50 text-orange-500'      },
  { key: 'entregado',     label: 'Entregado',     cls: 'bg-emerald-50 text-emerald-600'    },
  { key: 'cancelado',     label: 'Cancelado',     cls: 'bg-red-50 text-red-400'            },
  { key: 'mantenimiento', label: 'Mantenimiento', cls: 'bg-purple-50 text-purple-500'      },
]

const TIPOS = ['Web','App móvil','Backend','Automatización','Consultoría','E-commerce','Landing','Otro']

const PROYECTO_VACIO = {
  nombre: '', descripcion: '', tipo: '', tecnologias: '',
  cliente_id: '', estado: 'presupuestado', prioridad: 2,
  fecha_inicio: '', fecha_entrega_estimada: '', fecha_entrega_real: '',
  importe_acordado: '', importe_cobrado: '', forma_pago: '',
  horas_estimadas: '', horas_reales: '',
  url_entregado: '', repo_url: '', notas: '',
}

const eur   = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day:'numeric', month:'short' }) : '—'

// ── Badge de estado ────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const e = TODOS_ESTADOS.find(s => s.key === estado) || { label: estado, cls: 'bg-surface-100 text-navy/50' }
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${e.cls}`}>{e.label}</span>
}

// ── Barra de progreso cobro ────────────────────────────────────────────
function BarraCobro({ acordado, cobrado }) {
  if (!acordado || acordado === 0) return null
  const pct = Math.min((cobrado / acordado) * 100, 100)
  return (
    <div>
      <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
        <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-navy/30 mt-0.5">{eur(cobrado)} de {eur(acordado)}</p>
    </div>
  )
}

// ── Card del kanban ────────────────────────────────────────────────────
function KanbanCard({ proyecto, onClick }) {
  const diasRestantes = proyecto.fecha_entrega_estimada
    ? Math.ceil((new Date(proyecto.fecha_entrega_estimada) - new Date()) / 86400000)
    : null

  return (
    <div onClick={onClick}
      className="bg-white rounded-xl border border-surface-200 p-3.5 hover:border-gold/30 hover:shadow-card cursor-pointer transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-navy text-sm leading-snug group-hover:text-navy">{proyecto.nombre}</p>
        <ChevronRight size={13} className="text-navy/20 shrink-0 mt-0.5 group-hover:text-gold transition-colors" />
      </div>

      {proyecto.clientes && (
        <p className="text-xs text-navy/40 mb-2 truncate">
          {proyecto.clientes.empresa || proyecto.clientes.nombre}
        </p>
      )}

      {proyecto.tipo && (
        <span className="inline-block text-[10px] px-2 py-0.5 bg-surface-100 text-navy/40 rounded-md font-mono mb-2">
          {proyecto.tipo}
        </span>
      )}

      <BarraCobro acordado={Number(proyecto.importe_acordado)} cobrado={Number(proyecto.importe_cobrado)} />

      {diasRestantes !== null && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] font-medium ${
          diasRestantes < 0 ? 'text-red-400' : diasRestantes <= 7 ? 'text-orange-400' : 'text-navy/30'
        }`}>
          <Calendar size={11} />
          {diasRestantes < 0
            ? `${Math.abs(diasRestantes)}d de retraso`
            : diasRestantes === 0 ? 'Entrega hoy'
            : `${diasRestantes}d restantes`}
        </div>
      )}
    </div>
  )
}

// ── Campo helper — DEBE estar fuera de ModalProyecto para no recrearse ─
function Campo({ label, full = false, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="lbl">{label}</label>
      {children}
    </div>
  )
}

// ── Modal crear/editar proyecto ────────────────────────────────────────
function ModalProyecto({ proyecto, clientes, onClose, onGuardado }) {
  const editando = !!proyecto?.id
  const [form,    setForm]    = useState(proyecto
    ? { ...proyecto, tecnologias: (proyecto.tecnologias || []).join(', ') }
    : PROYECTO_VACIO)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('basico')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!form.cliente_id)    { setError('Selecciona un cliente.'); return }
    setLoading(true); setError(null)

    const payload = {
      ...form,
      tecnologias:    form.tecnologias ? form.tecnologias.split(',').map(t => t.trim()).filter(Boolean) : [],
      prioridad:      Number(form.prioridad),
      importe_acordado: form.importe_acordado ? Number(form.importe_acordado) : null,
      importe_cobrado:  form.importe_cobrado  ? Number(form.importe_cobrado)  : null,
      horas_estimadas:  form.horas_estimadas  ? Number(form.horas_estimadas)  : null,
      horas_reales:     form.horas_reales     ? Number(form.horas_reales)     : null,
    }
    // Eliminamos campos que no existen en la tabla (añadidos en frontend para el join)
    delete payload.clientes
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })

    const { error: err } = editando
      ? await supabase.from('proyectos').update(payload).eq('id', proyecto.id)
      : await supabase.from('proyectos').insert(payload)

    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); onGuardado()
  }

  const TABS = [
    { key:'basico',    label:'Básico'   },
    { key:'economico', label:'Económico' },
    { key:'fechas',    label:'Fechas'   },
    { key:'notas',     label:'Notas'    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(15,30,50,0.55)' }}>
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-up">

        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display font-bold text-navy text-base">
            {editando ? `Editar — ${proyecto.nombre}` : 'Nuevo proyecto'}
          </h2>
          <button onClick={onClose} className="text-navy/30 hover:text-navy p-1"><X size={18} /></button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-surface-100 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap -mb-px border-b-2 transition-colors ${
                tab === key ? 'text-navy border-gold' : 'text-navy/40 border-transparent hover:text-navy'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5">
          {tab === 'basico' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nombre *" full>
                <input className="input-field" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del proyecto" />
              </Campo>
              <Campo label="Cliente *">
                <select className="input-field" value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)}>
                  <option value="">Selecciona cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.empresa ? `${c.empresa} — ${c.nombre}` : c.nombre}</option>)}
                </select>
              </Campo>
              <Campo label="Tipo">
                <select className="input-field" value={form.tipo||''} onChange={e => set('tipo', e.target.value)}>
                  <option value="">Sin tipo</option>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Campo>
              <Campo label="Estado">
                <select className="input-field" value={form.estado} onChange={e => set('estado', e.target.value)}>
                  {TODOS_ESTADOS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Campo>
              <Campo label="Prioridad">
                <div className="flex gap-2">
                  {[{v:1,l:'Alta'},{v:2,l:'Media'},{v:3,l:'Baja'}].map(p => (
                    <button key={p.v} onClick={() => set('prioridad', p.v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        Number(form.prioridad)===p.v ? 'bg-navy text-gold border-navy' : 'border-surface-200 text-navy/50 hover:border-navy/20'
                      }`}>{p.l}</button>
                  ))}
                </div>
              </Campo>
              <Campo label="Tecnologías (separadas por coma)">
                <input className="input-field" value={form.tecnologias||''} onChange={e => set('tecnologias', e.target.value)} placeholder="React, Supabase, n8n" />
              </Campo>
              <Campo label="URL en producción">
                <input className="input-field" value={form.url_entregado||''} onChange={e => set('url_entregado', e.target.value)} placeholder="https://..." />
              </Campo>
              <Campo label="Repositorio">
                <input className="input-field" value={form.repo_url||''} onChange={e => set('repo_url', e.target.value)} placeholder="https://github.com/..." />
              </Campo>
              <Campo label="Descripción" full>
                <textarea rows={3} className="input-field resize-none" value={form.descripcion||''} onChange={e => set('descripcion', e.target.value)} placeholder="Describe el proyecto brevemente..." />
              </Campo>
            </div>
          )}

          {tab === 'economico' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Importe acordado (€)">
                <input type="number" className="input-field" value={form.importe_acordado||''} onChange={e => set('importe_acordado', e.target.value)} placeholder="0.00" />
              </Campo>
              <Campo label="Importe cobrado (€)">
                <input type="number" className="input-field" value={form.importe_cobrado||''} onChange={e => set('importe_cobrado', e.target.value)} placeholder="0.00" />
              </Campo>
              <Campo label="Forma de pago">
                <input className="input-field" value={form.forma_pago||''} onChange={e => set('forma_pago', e.target.value)} placeholder="Contado, 50/50, mensual..." />
              </Campo>
              <Campo label="Horas estimadas">
                <input type="number" className="input-field" value={form.horas_estimadas||''} onChange={e => set('horas_estimadas', e.target.value)} placeholder="0" />
              </Campo>
              <Campo label="Horas reales">
                <input type="number" className="input-field" value={form.horas_reales||''} onChange={e => set('horas_reales', e.target.value)} placeholder="0" />
              </Campo>
              {/* Resumen económico */}
              {form.importe_acordado && form.importe_cobrado && (
                <div className="sm:col-span-2 bg-surface-50 rounded-xl p-4 border border-surface-200">
                  <p className="text-xs font-mono uppercase tracking-widest text-navy/40 mb-3">Resumen</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-navy/50">Acordado</span>
                      <span className="font-semibold text-navy">{eur(form.importe_acordado)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-navy/50">Cobrado</span>
                      <span className="font-semibold text-emerald-600">{eur(form.importe_cobrado)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-surface-200 pt-2">
                      <span className="text-navy/50">Pendiente</span>
                      <span className="font-semibold text-red-400">{eur(Number(form.importe_acordado) - Number(form.importe_cobrado))}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all"
                        style={{ width: `${Math.min((Number(form.importe_cobrado)/Number(form.importe_acordado))*100,100)}%` }} />
                    </div>
                    <p className="text-[11px] text-navy/30 mt-1">
                      {Math.round((Number(form.importe_cobrado)/Number(form.importe_acordado))*100)}% cobrado
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'fechas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Fecha de inicio">
                <input type="date" className="input-field" value={form.fecha_inicio||''} onChange={e => set('fecha_inicio', e.target.value)} />
              </Campo>
              <Campo label="Entrega estimada">
                <input type="date" className="input-field" value={form.fecha_entrega_estimada||''} onChange={e => set('fecha_entrega_estimada', e.target.value)} />
              </Campo>
              <Campo label="Entrega real">
                <input type="date" className="input-field" value={form.fecha_entrega_real||''} onChange={e => set('fecha_entrega_real', e.target.value)} />
              </Campo>
            </div>
          )}

          {tab === 'notas' && (
            <div>
              <label className="lbl">Notas internas</label>
              <textarea rows={10} className="input-field resize-none" value={form.notas||''} onChange={e => set('notas', e.target.value)}
                placeholder="Detalles técnicos, acuerdos, historial de cambios..." />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-surface-100 flex items-center justify-between gap-3">
          {error ? <p className="text-xs text-red-500 flex-1">{error}</p> : <span className="flex-1" />}
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" loading={loading} onClick={guardar}>
              {editando ? 'Guardar' : 'Crear proyecto'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────
export default function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [clientes,  setClientes]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null) // null | 'nuevo' | proyecto
  const [filtroHistorial, setFiltroHistorial] = useState('todos')

  const cargar = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('proyectos').select('*').order('created_at', { ascending: false }),
      supabase.from('clientes').select('id,nombre,empresa').order('nombre'),
    ])
    // Cruzamos los datos en el frontend para no depender del schema cache de Supabase
    const clientesMap = Object.fromEntries((c || []).map(cl => [cl.id, cl]))
    const proyectosConCliente = (p || []).map(pr => ({
      ...pr,
      clientes: clientesMap[pr.cliente_id] || null,
    }))
    setProyectos(proyectosConCliente)
    setClientes(c || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  // Separamos activos (kanban) de historial (tabla)
  const activos    = proyectos.filter(p => ['presupuestado','en_curso','pausado'].includes(p.estado))
  const historial  = proyectos.filter(p => ['entregado','cancelado','mantenimiento'].includes(p.estado))
  const histFiltrado = filtroHistorial === 'todos' ? historial : historial.filter(p => p.estado === filtroHistorial)

  // KPIs rápidos
  const totalAcordado  = activos.reduce((s, p) => s + Number(p.importe_acordado || 0), 0)
  const totalCobrado   = activos.reduce((s, p) => s + Number(p.importe_cobrado  || 0), 0)
  const totalPendiente = totalAcordado - totalCobrado

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-navy/20" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">Proyectos</h1>
          <p className="text-navy/40 text-sm mt-0.5">{proyectos.length} en total · {activos.length} activos</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('nuevo')}>
          <span className="hidden sm:inline">Nuevo proyecto</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {/* KPIs rápidos */}
      {activos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Acordado (activos)',  value: eur(totalAcordado),  color: 'text-navy'          },
            { label: 'Cobrado',             value: eur(totalCobrado),   color: 'text-emerald-600'   },
            { label: 'Pendiente de cobro',  value: eur(totalPendiente), color: 'text-orange-500'    },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <Card.Body className="p-3 md:p-4">
                <p className={`font-display font-bold text-base md:text-xl ${color} tracking-tight`}>{value}</p>
                <p className="text-[11px] text-navy/40 mt-0.5">{label}</p>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* ── KANBAN ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={15} className="text-navy/40" />
          <h2 className="font-display font-semibold text-navy text-sm">En marcha</h2>
          <span className="text-xs text-navy/30">({activos.length})</span>
        </div>

        {activos.length === 0 ? (
          <Card>
            <Card.Body className="py-10 text-center">
              <Layers size={28} className="text-navy/10 mx-auto mb-3" />
              <p className="text-navy/30 text-sm mb-4">No hay proyectos activos aún</p>
              <Button size="sm" icon={Plus} onClick={() => setModal('nuevo')}>Crear primer proyecto</Button>
            </Card.Body>
          </Card>
        ) : (
          /* Kanban: scroll horizontal en móvil, 3 columnas en desktop */
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3">
            {ESTADOS_KANBAN.map(({ key, label, color, dot }) => {
              const cols = activos.filter(p => p.estado === key)
              return (
                <div key={key} className={`flex-shrink-0 w-72 md:w-auto rounded-2xl border p-3 ${color}`}>
                  {/* Cabecera columna */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="text-xs font-semibold text-navy/60 uppercase tracking-wider">{label}</span>
                    <span className="ml-auto text-xs text-navy/30 font-mono">{cols.length}</span>
                  </div>
                  {/* Cards */}
                  <div className="space-y-2.5">
                    {cols.length === 0 ? (
                      <div className="text-center py-6 text-xs text-navy/25">Sin proyectos</div>
                    ) : (
                      cols.map(p => (
                        <KanbanCard key={p.id} proyecto={p} onClick={() => setModal(p)} />
                      ))
                    )}
                  </div>
                  {/* Botón añadir en columna */}
                  <button onClick={() => setModal({ ...PROYECTO_VACIO, estado: key, cliente_id: '' })}
                    className="mt-2.5 w-full text-xs text-navy/30 hover:text-navy hover:bg-white/60 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Plus size={12} /> Añadir
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── HISTORIAL / TABLA ──────────────────────────────────────── */}
      {historial.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display font-semibold text-navy text-sm">Historial</h2>
            <span className="text-xs text-navy/30">({historial.length})</span>
          </div>

          <Card>
            {/* Filtros */}
            <Card.Header className="flex flex-wrap gap-1.5">
              {[
                { key:'todos',         label:'Todos'         },
                { key:'entregado',     label:'Entregados'    },
                { key:'mantenimiento', label:'Mantenimiento' },
                { key:'cancelado',     label:'Cancelados'    },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setFiltroHistorial(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filtroHistorial === key ? 'bg-navy text-gold' : 'text-navy/50 hover:bg-surface-100'
                  }`}>
                  {label}
                </button>
              ))}
            </Card.Header>

            {/* Desktop: tabla */}
            <div className="hidden md:block divide-y divide-surface-100">
              <div className="grid grid-cols-12 gap-3 px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-navy/35 bg-surface-50">
                <span className="col-span-3">Proyecto</span>
                <span className="col-span-2">Cliente</span>
                <span className="col-span-2">Estado</span>
                <span className="col-span-2">Entrega</span>
                <span className="col-span-2 text-right">Importe</span>
                <span className="col-span-1 text-right">Links</span>
              </div>
              {histFiltrado.map(p => (
                <div key={p.id} onClick={() => setModal(p)}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors cursor-pointer">
                  <div className="col-span-3">
                    <p className="font-medium text-navy text-sm truncate">{p.nombre}</p>
                    {p.tipo && <p className="text-[11px] text-navy/35 font-mono">{p.tipo}</p>}
                  </div>
                  <span className="col-span-2 text-sm text-navy/50 truncate">
                    {p.clientes?.empresa || p.clientes?.nombre || '—'}
                  </span>
                  <span className="col-span-2"><EstadoBadge estado={p.estado} /></span>
                  <span className="col-span-2 text-sm text-navy/50">
                    {fmtDate(p.fecha_entrega_real || p.fecha_entrega_estimada)}
                  </span>
                  <span className="col-span-2 text-right font-mono text-sm text-navy font-semibold">
                    {p.importe_acordado ? eur(p.importe_acordado) : '—'}
                  </span>
                  <div className="col-span-1 flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                    {p.url_entregado && <a href={p.url_entregado} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-navy"><ExternalLink size={13} /></a>}
                    {p.repo_url      && <a href={p.repo_url}      target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-navy"><Github size={13} /></a>}
                  </div>
                </div>
              ))}
            </div>

            {/* Móvil: cards */}
            <div className="md:hidden divide-y divide-surface-100">
              {histFiltrado.map(p => (
                <div key={p.id} onClick={() => setModal(p)}
                  className="px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-surface-50 active:bg-surface-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-navy text-sm truncate">{p.nombre}</p>
                      <EstadoBadge estado={p.estado} />
                    </div>
                    <p className="text-xs text-navy/40">{p.clientes?.empresa || p.clientes?.nombre || '—'}</p>
                  </div>
                  {p.importe_acordado && (
                    <span className="font-mono text-sm font-semibold text-navy shrink-0">{eur(p.importe_acordado)}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ModalProyecto
          proyecto={modal === 'nuevo' ? null : modal}
          clientes={clientes}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargar() }}
        />
      )}
    </div>
  )
}
