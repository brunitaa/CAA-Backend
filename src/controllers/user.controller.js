import { userService } from "../services/user.service.js";

export const updateSpeaker = async (req, res, next) => {
  try {
    const speaker = { id: req.user.userId, role: req.user.role };
    const data = req.body || {};

    const result = await userService.updateSpeaker(speaker, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCaregiver = async (req, res, next) => {
  try {
    const caregiver = { id: req.user.userId, role: req.user.role };
    const userId = parseInt(req.params.id, 10);
    const data = req.body || {};

    const result = await userService.updateCaregiver(caregiver, userId, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const admin = { id: req.user.userId, role: req.user.role };
    const userId = parseInt(req.params.id, 10);
    const data = req.body || {};

    const result = await userService.updateAdmin(admin, userId, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const requestEmailChange = async (req, res, next) => {
  try {
    const requester = { id: req.user.userId, role: req.user.role };
    const userId = parseInt(req.params.id, 10);
    const { newEmail } = req.body;

    const result = await userService.requestEmailChange(
      requester,
      userId,
      newEmail
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
export const getAdmins = async (req, res, next) => {
  try {
    const result = await userService.getAllAdmins();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSpeakers = async (req, res, next) => {
  try {
    const result = await userService.getAllSpeakers();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCaregivers = async (req, res, next) => {
  try {
    const result = await userService.getAllCaregivers();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const confirmEmailChange = async (req, res, next) => {
  try {
    const requester = { id: req.user.userId, role: req.user.role };
    const userId = parseInt(req.params.id, 10);
    const { newEmail, otp } = req.body;

    const result = await userService.confirmEmailChange(
      requester,
      userId,
      newEmail,
      otp
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
