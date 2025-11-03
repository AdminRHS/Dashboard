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
})(window);


