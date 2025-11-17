(function registerFrontendApi(global: Window & typeof globalThis) {
  function getApiConfig(): ApiConfig | null {
    if (typeof global.API_CONFIG !== 'undefined' && global.API_CONFIG) return global.API_CONFIG;
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG) return API_CONFIG;
    return null;
  }

  async function addViolationViaAPI(employeeId: number, violation: Violation): Promise<boolean> {
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
          employeeId,
          violation
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return !!result.success;
    } catch (error) {
      console.error('API add violation failed:', error);
      return false;
    }
  }

  async function saveViaAPI(): Promise<boolean> {
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
      return !!result.success;
    } catch (error) {
      console.error('API save error:', error);
      return false;
    }
  }

  async function loadEmployeesFromAPI(): Promise<Employee[]> {
    try {
      const cfg = getApiConfig();
      if (!cfg || !cfg.getEmployees) {
        throw new Error('API_CONFIG.getEmployees is not defined');
      }
      const response = await fetch(cfg.getEmployees);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to load employees from API:', error);
      return [];
    }
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
      const cfg = getApiConfig();
      const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/delete-violation` : '/api/delete-violation';
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

  async function createEmployeeRemote(employee: Employee): Promise<Employee | null> {
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

  async function removeEmployeeRemote(id: number): Promise<boolean> {
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

  async function updateEmployeeRemote(employee: Employee): Promise<boolean> {
    try {
      const cfg = getApiConfig();
      const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/update-employee` : '/api/update-employee';

      const payload = {
        ...employee,
        id: typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result?.error || result?.details || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      return !!result.success;
    } catch (err) {
      console.error('Failed to update employee:', err);
      throw err;
    }
  }

  async function addGreenCardViaAPI(employeeId: number, greenCard: GreenCard): Promise<{ success: boolean; id?: number } | false> {
    try {
      const cfg = getApiConfig();
      const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/add-green-card` : '/api/add-green-card';
      const response = await fetch(url, {
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
      const cfg = getApiConfig();
      const url = (cfg && cfg.baseUrl) ? `${cfg.baseUrl}/delete-green-card` : '/api/delete-green-card';
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


