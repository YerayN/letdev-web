import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, FileDown, Save, ArrowLeft, Percent, Euro as EuroIcon, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const eur = (n) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits:2, maximumFractionDigits:2 })
const LINEA_VACIA = () => ({ _id: Math.random().toString(36).slice(2), descripcion:'', detalle:'', cantidad:1, unidad:'ud', precio_unitario:0 })
const UNIDADES = ['ud','hora','día','mes','pack','pág','item']

export default function PresupuestoGenerator() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [clientes,      setClientes]      = useState([])
  const [proyectos,     setProyectos]     = useState([])
  const [cab,           setCab]           = useState({
    numero:'', cliente_id:'', proyecto_id:'', titulo:'', descripcion:'',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_validez:'', condiciones:'Presupuesto válido por 30 días desde la fecha de emisión. Precio cerrado, sin costes adicionales.', notas:'',
  })
  const [lineas,        setLineas]        = useState([LINEA_VACIA()])
  const [aplicaIva,     setAplicaIva]     = useState(true)
  const [pctIva,        setPctIva]        = useState(21)
  const [tipoDescuento, setTipoDescuento] = useState('ninguno')
  const [descuento,     setDescuento]     = useState(0)
  const [guardando,     setGuardando]     = useState(false)
  const [guardado,      setGuardado]      = useState(false)

  // Carga inicial: clientes + config + número (solo si es nuevo)
  useEffect(() => {
    supabase.from('clientes').select('id,nombre,empresa').order('nombre')
      .then(({ data }) => setClientes(data || []))

    if (!id) {
      Promise.all([
        supabase.rpc('siguiente_numero_presupuesto'),
        supabase.from('configuracion').select('*').single(),
      ]).then(([{ data: num }, { data: cfg }]) => {
        if (num) setCab(c => ({ ...c, numero: num }))
        if (cfg) {
          setCab(c => ({ ...c, condiciones: cfg.presupuesto_condiciones || c.condiciones }))
          if (cfg.presupuesto_iva_pct) setPctIva(Number(cfg.presupuesto_iva_pct))
        }
        const dias = cfg?.presupuesto_validez_dias || 30
        const d = new Date(); d.setDate(d.getDate() + dias)
        setCab(c => ({ ...c, fecha_validez: d.toISOString().split('T')[0] }))
      })
    }
  }, [id])

  // Carga presupuesto existente al editar
  useEffect(() => {
    if (!id) return
    async function cargar() {
      const { data: p } = await supabase
        .from('presupuestos')
        .select('*, presupuesto_lineas(*)')
        .eq('id', id)
        .single()
      if (!p) return
      setCab({
        numero:        p.numero,
        cliente_id:    p.cliente_id,
        proyecto_id:   p.proyecto_id || '',
        titulo:        p.titulo,
        descripcion:   p.descripcion || '',
        fecha_emision: p.fecha_emision,
        fecha_validez: p.fecha_validez || '',
        condiciones:   p.condiciones || '',
        notas:         p.notas || '',
      })
      setAplicaIva(p.aplica_iva)
      setPctIva(p.porcentaje_iva)
      setTipoDescuento(p.tipo_descuento)
      setDescuento(p.descuento)
      setLineas(p.presupuesto_lineas.map(l => ({
        _id:             l.id,
        descripcion:     l.descripcion,
        detalle:         l.detalle || '',
        cantidad:        l.cantidad,
        unidad:          l.unidad,
        precio_unitario: l.precio_unitario,
      })))
    }
    cargar()
  }, [id])

  // Proyectos del cliente — solo los que ya existen (presupuesto → proyecto, no al revés)
  // Según el flujo: el presupuesto se acepta y LUEGO se crea el proyecto.
  // Aquí mostramos proyectos ya creados para vincular un presupuesto a uno existente.
  useEffect(() => {
    if (!cab.cliente_id) { setProyectos([]); return }
    supabase.from('proyectos')
      .select('id,nombre,estado')
      .eq('cliente_id', cab.cliente_id)
      .not('estado', 'eq', 'cancelado')
      .order('nombre')
      .then(({ data }) => setProyectos(data || []))
  }, [cab.cliente_id])

  // Cálculos
  const subtotal         = lineas.reduce((s, l) => s + Number(l.cantidad) * Number(l.precio_unitario), 0)
  const importeDescuento = tipoDescuento === 'porcentaje' ? subtotal * (Number(descuento) / 100)
                         : tipoDescuento === 'importe'    ? Math.min(Number(descuento), subtotal) : 0
  const baseImponible    = subtotal - importeDescuento
  const importeIva       = aplicaIva ? baseImponible * (pctIva / 100) : 0
  const total            = baseImponible + importeIva

  const actualizarLinea = (idx, campo, valor) =>
    setLineas(prev => prev.map((l, i) => i === idx ? { ...l, [campo]: valor } : l))

  const guardar = async (estado = 'borrador') => {
    if (!cab.cliente_id || !cab.titulo) return alert('Rellena cliente y título.')
    setGuardando(true)
    const payload = {
      ...cab,
      estado,
      aplica_iva:       aplicaIva,
      porcentaje_iva:   pctIva,
      tipo_descuento:   tipoDescuento,
      descuento:        Number(descuento),
      subtotal,
      importe_descuento: importeDescuento,
      base_imponible:   baseImponible,
      importe_iva:      importeIva,
      total,
      proyecto_id:      cab.proyecto_id || null,
    }
    let pid = id
    if (id) {
      await supabase.from('presupuestos').update(payload).eq('id', id)
      await supabase.from('presupuesto_lineas').delete().eq('presupuesto_id', id)
    } else {
      const { data } = await supabase.from('presupuestos').insert(payload).select().single()
      pid = data?.id
    }
    if (pid) {
      await supabase.from('presupuesto_lineas').insert(
        lineas.map((l, i) => ({
          presupuesto_id:  pid,
          orden:           i,
          descripcion:     l.descripcion,
          detalle:         l.detalle || null,
          cantidad:        Number(l.cantidad),
          unidad:          l.unidad,
          precio_unitario: Number(l.precio_unitario),
        }))
      )
    }
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
    if (!id && pid) navigate(`/dashboard/presupuestos/${pid}/editar`, { replace: true })
  }

  const imprimirPDF = async () => {
    const cliente = clientes.find(c => c.id === cab.cliente_id)
    const eur2    = (n) => Number(n || 0).toLocaleString('es-ES', { style:'currency', currency:'EUR' })
    const { data: cfg } = await supabase.from('configuracion').select('*').single()
    const logo      = cfg?.logo_path        || '/images/logo-black.png'
    const nombreCom = cfg?.nombre_comercial || 'LetDev'
    const nombreFis = cfg?.nombre_fiscal    || ''
    const emailCfg  = cfg?.email            || ''
    const telCfg    = cfg?.telefono         || ''
    const dirCfg    = cfg?.direccion        ? `<div>${cfg.direccion}</div>` : ''
    const ciudadCfg = cfg?.ciudad           ? `<div>${cfg.codigo_postal || ''} ${cfg.ciudad}</div>` : ''
    const dniCfg    = cfg?.dni_cif          ? `<div>CIF/DNI: ${cfg.dni_cif}</div>` : ''
    const piePDF    = cfg?.presupuesto_pie  || ''

    const filasLineas = lineas.map((l, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8f9fb' : '#fff'}">
        <td style="padding:10px 12px;font-size:13px">
          <div>${l.descripcion || ''}</div>
          ${l.detalle ? `<div style="font-size:11px;color:#8492a6;margin-top:2px">${l.detalle}</div>` : ''}
        </td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;font-family:monospace">${l.cantidad}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;color:#8492a6">${l.unidad}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;font-family:monospace">${eur2(l.precio_unitario)}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;font-family:monospace;font-weight:600">${eur2(l.cantidad * l.precio_unitario)}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Presupuesto ${cab.numero}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;color:#21354F;padding:40px;max-width:800px;margin:0 auto}
@media print{body{padding:20px}@page{margin:1cm;size:A4}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">
  <div>
    <img src="${logo}" alt="${nombreCom}" style="height:48px;margin-bottom:10px" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
    <div style="display:none;font-size:22px;font-weight:800;color:#21354F;margin-bottom:10px">${nombreCom}</div>
    <div style="font-size:11px;color:#8492a6;line-height:1.7">
      <div style="font-weight:600;color:#21354F">${nombreCom}</div>
      ${nombreFis ? `<div>${nombreFis}</div>` : ''}
      ${emailCfg  ? `<div>${emailCfg}</div>`  : ''}
      ${telCfg    ? `<div>${telCfg}</div>`    : ''}
      ${dirCfg}${ciudadCfg}${dniCfg}
    </div>
  </div>
  <div style="text-align:right">
    <div style="font-size:28px;font-weight:800;letter-spacing:-1px">PRESUPUESTO</div>
    <div style="font-size:18px;color:#F0C419;font-weight:700;margin-top:4px">${cab.numero}</div>
    <div style="font-size:12px;color:#8492a6;margin-top:10px;line-height:1.7">
      <div>Fecha: ${cab.fecha_emision}</div>
      ${cab.fecha_validez ? `<div>Válido hasta: ${cab.fecha_validez}</div>` : ''}
    </div>
  </div>
</div>
<div style="height:3px;background:linear-gradient(90deg,#F0C419,#21354F);margin-bottom:32px;border-radius:2px"></div>
<div style="margin-bottom:32px">
  <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8492a6;margin-bottom:8px">Presupuesto para</div>
  <div style="font-weight:700;font-size:16px">${cliente?.empresa || cliente?.nombre || '—'}</div>
  ${cliente?.empresa ? `<div style="font-size:13px;color:#5a6a7e">${cliente.nombre}</div>` : ''}
  ${cliente?.email   ? `<div style="font-size:12px;color:#8492a6">${cliente.email}</div>`   : ''}
</div>
${cab.titulo ? `<div style="margin-bottom:24px"><div style="font-size:18px;font-weight:700">${cab.titulo}</div>${cab.descripcion ? `<div style="font-size:13px;color:#5a6a7e;margin-top:4px">${cab.descripcion}</div>` : ''}</div>` : ''}
<table style="width:100%;border-collapse:collapse;margin-bottom:32px">
  <thead><tr style="background:#21354F;color:white">
    ${['Descripción','Cant.','Ud.','Precio/u','Subtotal'].map((h, i) =>
      `<th style="padding:10px 12px;font-size:11px;font-weight:600;text-transform:uppercase;text-align:${i === 0 ? 'left' : 'right'}">${h}</th>`
    ).join('')}
  </tr></thead>
  <tbody>${filasLineas}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:32px">
  <div style="width:260px">
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e6ec;font-size:13px;color:#5a6a7e">
      <span>Subtotal</span><span style="font-family:monospace">${eur2(subtotal)}</span>
    </div>
    ${importeDescuento > 0 ? `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e6ec;font-size:13px;color:#059669">
      <span>Descuento${tipoDescuento === 'porcentaje' ? ` (${descuento}%)` : ''}</span>
      <span style="font-family:monospace">− ${eur2(importeDescuento)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e6ec;font-size:13px;color:#5a6a7e">
      <span>Base imponible</span><span style="font-family:monospace">${eur2(baseImponible)}</span>
    </div>` : ''}
    ${aplicaIva ? `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e6ec;font-size:13px;color:#5a6a7e">
      <span>IVA (${pctIva}%)</span><span style="font-family:monospace">${eur2(importeIva)}</span>
    </div>` : ''}
    <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-size:18px;font-weight:800">
      <span>TOTAL</span><span style="color:#F0C419;font-family:monospace">${eur2(total)}</span>
    </div>
  </div>
</div>
${cab.condiciones ? `<div style="border-top:1px solid #e2e6ec;padding-top:20px;font-size:11px;color:#8492a6;line-height:1.6"><div style="font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em">Condiciones</div>${cab.condiciones}</div>` : ''}
${piePDF ? `<div style="margin-top:32px;text-align:center;font-size:11px;color:#8492a6;border-top:1px solid #e2e6ec;padding-top:16px">${piePDF}</div>` : ''}
<script>window.onload=()=>{window.print()}<\/script></body></html>`

    const w = window.open('', '_blank', 'width=900,height=700')
    w.document.write(html)
    w.document.close()
  }

  return (
    <div className="space-y-4 max-w-5xl">

      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/presupuestos')} className="text-navy/40 hover:text-navy transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display font-bold text-lg md:text-xl text-navy tracking-tight">
            {id ? `Editando ${cab.numero}` : 'Nuevo presupuesto'}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={FileDown} onClick={imprimirPDF}>PDF</Button>
          <Button size="sm" icon={Save} loading={guardando} onClick={() => guardar('borrador')}
            className={guardado ? 'bg-emerald-500 hover:bg-emerald-500' : ''}>
            {guardado ? 'Guardado ✓' : 'Borrador'}
          </Button>
          <Button size="sm" onClick={() => guardar('enviado')}>Enviado →</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">

        {/* ── Izquierda ──────────────────────────────────────────── */}
        <div className="space-y-4">

          <Card>
            <Card.Header><h2 className="font-display font-semibold text-navy text-sm">Datos</h2></Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="lbl">Nº Presupuesto</label>
                  <input className="input-field font-mono" value={cab.numero}
                    onChange={e => setCab(c => ({ ...c, numero: e.target.value }))} placeholder="PRES-2025-001" />
                </div>
                <div>
                  <label className="lbl">Cliente *</label>
                  <select className="input-field" value={cab.cliente_id}
                    onChange={e => setCab(c => ({ ...c, cliente_id: e.target.value, proyecto_id: '' }))}>
                    <option value="">Selecciona cliente...</option>
                    {clientes.map(cl => (
                      <option key={cl.id} value={cl.id}>
                        {cl.empresa ? `${cl.empresa} — ${cl.nombre}` : cl.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Proyecto vinculado — opcional, solo si ya existe un proyecto para este cliente */}
                <div>
                  <label className="lbl">Vincular a proyecto</label>
                  <select className="input-field" value={cab.proyecto_id}
                    onChange={e => setCab(c => ({ ...c, proyecto_id: e.target.value }))}
                    disabled={!cab.cliente_id || proyectos.length === 0}>
                    <option value="">Sin proyecto / presupuesto previo</option>
                    {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  {cab.cliente_id && proyectos.length === 0 && (
                    <p className="text-[11px] text-navy/30 mt-1">
                      Este cliente aún no tiene proyectos — se creará uno al aceptar el presupuesto
                    </p>
                  )}
                  {!cab.cliente_id && (
                    <p className="text-[11px] text-navy/30 mt-1">Selecciona un cliente primero</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="lbl">Título *</label>
                  <input className="input-field" value={cab.titulo}
                    onChange={e => setCab(c => ({ ...c, titulo: e.target.value }))} placeholder="Describe el servicio o proyecto..." />
                </div>
                <div>
                  <label className="lbl">Fecha emisión</label>
                  <input type="date" className="input-field" value={cab.fecha_emision}
                    onChange={e => setCab(c => ({ ...c, fecha_emision: e.target.value }))} />
                </div>
                <div>
                  <label className="lbl">Válido hasta</label>
                  <input type="date" className="input-field" value={cab.fecha_validez}
                    onChange={e => setCab(c => ({ ...c, fecha_validez: e.target.value }))} />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Líneas */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-navy text-sm">Conceptos</h2>
              <button onClick={() => setLineas(p => [...p, LINEA_VACIA()])}
                className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-dark transition-colors">
                <Plus size={13} /> Añadir
              </button>
            </Card.Header>

            <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-navy/35 border-b border-surface-100 bg-surface-50">
              <span className="col-span-5">Descripción</span>
              <span className="col-span-2 text-center">Cant.</span>
              <span className="col-span-1 text-center">Ud.</span>
              <span className="col-span-2 text-right">P/u</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {lineas.map((linea, idx) => (
              <div key={linea._id} className="group px-4 sm:px-5 py-3 border-b border-surface-50 last:border-0">
                <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                  <input className="col-span-5 input-field-sm" placeholder="Descripción"
                    value={linea.descripcion} onChange={e => actualizarLinea(idx, 'descripcion', e.target.value)} />
                  <input type="number" min="0" step="0.5" className="col-span-2 input-field-sm text-center"
                    value={linea.cantidad} onChange={e => actualizarLinea(idx, 'cantidad', e.target.value)} />
                  <select className="col-span-1 input-field-sm text-center px-1 text-xs"
                    value={linea.unidad} onChange={e => actualizarLinea(idx, 'unidad', e.target.value)}>
                    {UNIDADES.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input type="number" min="0" step="0.01" className="col-span-2 input-field-sm text-right"
                    value={linea.precio_unitario} onChange={e => actualizarLinea(idx, 'precio_unitario', e.target.value)} />
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <span className="font-mono text-sm text-navy/70">{eur(linea.cantidad * linea.precio_unitario)} €</span>
                    {lineas.length > 1 && (
                      <button onClick={() => setLineas(p => p.filter((_, i) => i !== idx))}
                        className="opacity-0 group-hover:opacity-100 text-navy/20 hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="sm:hidden space-y-2">
                  <input className="input-field-sm w-full" placeholder="Descripción del concepto"
                    value={linea.descripcion} onChange={e => actualizarLinea(idx, 'descripcion', e.target.value)} />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-navy/40 font-mono uppercase">Cant.</label>
                      <input type="number" min="0" className="input-field-sm w-full text-center mt-0.5"
                        value={linea.cantidad} onChange={e => actualizarLinea(idx, 'cantidad', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-navy/40 font-mono uppercase">Unidad</label>
                      <select className="input-field-sm w-full mt-0.5"
                        value={linea.unidad} onChange={e => actualizarLinea(idx, 'unidad', e.target.value)}>
                        {UNIDADES.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-navy/40 font-mono uppercase">Precio/u</label>
                      <input type="number" min="0" step="0.01" className="input-field-sm w-full text-right mt-0.5"
                        value={linea.precio_unitario} onChange={e => actualizarLinea(idx, 'precio_unitario', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-navy">{eur(linea.cantidad * linea.precio_unitario)} €</span>
                    {lineas.length > 1 && (
                      <button onClick={() => setLineas(p => p.filter((_, i) => i !== idx))}
                        className="text-red-400 text-xs flex items-center gap-1">
                        <Trash2 size={12} /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
                <input className="mt-1.5 w-full text-xs text-navy/40 placeholder:text-navy/20 bg-transparent border-none outline-none"
                  placeholder="Detalle adicional (opcional)..."
                  value={linea.detalle} onChange={e => actualizarLinea(idx, 'detalle', e.target.value)} />
              </div>
            ))}
          </Card>

          <Card>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="lbl">Notas internas</label>
                <textarea rows={3} className="input-field resize-none" value={cab.notas}
                  onChange={e => setCab(c => ({ ...c, notas: e.target.value }))} placeholder="No aparecen en el PDF..." />
              </div>
              <div>
                <label className="lbl">Condiciones (PDF)</label>
                <textarea rows={3} className="input-field resize-none" value={cab.condiciones}
                  onChange={e => setCab(c => ({ ...c, condiciones: e.target.value }))} />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* ── Derecha: IVA, descuento, totales ───────────────────── */}
        <div className="space-y-4">

          <Card>
            <Card.Header><h2 className="font-display font-semibold text-navy text-sm">IVA</h2></Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy">Aplicar IVA</p>
                  <p className="text-xs text-navy/40">Actívalo si eres autónomo con IVA</p>
                </div>
                <button onClick={() => setAplicaIva(v => !v)} className="text-navy/40 hover:text-navy transition-colors">
                  {aplicaIva ? <ToggleRight size={28} className="text-gold" /> : <ToggleLeft size={28} />}
                </button>
              </div>
              {aplicaIva && (
                <div className="flex gap-2">
                  {[4, 10, 21].map(v => (
                    <button key={v} onClick={() => setPctIva(v)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                        pctIva === v ? 'bg-navy text-gold border-navy' : 'border-surface-200 text-navy/50 hover:border-navy/20'
                      }`}>
                      {v}%
                    </button>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header><h2 className="font-display font-semibold text-navy text-sm">Descuento</h2></Card.Header>
            <Card.Body className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key:'ninguno',    label:'Ninguno'             },
                  { key:'porcentaje', label:'%',  icon:Percent    },
                  { key:'importe',    label:'€',  icon:EuroIcon   },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => { setTipoDescuento(key); setDescuento(0) }}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      tipoDescuento === key ? 'bg-navy text-gold border-navy' : 'border-surface-200 text-navy/50 hover:border-navy/20'
                    }`}>
                    {Icon && <Icon size={11} />} {label}
                  </button>
                ))}
              </div>
              {tipoDescuento !== 'ninguno' && (
                <div>
                  <label className="lbl">{tipoDescuento === 'porcentaje' ? 'Porcentaje' : 'Importe (€)'}</label>
                  <div className="relative">
                    <input type="number" min="0" max={tipoDescuento === 'porcentaje' ? 100 : undefined}
                      step={tipoDescuento === 'porcentaje' ? 1 : 0.01}
                      value={descuento} onChange={e => setDescuento(e.target.value)}
                      className="input-field pr-8 text-right" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/30 text-sm pointer-events-none">
                      {tipoDescuento === 'porcentaje' ? '%' : '€'}
                    </span>
                  </div>
                  {importeDescuento > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">— {eur(importeDescuento)} € de descuento</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="space-y-2.5">
              <div className="flex justify-between text-sm text-navy/55">
                <span>Subtotal</span>
                <span className="font-mono">{eur(subtotal)} €</span>
              </div>
              {importeDescuento > 0 && (
                <>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Descuento {tipoDescuento === 'porcentaje' ? `(${descuento}%)` : ''}</span>
                    <span className="font-mono">− {eur(importeDescuento)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-navy/55">
                    <span>Base imponible</span>
                    <span className="font-mono">{eur(baseImponible)} €</span>
                  </div>
                </>
              )}
              {aplicaIva && (
                <div className="flex justify-between text-sm text-navy/55">
                  <span>IVA ({pctIva}%)</span>
                  <span className="font-mono">{eur(importeIva)} €</span>
                </div>
              )}
              <div className="border-t border-surface-200 pt-2.5 flex justify-between font-display font-bold text-navy text-xl">
                <span>Total</span>
                <span className="font-mono text-gold">{eur(total)} €</span>
              </div>
            </Card.Body>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full justify-center" loading={guardando} icon={Save} onClick={() => guardar('borrador')}>
              {guardado ? 'Guardado ✓' : 'Guardar borrador'}
            </Button>
            <Button variant="secondary" className="w-full justify-center" onClick={() => guardar('enviado')}>
              Guardar y marcar enviado
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
