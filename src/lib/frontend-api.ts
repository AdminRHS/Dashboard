(function registerFrontendApi(global: Window & typeof globalThis) {
  let inflightLoadPromise: Promise<Employee[]> | null = null;

  function getApiConfig(): ApiConfig | null {
    if (typeof global.API_CONFIG !== 'undefined' && global.API_CONFIG) return global.API_CONFIG;
    return null;
  }





  function requireConfigEndpoint<K extends keyof ApiConfig>(key: K): string {
    const cfg = getApiConfig();
    const endpoint = cfg?.[key];
    if (typeof endpoint !== 'string' || !endpoint.length) {
      throw new Error(`API_CONFIG.${String(key)} is not defined`);
    }
    return endpoint;
  }

  function buildApiUrl(path: string): string {
    const cfg = getApiConfig();
    const baseUrl = cfg?.baseUrl;
    if (baseUrl) {
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return `${normalizedBase}${normalizedPath}`;
    }
    return path;
  }



  function handleForbidden(response: Response): boolean {
    if (response.status === 403) {
      if (typeof (global as any).toggleAdminModal === 'function') {
        (global as any).toggleAdminModal();
      }
      return true;
    }
    return false;
  }

  function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if ((global as any).adminToken) {
      headers['Authorization'] = `Bearer ${(global as any).adminToken}`;
    }
    return headers;
  }

  async function addViolationViaAPI(employeeId: number, violation: Violation): Promise<boolean> {
    try {
      const endpoint = requireConfigEndpoint('addViolation');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employeeId,
          violation
        })
      });

      if (handleForbidden(response)) return false;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        }
      return !!result.success;
    } catch (error) {
      console.error('API add violation failed:', error);
      return false;
    }
  }

  async function saveViaAPI(): Promise<boolean> {
    try {
      const endpoint = requireConfigEndpoint('updateData');
      const payloadData = typeof global.serializeData === 'function'
        ? global.serializeData()
        : JSON.stringify((typeof global.employees !== 'undefined' ? global.employees : []), null, 2);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          data: payloadData,
          commitMessage: `Update data.json - ${new Date().toISOString()}`
        })
      });

      if (handleForbidden(response)) return false;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        }
      return !!result.success;
    } catch (error) {
      console.error('API save error:', error);
      return false;
    }
  }

  function executeNetworkLoad(): Promise<Employee[]> {
    if (inflightLoadPromise) {
      return inflightLoadPromise;
    }

    inflightLoadPromise = (async () => {
      try {
        const endpoint = requireConfigEndpoint('getEmployees');
        const response = await fetch(endpoint, { headers: { 'Cache-Control': 'no-cache' } });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (Array.isArray(result)) {
          return result;
        }
        return [];
      } catch (error) {
        console.error('Failed to load employees from API:', error);
        return [];
      } finally {
        inflightLoadPromise = null;
      }
    })();

    return inflightLoadPromise;
  }

  async function loadEmployeesFromAPI(forceRefresh = false): Promise<Employee[]> {
    if (inflightLoadPromise) {
      return inflightLoadPromise;
    }
    return executeNetworkLoad();
  }

  async function persistIfPossible(): Promise<void> {
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

  async function deleteViolation(input: Record<string, unknown>): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/delete-violation'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input)
      });
      if (handleForbidden(response)) return false;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        }
      return !!result.success;
    } catch (err) {
      console.error('Failed to delete violation:', err);
      return false;
    }
  }

  async function createEmployeeRemote(employee: Employee): Promise<Employee | null> {
    try {
      const response = await fetch(buildApiUrl('/add-employee'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(employee)
      });
      if (handleForbidden(response)) return null;
      const result = await response.json();
      if (!response.ok) {
        const message = result?.details || result?.error || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      if (result.employee) {
        }
      return result.employee || null;
    } catch (err) {
      console.error('Failed to create employee:', err);
      throw err;
    }
  }

  async function removeEmployeeRemote(id: number): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/remove-employee'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });
      if (handleForbidden(response)) return false;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        }
      return !!result.success;
    } catch (err) {
      console.error('Failed to remove employee:', err);
      return false;
    }
  }

  async function updateEmployeeRemote(employee: Employee): Promise<boolean> {
    try {
      const payload = {
        ...employee,
        id: typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id
      };

      const response = await fetch(buildApiUrl('/update-employee'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (handleForbidden(response)) return false;
      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result?.error || result?.details || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (result.success) {
        }
      return !!result.success;
    } catch (err) {
      console.error('Failed to update employee:', err);
      throw err;
    }
  }

  async function addGreenCardViaAPI(employeeId: number, greenCard: GreenCard): Promise<{ success: boolean; id?: number } | false> {
    try {
      const response = await fetch(buildApiUrl('/add-green-card'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employeeId,
          greenCard
        })
      });

      if (handleForbidden(response)) return false;
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
          return result;
      }
      return false;
    } catch (error) {
      console.error('API add green card failed:', error);
      throw error;
    }
  }

  async function deleteGreenCard(input: Record<string, unknown>): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl('/delete-green-card'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input)
      });
      if (handleForbidden(response)) return false;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        }
      return !!result.success;
    } catch (err) {
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



