// prisma/seedAdmin.js
import prisma from "../lib/prisma.js"; // ajusta la ruta si tu prisma client está en otro lugar
import { hashPassword } from "../utils/hash.js"; // tu helper de hash existente

// Valores por defecto (puedes sobreescribir con variables de entorno)
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "bbbb43212345@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123!";

async function upsertRoles() {
  const roles = ["admin", "caregiver", "speaker"];
  const results = {};
  for (const name of roles) {
    const r = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    results[name] = r;
  }
  return results;
}

async function createAdminIfNotExists(roles) {
  // Verificar si ya existe por email o username
  const existingAuth = await prisma.userAuth.findUnique({
    where: { email: ADMIN_EMAIL },
  });
  const existingUser = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (existingAuth || existingUser) {
    console.log("Admin ya existe. Detalles:");
    if (existingUser)
      console.log(
        " user.id:",
        existingUser.id,
        " username:",
        existingUser.username
      );
    if (existingAuth)
      console.log(
        " userAuth.userId:",
        existingAuth.userId,
        " email:",
        existingAuth.email
      );
    return;
  }

  // Hash de la contraseña
  const { hash, salt } = await hashPassword(ADMIN_PASSWORD);

  // Crear usuario + auth (activo y email confirmado)
  const admin = await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      roleId: roles.admin.id,
      isActive: true,
      createdAt: new Date(),
      auth: {
        create: {
          email: ADMIN_EMAIL,
          passwordHash: hash,
          passwordSalt: salt,
          emailConfirmed: true,
          createdAt: new Date(),
        },
      },
    },
    include: { auth: true },
  });

  console.log("Admin creado con éxito:");
  console.log({
    id: admin.id,
    username: admin.username,
    email: admin.auth.email,
  });
  console.log("POR FAVOR: cambia la contraseña por defecto inmediatamente.");
}

(async function main() {
  try {
    console.log("Iniciando seed: roles + admin");
    const roles = await upsertRoles();
    await createAdminIfNotExists(roles);
    console.log("Seed finalizado correctamente.");
  } catch (err) {
    console.error("Error durante seed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
