import { auth } from "@/auth";
import { interpretarMensaje, interpretarSoloFecha } from "@/lib/parser";
import { crearEvento } from "@/lib/calendar";

const CORREO_ESPOSA = "sheilandrade12@gmail.com";
const CORREO_WILMER = "thegranwil@gmail.com";

export async function POST(request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { mensaje, pendiente } = await request.json();

  if (!mensaje || mensaje.trim() === "") {
    return Response.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  let titulo, fechaInicio, fechaFin;

  // CASO 1: Ya había un título pendiente esperando fecha → este mensaje debe ser SOLO la fecha
  if (pendiente && pendiente.titulo) {
    const fecha = interpretarSoloFecha(mensaje);

    if (!fecha) {
      // Sigue sin detectar fecha, le volvemos a preguntar
      return Response.json(
        {
          necesitaFecha: true,
          tituloPendiente: pendiente.titulo,
          error: `No logré entender la fecha. ¿Para cuándo agendo "${pendiente.titulo}"? (ej: "mañana a las 5pm")`,
        },
        { status: 422 },
      );
    }

    titulo = pendiente.titulo;
    fechaInicio = fecha.fechaInicio;
    fechaFin = fecha.fechaFin;
  } else {
    // CASO 2: Mensaje nuevo, normal — intentamos sacar título Y fecha juntos
    const interpretado = interpretarMensaje(mensaje);

    if (!interpretado) {
      // No hay fecha. Usamos el mensaje completo como título pendiente y preguntamos
      let tituloLimpio = mensaje.trim();
      tituloLimpio = tituloLimpio
        .replace(
          /^(agenda(r)?|programa(r)?|recu[eé]rdame|recordar|anota(r)?)\b[:,]?\s*/i,
          "",
        )
        .trim();
      tituloLimpio =
        tituloLimpio.charAt(0).toUpperCase() + tituloLimpio.slice(1);

      return Response.json(
        {
          necesitaFecha: true,
          tituloPendiente: tituloLimpio,
          error: `¿Para cuándo agendo "${tituloLimpio}"?`,
        },
        { status: 422 },
      );
    }

    titulo = interpretado.titulo;
    fechaInicio = interpretado.fechaInicio;
    fechaFin = interpretado.fechaFin;
  }

  const correoUsuarioActual = session.user.email;
  const correoInvitado =
    correoUsuarioActual === CORREO_WILMER ? CORREO_ESPOSA : CORREO_WILMER;

  try {
    const evento = await crearEvento({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      titulo,
      fechaInicio,
      fechaFin,
      invitadoEmail: correoInvitado,
    });

    return Response.json({
      ok: true,
      titulo,
      fecha: fechaInicio,
      linkEvento: evento.htmlLink,
    });
  } catch (error) {
    console.error("Error creando evento:", error);
    return Response.json(
      { error: "No se pudo crear el evento en Google Calendar" },
      { status: 500 },
    );
  }
}
