import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Mail, Phone, X, Tag, User, MapPin, Euro, FileText, Loader2, ChevronRight, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const ESTADOS   = ['lead','activo','inactivo','vip','bloqueado']
const ORIGENES  = ['Web','Referido','Instagram','LinkedIn','Google','Evento','WhatsApp','Otro']
const SECTORES  = ['Hostelería','Salud','Retail','Tecnología','Educación','Inmobiliaria','Legal','Moda','Servicios','Otro']
const PRIORIDADES = [{ v:1, l:'Alta' },{ v:2, l:'Media' },{ v:3, l:'Baja' }]

const ESTADO_BADGE = {
  lead:     'bg-blue-50 text-blue-500',
  activo:   'bg-emerald-50 text-emerald-600',
  inactivo: 'bg-surface-100 text-navy/40',
  vip:      'bg-gold/10 text-gold-dark font-semibold',
  bloqueado:'bg-red-50 text-red-400',
}

const CLIENTE_VACIO = {
  nombre:'', email:'', empresa:'', sector:'', web:'',
  telefono:'', telefono_alt:'', ciudad:'', provincia:'',
  pais:'España', direccion:'', codigo_postal:'',
  estado:'lead', origen:'', prioridad:2,
  cargo:'', dni:'', condiciones_pago:'', notas:'', etiquetas:'',
}

