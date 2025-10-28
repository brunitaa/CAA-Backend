import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./database/connection.js";

async function main() {
  try {
    await connectDB();
    app.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(
        `EL PROYECTO ESTA CORRIENDO EN http://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("Error al correr el proyecto");
  }
}

main();
