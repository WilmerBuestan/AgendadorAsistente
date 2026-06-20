import { google } from "googleapis"

export async function crearEvento({ accessToken, refreshToken, titulo, fechaInicio, fechaFin, invitadoEmail }) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  const evento = {
    summary: titulo,
    start: {
      dateTime: fechaInicio.toISOString(),
      timeZone: "America/Guayaquil",
    },
    end: {
      dateTime: fechaFin.toISOString(),
      timeZone: "America/Guayaquil",
    },
  }

  // Si nos dan el correo de la pareja, lo agregamos como invitado
  // así el evento aparece automáticamente en su calendario también
  if (invitadoEmail) {
    evento.attendees = [{ email: invitadoEmail }]
  }

  const respuesta = await calendar.events.insert({
    calendarId: "primary",
    requestBody: evento,
    sendUpdates: "all", // esto envía la invitación por correo
  })

  return respuesta.data
}
