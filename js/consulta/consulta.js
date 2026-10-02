import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion();

document.addEventListener("DOMContentLoaded", () => {
  const lblUsuario = document.getElementById("nombre-usuario");
  if (lblUsuario) {
    lblUsuario.textContent = usuario.nombre;
  }

  const btnSalir = document.getElementById("boton-salir");
  if (btnSalir) {
    btnSalir.addEventListener("click", () => {
      cerrarSesion();
      window.location.href = "login.html";
    });
  }

  const btnNueva = document.getElementById("btn-nueva-denuncia");
  if (btnNueva) {
    btnNueva.addEventListener("click", () => {
      window.location.href = "registro-denuncias.html";
    });
  }

  cargarMisDenuncias();
});

async function cargarMisDenuncias() {
  try {
    const misDenuncias = await sql`
      SELECT * FROM denuncias_digitales 
      WHERE id_usuario = ${usuario.id} 
      ORDER BY fecha_registro DESC;
    `;

    const contenedor = document.getElementById("tabla-mis-denuncias");
    if (!contenedor) return;

    if (misDenuncias.length === 0) {
      contenedor.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 20px;">
            No tienes denuncias registradas actualmente.
          </td>
        </tr>`;
      return;
    }

    contenedor.innerHTML = "";
    misDenuncias.forEach((item) => {
      const tr = document.createElement("tr");

      const esEditable = item.estado === "registrado";
      const columnaAccion = esEditable
        ? `<button class="btn-editar" data-id="${item.id}">Editar Datos</button>`
        : `<span style="font-size:0.85rem; color:#718096; font-weight:600;">En Atención</span>`;

      tr.innerHTML = `
        <td><strong>${item.codigo_seguimiento}</strong></td>
        <td>${item.tipo_delito}</td>
        <td>${item.lugar_incidente}</td>
        <td>${new Date(item.fecha_registro).toLocaleDateString()}</td>
        <td><span class="estado-pill ${item.estado}">${item.estado.replace('_', ' ')}</span></td>
        <td>${columnaAccion}</td>
      `;
      contenedor.appendChild(tr);
    });

    document.querySelectorAll(".btn-editar").forEach((boton) => {
      boton.addEventListener("click", (e) => {
        const idDenuncia = e.target.dataset.id;
        window.location.href = `actualizar.html?id=${idDenuncia}`;
      });
    });

  } catch (error) {
    console.error("Error al obtener las denuncias desde Neon:", error);
  }
}