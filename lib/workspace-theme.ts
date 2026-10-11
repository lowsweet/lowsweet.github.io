// Used by the client layout effect while asynchronous preferences restore.
export function readWorkspaceTheme(): 'light' | 'dark' {
  try {
    if (typeof window !== 'undefined') {
      const preferences = JSON.parse(window.localStorage.getItem('linkeai-preferences') || 'null');
      if (preferences?.theme === 'light' || preferences?.theme === 'dark') return preferences.theme;
    }
  } catch { /* Invalid or unavailable storage uses the existing default. */ }
  return 'dark';
}

// Keep explicit script text: SSR optimizers erase browser-only branches from
// functions, so serializing readWorkspaceTheme.toString() would always be dark.
export const WORKSPACE_THEME_BOOTSTRAP = `(() => {
  if (window.location.pathname !== '/app' && window.location.pathname !== '/app/') return;
  let theme = 'dark';
  try {
    const preferences = JSON.parse(window.localStorage.getItem('linkeai-preferences') || 'null');
    if (preferences?.theme === 'light' || preferences?.theme === 'dark') theme = preferences.theme;
  } catch {}
  document.documentElement.dataset.workspaceTheme = theme;
})();`;
