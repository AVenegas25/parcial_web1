import { sql } from "../config/neon-config.js";
import { exigirSesion, cerrarSesion } from "../auth/auth.js";

const usuario = exigirSesion();

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("boton-salir")?.addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "login.html";
  });

  const params = new URLSearchParams(window.location.search);
  const idDenuncia = params.get("id");

  if (!idDenuncia) {
    alert("No se especificó ninguna denuncia.");
    window.location.href = "consulta-denuncia.html";
    return;
  }

  try {
    const resultado = await sql`
      SELECT * FROM denuncias_digitales 
      WHERE id = ${idDenuncia} AND id_usuario = ${usuario.id};
    `;

    if (resultado.length === 0) {
      alert("No se encontró la denuncia o no tienes permiso para editarla.");
      window.location.href = "consulta-denuncia.html";
      return;
    }

    const denuncia = resultado[0];

    if (denuncia.estado !== "registrado") {
      alert("Esta denuncia ya está siendo procesada y no se puede modificar.");
      window.location.href = "consulta-denuncia.html";
      return;
    }

    document.getElementById("denuncia-id").value = denuncia.id;
    document.getElementById("codigo-registro").value = denuncia.codigo_seguimiento;
    document.getElementById("lugar-incidente").value = denuncia.lugar_incidente;
    document.getElementById("descripcion-hechos").value = denuncia.detalle_denuncia;

  } catch (err) {
    console.error("Error al obtener la denuncia de Neon:", err);
    alert("Error al conectar con la base de datos.");
  }
});

document.getElementById("form-actualizar")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("denuncia-id").value;
  const lugar = document.getElementById("lugar-incidente").value.trim();
  const detalle = document.getElementById("descripcion-hechos").value.trim();

  try {
    await sql`
      UPDATE denuncias_digitales
      SET lugar_incidente = ${lugar}, detalle_denuncia = ${detalle}
      WHERE id = ${id} AND id_usuario = ${usuario.id} AND estado = 'registrado';
    `;

    alert("Denuncia actualizada correctamente.");
    window.location.href = "consulta-denuncia.html";
  } catch (err) {
    console.error("Error al actualizar en Neon:", err);
    alert("Ocurrió un error al guardar los cambios.");
  }
});