// ── Subcomponentes del formulario ─────────────────────────────────────
function SeccionForm({ titulo, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-100">
        <Icon size={13} className="text-navy/30" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-navy/40">{titulo}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Campo({ label, full = false, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1">{label}</label>
      {children}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
function ModalCliente({ cliente, onClose, onGuardado }) {
  const editando = !!cliente?.id
  const [form,    setForm]    = useState(cliente ? { ...cliente, etiquetas: (cliente.etiquetas || []).join(', ') } : CLIENTE_VACIO)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('basico')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setLoading(true); setError(null)
    const payload = {
      ...form,
      etiquetas: form.etiquetas ? form.etiquetas.split(',').map(t => t.trim()).filter(Boolean) : [],
      prioridad: Number(form.prioridad),
    }
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
    const { error: err } = editando
      ? await supabase.from('clientes').update(payload).eq('id', cliente.id)
      : await supabase.from('clientes').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); onGuardado()
  }

  const TABS = [
    { key:'basico',   label:'Básico'   },
    { key:'contacto', label:'Contacto' },
    { key:'crm',      label:'CRM'      },
    { key:'notas',    label:'Notas'    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(15,30,50,0.55)' }}>
      {/* En móvil: bottom sheet. En desktop: modal centrado */}
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-up">

        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display font-bold text-navy text-base">
            {editando ? `Editar — ${cliente.nombre}` : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} className="text-navy/30 hover:text-navy p-1"><X size={18} /></button>
        </div>

        {/* Contenedor de las pestañas */}
          <div className="flex w-full px-5 pt-3 border-b border-surface-100">
            {TABS.map(({ key, label }) => (
              <button 
                key={key} 
                onClick={() => setTab(key)}
                /* Aquí hemos añadido flex-1 y text-center */
                className={`flex-1 text-center py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors -mb-px border-b-2 ${
                  tab === key ? 'text-navy border-gold' : 'text-navy/40 border-transparent hover:text-navy'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {tab === 'basico' && (
            <SeccionForm titulo="Identificación" icon={User}>
              <Campo label="Nombre *" full>
                <input className="input-field" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre completo" />
              </Campo>
              <Campo label="Empresa">
                <input className="input-field" value={form.empresa || ''} onChange={e => set('empresa', e.target.value)} placeholder="Empresa" />
              </Campo>
              <Campo label="Cargo">
                <input className="input-field" value={form.cargo || ''} onChange={e => set('cargo', e.target.value)} placeholder="CEO, Responsable IT..." />
              </Campo>
              <Campo label="Sector">
                <select className="input-field" value={form.sector || ''} onChange={e => set('sector', e.target.value)}>
                  <option value="">Sin sector</option>
                  {SECTORES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Campo>
              <Campo label="Web" full>
                <input className="input-field" value={form.web || ''} onChange={e => set('web', e.target.value)} placeholder="https://..." />
              </Campo>
            </SeccionForm>
          )}
          {tab === 'contacto' && (
            <>
              <SeccionForm titulo="Contacto" icon={Phone}>
                <Campo label="Email">
                  <input className="input-field" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
                </Campo>
                <Campo label="Teléfono">
                  <input className="input-field" value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="+34 600 000 000" />
                </Campo>
                <Campo label="Teléfono alternativo">
                  <input className="input-field" value={form.telefono_alt || ''} onChange={e => set('telefono_alt', e.target.value)} />
                </Campo>
              </SeccionForm>
              <SeccionForm titulo="Localización" icon={MapPin}>
                <Campo label="Ciudad">
                  <input className="input-field" value={form.ciudad || ''} onChange={e => set('ciudad', e.target.value)} placeholder="Alicante" />
                </Campo>
                <Campo label="Provincia">
                  <input className="input-field" value={form.provincia || ''} onChange={e => set('provincia', e.target.value)} />
                </Campo>
                <Campo label="CP">
                  <input className="input-field" value={form.codigo_postal || ''} onChange={e => set('codigo_postal', e.target.value)} />
                </Campo>
                <Campo label="País">
                  <input className="input-field" value={form.pais || ''} onChange={e => set('pais', e.target.value)} />
                </Campo>
                <Campo label="Dirección" full>
                  <input className="input-field" value={form.direccion || ''} onChange={e => set('direccion', e.target.value)} />
                </Campo>
              </SeccionForm>
              <SeccionForm titulo="Datos fiscales" icon={FileText}>
                <Campo label="DNI / CIF">
                  <input className="input-field" value={form.dni || ''} onChange={e => set('dni', e.target.value)} />
                </Campo>
              </SeccionForm>
            </>
          )}
          {tab === 'crm' && (
            <>
              <SeccionForm titulo="Estado y origen" icon={Tag}>
                <Campo label="Estado">
                  <select className="input-field" value={form.estado} onChange={e => set('estado', e.target.value)}>
                    {ESTADOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </Campo>
                <Campo label="Origen">
                  <select className="input-field" value={form.origen || ''} onChange={e => set('origen', e.target.value)}>
                    <option value="">Sin especificar</option>
                    {ORIGENES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Campo>
                <Campo label="Prioridad">
                  <select className="input-field" value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
                    {PRIORIDADES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                  </select>
                </Campo>
                <Campo label="Etiquetas (separadas por coma)">
                  <input className="input-field" value={form.etiquetas || ''} onChange={e => set('etiquetas', e.target.value)} placeholder="wordpress, recurrente" />
                </Campo>
              </SeccionForm>
              <SeccionForm titulo="Condiciones" icon={Euro}>
                <Campo label="Condiciones de pago" full>
                  <input className="input-field" value={form.condiciones_pago || ''} onChange={e => set('condiciones_pago', e.target.value)} placeholder="Contado, 30 días..." />
                </Campo>
                <Campo label="Fecha de nacimiento">
                  <input className="input-field" type="date" value={form.fecha_nacimiento || ''} onChange={e => set('fecha_nacimiento', e.target.value)} />
                </Campo>
              </SeccionForm>
            </>
          )}
          {tab === 'notas' && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-2">Notas internas</label>
              <textarea rows={8} className="input-field resize-none" value={form.notas || ''} onChange={e => set('notas', e.target.value)}
                placeholder="Todo lo que necesites recordar sobre este cliente..." />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-surface-100 flex items-center justify-between gap-3">
          {error ? <p className="text-xs text-red-500 flex-1">{error}</p> : <span className="flex-1" />}
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" loading={loading} onClick={guardar}>
              {editando ? 'Guardar' : 'Crear cliente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────
export default function Clientes() {
  const [clientes,     setClientes]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [busqueda,     setBusqueda]     = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modal,        setModal]        = useState(null)

  const cargar = async () => {
    const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    setClientes(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = clientes.filter(c => {
    const q = busqueda.toLowerCase()
    const ok = !busqueda || c.nombre?.toLowerCase().includes(q) || c.empresa?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    return ok && (filtroEstado === 'todos' || c.estado === filtroEstado)
  })

  // Función para abrir modal en modo edición
  const abrirEdicion = (e, cliente) => {
    e.stopPropagation()
    setModal(cliente)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">Clientes</h1>
          <p className="text-navy/40 text-sm mt-0.5">{clientes.length} en total</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('nuevo')}>
          <span className="hidden sm:inline">Nuevo cliente</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, empresa o email..."
            className="input-field pl-9 w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['todos', ...ESTADOS].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filtroEstado === e ? 'bg-navy text-gold' : 'bg-surface-100 text-navy/50 hover:bg-surface-200'
              }`}>
              {e === 'todos' ? 'Todos' : e}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <Card>
        {loading ? (
          <Card.Body className="py-12 flex justify-center">
            <Loader2 size={20} className="animate-spin text-navy/20" />
          </Card.Body>
        ) : filtrados.length === 0 ? (
          <Card.Body className="py-14 text-center">
            <User size={28} className="text-navy/10 mx-auto mb-3" />
            <p className="text-navy/30 text-sm mb-4">{busqueda ? 'Sin resultados.' : '¡Añade tu primer cliente!'}</p>
            {!busqueda && <Button size="sm" icon={Plus} onClick={() => setModal('nuevo')}>Crear cliente</Button>}
          </Card.Body>
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-3 px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-navy/35 bg-surface-50 border-b border-surface-100">
                <span className="col-span-3">Nombre</span>
                <span className="col-span-3">Empresa</span>
                <span className="col-span-3">Email</span>
                <span className="col-span-2">Estado</span>
                <span className="col-span-1 text-right">Acc.</span>
              </div>
              <div className="divide-y divide-surface-50">
                {filtrados.map(c => (
                  <div key={c.id} onClick={() => window.location.href=`/dashboard/clientes/${c.id}`}
                    className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors cursor-pointer">
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-navy/6 flex items-center justify-center font-bold text-navy/50 text-sm shrink-0">
                        {c.nombre?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{c.nombre}</p>
                        {c.cargo && <p className="text-[11px] text-navy/35 truncate">{c.cargo}</p>}
                      </div>
                    </div>
                    <span className="col-span-3 text-sm text-navy/60 truncate">{c.empresa || '—'}</span>
                    <span className="col-span-3 text-sm text-navy/50 truncate">{c.email || '—'}</span>
                    <span className="col-span-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${ESTADO_BADGE[c.estado] || 'bg-surface-100 text-navy/40'}`}>
                        {c.estado}
                      </span>
                    </span>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button onClick={(e) => abrirEdicion(e, c)} className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-blue-500 transition-all" title="Editar cliente">
                        <Pencil size={13} />
                      </button>
                      {c.email    && <a href={`mailto:${c.email}`}    onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-navy"><Mail  size={13} /></a>}
                      {c.telefono && <a href={`tel:${c.telefono}`}    onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-navy"><Phone size={13} /></a>}
                      <Link to={`/dashboard/clientes/${c.id}`} onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-gold transition-all" title="Ver ficha">
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Móvil: cards */}
            <div className="md:hidden divide-y divide-surface-100">
              {filtrados.map(c => (
                  <div key={c.id} onClick={() => window.location.href=`/dashboard/clientes/${c.id}`}
                    className="px-4 py-4 flex items-center gap-3 hover:bg-surface-50 active:bg-surface-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-navy/6 flex items-center justify-center font-bold text-navy/50 shrink-0">
                    {c.nombre?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-navy text-sm truncate">{c.nombre}</p>
                      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${ESTADO_BADGE[c.estado] || 'bg-surface-100 text-navy/40'}`}>
                        {c.estado}
                      </span>
                    </div>
                    <p className="text-xs text-navy/50 truncate">{c.empresa || c.email || '—'}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => abrirEdicion(e, c)} className="p-2 rounded-lg bg-surface-100 text-navy/40 hover:text-blue-500 transition-colors">
                      <Pencil size={14} />
                    </button>
                    {c.email    && <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="p-2 rounded-lg bg-surface-100 text-navy/40"><Mail  size={14} /></a>}
                    {c.telefono && <a href={`tel:${c.telefono}`} onClick={e => e.stopPropagation()} className="p-2 rounded-lg bg-surface-100 text-navy/40"><Phone size={14} /></a>}
                    <Link to={`/dashboard/clientes/${c.id}`} onClick={e => e.stopPropagation()}
                      className="p-2 rounded-lg bg-surface-100 text-navy/40 hover:text-gold transition-colors">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {modal && <ModalCliente cliente={modal === 'nuevo' ? null : modal} onClose={() => setModal(null)} onGuardado={() => { setModal(null); cargar() }} />}
    </div>
  )
}