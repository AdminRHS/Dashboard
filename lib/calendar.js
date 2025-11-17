(function (global) {
    let currentDateGreen = new Date();

    function renderCalendar(containerElement = null, targetDate = null) {
        const container = containerElement || document.getElementById('calendar-month-current');
        if (!container) {
            console.error('Calendar container not found');
            return;
        }

        const dateToRender = targetDate || currentDate;
        const year = dateToRender.getFullYear();
        const month = dateToRender.getMonth();

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
            const dateParts = v.date.split('-');
            const violationYear = parseInt(dateParts[0]);
            const violationMonth = parseInt(dateParts[1]) - 1;
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

        if (container && container.nodeType === 1) {
            container.innerHTML = html;
        } else {
            console.error('Container is not a valid DOM element:', container);
        }
    }

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

    global.renderCalendar = renderCalendar;
    global.renderGreenCardCalendar = renderGreenCardCalendar;
})(window);


