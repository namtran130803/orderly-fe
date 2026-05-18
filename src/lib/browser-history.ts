import type { NavigateFunction } from "react-router-dom";

/** True when this tab likely has a prior history entry (browser / SPA back one step). */
export function canBrowserGoBack(): boolean {
  return typeof window !== "undefined" && window.history.length > 1;
}

/**
 * Prefer history.back so list→form saves don't leave duplicate list entries.
 * If there is no prior entry, replace current URL with `fallbackTo`.
 */
export function navigateBackOrTo(navigate: NavigateFunction, fallbackTo: string) {
  if (canBrowserGoBack()) {
    navigate(-1);
  } else {
    navigate(fallbackTo, { replace: true });
  }
}
