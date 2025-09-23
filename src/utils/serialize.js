// utils/serialize.js

/**
 * Convierte BigInt a string en un objeto JSON para evitar errores
 * al enviar datos de Prisma a clientes como Postman.
 * @param {any} obj
 * @returns {any}
 */
export function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
