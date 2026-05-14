// src/theme.ts

export const initTheme = () => {
  const saved = localStorage.getItem("theme");

  // se não tiver salvo, inicia no light mode
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

export const toggleTheme = () => {
  const root = document.documentElement;
  const dark = root.classList.contains("dark");

  if (dark) {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
};