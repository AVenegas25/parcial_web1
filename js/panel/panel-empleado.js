import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion();
if (!usuario || usuario.rol !== "empleado") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("boton-salir")?.addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "login.html";
  });

  listarMisDenuncias();
});

async function listarMisDenuncias() {
  try {
    const datos = await sql`
      SELECT * FROM denuncias_digitales 
      WHERE id_empleado_asignado = ${usuario.id} 
      ORDER BY fecha_registro DESC;
    `;

    const tbody = document.getElementById("tabla-panel-general");
    if (!tbody) return;
    tbody.innerHTML = "";

    datos.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td><strong>${item.codigo_seguimiento}</strong></td>
        <td>${item.dni_denunciante || '---'}</td>
        <td>${item.tipo_delito || '---'}</td>
        <td>${item.lugar_incidente}</td>
        <td>${item.estado}</td>
        <td>
          <button class="btn-editar" data-item='${JSON.stringify(item)}'>Editar</button>
          <button class="btn-eliminar" data-id="${item.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const item = JSON.parse(e.target.dataset.item);
        const modal = document.getElementById("modal-panel");
        if (modal) modal.style.display = "block";

        document.getElementById("pnl-id").value = item.id;
        document.getElementById("pnl-estado").value = item.estado;
        document.getElementById("pnl-lugar").value = item.lugar_incidente;
        document.getElementById("pnl-detalle").value = item.detalle_denuncia;
        document.getElementById("lbl-codigo").textContent = item.codigo_seguimiento;
      });
    });

    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("¿Deseas eliminar este registro de tu turno?")) {
          await sql`
            DELETE FROM denuncias_digitales 
            WHERE id = ${id} AND id_empleado_asignado = ${usuario.id};
          `;
          listarMisDenuncias();
        }
      });
    });

  } catch (err) {
    console.error("Error al cargar denuncias del turno:", err);
  }
}

document.getElementById("form-panel-gestion")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("pnl-id").value;
  const estado = document.getElementById("pnl-estado").value;
  const lugar = document.getElementById("pnl-lugar").value;
  const detalle = document.getElementById("pnl-detalle").value;

  await sql`
    UPDATE denuncias_digitales
    SET estado = ${estado}, lugar_incidente = ${lugar}, detalle_denuncia = ${detalle}
    WHERE id = ${id} AND id_empleado_asignado = ${usuario.id};
  `;

  const modal = document.getElementById("modal-panel");
  if (modal) modal.style.display = "none";

  alert("Registro de tu turno actualizado con éxito.");
  listarMisDenuncias();
});

document.getElementById("btn-cerrar-pnl")?.addEventListener("click", () => {
  const modal = document.getElementById("modal-panel");
  if (modal) modal.style.display = "none";
});