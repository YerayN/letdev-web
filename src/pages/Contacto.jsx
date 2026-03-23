import { useState } from 'react'
import { Mail, MessageSquare, Send } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Contacto() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí conectarás tu lógica de envío: Supabase, Resend, lo que uses
    console.log('Formulario enviado:', form)
    setSent(true)
  }

  return (
    <div className="pt-24 min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div>
            <p className="text-gold font-mono text-sm tracking-widest uppercase mb-4">Contacto</p>
            <h1 className="font-display font-extrabold text-4xl text-navy mb-4">
              Hablemos de tu proyecto
            </h1>
            <p className="text-navy/50 leading-relaxed mb-8">
              Sin formularios kilométricos. Cuéntanos qué tienes en mente y te respondemos en menos de 24 horas.
            </p>
            <div className="space-y-3">
              <a href="mailto:hola@letdev.es" className="flex items-center gap-3 text-navy/60 hover:text-navy transition-colors">
                <Mail size={18} className="text-gold shrink-0" />
                hola@letdev.es
              </a>
              <a href="#" className="flex items-center gap-3 text-navy/60 hover:text-navy transition-colors">
                <MessageSquare size={18} className="text-gold shrink-0" />
                WhatsApp / Telegram
              </a>
            </div>
          </div>

          {/* Formulario */}
          {sent ? (
            <div className="bg-white rounded-2xl p-8 border border-surface-200 text-center">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={22} className="text-gold" />
              </div>
              <h3 className="font-display font-semibold text-navy text-lg mb-2">¡Mensaje enviado!</h3>
              <p className="text-navy/40 text-sm">Te respondemos en menos de 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-surface-200 space-y-5">
              {[
                { name: 'nombre', label: 'Tu nombre', type: 'text', placeholder: 'Ana García' },
                { name: 'email',  label: 'Email',     type: 'email', placeholder: 'ana@empresa.com' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-navy/60 mb-1.5">{label}</label>
                  <input
                    type={type}
                    name={name}
                    required
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm text-navy placeholder:text-navy/20 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-navy/60 mb-1.5">¿En qué podemos ayudarte?</label>
                <textarea
                  name="mensaje"
                  required
                  value={form.mensaje}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Cuéntanos brevemente tu proyecto o duda..."
                  className="w-full border border-surface-200 rounded-lg px-4 py-2.5 text-sm text-navy placeholder:text-navy/20 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all resize-none"
                />
              </div>
              <Button type="submit" className="w-full" icon={Send}>
                Enviar mensaje
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
