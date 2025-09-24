import crypto from "crypto";

// Generar hash de contraseña
export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
};

// Verificar contraseña
export const comparePassword = async (password, storedHash, salt) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === storedHash;
};
