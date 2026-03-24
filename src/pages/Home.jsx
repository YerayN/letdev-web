import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Monitor, Zap, Users, Wrench, Shield, MessagesSquare,
  ArrowRight, Github, Linkedin, Instagram, Mail, Phone,
  CheckCircle2, Code2, Database, Smartphone,
} from 'lucide-react'

// ── Icono SVG del logomark ─────────────────────────────────────────────
function LogoMark({ size = 44, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className}>
      <rect width="44" height="44" rx="11" fill="rgba(240,196,25,0.15)" />
      <path d="M16 13L10 22L16 31" stroke="#F0C419" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 13L34 22L28 31" stroke="#F0C419" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="22" cy="22" r="2.5" fill="#F0C419"/>
    </svg>
  )
}

// ── Categorías de servicios con sus cards ─────────────────────────────
const CATEGORIAS = [
  { key: 'web',          label: 'Diseño Web',        icon: Monitor },
  { key: 'auto',         label: 'Automatización',     icon: Zap },
  { key: 'acompanamiento',label: 'Acompañamiento',    icon: Users },
  { key: 'software',     label: 'Software a medida',  icon: Code2 },
]

const SERVICIOS = {
  web: [
    {
      titulo:   'Página web profesional',
      desc:     'Web limpia, rápida y adaptada a móvil para mostrar tu negocio al mundo con buena imagen.',
      precio:   'Desde 50 €',
      incluye:  ['Diseño personalizado', 'Adaptable a móvil', 'Entrega en < 1 semana'],
    },
    {
      titulo:   'Landing page de conversión',
      desc:     'Una sola página optimizada para que los visitantes se conviertan en clientes o contactos.',
      precio:   'Desde 80 €',
      incluye:  ['Diseño orientado a venta', 'Formulario de contacto', 'SEO básico incluido'],
    },
    {
      titulo:   'Mantenimiento mensual',
      desc:     'Paquete mensual: actualizaciones de seguridad, copias de seguridad y soporte continuo.',
      precio:   '20 €/mes',
      incluye:  ['Backups semanales', 'Actualizaciones', 'Soporte por WhatsApp'],
    },
  ],
  auto: [
    {
      titulo:   'Automatización de gestión',
      desc:     'Chatbots, gestión de inventario, facturas automáticas... si lo haces a mano cada semana, lo automatizamos.',
      precio:   'Desde 30 €',
      incluye:  ['Análisis del flujo de trabajo', 'Implementación completa', 'Formación de uso'],
    },
    {
      titulo:   'Integraciones entre apps',
      desc:     'Conecta tus herramientas (WhatsApp, Google Sheets, tu CRM...) para que hablen entre ellas sin que tú hagas nada.',
      precio:   'Desde 40 €',
      incluye:  ['Google Sheets · Notion · WhatsApp', 'Sin código para ti', 'Entrega rápida'],
    },
    {
      titulo:   'Tareas administrativas digitales',
      desc:     'Entrada de datos, gestión de archivos, automatización de hojas de cálculo. Por horas, sin compromiso.',
      precio:   '15 €/hora',
      incluye:  ['Sin permanencia', 'Presupuesto previo', 'Trabajo remoto'],
    },
  ],
  acompanamiento: [
    {
      titulo:   'Arreglo rápido (Code Fix)',
      desc:     'Algo falla, no sabes qué es, necesitas una solución ya. Dímelo y lo resolvemos en horas.',
      precio:   '15 €/hora',
      incluye:  ['Diagnóstico incluido', 'Presupuesto antes de empezar', 'Solución documentada'],
    },
    {
      titulo:   'Mentoría técnica',
      desc:     'Estás aprendiendo y necesitas a alguien que te explique las cosas sin tecnicismos. Aquí estoy.',
      precio:   '20 €/hora',
      incluye:  ['Sesión por videollamada', 'Materiales de apoyo', 'Seguimiento post-sesión'],
    },
    {
      titulo:   'Consultoría de proyecto',
      desc:     'No sabes cómo arrancar o qué herramientas usar. Te ayudo a decidir el camino técnico correcto.',
      precio:   'A consultar',
      incluye:  ['Análisis de necesidades', 'Propuesta técnica', 'Sin compromiso inicial'],
    },
  ],
  software: [
    {
      titulo:   'Aplicación web a medida',
      desc:     'Si necesitas algo que no existe, lo construimos desde cero. Presupuesto cerrado, sin sorpresas.',
      precio:   'A consultar',
      incluye:  ['Análisis funcional', 'Desarrollo iterativo', 'Entrega con documentación'],
    },
    {
      titulo:   'App móvil (Android/iOS)',
      desc:     'Aplicación nativa o multiplataforma. React Native para lanzar en ambas plataformas desde una base.',
      precio:   'A consultar',
      incluye:  ['Prototipo antes de desarrollar', 'Publicación en stores', 'Soporte post-lanzamiento'],
    },
    {
      titulo:   'Integración con IA',
      desc:     'Añade capacidades de inteligencia artificial a tu negocio: chatbots, análisis de datos, asistentes.',
      precio:   'A consultar',
      incluye:  ['Caso de uso definido', 'Integración limpia', 'Sin vendor lock-in'],
    },
  ],
}

