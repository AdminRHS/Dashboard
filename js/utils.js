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
