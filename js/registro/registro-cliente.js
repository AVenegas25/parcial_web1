import { registrarUsuario } from "../auth/auth.js";

const form = document.getElementById("formulario-registro-cliente");
const mensaje = document.getElementById("mensaje-registro");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();

  try {
    await registrarUsuario(nombre, correo, contrasena);
    mensaje.textContent = "Cuenta creada exitosamente. Redirigiendo...";
    mensaje.className = "mensaje-estado exito visible";
    setTimeout(() => window.location.href = "login.html", 1200);
  } catch (err) {
    mensaje.textContent = "El correo ya se encuentra registrado.";
    mensaje.className = "mensaje-estado fallo visible";
  }
});