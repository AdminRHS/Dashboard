(function registerLanguageState(global) {
    const LANGUAGE_EVENT = 'dashboard:languagechange';
    let currentLanguage = 'en';
    const handlers = new Set();
    function emit(lang) {
        handlers.forEach(handler => {
            try {
                handler(lang);
            }
            catch (error) {
                console.error('languageState handler error', error);
            }
        });
        global.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: lang } }));
    }
    function setLanguageState(lang, options) {
        if (!lang || lang === currentLanguage)
            return;
        currentLanguage = lang;
        if (!options?.silent) {
            emit(currentLanguage);
        }
    }
    function getLanguageState() {
        return currentLanguage;
    }
    function subscribe(handler) {
        handlers.add(handler);
        return () => handlers.delete(handler);
    }
    global.languageState = {
        getLanguage: getLanguageState,
        setLanguageState,
        subscribe,
        LANGUAGE_EVENT
    };
})(window);
//# sourceMappingURL=language-state.js.map