import postgres from "postgres";

// Configuración de conexión a la base de datos
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL no está definida en las variables de entorno");
  throw new Error("DATABASE_URL is required");
}

// Configuración de SSL - Neon requiere SSL
const connectDB = postgres(databaseUrl, {
  ssl: "require", // Neon siempre requiere SSL
  max: 20, // máximo de conexiones
  idle_timeout: 20, // timeout de conexiones inactivas
  connect_timeout: 10, // timeout de conexión
  onnotice: (notice) => {
    console.log("📝 Database notice:", notice);
  },
  onparameter: (key, value) => {
    console.log("🔧 Database parameter:", key, "=", value);
  },
});

// Función para probar la conexión
export async function testConnection() {
  try {
    await connectDB`SELECT 1 as test`;
    console.log("✅ Conexión a la base de datos exitosa");
    return true;
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:", error);
    return false;
  }
}

export default connectDB;