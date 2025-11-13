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

    async function addEmployee(btn) {
        const name = document.getElementById('newEmpName').value.trim();
        const role = document.getElementById('newEmpRole').value.trim();
        const dept = document.getElementById('newEmpDept').value.trim();
        const email = document.getElementById('newEmpEmail').value.trim();
        const discordId = document.getElementById('newEmpDiscord').value.trim();
        const joinDate = new Date().toISOString().split('T')[0];
        if (!name || !role || !dept) { alert('Please fill in all required fields.'); return; }
        if (employees.some(e => e.name.toLowerCase() === name.toLowerCase())) { alert('An employee with this name already exists.'); return; }

        updateSaveStatus('Saving...', 'saving');

        const newEmployee = {
            name,
            role,
            dept,
            email,
            discordId,
            joinDate,
            violations: []
        };

        try {
            const remoteEmployee = await createEmployeeRemote(newEmployee);
            if (!remoteEmployee) {
                throw new Error('Empty response from API');
            }
            employees.push(remoteEmployee);
            renderAll();
            showSuccessMessage(btn, "Employee Added");
            updateSaveStatus('✓ Saved', 'success');
            setTimeout(() => closeModal('addEmployeeModal'), 500);
            document.getElementById('newEmpName').value = '';
            document.getElementById('newEmpRole').value = '';
            document.getElementById('newEmpDept').value = '';
            document.getElementById('newEmpEmail').value = '';
            document.getElementById('newEmpDiscord').value = '';
        } catch (error) {
            console.error('Failed to create employee:', error);
            updateSaveStatus('✗ Failed to save', 'error');
            alert(`Failed to create employee: ${error.message || error}`);
        }
    }
    
    async function removeEmployee(btn) {
        const name = document.querySelector('#removeEmpDropdown .custom-dropdown-toggle').dataset.value;
        if (!name) { alert('Please select an employee to remove.'); return; }
        if (!confirm(`Are you sure you want to remove ${name}? This action is permanent.`)) {
            return;
        }
        const emp = employees.find(e => e.name === name);
        if (!emp) {
            alert('Employee not found.');
            return;
        }
        if (!emp.id && emp.id !== 0) {
            alert('Employee ID is missing. Cannot remove employee.');
            return;
        }

        updateSaveStatus('Saving...', 'saving');
        const success = await removeEmployeeRemote(emp.id);
        if (success) {
            employees = employees.filter(e => e.id !== emp.id);
            renderAll();
            showSuccessMessage(btn, "Employee Removed");
            updateSaveStatus('✓ Saved', 'success');
            setTimeout(() => closeModal('removeEmployeeModal'), 500);
        } else {
            updateSaveStatus('✗ Failed to save', 'error');
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
                    if (!emp.id && emp.id !== 0) {
                        console.error('Employee ID is missing:', emp);
                        updateSaveStatus('✗ Employee ID missing', 'error');
                        return;
                    }
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

    function submitGreenCard(btn) {
            const name = document.querySelector('#greenCardEmployeeDropdown .custom-dropdown-toggle').dataset.value;
            const type = document.querySelector('#greenCardTypeDropdown .custom-dropdown-toggle').dataset.value;
            const comment = document.getElementById('greenCardComment').value.trim();

            if (!name || !type) { alert('Please select an employee and a card type.'); return; }
            if (!comment) { alert('Please fill in the details field.'); return; }
            
            giveGreenCard(name, type, comment);
            showSuccessMessage(btn, "Green Card Issued");
            setTimeout(() => closeModal('giveGreenCardModal'), 500);
    }
    
    async function giveGreenCard(name, type, comment) {
            const emp = employees.find(e => e.name === name);
            if (emp) {
                const today = new Date();
                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const greenCard = { date: dateStr, type, comment };
                
                updateSaveStatus('Saving...', 'saving');
                
                try {
                    console.log('Adding green card for employee:', emp.name, 'ID:', emp.id, 'Green Card:', greenCard);
                    const result = await addGreenCardViaAPI(emp.id, greenCard);
                    if (result && result.success) {
                        if (!emp.greenCards) {
                            emp.greenCards = [];
                        }
                        greenCard.id = result.id;
                        emp.greenCards.push(greenCard);
                        renderAll();
                        updateSaveStatus('✓ Saved', 'success');
                        console.log('Green card saved to PostgreSQL');
                    } else {
                        updateSaveStatus('✗ Failed to save', 'error');
                        alert('Failed to save green card. Please try again.');
                    }
                } catch (error) {
                    console.error('Failed to save via API:', error);
                    updateSaveStatus('✗ Failed to save', 'error');
                    alert(`Failed to save green card: ${error.message || error}. The green_cards table may need to be created in the database.`);
                }
            }
    }

    global.addEmployee = addEmployee;
    global.removeEmployee = removeEmployee;
    global.submitYellowCard = submitYellowCard;
    global.submitGreenCard = submitGreenCard;
    global.giveCard = giveCard;
    global.giveGreenCard = giveGreenCard;

    async function saveEmployeeChanges(btn) {
        const originalName = document.getElementById('originalEmpName').value;
        const newName = document.getElementById('editEmpName').value.trim();
        const newRole = document.getElementById('editEmpRole').value.trim();
        const newDept = document.getElementById('editEmpDept').value.trim();
        const newEmail = document.getElementById('editEmpEmail').value.trim();
        const newDiscordId = document.getElementById('editEmpDiscord').value.trim();

        if (!newName || !newRole || !newDept) { alert('Please fill in all required fields.'); return; }
        
        const emp = employees.find(e => e.name === originalName);
        if (!emp) { alert('Employee not found.'); return; }
        if (!emp.id && emp.id !== 0) {
            alert('Employee ID is missing. Cannot update employee.');
            return;
        }

        if (employees.some(e => e.id !== emp.id && e.name.toLowerCase() === newName.toLowerCase())) {
            alert('An employee with this name already exists.');
            return;
        }

        updateSaveStatus('Saving...', 'saving');

        const payload = {
            id: emp.id,
            name: newName,
            role: newRole,
            dept: newDept,
            email: newEmail,
            discordId: newDiscordId,
            joinDate: emp.joinDate || null
        };

        try {
            const success = await updateEmployeeRemote(payload);
            if (success) {
                emp.name = newName;
                emp.role = newRole;
                emp.dept = newDept;
                emp.email = newEmail;
                emp.discordId = newDiscordId;
                renderAll();
                showSuccessMessage(btn, "Changes Saved");
                updateSaveStatus('✓ Saved', 'success');
                setTimeout(() => closeModal('editEmployeeModal'), 500);
            } else {
                updateSaveStatus('✗ Failed to save', 'error');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            updateSaveStatus('✗ Failed to save', 'error');
            alert(`Failed to update employee: ${error.message || error}`);
        }
    }

    global.saveEmployeeChanges = saveEmployeeChanges;

    function openEmailClient(email) {
        if (email) {
            window.location.href = `mailto:${email}`;
        }
    }

    function openDiscordChat(discordId, name) {
        if (name === 'Artemchuk Nikolay') {
            const discordUserId = '910144676881903646';
            window.open(`https://discord.com/users/${discordUserId}`, '_blank');
        } else if (discordId) {
            const discordButton = document.querySelector(`.info-block[onclick*="openDiscordChat('${discordId}'"]`);
            if (discordButton) {
                copyToClipboard(discordId, discordButton);
            }
        }
    }

    global.openEmailClient = openEmailClient;
    global.openDiscordChat = openDiscordChat;

    async function confirmDeleteViolation(violationId, employeeName, meta) {
        console.log('confirmDeleteViolation clicked', { violationId, employeeName, meta });
        if (!confirm('Remove this yellow card?')) return;
        let payload;
        const hasId = Number.isFinite(violationId);
        if (hasId) {
            payload = { violationId };
        } else if (meta && meta.date && meta.type) {
            payload = { name: employeeName, date: meta.date, type: meta.type, comment: meta.comment || '' };
        } else {
            updateSaveStatus('✗ Cannot delete: missing identifier', 'error');
            return;
        }
        const ok = await deleteViolation(payload);
        if (ok) {
            // Remove locally
            const emp = employees.find(e => e.name === employeeName);
            if (emp) {
                if (hasId) {
                    emp.violations = emp.violations.filter(v => v && v.id !== violationId);
                } else {
                    emp.violations = emp.violations.filter(v => v && !(v.date === meta.date && v.type === meta.type && (v.comment || '') === (meta.comment || '')));
                }
            } else {
                // Fallback: remove from any employee containing it
                employees.forEach(e => {
                    if (hasId) {
                        e.violations = e.violations.filter(v => v && v.id !== violationId);
                    } else {
                        e.violations = e.violations.filter(v => v && !(v.date === meta.date && v.type === meta.type && (v.comment || '') === (meta.comment || '')));
                    }
                });
            }
            renderAll();
            updateSaveStatus('✓ Card removed', 'success');
            if (meta && meta.context === 'employee') {
                const updatedEmp = employees.find(e => e.name === employeeName);
                if (updatedEmp) {
                    showEmployeeModal({
                        name: updatedEmp.name,
                        role: updatedEmp.role,
                        dept: updatedEmp.dept,
                        email: updatedEmp.email,
                        discordId: updatedEmp.discordId,
                        cards: updatedEmp.violations.length
                    });
                } else {
                    closeModal('employeeModal');
                }
            } else if (meta && meta.context === 'day' && meta.date) {
                const parts = meta.date.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
                        showDayDetailsModal(year, month, day);
                    }
                }
            }
        } else {
            updateSaveStatus('✗ Failed to remove card', 'error');
        }
    }

    global.confirmDeleteViolation = confirmDeleteViolation;

    async function confirmDeleteGreenCard(greenCardId, employeeName, meta) {
        console.log('confirmDeleteGreenCard clicked', { greenCardId, employeeName, meta });
        if (!confirm('Remove this green card?')) return;
        let payload;
        const hasId = Number.isFinite(greenCardId);
        if (hasId) {
            payload = { greenCardId };
        } else if (meta && meta.date && meta.type) {
            payload = { name: employeeName, date: meta.date, type: meta.type, comment: meta.comment || '' };
        } else {
            updateSaveStatus('✗ Cannot delete: missing identifier', 'error');
            return;
        }
        const ok = await deleteGreenCard(payload);
        if (ok) {
            // Remove locally
            const emp = employees.find(e => e.name === employeeName);
            if (emp && emp.greenCards) {
                if (hasId) {
                    emp.greenCards = emp.greenCards.filter(gc => gc.id !== greenCardId);
                } else {
                    emp.greenCards = emp.greenCards.filter(gc => !(gc.date === meta.date && gc.type === meta.type && (gc.comment || '') === (meta.comment || '')));
                }
            }
            renderAll();
            updateSaveStatus('✓ Green card removed', 'success');
            if (meta && meta.context === 'employee') {
                const updatedEmp = employees.find(e => e.name === employeeName);
                if (updatedEmp) {
                    showEmployeeModal({
                        name: updatedEmp.name,
                        role: updatedEmp.role,
                        dept: updatedEmp.dept,
                        email: updatedEmp.email,
                        discordId: updatedEmp.discordId,
                        cards: updatedEmp.violations.length
                    });
                } else {
                    closeModal('employeeModal');
                }
            }
        } else {
            updateSaveStatus('✗ Failed to remove green card', 'error');
        }
    }

    global.confirmDeleteGreenCard = confirmDeleteGreenCard;

    // Event delegation for dynamically rendered delete buttons
    document.addEventListener('click', (event) => {
        const btn = event.target.closest('.js-delete-violation');
        if (btn) {
            const violationId = btn.dataset.violationId ? Number.parseInt(btn.dataset.violationId, 10) : NaN;
            const employeeName = btn.dataset.employeeName || '';
            const meta = {
                context: btn.dataset.context,
                date: btn.dataset.date,
                type: btn.dataset.type,
                comment: btn.dataset.comment
            };
            confirmDeleteViolation(violationId, employeeName, meta);
            return;
        }
        
        const greenCardBtn = event.target.closest('.js-delete-green-card');
        if (greenCardBtn) {
            const greenCardId = greenCardBtn.dataset.greenCardId ? Number.parseInt(greenCardBtn.dataset.greenCardId, 10) : NaN;
            const employeeName = greenCardBtn.dataset.employeeName || '';
            const meta = {
                context: greenCardBtn.dataset.context,
                date: greenCardBtn.dataset.date,
                type: greenCardBtn.dataset.type,
                comment: greenCardBtn.dataset.comment
            };
            confirmDeleteGreenCard(greenCardId, employeeName, meta);
        }
    });
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