// ── Proyectos ──────────────────────────────────────────────────────────
const PROYECTOS = [
  {
    img:    '/src/ladespensa.png',
    nombre: 'La Despensa',
    desc:   'App que gestiona recetas, planifica comidas semanales y genera listas de la compra automáticamente.',
    tags:   ['Kotlin', 'Android Studio'],
    demo:   'https://yeraynavarro.com/proyectos/proyecto-1.html',
    repo:   '#',
  },
  {
    img:    '/src/viveaigues.png',
    nombre: 'Protección Civil Aigües',
    desc:   'Web pública con avisos a la población e intranet de gestión de voluntarios con fichaje e inventario.',
    tags:   ['HTML', 'CSS', 'JS', 'Supabase'],
    demo:   'https://yeraynavarro.com/proyectos/proyecto-2.html',
    repo:   '#',
  },
  {
    img:    '/src/zoavet.png',
    nombre: 'Plataforma Ciudadana',
    desc:   'Participación activa de la ciudadanía. El gobierno local recibe feedback para mejorar su gestión.',
    tags:   ['Python', 'HTML', 'CSS', 'JS'],
    demo:   'https://yeraynavarro.com/proyectos/proyecto-3.html',
    repo:   '#',
  },
]

// ── Garantías ──────────────────────────────────────────────────────────
const GARANTIAS = [
  { icon: '💰', titulo: 'Precio cerrado',   desc: 'Sin costes ocultos ni sorpresas en la factura. El presupuesto que acordamos es el que pagas.' },
  { icon: '⚡', titulo: 'Entrega rápida',   desc: 'Proyectos sencillos listos en menos de una semana. Sin burocracia, sin esperas innecesarias.' },
  { icon: '🤝', titulo: 'Trato directo',    desc: 'Hablas conmigo, sin intermediarios ni robots. Soy Yeray y me responsabilizo de cada proyecto.' },
]


