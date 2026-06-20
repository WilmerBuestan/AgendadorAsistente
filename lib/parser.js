import * as chrono from "chrono-node";

export function interpretarMensaje(texto) {
  const resultados = chrono.es.parse(texto, new Date(), { forwardDate: true });

  if (resultados.length === 0) {
    return null; // no se detectó ninguna fecha/hora
  }

  const resultado = resultados[0];
  let fechaInicio = resultado.start.date();
  const tieneHora = resultado.start.isCertain("hour");

  // FIX: chrono-node en español a veces interpreta mal "de la tarde/noche" con horas tipo "2 de la tarde"
  // Si detecta hora 1-7 y el texto original contiene "tarde" o "noche", forzamos PM (+12 horas)
  const horaDetectada = fechaInicio.getHours();
  // Detecta "tarde"/"noche" como palabra suelta (tolera errores de tipeo en "de la")
  const contieneTarde = /\btarde\b/i.test(texto);
  const contieneNoche = /\bnoche\b/i.test(texto);
  // Rango 1-11: cualquier hora "de la tarde/noche" en ese rango debe pasar a formato PM
  if (
    (contieneTarde || contieneNoche) &&
    horaDetectada >= 1 &&
    horaDetectada <= 11
  ) {
    fechaInicio = new Date(fechaInicio.getTime() + 12 * 60 * 60 * 1000);
  }

  fechaInicio = new Date(fechaInicio.getTime() + 5 * 60 * 60 * 1000);

  let fechaFin;
  if (resultado.end) {
    fechaFin = resultado.end.date();
  } else {
    fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // +1 hora por defecto
  }

  // Quitamos del texto SOLO lo que chrono marcó como fecha
  const textoFecha = resultado.text;
  let titulo = texto.replace(textoFecha, "").trim();

  // Si corregimos "de la tarde/noche", esas palabras pueden quedar sueltas en el título
  titulo = titulo.replace(/\b(de la )?(tarde|noche|mañana)\b/gi, "").trim();

  // Quitamos conectores sueltos que quedan pegados al cortar la fecha
  titulo = titulo.replace(/\s+(el|del|para el|para|de)\s*$/i, "").trim();
  titulo = titulo.replace(/^\s*(el|del|de)\s+/i, "").trim();

  // Quitamos verbos de comando al inicio (agenda, agendar, programa, recuerdame...)
  titulo = titulo
    .replace(
      /^(agenda(r)?|programa(r)?|recu[eé]rdame|recordar|anota(r)?)\b[:,]?\s*/i,
      "",
    )
    .trim();

  // Limpiamos conectores que pudieron quedar expuestos tras quitar el verbo
  titulo = titulo.replace(/^\s*(el|del|de|una|un)\s+/i, "").trim();

  if (!titulo) titulo = "Evento";

  // Primera letra en mayúscula
  titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  return { titulo, fechaInicio, fechaFin, tieneHora };
}

// Nueva función: cuando YA tenemos un título pendiente y el usuario solo responde con la fecha/hora
export function interpretarSoloFecha(texto) {
  const resultados = chrono.es.parse(texto, new Date(), { forwardDate: true });

  if (resultados.length === 0) {
    return null;
  }

  const resultado = resultados[0];
  let fechaInicio = resultado.start.date();

  const horaDetectada = fechaInicio.getHours();
  const contieneTarde = /\btarde\b/i.test(texto);
  const contieneNoche = /\bnoche\b/i.test(texto);

  if (
    (contieneTarde || contieneNoche) &&
    horaDetectada >= 1 &&
    horaDetectada <= 11
  ) {
    fechaInicio = new Date(fechaInicio.getTime() + 12 * 60 * 60 * 1000);
  }
  fechaInicio = new Date(fechaInicio.getTime() + 5 * 60 * 60 * 1000);

  let fechaFin;
  if (resultado.end) {
    fechaFin = resultado.end.date();
  } else {
    fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);
  }

  return { fechaInicio, fechaFin };
}
