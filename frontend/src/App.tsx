import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import ReloadPrompt from "./components/ReloadPrompt";
import { aplicarPreferenciasGlobais } from "./pages/Preferences";

function App() {
  // Aplica as preferências salvas assim que o app carrega
  useEffect(() => {
    aplicarPreferenciasGlobais();
  }, []);

  return (
    <main>
      <AppRoutes />
      <ReloadPrompt />
    </main>
  );
}

export default App;