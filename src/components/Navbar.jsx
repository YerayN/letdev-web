import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

// Orden correcto: Servicios · Sobre mí · Proyectos · Contacto
const NAV_LINKS = [
  { to: '/#servicios', label: 'Servicios' },
  { to: '/#sobre-mi',  label: 'Sobre mí'  },
  { to: '/#proyectos', label: 'Proyectos' },
]

// ── LOGO ──────────────────────────────────────────────────────────────
// Para usar tu imagen real, sustituye el <svg> por:
//   <img src="/src/logo.png" alt="LetDev" className="h-8 w-auto" />
// El componente acepta `dark` por si lo usas sobre fondos claros en el futuro.
export function LetDevLogo({ dark = false, className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* ─── REEMPLAZA ESTO CON TU LOGO ───────────────────────────
          <img src="/src/logo.png" alt="LetDev" className="h-8 w-auto" />
          ──────────────────────────────────────────────────────── */}
      <img src="/public/images/logo.png" alt="LetDev" className="h-8 w-auto" />
      <span className={`font-display font-bold text-[19px] tracking-tight leading-none ${dark ? 'text-navy' : 'text-white'}`}>
        Let<span className="text-gold">Dev</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-navy shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.28)]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">

        {/* Logo — izquierda */}
        <LetDevLogo />

        {/* Links — empujados a la derecha con ml-auto */}
        <ul className="hidden md:flex items-center gap-0.5 ml-auto">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <a
                href={to}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all"
              >
                {label}
              </a>
            </li>
          ))}

          {/* Contacto con fondo gold — el CTA del nav */}
          <li className="ml-2">
            <a
              href="/#contacto"
              className="inline-flex items-center gap-1.5 bg-gold hover:bg-gold-light text-navy font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Contacto →
            </a>
          </li>
        </ul>

        {/* Hamburger móvil */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden ml-auto text-white/70 hover:text-white p-1 transition-colors"
          aria-label="Menú"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-navy-dark border-t border-white/8 px-6 py-4 flex flex-col gap-1 animate-slide-up">
          {NAV_LINKS.map(({ to, label }) => (
            <a
              key={to}
              href={to}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/6 transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="/#contacto"
            onClick={() => setMenuOpen(false)}
            className="mt-3 text-center bg-gold text-navy font-semibold text-sm px-4 py-2.5 rounded-lg"
          >
            Contacto →
          </a>
        </div>
      )}
    </header>
  )
}
