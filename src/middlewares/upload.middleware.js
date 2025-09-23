import multer from "multer";
import path from "path";
import fs from "fs";

// Carpeta de destino
const uploadPath = "uploads/images";

// Crear carpeta si no existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // nombre único
  },
});

export const uploadImage = multer({ storage });
