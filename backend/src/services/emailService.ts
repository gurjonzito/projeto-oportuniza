import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EnviarEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function enviarEmail({ to, subject, html }: EnviarEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[emailService] RESEND_API_KEY não configurada — email não enviado.");
    console.log("[emailService] Conteúdo que seria enviado:", { to, subject });
    return;
  }

  const { error } = await resend.emails.send({
    // Em produção use seu domínio verificado (ex: "Oportuniza <noreply@oportuniza.com.br>")
    // Em dev, use "onboarding@resend.dev" — só entrega pro email da sua conta Resend
    from: process.env.EMAIL_FROM ?? "Oportuniza <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[emailService] Erro ao enviar email:", error);
    throw new Error("Não foi possível enviar o email.");
  }
}