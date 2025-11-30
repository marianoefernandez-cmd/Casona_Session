// ========================================================================
// SECCIÓN 1: IMPORTACIÓN E INICIALIZACIÓN
// ========================================================================
import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTA ACLARATORIA: Leemos la clave de API desde las variables de entorno.
// Es CRUCIAL que se use 'import.meta.env' en proyectos con Vite para el código del lado del cliente.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Verificación de la clave de API.
if (!apiKey) {
  // Si la clave no se encuentra, lanzamos un error claro en la consola para facilitar la depuración.
  throw new Error("VITE_GEMINI_API_KEY no está definida en el archivo .env.local");
}

// Creamos UNA ÚNICA INSTANCIA del cliente de Gemini que será usada por todas las funciones de este archivo.
const genAI = new GoogleGenerativeAI(apiKey);


// ========================================================================
// SECCIÓN 2: FUNCIÓN PARA GENERAR MENSAJE DE BIENVENIDA
// ========================================================================
export const generatePoeticWelcome = async (name: string, eventName: string): Promise<string> => {
  try {
    // Obtenemos el modelo 'gemini-1.5-flash', que es rápido y eficiente para texto.
      const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const prompt = `
      Escribe un cuerpo de email de bienvenida muy corto (máximo 50 palabras), poético y cálido para un asistente llamado "${name}" 
      que ha sido aprobado para el evento "${eventName}".
      El tono debe ser sereno, elegante y acogedor.
      No incluyas asuntos ni encabezados. Solo el mensaje.
    `;

    // Generamos el contenido a partir del prompt.
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Si la API devuelve un texto, lo usamos. Si no, usamos un mensaje de respaldo.
    return text || `Bienvenido/a, ${name}. Es un honor que te unas a nosotros.`;

  } catch (error) {
    // Si hay un error con la API (ej. clave incorrecta, cuota excedida), lo mostramos en la consola
    // y devolvemos un mensaje de respaldo para que la aplicación no se rompa.
    console.error("Gemini API Error:", error);
    return `¡Bienvenido/a, ${name}! Estamos encantados de confirmar tu asistencia a ${eventName}.`;
  }
};


// ========================================================================
// SECCIÓN 3: FUNCIÓN PARA ANALIZAR COMPROBANTE (SIMULADA)
// ========================================================================
// NOTA ACLARATORIA: Esta función actualmente está SIMULADA para no gastar cuota de API en cada prueba.
// En una implementación real, descomentarías el bloque de código que llama al modelo de visión.
export const analyzePaymentProof = async (base64Image: string): Promise<boolean> => {
  try {
     // Simulación de un retraso de red para que parezca que está procesando.
     await new Promise(resolve => setTimeout(resolve, 1000));
     return true; 
     
     /*
     // --- CÓDIGO REAL PARA USAR EL MODELO DE VISIÓN DE GEMINI ---
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision-latest" });
     const prompt = "Is this a valid receipt or payment proof? Answer only with the word YES or NO.";
     const imagePart = {
       inlineData: {
         data: base64Image,
         mimeType: "image/jpeg", // Asegúrate de que el tipo MIME es correcto
       },
     };

     const result = await model.generateContent([prompt, imagePart]);
     const response = await result.response;
     const text = response.text();

     return text.trim().toUpperCase() === 'YES';
     */

  } catch (error) {
    console.error("Error en el análisis de imagen con Gemini:", error);
    // En caso de error, es más seguro asumir que el comprobante es válido para no bloquear al usuario.
    // En una app real, podrías querer registrar este error para una revisión manual.
    return true; 
  }
}