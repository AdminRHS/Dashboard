// Utility functions

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Tab switching
function switchTab(btn) {
    const tabName = btn.dataset.tab;
    
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Show/hide content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabName).classList.remove('hidden');
}

// Modal management
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showSuccessMessage(btn, message) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${message}</span>`;
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
    lucide.createIcons();
}

// External links
function openEmailClient(email) {
    if (email) {
        window.open(`mailto:${email}`, '_blank');
    }
}

function openDiscordChat(discordId, name) {
    if (discordId) {
        // This would open Discord with the user, but requires Discord to be installed
        alert(`Discord: ${discordId} (${name})`);
    }
}

// Date formatting
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Generate initials from name
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Persistence
function persistIfPossible() {
    // This would save to localStorage or file system
    try {
        localStorage.setItem('employees', JSON.stringify(employees));
    } catch (e) {
        console.warn('Could not persist data:', e);
    }
}

// Additional utility functions from old file
function copyToClipboard(text, buttonElement) {
    const label = buttonElement.querySelector('.info-label');
    const originalText = label.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        label.textContent = 'Copied!';
        label.style.color = '#10b981';
        setTimeout(() => {
            label.textContent = originalText;
            label.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        label.textContent = 'Failed';
        label.style.color = '#ef4444';
        setTimeout(() => {
            label.textContent = originalText;
            label.style.color = '';
        }, 2000);
    });
}

function navigateToEmployee(name) {
    const teamTabButton = document.querySelector('.tab-btn[data-tab="team"]');
    if (teamTabButton) {
        teamTabButton.click();
        setTimeout(() => {
            const employeeElement = document.querySelector(`[data-name="${name}"]`);
            if (employeeElement) {
                employeeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                employeeElement.style.transform = 'scale(1.05)';
                employeeElement.style.boxShadow = '0 0 20px rgba(66, 153, 225, 0.5)';
                setTimeout(() => {
                    employeeElement.style.transform = '';
                    employeeElement.style.boxShadow = '';
                }, 2000);
            }
        }, 100);
    }
}
