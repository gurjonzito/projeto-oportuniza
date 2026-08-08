import emailjs from "@emailjs/browser";

interface EmailData {
  nome: string;
  email: string;
  mensagem: string;
}

export async function enviarEmail(data: EmailData) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: data.nome,
      from_email: data.email,
      message: data.mensagem,
    },
    {
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    }
  );
}