import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

// Validar inicio de sesión
const usuario = exigirSesion();
if (!usuario) {
  window.location.href = "login.html";
}

// Expulsar si un ciudadano intenta entrar a paneles administrativos
if (usuario.rol !== "admin" && usuario.rol !== "empleado") {
  window.location.href = "consulta-denuncia.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Mostrar Rol del usuario
  const tagRol = document.getElementById("tag-rol-usuario");
  if (tagRol) {
    tagRol.textContent = `ROL: ${usuario.rol.toUpperCase()}`;
    if (usuario.rol === "admin") {
      tagRol.classList.add("tag-admin");
    }
  }

  // Evento Cerrar Sesión
  const btnSalir = document.getElementById("boton-salir");
  if (btnSalir) {
    btnSalir.addEventListener("click", () => {
      cerrarSesion();
      window.location.href = "login.html";
    });
  }

  // Cargar tabla general de denuncias
  listarPanelGeneral();
});

async function listarPanelGeneral() {
  try {
    const datos = await sql`SELECT * FROM denuncias_digitales ORDER BY fecha_registro DESC;`;
    const tbody = document.getElementById("tabla-panel-general");
    if (!tbody) return;
    tbody.innerHTML = "";

    datos.forEach((item) => {
      const tr = document.createElement("tr");

      // Botón eliminar solo activo para el administrador
      const btnEliminar = usuario.rol === "admin"
        ? `<button class="boton btn-del" data-id="${item.id}">Eliminar</button>`
        : '';

      tr.innerHTML = `
        <td>${item.id}</td>
        <td><strong>${item.codigo_seguimiento}</strong></td>
        <td>${item.dni_denunciante}</td>
        <td>${item.tipo_delito}</td>
        <td>${item.lugar_incidente}</td>
        <td><span class="estado-pill">${item.estado}</span></td>
        <td class="action-buttons">
          <button class="boton btn-pnl-edit" data-item='${JSON.stringify(item)}'>Editar</button>
          ${btnEliminar}
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Eventos para abrir el modal de edición
    document.querySelectorAll(".btn-pnl-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const data = JSON.parse(e.target.dataset.item);
        const modal = document.getElementById("modal-panel");
        if (modal) modal.style.display = "block";
        
        document.getElementById("lbl-codigo").textContent = data.codigo_seguimiento;
        document.getElementById("pnl-id").value = data.id;
        document.getElementById("pnl-estado").value = data.estado;
        document.getElementById("pnl-lugar").value = data.lugar_incidente;
        document.getElementById("pnl-detalle").value = data.detalle_denuncia;
      });
    });

    // Eventos para eliminar registros
    document.querySelectorAll(".btn-del").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const idEliminar = e.target.dataset.id;
        if (confirm("¿Confirmas eliminar este registro de la base de datos?")) {
          await sql`DELETE FROM denuncias_digitales WHERE id = ${idEliminar};`;
          listarPanelGeneral();
        }
      });
    });

  } catch (err) {
    console.error("Error al cargar datos desde Neon:", err);
  }
}

// Guardar cambios desde el modal
document.getElementById("form-panel-gestion")?.addEventListener("submit", async (e) => {
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

  const modal = document.getElementById("modal-panel");
  if (modal) modal.style.display = "none";
  
  listarPanelGeneral();
});

document.getElementById("btn-cerrar-pnl")?.addEventListener("click", () => {
  const modal = document.getElementById("modal-panel");
  if (modal) modal.style.display = "none";
});