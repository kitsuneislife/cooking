import { createContext, useContext, useEffect, useState } from "react";
import Switch from "./components/Switch";
import { useLang } from "./i18n";

// Tema claro ou escuro. Quem manda é o atributo data-theme do <html>: o CSS escuro mora
// embaixo de :root[data-theme="dark"] (fim de styles.css).
// O index.html já escolhe o tema antes de a página aparecer (sem piscar branco):
// a escolha salva, ou então o tema do sistema. Ao trocar aqui, a escolha fica salva.

const KEY = "tema";
const SYSTEM = matchMedia("(prefers-color-scheme: dark)");

// localStorage pode não existir ou dar erro (aba anônima, bloqueio): aí só não salva
function saved() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function save(theme) {
  try { localStorage.setItem(KEY, theme); } catch { /* sem armazenamento: vale só nesta visita */ }
}

const initial = () => document.documentElement.dataset.theme ?? (SYSTEM.matches ? "dark" : "light");

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(initial);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // sem escolha salva, acompanha o sistema (ex.: o computador escurece à noite)
  useEffect(() => {
    const follow = (e) => { if (!saved()) setThemeState(e.matches ? "dark" : "light"); };
    SYSTEM.addEventListener("change", follow);
    return () => SYSTEM.removeEventListener("change", follow);
  }, []);

  const setTheme = (next) => { save(next); setThemeState(next); };
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// sol e lua desenhados à mão, no traço dos outros ícones
const Sun = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4.6" fill="currentColor" />
    <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
const Moon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor" />
  </svg>
);

// Seletor claro / escuro: a mesma pílula do idioma, com sol e lua
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const options = [
    { id: "light", label: <Sun />, name: t.light },
    { id: "dark", label: <Moon />, name: t.dark },
  ];
  return <Switch className="theme-switch" label={t.theme} value={theme} options={options} onChange={setTheme} />;
}
