// ========================================================================
// FUNCIÓN SERVERLESS: send-approval-email
// ========================================================================
// NOTA ACLARATORIA: Este código se ejecuta en los servidores de Supabase (Deno), no en el navegador.

// --- SECCIÓN 1: IMPORTACIONES ---

// Módulo estándar de Deno para crear un servidor HTTP.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// La librería 'resend', importada de una manera compatible con Deno.
import { Resend } from "npm:resend";

// --- SECCIÓN 2: LÓGICA PRINCIPAL DE LA FUNCIÓN ---

console.log("Función 'send-approval-email' está activa y esperando peticiones.");

// 'serve' inicia el servidor que escuchará las llamadas del webhook de Supabase.
serve(async (req) => {
  try {
    // 1. OBTENER DATOS DEL REGISTRO:
    // El webhook de Supabase nos envía un JSON con información sobre el cambio.
    // 'record' contiene la fila de la tabla 'registrations' que fue actualizada.
    const { record } = await req.json();
    console.log(`Petición recibida para el registro con email: ${record.email}`);

    // 2. OBTENER LA CLAVE DE API DE RESEND:
    // Leemos la clave secreta que guardamos en Supabase. NUNCA se escribe directamente en el código.
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error("Variable de entorno RESEND_API_KEY no encontrada.");
    }

    // 3. VERIFICACIÓN DE SEGURIDAD:
    // Nos aseguramos de que solo actuamos cuando un registro es APROBADO.
    if (record.status !== 'APPROVED') {
      console.log(`Estado del registro es '${record.status}', no 'APPROVED'. No se enviará correo.`);
      // Devolvemos una respuesta exitosa para que Supabase no reintente la llamada.
      return new Response(JSON.stringify({ message: "No es una aprobación, no se envía correo." }), { status: 200 });
    }
    
    // INICIALIZAR RESEND: Creamos la instancia del cliente de Resend con la clave.
    const resend = new Resend(resendApiKey);

    // 4. CREAR EL CONTENIDO DEL CORREO:
    // Usamos HTML para darle un formato bonito al correo.
    const emailHtml = `
      <html>
        <body style="font-family: sans-serif;">
          <h1>¡Felicidades, ${record.fullName}!</h1>
          <p>Tu asistencia a <strong>ÚLTIMA Cassona Session 2025</strong> ha sido confirmada.</p>
          <p><em>"${record.welcomeMessage}"</em></p>
          <p>Tu código de ticket es: <strong>${record.ticketCode}</strong></p>
          <p>Puedes ver y guardar tu ticket digital con el código QR en el siguiente enlace:</p>
          <a 
            href="https://casona-session.vercel.app/#/ticket/${record.ticketCode}" 
            style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;"
          >
            Ver mi Ticket Digital
          </a>
          <p>¡Nos vemos pronto!</p>
        </body>
      </html>
    `;

    // 5. ENVIAR EL CORREO USANDO RESEND:
    console.log(`Intentando enviar correo a ${record.email}...`);
    const { data, error } = await resend.emails.send({
      from: 'Cassona Session <onboarding@resend.dev>', // IMPORTANTE: Usa 'onboarding@resend.dev' para pruebas. En producción, usa tu dominio verificado.
      to: [record.email],
      subject: `¡Tu entrada para ÚLTIMA Cassona Session 2025 está confirmada!`,
      html: emailHtml,
    });

    if (error) {
      // Si Resend devuelve un error, lo lanzamos para que lo capture el 'catch'.
      throw error;
    }

    console.log("Correo enviado con éxito. ID de Resend:", data.id);

    // 6. DEVOLVER RESPUESTA EXITOSA:
    // Le decimos a Supabase que todo ha salido bien.
    return new Response(JSON.stringify({ success: true, messageId: data.id }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // 7. MANEJO DE ERRORES:
    // Si algo falla en cualquier punto, lo capturamos aquí.
    console.error("Error general en la función:", error);
    // Devolvemos una respuesta de error para que Supabase sepa que algo salió mal.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500, // 500 indica un error interno del servidor.
    });
  }
});