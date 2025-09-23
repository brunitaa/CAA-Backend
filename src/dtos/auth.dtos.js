// src/dtos/auth.dto.js
import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;
// explanation:
// - at least one uppercase
// - at least one digit
// - at least one special character (non-alphanumeric)
// - length >= 7 (i.e., >6)

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(7).regex(passwordRegex, {
    message:
      "Password must be at least 7 characters, include one uppercase letter, one number and one special character",
  }),
  gender: z.enum(["female", "male", "other"]).optional(),
  age: z.number().int().optional(),
});

export const VerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});
