(function registerI18n(global) {
    const KEYS = global.I18N_KEYS;
    const TRANSLATIONS = {
        [KEYS.header.title]: { en: 'Yellow Cards', uk: 'Жовті картки', ru: 'Жёлтые карточки', de: 'Gelbe Karten' },
        [KEYS.nav.overview]: { en: 'Overview', uk: 'Огляд', ru: 'Обзор', de: 'Übersicht' },
        [KEYS.nav.yellowCards]: { en: 'Yellow Cards', uk: 'Жовті картки', ru: 'Жёлтые карточки', de: 'Gelbe Karten' },
        [KEYS.nav.yellowCardsShort]: { en: 'Yellow', uk: 'Жовті', ru: 'Жёлтые', de: 'Gelb' },
        [KEYS.nav.greenCards]: { en: 'Green Cards', uk: 'Зелені картки', ru: 'Зелёные карточки', de: 'Grüne Karten' },
        [KEYS.nav.greenCardsShort]: { en: 'Green', uk: 'Зелені', ru: 'Зелёные', de: 'Grün' },
        [KEYS.nav.team]: { en: 'Team', uk: 'Команда', ru: 'Команда', de: 'Team' },
        [KEYS.nav.leaderboard]: { en: 'Leaderboard', uk: 'Рейтинг', ru: 'Рейтинг', de: 'Bestenliste' },
        [KEYS.nav.leaderboardShort]: { en: 'Board', uk: 'Рейтинг', ru: 'Рейт.', de: 'Liste' },
        [KEYS.theme.dark]: { en: 'Dark Mode', uk: 'Темна тема', ru: 'Тёмная тема', de: 'Dunkler Modus' },
        [KEYS.theme.light]: { en: 'Light Mode', uk: 'Світла тема', ru: 'Светлая тема', de: 'Heller Modus' },
        [KEYS.theme.darkShort]: { en: 'Dark', uk: 'Темна', ru: 'Тёмная', de: 'Dunkel' },
        [KEYS.section.dashboardOverview]: { en: 'Dashboard Overview', uk: 'Огляд панелі', ru: 'Обзор панели', de: 'Dashboard-Überblick' },
        [KEYS.section.detailedBreakdown]: { en: 'Detailed Breakdown', uk: 'Детальний аналіз', ru: 'Детальный анализ', de: 'Detaillierte Analyse' },
        [KEYS.section.violationCategories]: { en: 'Violation Categories', uk: 'Категорії порушень', ru: 'Категории нарушений', de: 'Verstoßkategorien' },
        [KEYS.section.currentMonthStatus]: { en: 'Current Month Status', uk: 'Статус поточного місяця', ru: 'Статус текущего месяца', de: 'Status des laufenden Monats' },
        [KEYS.section.greenCurrentStatus]: { en: 'Current Month Status', uk: 'Статус поточного місяця', ru: 'Статус текущего месяца', de: 'Status des laufenden Monats' },
        [KEYS.section.teamStructure]: { en: 'Team Structure', uk: 'Структура команди', ru: 'Структура команды', de: 'Teamstruktur' },
        [KEYS.section.membersSuffix]: { en: 'Members', uk: 'учасників', ru: 'участников', de: 'Mitglieder' },
        [KEYS.section.positiveLeaderboard]: { en: 'Positive Leaderboard', uk: 'Позитивний рейтинг', ru: 'Позитивный рейтинг', de: 'Positive Bestenliste' },
        [KEYS.section.positiveLeaderboardDescription]: {
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
        'table.never': { en: 'Never', uk: 'Ніколи', ru: 'Никогда', de: 'Nie' },
        'table.noResults': { en: 'No employees match the selected filters.', uk: 'Немає співробітників за обраними фільтрами.', ru: 'Нет сотрудников, соответствующих выбранным фильтрам.', de: 'Keine Mitarbeitenden passen zu den Filtern.' },
        'input.searchPlaceholder': { en: 'Search by name...', uk: 'Пошук за ім’ям...', ru: 'Поиск по имени...', de: 'Nach Namen suchen...' },
        'input.selectEmployee': { en: 'Select an employee...', uk: 'Виберіть співробітника...', ru: 'Выберите сотрудника...', de: 'Mitarbeiter auswählen...' },
        'input.selectType': { en: 'Select a type...', uk: 'Виберіть тип...', ru: 'Выберите тип...', de: 'Typ auswählen...' },
        'input.selectEmployeeRemove': { en: 'Select an employee to remove...', uk: 'Виберіть співробітника для видалення...', ru: 'Выберите сотрудника для удаления...', de: 'Mitarbeiter zum Entfernen wählen...' },
        'input.addDetailsPlaceholder': { en: 'Add specific details...', uk: 'Додайте конкретні деталі...', ru: 'Добавьте подробности...', de: 'Details hinzufügen...' },
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
        'cards.communication': { en: 'Communication', uk: 'Комунікація', ru: 'Коммуникация', de: 'Kommunikation' },
        'modals.violationsHeading': { en: 'Violations:', uk: 'Порушення:', ru: 'Нарушения:', de: 'Verstöße:' },
        'modals.greenCardsHeading': { en: 'Green Cards:', uk: 'Зелені картки:', ru: 'Зелёные карточки:', de: 'Grüne Karten:' },
        'modals.dayTitle': { en: 'Violations on {date}', uk: 'Порушення за {date}', ru: 'Нарушения за {date}', de: 'Verstöße am {date}' },
        'modals.noViolations': { en: 'No violations recorded for this day.', uk: 'На цей день порушень не зафіксовано.', ru: 'На этот день нарушений не зарегистрировано.', de: 'Keine Verstöße für diesen Tag.' },
        'modals.noComment': { en: 'No comment', uk: 'Без коментаря', ru: 'Без комментария', de: 'Kein Kommentar' },
        'badges.new': { en: 'New', uk: 'Новий', ru: 'Новый', de: 'Neu' },
        'badges.streak3': { en: '⭐ 3+ cards', uk: '⭐ 3+ карток', ru: '⭐ 3+ карточки', de: '⭐ 3+ Karten' },
        'badges.streak5': { en: '⭐ 5+ cards', uk: '⭐ 5+ карток', ru: '⭐ 5+ карточек', de: '⭐ 5+ Karten' },
        'badges.streak10': { en: '⭐ 10+ cards', uk: '⭐ 10+ карток', ru: '⭐ 10+ карточек', de: '⭐ 10+ Karten' }
    };
    const SUPPORTED_LANGS = ['en', 'uk', 'ru', 'de'];
    function getInitialLanguage() {
        const stored = (localStorage.getItem('dashboard-language') || document.documentElement.lang || 'en').toLowerCase();
        return (SUPPORTED_LANGS.includes(stored) ? stored : 'en');
    }
    let currentLanguage = getInitialLanguage();
    let dateFormatter = new Intl.DateTimeFormat(currentLanguage, { month: 'long', year: 'numeric' });
    function translate(key, fallback = '') {
        const entry = TRANSLATIONS[key];
        if (entry) {
            return entry[currentLanguage] || entry.en || fallback || key;
        }
        return fallback || key;
    }
    function translateWithArgs(key, replacements, fallback = '') {
        const template = translate(key, fallback);
        return template.replace(/\{(\w+)\}/g, (match, token) => {
            return Object.prototype.hasOwnProperty.call(replacements, token) ? replacements[token] : match;
        });
    }
    function formatMonthYear(date) {
        return dateFormatter.format(date);
    }
    function formatDateLong(date) {
        const formatter = new Intl.DateTimeFormat(currentLanguage, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return formatter.format(date);
    }
    function setElementContent(element, key) {
        const attr = element.getAttribute('data-i18n-attr');
        const fallback = attr ? element.getAttribute(attr) || '' : element.textContent || '';
        const translated = translate(key, fallback);
        if (attr) {
            element.setAttribute(attr, translated);
        }
        else {
            element.textContent = translated;
        }
    }
    function getScopeElements(root) {
        if (root instanceof Element || root instanceof DocumentFragment) {
            return root.querySelectorAll('[data-i18n-key]');
        }
        if (root instanceof Document) {
            return root.querySelectorAll('[data-i18n-key]');
        }
        return document.querySelectorAll('[data-i18n-key]');
    }
    function applyTranslations(root) {
        const elements = getScopeElements(root);
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n-key');
            if (!key)
                return;
            setElementContent(el, key);
        });
        document.documentElement.lang = currentLanguage;
    }
    function updateLanguageSelect() {
        const select = document.getElementById('language-select');
        if (select) {
            select.value = currentLanguage;
        }
    }
    function setLanguage(lang) {
        const normalized = lang.toLowerCase();
        if (!SUPPORTED_LANGS.includes(normalized) || normalized === currentLanguage)
            return;
        currentLanguage = normalized;
        localStorage.setItem('dashboard-language', currentLanguage);
        dateFormatter = new Intl.DateTimeFormat(currentLanguage, { month: 'long', year: 'numeric' });
        applyTranslations();
        updateLanguageSelect();
        if (typeof global.updateThemeButton === 'function') {
            const isDark = document.body.classList.contains('dark-theme');
            global.updateThemeButton(isDark);
        }
    }
    function initLanguageSelector() {
        const select = document.getElementById('language-select');
        if (!select)
            return;
        select.value = currentLanguage;
        select.addEventListener('change', event => {
            const value = event.target.value;
            setLanguage(value);
        });
    }
    function handleDOMContentLoaded() {
        initLanguageSelector();
        applyTranslations();
    }
    window.addEventListener('dashboard:rendered', () => {
        applyTranslations();
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    }
    else {
        handleDOMContentLoaded();
    }
    global.t = translate;
    global.applyTranslations = applyTranslations;
    global.setLanguage = setLanguage;
    global.getCurrentLanguage = () => currentLanguage;
    global.formatMonthYear = formatMonthYear;
    global.formatDateLong = formatDateLong;
    global.translateWithArgs = translateWithArgs;
})(window);
//# sourceMappingURL=i18n.js.map