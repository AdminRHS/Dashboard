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
            const result = await response.json();
            if (!response.ok) {
                const message = result?.details || result?.error || `HTTP error! status: ${response.status}`;
                throw new Error(message);
            }
            return result.employee || null;
        } catch (err) {
            console.error('Failed to create employee:', err);
            throw err;
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
            
            // Ensure id is a number
            const payload = {
                ...employee,
                id: typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id
            };
            
            console.log('Updating employee with payload:', payload);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                const errorMsg = result?.error || result?.details || `HTTP error! status: ${response.status}`;
                console.error('Update employee error response:', result);
                throw new Error(errorMsg);
            }
            
            return !!result.success;
        } catch (err) {
            console.error('Failed to update employee:', err);
            throw err;
        }
    }

    global.createEmployeeRemote = createEmployeeRemote;
    global.removeEmployeeRemote = removeEmployeeRemote;
    global.updateEmployeeRemote = updateEmployeeRemote;

    async function addGreenCardViaAPI(employeeId, greenCard) {
        try {
            const cfg = getApiConfig();
            const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/add-green-card` : '/api/add-green-card';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: employeeId,
                    greenCard: greenCard
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success ? result : false;
        } catch (error) {
            console.error('API add green card failed:', error);
            return false;
        }
    }

    async function deleteGreenCard(input) {
        try {
            const cfg = getApiConfig();
            const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/delete-green-card` : '/api/delete-green-card';
            console.log('deleteGreenCard request', url, input);
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
            console.error('Failed to delete green card:', err);
            return false;
        }
    }

    global.addGreenCardViaAPI = addGreenCardViaAPI;
    global.deleteGreenCard = deleteGreenCard;
})(window);


