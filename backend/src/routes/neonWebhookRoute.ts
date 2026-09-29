import { Router } from "express";
import crypto from "node:crypto";
import { enviarEmail } from "../services/emailService";

const router = Router();

const JWKS_URL = process.env.NEON_AUTH_JWKS_URL!;

// Cache das chaves públicas
const jwksCache = new Map<string, crypto.KeyObject>();

async function getPublicKey(kid: string): Promise<crypto.KeyObject> {
  if (jwksCache.has(kid)) return jwksCache.get(kid)!;

  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`Falha ao buscar JWKS: ${res.status}`);

  const jwks = (await res.json()) as { keys: any[] };
  const jwk = jwks.keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error(`Chave pública ${kid} não encontrada`);

  const key = crypto.createPublicKey({ key: jwk, format: "jwk" });
  jwksCache.set(kid, key);
  return key;
}

async function verifyNeonSignature(
  rawBody: Buffer,
  headers: Record<string, string | string[] | undefined>,
): Promise<boolean> {
  const signature = headers["x-neon-signature"] as string;
  const kid = headers["x-neon-signature-kid"] as string;
  const timestamp = headers["x-neon-timestamp"] as string;

  if (!signature || !kid || !timestamp) return false;

  const age = Math.abs(Date.now() - Number(timestamp));
  if (age > 5 * 60 * 1000) return false;

  const publicKey = await getPublicKey(kid);

  const [headerB64, emptyPayload, signatureB64] = signature.split(".");
  if (emptyPayload !== "") return false;

  const payloadB64 = rawBody.toString("base64url");
  const inner = `${timestamp}.${payloadB64}`;
  const signingInput = `${headerB64}.${Buffer.from(inner, "utf8").toString("base64url")}`;

  try {
    return crypto.verify(
      null,
      Buffer.from(signingInput),
      publicKey,
      Buffer.from(signatureB64, "base64url"),
    );
  } catch {
    return false;
  }
}

function buildResetEmail(userName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="font-family: Poppins, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #1E40AF; color: white; padding: 8px 18px; border-radius: 10px; font-weight: 700; font-size: 18px;">
          Oportuniza
        </div>
      </div>

      <h1 style="font-size: 22px; color: #1f2937; margin: 0 0 12px; font-weight: 700;">
        Redefinir sua senha
      </h1>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Olá, ${userName}!<br><br>
        Recebemos um pedido para redefinir a senha da sua conta no Oportuniza. Clique no botão abaixo para criar uma nova senha.
      </p>

      <a href="${resetUrl}" style="display: block; background: #1E40AF; color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
        Redefinir minha senha
      </a>

      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
        Se você não pediu essa alteração, ignore este email. O link expira em 15 minutos.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">
        Oportuniza — Trilhas de aprendizado gratuitas para o primeiro emprego
      </p>
    </div>
  </body>
</html>
  `.trim();
}

router.post("/", async (req, res) => {
  const rawBody = req.body as Buffer;

  if (!Buffer.isBuffer(rawBody)) {
    console.error("Webhook Neon: req.body não é Buffer. Verifique express.raw() antes do express.json()");
    return res.status(500).send("config error");
  }

  try {
    const isValid = await verifyNeonSignature(rawBody, req.headers);
    if (!isValid) {
      console.warn("Webhook Neon: assinatura inválida");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType = (req.headers["x-neon-event-type"] as string) ?? event.type;

    console.log("Webhook Neon recebido:", eventType);

    if (eventType === "send.magic_link") {
      const data = event.data ?? event.event_data ?? {};
      const linkType = data.link_type;

      if (linkType === "forget-password") {
        const userEmail = event.user?.email ?? data.user?.email;
        const userName = event.user?.name ?? data.user?.name ?? "Usuário";
        const resetUrl = data.link_url ?? data.url;

        if (!userEmail || !resetUrl) {
          console.warn("Webhook: dados incompletos", { userEmail, resetUrl });
          return res.status(200).send("ok");
        }

        // ✅ Usa seu serviço existente
        await enviarEmail({
          to: userEmail,
          subject: "Redefinir sua senha — Oportuniza",
          html: buildResetEmail(userName, resetUrl),
        });

        console.log(`Email de reset enviado para ${userEmail}`);
      } else {
        console.log(`Webhook: link_type "${linkType}" ignorado`);
      }
    }

    res.status(200).send("ok");
  } catch (error) {
    console.error("Erro no webhook Neon:", error);
    res.status(200).send("ok");
  }
});

export { router as neonWebhookRoute };