(function registerI18nKeys(global) {
    const I18N_KEYS = {
        header: {
            title: 'header.title'
        },
        nav: {
            overview: 'nav.overview',
            yellowCards: 'nav.yellowCards',
            yellowCardsShort: 'nav.yellowCardsShort',
            greenCards: 'nav.greenCards',
            greenCardsShort: 'nav.greenCardsShort',
            team: 'nav.team',
            leaderboard: 'nav.leaderboard',
            leaderboardShort: 'nav.leaderboardShort'
        },
        theme: {
            dark: 'theme.dark',
            light: 'theme.light',
            darkShort: 'theme.darkShort'
        },
        section: {
            dashboardOverview: 'section.dashboardOverview',
            detailedBreakdown: 'section.detailedBreakdown',
            violationCategories: 'section.violationCategories',
            currentMonthStatus: 'section.currentMonthStatus',
            greenCurrentStatus: 'section.greenCurrentStatus',
            teamStructure: 'section.teamStructure',
            positiveLeaderboard: 'section.positiveLeaderboard',
            positiveLeaderboardDescription: 'section.positiveLeaderboardDescription',
            membersSuffix: 'section.membersSuffix'
        },
        button: {
            giveYellowCard: 'button.giveYellowCard',
            giveGreenCard: 'button.giveGreenCard',
            addEmployee: 'button.addEmployee',
            removeEmployee: 'button.removeEmployee'
        },
        filters: {
            week: 'filters.week',
            month: 'filters.month',
            new: 'filters.new',
            allTime: 'filters.allTime'
        },
        table: {
            employee: 'table.employee',
            department: 'table.department',
            cards: 'table.cards',
            violationTypes: 'table.violationTypes',
            status: 'table.status',
            greenCards: 'table.greenCards',
            cardTypes: 'table.cardTypes',
            notes: 'table.notes',
            lastGreenCard: 'table.lastGreenCard',
            never: 'table.never',
            noResults: 'table.noResults'
        },
        input: {
            searchPlaceholder: 'input.searchPlaceholder',
            selectEmployee: 'input.selectEmployee',
            selectType: 'input.selectType',
            selectEmployeeRemove: 'input.selectEmployeeRemove',
            addDetailsPlaceholder: 'input.addDetailsPlaceholder'
        },
        modals: {
            violationsHeading: 'modals.violationsHeading',
            greenCardsHeading: 'modals.greenCardsHeading',
            dayTitle: 'modals.dayTitle',
            noViolations: 'modals.noViolations',
            noComment: 'modals.noComment',
            greenDayTitle: 'modals.greenDayTitle',
            noGreenCards: 'modals.noGreenCards'
        },
        badges: {
            new: 'badges.new',
            streak3: 'badges.streak3',
            streak5: 'badges.streak5',
            streak10: 'badges.streak10'
        },
        stats: {
            teamSizeLabel: 'stats.teamSizeLabel',
            totalCardsLabel: 'stats.totalCardsLabel',
            employeesSuffix: 'stats.employeesSuffix',
            totalEmployeesLabel: 'stats.totalEmployeesLabel',
            complianceLabel: 'stats.complianceLabel',
            atRiskLabel: 'stats.atRiskLabel',
            atRiskHint: 'stats.atRiskHint',
            mostViolationsLabel: 'stats.mostViolationsLabel',
            greenCardsLabel: 'stats.greenCardsLabel',
            yellowCardsLabel: 'stats.yellowCardsLabel',
            orangeCardsLabel: 'stats.orangeCardsLabel',
            redCardsLabel: 'stats.redCardsLabel'
        },
        cards: {
            documentation: 'cards.documentation',
            workflow: 'cards.workflow',
            communication: 'cards.communication'
        }
    };
    global.I18N_KEYS = I18N_KEYS;
})(window);
//# sourceMappingURL=i18n-keys.js.map