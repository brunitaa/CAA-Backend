import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Mi App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Tu código OTP",
    html: `<p>Tu código OTP es: <b>${otp}</b></p>`,
  };

  return transporter.sendMail(mailOptions);
};
