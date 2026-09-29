import AppRoutes from "./routes/AppRoutes";
import ReloadPrompt from "./components/ReloadPrompt";

function App() {
  return (
    <main>
      <AppRoutes />
      <ReloadPrompt />
    </main>
  );
}

export default App;