import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./database/connection.js";

async function main() {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(
        `BRUNA ESTA CORRIENDO EN EL PUERTO http://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("holabb");
  }
}

main();
