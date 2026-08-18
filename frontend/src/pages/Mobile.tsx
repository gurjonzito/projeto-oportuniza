import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectarSistema(): "ios" | "android" | "outros" {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  if (/android/.test(ua)) {
    return "android";
  }

  return "outros";
}

const instrucoesPorSistema = {
  ios: [
    'Toque no botão de compartilhar (↑) na barra do Safari',
    'Role para baixo e selecione "Adicionar à Tela de Início"',
    'Confirme tocando em "Adicionar"',
  ],

  android: [
    'Toque no menu do navegador (⋮) no canto superior direito',
    'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"',
    'Confirme a instalação',
  ],

  outros: [
    'Abra o menu do seu navegador',
    'Procure por "Instalar aplicativo" ou "Adicionar à tela inicial"',
    'Confirme a instalação',
  ],
};

export default function Mobile() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  const sistema = detectarSistema();

  useEffect(() => {
    // Verifica se o site já está sendo executado como PWA
    const verificarInstalacao = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      const fullscreen = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;

      // Safari/iOS
      const iosStandalone =
        (window.navigator as any).standalone === true;

      setIsInstalled(
        standalone ||
        fullscreen ||
        iosStandalone
      );
    };

    // Evento disparado pelo Chrome quando o PWA pode ser instalado
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    // Evento disparado quando a instalação realmente foi concluída
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    // Verificação inicial
    verificarInstalacao();

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    // Limpeza dos eventos
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const handleInstall = async () => {
    // Chrome/Android/desktop
    if (installPrompt) {
      await installPrompt.prompt();

      const { outcome } =
        await installPrompt.userChoice;

      if (outcome === "accepted") {
        setInstallPrompt(null);
      }

      return;
    }

    // iOS ou navegador que não disponibiliza
    // beforeinstallprompt
    document
      .getElementById("instrucoes-instalacao")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const buttonLabel = isInstalled
    ? "✓ Aplicativo instalado"
    : "INSTALAR APLICATIVO";

  return (
    <main
      className="min-h-screen px-6 py-16 flex items-center justify-center"
      style={{
        backgroundColor: "var(--bg-color)",
      }}
    >
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-10 items-center">
        
        {/* Conteúdo */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          
          <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left">
            Baixar App
          </h1>

          <p className="text-lg text-center md:text-left">
            Adicione a plataforma à tela inicial do seu celular
            e utilize como um aplicativo.
          </p>

          <p className="text-center md:text-left">
            Acesse trilhas, vídeos e materiais de forma rápida
            diretamente do celular.
          </p>

          {/* Botão de instalação */}
          <button
            onClick={handleInstall}
            disabled={isInstalled}
            className={`font-semibold py-3 px-6 rounded-lg w-max self-center md:self-start transition ${
              isInstalled
                ? "bg-gray-500 text-white cursor-default"
                : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
            }`}
          >
            {buttonLabel}
          </button>

          {/* Instruções */}
          <div
            id="instrucoes-instalacao"
            className="card p-6 w-full"
          >
            <h2 className="font-bold mb-3">
              COMO INSTALAR
            </h2>

            <ol className="list-decimal list-inside space-y-2 text-sm ml-1">
              {instrucoesPorSistema[sistema].map(
                (passo, index) => (
                  <li key={index}>
                    {passo}
                  </li>
                )
              )}
            </ol>
          </div>

          <p className="text-sm text-center md:text-left opacity-80">
            Após a instalação, o aplicativo aparecerá na
            tela inicial do celular e funcionará como um app.
          </p>
        </div>

        {/* Imagem */}
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