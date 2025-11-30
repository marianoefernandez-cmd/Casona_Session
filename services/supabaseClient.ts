// ========================================================================
// SECCIÓN: CLIENTE DE SUPABASE
// ========================================================================
// NOTA ACLARATORIA: Este archivo es el ÚNICO lugar donde se configura la conexión con Supabase.
// Cualquier otro archivo que necesite hablar con la base de datos, importará el 'supabase' de aquí.

import { createClient } from '@supabase/supabase-js'

// 1. Leemos las variables de entorno del archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. DIAGNÓSTICO: Mostramos en la consola del navegador si las claves se están leyendo correctamente.
// Esto nos ayudará a verificar que el archivo .env.local funciona.
console.log("Supabase URL leída:", supabaseUrl);
console.log("Supabase Key (primeros 5 caracteres):", supabaseAnonKey?.substring(0, 5));

// 3. Verificación de errores.
if (!supabaseUrl || !supabaseAnonKey) {
  // Si alguna de las claves no se encuentra, lanzamos un error claro en la consola.
  console.error("¡ERROR CRÍTICO! Las variables de entorno de Supabase no están definidas.");
  console.error("Asegúrate de tener un archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
}

// 4. Creamos y exportamos la instancia del cliente de Supabase.
// Esta es la variable 'supabase' que importaremos en nuestras páginas (Admin, ComprarEntrada, etc.).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
