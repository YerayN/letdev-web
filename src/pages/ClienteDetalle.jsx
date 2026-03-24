import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Globe, MapPin, Building2,
  FileText, FolderKanban, Clock, Edit2, Plus,
  X, Save, Loader2, ExternalLink, Tag, User,
  Euro, MessageSquare, AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const eur       = (n) => Number(n||0).toLocaleString('es-ES', { style:'currency', currency:'EUR' })
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' }) : '—'
const fmtDT     = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'

const ESTADOS   = ['lead','activo','inactivo','vip','bloqueado']
const ORIGENES  = ['Web','Referido','Instagram','LinkedIn','Google','Evento','WhatsApp','Otro']
const SECTORES  = ['Hostelería','Salud','Retail','Tecnología','Educación','Inmobiliaria','Legal','Moda','Servicios','Otro']
const PRIORIDADES = [{ v:1, l:'Alta' },{ v:2, l:'Media' },{ v:3, l:'Baja' }]

const ESTADO_BADGE = {
  lead:'bg-blue-50 text-blue-500', activo:'bg-emerald-50 text-emerald-600',
  inactivo:'bg-surface-100 text-navy/40', vip:'bg-gold/10 text-gold-dark font-semibold', bloqueado:'bg-red-50 text-red-400',
}
const ESTADO_PROY = {
  presupuestado:{label:'Presupuestado',cls:'bg-blue-50 text-blue-500'}, en_curso:{label:'En curso',cls:'bg-gold/10 text-gold-dark'},
  pausado:{label:'Pausado',cls:'bg-orange-50 text-orange-500'}, entregado:{label:'Entregado',cls:'bg-emerald-50 text-emerald-600'},
  cancelado:{label:'Cancelado',cls:'bg-red-50 text-red-400'}, mantenimiento:{label:'Mantenim.',cls:'bg-purple-50 text-purple-500'},
}
const ESTADO_PRES = {
  borrador:{label:'Borrador',cls:'bg-surface-100 text-navy/50'}, enviado:{label:'Enviado',cls:'bg-blue-50 text-blue-500'},
  aceptado:{label:'Aceptado',cls:'bg-emerald-50 text-emerald-600'}, rechazado:{label:'Rechazado',cls:'bg-red-50 text-red-400'},
  caducado:{label:'Caducado',cls:'bg-surface-200 text-navy/30'},
}
const TIPO_I = {
  llamada:{label:'Llamada',icon:'📞'}, email:{label:'Email',icon:'✉️'}, reunion:{label:'Reunión',icon:'🤝'},
  whatsapp:{label:'WhatsApp',icon:'💬'}, nota:{label:'Nota',icon:'📝'}, otro:{label:'Otro',icon:'•'},
}

const CLIENTE_VACIO = {
  nombre:'', email:'', empresa:'', sector:'', web:'',
  telefono:'', telefono_alt:'', ciudad:'', provincia:'',
  pais:'España', direccion:'', codigo_postal:'',
  estado:'lead', origen:'', prioridad:2,
  cargo:'', dni:'', condiciones_pago:'', notas:'', etiquetas:'',
}

// ── Subcomponentes del Modal Cliente ──────────────────────────────────
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
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(15,30,50,0.55)' }}>
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

