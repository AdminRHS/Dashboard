// Calendar functionality

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

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
        let dayNumberClass = 'day-number';
        let clickHandler = '';

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
    lucide.createIcons();
}

function showDayDetailsModal(year, month, day) {
    const clickedDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Looking for violations on date:', dateStr);
    console.log('All violations:', employees.flatMap(e => e.violations));
    const violationsOnDay = employees.flatMap(e => {
        return e.violations
            .filter(v => {
                const raw = v.date;
                let vDateStr;
                if (typeof raw === 'string') {
                    // Support ISO strings like 2025-10-21T00:00:00.000Z and plain YYYY-MM-DD
                    vDateStr = raw.includes('T') ? raw.split('T')[0] : raw;
                } else if (raw instanceof Date) {
                    vDateStr = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`;
                } else {
                    // Fallback: attempt to parse unknown types
                    const d = new Date(raw);
                    if (!isNaN(d)) {
                        vDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    } else {
                        vDateStr = '';
                    }
                }
                return vDateStr === dateStr;
            })
            .map(v => ({ name: e.name, type: v.type, comment: v.comment }));
    });
    console.log('Found violations:', violationsOnDay);
    
    let content = `<button class="close-btn" onclick="closeModal('dayDetailsModal')"><i data-lucide="x" class="w-6 h-6"></i></button><h2 class="text-2xl font-bold text-gray-800 mb-4">Violations on ${clickedDate.toLocaleDateString()}</h2>`;
    if (violationsOnDay.length > 0) {
        content += '<div class="space-y-3">';
        violationsOnDay.forEach(v => {
            const employee = employees.find(e => e.name === v.name);
            const totalCards = employee ? employee.violations.length : 0;
            
            let colorClass = 'bg-gray-400';
            if (totalCards === 0) colorClass = 'bg-green-500';
            else if (totalCards === 1) colorClass = 'bg-yellow-500';
            else if (totalCards === 2) colorClass = 'bg-orange-500';
            else if (totalCards >= 3) colorClass = 'bg-red-600';
            
            content += `
                <div class="bg-white p-4 rounded-lg border-l-4 ${colorClass}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="font-bold text-gray-500 text-sm">${getInitials(v.name)}</span>
                        </div>
                        <div class="text-left overflow-hidden">
                            <h4 class="font-bold text-gray-800 text-sm truncate">${v.name}</h4>
                            <div class="text-xs text-gray-600">${v.type}</div>
                        </div>
                    </div>
                    <div class="text-gray-700">
                        <strong>${v.name} (${v.type}):</strong> ${v.comment || 'No comment'}
                    </div>
                </div>
            `;
        });
        content += '</div>';
    } else {
        content += '<p>No violations recorded for this day.</p>';
    }
    
    document.getElementById('dayDetailsModalContent').innerHTML = content;
    document.getElementById('dayDetailsModal').style.display = 'flex';
    lucide.createIcons();
}
