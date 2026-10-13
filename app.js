const CLAVE_GUARDADO = "diario-estudio-sesiones";

const formulario = document.getElementById("form-sesion");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const rachaValor = document.getElementById("racha-valor");
const mejorRachaValor = document.getElementById("mejor-racha-valor");
const listaSesiones = document.getElementById("lista-sesiones");
const mensajeVacio = document.getElementById("mensaje-vacio");

let sesiones = cargarSesiones();

function cargarSesiones() {
  const datos = localStorage.getItem(CLAVE_GUARDADO);
  if (!datos) {
    return [];
  }
  try {
    return JSON.parse(datos);
  } catch (error) {
    return [];
  }
}

function guardarSesiones() {
  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(sesiones));
}

function fechaALocalISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

function sumarDias(fechaISO, dias) {
  const partes = fechaISO.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  fecha.setDate(fecha.getDate() + dias);
  return fechaALocalISO(fecha);
}

function formatearFecha(fechaISO) {
  const partes = fechaISO.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calcularRacha() {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
  const hoy = fechaALocalISO(new Date());
  const ayer = sumarDias(hoy, -1);

  let diaActual;
  if (diasConSesion.has(hoy)) {
    diaActual = hoy;
  } else if (diasConSesion.has(ayer)) {
    diaActual = ayer;
  } else {
    return 0;
  }

  let racha = 0;
  while (diasConSesion.has(diaActual)) {
    racha = racha + 1;
    diaActual = sumarDias(diaActual, -1);
  }
  return racha;
}

function calcularMejorRacha() {
  const dias = [...new Set(sesiones.map((sesion) => sesion.fecha))].sort();

  let mejor = 0;
  let tira = 0;
  let diaAnterior = null;

  for (const dia of dias) {
    if (diaAnterior !== null && dia === sumarDias(diaAnterior, 1)) {
      tira = tira + 1;
    } else {
      tira = 1;
    }
    if (tira > mejor) {
      mejor = tira;
    }
    diaAnterior = dia;
  }

  return mejor;
}

function crearItemSesion(sesion) {
  const item = document.createElement("li");
  item.className = "sesion";

  const info = document.createElement("div");
  info.className = "sesion-info";

  const tema = document.createElement("span");
  tema.className = "sesion-tema";
  tema.textContent = sesion.tema;

  const fecha = document.createElement("span");
  fecha.className = "sesion-fecha";
  fecha.textContent = formatearFecha(sesion.fecha);

  info.append(tema, fecha);

  const minutos = document.createElement("span");
  minutos.className = "sesion-minutos";
  minutos.textContent = sesion.minutos + " min";

  item.append(info, minutos);
  return item;
}

function renderizar() {
  rachaValor.textContent = calcularRacha();
  mejorRachaValor.textContent = calcularMejorRacha();

  const ordenadas = sesiones.slice().sort((a, b) => {
    if (a.fecha === b.fecha) {
      return b.id - a.id;
    }
    return a.fecha < b.fecha ? 1 : -1;
  });

  listaSesiones.innerHTML = "";

  if (ordenadas.length === 0) {
    mensajeVacio.hidden = false;
    return;
  }
  mensajeVacio.hidden = true;

  for (const sesion of ordenadas) {
    listaSesiones.append(crearItemSesion(sesion));
  }
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (fecha === "" || tema === "" || minutos <= 0) {
    return;
  }

  sesiones.push({ id: Date.now(), fecha: fecha, tema: tema, minutos: minutos });
  guardarSesiones();
  renderizar();

  formulario.reset();
  campoFecha.value = fechaALocalISO(new Date());
  campoTema.focus();
});

campoFecha.value = fechaALocalISO(new Date());
renderizar();
