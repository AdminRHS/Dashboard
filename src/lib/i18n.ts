(function registerI18n(global: Window & typeof globalThis) {
  type TranslationEntry = Record<string, string>;
  type TranslationMap = Record<string, TranslationEntry>;

  const TRANSLATIONS: TranslationMap = {
    'header.title': { en: 'Yellow Cards', uk: 'Жовті картки', ru: 'Жёлтые карточки', de: 'Gelbe Karten' },
    'nav.overview': { en: 'Overview', uk: 'Огляд', ru: 'Обзор', de: 'Übersicht' },
    'nav.yellowCards': { en: 'Yellow Cards', uk: 'Жовті картки', ru: 'Жёлтые карточки', de: 'Gelbe Karten' },
    'nav.yellowCardsShort': { en: 'Yellow', uk: 'Жовті', ru: 'Жёлтые', de: 'Gelb' },
    'nav.greenCards': { en: 'Green Cards', uk: 'Зелені картки', ru: 'Зелёные карточки', de: 'Grüne Karten' },
    'nav.greenCardsShort': { en: 'Green', uk: 'Зелені', ru: 'Зелёные', de: 'Grün' },
    'nav.team': { en: 'Team', uk: 'Команда', ru: 'Команда', de: 'Team' },
    'nav.leaderboard': { en: 'Leaderboard', uk: 'Рейтинг', ru: 'Рейтинг', de: 'Bestenliste' },
    'nav.leaderboardShort': { en: 'Board', uk: 'Рейтинг', ru: 'Рейт.', de: 'Liste' },
    'theme.dark': { en: 'Dark Mode', uk: 'Темна тема', ru: 'Тёмная тема', de: 'Dunkler Modus' },
    'theme.light': { en: 'Light Mode', uk: 'Світла тема', ru: 'Светлая тема', de: 'Heller Modus' },
    'theme.darkShort': { en: 'Dark', uk: 'Темна', ru: 'Тёмная', de: 'Dunkel' },
    'section.dashboardOverview': { en: 'Dashboard Overview', uk: 'Огляд панелі', ru: 'Обзор панели', de: 'Dashboard-Überblick' },
    'section.detailedBreakdown': { en: 'Detailed Breakdown', uk: 'Детальний аналіз', ru: 'Детальный анализ', de: 'Detaillierte Analyse' },
    'section.violationCategories': { en: 'Violation Categories', uk: 'Категорії порушень', ru: 'Категории нарушений', de: 'Verstoßkategorien' },
    'section.currentMonthStatus': { en: 'Current Month Status', uk: 'Статус поточного місяця', ru: 'Статус текущего месяца', de: 'Status des laufenden Monats' },
    'section.greenCurrentStatus': { en: 'Current Month Status', uk: 'Статус поточного місяця', ru: 'Статус текущего месяца', de: 'Status des laufenden Monats' },
    'section.teamStructure': { en: 'Team Structure', uk: 'Структура команди', ru: 'Структура команды', de: 'Teamstruktur' },
    'section.membersSuffix': { en: 'Members', uk: 'учасників', ru: 'участников', de: 'Mitglieder' },
    'section.positiveLeaderboard': { en: 'Positive Leaderboard', uk: 'Позитивний рейтинг', ru: 'Позитивный рейтинг', de: 'Positive Bestenliste' },
    'section.positiveLeaderboardDescription': {
      en: 'The leaderboard shows employees ranked by the number of green cards they have received.',
      uk: 'Рейтинг показує співробітників за кількістю отриманих зелених карток.',
      ru: 'Рейтинг показывает сотрудников по количеству полученных зелёных карточек.',
      de: 'Die Bestenliste zeigt Mitarbeitende nach der Anzahl ihrer grünen Karten.'
    },
    'button.giveYellowCard': { en: 'Give Yellow Card', uk: 'Видати жовту картку', ru: 'Выдать жёлтую карточку', de: 'Gelbe Karte vergeben' },
    'button.giveGreenCard': { en: 'Give Green Card', uk: 'Видати зелену картку', ru: 'Выдать зелёную карточку', de: 'Grüne Karte vergeben' },
    'button.addEmployee': { en: 'Add Employee', uk: 'Додати співробітника', ru: 'Добавить сотрудника', de: 'Mitarbeiter hinzufügen' },
    'button.removeEmployee': { en: 'Remove Employee', uk: 'Видалити співробітника', ru: 'Удалить сотрудника', de: 'Mitarbeiter entfernen' },
    'filters.week': { en: 'Week', uk: 'Тиждень', ru: 'Неделя', de: 'Woche' },
    'filters.month': { en: 'Month', uk: 'Місяць', ru: 'Месяц', de: 'Monat' },
    'filters.new': { en: 'New', uk: 'Нові', ru: 'Новые', de: 'Neu' },
    'filters.allTime': { en: 'All Time', uk: 'Увесь час', ru: 'За всё время', de: 'Gesamte Zeit' },
    'table.employee': { en: 'Employee', uk: 'Співробітник', ru: 'Сотрудник', de: 'Mitarbeiter' },
    'table.department': { en: 'Department', uk: 'Відділ', ru: 'Отдел', de: 'Abteilung' },
    'table.cards': { en: 'Cards', uk: 'Картки', ru: 'Карточки', de: 'Karten' },
    'table.violationTypes': { en: 'Violation Types', uk: 'Типи порушень', ru: 'Типы нарушений', de: 'Verstoßarten' },
    'table.status': { en: 'Status', uk: 'Статус', ru: 'Статус', de: 'Status' },
    'table.greenCards': { en: 'Green Cards', uk: 'Зелені картки', ru: 'Зелёные карточки', de: 'Grüne Karten' },
    'table.cardTypes': { en: 'Card Types', uk: 'Типи карток', ru: 'Типы карточек', de: 'Kartentypen' },
    'table.notes': { en: 'Notes/Badges', uk: 'Нотатки/Відзнаки', ru: 'Заметки/Значки', de: 'Notizen/Auszeichnungen' },
    'table.lastGreenCard': { en: 'Last Green Card', uk: 'Остання зелена картка', ru: 'Последняя зелёная карточка', de: 'Letzte grüne Karte' },
    'input.searchPlaceholder': { en: 'Search by name...', uk: 'Пошук за ім’ям...', ru: 'Поиск по имени...', de: 'Nach Namen suchen...' },
    'stats.teamSizeLabel': { en: 'Team Size:', uk: 'Розмір команди:', ru: 'Размер команды:', de: 'Teamgröße:' },
    'stats.totalCardsLabel': { en: 'Total Cards:', uk: 'Всього карток:', ru: 'Всего карточек:', de: 'Gesamtzahl Karten:' },
    'stats.employeesSuffix': { en: 'employees', uk: 'співробітників', ru: 'сотрудников', de: 'Mitarbeiter' },
    'stats.totalEmployeesLabel': { en: 'Total Employees', uk: 'Загальна кількість співробітників', ru: 'Всего сотрудников', de: 'Gesamtmitarbeiter' },
    'stats.complianceLabel': { en: 'Compliance', uk: 'Відповідність', ru: 'Соблюдение', de: 'Compliance' },
    'stats.atRiskLabel': { en: 'AT RISK', uk: 'У ГРУПІ РИЗИКУ', ru: 'В ГРУППЕ РИСКА', de: 'RISIKO' },
    'stats.atRiskHint': { en: '(5+ cards)', uk: '(5+ карток)', ru: '(5+ карточек)', de: '(5+ Karten)' },
    'stats.mostViolationsLabel': { en: 'MOST VIOL.', uk: 'НАЙБІЛЬШ ПОРУШ.', ru: 'БОЛЬШЕ ВСЕГО НАРУШ.', de: 'MEISTE VERST.' },
    'stats.greenCardsLabel': { en: 'Green Cards', uk: 'Зелені картки', ru: 'Зелёные карточки', de: 'Grüne Karten' },
    'stats.yellowCardsLabel': { en: 'Yellow Cards', uk: 'Жовті картки', ru: 'Жёлтые карточки', de: 'Gelbe Karten' },
    'stats.orangeCardsLabel': { en: 'Orange Cards', uk: 'Помаранчеві картки', ru: 'Оранжевые карточки', de: 'Orange Karten' },
    'stats.redCardsLabel': { en: 'Red Cards', uk: 'Червоні картки', ru: 'Красные карточки', de: 'Rote Karten' },
    'cards.documentation': { en: 'Documentation', uk: 'Документація', ru: 'Документация', de: 'Dokumentation' },
    'cards.workflow': { en: 'Workflow', uk: 'Робочий процес', ru: 'Рабочий процесс', de: 'Workflow' },
    'cards.communication': { en: 'Communication', uk: 'Комунікація', ru: 'Коммуникация', de: 'Kommunikation' }
  };

  const SUPPORTED_LANGS = ['en', 'uk', 'ru', 'de'] as const;
  type SupportedLang = (typeof SUPPORTED_LANGS)[number];

  function getInitialLanguage(): SupportedLang {
    const stored = (localStorage.getItem('dashboard-language') || document.documentElement.lang || 'en').toLowerCase();
    return (SUPPORTED_LANGS.includes(stored as SupportedLang) ? (stored as SupportedLang) : 'en');
  }

  let currentLanguage: SupportedLang = getInitialLanguage();

  function translate(key: string, fallback = ''): string {
    const entry = TRANSLATIONS[key];
    if (entry) {
      return entry[currentLanguage] || entry.en || fallback || key;
    }
    return fallback || key;
  }

  function setElementContent(element: Element, key: string): void {
    const attr = element.getAttribute('data-i18n-attr');
    const fallback = attr ? element.getAttribute(attr) || '' : element.textContent || '';
    const translated = translate(key, fallback);
    if (attr) {
      element.setAttribute(attr, translated);
    } else {
      element.textContent = translated;
    }
  }

  function getScopeElements(root?: Element | Document | DocumentFragment): NodeListOf<Element> {
    if (root instanceof Element || root instanceof DocumentFragment) {
      return root.querySelectorAll('[data-i18n-key]');
    }
    if (root instanceof Document) {
      return root.querySelectorAll('[data-i18n-key]');
    }
    return document.querySelectorAll('[data-i18n-key]');
  }

  function applyTranslations(root?: Element | Document | DocumentFragment): void {
    const elements = getScopeElements(root);
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (!key) return;
      setElementContent(el, key);
    });
    document.documentElement.lang = currentLanguage;
  }

  function updateLanguageSelect(): void {
    const select = document.getElementById('language-select') as HTMLSelectElement | null;
    if (select) {
      select.value = currentLanguage;
    }
  }

  function setLanguage(lang: string): void {
    const normalized = lang.toLowerCase() as SupportedLang;
    if (!SUPPORTED_LANGS.includes(normalized) || normalized === currentLanguage) return;
    currentLanguage = normalized;
    localStorage.setItem('dashboard-language', currentLanguage);
    applyTranslations();
    updateLanguageSelect();
    if (typeof global.updateThemeButton === 'function') {
      const isDark = document.body.classList.contains('dark-theme');
      global.updateThemeButton(isDark);
    }
  }

  function initLanguageSelector(): void {
    const select = document.getElementById('language-select') as HTMLSelectElement | null;
    if (!select) return;
    select.value = currentLanguage;
    select.addEventListener('change', event => {
      const value = (event.target as HTMLSelectElement).value;
      setLanguage(value);
    });
  }

  function handleDOMContentLoaded(): void {
    initLanguageSelector();
    applyTranslations();
  }

  window.addEventListener('dashboard:rendered', () => {
    applyTranslations();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
  } else {
    handleDOMContentLoaded();
  }

  global.t = translate;
  global.applyTranslations = applyTranslations;
  global.setLanguage = setLanguage;
  global.getCurrentLanguage = () => currentLanguage;
})(window);


