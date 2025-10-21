// Rendering functions

function renderAll() {
    employees.sort((a, b) => a.name.localeCompare(b.name));
    renderStats();
    renderCalendar();
    renderYellowCardTable();
    renderTeamGrids();
    populateDeptFilter();
    renderLeaderboard();
    renderModals();
    lucide.createIcons();
}

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
            maxDept = d;
            maxCount = deptCards[d];
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

function renderYellowCardTable() {
    const tableBody = document.getElementById('yellow-card-table-body');
    let content = '';
    employees.forEach(emp => {
        const cards = emp.violations.length;
        let status, cardIndicatorHtml;
        
        if (cards === 0) {
            status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">✓ Safe</span>';
            cardIndicatorHtml = '<div class="w-3 h-3 bg-green-500 rounded-full"></div>';
        } else if (cards === 1) {
            status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-yellow-100 text-yellow-700">⚠ Warning</span>';
            cardIndicatorHtml = '<div class="w-3 h-3 bg-yellow-500 rounded-full"></div>';
        } else if (cards === 2) {
            status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-orange-100 text-orange-700">⚠⚠ Caution</span>';
            cardIndicatorHtml = '<div class="w-3 h-3 bg-orange-500 rounded-full"></div>';
        } else {
            status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-700">🚨 Critical</span>';
            cardIndicatorHtml = '<div class="w-3 h-3 bg-red-600 rounded-full"></div>';
        }
        
        const initials = getInitials(emp.name);
        const deptColor = departmentColors[emp.dept] || departmentColors['default'];
        
        // Get violation types for display
        const violationTypes = emp.violations.map(v => v.type).join(', ') || 'None';
        
        content += `
            <tr class="hover:bg-gray-50 cursor-pointer" data-name="${emp.name}" data-role="${emp.role}" data-dept="${emp.dept}" data-email="${emp.email}" data-discord="${emp.discordId}" data-cards="${cards}">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${deptColor}20; border: 2px solid ${deptColor}">
                            <span class="font-bold text-sm" style="color: ${deptColor}">${initials}</span>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${emp.name}</div>
                            <div class="text-sm text-gray-600">${emp.role}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="text-sm px-2 py-1 rounded-full text-white" style="background-color: ${deptColor}">${emp.dept}</span>
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        ${cardIndicatorHtml}
                        <span class="text-sm text-gray-600">${cards} card${cards !== 1 ? 's' : ''}</span>
                    </div>
                </td>
                <td class="p-4">
                    <div class="text-sm text-gray-600">${violationTypes}</div>
                </td>
                <td class="p-4">${status}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = content;
    lucide.createIcons();
}

function renderTeamGrids() {
    const container = document.getElementById('team-grids-container');
    container.innerHTML = '';
    document.getElementById('team-structure-heading').textContent = `Team Structure (${employees.length} Members)`;
    
    const departments = [...new Set(employees.map(e => e.dept))].sort();
    
    departments.forEach(dept => {
        const deptEmployees = employees.filter(e => e.dept === dept);
        const deptColor = departmentColors[dept] || departmentColors['default'];
        
        let deptHTML = `
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800">${dept}</h3>
                    <span class="text-sm text-gray-600">${deptEmployees.length} members</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        `;
        
        deptEmployees.forEach(emp => {
            const cards = emp.violations.length;
            const initials = getInitials(emp.name);
            let cardIndicator = '';
            
            if (cards > 0) {
                let cardColor = 'bg-gray-400';
                if (cards === 1) cardColor = 'bg-yellow-500';
                else if (cards === 2) cardColor = 'bg-orange-500';
                else if (cards >= 3) cardColor = 'bg-red-600';
                
                cardIndicator = `<div class="w-3 h-3 ${cardColor} rounded-full"></div>`;
            }
            
            deptHTML += `
                <div class="team-member p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer" 
                     data-name="${emp.name}" data-role="${emp.role}" data-dept="${emp.dept}" 
                     data-email="${emp.email}" data-discord="${emp.discordId}" data-cards="${cards}">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: ${deptColor}20; border: 2px solid ${deptColor}">
                            <span class="font-bold text-lg" style="color: ${deptColor}">${initials}</span>
                        </div>
                        <div class="text-left flex-1">
                            <h4 class="font-bold text-gray-800">${emp.name}</h4>
                            <div class="text-sm text-gray-600">${emp.role}</div>
                        </div>
                        ${cardIndicator}
                    </div>
                </div>
            `;
        });
        
        deptHTML += '</div></div>';
        container.innerHTML += deptHTML;
    });
    
    document.querySelectorAll('.team-member').forEach(member => member.addEventListener('click', () => showEmployeeModal(member.dataset)));
    lucide.createIcons();
}

function renderModals() {
    const employeeOptions = employees.map(emp => ({ value: emp.name, text: `${emp.name} (${emp.dept})` }));
    
    // Give Card Modal
    const giveCardModalContent = document.getElementById('giveCardModalContent');
    giveCardModalContent.innerHTML = `
        <button class="close-btn" onclick="closeModal('giveCardModal')"><i data-lucide="x" class="w-6 h-6"></i></button>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Give Yellow Card</h2>
        <label for="cardEmployeeDropdown" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Employee:</label>
        <div id="cardEmployeeDropdown" class="custom-dropdown"></div>
        <label for="cardViolationTypeDropdown" class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i>Violation Type:</label>
        <div id="cardViolationTypeDropdown" class="custom-dropdown"></div>
        <label for="cardComment" class="flex items-center gap-2"><i data-lucide="file-text" class="w-4 h-4"></i>Details:</label>
        <textarea id="cardComment" rows="3" placeholder="Add specific details..." required></textarea>
        <button class="action-button mt-2" onclick="submitYellowCard(this)"><i data-lucide="send" class="w-4 h-4"></i><span>Issue Yellow Card</span></button>
    `;
    createDropdown('cardEmployeeDropdown', employeeOptions, 'Select an employee...');
    createDropdown('cardViolationTypeDropdown', [
        { value: 'Attendance', text: 'Attendance Issues' },
        { value: 'Performance', text: 'Performance Issues' },
        { value: 'Communication', text: 'Communication Problems' },
        { value: 'Deadline', text: 'Missed Deadlines' },
        { value: 'Quality', text: 'Quality Issues' },
        { value: 'Other', text: 'Other' }
    ], 'Select violation type...');
    
    // Add Employee Modal
    const addEmployeeModalContent = document.getElementById('addEmployeeModalContent');
    addEmployeeModalContent.innerHTML = `
        <button class="close-btn" onclick="closeModal('addEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Add New Employee</h2>
        <label for="newEmpName" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Name:</label>
        <input type="text" id="newEmpName" placeholder="Full name" required>
        <label for="newEmpRole" class="flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4"></i>Role:</label>
        <input type="text" id="newEmpRole" placeholder="Job title" required>
        <label for="newEmpDept" class="flex items-center gap-2"><i data-lucide="building" class="w-4 h-4"></i>Department:</label>
        <input type="text" id="newEmpDept" placeholder="Department" required>
        <label for="newEmpEmail" class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i>Email:</label>
        <input type="email" id="newEmpEmail" placeholder="Email address">
        <label for="newEmpDiscord" class="flex items-center gap-2"><i data-lucide="message-circle" class="w-4 h-4"></i>Discord ID:</label>
        <input type="text" id="newEmpDiscord" placeholder="Discord username">
        <button class="action-button mt-2" onclick="addEmployee(this)"><i data-lucide="user-plus" class="w-4 h-4"></i><span>Add Employee</span></button>
    `;
    
    // Remove Employee Modal
    const removeEmployeeModalContent = document.getElementById('removeEmployeeModalContent');
    removeEmployeeModalContent.innerHTML = `
        <button class="close-btn" onclick="closeModal('removeEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Remove Employee</h2>
        <label for="removeEmpDropdown" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Employee:</label>
        <div id="removeEmpDropdown" class="custom-dropdown"></div>
        <button class="action-button mt-2" onclick="removeEmployee(this)"><i data-lucide="user-minus" class="w-4 h-4"></i><span>Remove Employee</span></button>
    `;
    createDropdown('removeEmpDropdown', employeeOptions, 'Select an employee...');
    
    lucide.createIcons();
}

// Make functions globally available
window.renderModals = renderModals;
