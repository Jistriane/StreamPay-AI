// Módulo de notificações (mock: e-mail)
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendNotification(email: string, subject: string, message: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Configuração SMTP ausente. Configure variáveis de ambiente para envio real.");
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@streampay.ai',
    to: email,
    subject,
    text: message
  });
}
