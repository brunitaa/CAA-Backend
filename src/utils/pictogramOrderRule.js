// utils/pictogramOrderRules.js
export const pictogramOrderRules = [
  {
    range: [1, 5],
    partOfSpeech: ["pronoun", "noun"],
    semanticCategory: "person",
    color: "#FFD700", // Amarillo
    description: "Personas o sujetos (quién realiza la acción)",
  },
  {
    range: [6, 10],
    partOfSpeech: ["verb"],
    semanticCategory: "action",
    color: "#00B050", // Verde
    description: "Acciones o verbos (qué hace)",
  },
  {
    range: [11, 15],
    partOfSpeech: ["noun"],
    semanticCategory: "object",
    color: "#F9E79F", // Amarillo claro
    description: "Objetos o lugares (qué o dónde)",
  },
  {
    range: [16, 18],
    partOfSpeech: ["adjective"],
    semanticCategory: "emotion",
    color: "#FFA500", // Naranja
    description: "Emociones o estados",
  },
  {
    range: [19, 21],
    partOfSpeech: ["functional"],
    semanticCategory: "control",
    color: "#FF4C4C", // Rojo
    description: "Respuestas o control (sí, no, más)",
  },
  {
    range: [22, 24],
    partOfSpeech: ["interjection", "functional"],
    semanticCategory: "social",
    color: "#5DADE2", // Azul
    description: "Cortesía y sociales",
  },
];

/**
 * Devuelve una prioridad numérica según el tipo de palabra (PartOfSpeech)
 */
export function getPriorityByPartOfSpeech(posCode) {
  for (const block of pictogramOrderRules) {
    if (block.partOfSpeech.includes(posCode)) {
      return block.range[0];
    }
  }
  return 999; // Si no coincide, lo envía al final
}
