(function registerRenderers(global) {
    function renderAll() {
        employees.sort((a, b) => a.name.localeCompare(b.name));
        renderStats();
        const calendarContainer = document.getElementById('calendar-month-current');
        if (calendarContainer) {
            calendarContainer.style.position = 'relative';
            renderCalendar();
        }
        else {
            console.warn('Calendar container not found, skipping calendar render');
        }
        const greenCalendarContainer = document.getElementById('calendar-month-current-green');
        if (greenCalendarContainer) {
            greenCalendarContainer.style.position = 'relative';
            renderGreenCardCalendar();
        }
        renderYellowCardTable();
        renderGreenCardTable();
        renderTeamGrids();
        populateDeptFilter();
        renderLeaderboard();
        renderModals();
        renderGreenCardModals();
        lucide.createIcons();
    }
    function renderStats() {
        const totalEmployees = employees.length;
        const totalCards = employees.reduce((s, e) => s + e.violations.length, 0);
        const compliantEmployees = employees.filter(e => e.violations.length === 0).length;
        const complianceRate = totalEmployees > 0 ? ((compliantEmployees / totalEmployees) * 100).toFixed(1) : '100.0';
        const atRiskCount = employees.filter(e => e.violations.length >= 5).length;
        const deptCards = employees.reduce((acc, e) => {
            acc[e.dept] = (acc[e.dept] || 0) + e.violations.length;
            return acc;
        }, {});
        let maxDept = 'None';
        let maxCount = 0;
        Object.entries(deptCards).forEach(([dept, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxDept = dept;
            }
        });
        const teamSize = document.getElementById('team-size-stat');
        if (teamSize) {
            teamSize.innerHTML = `<strong>Team Size:</strong> ${totalEmployees} employees`;
        }
        const cardRatio = document.getElementById('card-ratio-stat');
        if (cardRatio) {
            cardRatio.innerHTML = `<strong>Total Cards:</strong> ${totalCards}`;
        }
        const overviewStats = document.getElementById('overview-stats');
        if (overviewStats) {
            overviewStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon bg-blue-100 text-blue-600"><i data-lucide="users"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${totalEmployees}</div>
                    <div class="stat-label">Total Employees</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-green-100 text-green-600"><i data-lucide="shield-check"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${complianceRate}%</div>
                    <div class="stat-label">Compliance</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-orange-100 text-orange-600"><i data-lucide="alert-triangle"></i></div>
                <div class="stat-info">
                    <div class="flex items-baseline gap-2">
                        <div class="stat-number">${atRiskCount}</div>
                        <div class="stat-label" style="text-transform: none; line-height: 1.1;">AT RISK</div>
                    </div>
                    <div class="stat-sublabel">(5+ cards)</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-red-100 text-red-600"><i data-lucide="siren"></i></div>
                <div class="stat-info">
                    <div class="flex items-baseline gap-2">
                        <div class="stat-number">${maxCount}</div>
                        <div class="stat-label" style="text-transform: none; line-height: 1.1;">MOST VIOL.</div>
                    </div>
                    <div class="stat-sublabel">${maxDept}</div>
                </div>
            </div>
        `;
        }
        lucide.createIcons();
        const cardCounts = {
            0: compliantEmployees,
            1: employees.filter(e => e.violations.length === 1).length,
            2: employees.filter(e => e.violations.length === 2).length,
            3: employees.filter(e => e.violations.length >= 3).length
        };
        const totalGreenCards = employees.reduce((sum, emp) => {
            return sum + ((emp.greenCards && emp.greenCards.length) || 0);
        }, 0);
        const getStackClassesForCount = (count) => {
            if (count <= 0)
                return [];
            if (count === 1)
                return ['stack-medium'];
            if (count === 2)
                return ['stack-light', 'stack-medium'];
            return ['stack-light', 'stack-medium', 'stack-dark'];
        };
        const renderCardStack = (count) => {
            const classes = getStackClassesForCount(count);
            if (!classes.length)
                return '';
            return `
                <div class="card-stack-wrapper">
                    ${classes.map(cls => `<div class="stack-shape ${cls}"></div>`).join('')}
                </div>
            `;
        };
        const clampValue = (value) => {
            if (value <= 0)
                return '0';
            if (value === 1)
                return '1';
            if (value === 2)
                return '2';
            return '3+';
        };
        const detailedStats = document.getElementById('detailed-stats');
        if (detailedStats) {
            detailedStats.innerHTML = `
            <div class="detailed-stat-card-v2 card-green">
                <div>
                    <div class="stat-number">${clampValue(totalGreenCards)}</div>
                    <div class="card-label">Green Cards</div>
                </div>
                ${renderCardStack(totalGreenCards)}
            </div>
            <div class="detailed-stat-card-v2 card-yellow">
                <div>
                    <div class="stat-number">${clampValue(totalCards)}</div>
                    <div class="card-label">Yellow Cards</div>
                </div>
                ${renderCardStack(totalCards)}
            </div>
            <div class="detailed-stat-card-v2 card-orange">
                <div>
                    <div class="stat-number">${clampValue(cardCounts[2])}</div>
                    <div class="card-label">Orange Cards</div>
                </div>
                ${renderCardStack(cardCounts[2])}
            </div>
            <div class="detailed-stat-card-v2 card-red">
                <div>
                    <div class="stat-number">${clampValue(cardCounts[3])}</div>
                    <div class="card-label">Red Cards</div>
                </div>
                ${renderCardStack(cardCounts[3])}
            </div>
        `;
        }
    }
    function renderTeamGrids() {
        const container = document.getElementById('team-grids-container');
        if (!container)
            return;
        container.innerHTML = '';
        const heading = document.getElementById('team-structure-heading');
        if (heading) {
            heading.innerText = `Team Structure (${employees.length} Members)`;
        }
        const departments = [...new Set(employees.map(e => e.dept))].sort();
        departments.forEach(dept => {
            const deptEmployees = employees.filter(e => e.dept === dept);
            const deptColor = departmentColors[dept] || departmentColors.default;
            let gridHTML = `<h3 class="text-xl font-semibold mb-4" style="color: ${deptColor};">${dept} (${deptEmployees.length})</h3><div class="team-grid">`;
            deptEmployees.forEach(emp => {
                const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
                gridHTML += `
                    <div class="team-member" data-name="${emp.name}" data-role="${emp.role}" data-dept="${emp.dept}" 
                         data-cards="${emp.violations.length}" data-email="${emp.email || ''}" data-discord-id="${emp.discordId || ''}">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="font-bold text-gray-500 text-lg">${initials}</span>
                            </div>
                            <div class="text-left">
                                <h4 class="font-bold text-gray-800">${emp.name}</h4>
                                <div class="text-sm text-gray-600">${emp.role}</div>
                            </div>
                        </div>
                    </div>`;
            });
            gridHTML += `</div>`;
            container.innerHTML += gridHTML;
        });
        document.querySelectorAll('.team-member')
            .forEach(member => member.addEventListener('click', () => showEmployeeModal(member.dataset)));
    }
    function renderModals() {
        const employeeOptions = employees.map(emp => ({ value: emp.name, text: `${emp.name} (${emp.dept})` }));
        const giveCardModalContent = document.getElementById('giveCardModalContent');
        if (giveCardModalContent) {
            giveCardModalContent.innerHTML = `<button class="close-btn" onclick="closeModal('giveCardModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Give Yellow Card</h2><label for="cardEmployeeDropdown" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Employee:</label><div id="cardEmployeeDropdown" class="custom-dropdown"></div><label for="cardViolationTypeDropdown" class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i>Violation Type:</label><div id="cardViolationTypeDropdown" class="custom-dropdown"></div><label for="cardComment" class="flex items-center gap-2"><i data-lucide="file-text" class="w-4 h-4"></i>Details:</label><textarea id="cardComment" rows="3" placeholder="Add specific details..." required></textarea><button class="action-button mt-2" onclick="submitYellowCard(this)"><i data-lucide="send" class="w-4 h-4"></i><span>Issue Yellow Card</span></button>`;
        }
        createDropdown('cardEmployeeDropdown', employeeOptions, 'Select an employee...');
        createDropdown('cardViolationTypeDropdown', [
            { value: 'Documentation', text: 'Documentation' },
            { value: 'Workflow', text: 'Workflow' },
            { value: 'Communication', text: 'Communication' }
        ], 'Select a type...');
        const addModal = document.getElementById('addEmployeeModalContent');
        if (addModal) {
            addModal.innerHTML = `<button class="close-btn" onclick="closeModal('addEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Add New Employee</h2><label class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> Full Name: <span class="text-red-500">*</span></label><input type="text" id="newEmpName" placeholder="e.g., John Doe"><label class="flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4"></i> Profession/Role: <span class="text-red-500">*</span></label><input type="text" id="newEmpRole" placeholder="e.g., lead generator"><label class="flex items-center gap-2"><i data-lucide="building-2" class="w-4 h-4"></i> Department: <span class="text-red-500">*</span></label><input type="text" id="newEmpDept" placeholder="e.g., Lead Generation"><label class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> Email:</label><input type="email" id="newEmpEmail" placeholder="e.g., john.doe@example.com"><label class="flex items-center gap-2"><i data-lucide="at-sign" class="w-4 h-4"></i> Discord:</label><input type="text" id="newEmpDiscord" placeholder="e.g., username#1234"><button class="action-button-success mt-2" onclick="addEmployee(this)"><i data-lucide="save" class="w-4 h-4"></i><span>Save Employee</span></button>`;
        }
        const removeEmpModalContent = document.getElementById('removeEmployeeModalContent');
        if (removeEmpModalContent) {
            removeEmpModalContent.innerHTML = `<button class="close-btn" onclick="closeModal('removeEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Remove Employee</h2><label for="removeEmpDropdown" class="flex items-center gap-2"><i data-lucide="user-minus" class="w-4 h-4"></i> Select Employee:</label><div id="removeEmpDropdown" class="custom-dropdown"></div><p class="my-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">Warning: This action is permanent and cannot be undone.</p><button class="action-button-delete" onclick="removeEmployee(this)">Confirm Removal</button>`;
        }
        createDropdown('removeEmpDropdown', employeeOptions, 'Select an employee to remove...');
    }
    function renderGreenCardModals() {
        const employeeOptions = employees.map(emp => ({ value: emp.name, text: `${emp.name} (${emp.dept})` }));
        const giveGreenCardModalContent = document.getElementById('giveGreenCardModalContent');
        if (giveGreenCardModalContent) {
            giveGreenCardModalContent.innerHTML = `<button class="close-btn" onclick="closeModal('giveGreenCardModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Give Green Card</h2><label for="greenCardEmployeeDropdown" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Employee:</label><div id="greenCardEmployeeDropdown" class="custom-dropdown"></div><label for="greenCardTypeDropdown" class="flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4"></i>Card Type:</label><div id="greenCardTypeDropdown" class="custom-dropdown"></div><label for="greenCardComment" class="flex items-center gap-2"><i data-lucide="file-text" class="w-4 h-4"></i>Details:</label><textarea id="greenCardComment" rows="3" placeholder="Add specific details..." required></textarea><button class="action-button-success mt-2" onclick="submitGreenCard(this)"><i data-lucide="send" class="w-4 h-4"></i><span>Issue Green Card</span></button>`;
        }
        createDropdown('greenCardEmployeeDropdown', employeeOptions, 'Select an employee...');
        createDropdown('greenCardTypeDropdown', [
            { value: 'Achievement', text: 'Achievement' },
            { value: 'Recognition', text: 'Recognition' },
            { value: 'Documentation', text: 'Documentation' },
            { value: 'Workflow', text: 'Workflow' },
            { value: 'Communication', text: 'Communication' }
        ], 'Select a type...');
    }
    global.renderAll = renderAll;
    global.renderStats = renderStats;
    global.renderTeamGrids = renderTeamGrids;
    global.renderModals = renderModals;
    global.renderGreenCardModals = renderGreenCardModals;
})(window);
//# sourceMappingURL=render-stats.js.map