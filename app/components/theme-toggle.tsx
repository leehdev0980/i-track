"use client";

import { useTheme } from "../theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        inline-flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        border-slate-300
        bg-white
        px-4
        py-2
        text-sm
        font-medium
        text-slate-700
        transition
        hover:bg-slate-100
        sm:w-auto
        dark:border-slate-700
        dark:bg-slate-900
        dark:text-slate-200
        dark:hover:bg-slate-800
      "
      aria-label={`Switch to ${
        theme === "light" ? "dark" : "light"
      } mode`}
    >
      <span aria-hidden="true">
        {theme === "light" ? "🌙" : "☀️"}
      </span>

      <span>
        {theme === "light" ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}