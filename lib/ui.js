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
            
            if (tabId === 'greencard') {
                renderGreenCardCalendar();
                renderGreenCardTable();
            }
    }

    // Track if calendar animation is in progress
    let isCalendarAnimating = false;

    function changeMonth(direction, event) {
            // Prevent default button behavior that might cause scroll
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Prevent multiple clicks during animation
            if (isCalendarAnimating) return false;
            
            const container = document.querySelector('.calendar-container');
            const oldMonth = document.getElementById('calendar-month-current');
            
            if (!container || !oldMonth) return false;
            
            // Save current scroll position to prevent page scroll
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;
            
            isCalendarAnimating = true;
            
            // Calculate new date
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() + direction);
            
            // 1. Create new month element
            const newMonth = document.createElement('div');
            newMonth.className = 'calendar-month';
            
            // 2. Render calendar content FIRST (before adding to DOM)
            renderCalendar(newMonth, newDate);
            
            // 3. Set initial position OUTSIDE screen
            newMonth.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
            
            // 4. Add to DOM
            container.appendChild(newMonth);
            
            // 5. Force reflow and store container height before animation
            newMonth.offsetHeight;
            
            // Get height from old month (which is currently relative and sets container height)
            const oldMonthHeight = oldMonth.offsetHeight;
            const currentHeight = container.offsetHeight || oldMonthHeight;
            
            // Set container height to prevent collapse during animation
            // Use the maximum of current height or old month height
            const heightToUse = Math.max(currentHeight, oldMonthHeight, 0);
            if (heightToUse > 0) {
                container.style.height = heightToUse + 'px';
            }
            
            // Make old month absolute for animation (if not already)
            // This must happen AFTER setting container height
            if (oldMonth.style.position !== 'absolute') {
                oldMonth.style.position = 'absolute';
            }
            
            // Ensure new month is also absolute for animation
            newMonth.style.position = 'absolute';
            
            // Prevent scroll during animation by maintaining scroll position
            const maintainScroll = () => {
                window.scrollTo(scrollX, scrollY);
            };
            
            // 6. Use double requestAnimationFrame for smooth start
            requestAnimationFrame(() => {
                maintainScroll(); // Maintain scroll before animation
                requestAnimationFrame(() => {
                    maintainScroll(); // Maintain scroll during animation start
                    // 7. Simultaneously change transform for BOTH months
                    oldMonth.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
                    newMonth.style.transform = 'translateX(0)';
                });
            });
            
            // Also maintain scroll during animation
            const scrollInterval = setInterval(maintainScroll, 50);
            
            // 8. Cleanup after transition completes
            setTimeout(() => {
                // Update current date
                currentDate.setMonth(currentDate.getMonth() + direction);
                
                // Store current height before removing old month
                const currentContainerHeight = container.offsetHeight;
                
                // Make new month the current one BEFORE removing old month
                newMonth.id = 'calendar-month-current';
                newMonth.style.transform = ''; // Clear transform
                
                // Explicitly set position to relative BEFORE removing old month
                // This prevents container height collapse
                newMonth.style.position = 'relative';
                
                // Force reflow to apply position change
                newMonth.offsetHeight;
                
                // Now remove old month (new month is already relative, so container keeps height)
                oldMonth.remove();
                
                // Ensure container maintains height
                const newHeight = newMonth.offsetHeight;
                if (newHeight > 0) {
                    // Set height explicitly to prevent any flicker
                    container.style.height = newHeight + 'px';
                    
                    // Reset to auto after ensuring smooth transition
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            container.style.height = '';
                            // Clear position style to let CSS rule take over
                            newMonth.style.position = '';
                        });
                    });
                } else {
                    // Fallback: use stored height
                    if (currentContainerHeight > 0) {
                        container.style.height = currentContainerHeight + 'px';
                        requestAnimationFrame(() => {
                            container.style.height = '';
                            newMonth.style.position = '';
                        });
                    } else {
                        container.style.height = '';
                        newMonth.style.position = '';
                    }
                }
                
                // Update month-year header
                const headerEl = document.getElementById('calendar-month-year');
                if (headerEl) {
                    headerEl.textContent = currentDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                    });
                }
                
                // Clear scroll maintenance interval
                clearInterval(scrollInterval);
                
                // Restore scroll position to prevent page scroll
                window.scrollTo(scrollX, scrollY);
                
                // Ensure scroll position is maintained after all operations
                requestAnimationFrame(() => {
                    window.scrollTo(scrollX, scrollY);
                    requestAnimationFrame(() => {
                        window.scrollTo(scrollX, scrollY);
                    });
                });
                
                isCalendarAnimating = false;
            }, 400); // Must match CSS transition duration
    }

    function navigateToEmployee(name) {
            // Не перемикаємо таб - модальне вікно може відкриватися з будь-якого табу
            const employee = employees.find(e => e.name === name);
            if (employee) {
                const modalData = {
                    name: employee.name, role: employee.role, dept: employee.dept,
                    cards: employee.violations.length, email: employee.email, discordId: employee.discordId
                };
                showEmployeeModal(modalData);
            }
    }

    // Track if green card calendar animation is in progress
    let isGreenCardCalendarAnimating = false;

    function changeMonthGreen(direction, event) {
            // Prevent default button behavior that might cause scroll
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Prevent multiple clicks during animation
            if (isGreenCardCalendarAnimating) return false;
            
            const container = document.querySelector('#greencard .calendar-container');
            const oldMonth = document.getElementById('calendar-month-current-green');
            
            if (!container || !oldMonth) return false;
            
            // Save current scroll position
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;
            
            isGreenCardCalendarAnimating = true;
            
            // Calculate new date - use global currentDateGreen
            const greenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : new Date();
            const newDate = new Date(greenDate);
            newDate.setMonth(greenDate.getMonth() + direction);
            
            // 1. Create new month element
            const newMonth = document.createElement('div');
            newMonth.className = 'calendar-month';
            
            // 2. Render calendar content FIRST
            renderGreenCardCalendar(newMonth, newDate);
            
            // 3. Set initial position OUTSIDE screen
            newMonth.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
            
            // 4. Add to DOM
            container.appendChild(newMonth);
            
            // 5. Force reflow and store container height
            newMonth.offsetHeight;
            
            const oldMonthHeight = oldMonth.offsetHeight;
            const currentHeight = container.offsetHeight || oldMonthHeight;
            const heightToUse = Math.max(currentHeight, oldMonthHeight, 0);
            if (heightToUse > 0) {
                container.style.height = heightToUse + 'px';
            }
            
            if (oldMonth.style.position !== 'absolute') {
                oldMonth.style.position = 'absolute';
            }
            
            newMonth.style.position = 'absolute';
            
            // Prevent scroll during animation
            const maintainScroll = () => {
                window.scrollTo(scrollX, scrollY);
            };
            
            // 6. Use double requestAnimationFrame for smooth start
            requestAnimationFrame(() => {
                maintainScroll();
                requestAnimationFrame(() => {
                    maintainScroll();
                    oldMonth.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
                    newMonth.style.transform = 'translateX(0)';
                });
            });
            
            const scrollInterval = setInterval(maintainScroll, 50);
            
            // 8. Cleanup after transition completes
            setTimeout(() => {
                const greenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : (typeof currentDateGreen !== 'undefined' ? currentDateGreen : new Date());
                if (greenDate) {
                    greenDate.setMonth(greenDate.getMonth() + direction);
                }
                
                const currentContainerHeight = container.offsetHeight;
                
                newMonth.id = 'calendar-month-current-green';
                newMonth.style.transform = '';
                
                newMonth.style.position = 'relative';
                newMonth.offsetHeight;
                
                oldMonth.remove();
                
                const newHeight = newMonth.offsetHeight;
                if (newHeight > 0) {
                    container.style.height = newHeight + 'px';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            container.style.height = '';
                            newMonth.style.position = '';
                        });
                    });
                } else {
                    if (currentContainerHeight > 0) {
                        container.style.height = currentContainerHeight + 'px';
                        requestAnimationFrame(() => {
                            container.style.height = '';
                            newMonth.style.position = '';
                        });
                    } else {
                        container.style.height = '';
                        newMonth.style.position = '';
                    }
                }
                
                const headerEl = document.getElementById('calendar-month-year-green');
                if (headerEl) {
                    const greenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : (typeof currentDateGreen !== 'undefined' ? currentDateGreen : new Date());
                    headerEl.textContent = greenDate.toLocaleDateString('en-US', { 
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
    }

    global.switchTab = switchTab;
    global.changeMonth = changeMonth;
    global.changeMonthGreen = changeMonthGreen;
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


