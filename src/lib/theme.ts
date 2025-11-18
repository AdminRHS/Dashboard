(function registerTheme(global: Window & typeof globalThis) {
  function initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      updateThemeButton(true);
    }
  }

  function toggleTheme(): void {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton(isDark);
    lucide.createIcons();
  }

  const themeKeys = global.I18N_KEYS?.theme;

  function updateThemeButton(isDark: boolean): void {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;
    const iconName = isDark ? 'sun' : 'moon';
    const labelKey = isDark
      ? themeKeys?.light || 'theme.light'
      : themeKeys?.dark || 'theme.dark';
    const label =
      typeof global.t === 'function'
        ? global.t(labelKey, isDark ? 'Light Mode' : 'Dark Mode')
        : isDark
          ? 'Light Mode'
          : 'Dark Mode';
    themeBtn.innerHTML = `<i data-lucide="${iconName}" class="inline w-4 h-4 mr-2"></i><span id="theme-toggle-text">${label}</span>`;
    lucide.createIcons();
  }

  global.initializeTheme = initializeTheme;
  global.toggleTheme = toggleTheme;
  global.updateThemeButton = updateThemeButton;
})(window);


