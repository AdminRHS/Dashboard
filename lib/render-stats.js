(function (global) {
    function renderStats() {
            const totalEmployees = employees.length;
            const totalCards = employees.reduce((s, e) => s + e.violations.length, 0);
            const compliantEmployees = employees.filter(e => e.violations.length === 0).length;
            const complianceRate = totalEmployees > 0 ? ((compliantEmployees / totalEmployees) * 100).toFixed(1) : "100.0";
            const atRiskCount = employees.filter(e => e.violations.length >= 2).length;
            
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
                        <div class="stat-sublabel">(2+ cards)</div>
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

    function renderCalendar() {
            const container = document.getElementById('calendar-container');
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            document.getElementById('calendar-month-year').textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
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
                    console.log(`Found violation on ${v.date} -> day ${violationDay} (${dailyViolations[violationDay]} total)`);
                }
            }));
            console.log('Daily violations for calendar:', dailyViolations);
            
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
            container.innerHTML = html;
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
})(window);


