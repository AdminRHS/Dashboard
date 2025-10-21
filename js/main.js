// Main initialization and event listeners

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
        console.error('Failed to load from PostgreSQL API:', e);
        employees = [];
    }

    renderAll();

    // Add single event listener for clickable rows
    const tableBodies = [
        document.getElementById('yellow-card-table-body'),
        document.getElementById('leaderboard-table-body')
    ];
    tableBodies.forEach(body => {
        if (body) {
            body.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row && row.dataset.name) {
                    showEmployeeModal(row.dataset);
                }
            });
        }
    });

    // Add event listeners for dropdowns
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });

    // Add keyboard navigation for dropdowns
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
});
