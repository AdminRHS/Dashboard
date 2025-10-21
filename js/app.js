// Main application logic

// Give card functionality
function openGiveCardModal(employeeName) {
    const modal = document.getElementById('giveCardModal');
    const nameInput = document.getElementById('employeeName');
    
    if (nameInput) {
        nameInput.value = employeeName;
    }
    
    openModal('giveCardModal');
}

function submitYellowCard() {
    const name = document.getElementById('employeeName').value;
    const type = document.getElementById('violationType').value;
    const comment = document.getElementById('violationComment').value;
    
    if (!name || !type) {
        alert('Please fill in all required fields');
        return;
    }
    
    giveCard(name, type, comment);
    closeModal('giveCardModal');
}

async function giveCard(name, type, comment) {
    const emp = employees.find(e => e.name === name);
    if (emp) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const violation = { date: dateStr, type, comment };
        
        // Save via PostgreSQL API only
        updateSaveStatus('Saving...', 'saving');
        
        try {
            console.log('Adding violation for employee:', emp.name, 'ID:', emp.id, 'Violation:', violation);
            const success = await addViolationViaAPI(emp.id, violation);
            if (success) {
                // Add to local array for immediate UI update
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

// Persistence functions
async function persistIfPossible() {
    updateSaveStatus('Saving...', 'saving');
    
    // Save via PostgreSQL API only
    try {
        const success = await saveViaAPI();
        if (success) {
            console.log('Data saved via PostgreSQL API');
            updateSaveStatus('✓ Saved', 'success');
        } else {
            console.error('Failed to save via PostgreSQL API');
            updateSaveStatus('✗ Failed to save', 'error');
        }
    } catch (e) {
        console.error('PostgreSQL API save failed', e);
        updateSaveStatus('✗ Failed to save', 'error');
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    initializeTheme();
    
    // Load employees from PostgreSQL API only
    try {
        const apiEmployees = await loadEmployeesFromAPI();
        if (apiEmployees && apiEmployees.length > 0) {
            employees = apiEmployees;
            console.log('Loaded employees from PostgreSQL API:', apiEmployees.length);
        } else {
            console.log('No employees found in PostgreSQL database');
            employees = [];
        }
    } catch (e) { 
        console.error('Failed to load from API:', e);
        employees = [];
    }

    renderAll();

    // Add event listeners for clickable rows
    const tableBodies = [
        document.querySelector('#yellowCardsTable tbody'),
        document.querySelector('#leaderboardTable tbody')
    ];

    tableBodies.forEach(tbody => {
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row) {
                    const nameCell = row.querySelector('td:first-child');
                    if (nameCell) {
                        const employeeName = nameCell.textContent.trim();
                        openGiveCardModal(employeeName);
                    }
                }
            });
        }
    });

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
