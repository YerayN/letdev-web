import { createClient } from '@supabase/supabase-js'

// Estas variables viven en tu .env.local — nunca las subas a Git
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Faltan las variables de Supabase. Crea un archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Que Supabase guarde la sesión en localStorage automáticamente
    persistSession: true,
    autoRefreshToken: true,
  },
})
