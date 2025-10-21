// User actions and form handling

function addEmployee(btn) {
    const name = document.getElementById('newEmpName').value.trim();
    const role = document.getElementById('newEmpRole').value.trim();
    const dept = document.getElementById('newEmpDept').value.trim();
    const email = document.getElementById('newEmpEmail').value.trim();
    const discordId = document.getElementById('newEmpDiscord').value.trim();
    const joinDate = new Date().toISOString().split('T')[0];
    
    if (!name || !role || !dept) { 
        alert('Please fill in all required fields.'); 
        return; 
    }
    
    if (employees.some(e => e.name.toLowerCase() === name.toLowerCase())) { 
        alert('An employee with this name already exists.'); 
        return; 
    }
    
    employees.push({ name, role, dept, email, discordId, violations: [], joinDate });
    renderAll();
    persistIfPossible();
    showSuccessMessage(btn, "Employee Added");
    setTimeout(() => closeModal('addEmployeeModal'), 500);
}

function removeEmployee(btn) {
    const name = document.querySelector('#removeEmpDropdown .custom-dropdown-toggle').dataset.value;
    if (!name) { 
        alert('Please select an employee to remove.'); 
        return; 
    }
    
    if (confirm(`Are you sure you want to remove ${name}? This action is permanent.`)) {
        employees = employees.filter(e => e.name !== name);
        renderAll();
        persistIfPossible();
        showSuccessMessage(btn, "Employee Removed");
        setTimeout(() => closeModal('removeEmployeeModal'), 500);
    }
}

function submitYellowCard(btn) {
    const name = document.querySelector('#cardEmployeeDropdown .custom-dropdown-toggle').dataset.value;
    const type = document.querySelector('#cardViolationTypeDropdown .custom-dropdown-toggle').dataset.value;
    const comment = document.getElementById('cardComment').value.trim();
    
    if (!name || !type || !comment) { 
        alert('Please fill in all fields.'); 
        return; 
    }
    
    giveCard(name, type, comment);
    showSuccessMessage(btn, "Card Issued");
    setTimeout(() => closeModal('giveCardModal'), 500);
}

async function giveCard(name, type, comment) {
    const emp = employees.find(e => e.name === name);
    if (emp) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const violation = { date: dateStr, type, comment };
        
        emp.violations.push(violation);
        renderAll();
        persistIfPossible();
        
        // Try to save to API
        try {
            await addViolationViaAPI(emp.id, violation);
        } catch (error) {
            console.warn('Could not save to API, but saved locally:', error);
        }
    }
}

function editEmployee(btn) {
    const name = document.getElementById('editEmpName').value.trim();
    const role = document.getElementById('editEmpRole').value.trim();
    const dept = document.getElementById('editEmpDept').value.trim();
    const email = document.getElementById('editEmpEmail').value.trim();
    const discordId = document.getElementById('editEmpDiscord').value.trim();
    
    if (!name || !role || !dept) { 
        alert('Please fill in all required fields.'); 
        return; 
    }
    
    const emp = employees.find(e => e.name === name);
    if (emp) {
        emp.role = role;
        emp.dept = dept;
        emp.email = email;
        emp.discordId = discordId;
        
        renderAll();
        persistIfPossible();
        showSuccessMessage(btn, "Employee Updated");
        setTimeout(() => closeModal('editEmployeeModal'), 500);
    }
}

// Dropdown functionality
function createDropdown(containerId, options, placeholder, onchangeCallback) {
    console.log('createDropdown called for:', containerId, 'with options:', options);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    container.innerHTML = `
        <button class="custom-dropdown-toggle" onclick="toggleDropdown('${containerId}')">
            <span class="selected-value placeholder">${placeholder}</span>
            <i data-lucide="chevron-down" class="chevron-icon w-5 h-5"></i>
        </button>
        <ul class="custom-dropdown-menu">
            ${options.map(opt => `<li data-value="${opt.value}">${opt.text}</li>`).join('')}
        </ul>
    `;
    
    // Add click handlers for options
    container.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const toggle = container.querySelector('.custom-dropdown-toggle');
            const selectedValueSpan = container.querySelector('.selected-value');
            
            toggle.dataset.value = li.dataset.value;
            selectedValueSpan.textContent = li.textContent;
            selectedValueSpan.classList.remove('placeholder');
            
            // Update visual state
            container.querySelectorAll('li').forEach(l => l.classList.remove('selected'));
            li.classList.add('selected');
            
            // Close dropdown
            container.classList.remove('open');
            
            // Call callback if provided
            if (onchangeCallback) {
                onchangeCallback(li.dataset.value, li.textContent);
            }
        });
    });
    
    lucide.createIcons();
}

function toggleDropdown(containerId) {
    const container = document.getElementById(containerId);
    container.classList.toggle('open');
}

// Make functions globally available
window.createDropdown = createDropdown;
window.toggleDropdown = toggleDropdown;

// Department filter for leaderboard
function populateDeptFilter() {
    const deptOptions = [...new Set(employees.map(e => e.dept))].sort().map(dept => ({
        value: dept,
        text: dept
    }));
    
    createDropdown('leaderboard-dept-filter-container', deptOptions, 'All Departments', (value) => {
        renderLeaderboard();
    });
}

