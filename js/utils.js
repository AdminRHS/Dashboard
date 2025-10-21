// Utility functions

function serializeData() {
    return JSON.stringify(employees, null, 2);
}

function updateSaveStatus(message, type = 'info') {
    const statusElement = document.getElementById('save-status');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = `status-${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = '';
        }, 3000);
    }
}

function copyToClipboard(text, buttonElement) {
    const label = buttonElement.querySelector('.info-label');
    const originalLabelText = label.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        label.textContent = 'Copied!';
        label.style.color = 'var(--color-success-main)';
        
        setTimeout(() => {
            label.textContent = originalLabelText;
            label.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        label.textContent = 'Failed';
        label.style.color = 'var(--color-error-main)';
        
        setTimeout(() => {
            label.textContent = originalLabelText;
            label.style.color = '';
        }, 2000);
    });
}

function showSuccessMessage(buttonElement, message) {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = message;
    buttonElement.style.backgroundColor = 'var(--color-success-main)';
    buttonElement.style.color = 'white';
    
    setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.style.backgroundColor = '';
        buttonElement.style.color = '';
    }, 2000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateDaysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getViolationStats() {
    const stats = {
        total: 0,
        documentation: 0,
        workflow: 0,
        communication: 0
    };
    
    employees.forEach(emp => {
        emp.violations.forEach(violation => {
            stats.total++;
            stats[violation.type.toLowerCase()]++;
        });
    });
    
    return stats;
}

function getEmployeesWithViolations() {
    return employees.filter(emp => emp.violations.length > 0);
}

function getEmployeesWithoutViolations() {
    return employees.filter(emp => emp.violations.length === 0);
}
