import { neon } from "https://esm.sh/@neondatabase/serverless";

// Reemplaza con la cadena de conexión oficial de tu panel de Neon
const DATABASE_URL = "postgresql://neondb_owner:npg_3kLGzubQH1SX@ep-soft-mode-b5bzakwg-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql = neon(DATABASE_URL);