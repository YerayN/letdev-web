import { Code2, Layers, Zap, Database, Globe, Smartphone } from 'lucide-react'
import Button from '@/components/ui/Button'

const SERVICIOS = [
  {
    icon: Code2,
    title: 'Desarrollo web a medida',
    desc: 'Aplicaciones React, Next.js o Vue construidas con el stack que tu proyecto necesita. Nada de plantillas, todo hecho para ti.',
    tags: ['React', 'Next.js', 'Node.js'],
  },
  {
    icon: Smartphone,
    title: 'Apps móviles',
    desc: 'React Native para lanzar en iOS y Android desde una sola base de código. Rápido de desarrollar, fácil de mantener.',
    tags: ['React Native', 'Expo'],
  },
  {
    icon: Database,
    title: 'Backend y APIs',
    desc: 'APIs REST o GraphQL, bases de datos relacionales o NoSQL. Arquitectura sólida desde el día uno.',
    tags: ['Supabase', 'PostgreSQL', 'REST'],
  },
  {
    icon: Layers,
    title: 'Arquitectura técnica',
    desc: 'Si tienes un producto que escala y no sabes cómo estructurarlo, aquí es donde entramos. Auditorías, refactors y diseño de sistemas.',
    tags: ['Auditoría', 'Refactor', 'Cloud'],
  },
  {
    icon: Zap,
    title: 'Automatización',
    desc: 'Flujos automáticos que eliminan trabajo manual: integraciones entre herramientas, bots, procesos de datos.',
    tags: ['Zapier', 'n8n', 'Scripts'],
  },
  {
    icon: Globe,
    title: 'Consultoría tecnológica',
    desc: 'No sabes qué stack elegir o cómo afrontar un reto técnico concreto. Te acompañamos en la decisión.',
    tags: ['Estrategia', 'Tech lead'],
  },
]

export default function Servicios() {
  return (
    <div className="pt-24">
      {/* Header */}
      <section className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#F0C419_0%,_transparent_50%)] opacity-5" />
        <div className="relative max-w-6xl mx-auto px-6">
          <p className="text-gold font-mono text-sm tracking-widest uppercase mb-4">Lo que hacemos</p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white leading-tight">
            Servicios
          </h1>
          <p className="text-white/50 mt-4 max-w-lg text-lg">
            Sin paquetes fijos. Cada proyecto es distinto y lo tratamos como tal.
          </p>
        </div>
      </section>

      {/* Grid de servicios */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICIOS.map(({ icon: Icon, title, desc, tags }) => (
              <div
                key={title}
                className="bg-white p-6 rounded-2xl border border-surface-200 hover:border-gold/30 hover:shadow-card-hover transition-all group"
              >
                <div className="w-11 h-11 bg-navy/5 group-hover:bg-gold/10 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon size={22} className="text-navy group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-navy text-lg mb-2">{title}</h3>
                <p className="text-navy/50 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 bg-surface-100 text-navy/50 rounded-full font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-navy mb-4">
            ¿Tu proyecto no encaja en ninguna caja?
          </h2>
          <p className="text-navy/50 mb-8">
            Mejor. Cuéntanos qué necesitas y buscamos la solución juntos.
          </p>
          <Button size="lg">Hablar con el equipo</Button>
        </div>
      </section>
    </div>
  )
}
