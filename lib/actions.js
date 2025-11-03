(function (global) {
    function showSuccessMessage(buttonElement, message = "Success") {
        if (!buttonElement) return;
        const originalHtml = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = `<span class="text-green-400">✓ ${message}</span>`;
        setTimeout(() => {
            buttonElement.innerHTML = originalHtml;
            buttonElement.disabled = false;
            lucide.createIcons();
        }, 2000);
    }

    function addEmployee(btn) {
            const name = document.getElementById('newEmpName').value.trim();
            const role = document.getElementById('newEmpRole').value.trim();
            const dept = document.getElementById('newEmpDept').value.trim();
            const email = document.getElementById('newEmpEmail').value.trim();
            const discordId = document.getElementById('newEmpDiscord').value.trim();
            const joinDate = new Date().toISOString().split('T')[0];
            if (!name || !role || !dept) { alert('Please fill in all required fields.'); return; }
            if (employees.some(e => e.name.toLowerCase() === name.toLowerCase())) { alert('An employee with this name already exists.'); return; }
            employees.push({ name, role, dept, email, discordId, violations: [], joinDate });
            renderAll();
            persistIfPossible();
            showSuccessMessage(btn, "Employee Added");
            setTimeout(() => closeModal('addEmployeeModal'), 500);
    }
    
    function removeEmployee(btn) {
            const name = document.querySelector('#removeEmpDropdown .custom-dropdown-toggle').dataset.value;
            if (!name) { alert('Please select an employee to remove.'); return; }
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

            if (!name || !type) { alert('Please select an employee and a violation type.'); return; }
            if (!comment) { alert('Please fill in the details field.'); return; }
            
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
                
                updateSaveStatus('Saving...', 'saving');
                
                try {
                    console.log('Adding violation for employee:', emp.name, 'ID:', emp.id, 'Violation:', violation);
                    const success = await addViolationViaAPI(emp.id, violation);
                    if (success) {
                        emp.violations.push(violation);
                        renderAll();
                        updateSaveStatus('✓ Saved', 'success');
                        console.log('Violation saved to PostgreSQL');
                    } else {
                        updateSaveStatus('✗ Failed to save', 'error');
                    }
                } catch (error) {
                    console.error('Failed to save via API:', error);
                    updateSaveStatus('✗ Failed to save', 'error');
                }
            }
    }

    global.addEmployee = addEmployee;
    global.removeEmployee = removeEmployee;
    global.submitYellowCard = submitYellowCard;
    global.giveCard = giveCard;

    function copyToClipboard(text, buttonElement) {
        const label = buttonElement.querySelector('.info-label');
        const originalLabelText = label.textContent;

        if (!text) {
            label.textContent = 'No Data';
            setTimeout(() => {
                label.textContent = originalLabelText;
            }, 1500);
            return;
        }

        const fallbackCopyTextToClipboard = (textToCopy) => {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    return Promise.resolve();
                } else {
                    return Promise.reject();
                }
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        };

        const copyAction = navigator.clipboard ? navigator.clipboard.writeText(text) : fallbackCopyTextToClipboard(text);

        copyAction.then(() => {
            const iconContainer = buttonElement.querySelector('i, img');
            const originalIconHTML = iconContainer.outerHTML;

            label.textContent = 'Copied!';
            label.classList.add('text-green-500');

            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'check');
            checkIcon.classList.add('w-6', 'h-6', 'text-green-500');
            iconContainer.replaceWith(checkIcon);
            lucide.createIcons();

            setTimeout(() => {
                const currentIcon = buttonElement.querySelector('i');
                if (currentIcon) {
                    currentIcon.outerHTML = originalIconHTML;
                }
                label.textContent = originalLabelText;
                label.classList.remove('text-green-500');
                lucide.createIcons();
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            label.textContent = 'Failed!';
            setTimeout(() => {
                label.textContent = originalLabelText;
            }, 1500);
        });
    }

    global.copyToClipboard = copyToClipboard;
})(window);


