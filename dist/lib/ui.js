(function registerUI(global) {
    function createDropdown(containerId, options, placeholder = 'Select...', onchangeCallback) {
        const container = document.getElementById(containerId);
        if (!container)
            return;
        container.classList.add('custom-dropdown');
        container.innerHTML = `
                <div class="custom-dropdown-toggle" tabindex="0">
                    <span class="selected-value placeholder">${placeholder}</span>
                    <i data-lucide="chevron-down" class="chevron-icon w-4 h-4"></i>
                </div>
                <ul class="custom-dropdown-menu"></ul>
            `;
        lucide.createIcons();
        const toggle = container.querySelector('.custom-dropdown-toggle');
        const menu = container.querySelector('.custom-dropdown-menu');
        if (!toggle || !menu)
            return;
        menu.innerHTML = options.map(opt => `<li data-value="${opt.value}">${opt.text}</li>`).join('');
        const selectedValue = toggle.querySelector('.selected-value');
        const placeholderClass = 'placeholder';
        const items = menu.querySelectorAll('li');
        items.forEach(item => {
            item.addEventListener('click', () => {
                if (!selectedValue)
                    return;
                selectedValue.textContent = item.textContent;
                selectedValue.classList.remove(placeholderClass);
                toggle.dataset.value = item.getAttribute('data-value') || '';
                menu.querySelectorAll('li').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                container.classList.remove('open');
                if (onchangeCallback)
                    onchangeCallback();
            });
        });
    }
    function switchTab(buttonElement) {
        const tabId = buttonElement.dataset.tab;
        if (!tabId)
            return;
        const targetTab = document.getElementById(tabId);
        if (!targetTab)
            return;
        const pedestalContainer = document.getElementById('leaderboard-pedestal-container');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        buttonElement.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.add('hidden');
            c.classList.remove('active');
            c.style.removeProperty('position');
            c.style.removeProperty('left');
            c.style.removeProperty('top');
            c.style.removeProperty('width');
            c.style.removeProperty('pointer-events');
            c.style.removeProperty('transform');
            c.style.removeProperty('opacity');
        });
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
        lucide.createIcons();
        if (tabId === 'leaderboard') {
            renderLeaderboard();
            pedestalContainer?.classList.remove('hidden');
        }
        else {
            pedestalContainer?.classList.add('hidden');
        }
        if (tabId === 'greencard') {
            renderGreenCardCalendar();
            renderGreenCardTable();
        }
    }
    let isCalendarAnimating = false;
    function changeMonth(direction, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (isCalendarAnimating)
            return false;
        const container = document.querySelector('.calendar-container');
        const oldMonth = document.getElementById('calendar-month-current');
        if (!container || !oldMonth)
            return false;
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        isCalendarAnimating = true;
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        const newMonth = document.createElement('div');
        newMonth.className = 'calendar-month';
        renderCalendar(newMonth, newDate);
        newMonth.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
        container.appendChild(newMonth);
        newMonth.offsetHeight;
        const oldMonthHeight = oldMonth.offsetHeight;
        const currentHeight = container.offsetHeight || oldMonthHeight;
        const heightToUse = Math.max(currentHeight, oldMonthHeight, 0);
        if (heightToUse > 0) {
            container.style.height = `${heightToUse}px`;
        }
        if (oldMonth.style.position !== 'absolute') {
            oldMonth.style.position = 'absolute';
        }
        newMonth.style.position = 'absolute';
        const maintainScroll = () => {
            window.scrollTo(scrollX, scrollY);
        };
        requestAnimationFrame(() => {
            maintainScroll();
            requestAnimationFrame(() => {
                maintainScroll();
                oldMonth.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
                newMonth.style.transform = 'translateX(0)';
            });
        });
        const scrollInterval = setInterval(maintainScroll, 50);
        setTimeout(() => {
            currentDate.setMonth(currentDate.getMonth() + direction);
            const currentContainerHeight = container.offsetHeight;
            newMonth.id = 'calendar-month-current';
            newMonth.style.transform = '';
            newMonth.style.position = 'relative';
            newMonth.offsetHeight;
            oldMonth.remove();
            const newHeight = newMonth.offsetHeight;
            if (newHeight > 0) {
                container.style.height = `${newHeight}px`;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        container.style.height = '';
                        newMonth.style.position = '';
                    });
                });
            }
            else if (currentContainerHeight > 0) {
                container.style.height = `${currentContainerHeight}px`;
                requestAnimationFrame(() => {
                    container.style.height = '';
                    newMonth.style.position = '';
                });
            }
            else {
                container.style.height = '';
                newMonth.style.position = '';
            }
            const headerEl = document.getElementById('calendar-month-year');
            if (headerEl) {
                headerEl.textContent = currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            }
            clearInterval(scrollInterval);
            window.scrollTo(scrollX, scrollY);
            requestAnimationFrame(() => {
                window.scrollTo(scrollX, scrollY);
                requestAnimationFrame(() => {
                    window.scrollTo(scrollX, scrollY);
                });
            });
            isCalendarAnimating = false;
        }, 400);
        return true;
    }
    function navigateToEmployee(name) {
        const employee = employees.find(e => e.name === name);
        if (employee) {
            const modalData = {
                name: employee.name,
                role: employee.role,
                dept: employee.dept,
                cards: employee.violations.length,
                email: employee.email,
                discordId: employee.discordId
            };
            showEmployeeModal(modalData);
        }
    }
    let isGreenCardCalendarAnimating = false;
    function changeMonthGreen(direction, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (isGreenCardCalendarAnimating)
            return false;
        const container = document.querySelector('#greencard .calendar-container');
        const oldMonth = document.getElementById('calendar-month-current-green');
        if (!container || !oldMonth)
            return false;
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        isGreenCardCalendarAnimating = true;
        const greenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : new Date();
        const newDate = new Date(greenDate);
        newDate.setMonth(greenDate.getMonth() + direction);
        const newMonth = document.createElement('div');
        newMonth.className = 'calendar-month';
        renderGreenCardCalendar(newMonth, newDate);
        newMonth.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
        container.appendChild(newMonth);
        newMonth.offsetHeight;
        const oldMonthHeight = oldMonth.offsetHeight;
        const currentHeight = container.offsetHeight || oldMonthHeight;
        const heightToUse = Math.max(currentHeight, oldMonthHeight, 0);
        if (heightToUse > 0) {
            container.style.height = `${heightToUse}px`;
        }
        if (oldMonth.style.position !== 'absolute') {
            oldMonth.style.position = 'absolute';
        }
        newMonth.style.position = 'absolute';
        const maintainScroll = () => {
            window.scrollTo(scrollX, scrollY);
        };
        requestAnimationFrame(() => {
            maintainScroll();
            requestAnimationFrame(() => {
                maintainScroll();
                oldMonth.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
                newMonth.style.transform = 'translateX(0)';
            });
        });
        const scrollInterval = setInterval(maintainScroll, 50);
        setTimeout(() => {
            if (typeof window.currentDateGreen !== 'undefined') {
                window.currentDateGreen.setMonth(window.currentDateGreen.getMonth() + direction);
            }
            else if (typeof currentDateGreen !== 'undefined') {
                currentDateGreen.setMonth(currentDateGreen.getMonth() + direction);
            }
            const currentContainerHeight = container.offsetHeight;
            newMonth.id = 'calendar-month-current-green';
            newMonth.style.transform = '';
            newMonth.style.position = 'relative';
            newMonth.offsetHeight;
            oldMonth.remove();
            const newHeight = newMonth.offsetHeight;
            if (newHeight > 0) {
                container.style.height = `${newHeight}px`;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        container.style.height = '';
                        newMonth.style.position = '';
                    });
                });
            }
            else if (currentContainerHeight > 0) {
                container.style.height = `${currentContainerHeight}px`;
                requestAnimationFrame(() => {
                    container.style.height = '';
                    newMonth.style.position = '';
                });
            }
            else {
                container.style.height = '';
                newMonth.style.position = '';
            }
            const headerEl = document.getElementById('calendar-month-year-green');
            if (headerEl) {
                const activeGreenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : (typeof currentDateGreen !== 'undefined' ? currentDateGreen : new Date());
                headerEl.textContent = activeGreenDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            }
            clearInterval(scrollInterval);
            window.scrollTo(scrollX, scrollY);
            requestAnimationFrame(() => {
                window.scrollTo(scrollX, scrollY);
                requestAnimationFrame(() => {
                    window.scrollTo(scrollX, scrollY);
                });
            });
            isGreenCardCalendarAnimating = false;
        }, 400);
        return true;
    }
    function updateSaveStatus(message, type = 'info') {
        const statusElement = document.getElementById('save-status');
        if (!statusElement)
            return;
        const colors = {
            saving: 'text-blue-600',
            success: 'text-green-600',
            error: 'text-red-600',
            info: 'text-gray-600'
        };
        statusElement.textContent = message;
        statusElement.className = `text-sm ${colors[type] || colors.info}`;
        if (type === 'success') {
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        }
    }
    global.switchTab = switchTab;
    global.changeMonth = changeMonth;
    global.changeMonthGreen = changeMonthGreen;
    global.navigateToEmployee = navigateToEmployee;
    global.createDropdown = createDropdown;
    global.updateSaveStatus = updateSaveStatus;
})(window);
//# sourceMappingURL=ui.js.map