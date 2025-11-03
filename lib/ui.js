(function (global) {
    function switchTab(buttonElement) {
            const tabId = buttonElement.dataset.tab;
            const pedestalContainer = document.getElementById('leaderboard-pedestal-container');

            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.remove('hidden');
            buttonElement.classList.add('active');
            
            lucide.createIcons();

            if (tabId === 'leaderboard') {
                renderLeaderboard();
                pedestalContainer.classList.remove('hidden');
            } else {
                pedestalContainer.classList.add('hidden');
            }
    }

    function changeMonth(direction) {
            currentDate.setMonth(currentDate.getMonth() + direction);
            renderCalendar();
    }

    function navigateToEmployee(name) {
            const teamTabButton = document.querySelector('.tab-btn[data-tab="team"]');
            switchTab(teamTabButton);

            const employee = employees.find(e => e.name === name);
            if (employee) {
                const modalData = {
                    name: employee.name, role: employee.role, dept: employee.dept,
                    cards: employee.violations.length, email: employee.email, discordId: employee.discordId
                };
                showEmployeeModal(modalData);
            }
    }

    global.switchTab = switchTab;
    global.changeMonth = changeMonth;
    global.navigateToEmployee = navigateToEmployee;
})(window);


