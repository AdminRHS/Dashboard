(function (global) {
    function showEmployeeModal(data) {
            const employee = employees.find(e => e.name === data.name);
            const cards = parseInt(data.cards, 10);
            const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const deptColor = departmentColors[data.dept] || departmentColors['default'];
            const isDarkMode = document.body.classList.contains('dark-theme');

            let finalDeptColor = deptColor;
            if(isDarkMode && data.dept === 'Design') {
                finalDeptColor = '#c4b5fd';
            }
            if (isDarkMode && deptColor === '#8e1c1c') {
                finalDeptColor = '#be3535';
            }

            let cardDisplayHTML = '';
            if (cards === 0) {
                cardDisplayHTML = `
                    <div class="info-block static-block">
                        <span class="info-value">0</span>
                        <span class="info-label">Yellow Cards</span>
                    </div>`;
            } else if (cards === 1) {
                cardDisplayHTML = `
                    <div class="modal-stat-card detailed-stat-card-v2 card-yellow">
                        <div class="stat-number">${cards}</div>
                        <div class="card-stack-wrapper"><div class="stack-shape stack-medium"></div></div>
                    </div>`;
            } else if (cards === 2) {
                cardDisplayHTML = `
                    <div class="modal-stat-card detailed-stat-card-v2 card-orange">
                        <div class="stat-number">${cards}</div>
                        <div class="card-stack-wrapper"><div class="stack-shape stack-dark"></div><div class="stack-shape stack-medium"></div></div>
                    </div>`;
            } else { // 3 or more cards
                cardDisplayHTML = `
                    <div class="modal-stat-card detailed-stat-card-v2 card-red">
                        <div class="stat-number">${cards}</div>
                        <div class="card-stack-wrapper"><div class="stack-shape stack-dark"></div><div class="stack-shape stack-medium"></div><div class="stack-shape stack-light"></div></div>
                    </div>`;
            }

            let violationIndicatorColor;
            if (cards === 1) {
                violationIndicatorColor = '#eab308'; // Yellow
            } else if (cards === 2) {
                violationIndicatorColor = '#f97316'; // Orange
            } else if (cards >= 3) {
                violationIndicatorColor = 'var(--color-error-main)'; // Red
            }

            const violationsList = employee.violations.length > 0
                ? `<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"><h4 class="font-semibold mb-2">Violations:</h4><ul class="space-y-2 text-sm text-gray-600">${
                    employee.violations.map(v => {
                        const raw = v.date;
                        let displayDate = '';
                        if (typeof raw === 'string') {
                            displayDate = raw.includes('T') ? raw.split('T')[0] : raw;
                        } else if (raw instanceof Date) {
                            displayDate = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`;
                        } else {
                            const d = new Date(raw);
                            if (!isNaN(d)) {
                                displayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            }
                        }
                        return `<li class="flex items-start gap-3">
                                    <div class="w-3 h-3 mt-1 rounded-sm flex-shrink-0" style="background-color:${violationIndicatorColor}"></div>
                                    <div class="flex-1"><strong>${displayDate} [${v.type}]</strong>: ${v.comment || 'No comment'}</div>
                                    <button class="ml-2 text-red-600 hover:text-red-700" onclick="confirmDeleteViolation(${v.id}, '${employee.name.replace(/'/g, "\\'")}')" title="Remove card"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </li>`;
                    }).join('')
                }</ul></div>`
                : '';

            document.getElementById('employeeModalContent').innerHTML = `
                <button class="close-btn" onclick="closeModal('employeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button>
                
                <div class="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-3xl font-bold text-gray-500">${initials}</span>
                    </div>
                    <div class="flex-grow text-center sm:text-left">
                        <h2 class="text-2xl font-bold text-gray-800">${data.name}</h2>
                        <p class="font-semibold" style="color: ${finalDeptColor};">${data.role}</p>
                        <p class="font-semibold" style="color: ${finalDeptColor};">${data.dept}</p>
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
                
                <div class="flex justify-start gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button class="action-button-secondary" onclick="openEditEmployeeModal('${data.name}')"><i data-lucide="edit" class="w-4 h-4"></i><span>Edit</span></button>
                    <button class="action-button" onclick="openGiveCardModalForEmployee('${data.name}')"><i data-lucide="alert-triangle" class="w-4 h-4"></i><span>Give Card</span></button>
                </div>
            `;
            document.getElementById('employeeModal').style.display = 'flex';
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
                            vDateStr = raw.includes('T') ? raw.split('T')[0] : raw;
                        } else if (raw instanceof Date) {
                            vDateStr = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`;
                        } else {
                            const d = new Date(raw);
                            if (!isNaN(d)) {
                                vDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            } else {
                                vDateStr = '';
                            }
                        }
                        return vDateStr === dateStr;
                    })
                    .map(v => ({ id: v.id, name: e.name, type: v.type, comment: v.comment }));
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
                        <div class="flex items-start gap-3">
                            <div class="w-3 h-3 mt-1.5 rounded-sm ${colorClass} flex-shrink-0"></div>
                            <div class="text-gray-700">
                                <strong>${v.name} (${v.type}):</strong> ${v.comment || 'No comment'}
                            </div>
                            <button class="ml-2 text-red-600 hover:text-red-700" onclick="confirmDeleteViolation(${v.id}, '${v.name.replace(/'/g, "\\'")}')" title="Remove card"><i data-lucide=\"trash-2\" class=\"w-4 h-4\"></i></button>
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

    function openEditEmployeeModal(name) {
            const emp = employees.find(e => e.name === name);
            if (!emp) return;

            document.getElementById('editEmployeeModalContent').innerHTML = `
                <button class="close-btn" onclick="closeModal('editEmployeeModal')"><i data-lucide="x" class="w-6 h-6"></i></button>
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Edit Employee</h2>
                <input type="hidden" id="originalEmpName" value="${emp.name}">
                <label class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> Full Name: <span class="text-red-500">*</span></label><input type="text" id="editEmpName" value="${emp.name}">
                <label class="flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4"></i> Profession/Role: <span class="text-red-500">*</span></label><input type="text" id="editEmpRole" value="${emp.role}">
                <label class="flex items-center gap-2"><i data-lucide="building-2" class="w-4 h-4"></i> Department: <span class="text-red-500">*</span></label><input type="text" id="editEmpDept" value="${emp.dept}">
                <label class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4"></i> Email:</label><input type="email" id="editEmpEmail" value="${emp.email}">
                <label class="flex items-center gap-2"><i data-lucide="at-sign" class="w-4 h-4"></i> Discord:</label><input type="text" id="editEmpDiscord" value="${emp.discordId || ''}">
                <button class="action-button-success mt-2" onclick="saveEmployeeChanges(this)"><i data-lucide="save" class="w-4 h-4"></i><span>Save Changes</span></button>`;
            closeModal('employeeModal');
            document.getElementById('editEmployeeModal').style.display = 'flex';
            lucide.createIcons();
    }

    global.showEmployeeModal = showEmployeeModal;
    global.showDayDetailsModal = showDayDetailsModal;
    global.openEditEmployeeModal = openEditEmployeeModal;

  function closeModal(id) {
      document.getElementById(id).style.display = 'none';
  }

  function openGiveCardModalForEmployee(name) {
      closeModal('employeeModal');
      openGiveCardModal(name);
  }

  function openAddEmployeeModal() {
      document.getElementById('addEmployeeModal').style.display = 'flex';
      lucide.createIcons();
  }

  function openRemoveEmployeeModal() {
      renderModals();
      document.getElementById('removeEmployeeModal').style.display = 'flex';
      lucide.createIcons();
  }

  function openGiveCardModal(name = null) {
      renderModals();
      if (name) {
          const dropdown = document.querySelector('#cardEmployeeDropdown');
          const toggle = dropdown.querySelector('.custom-dropdown-toggle');
          const item = dropdown.querySelector(`li[data-value="${name}"]`);
          if (item) {
              toggle.dataset.value = name;
              toggle.querySelector('.selected-value').textContent = item.textContent;
              toggle.querySelector('.selected-value').classList.remove('placeholder');
          }
      }
      document.getElementById('giveCardModal').style.display = 'flex';
      lucide.createIcons();
  }

  global.closeModal = closeModal;
  global.openGiveCardModalForEmployee = openGiveCardModalForEmployee;
  global.openAddEmployeeModal = openAddEmployeeModal;
  global.openRemoveEmployeeModal = openRemoveEmployeeModal;
  global.openGiveCardModal = openGiveCardModal;
})(window);


