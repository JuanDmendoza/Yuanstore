// Crea o actualiza el usuario admin.
//   ADMIN_USER=yuanso ADMIN_PASSWORD='...' npm run crear-admin
// La contraseña se guarda solo como hash (scrypt); nunca en claro.
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/password.mjs";

const usuario = String(process.env.ADMIN_USER ?? "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD ?? "");

if (!usuario || password.length < 8) {
  console.error("Define ADMIN_USER y ADMIN_PASSWORD (mínimo 8 caracteres).");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("Falta MONGODB_URI (el script se ejecuta con --env-file=.env.local).");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
// Misma colección que usa el modelo Admin ("admins").
await mongoose.connection
  .collection("admins")
  .updateOne(
    { usuario },
    { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
await mongoose.connection.collection("admins").createIndex({ usuario: 1 }, { unique: true });
console.log(`Admin "${usuario}" listo.`);
await mongoose.disconnect();
