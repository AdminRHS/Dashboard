(function registerEmployeeState(global) {
    const CACHE_KEY = 'yc_dashboard_employees_v1';
    const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
    const subscribers = new Set();
    const employeeTarget = [];
    let suppressNotify = false;
    function runSubscribers(options) {
        subscribers.forEach(callback => {
            try {
                callback(employeeProxy);
            }
            catch (error) {
                console.error('[EmployeeState] subscriber failed', error);
            }
        });
        if (!options?.skipPersist) {
            persistSnapshot();
        }
    }
    function persistSnapshot(snapshot) {
        if (typeof localStorage === 'undefined')
            return;
        try {
            const payload = {
                timestamp: Date.now(),
                employees: snapshot ?? employeeTarget
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        }
        catch (error) {
            console.warn('[EmployeeState] Failed to persist cache', error);
        }
    }
    function loadCache(maxAge = CACHE_TTL) {
        if (typeof localStorage === 'undefined')
            return null;
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            if (!parsed?.employees || !Array.isArray(parsed.employees))
                return null;
            if (typeof parsed.timestamp === 'number' && Date.now() - parsed.timestamp > maxAge) {
                return null;
            }
            return parsed.employees;
        }
        catch (error) {
            console.warn('[EmployeeState] Failed to parse cache', error);
            return null;
        }
    }
    const employeeProxy = new Proxy(employeeTarget, {
        set(target, prop, value) {
            const result = Reflect.set(target, prop, value);
            if (!suppressNotify) {
                runSubscribers();
            }
            return result;
        },
        deleteProperty(target, prop) {
            const result = Reflect.deleteProperty(target, prop);
            if (!suppressNotify) {
                runSubscribers();
            }
            return result;
        }
    });
    function replaceEmployees(list, options) {
        suppressNotify = true;
        employeeTarget.length = 0;
        list.forEach(item => employeeTarget.push(item));
        suppressNotify = false;
        runSubscribers({ skipPersist: !!options?.skipCache });
        if (!options?.skipCache) {
            persistSnapshot(list);
        }
    }
    function markDirty() {
        runSubscribers();
    }
    function subscribe(callback) {
        if (typeof callback !== 'function')
            return () => undefined;
        subscribers.add(callback);
        return () => subscribers.delete(callback);
    }
    global.employees = employeeProxy;
    global.EmployeeState = {
        employees: employeeProxy,
        replaceEmployees,
        markDirty,
        subscribe,
        loadCache,
        clearCache() {
            if (typeof localStorage === 'undefined')
                return;
            localStorage.removeItem(CACHE_KEY);
        },
        CACHE_TTL
    };
})(window);
//# sourceMappingURL=state.js.map