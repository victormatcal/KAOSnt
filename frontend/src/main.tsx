import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyCachedPrefs } from "./lib/prefs";
import { applyCachedAppearance } from "./lib/theme";

// Último idioma, formato de fecha y aspecto conocidos, antes del primer render (evita el destello blanco).
applyCachedAppearance();
applyCachedPrefs();
const el = document.getElementById("root");
if (el) createRoot(el).render(<StrictMode><App /></StrictMode>);
