// API functions for data management

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
        return result;
    } catch (error) {
        console.error('Failed to add violation via API:', error);
        throw error;
    }
}

// Update data via API
async function updateDataViaAPI(data) {
    try {
        const response = await fetch(API_CONFIG.updateData, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Failed to update data via API:', error);
        throw error;
    }
}
