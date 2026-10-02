import { iniciarSesion } from "./auth.js";

const form = document.getElementById("formulario-login");
const mensaje = document.getElementById("mensaje-estado");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = document.getElementById("correo")?.value.trim();
  const contrasena = document.getElementById("contrasena")?.value.trim();

  try {
    const usuario = await iniciarSesion(correo, contrasena);
    
    if (!usuario) {
      if (mensaje) {
        mensaje.textContent = "Credenciales incorrectas.";
        mensaje.className = "mensaje-estado fallo visible";
      }
      return;
    }

    if (usuario.rol === "admin") {
      window.location.href = "panel-admin.html";
    } else if (usuario.rol === "empleado") {
      window.location.href = "panel-empleado.html";
    } else {
      window.location.href = "consulta-denuncia.html";
    }
  } catch (err) {
    console.error(err);
    if (mensaje) {
      mensaje.textContent = "Error al conectar con la base de datos.";
      mensaje.className = "mensaje-estado fallo visible";
    }
  }
});