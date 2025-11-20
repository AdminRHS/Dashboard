(function registerLeaderboard(global) {
    const PERIOD_FILTER_EVENT = 'dashboard:periodfilterchange';
    const I18N = global.I18N_KEYS;
    const translate = (key, fallback) => typeof global.t === 'function' ? global.t(key, fallback) : fallback;
    function renderLeaderboard() {
        const tableBody = document.getElementById('leaderboard-table-body');
        const pedestalContainer = document.getElementById('leaderboard-pedestal');
        if (!tableBody || !pedestalContainer)
            return;
        const searchInput = document.getElementById('leaderboard-search');
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const deptDropdown = document.querySelector('#leaderboard-dept-filter-container .custom-dropdown-toggle');
        const selectedDept = deptDropdown ? deptDropdown.dataset.value || '' : '';
        const periodBtn = document.querySelector('#leaderboard-period-filter .period-btn.active');
        const selectedPeriod = periodBtn ? periodBtn.dataset.period || 'all' : 'all';
        const badgeTexts = {
            new: translate(I18N?.badges?.new || 'badges.new', 'New'),
            streak3: translate(I18N?.badges?.streak3 || 'badges.streak3', '⭐ 3+ cards'),
            streak5: translate(I18N?.badges?.streak5 || 'badges.streak5', '⭐ 5+ cards'),
            streak10: translate(I18N?.badges?.streak10 || 'badges.streak10', '⭐ 10+ cards')
        };
        const neverText = translate(I18N?.table?.never || 'table.never', 'Never');
        const noResultsText = translate(I18N?.table?.noResults || 'table.noResults', 'No employees match the selected filters.');
        const formatDateLocalized = typeof global.formatDateLong === 'function'
            ? global.formatDateLong
            : (date) => date.toLocaleDateString();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isDarkMode = document.body.classList.contains('dark-theme');
        const leaderboardData = employees.map(emp => {
            const greenCards = emp.greenCards || [];
            const greenCardsCount = greenCards.length;
            const lastGreenCard = greenCards.length > 0
                ? greenCards.reduce((latest, gc) => new Date(gc.date) > new Date(latest.date) ? gc : latest)
                : null;
            let lastGreenCardDate = null;
            if (lastGreenCard && lastGreenCard.date) {
                const raw = lastGreenCard.date;
                let dateObj;
                if (typeof raw === 'string') {
                    const dateStr = raw.includes('T') ? raw.split('T')[0] : raw;
                    dateObj = new Date(dateStr);
                }
                else if (raw instanceof Date) {
                    dateObj = raw;
                }
                else {
                    dateObj = new Date(raw);
                }
                if (!Number.isNaN(dateObj.getTime())) {
                    lastGreenCardDate = formatDateLocalized(dateObj);
                }
            }
            const daysInSystem = Math.floor((today.getTime() - new Date(emp.joinDate || today).getTime()) / (1000 * 60 * 60 * 24));
            const badges = [];
            if (daysInSystem < 14)
                badges.push({ type: 'new', text: badgeTexts.new });
            if (greenCardsCount >= 10)
                badges.push({ type: 'streak', text: badgeTexts.streak10 });
            else if (greenCardsCount >= 5)
                badges.push({ type: 'streak', text: badgeTexts.streak5 });
            else if (greenCardsCount >= 3)
                badges.push({ type: 'streak', text: badgeTexts.streak3 });
            return { ...emp, greenCardsCount, lastGreenCardDate, daysInSystem, badges };
        });
        const pedestalEligible = leaderboardData
            .filter(e => e.daysInSystem >= 14)
            .sort((a, b) => b.greenCardsCount - a.greenCardsCount || a.name.localeCompare(b.name));
        const top3 = pedestalEligible.slice(0, 3);
        const pedestalData = [
            { rank: 1, medal: '🥇', color: 'rgb(250 169 69 / 20%)', order: 2, heightClass: 'plinth-1', sizeClass: 'text-6xl' },
            { rank: 2, medal: '🥈', color: 'rgb(225 210 239 / 50%)', order: 1, heightClass: 'plinth-2', sizeClass: 'text-5xl' },
            { rank: 3, medal: '🥉', color: 'rgb(210 141 89 / 30%)', order: 3, heightClass: 'plinth-3', sizeClass: 'text-4xl' }
        ];
        pedestalContainer.innerHTML = top3.map((emp, index) => {
            const place = pedestalData[index];
            const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
            let deptColor = departmentColors[emp.dept] || departmentColors.default;
            if (isDarkMode && deptColor === '#8e1c1c') {
                deptColor = '#be3535';
            }
            return `
                <div class="pedestal-item-v2 cursor-pointer" style="order: ${place.order};" onclick="navigateToEmployee('${emp.name}')">
                    <div class="pedestal-card" style="border-color: ${deptColor}; width: 200px;">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="font-bold text-gray-500 text-sm">${initials}</span>
                            </div>
                            <div class="text-left overflow-hidden">
                                <h4 class="font-bold text-gray-800 text-sm truncate">${emp.name}</h4>
                                <div class="text-xs truncate font-semibold" style="color: ${deptColor};">${emp.role}</div>
                            </div>
                        </div>
                    </div>
                    <div class="pedestal-plinth ${place.heightClass}" style="background-color: ${place.color};">
                        <div class="${place.sizeClass}">${place.medal}</div>
                    </div>
                </div>
            `;
        }).join('');
        const filteredData = leaderboardData.filter(emp => {
            const nameMatch = emp.name.toLowerCase().includes(searchTerm);
            const deptMatch = !selectedDept || emp.dept === selectedDept;
            let periodMatch = false;
            if (selectedPeriod === 'all') {
                periodMatch = true;
            }
            else if (selectedPeriod === 'new') {
                periodMatch = emp.daysInSystem < 14;
            }
            else {
                const days = parseInt(selectedPeriod, 10);
                const greenCardsInPeriod = emp.greenCards ? emp.greenCards.filter(gc => {
                    const cardDate = new Date(gc.date);
                    const daysDiff = Math.floor((today.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff <= days;
                }).length : 0;
                periodMatch = greenCardsInPeriod > 0;
            }
            return nameMatch && deptMatch && periodMatch;
        }).sort((a, b) => b.greenCardsCount - a.greenCardsCount || a.name.localeCompare(b.name));
        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-8">${noResultsText}</td></tr>`;
        }
        else {
            tableBody.innerHTML = filteredData.map(emp => `
                <tr class="cursor-pointer" data-employee-name="${emp.name}">
                    <td>${emp.name}</td>
                    <td>${emp.dept}</td>
                    <td>${emp.lastGreenCardDate || neverText}</td>
                    <td class="font-bold text-lg text-green-600">${emp.greenCardsCount}</td>
                    <td>${emp.badges.map(b => `<span class="badge badge-${b.type}">${b.text}</span>`).join(' ')}</td>
                </tr>
            `).join('');
        }
    }
    function populateDeptFilter() {
        const container = document.getElementById('leaderboard-dept-filter-container');
        if (!container)
            return;
        const depts = [...new Set(employees.map(e => e.dept))].sort();
        const options = [
            { value: '', text: 'All Departments' },
            ...depts.map(d => ({ value: d, text: d }))
        ];
        createDropdown('leaderboard-dept-filter-container', options, 'All Departments', renderLeaderboard);
    }
    function setPeriodFilter(buttonElement) {
        document.querySelectorAll('#leaderboard-period-filter .period-btn').forEach(btn => btn.classList.remove('active'));
        buttonElement.classList.add('active');
        renderLeaderboard();
        global.dispatchEvent(new CustomEvent(PERIOD_FILTER_EVENT, { detail: { button: buttonElement } }));
    }
    const LANGUAGE_EVENT = global.languageState?.LANGUAGE_EVENT || 'dashboard:languagechange';
    global.addEventListener(LANGUAGE_EVENT, () => {
        renderLeaderboard();
    });
    global.renderLeaderboard = renderLeaderboard;
    global.populateDeptFilter = populateDeptFilter;
    global.setPeriodFilter = setPeriodFilter;
})(window);
//# sourceMappingURL=leaderboard.js.map