export default function Home() {
  const [catActiva, setCatActiva] = useState('web')

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="min-h-screen bg-navy flex items-center relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-100" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(ellipse_at_top_right,_rgba(240,196,25,0.09)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div>
              {/* Badge disponibilidad */}
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Disponible para nuevos proyectos</span>
              </div>

              <p className="text-white/55 text-sm font-mono mb-3 tracking-wide">
                Yeray Navarro · Tu programador de confianza
              </p>

              <h1 className="font-display font-extrabold text-[48px] md:text-[58px] text-white leading-[1.0] tracking-tight mb-5">
                Webs y código<br />
                que entienden<br />
                tu <span className="text-gold">negocio.</span>
              </h1>

              <p className="text-white/50 text-base leading-relaxed max-w-md mb-8">
                Ayudo a negocios y profesionales a digitalizarse con honestidad y cercanía.
                Vengo de un sector donde la <strong className="text-white/70">responsabilidad</strong> es
                lo primero, y aplico esa misma ética a cada línea de código que escribo.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Hablemos de tu proyecto <ArrowRight size={15} />
                </Link>
                <a
                  href="#proyectos"
                  className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 text-white font-medium text-sm px-6 py-3 rounded-xl border border-white/12 transition-colors"
                >
                  Ver mis trabajos <ArrowRight size={15} />
                </a>
              </div>

              {/* Redes sociales */}
              <div className="flex gap-3">
                {[
                  { href: 'https://github.com/YerayN', label: 'GitHub', icon: Github },
                  { href: 'https://www.linkedin.com/in/yeray-navarro/', label: 'LinkedIn', icon: Linkedin },
                  { href: 'https://www.instagram.com/yeraynavarroy_/', label: 'Instagram', icon: Instagram },
                ].map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/6 hover:bg-white/12 border border-white/10 flex items-center justify-center text-white/55 hover:text-white transition-all"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Visual derecho — logo grande con anillos decorativos */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                {/* Anillos decorativos */}
                <div className="absolute inset-0 rounded-full border border-gold/8 scale-[1.6]" />
                <div className="absolute inset-0 rounded-full border border-gold/5 scale-[2.2]" />
                <div className="absolute inset-0 rounded-full border border-gold/3 scale-[2.8]" />

                
                <img
                      src="/images/logo.png"
                      alt="LetDev"
                      className="w-48 h-48 object-contain drop-shadow-[0_0_40px_rgba(240,196,25,0.15)]"
                    />

                {/* Chips flotantes */}
                <div className="absolute -top-4 -right-8 bg-white rounded-xl px-3 py-2 shadow-card text-xs font-mono text-navy font-semibold border border-surface-200 whitespace-nowrap">
                  Precio cerrado ✓
                </div>
                <div className="absolute -bottom-4 -left-10 bg-navy-light/90 rounded-xl px-3 py-2 text-xs font-mono text-gold border border-white/10 whitespace-nowrap">
                  &lt;LetDev /&gt;
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SERVICIOS ─────────────────────────────────────────────── */}
      <section id="servicios" className="py-24 bg-surface-50">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-12">
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Servicios</p>
            <h2 className="font-display font-bold text-[34px] text-navy tracking-tight leading-tight mb-3">
              Soluciones reales para<br />
              <span className="text-navy/55">negocios que avanzan.</span>
            </h2>
            <p className="text-navy/60 max-w-md mx-auto text-sm">
              Sin palabras raras y con compromiso total. Elige cómo quieres empezar.
            </p>
          </div>

          {/* Pills de categorías */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIAS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCatActiva(key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  catActiva === key
                    ? 'bg-navy text-gold border-navy shadow-sm'
                    : 'bg-white text-navy/50 border-surface-200 hover:border-navy/20 hover:text-navy'
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>

          {/* Cards de la categoría activa */}
          <div className="grid md:grid-cols-3 gap-5">
            {SERVICIOS[catActiva].map(({ titulo, desc, precio, incluye }) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl border border-surface-200 p-6 hover:border-gold/30 hover:shadow-card-hover transition-all flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-navy text-[16px] tracking-tight mb-2">
                    {titulo}
                  </h3>
                  <p className="text-navy/60 text-sm leading-relaxed mb-4">{desc}</p>
                  <ul className="space-y-1.5 mb-5">
                    {incluye.map(item => (
                      <li key={item} className="flex items-start gap-2 text-xs text-navy/55">
                        <CheckCircle2 size={13} className="text-gold shrink-0 mt-0.5" strokeWidth={2} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-surface-100 pt-4 flex items-center justify-between">
                  <span className="font-display font-bold text-navy text-lg tracking-tight">{precio}</span>
                  <Link
                    to="/contacto"
                    className="text-xs font-semibold text-gold hover:text-gold-dark transition-colors flex items-center gap-1"
                  >
                    Pedir info <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Franja de garantías */}
          <div className="mt-12 bg-navy rounded-2xl p-6 grid md:grid-cols-3 gap-6">
            {GARANTIAS.map(({ icon, titulo, desc }) => (
              <div key={titulo} className="flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="font-display font-semibold text-white text-sm tracking-tight mb-1">{titulo}</p>
                  <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE MÍ ──────────────────────────────────────────────── */}
      <section id="sobre-mi" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Visual izquierda */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Marco decorativo */}
                <div className="w-64 h-80 rounded-2xl bg-surface-100 border border-surface-200 overflow-hidden flex items-center justify-center">
                  {/* Placeholder foto — reemplázalo con tu <img src="..."> */}
                  <img src="/images/foto-frontal.png" alt="FotoFrontal" className="w-full h-full object-cover object-top" />
                </div>
                {/* Chip de localización */}
                <div className="absolute -bottom-3 -right-3 bg-white border border-surface-200 rounded-xl px-3 py-2 shadow-card text-xs font-mono text-navy/60">
                  📍 Alicante, España
                </div>
              </div>
            </div>

            {/* Texto derecha */}
            <div>
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">Sobre mí</p>
              <h2 className="font-display font-bold text-[32px] text-navy tracking-tight leading-tight mb-5">
                Tu socio técnico<br />de confianza.
              </h2>
              <div className="space-y-4 text-navy/55 text-sm leading-relaxed">
                <p>
                  Soy <strong className="text-navy">Yeray Navarro</strong>, y fundé LetDev para acabar con
                  la complejidad y los presupuestos sorpresa del mundo digital.
                </p>
                <p>
                  Vengo del sector sanitario, donde la claridad y la seriedad son vitales. Ahora aplico esa
                  misma mentalidad: trato directo, proyectos bien definidos y{' '}
                  <strong className="text-navy">presupuestos 100% cerrados desde el principio.</strong>
                </p>
                <p>
                  Si buscas una solución ágil, honesta y sin tecnicismos, has llegado al sitio correcto.
                </p>
              </div>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 mt-7 bg-navy text-gold font-semibold text-sm px-5 py-3 rounded-xl hover:bg-navy-light transition-colors"
              >
                Hablemos <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROYECTOS ─────────────────────────────────────────────── */}
      <section id="proyectos" className="py-24 bg-surface-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Proyectos</p>
            <h2 className="font-display font-bold text-[34px] text-navy tracking-tight mb-3">
              Lo que he construido
            </h2>
            <p className="text-navy/60 text-sm max-w-md mx-auto">
              Algunos proyectos en los que he puesto el alma, cada uno con su historia.
            </p>
          </div>

          {/* Grid 2 columnas — cards grandes con captura de pantalla protagonista */}
          <div className="grid md:grid-cols-2 gap-6">
            {PROYECTOS.map(({ img, nombre, desc, tags, demo, repo }) => (
              <div
                key={nombre}
                className="bg-white rounded-2xl border border-surface-200 overflow-hidden hover:border-gold/30 hover:shadow-card-hover transition-all flex flex-col group"
              >
                {/* Captura de pantalla grande — ocupa casi la mitad de la card */}
                <div className="h-56 bg-surface-100 overflow-hidden relative">
                  <img
                    src={img}
                    alt={nombre}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Gradiente sutil al pie de la imagen para separar del body */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/20 to-transparent" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map(t => (
                      <span
                        key={t}
                        className="text-[10px] px-2.5 py-0.5 bg-surface-100 text-navy/55 rounded-md font-mono border border-surface-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="font-display font-semibold text-navy text-[17px] tracking-tight mb-2">{nombre}</p>
                  <p className="text-navy/60 text-sm leading-relaxed flex-1 mb-5">{desc}</p>

                  <div className="flex gap-2">
                    <a
                      href={demo}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-navy text-gold text-sm font-semibold py-2.5 rounded-xl hover:bg-navy-light transition-colors"
                    >
                      Demo <ArrowRight size={13} />
                    </a>
                    <a
                      href={repo}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 border border-surface-200 text-navy/50 text-sm font-semibold py-2.5 rounded-xl hover:border-navy/20 hover:text-navy transition-all"
                    >
                      <Github size={14} /> GitHub
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ──────────────────────────────────────────────── */}
      <section id="contacto" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Contacto</p>
            <h2 className="font-display font-bold text-[34px] text-navy tracking-tight mb-3">¿Hablamos?</h2>
            <p className="text-navy/60 text-sm">Cuéntame tu proyecto y te respondo en menos de 24 horas.</p>
          </div>

          <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">

            {/* Formulario en su propia card */}
            <div className="bg-surface-50 rounded-2xl border border-surface-200 p-7">
              <ContactForm />
            </div>

            {/* Columna lateral de contacto */}
            <div className="flex flex-col gap-3 md:pt-0">
              <a
                href="mailto:yeraynavarroyanini@gmail.com"
                className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 bg-surface-50 hover:border-gold/30 hover:translate-x-1 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-gold" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-navy/50 mb-0.5">Email</p>
                  <p className="text-sm font-medium text-navy">yeraynavarroyanini@gmail.com</p>
                </div>
              </a>

              <a
                href="tel:+34637659355"
                className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 bg-surface-50 hover:border-gold/30 hover:translate-x-1 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-gold" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-navy/50 mb-0.5">Teléfono</p>
                  <p className="text-sm font-medium text-navy">+34 637 659 355</p>
                </div>
              </a>

              <a
                href="https://wa.me/34637659355"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Escríbeme por WhatsApp
              </a>

              {/* Redes */}
              <div className="flex gap-2 pt-1">
                {[
                  { href: 'https://github.com/YerayN', icon: Github,    label: 'GitHub'    },
                  { href: 'https://www.linkedin.com/in/yeray-navarro/', icon: Linkedin, label: 'LinkedIn' },
                  { href: 'https://www.instagram.com/yeraynavarroy_/',  icon: Instagram, label: 'Instagram'},
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex-1 h-10 rounded-lg border border-surface-200 flex items-center justify-center text-navy/30 hover:text-navy hover:border-navy/20 transition-all"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ── Formulario con envío a Telegram ───────────────────────────────────
function ContactForm() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })
  const [estado,  setEstado]  = useState('idle') // idle | loading | ok | error

  const handleChange = e => setForm({ ...form, [e.target.id]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setEstado('loading')

    const TOKEN   = '8167286088:AAGXJe2CI-H7_4yjexrJHjJMXjFqLk1NFXc'
    const CHAT_ID = '1198285640'
    const texto   = `<b>🚀 Nuevo mensaje — LetDev</b>\n\n<b>👤 Nombre:</b> ${form.name}\n<b>📧 Email:</b> ${form.email}\n<b>📋 Asunto:</b> ${form.subject}\n<b>💬 Mensaje:</b>\n${form.message}`
    const url     = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(texto)}&parse_mode=HTML`

    try {
      const res = await fetch(url)
      if (res.ok) {
        setEstado('ok')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setEstado('error')
      }
    } catch {
      setEstado('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'name',  label: 'Nombre',       type: 'text',  placeholder: 'Tu nombre' },
          { id: 'email', label: 'Email',         type: 'email', placeholder: 'tu@email.com' },
        ].map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-navy/55 mb-1.5">{label}</label>
            <input
              id={id} type={type} required
              value={form[id]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm text-navy placeholder:text-navy/20 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-navy/55 mb-1.5">Asunto</label>
        <input
          id="subject" type="text" required
          value={form.subject}
          onChange={handleChange}
          placeholder="¿En qué puedo ayudarte?"
          className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm text-navy placeholder:text-navy/20 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-navy/55 mb-1.5">Mensaje</label>
        <textarea
          id="message" required rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Cuéntame tu proyecto, idea o duda..."
          className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm text-navy placeholder:text-navy/20 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={estado === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60"
      >
        {estado === 'loading' ? (
          <span className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
        ) : (
          <>Enviar mensaje <ArrowRight size={15} /></>
        )}
      </button>

      {estado === 'ok' && (
        <p className="text-center text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg py-2.5 animate-fade-in">
          ✓ Mensaje enviado. Te respondo muy pronto.
        </p>
      )}
      {estado === 'error' && (
        <p className="text-center text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg py-2.5 animate-fade-in">
          Hubo un error. Escríbeme por WhatsApp directamente.
        </p>
      )}
    </form>
  )
}
