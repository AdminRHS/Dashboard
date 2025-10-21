// UI Functions

// Global variables
let employees = [];
let currentTab = 'overview';
let currentPeriod = 'week';

// Tab switching
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Show/hide content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabName}Tab`).style.display = 'block';
    
    // Render appropriate content
    if (tabName === 'overview') {
        renderOverview();
    } else if (tabName === 'cards') {
        renderYellowCards();
    } else if (tabName === 'team') {
        renderTeam();
    } else if (tabName === 'leaderboard') {
        renderLeaderboard();
    }
}

// Period switching for leaderboard
function switchPeriod(period) {
    currentPeriod = period;
    
    // Update period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchPeriod('${period}')"]`).classList.add('active');
    
    // Re-render leaderboard
    renderLeaderboard();
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Theme toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.innerHTML = savedTheme === 'dark' ? 
            '<i data-lucide="sun"></i> Light Mode' : 
            '<i data-lucide="moon"></i> Dark Mode';
    }
    
    // Re-initialize Lucide icons after theme change
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 100);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', newTheme);
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.innerHTML = newTheme === 'dark' ? 
            '<i data-lucide="sun"></i> Light Mode' : 
            '<i data-lucide="moon"></i> Dark Mode';
    }
    
    // Re-initialize Lucide icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 100);
}

// Main render function
function renderAll() {
    renderOverview();
    renderYellowCards();
    renderTeam();
    renderLeaderboard();
    renderCalendar();
}

// Overview rendering
function renderOverview() {
    const stats = getViolationStats();
    
    // Update stat cards
    const totalCards = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const docCards = document.querySelector('.stat-card:nth-child(2) .stat-number');
    const workflowCards = document.querySelector('.stat-card:nth-child(3) .stat-number');
    const commCards = document.querySelector('.stat-card:nth-child(4) .stat-number');
    
    if (totalCards) totalCards.textContent = stats.total;
    if (docCards) docCards.textContent = stats.documentation;
    if (workflowCards) workflowCards.textContent = stats.workflow;
    if (commCards) commCards.textContent = stats.communication;
}

// Yellow Cards rendering
function renderYellowCards() {
    const tbody = document.querySelector('#yellowCardsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const employeesWithCards = getEmployeesWithViolations();
    
    employeesWithCards.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-medium">${emp.name}</td>
            <td>${emp.dept || 'N/A'}</td>
            <td>
                <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                    ${emp.violations.length}
                </span>
            </td>
            <td>
                ${emp.violations.map(v => `
                    <span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                        ${v.type}
                    </span>
                `).join('')}
            </td>
            <td>
                <button onclick="openGiveCardModal('${emp.name}')" 
                        class="action-button-secondary">
                    Give Card
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Team rendering
function renderTeam() {
    const teamGrid = document.querySelector('.team-grid');
    if (!teamGrid) return;
    
    teamGrid.innerHTML = '';
    
    employees.forEach(emp => {
        const memberCard = document.createElement('div');
        memberCard.className = 'team-member';
        memberCard.innerHTML = `
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-semibold">${emp.name.charAt(0)}</span>
                </div>
                <div>
                    <h3 class="font-semibold">${emp.name}</h3>
                    <p class="text-sm text-gray-600">${emp.role || 'N/A'}</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span>Department:</span>
                    <span class="font-medium">${emp.dept || 'N/A'}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Cards:</span>
                    <span class="font-medium text-yellow-600">${emp.violations.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Join Date:</span>
                    <span class="font-medium">${emp.joinDate || 'N/A'}</span>
                </div>
            </div>
        `;
        teamGrid.appendChild(memberCard);
    });
}

// Leaderboard rendering
function renderLeaderboard() {
    const tbody = document.querySelector('#leaderboardTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const employeesWithoutCards = getEmployeesWithoutViolations();
    
    // Sort by join date (newest first) or by days without cards
    const sortedEmployees = employeesWithoutCards.sort((a, b) => {
        if (currentPeriod === 'new') {
            return new Date(b.joinDate) - new Date(a.joinDate);
        } else {
            return calculateDaysSince(b.joinDate) - calculateDaysSince(a.joinDate);
        }
    });
    
    sortedEmployees.forEach((emp, index) => {
        const row = document.createElement('tr');
        const daysWithoutCards = calculateDaysSince(emp.joinDate);
        
        row.innerHTML = `
            <td class="font-medium">${emp.name}</td>
            <td>${emp.dept || 'N/A'}</td>
            <td>${formatDate(emp.joinDate)}</td>
            <td>
                <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                    ${daysWithoutCards} days
                </span>
            </td>
            <td>
                ${index === 0 ? '<span class="badge badge-streak">🏆 Top Performer</span>' : ''}
                ${daysWithoutCards > 30 ? '<span class="badge badge-new">🌟 Long Streak</span>' : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Calendar rendering
function renderCalendar() {
    const calendarContainer = document.querySelector('.calendar-grid');
    if (!calendarContainer) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    calendarContainer.innerHTML = '';
    
    // Create calendar days
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day border-gray-200';
        calendarContainer.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Count violations for this day
        const violationsToday = employees.reduce((count, emp) => {
            return count + emp.violations.filter(v => v.date === dateStr).length;
        }, 0);
        
        dayElement.className = `calendar-day border-gray-200 ${violationsToday > 0 ? 'bg-red-50 border-red-500' : ''}`;
        
        dayElement.innerHTML = `
            <div class="day-number ${day === today.getDate() ? 'today-highlight' : ''}">${day}</div>
            ${violationsToday > 0 ? `<div class="day-info text-red-600">${violationsToday} violations</div>` : ''}
        `;
        
        calendarContainer.appendChild(dayElement);
    }
}
