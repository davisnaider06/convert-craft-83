import { useEffect } from "react";

export function ThemeToggle() {
  // Force dark mode only - no toggle needed
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  // Return null - no visible toggle since we only support dark mode
  return null;
}
