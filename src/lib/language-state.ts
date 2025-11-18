(function registerLanguageState(global: Window & typeof globalThis) {
  type LanguageChangeHandler = (language: string) => void;

  const LANGUAGE_EVENT = 'dashboard:languagechange';
  let currentLanguage = 'en';
  const handlers = new Set<LanguageChangeHandler>();

  function emit(lang: string): void {
    handlers.forEach(handler => {
      try {
        handler(lang);
      } catch (error) {
        console.error('languageState handler error', error);
      }
    });
    global.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: lang } }));
  }

  function setLanguageState(lang: string, options?: { silent?: boolean }): void {
    if (!lang || lang === currentLanguage) return;
    currentLanguage = lang;
    if (!options?.silent) {
      emit(currentLanguage);
    }
  }

  function getLanguageState(): string {
    return currentLanguage;
  }

  function subscribe(handler: LanguageChangeHandler): () => void {
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


