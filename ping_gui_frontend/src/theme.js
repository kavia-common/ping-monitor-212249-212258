 /**
  * PUBLIC_INTERFACE
  * getThemeName returns the current theme label for UI rendering.
  * Note: Current implementation relies on CSS variables in App.css.
  */
export function getThemeName(pref) {
  return pref === 'dark' ? 'Dark' : 'Light';
}
