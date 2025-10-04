import { PosService } from "../services/pos.service.js";

const posService = new PosService();

// -----------------
// POS Controllers
// -----------------
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

export const createPos = async (req, res) => {
  try {
    const { code, name, description, color } = req.body;
    const pos = await posService.createPos(req.user, {
      code,
      name,
      description,
      color,
    });
    res.status(201).json(pos);
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
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

export const deletePos = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await posService.deletePos(req.user, id);
    res.json({ message: "POS eliminado" });
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

// -----------------
// Semantic Controllers
// -----------------
export const getSemanticByPos = async (req, res) => {
  try {
    const posId = parseInt(req.params.posId);
    const semantics = await posService.getSemanticByPos(posId);
    res.json(semantics);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createSemantic = async (req, res) => {
  try {
    const { posId, name, description } = req.body;
    const semantic = await posService.createSemantic(req.user, {
      posId,
      name,
      description,
    });
    res.status(201).json(semantic);
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};

export const deleteSemantic = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await posService.deleteSemantic(req.user, id);
    res.json({ message: "Semantic eliminado" });
  } catch (err) {
    if (err.message.includes("No autorizado"))
      return res.status(403).json({ message: err.message });
    res.status(400).json({ message: err.message });
  }
};
