(function registerTheme(global) {
    var _a;
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeButton(true);
        }
    }
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeButton(isDark);
        lucide.createIcons();
    }
    const themeKeys = (_a = global.I18N_KEYS) === null || _a === void 0 ? void 0 : _a.theme;
    function updateThemeButton(isDark) {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (!themeBtn)
            return;
        const iconName = isDark ? 'sun' : 'moon';
        const labelKey = isDark
            ? ((themeKeys === null || themeKeys === void 0 ? void 0 : themeKeys.light) || 'theme.light')
            : ((themeKeys === null || themeKeys === void 0 ? void 0 : themeKeys.dark) || 'theme.dark');
        const label = typeof global.t === 'function'
            ? global.t(labelKey, isDark ? 'Light Mode' : 'Dark Mode')
            : (isDark ? 'Light Mode' : 'Dark Mode');
        themeBtn.innerHTML = `<i data-lucide="${iconName}" class="inline w-4 h-4 mr-2"></i><span id="theme-toggle-text">${label}</span>`;
        lucide.createIcons();
    }
    global.initializeTheme = initializeTheme;
    global.toggleTheme = toggleTheme;
    global.updateThemeButton = updateThemeButton;
})(window);
//# sourceMappingURL=theme.js.map