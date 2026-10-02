import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion();
if (!usuario || usuario.rol !== "admin") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("boton-salir")?.addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "login.html";
  });

  listarTodasLasDenuncias();
});

async function listarTodasLasDenuncias() {
  try {
    const datos = await sql`
      SELECT d.*, u.nombre AS nombre_empleado 
      FROM denuncias_digitales d
      LEFT JOIN usuarios u ON d.id_empleado_asignado = u.id
      ORDER BY d.fecha_registro DESC;
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
        if (confirm("¿Confirmas eliminar este registro de todo el sistema?")) {
          await sql`DELETE FROM denuncias_digitales WHERE id = ${id};`;
          listarTodasLasDenuncias();
        }
      });
    });

  } catch (err) {
    console.error("Error al cargar la totalidad de denuncias:", err);
  }
}

document.getElementById("form-panel-admin")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("pnl-id").value;
  const estado = document.getElementById("pnl-estado").value;
  const lugar = document.getElementById("pnl-lugar").value;
  const detalle = document.getElementById("pnl-detalle").value;

  await sql`
    UPDATE denuncias_digitales
    SET estado = ${estado}, lugar_incidente = ${lugar}, detalle_denuncia = ${detalle}
    WHERE id = ${id};
  `;

  alert("Registro modificado a nivel sistema.");
  listarTodasLasDenuncias();
});