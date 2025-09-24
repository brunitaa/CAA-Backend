import { PosService } from "../services/pos.service.js";

const posService = new PosService();

export const getAllPos = async (req, res) => {
  try {
    const posList = await posService.getAllPos();
    res.json(posList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPosById = async (req, res) => {
  try {
    const pos = await posService.getPosById(parseInt(req.params.id));
    res.json(pos);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updatePos = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, description, color } = req.body;
    const updated = await posService.updatePos(req.user, id, {
      code,
      name,
      description,
      color,
    });
    res.json(updated);
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};
