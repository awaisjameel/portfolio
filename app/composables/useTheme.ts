export function useTheme() {
  const current = () => {
    const chosen = document.documentElement.getAttribute('data-theme')
    if (chosen === 'dark' || chosen === 'light') return chosen
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const toggleTheme = () => {
    const next = current() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private windows can refuse storage. The theme still applies to this page view.
    }
  }

  return { toggleTheme }
}
