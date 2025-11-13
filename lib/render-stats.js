(function (global) {
    function renderAll() {
            employees.sort((a, b) => a.name.localeCompare(b.name));
            renderStats();
            
            // Ensure calendar container exists before rendering
            const calendarContainer = document.getElementById('calendar-month-current');
            if (calendarContainer) {
                // Ensure initial container has relative position for proper height
                calendarContainer.style.position = 'relative';
                renderCalendar();
            } else {
                console.warn('Calendar container not found, skipping calendar render');
            }
            
            // Ensure green card calendar container exists before rendering
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

    global.renderAll = renderAll;
    function renderStats() {
            const totalEmployees = employees.length;
            const totalCards = employees.reduce((s, e) => s + e.violations.length, 0);
            const compliantEmployees = employees.filter(e => e.violations.length === 0).length;
            const complianceRate = totalEmployees > 0 ? ((compliantEmployees / totalEmployees) * 100).toFixed(1) : "100.0";
            const atRiskCount = employees.filter(e => e.violations.length >= 5).length;
            
            let deptCards = {};
            employees.forEach(e => {
                deptCards[e.dept] = (deptCards[e.dept] || 0) + e.violations.length;
            });
            let maxDept = 'None', maxCount = 0;
            for (const d in deptCards) {
                if (deptCards[d] > maxCount) {
                    maxCount = deptCards[d];
                    maxDept = d;
                }
            }

            document.getElementById('team-size-stat').innerHTML = `<strong>Team Size:</strong> ${totalEmployees} employees`;
            document.getElementById('card-ratio-stat').innerHTML = `<strong>Total Cards:</strong> ${totalCards}`;
            
            document.getElementById('overview-stats').innerHTML = `
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
            lucide.createIcons();
            
            const cardCounts = {
                0: compliantEmployees,
                1: employees.filter(e => e.violations.length === 1).length,
                2: employees.filter(e => e.violations.length === 2).length,
                3: employees.filter(e => e.violations.length >= 3).length
            };
            
            document.getElementById('detailed-stats').innerHTML = `
                <div class="detailed-stat-card-v2 card-green"><div class="stat-number">${cardCounts[0]}</div></div>
                <div class="detailed-stat-card-v2 card-yellow"><div class="stat-number">${cardCounts[1]}</div><div class="card-stack-wrapper"><div class="stack-shape stack-medium"></div></div></div>
                <div class="detailed-stat-card-v2 card-orange"><div class="stat-number">${cardCounts[2]}</div><div class="card-stack-wrapper"><div class="stack-shape stack-dark"></div><div class="stack-shape stack-medium"></div></div></div>
                <div class="detailed-stat-card-v2 card-red"><div class="stat-number">${cardCounts[3]}</div><div class="card-stack-wrapper"><div class="stack-shape stack-dark"></div><div class="stack-shape stack-medium"></div><div class="stack-shape stack-light"></div></div></div>
            `;
    }

    global.renderStats = renderStats;

    function renderCalendar(containerElement = null, targetDate = null) {
            const container = containerElement || document.getElementById('calendar-month-current');
            if (!container) {
                console.error('Calendar container not found');
                return;
            }
            
            const dateToRender = targetDate || currentDate;
            const year = dateToRender.getFullYear();
            const month = dateToRender.getMonth();
            
            // Only update month-year header if rendering main calendar (not a new element)
            const isMainCalendar = !containerElement || (containerElement.id && containerElement.id === 'calendar-month-current');
            if (isMainCalendar) {
                const monthYearElement = document.getElementById('calendar-month-year');
                if (monthYearElement) {
                    monthYearElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }
            }
            
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayIndex = new Date(year, month, 1).getDay();
            const dayOffset = (firstDayIndex === 0) ? 6 : firstDayIndex - 1; 
            
            let dailyViolations = {};
            employees.forEach(e => e.violations.forEach(v => {
                // Parse date string directly to avoid timezone issues
                const dateParts = v.date.split('-');
                const violationYear = parseInt(dateParts[0]);
                const violationMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                const violationDay = parseInt(dateParts[2]);
                
                if (violationYear === year && violationMonth === month) {
                    dailyViolations[violationDay] = (dailyViolations[violationDay] || 0) + 1;
                }
            }));
            
            let html = '<div class="grid grid-cols-7 gap-2"><div class="calendar-header">Mon</div><div class="calendar-header">Tue</div><div class="calendar-header">Wed</div><div class="calendar-header">Thu</div><div class="calendar-header">Fri</div><div class="calendar-header">Sat</div><div class="calendar-header">Sun</div>';
            
            for (let i = 0; i < dayOffset; i++) {
                html += '<div></div>';
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let day = 1; day <= daysInMonth; day++) {
                const loopDate = new Date(year, month, day);
                let dayClasses = 'calendar-day';
                let dayInfo = '';
                let clickHandler = '';
                let dayNumberClass = 'day-number';

                if (loopDate.getTime() === today.getTime()) {
                   dayNumberClass += ' today-highlight';
                }

                if (loopDate > today) {
                    dayClasses += ' border border-gray-200 bg-white';
                } else {
                    const violationsCount = dailyViolations[day] || 0;
                    dayClasses += ' border-2';
                    
                    if (violationsCount > 0) {
                        const violationBorders = ['border-yellow-400', 'border-orange-400', 'border-red-500'];
                        const violationBgs = ['bg-yellow-50', 'bg-orange-50', 'bg-red-50'];
                        const violationTexts = ['text-yellow-600', 'text-orange-600', 'text-red-600'];
                        
                        const level = Math.min(violationsCount - 1, 2);
                        dayClasses += ` ${violationBorders[level]} ${violationBgs[level]}`;
                        dayInfo = `<span class="font-bold ${violationTexts[level]}">${violationsCount} card(s)</span>`;
                        dayClasses += ' cursor-pointer hover:scale-105 hover:shadow-lg';
                        clickHandler = `onclick="showDayDetailsModal(${year},${month},${day})"`;
                    } else {
                        dayClasses += ' border-green-500 bg-green-50';
                        dayInfo = '<span class="text-green-700">✓ Safe</span>';
                    }
                }
                
                html += `<div class="${dayClasses}" ${clickHandler}><div class="${dayNumberClass}">${day}</div><div class="day-info">${dayInfo}</div></div>`;
            }
            
            html += '</div>';
            
            // Double check container exists before setting innerHTML
            if (container && container.nodeType === 1) {
                container.innerHTML = html;
            } else {
                console.error('Container is not a valid DOM element:', container);
            }
    }

    function renderYellowCardTable() {
             const tableBody = document.getElementById('yellow-card-table-body');
            let content = '';
            employees.forEach(emp => {
                const cards = emp.violations.length;
                let status, cardIndicatorHtml;
                
                if (cards === 0) {
                    status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">✓ Safe</span>';
                    cardIndicatorHtml = '<span class="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">0</span>';
                } else {
                    const tooltipText = emp.violations.map(v => `• ${v.date}: [${v.type}] - ${v.comment || 'No comment'}`).join('\n');
                    let indicatorClass, statusClass, statusText, statusIcon;

                    if (cards === 1) {
                        indicatorClass = 'bg-yellow-100 text-yellow-700';
                        statusClass = 'bg-yellow-100 text-yellow-700';
                        statusText = 'Warning';
                        statusIcon = '⚠ ';
                    } else if (cards === 2) {
                        indicatorClass = 'bg-orange-100 text-orange-700';
                        statusClass = 'bg-orange-100 text-orange-700';
                        statusText = 'At Risk';
                        statusIcon = '⚠ ';
                    } else {
                        indicatorClass = 'bg-red-100 text-red-700';
                        statusClass = 'bg-red-100 text-red-700';
                        statusText = 'High Risk';
                        statusIcon = '<i data-lucide="siren" class="inline w-3 h-3 mr-1"></i>';
                    }
                    
                    cardIndicatorHtml = `<div class="tooltip"><span class="text-sm font-semibold px-3 py-1 rounded-full ${indicatorClass}">${cards}</span><span class="tooltip-text">${tooltipText}</span></div>`;
                    status = `<span class="text-xs font-semibold px-2 py-1 rounded-md ${statusClass}">${statusIcon} ${statusText}</span>`;
                }

                const violationTypes = emp.violations.map(v => v.type).join(', ');
                
                content += `<tr class="cursor-pointer" data-employee-name="${emp.name}"><td>${emp.name}</td><td>${emp.dept}</td><td>${cardIndicatorHtml}</td><td>${violationTypes || '—'}</td><td>${status}</td></tr>`;
            });
            tableBody.innerHTML = content;
            lucide.createIcons();
    }

    global.renderCalendar = renderCalendar;
    global.renderYellowCardTable = renderYellowCardTable;

    let currentDateGreen = new Date();

    function renderGreenCardCalendar(containerElement = null, targetDate = null) {
            const container = containerElement || document.getElementById('calendar-month-current-green');
            if (!container) {
                console.error('Green card calendar container not found');
                return;
            }
            
            const greenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : (typeof currentDateGreen !== 'undefined' ? currentDateGreen : new Date());
            const dateToRender = targetDate || greenDate;
            const year = dateToRender.getFullYear();
            const month = dateToRender.getMonth();
            
            // Only update month-year header if rendering main calendar
            const isMainCalendar = !containerElement || (containerElement.id && containerElement.id === 'calendar-month-current-green');
            if (isMainCalendar) {
                const monthYearElement = document.getElementById('calendar-month-year-green');
                if (monthYearElement) {
                    monthYearElement.textContent = greenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }
            }
            
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayIndex = new Date(year, month, 1).getDay();
            const dayOffset = (firstDayIndex === 0) ? 6 : firstDayIndex - 1; 
            
            let dailyGreenCards = {};
            employees.forEach(e => {
                if (e.greenCards) {
                    e.greenCards.forEach(gc => {
                        const dateParts = gc.date.split('-');
                        const cardYear = parseInt(dateParts[0]);
                        const cardMonth = parseInt(dateParts[1]) - 1;
                        const cardDay = parseInt(dateParts[2]);
                        
                        if (cardYear === year && cardMonth === month) {
                            dailyGreenCards[cardDay] = (dailyGreenCards[cardDay] || 0) + 1;
                        }
                    });
                }
            });
            
            let html = '<div class="grid grid-cols-7 gap-2"><div class="calendar-header">Mon</div><div class="calendar-header">Tue</div><div class="calendar-header">Wed</div><div class="calendar-header">Thu</div><div class="calendar-header">Fri</div><div class="calendar-header">Sat</div><div class="calendar-header">Sun</div>';
            
            for (let i = 0; i < dayOffset; i++) {
                html += '<div></div>';
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let day = 1; day <= daysInMonth; day++) {
                const loopDate = new Date(year, month, day);
                let dayClasses = 'calendar-day';
                let dayInfo = '';
                let clickHandler = '';
                let dayNumberClass = 'day-number';

                if (loopDate.getTime() === today.getTime()) {
                   dayNumberClass += ' today-highlight';
                }

                if (loopDate > today) {
                    dayClasses += ' border border-gray-200 bg-white';
                } else {
                    const greenCardsCount = dailyGreenCards[day] || 0;
                    dayClasses += ' border-2';
                    
                    if (greenCardsCount > 0) {
                        dayClasses += ' border-green-500 bg-green-50';
                        dayInfo = `<span class="font-bold text-green-700">${greenCardsCount} Green Card(s)</span>`;
                        dayClasses += ' cursor-pointer hover:scale-105 hover:shadow-lg';
                        clickHandler = `onclick="showDayDetailsModalGreen(${year},${month},${day})"`;
                    } else {
                        dayClasses += ' border-gray-200 bg-gray-50';
                        dayInfo = '<span class="text-gray-600">No cards</span>';
                    }
                }
                
                html += `<div class="${dayClasses}" ${clickHandler}><div class="${dayNumberClass}">${day}</div><div class="day-info">${dayInfo}</div></div>`;
            }
            
            html += '</div>';
            
            if (container && container.nodeType === 1) {
                container.innerHTML = html;
            } else {
                console.error('Container is not a valid DOM element:', container);
            }
    }

    function renderGreenCardTable() {
            const tableBody = document.getElementById('green-card-table-body');
            let content = '';
            employees.forEach(emp => {
                const greenCards = (emp.greenCards && emp.greenCards.length) || 0;
                let status, cardIndicatorHtml;
                
                if (greenCards === 0) {
                    status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-700">No Cards</span>';
                    cardIndicatorHtml = '<span class="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">0</span>';
                } else {
                    const tooltipText = emp.greenCards.map(gc => `• ${gc.date}: [${gc.type}] - ${gc.comment || 'No comment'}`).join('\n');
                    cardIndicatorHtml = `<div class="tooltip"><span class="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">${greenCards}</span><span class="tooltip-text">${tooltipText}</span></div>`;
                    status = `<span class="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">✓ ${greenCards} Green Card(s)</span>`;
                }

                const cardTypes = emp.greenCards ? emp.greenCards.map(gc => gc.type).join(', ') : '';
                
                content += `<tr class="cursor-pointer" data-employee-name="${emp.name}"><td>${emp.name}</td><td>${emp.dept}</td><td>${cardIndicatorHtml}</td><td>${cardTypes || '—'}</td><td>${status}</td></tr>`;
            });
            tableBody.innerHTML = content;
            lucide.createIcons();
    }

    global.renderGreenCardCalendar = renderGreenCardCalendar;
    global.renderGreenCardTable = renderGreenCardTable;

    function renderLeaderboard() {
            const tableBody = document.getElementById('leaderboard-table-body');
            const pedestalContainer = document.getElementById('leaderboard-pedestal');
            const searchTerm = document.getElementById('leaderboard-search').value.toLowerCase();
            const deptDropdown = document.querySelector('#leaderboard-dept-filter-container .custom-dropdown-toggle');
            const selectedDept = deptDropdown ? deptDropdown.dataset.value : '';
            const selectedPeriod = document.querySelector('#leaderboard-period-filter .period-btn.active').dataset.period;
            
            const today = new Date();
            today.setHours(0,0,0,0);
            const isDarkMode = document.body.classList.contains('dark-theme');

            const leaderboardData = employees.map(emp => {
                const lastViolation = emp.violations.length > 0 ? emp.violations.reduce((latest, v) => new Date(v.date) > new Date(latest.date) ? v : latest) : null;
                const dateForCalc = lastViolation ? new Date(lastViolation.date) : new Date(emp.joinDate);
                const displayDate = lastViolation ? lastViolation.date : emp.joinDate;
                const daysWithoutCards = Math.floor((today - dateForCalc) / (1000 * 60 * 60 * 24));
                const daysInSystem = Math.floor((today - new Date(emp.joinDate)) / (1000 * 60 * 60 * 24));
                
                let badges = [];
                if (daysInSystem < 14) badges.push({type: 'new', text: 'New'});
                if (daysWithoutCards >= 180) badges.push({type: 'streak', text: '🔥 180+ days'});
                else if (daysWithoutCards >= 90) badges.push({type: 'streak', text: '🔥 90+ days'});
                else if (daysWithoutCards >= 60) badges.push({type: 'streak', text: '🔥 60+ days'});

                return { ...emp, lastCardDate: displayDate, daysWithoutCards, daysInSystem, badges };
            });
            
            const pedestalEligible = leaderboardData
                .filter(e => e.daysInSystem >= 14)
                .sort((a,b) => b.daysWithoutCards - a.daysWithoutCards);
            const top3 = pedestalEligible.slice(0, 3);
            
            let pedestalHTML = '';
            // Data for rendering the pedestal, correctly ordered
            const pedestalData = [
                { rank: 1, medal: '🥇', color: 'rgb(250 169 69 / 20%)', order: 2, heightClass: 'plinth-1', sizeClass: 'text-6xl' },
                { rank: 2, medal: '🥈', color: 'rgb(225 210 239 / 50%)', order: 1, heightClass: 'plinth-2', sizeClass: 'text-5xl' },
                { rank: 3, medal: '🥉', color: 'rgb(210 141 89 / 30%)', order: 3, heightClass: 'plinth-3', sizeClass: 'text-4xl' }
            ];

            if (top3.length > 0) {
                 pedestalHTML = top3.map((emp, index) => {
                    const place = pedestalData[index];
                    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
                    let deptColor = departmentColors[emp.dept] || departmentColors['default'];
                    
                    if (isDarkMode && deptColor === '#8e1c1c') {
                        deptColor = '#be3535';
                    }

                    // FINALIZED HTML structure
                    return `
                        <div class="pedestal-item-v2 cursor-pointer" style="order: ${place.order};" onclick="navigateToEmployee('${emp.name}')">
                            <div class="pedestal-card" style="border-color: ${deptColor};     width: 200px;">
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
            }
            pedestalContainer.innerHTML = pedestalHTML;

            // Main table filtering
            let filteredData = leaderboardData.filter(emp => {
                const nameMatch = emp.name.toLowerCase().includes(searchTerm);
                const deptMatch = !selectedDept || emp.dept === selectedDept;
                
                let periodMatch = false;
                if (selectedPeriod === 'all') {
                    periodMatch = true;
                } else if (selectedPeriod === 'new') {
                    periodMatch = emp.daysInSystem < 14;
                } else {
                    const days = parseInt(selectedPeriod, 10);
                    periodMatch = emp.daysWithoutCards >= days;
                }

                return nameMatch && deptMatch && periodMatch;
            });
            
            filteredData.sort((a, b) => b.daysWithoutCards - a.daysWithoutCards || a.name.localeCompare(b.name));

            if (filteredData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-8">No employees match the selected filters.</td></tr>`;
            } else {
                tableBody.innerHTML = filteredData.map(emp => `
                    <tr class="cursor-pointer" data-employee-name="${emp.name}">
                        <td>${emp.name}</td>
                        <td>${emp.dept}</td>
                        <td>${emp.violations.length > 0 ? emp.lastCardDate : 'Never'}</td>
                        <td class="font-bold text-lg">${emp.daysWithoutCards}</td>
                        <td>${emp.badges.map(b => `<span class="badge badge-${b.type}">${b.text}</span>`).join(' ')}</td>
                    </tr>
                `).join('');
            }
    }

    global.renderLeaderboard = renderLeaderboard;

    function renderTeamGrids() {
            const container = document.getElementById('team-grids-container');
            container.innerHTML = '';
            document.getElementById('team-structure-heading').innerText = `Team Structure (${employees.length} Members)`;
            
            const departments = [...new Set(employees.map(e => e.dept))].sort();
            
            departments.forEach(dept => {
                const deptEmployees = employees.filter(e => e.dept === dept);
                const deptColor = departmentColors[dept] || departmentColors['default'];
                
                let gridHTML = `<h3 class="text-xl font-semibold mb-4" style="color: ${deptColor};">${dept} (${deptEmployees.length})</h3><div class="team-grid">`;
                
                deptEmployees.forEach(emp => {
                    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
                    gridHTML += `
                        <div class="team-member" data-name="${emp.name}" data-role="${emp.role}" data-dept="${emp.dept}" 
                             data-cards="${emp.violations.length}" data-email="${emp.email}" data-discord-id="${emp.discordId}">
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
            document.querySelectorAll('.team-member').forEach(member => member.addEventListener('click', () => showEmployeeModal(member.dataset)));
    }

    function renderModals() {
            const employeeOptions = employees.map(emp => ({ value: emp.name, text: `${emp.name} (${emp.dept})` }));
            
            // Give Card Modal
            const giveCardModalContent = document.getElementById('giveCardModalContent');
            giveCardModalContent.innerHTML = `<button class="close-btn" onclick="closeModal('giveCardModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Give Yellow Card</h2><label for="cardEmployeeDropdown" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Employee:</label><div id="cardEmployeeDropdown" class="custom-dropdown"></div><label for="cardViolationTypeDropdown" class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i>Violation Type:</label><div id="cardViolationTypeDropdown" class="custom-dropdown"></div><label for="cardComment" class="flex items-center gap-2"><i data-lucide="file-text" class="w-4 h-4"></i>Details:</label><textarea id="cardComment" rows="3" placeholder="Add specific details..." required></textarea><button class="action-button mt-2" onclick="submitYellowCard(this)"><i data-lucide="send" class="w-4 h-4"></i><span>Issue Yellow Card</span></button>`;
            createDropdown('cardEmployeeDropdown', employeeOptions, 'Select an employee...');
            createDropdown('cardViolationTypeDropdown', [
                { value: 'Documentation', text: 'Documentation' },
                { value: 'Workflow', text: 'Workflow' },
                { value: 'Communication', text: 'Communication' }
            ], 'Select a type...');
            
            // Add Employee Modal
            document.getElementById('addEmployeeModalContent').innerHTML = `<button class="close-btn" onclick="closeModal('addEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Add New Employee</h2><label class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> Full Name: <span class="text-red-500">*</span></label><input type="text" id="newEmpName" placeholder="e.g., John Doe"><label class="flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4"></i> Profession/Role: <span class="text-red-500">*</span></label><input type="text" id="newEmpRole" placeholder="e.g., lead generator"><label class="flex items-center gap-2"><i data-lucide="building-2" class="w-4 h-4"></i> Department: <span class="text-red-500">*</span></label><input type="text" id="newEmpDept" placeholder="e.g., Lead Generation"><label class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> Email:</label><input type="email" id="newEmpEmail" placeholder="e.g., john.doe@example.com"><label class="flex items-center gap-2"><i data-lucide="at-sign" class="w-4 h-4"></i> Discord:</label><input type="text" id="newEmpDiscord" placeholder="e.g., username#1234"><button class="action-button-success mt-2" onclick="addEmployee(this)"><i data-lucide="save" class="w-4 h-4"></i><span>Save Employee</span></button>`;
            
            // Remove Employee Modal
            const removeEmpModalContent = document.getElementById('removeEmployeeModalContent');
            removeEmpModalContent.innerHTML = `<button class="close-btn" onclick="closeModal('removeEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Remove Employee</h2><label for="removeEmpDropdown" class="flex items-center gap-2"><i data-lucide="user-minus" class="w-4 h-4"></i> Select Employee:</label><div id="removeEmpDropdown" class="custom-dropdown"></div><p class="my-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">Warning: This action is permanent and cannot be undone.</p><button class="action-button-delete" onclick="removeEmployee(this)">Confirm Removal</button>`;
            createDropdown('removeEmpDropdown', employeeOptions, 'Select an employee to remove...');
    }

    global.renderTeamGrids = renderTeamGrids;
    global.renderModals = renderModals;

    function renderGreenCardModals() {
            const employeeOptions = employees.map(emp => ({ value: emp.name, text: `${emp.name} (${emp.dept})` }));
            
            // Give Green Card Modal
            const giveGreenCardModalContent = document.getElementById('giveGreenCardModalContent');
            giveGreenCardModalContent.innerHTML = `<button class="close-btn" onclick="closeModal('giveGreenCardModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-6">Give Green Card</h2><label for="greenCardEmployeeDropdown" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Employee:</label><div id="greenCardEmployeeDropdown" class="custom-dropdown"></div><label for="greenCardTypeDropdown" class="flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4"></i>Card Type:</label><div id="greenCardTypeDropdown" class="custom-dropdown"></div><label for="greenCardComment" class="flex items-center gap-2"><i data-lucide="file-text" class="w-4 h-4"></i>Details:</label><textarea id="greenCardComment" rows="3" placeholder="Add specific details..." required></textarea><button class="action-button-success mt-2" onclick="submitGreenCard(this)"><i data-lucide="send" class="w-4 h-4"></i><span>Issue Green Card</span></button>`;
            createDropdown('greenCardEmployeeDropdown', employeeOptions, 'Select an employee...');
            createDropdown('greenCardTypeDropdown', [
                { value: 'Achievement', text: 'Achievement' },
                { value: 'Recognition', text: 'Recognition' },
                { value: 'Documentation', text: 'Documentation' },
                { value: 'Workflow', text: 'Workflow' },
                { value: 'Communication', text: 'Communication' }
            ], 'Select a type...');
    }

    global.renderGreenCardModals = renderGreenCardModals;

    function populateDeptFilter() {
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
    }

    global.populateDeptFilter = populateDeptFilter;
    global.setPeriodFilter = setPeriodFilter;
})(window);


