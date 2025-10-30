import { predictPictograms } from "../services/prediction.service.js";

export async function predictPictogramsController(req, res) {
  const { text, speaker_id } = req.body;

  if (!text || speaker_id == null) {
    return res.status(400).json({ error: "text y speaker_id son requeridos" });
  }

  const predictedIds = await predictPictograms(text, Number(speaker_id));
  res.json({ predictions: predictedIds });
}
