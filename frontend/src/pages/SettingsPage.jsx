import React from "react";
import { useThemeStore } from "../store/useThemeStore";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={toggleTheme}
        className="btn"
      >
        Mode: {theme === "light" ? "🌞 Light" : "🌙 Dark"}
      </button>
    </div>
  );
};

export default SettingsPage;
