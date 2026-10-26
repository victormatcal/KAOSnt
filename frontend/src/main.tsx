import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyCachedPrefs } from "./lib/prefs";
import { applyCachedAppearance } from "./lib/theme";

// Last known language, date format and appearance, before the first render (avoids the white flash).
applyCachedAppearance();
applyCachedPrefs();
const el = document.getElementById("root");
if (el) createRoot(el).render(<StrictMode><App /></StrictMode>);
