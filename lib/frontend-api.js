(function (global) {
    function getApiConfig() {
        // Prefer window property; fall back to global binding if not attached to window
        if (typeof global.API_CONFIG !== 'undefined' && global.API_CONFIG) return global.API_CONFIG;
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG) return API_CONFIG;
        return null;
    }

    async function addViolationViaAPI(employeeId, violation) {
        try {
            const cfg = getApiConfig();
            if (!cfg || !cfg.addViolation) {
                throw new Error('API_CONFIG.addViolation is not defined');
            }
            const response = await fetch(cfg.addViolation, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: employeeId,
                    violation: violation
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('API add violation failed:', error);
            return false;
        }
    }

    async function saveViaAPI() {
        try {
            const cfg = getApiConfig();
            if (!cfg || !cfg.updateData) {
                throw new Error('API_CONFIG.updateData is not defined');
            }
            const payloadData = typeof global.serializeData === 'function'
                ? global.serializeData()
                : JSON.stringify((typeof global.employees !== 'undefined' ? global.employees : []), null, 2);
            const response = await fetch(cfg.updateData, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: payloadData,
                    commitMessage: `Update data.json - ${new Date().toISOString()}`
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('API save error:', error);
            return false;
        }
    }

    global.addViolationViaAPI = addViolationViaAPI;
    global.saveViaAPI = saveViaAPI;

    async function loadEmployeesFromAPI() {
        try {
            const cfg = getApiConfig();
            if (!cfg || !cfg.getEmployees) {
                throw new Error('API_CONFIG.getEmployees is not defined');
            }
            const response = await fetch(cfg.getEmployees);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const employees = await response.json();
            return employees;
        } catch (error) {
            console.error('Failed to load employees from API:', error);
            return [];
        }
    }

    async function persistIfPossible() {
        updateSaveStatus('Saving...', 'saving');
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

    global.loadEmployeesFromAPI = loadEmployeesFromAPI;
    global.persistIfPossible = persistIfPossible;

    async function deleteViolation(input) {
        try {
            const cfg = getApiConfig();
            const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/delete-violation` : '/api/delete-violation';
            console.log('deleteViolation request', url, input);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return !!result.success;
        } catch (err) {
            console.error('Failed to delete violation:', err);
            return false;
        }
    }

    global.deleteViolation = deleteViolation;

    async function createEmployeeRemote(employee) {
        try {
            const cfg = getApiConfig();
            const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/add-employee` : '/api/add-employee';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employee)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.employee || null;
        } catch (err) {
            console.error('Failed to create employee:', err);
            return null;
        }
    }

    async function removeEmployeeRemote(id) {
        try {
            const cfg = getApiConfig();
            const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/remove-employee` : '/api/remove-employee';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return !!result.success;
        } catch (err) {
            console.error('Failed to remove employee:', err);
            return false;
        }
    }

    async function updateEmployeeRemote(employee) {
        try {
            const cfg = getApiConfig();
            const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/update-employee` : '/api/update-employee';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employee)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return !!result.success;
        } catch (err) {
            console.error('Failed to update employee:', err);
            return false;
        }
    }

    global.createEmployeeRemote = createEmployeeRemote;
    global.removeEmployeeRemote = removeEmployeeRemote;
    global.updateEmployeeRemote = updateEmployeeRemote;
})(window);


