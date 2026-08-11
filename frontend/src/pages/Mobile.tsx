import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Mobile() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Navegador dispara esse evento quando o app pode ser instalado
    const handler = (e: Event) => {
      e.preventDefault(); // impede o banner automático do Chrome
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detecta se já foi instalado
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    // iOS não suporta beforeinstallprompt — detecta via display-mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  // Decide o estado do botão
  const buttonLabel = isInstalled
    ? "✓ Aplicativo instalado"
    : "INSTALAR APLICATIVO";

  const buttonDisabled = isInstalled || !installPrompt;

  return (
    <main
      className="min-h-screen px-6 py-16 flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-10 items-center">
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left">
            Baixar App
          </h1>
          <p className="text-lg text-center md:text-left">
            Adicione a plataforma à tela inicial do seu celular e utilize como
            um aplicativo
          </p>
          <p className="text-center md:text-left">
            Acesse trilhas, vídeos e materiais de forma rápida diretamente do
            celular.
          </p>

          <button
            onClick={handleInstall}
            disabled={buttonDisabled}
            className={`font-semibold py-3 px-6 rounded-lg w-max self-center md:self-start transition
              ${
                isInstalled
                  ? "bg-gray-500 text-white cursor-default"
                  : installPrompt
                    ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                    : "bg-gray-400 text-white cursor-not-allowed opacity-60"
              }`}
          >
            {buttonLabel}
          </button>

          <div className="card p-6 w-full">
            <h2 className="font-bold mb-3">COMO INSTALAR</h2>

            <div className="mb-4">
              <h3 className="font-semibold">Android</h3>
              <ol className="list-decimal list-inside ml-2">
                <li>Toque no menu do navegador ( ⋮ )</li>
                <li>Selecione "Adicionar à tela inicial"</li>
                <li>Confirme a instalação</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold">iOS (iPhone)</h3>
              <ol className="list-decimal list-inside ml-2">
                <li>Toque no botão de compartilhar (↑)</li>
                <li>Selecione "Adicionar à Tela de Início"</li>
                <li>Confirme para criar o atalho</li>
              </ol>
            </div>
          </div>

          <p className="text-sm text-center md:text-left opacity-80">
            Após a instalação, o aplicativo aparecerá na tela inicial do celular
            e funcionará como um app.
          </p>
        </div>

        <div className="flex justify-center md:justify-end items-center w-full md:w-1/2">
          <img
            src="/pics/iphone.png"
            alt="Celular App"
            className="w-64 md:w-80 lg:w-70 xl:w-75 object-contain rounded-xl shadow-lg"
          />
        </div>
      </div>
    </main>
  );
}