// ── Modal de Interacciones ────────────────────────────────────────────
function ModalInteraccion({ clienteId, onClose, onGuardado }) {
  const [form, setForm] = useState({ tipo:'llamada', titulo:'', descripcion:'', fecha:new Date().toISOString().slice(0,16), duracion_min:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const guardar = async () => {
    if (!form.titulo.trim()) return
    setLoading(true)
    await supabase.from('interacciones').insert({
      cliente_id:clienteId, tipo:form.tipo, titulo:form.titulo,
      descripcion:form.descripcion||null, fecha:form.fecha,
      duracion_min:form.duracion_min?Number(form.duracion_min):null,
    })
    setLoading(false); onGuardado()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{background:'rgba(15,30,50,0.55)'}}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display font-bold text-navy text-base">Nueva interacción</h2>
          <button onClick={onClose} className="text-navy/30 hover:text-navy p-1"><X size={18}/></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="lbl block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TIPO_I).map(([key,{label,icon}]) => (
                <button key={key} onClick={() => set('tipo',key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.tipo===key?'bg-navy text-gold border-navy':'border-surface-200 text-navy/50 hover:border-navy/20'}`}>
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1">Título *</label>
            <input className="input-field w-full" value={form.titulo} onChange={e=>set('titulo',e.target.value)} placeholder="Ej: Llamada para revisar avance" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="lbl block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1">Fecha y hora</label>
              <input type="datetime-local" className="input-field w-full" value={form.fecha} onChange={e=>set('fecha',e.target.value)} />
            </div>
            <div>
              <label className="lbl block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1">Duración (min)</label>
              <input type="number" className="input-field w-full" value={form.duracion_min} onChange={e=>set('duracion_min',e.target.value)} placeholder="30" />
            </div>
          </div>
          <div>
            <label className="lbl block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1">Notas</label>
            <textarea rows={3} className="input-field resize-none w-full" value={form.descripcion} onChange={e=>set('descripcion',e.target.value)} placeholder="Resumen, acuerdos..." />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-surface-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" loading={loading} onClick={guardar}>Guardar</Button>
        </div>
      </div>
    </div>
  )
}

function Seccion({ icon:Icon, titulo, accion, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-navy/40"/>
          <h2 className="font-display font-semibold text-navy text-sm">{titulo}</h2>
        </div>
        {accion}
      </div>
      {children}
    </div>
  )
}

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente,       setCliente]       = useState(null)
  const [proyectos,     setProyectos]     = useState([])
  const [presupuestos,  setPresupuestos]  = useState([])
  const [interacciones, setInteracciones] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [modalI,        setModalI]        = useState(false)
  const [modalEdit,     setModalEdit]     = useState(false) // <-- ESTADO PARA EL MODAL DE EDICIÓN
  const [notas,         setNotas]         = useState('')
  const [editNotas,     setEditNotas]     = useState(false)
  const [guardNotas,    setGuardNotas]    = useState(false)

  const cargar = async () => {
    const [{ data:c },{ data:p },{ data:pr },{ data:i }] = await Promise.all([
      supabase.from('clientes').select('*').eq('id',id).single(),
      supabase.from('proyectos').select('*').eq('cliente_id',id).order('created_at',{ascending:false}),
      supabase.from('presupuestos').select('*').eq('cliente_id',id).order('created_at',{ascending:false}),
      supabase.from('interacciones').select('*').eq('cliente_id',id).order('fecha',{ascending:false}),
    ])
    setCliente(c); setProyectos(p||[]); setPresupuestos(pr||[]); setInteracciones(i||[])
    setNotas(c?.notas||''); setLoading(false)
  }

  useEffect(() => { cargar() }, [id])

  const guardarNotas = async () => {
    setGuardNotas(true)
    await supabase.from('clientes').update({ notas }).eq('id', id)
    setGuardNotas(false); setEditNotas(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-navy/20"/></div>
  if (!cliente) return (
    <div className="text-center py-16">
      <AlertCircle size={32} className="text-navy/15 mx-auto mb-3"/>
      <p className="text-navy/40">Cliente no encontrado</p>
      <Button size="sm" className="mt-4" onClick={() => navigate('/dashboard/clientes')}>Volver</Button>
    </div>
  )

  const totalAcordado  = proyectos.reduce((s,p) => s+Number(p.importe_acordado||0),0)
  const totalCobrado   = proyectos.reduce((s,p) => s+Number(p.importe_cobrado||0),0)
  const totalPendiente = totalAcordado - totalCobrado
  const presAceptados  = presupuestos.filter(p => p.estado==='aceptado').length
  const presPendientes = presupuestos.filter(p => p.estado==='enviado').length

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">

      {/* Cabecera */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/dashboard/clientes')} className="text-navy/40 hover:text-navy mt-1 shrink-0"><ArrowLeft size={18}/></button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">{cliente.nombre}</h1>
                {cliente.estado && <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize ${ESTADO_BADGE[cliente.estado]||'bg-surface-100 text-navy/40'}`}>{cliente.estado}</span>}
                
                {/* BOTÓN DE EDITAR AÑADIDO AQUÍ */}
                <button 
                  onClick={() => setModalEdit(true)} 
                  className="p-1.5 rounded-md hover:bg-surface-100 text-navy/40 hover:text-blue-500 transition-all ml-1" 
                  title="Editar datos del cliente"
                >
                  <Edit2 size={16}/>
                </button>

              </div>
              {cliente.empresa && <p className="text-navy/50 text-sm mt-0.5">{cliente.empresa}</p>}
              {cliente.cargo   && <p className="text-navy/35 text-xs">{cliente.cargo}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {cliente.email    && <a href={`mailto:${cliente.email}`} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-surface-200 text-navy/50 hover:text-navy hover:border-navy/20 transition-all"><Mail size={13}/> Email</a>}
              {cliente.telefono && <a href={`tel:${cliente.telefono}`} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-surface-200 text-navy/50 hover:text-navy hover:border-navy/20 transition-all"><Phone size={13}/> Llamar</a>}
              {cliente.telefono && <a href={`https://wa.me/${cliente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-all"><MessageSquare size={13}/> WhatsApp</a>}
            </div>
          </div>
        </div>
      </div>

      {/* Info + métricas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <Card.Body className="space-y-2.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-navy/35 mb-3">Datos de contacto</p>
            {[
              { icon:Mail,      val:cliente.email,    href:`mailto:${cliente.email}`  },
              { icon:Phone,     val:cliente.telefono, href:`tel:${cliente.telefono}`  },
              { icon:Globe,     val:cliente.web,      href:cliente.web, ext:true      },
              { icon:MapPin,    val:[cliente.ciudad,cliente.provincia].filter(Boolean).join(', ')||null },
              { icon:Building2, val:cliente.sector   },
              { icon:Tag,       val:cliente.origen?`Origen: ${cliente.origen}`:null  },
            ].filter(r=>r.val).map(({icon:Icon,val,href,ext},i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Icon size={13} className="text-navy/30 shrink-0"/>
                {href ? <a href={href} target={ext?'_blank':undefined} rel="noreferrer" className="text-navy/60 hover:text-navy truncate">{val}</a>
                      : <span className="text-navy/60 truncate">{val}</span>}
              </div>
            ))}
            {cliente.etiquetas?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {cliente.etiquetas.map(e => <span key={e} className="text-[10px] px-2 py-0.5 bg-surface-100 text-navy/40 rounded-md font-mono">{e}</span>)}
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="md:col-span-2">
          <Card.Body>
            <p className="text-[10px] font-mono uppercase tracking-widest text-navy/35 mb-3">Resumen económico</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label:'Facturado',  val:eur(totalAcordado),  color:'text-navy'        },
                { label:'Cobrado',    val:eur(totalCobrado),   color:'text-emerald-600' },
                { label:'Pendiente',  val:eur(totalPendiente), color:'text-orange-500'  },
                { label:'Proyectos',  val:proyectos.length,    color:'text-navy'        },
              ].map(({label,val,color}) => (
                <div key={label}>
                  <p className={`font-display font-bold text-xl ${color} tracking-tight`}>{val}</p>
                  <p className="text-xs text-navy/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {totalAcordado > 0 && (
              <>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{width:`${Math.min((totalCobrado/totalAcordado)*100,100)}%`}}/>
                </div>
                <p className="text-[11px] text-navy/30 mt-1">
                  {Math.round((totalCobrado/totalAcordado)*100)}% cobrado · {presAceptados} presupuestos aceptados · {presPendientes} pendientes
                </p>
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Proyectos */}
      <Seccion icon={FolderKanban} titulo={`Proyectos (${proyectos.length})`}
        accion={<Link to="/dashboard/proyectos" className="text-xs text-gold hover:text-gold-dark">Ver todos →</Link>}>
        {proyectos.length === 0
          ? <Card><Card.Body className="py-8 text-center"><p className="text-navy/30 text-sm">Sin proyectos todavía</p></Card.Body></Card>
          : <Card><div className="divide-y divide-surface-100">
              {proyectos.map(p => {
                const est = ESTADO_PROY[p.estado]||{label:p.estado,cls:'bg-surface-100 text-navy/50'}
                const cobrado=Number(p.importe_cobrado||0), acordado=Number(p.importe_acordado||0)
                return (
                  <div key={p.id} className="px-4 md:px-5 py-3.5 flex items-center gap-4 hover:bg-surface-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-navy text-sm">{p.nombre}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${est.cls}`}>{est.label}</span>
                        {p.tipo && <span className="text-[10px] font-mono text-navy/30">{p.tipo}</span>}
                      </div>
                      {acordado>0 && (
                        <div className="mt-1.5 max-w-xs">
                          <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{width:`${Math.min((cobrado/acordado)*100,100)}%`}}/>
                          </div>
                          <p className="text-[10px] text-navy/30 mt-0.5">{eur(cobrado)} de {eur(acordado)}</p>
                        </div>
                      )}
                    </div>
                    {p.fecha_entrega_estimada && <p className="text-xs text-navy/40 shrink-0 hidden sm:block">{fmtDate(p.fecha_entrega_estimada)}</p>}
                  </div>
                )
              })}
            </div></Card>}
      </Seccion>

      {/* Presupuestos */}
      <Seccion icon={FileText} titulo={`Presupuestos (${presupuestos.length})`}
        accion={<Link to="/dashboard/presupuestos/nuevo" className="text-xs text-gold hover:text-gold-dark flex items-center gap-1"><Plus size={12}/> Nuevo</Link>}>
        {presupuestos.length === 0
          ? <Card><Card.Body className="py-8 text-center"><p className="text-navy/30 text-sm">Sin presupuestos todavía</p></Card.Body></Card>
          : <Card><div className="divide-y divide-surface-100">
              {presupuestos.map(pr => {
                const est=ESTADO_PRES[pr.estado]||ESTADO_PRES.borrador
                return (
                  <div key={pr.id} className="px-4 md:px-5 py-3 flex items-center gap-3 hover:bg-surface-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-navy/40">{pr.numero}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${est.cls}`}>{est.label}</span>
                      </div>
                      <p className="text-sm font-medium text-navy truncate">{pr.titulo}</p>
                      <p className="text-xs text-navy/35">{fmtDate(pr.fecha_emision)}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <span className="font-mono font-semibold text-navy text-sm">{eur(pr.total)}</span>
                      <Link to={`/dashboard/presupuestos/${pr.id}/editar`} className="p-1.5 rounded hover:bg-surface-100 text-navy/25 hover:text-navy"><Edit2 size={13}/></Link>
                    </div>
                  </div>
                )
              })}
            </div></Card>}
      </Seccion>

      {/* Historial */}
      <Seccion icon={Clock} titulo={`Historial (${interacciones.length})`}
        accion={<button onClick={() => setModalI(true)} className="text-xs text-gold hover:text-gold-dark flex items-center gap-1"><Plus size={12}/> Registrar</button>}>
        {interacciones.length === 0
          ? <Card><Card.Body className="py-8 text-center">
              <p className="text-navy/30 text-sm mb-2">Sin interacciones registradas</p>
              <button onClick={() => setModalI(true)} className="text-xs text-gold hover:text-gold-dark">+ Registrar primera</button>
            </Card.Body></Card>
          : <Card><div className="divide-y divide-surface-100">
              {interacciones.map(i => {
                const tipo=TIPO_I[i.tipo]||{label:i.tipo,icon:'•'}
                return (
                  <div key={i.id} className="px-4 md:px-5 py-3.5 flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{tipo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy text-sm">{i.titulo}</p>
                      {i.descripcion && <p className="text-xs text-navy/50 mt-0.5 leading-relaxed">{i.descripcion}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-navy/30">{fmtDT(i.fecha)}</span>
                        {i.duracion_min && <span className="text-[11px] text-navy/30">{i.duracion_min} min</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div></Card>}
      </Seccion>

      {/* Notas */}
      <Seccion icon={Edit2} titulo="Notas internas"
        accion={editNotas
          ? <div className="flex gap-2">
              <button onClick={() => {setEditNotas(false);setNotas(cliente.notas||'')}} className="text-xs text-navy/40 hover:text-navy">Cancelar</button>
              <button onClick={guardarNotas} className="text-xs text-gold hover:text-gold-dark font-medium flex items-center gap-1">
                {guardNotas ? <Loader2 size={11} className="animate-spin"/> : <Save size={11}/>} Guardar
              </button>
            </div>
          : <button onClick={() => setEditNotas(true)} className="text-xs text-navy/35 hover:text-navy flex items-center gap-1"><Edit2 size={11}/> Editar</button>
        }>
        {editNotas
          ? <textarea rows={5} className="input-field resize-none w-full" value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Añade notas sobre este cliente..." autoFocus/>
          : <Card><Card.Body>{notas
              ? <p className="text-sm text-navy/60 leading-relaxed whitespace-pre-wrap">{notas}</p>
              : <p className="text-sm text-navy/25 italic">Sin notas. Pulsa "Editar" para añadir.</p>}
            </Card.Body></Card>}
      </Seccion>

      {/* MODALES REUTILIZADOS */}
      {modalI && <ModalInteraccion clienteId={id} onClose={() => setModalI(false)} onGuardado={() => {setModalI(false);cargar()}}/>}
      
      {modalEdit && (
        <ModalCliente 
          cliente={cliente} 
          onClose={() => setModalEdit(false)} 
          onGuardado={() => { setModalEdit(false); cargar(); }} 
        />
      )}
    </div>
  )
}