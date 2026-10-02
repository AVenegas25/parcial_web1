import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  let usuario = null;
  try {
    usuario = exigirSesion();
  } catch (e) {
    console.error("Error de sesión:", e);
  }

  const btnMisDenuncias = document.getElementById("btn-mis-denuncias");
  if (btnMisDenuncias) {
    btnMisDenuncias.addEventListener("click", () => {
      window.location.href = "consulta-denuncia.html";
    });
  }

  const btnSalir = document.getElementById("boton-salir");
  if (btnSalir) {
    btnSalir.addEventListener("click", () => {
      cerrarSesion();
      window.location.href = "login.html";
    });
  }

  const formDenuncia = document.getElementById("formulario-denuncia");
  if (formDenuncia) {
    formDenuncia.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!usuario) {
        alert("Sesión no válida. Inicie sesión nuevamente.");
        window.location.href = "login.html";
        return;
      }

      const dni = document.getElementById("dni")?.value.trim();
      const tipoDelito = document.getElementById("tipo-delito")?.value;
      const lugar = document.getElementById("lugar")?.value.trim();
      const detalle = document.getElementById("detalle")?.value.trim();
      const mensajeEstado = document.getElementById("mensaje-denuncia");
      const sello = document.getElementById("sello-confirmacion");

      if (!dni || !tipoDelito || !lugar || !detalle) {
        if (mensajeEstado) {
          mensajeEstado.style.color = "#dc2626";
          mensajeEstado.textContent = "Por favor, complete todos los campos requeridos.";
        }
        return;
      }

      const codigoSeguimiento = "PNP-" + Math.floor(100000 + Math.random() * 900000);
      const horaActual = new Date().getHours();
      const idEmpleadoAsignado = (horaActual >= 8 && horaActual < 16) ? 1 : (horaActual >= 16 && horaActual < 24) ? 2 : 3;

      try {
        if (mensajeEstado) {
          mensajeEstado.style.color = "#2563eb";
          mensajeEstado.textContent = "Guardando en Neon PostgreSQL...";
        }

        await sql`
          INSERT INTO denuncias_digitales (
            codigo_seguimiento,
            dni_denunciante,
            tipo_delito,
            lugar_incidente,
            detalle_denuncia,
            estado,
            id_empleado_asignado,
            id_usuario
          ) VALUES (
            ${codigoSeguimiento},
            ${dni},
            ${tipoDelito},
            ${lugar},
            ${detalle},
            'registrado',
            ${idEmpleadoAsignado},
            ${usuario.id}
          );
        `;

        if (sello) sello.style.display = "block";
        if (mensajeEstado) {
          mensajeEstado.style.color = "#166534";
          mensajeEstado.textContent = `Denuncia registrada exitosamente. Código: ${codigoSeguimiento}`;
        }

        formDenuncia.reset();

        setTimeout(() => {
          window.location.href = "consulta-denuncia.html";
        }, 1500);

      } catch (error) {
        console.error("Error al conectar con Neon:", error);
        if (mensajeEstado) {
          mensajeEstado.style.color = "#dc2626";
          mensajeEstado.textContent = "Error al conectar con la base de datos.";
        }
      }
    });
  }
});