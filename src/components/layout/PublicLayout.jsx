import { Outlet, Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { LetDevLogo } from '@/components/Navbar'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="bg-navy-deeper border-t border-white/6">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">

            {/* Logo + tagline */}
            <div className="flex flex-col gap-3">
              
              <LetDevLogo />
              <p className="text-white/30 text-xs max-w-xs leading-relaxed">
                Desarrollo web y soluciones digitales a medida.<br />
                Alicante, España.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/30">
              <a href="/#servicios" className="hover:text-white/60 transition-colors">Servicios</a>
              <a href="/#sobre-mi"  className="hover:text-white/60 transition-colors">Sobre mí</a>
              <a href="/#proyectos" className="hover:text-white/60 transition-colors">Proyectos</a>
              <Link to="/login" className="hover:text-white/60 transition-colors">· Intranet</Link>
            </div>
          </div>

          <div className="border-t border-white/6 mt-8 pt-6">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} LetDev — Yeray Navarro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
