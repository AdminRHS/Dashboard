(function (global) {
    async function addViolationViaAPI(employeeId, violation) {
        try {
            const response = await fetch(global.API_CONFIG?.addViolation, {
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
            const response = await fetch(global.API_CONFIG?.updateData, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: typeof global.serializeData === 'function' ? global.serializeData() : undefined,
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


