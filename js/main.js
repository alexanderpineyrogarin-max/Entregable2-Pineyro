// DOM + Eventos + localStorage (sin prompt/alert ni consola)

const TARIFAS = {
  "Rio de Janeiro": 60,
  "Buenos Aires": 45,
  "Santiago de Chile": 55,
  "Punta Cana": 120
};
const EXTRAS = { seguroPorPersona: 3.5, equipajeExtraPorPersona: 20 };
const STORAGE_KEY = "cotizaciones_viaje";

function cargar(){
  const raw = localStorage.getItem(STORAGE_KEY);
  try{ return raw ? JSON.parse(raw) : [] }catch{ return []; }
}
function guardar(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function crearCotizacion(destino, personas, noches, incluirSeguro, incluirEquipaje){
  const base = TARIFAS[destino] || 0;
  const alojamiento = base * personas * noches;
  const seguro = incluirSeguro ? EXTRAS.seguroPorPersona * personas * noches : 0;
  const equipaje = incluirEquipaje ? EXTRAS.equipajeExtraPorPersona * personas : 0;
  const total = alojamiento + seguro + equipaje;
  return { id: String(Date.now() + Math.random()), destino, personas, noches, incluirSeguro, incluirEquipaje, total };
}

function validar(destino, personas, noches){
  const e = [];
  if(!destino) e.push("Elegí un destino.");
  if(!Number.isFinite(personas) || personas <= 0) e.push("Personas debe ser mayor a 0.");
  if(!Number.isFinite(noches) || noches <= 0) e.push("Noches debe ser mayor a 0.");
  return e;
}

function render(lista){
  const tbody = document.querySelector("#tabla tbody");
  const sumaEl = document.getElementById("suma");
  const vacio = document.getElementById("vacio");
  tbody.innerHTML = "";
  if(!lista.length){
    vacio.style.display = "block";
    sumaEl.textContent = "0.00";
    return;
  }
  vacio.style.display = "none";
  let suma = 0;
  lista.forEach((c, i)=>{
    suma += c.total;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${c.destino}</td>
      <td>${c.personas}</td>
      <td>${c.noches}</td>
      <td>${c.incluirSeguro ? "Sí" : "No"}</td>
      <td>${c.incluirEquipaje ? "Sí" : "No"}</td>
      <td>${c.total.toFixed(2)}</td>
      <td><button class="action-del" data-id="${c.id}">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
  sumaEl.textContent = suma.toFixed(2);
}

function setMsg(texto, ok=true){
  const el = document.getElementById("msg");
  el.textContent = texto || "";
  el.style.color = ok ? "#065f46" : "#b00020";
  if(texto){ setTimeout(()=>{ el.textContent=""; }, 2000); }
}

document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("form");
  const errores = document.getElementById("errores");
  const vaciar = document.getElementById("vaciar");
  const tbody = document.querySelector("#tabla tbody");

  let lista = cargar();
  render(lista);

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    errores.textContent = "";
    const destino = document.getElementById("destino").value;
    const personas = parseInt(document.getElementById("personas").value, 10);
    const noches = parseInt(document.getElementById("noches").value, 10);
    const incluirSeguro = document.getElementById("seguro").checked;
    const incluirEquipaje = document.getElementById("equipaje").checked;

    const err = validar(destino, personas, noches);
    if(err.length){ errores.textContent = err.join(" "); return; }

    const cot = crearCotizacion(destino, personas, noches, incluirSeguro, incluirEquipaje);
    lista.push(cot);
    guardar(lista);
    render(lista);
    form.reset();
    setMsg("Cotización agregada.");
  });

  tbody.addEventListener("click", (e)=>{
    const btn = e.target.closest("button.action-del");
    if(!btn) return;
    const id = btn.dataset.id;
    lista = lista.filter(c => c.id !== id);
    guardar(lista);
    render(lista);
    setMsg("Cotización eliminada.");
  });

  vaciar.addEventListener("click", ()=>{
    lista = [];
    guardar(lista);
    render(lista);
    setMsg("Lista vaciada.");
  });
});
