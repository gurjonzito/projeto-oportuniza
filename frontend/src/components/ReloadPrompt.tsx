import { useRegisterSW } from "virtual:pwa-register/react";

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      console.log(`Service Worker registrado: ${swUrl}`);
    },
    onRegisterError(error) {
      console.error("Erro ao registrar Service Worker:", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className="rounded-2xl shadow-xl p-4 border flex flex-col gap-3"
        style={{
          backgroundColor: "var(--card-bg, white)",
          borderColor: "var(--border-color, #e5e7eb)",
          color: "var(--text-color, #111827)",
        }}
      >
        <p className="text-sm font-medium">
          {offlineReady ? (
            "App pronto para funcionar offline!"
          ) : (
            "Nova versão disponível. Atualize para continuar."
          )}
        </p>

        <div className="flex gap-2 justify-end">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-2 rounded-xl bg-[#1E40AF] text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              Atualizar
            </button>
          )}
          <button
            onClick={close}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-black/5"
            style={{ borderColor: "var(--border-color, #e5e7eb)" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}