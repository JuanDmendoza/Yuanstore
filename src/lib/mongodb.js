import mongoose from "mongoose";

// Conexión singleton cacheada. En desarrollo el hot reload re-evalúa los
// módulos, por eso la caché vive en `globalThis`.
const cache =
  globalThis.__mongooseCache ?? (globalThis.__mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false }).catch((err) => {
      cache.promise = null; // permite reintentar tras un fallo
      throw err;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
