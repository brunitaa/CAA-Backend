import { userService } from "../services/user.service.js";

export const updateUser = async (req, res, next) => {
  try {
    const requester = { id: req.user.userId, role: req.user.role };
    const userId = parseInt(req.params.id, 10);
    const data = req.body || {};

    const result = await userService.updateUser(requester, userId, data);
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
