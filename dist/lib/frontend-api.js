(function registerFrontendApi(global) {
    const EMPLOYEE_CACHE_KEY = 'yellow-card-dashboard:employees-cache';
    const EMPLOYEE_CACHE_TTL = 5 * 60 * 1000;
    let inflightLoadPromise = null;
    function getApiConfig() {
        if (typeof global.API_CONFIG !== 'undefined' && global.API_CONFIG)
            return global.API_CONFIG;
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG)
            return API_CONFIG;
        return null;
    }
    function readEmployeesCache(options = {}) {
        const { allowStale = false } = options;
        try {
            const raw = localStorage.getItem(EMPLOYEE_CACHE_KEY);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed?.data))
                return null;
            if (!allowStale && parsed?.timestamp && Date.now() - parsed.timestamp > EMPLOYEE_CACHE_TTL) {
                return null;
            }
            return parsed.data;
        }
        catch (error) {
            console.warn('Failed to read employees cache', error);
            return null;
        }
    }
    function writeEmployeesCache(data) {
        try {
            const payload = JSON.stringify({ data, timestamp: Date.now() });
            localStorage.setItem(EMPLOYEE_CACHE_KEY, payload);
        }
        catch (error) {
            console.warn('Failed to persist employees cache', error);
        }
    }
    function invalidateEmployeesCache() {
        inflightLoadPromise = null;
        try {
            localStorage.removeItem(EMPLOYEE_CACHE_KEY);
        }
        catch (error) {
            console.warn('Failed to invalidate employees cache', error);
        }
    }
    function requireConfigEndpoint(key) {
        const cfg = getApiConfig();
        const endpoint = cfg?.[key];
        if (typeof endpoint !== 'string' || !endpoint.length) {
            throw new Error(`API_CONFIG.${String(key)} is not defined`);
        }
        return endpoint;
    }
    function buildApiUrl(path) {
        const cfg = getApiConfig();
        const baseUrl = cfg?.baseUrl;
        if (baseUrl) {
            const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            return `${normalizedBase}${normalizedPath}`;
        }
        return path;
    }
    async function addViolationViaAPI(employeeId, violation) {
        try {
            const endpoint = requireConfigEndpoint('addViolation');
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    violation
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                invalidateEmployeesCache();
            }
            return !!result.success;
        }
        catch (error) {
            console.error('API add violation failed:', error);
            return false;
        }
    }
    async function saveViaAPI() {
        try {
            const endpoint = requireConfigEndpoint('updateData');
            const payloadData = typeof global.serializeData === 'function'
                ? global.serializeData()
                : JSON.stringify((typeof global.employees !== 'undefined' ? global.employees : []), null, 2);
            const response = await fetch(endpoint, {
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
            if (result.success) {
                invalidateEmployeesCache();
            }
            return !!result.success;
        }
        catch (error) {
            console.error('API save error:', error);
            return false;
        }
    }
    async function loadEmployeesFromAPI(forceRefresh = false) {
        if (!forceRefresh) {
            const cached = readEmployeesCache();
            if (cached) {
                return cached;
            }
            if (inflightLoadPromise) {
                return inflightLoadPromise;
            }
        }
        else {
            invalidateEmployeesCache();
        }
        const fetchPromise = async () => {
            try {
                const endpoint = requireConfigEndpoint('getEmployees');
                const response = await fetch(endpoint, {
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (Array.isArray(result)) {
                    writeEmployeesCache(result);
                    return result;
                }
                return [];
            }
            catch (error) {
                console.error('Failed to load employees from API:', error);
                const stale = readEmployeesCache({ allowStale: true });
                if (stale?.length) {
                    console.warn('Using stale employees cache');
                    return stale;
                }
                return [];
            }
            finally {
                if (inflightLoadPromise === fetchPromise) {
                    inflightLoadPromise = null;
                }
            }
        };
        inflightLoadPromise = fetchPromise();
        return inflightLoadPromise;
    }
    async function persistIfPossible() {
        updateSaveStatus('Saving...', 'saving');
        try {
            const success = await saveViaAPI();
            if (success) {
                console.log('Data saved via PostgreSQL API');
                updateSaveStatus('✓ Saved', 'success');
                invalidateEmployeesCache();
            }
            else {
                console.error('Failed to save via PostgreSQL API');
                updateSaveStatus('✗ Failed to save', 'error');
            }
        }
        catch (e) {
            console.error('PostgreSQL API save failed', e);
            updateSaveStatus('✗ Failed to save', 'error');
        }
    }
    async function deleteViolation(input) {
        try {
            const response = await fetch(buildApiUrl('/delete-violation'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                invalidateEmployeesCache();
            }
            return !!result.success;
        }
        catch (err) {
            console.error('Failed to delete violation:', err);
            return false;
        }
    }
    async function createEmployeeRemote(employee) {
        try {
            const response = await fetch(buildApiUrl('/add-employee'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employee)
            });
            const result = await response.json();
            if (!response.ok) {
                const message = result?.details || result?.error || `HTTP error! status: ${response.status}`;
                throw new Error(message);
            }
            if (result.employee) {
                invalidateEmployeesCache();
            }
            return result.employee || null;
        }
        catch (err) {
            console.error('Failed to create employee:', err);
            throw err;
        }
    }
    async function removeEmployeeRemote(id) {
        try {
            const response = await fetch(buildApiUrl('/remove-employee'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                invalidateEmployeesCache();
            }
            return !!result.success;
        }
        catch (err) {
            console.error('Failed to remove employee:', err);
            return false;
        }
    }
    async function updateEmployeeRemote(employee) {
        try {
            const payload = {
                ...employee,
                id: typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id
            };
            const response = await fetch(buildApiUrl('/update-employee'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) {
                const errorMsg = result?.error || result?.details || `HTTP error! status: ${response.status}`;
                throw new Error(errorMsg);
            }
            if (result.success) {
                invalidateEmployeesCache();
            }
            return !!result.success;
        }
        catch (err) {
            console.error('Failed to update employee:', err);
            throw err;
        }
    }
    async function addGreenCardViaAPI(employeeId, greenCard) {
        try {
            const response = await fetch(buildApiUrl('/add-green-card'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    greenCard
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                invalidateEmployeesCache();
                return result;
            }
            return false;
        }
        catch (error) {
            console.error('API add green card failed:', error);
            throw error;
        }
    }
    async function deleteGreenCard(input) {
        try {
            const response = await fetch(buildApiUrl('/delete-green-card'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                invalidateEmployeesCache();
            }
            return !!result.success;
        }
        catch (err) {
            console.error('Failed to delete green card:', err);
            return false;
        }
    }
    global.addViolationViaAPI = addViolationViaAPI;
    global.saveViaAPI = saveViaAPI;
    global.loadEmployeesFromAPI = loadEmployeesFromAPI;
    global.persistIfPossible = persistIfPossible;
    global.deleteViolation = deleteViolation;
    global.createEmployeeRemote = createEmployeeRemote;
    global.removeEmployeeRemote = removeEmployeeRemote;
    global.updateEmployeeRemote = updateEmployeeRemote;
    global.addGreenCardViaAPI = addGreenCardViaAPI;
    global.deleteGreenCard = deleteGreenCard;
})(window);
//# sourceMappingURL=frontend-api.js.map