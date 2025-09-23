import prisma from "../lib/prisma.js";

async function main() {
  const roles = [
    { id: 1, name: "admin" },
    { id: 2, name: "caregiver" },
    { id: 3, name: "speaker" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log("Roles inicializados");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
