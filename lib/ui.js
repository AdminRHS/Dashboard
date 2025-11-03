(function (global) {
    function createDropdown(containerId, options, placeholder, onchangeCallback) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.classList.add('custom-dropdown');
            container.innerHTML = `
                <div class="custom-dropdown-toggle" tabindex="0">
                    <span class="selected-value placeholder">${placeholder || 'Select...'}</span>
                    <i data-lucide="chevron-down" class="chevron-icon w-4 h-4"></i>
                </div>
                <ul class="custom-dropdown-menu"></ul>
            `;
            lucide.createIcons();
            const toggle = container.querySelector('.custom-dropdown-toggle');
            const menu = container.querySelector('.custom-dropdown-menu');
            menu.innerHTML = options.map(opt => `<li data-value="${opt.value}">${opt.text}</li>`).join('');
            const selectedValue = toggle.querySelector('.selected-value');
            const placeholderClass = 'placeholder';
            const items = menu.querySelectorAll('li');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    selectedValue.textContent = item.textContent;
                    selectedValue.classList.remove(placeholderClass);
                    toggle.dataset.value = item.dataset.value;
                    menu.querySelectorAll('li').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    container.classList.remove('open');
                    if (onchangeCallback) onchangeCallback();
                });
            });
    }

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
    global.createDropdown = createDropdown;

    function updateSaveStatus(message, type = 'info') {
            const statusElement = document.getElementById('save-status');
            if (!statusElement) return;
            const colors = {
                'saving': 'text-blue-600',
                'success': 'text-green-600',
                'error': 'text-red-600',
                'info': 'text-gray-600'
            };
            statusElement.textContent = message;
            statusElement.className = `text-sm ${colors[type] || colors.info}`;
            if (type === 'success') {
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 3000);
            }
    }

    global.updateSaveStatus = updateSaveStatus;
})(window);


