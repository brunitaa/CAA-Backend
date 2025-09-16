import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "usuario").default("usuario"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(6).required(),
  username: Joi.string().required(),
});
