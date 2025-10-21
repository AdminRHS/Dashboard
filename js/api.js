// API configuration
const API_CONFIG = {
    baseUrl: 'https://dashboard-eight-beta-59.vercel.app/api',
    getEmployees: 'https://dashboard-eight-beta-59.vercel.app/api/get-employees',
    addViolation: 'https://dashboard-eight-beta-59.vercel.app/api/add-violation',
    updateData: 'https://dashboard-eight-beta-59.vercel.app/api/update-data'
};

// Load employees from PostgreSQL API
async function loadEmployeesFromAPI() {
    try {
        const response = await fetch(API_CONFIG.getEmployees);
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

// Add violation via PostgreSQL API
async function addViolationViaAPI(employeeId, violation) {
    try {
        const response = await fetch(API_CONFIG.addViolation, {
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

// Legacy function for compatibility
async function saveViaAPI() {
    try {
        const response = await fetch(API_CONFIG.updateData, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: serializeData(),
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
