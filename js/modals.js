// Modal functionality

function showEmployeeModal(data) {
    const employee = employees.find(e => e.name === data.name);
    const cards = parseInt(data.cards, 10);
    const initials = getInitials(data.name);
    const deptColor = departmentColors[data.dept] || departmentColors['default'];
    const isDarkMode = document.body.classList.contains('dark-theme');

    let cardDisplayHTML = '';
    if (cards > 0) {
        let cardColor = 'bg-gray-400';
        if (cards === 1) cardColor = 'bg-yellow-500';
        else if (cards === 2) cardColor = 'bg-orange-500';
        else if (cards >= 3) cardColor = 'bg-red-600';
        
        cardDisplayHTML = `
            <div class="info-block">
                <div class="w-6 h-6 ${cardColor} rounded-full flex items-center justify-center">
                    <span class="text-white text-xs font-bold">${cards}</span>
                </div>
                <span class="info-label">Yellow Cards</span>
            </div>
        `;
    }

    let violationsList = '';
    if (employee && employee.violations.length > 0) {
        violationsList = `
            <div class="mt-6">
                <h3 class="text-lg font-bold text-gray-800 mb-3">Recent Violations</h3>
                <div class="space-y-2">
                    ${employee.violations.slice(0, 3).map(v => `
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-semibold text-gray-800">${v.type}</div>
                                    <div class="text-sm text-gray-600">${formatDate(new Date(v.date))}</div>
                                </div>
                            </div>
                            ${v.comment ? `<div class="text-sm text-gray-700 mt-2">${v.comment}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById('employeeModalContent').innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
            <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background-color: ${deptColor}20; border: 2px solid ${deptColor}">
                    <span class="text-2xl font-bold" style="color: ${deptColor}">${initials}</span>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">${data.name}</h2>
                    <div class="text-gray-600">${data.role}</div>
                    <div class="text-sm text-gray-500">${data.dept}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="info-block" onclick="openEmailClient('${data.email || ''}')">
                    <i data-lucide="mail" class="w-6 h-6"></i>
                    <span class="info-label">Email</span>
                </div>
                <div class="info-block" onclick="openDiscordChat('${data.discordId || ''}', '${data.name}')">
                    <img src="discord_2.png" alt="Discord Icon" class="w-6 h-6">
                    <span class="info-label">Discord</span>
                </div>
                ${cardDisplayHTML}
            </div>

            ${violationsList}

            <div class="flex gap-3 mt-6">
                <button class="action-button-secondary" onclick="openEditEmployeeModal('${data.name}')"><i data-lucide="edit" class="w-4 h-4"></i><span>Edit</span></button>
                <button class="action-button" onclick="openGiveCardModalForEmployee('${data.name}')"><i data-lucide="alert-triangle" class="w-4 h-4"></i><span>Give Card</span></button>
            </div>
        </div>
    `;
    document.getElementById('employeeModal').style.display = 'flex';
    lucide.createIcons();
}

function openGiveCardModalForEmployee(employeeName) {
    closeModal('employeeModal');
    
    // Set the employee dropdown to the selected employee
    const employeeDropdown = document.querySelector('#cardEmployeeDropdown .custom-dropdown-toggle');
    if (employeeDropdown) {
        employeeDropdown.dataset.value = employeeName;
        employeeDropdown.querySelector('.selected-value').textContent = employeeName;
    }
    
    document.getElementById('giveCardModal').style.display = 'flex';
}

function openEditEmployeeModal(employeeName) {
    closeModal('employeeModal');
    
    const employee = employees.find(e => e.name === employeeName);
    if (employee) {
        document.getElementById('editEmpName').value = employee.name;
        document.getElementById('editEmpRole').value = employee.role;
        document.getElementById('editEmpDept').value = employee.dept;
        document.getElementById('editEmpEmail').value = employee.email;
        document.getElementById('editEmpDiscord').value = employee.discordId;
        
        document.getElementById('editEmployeeModal').style.display = 'flex';
    }
}

function openAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'flex';
}

function openRemoveEmployeeModal() {
    document.getElementById('removeEmployeeModal').style.display = 'flex';
}

function openGiveCardModal() {
    document.getElementById('giveCardModal').style.display = 'flex';
}
