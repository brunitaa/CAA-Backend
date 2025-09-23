// src/services/emailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true", // true para 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión al iniciar (opcional)
transporter
  .verify()
  .then(() => console.log("✅ SMTP (Gmail) conectado correctamente"))
  .catch((err) => console.error("❌ Error conectando SMTP:", err));

export const sendOTPEmail = async (to, otp) => {
  const info = await transporter.sendMail({
    from: `"CAA App" <${process.env.SMTP_USER}>`, // Remitente: tu cuenta Gmail
    to,
    subject: "Your OTP code",
    text: `Your OTP code is: ${otp}. Expires in 5 minutes.`,
    html: `<p>Your OTP code is: <b>${otp}</b></p>`,
  });

  console.log("Mensaje enviado. id:", info.messageId);
  return info;
};