// Leaderboard functionality
function renderLeaderboard() {
    const searchTerm = document.getElementById('leaderboard-search')?.value.toLowerCase() || '';
    const deptFilter = document.querySelector('#leaderboard-dept-filter-container .custom-dropdown-toggle')?.dataset.value || '';
    const periodFilter = document.querySelector('.period-btn.active')?.dataset.period || 'all';
    
    let filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm);
        const matchesDept = !deptFilter || emp.dept === deptFilter;
        return matchesSearch && matchesDept;
    });
    
    // Sort by days without cards (descending)
    filteredEmployees.sort((a, b) => {
        const aDays = getDaysWithoutCards(a);
        const bDays = getDaysWithoutCards(b);
        return bDays - aDays;
    });
    
    const tableBody = document.getElementById('leaderboard-table-body');
    let content = '';
    
    filteredEmployees.forEach((emp, index) => {
        const daysWithoutCards = getDaysWithoutCards(emp);
        const lastCardDate = getLastCardDate(emp);
        const initials = getInitials(emp.name);
        const deptColor = departmentColors[emp.dept] || departmentColors['default'];
        
        let badge = '';
        if (index === 0 && daysWithoutCards > 30) {
            badge = '<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🏆 Top Performer</span>';
        } else if (daysWithoutCards > 60) {
            badge = '<span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">⭐ Excellent</span>';
        }
        
        content += `
            <tr class="hover:bg-gray-50">
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
                <td class="p-4 text-sm text-gray-600">${lastCardDate}</td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-bold text-green-600">${daysWithoutCards}</span>
                        <span class="text-sm text-gray-600">days</span>
                    </div>
                </td>
                <td class="p-4">${badge}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = content;
    lucide.createIcons();
}

function getDaysWithoutCards(employee) {
    if (employee.violations.length === 0) {
        const joinDate = new Date(employee.joinDate);
        const today = new Date();
        return Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    }
    
    const lastViolation = employee.violations.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const lastViolationDate = new Date(lastViolation.date);
    const today = new Date();
    return Math.floor((today - lastViolationDate) / (1000 * 60 * 60 * 24));
}

function getLastCardDate(employee) {
    if (employee.violations.length === 0) {
        return 'Never';
    }
    
    const lastViolation = employee.violations.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return formatDate(new Date(lastViolation.date));
}

function setPeriodFilter(btn) {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderLeaderboard();
}

// Additional functions from old file
function saveEmployeeChanges(btn) {
    const originalName = document.getElementById('originalEmpName').value;
    const name = document.getElementById('editEmpName').value.trim();
    const role = document.getElementById('editEmpRole').value.trim();
    const dept = document.getElementById('editEmpDept').value.trim();
    const email = document.getElementById('editEmpEmail').value.trim();
    const discordId = document.getElementById('editEmpDiscord').value.trim();
    
    if (!name || !role || !dept) { 
        alert('Please fill in all required fields.'); 
        return; 
    }
    
    const emp = employees.find(e => e.name === originalName);
    if (emp) {
        // Check if name changed and if new name already exists
        if (name !== originalName && employees.some(e => e.name.toLowerCase() === name.toLowerCase())) {
            alert('An employee with this name already exists.');
            return;
        }
        
        emp.name = name;
        emp.role = role;
        emp.dept = dept;
        emp.email = email;
        emp.discordId = discordId;
        
        renderAll();
        persistIfPossible();
        showSuccessMessage(btn, "Employee Updated");
        setTimeout(() => closeModal('editEmployeeModal'), 500);
    }
}

function openEditEmployeeModal(employeeName) {
    closeModal('employeeModal');
    
    const employee = employees.find(e => e.name === employeeName);
    if (employee) {
        // Create edit modal content if it doesn't exist
        const editModalContent = document.getElementById('editEmployeeModalContent');
        if (!editModalContent.innerHTML.includes('editEmpName')) {
            editModalContent.innerHTML = `
                <button class="close-btn" onclick="closeModal('editEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button>
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Edit Employee</h2>
                <input type="hidden" id="originalEmpName" value="${employee.name}">
                <label for="editEmpName" class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i>Name:</label>
                <input type="text" id="editEmpName" value="${employee.name}" required>
                <label for="editEmpRole" class="flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4"></i>Role:</label>
                <input type="text" id="editEmpRole" value="${employee.role}" required>
                <label for="editEmpDept" class="flex items-center gap-2"><i data-lucide="building" class="w-4 h-4"></i>Department:</label>
                <input type="text" id="editEmpDept" value="${employee.dept}" required>
                <label for="editEmpEmail" class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i>Email:</label>
                <input type="email" id="editEmpEmail" value="${employee.email || ''}">
                <label for="editEmpDiscord" class="flex items-center gap-2"><i data-lucide="message-circle" class="w-4 h-4"></i>Discord ID:</label>
                <input type="text" id="editEmpDiscord" value="${employee.discordId || ''}">
                <button class="action-button mt-2" onclick="saveEmployeeChanges(this)"><i data-lucide="save" class="w-4 h-4"></i><span>Save Changes</span></button>
            `;
        } else {
            document.getElementById('originalEmpName').value = employee.name;
            document.getElementById('editEmpName').value = employee.name;
            document.getElementById('editEmpRole').value = employee.role;
            document.getElementById('editEmpDept').value = employee.dept;
            document.getElementById('editEmpEmail').value = employee.email || '';
            document.getElementById('editEmpDiscord').value = employee.discordId || '';
        }
        
        document.getElementById('editEmployeeModal').style.display = 'flex';
        lucide.createIcons();
    }
}
