import { useState, useEffect } from 'react'
import { User, Building2, MapPin, FileText, Palette, Save, CheckCircle2, Loader2, Euro } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

function Seccion({ titulo, icon: Icon, children }) {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-navy/40" strokeWidth={1.8} />
          <h2 className="font-display font-semibold text-navy text-sm">{titulo}</h2>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
      </Card.Body>
    </Card>
  )
}

function Campo({ label, full = false, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-navy/40 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function PdfPreview({ cfg }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-5 font-sans text-[#21354F]">
      <div className="flex justify-between items-start mb-4">
        <div>
          {cfg.logo_path && (
            <img src={cfg.logo_path} alt="Logo" className="h-8 mb-2 object-contain"
              onError={e => { e.target.style.display='none' }} />
          )}
          <div className="text-[11px] text-[#8492a6] leading-relaxed">
            <div className="font-semibold text-[#21354F]">{cfg.nombre_comercial || 'LetDev'}</div>
            {cfg.nombre_fiscal && <div>{cfg.nombre_fiscal}</div>}
            {cfg.email         && <div>{cfg.email}</div>}
            {cfg.telefono      && <div>{cfg.telefono}</div>}
            {cfg.ciudad        && <div>{cfg.ciudad}</div>}
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="font-bold text-sm tracking-tight">PRESUPUESTO</div>
          <div className="text-xs font-bold text-[#F0C419] mt-0.5">{cfg.presupuesto_prefijo||'PRES'}-2025-001</div>
          <div className="text-[11px] text-[#8492a6] mt-1">
            <div>Válido {cfg.presupuesto_validez_dias||30} días</div>
          </div>
        </div>
      </div>
      <div className="h-0.5 rounded-full" style={{ background:'linear-gradient(90deg,#F0C419,#21354F)' }} />
      {cfg.presupuesto_condiciones && (
        <p className="text-[10px] text-[#8492a6] mt-3 leading-relaxed">
          <span className="font-semibold uppercase tracking-wider">Condiciones · </span>
          {cfg.presupuesto_condiciones.slice(0, 100)}{cfg.presupuesto_condiciones.length > 100 ? '...' : ''}
        </p>
      )}
    </div>
  )
}

export default function Configuracion() {
  const { user } = useAuth()
  const DEFAULTS = {
    nombre_fiscal:'', nombre_comercial:'LetDev', email:'', telefono:'', web:'', dni_cif:'',
    direccion:'', ciudad:'', provincia:'', codigo_postal:'', pais:'España',
    logo_path:'/images/logo-black.png',
    presupuesto_condiciones:'Presupuesto válido por 30 días desde la fecha de emisión. Precio cerrado, sin costes adicionales.',
    presupuesto_validez_dias:30, presupuesto_iva_pct:21, presupuesto_pie:'', presupuesto_prefijo:'PRES', moneda:'EUR',
  }
  const [cfg,     setCfg]     = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }))

  useEffect(() => {
    if (!user) return
    supabase.from('configuracion').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setCfg({ ...DEFAULTS, ...data }); setLoading(false) })
  }, [user])

  const guardar = async () => {
    setSaving(true)
    const { error } = await supabase.from('configuracion').upsert({ ...cfg, user_id: user.id }, { onConflict:'user_id' })
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-navy/20" />
    </div>
  )

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">

      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-navy tracking-tight">Configuración</h1>
          <p className="text-navy/40 text-sm mt-0.5">Tus datos aparecen en todos los PDFs</p>
        </div>
        <div className="flex gap-2">
          {/* Botón para ver preview en móvil */}
          <button onClick={() => setShowPreview(v => !v)}
            className="lg:hidden text-xs font-medium text-navy/50 hover:text-navy border border-surface-200 px-3 py-2 rounded-lg transition-colors">
            {showPreview ? 'Ocultar preview' : 'Ver preview'}
          </button>
          <Button icon={saved ? CheckCircle2 : Save} loading={saving} onClick={guardar}
            className={saved ? 'bg-emerald-500 hover:bg-emerald-500' : ''}>
            {saved ? 'Guardado' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Preview móvil (toggle) */}
      {showPreview && (
        <div className="lg:hidden">
          <Card>
            <Card.Header>
              <h2 className="font-display font-semibold text-navy text-sm">Preview PDF</h2>
            </Card.Header>
            <Card.Body><PdfPreview cfg={cfg} /></Card.Body>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <div className="space-y-4">

          <Seccion titulo="Datos personales / fiscales" icon={User}>
            <Campo label="Nombre fiscal">
              <input className="input-field" value={cfg.nombre_fiscal||''} onChange={e => set('nombre_fiscal', e.target.value)} placeholder="Yeray Navarro Yanini" />
            </Campo>
            <Campo label="Nombre comercial">
              <input className="input-field" value={cfg.nombre_comercial||''} onChange={e => set('nombre_comercial', e.target.value)} placeholder="LetDev" />
            </Campo>
            <Campo label="DNI / CIF">
              <input className="input-field" value={cfg.dni_cif||''} onChange={e => set('dni_cif', e.target.value)} placeholder="12345678A" />
            </Campo>
            <Campo label="Web">
              <input className="input-field" value={cfg.web||''} onChange={e => set('web', e.target.value)} placeholder="https://letdev.es" />
            </Campo>
            <Campo label="Email">
              <input className="input-field" type="email" value={cfg.email||''} onChange={e => set('email', e.target.value)} placeholder="yeray@letdev.es" />
            </Campo>
            <Campo label="Teléfono">
              <input className="input-field" value={cfg.telefono||''} onChange={e => set('telefono', e.target.value)} placeholder="+34 637 659 355" />
            </Campo>
          </Seccion>

          <Seccion titulo="Dirección fiscal" icon={MapPin}>
            <Campo label="Dirección" full>
              <input className="input-field" value={cfg.direccion||''} onChange={e => set('direccion', e.target.value)} placeholder="Calle Mayor, 1" />
            </Campo>
            <Campo label="Ciudad">
              <input className="input-field" value={cfg.ciudad||''} onChange={e => set('ciudad', e.target.value)} placeholder="Alicante" />
            </Campo>
            <Campo label="Provincia">
              <input className="input-field" value={cfg.provincia||''} onChange={e => set('provincia', e.target.value)} />
            </Campo>
            <Campo label="Código postal">
              <input className="input-field" value={cfg.codigo_postal||''} onChange={e => set('codigo_postal', e.target.value)} />
            </Campo>
            <Campo label="País">
              <input className="input-field" value={cfg.pais||''} onChange={e => set('pais', e.target.value)} />
            </Campo>
          </Seccion>

          <Seccion titulo="Logo" icon={Palette}>
            <Campo label="Ruta del logo" full>
              <input className="input-field font-mono" value={cfg.logo_path||''} onChange={e => set('logo_path', e.target.value)} placeholder="/images/logo-black.png" />
            </Campo>
            <Campo label="Vista previa" full>
              <div className="h-14 bg-surface-50 rounded-lg border border-surface-200 flex items-center px-4">
                <img src={cfg.logo_path} alt="Logo" className="h-9 object-contain max-w-[200px]"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
                <span className="text-xs text-navy/30 hidden">Logo no encontrado</span>
              </div>
            </Campo>
          </Seccion>

          <Seccion titulo="Defaults de presupuestos" icon={FileText}>
            <Campo label="Prefijo número">
              <input className="input-field font-mono" value={cfg.presupuesto_prefijo||''} onChange={e => set('presupuesto_prefijo', e.target.value)} placeholder="PRES" />
            </Campo>
            <Campo label="Validez (días)">
              <input className="input-field" type="number" min="1" value={cfg.presupuesto_validez_dias||30} onChange={e => set('presupuesto_validez_dias', Number(e.target.value))} />
            </Campo>
            <Campo label="IVA por defecto" full>
              <div className="flex gap-2">
                {[0,4,10,21].map(v => (
                  <button key={v} onClick={() => set('presupuesto_iva_pct', v)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      Number(cfg.presupuesto_iva_pct)===v ? 'bg-navy text-gold border-navy' : 'border-surface-200 text-navy/50 hover:border-navy/20'
                    }`}>{v}%</button>
                ))}
              </div>
            </Campo>
            <Campo label="Moneda">
              <select className="input-field" value={cfg.moneda||'EUR'} onChange={e => set('moneda', e.target.value)}>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="USD">USD — Dólar ($)</option>
                <option value="GBP">GBP — Libra (£)</option>
              </select>
            </Campo>
            <Campo label="Condiciones por defecto" full>
              <textarea rows={3} className="input-field resize-none" value={cfg.presupuesto_condiciones||''} onChange={e => set('presupuesto_condiciones', e.target.value)} />
            </Campo>
            <Campo label="Pie de página PDF" full>
              <input className="input-field" value={cfg.presupuesto_pie||''} onChange={e => set('presupuesto_pie', e.target.value)} placeholder="Gracias por confiar en LetDev." />
            </Campo>
          </Seccion>
        </div>

        {/* Preview desktop — sticky */}
        <div className="hidden lg:block sticky top-6">
          <Card>
            <Card.Header>
              <h2 className="font-display font-semibold text-navy text-sm">Preview en tiempo real</h2>
            </Card.Header>
            <Card.Body><PdfPreview cfg={cfg} /></Card.Body>
          </Card>
          <p className="text-xs text-navy/25 text-center mt-2">Se actualiza mientras escribes</p>
        </div>
      </div>
    </div>
  )
}
