import { sql } from "../config/neon-config.js";

export async function registrarUsuario(nombre, correo, contrasena) {
  await sql`
    INSERT INTO usuarios (nombre, correo, contrasena, rol)
    VALUES (${nombre}, ${correo}, ${contrasena}, 'ciudadano');
  `;
}

export async function iniciarSesion(correo, contrasena) {
  const filas = await sql`
    SELECT id, nombre, correo, rol FROM usuarios
    WHERE correo = ${correo} AND contrasena = ${contrasena};
  `;
  if (filas.length === 0) return null;
  sessionStorage.setItem("usuario", JSON.stringify(filas[0]));
  return filas[0];
}

export function cerrarSesion() {
  sessionStorage.removeItem("usuario");
}

export function exigirSesion() {
  const usuario = sessionStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(usuario);
}