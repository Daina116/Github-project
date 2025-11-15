// Settings Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    loadSettingsFromStorage();
});

function initializeSettings() {
    updateSidebarUser();
    setupSettingsNavigation();
    setupEventListeners();
}

// Setup settings navigation
function setupSettingsNavigation() {
    const navButtons = document.querySelectorAll('.settings-nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding section
            const sectionName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            const section = document.getElementById(`${sectionName}-settings`);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Theme change
    const colorTheme = document.getElementById('colorTheme');
    if (colorTheme) {
        colorTheme.addEventListener('change', function() {
            changeTheme(this.value);
        });
    }
    
    // Accent color change
    const accentColor = document.getElementById('accentColor');
    if (accentColor) {
        accentColor.addEventListener('input', function() {
            changeAccentColor(this.value);
        });
    }
    
    // Font size change
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('change', function() {
            changeFontSize(this.value);
        });
    }
    
    // Sidebar width change
    const sidebarWidth = document.getElementById('sidebarWidth');
    if (sidebarWidth) {
        sidebarWidth.addEventListener('input', function() {
            changeSidebarWidth(this.value);
        });
    }
    
    // Compact mode toggle
    const compactMode = document.getElementById('compactMode');
    if (compactMode) {
        compactMode.addEventListener('change', function() {
            toggleCompactMode(this.checked);
        });
    }
}

// Show settings section
function showSettingsSection(section) {
    // Remove active class from all buttons and sections
    document.querySelectorAll('.settings-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.settings-section').forEach(sec => sec.classList.remove('active'));
    
    // Add active class to clicked button and section
    const button = document.querySelector(`[onclick="showSettingsSection('${section}')"]`);
    if (button) {
        button.classList.add('active');
    }
    
    const sectionElement = document.getElementById(`${section}-settings`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
}

// Load settings from localStorage
function loadSettingsFromStorage() {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // Account settings
    if (settings.username) {
        document.getElementById('usernameSetting').value = settings.username;
    }
    if (settings.email) {
        document.getElementById('emailSetting').value = settings.email;
    }
    if (settings.phone) {
        document.getElementById('phoneSetting').value = settings.phone;
    }
    
    // Notification settings
    if (settings.emailInvitations !== undefined) {
        document.getElementById('emailInvitations').checked = settings.emailInvitations;
    }
    if (settings.emailActivity !== undefined) {
        document.getElementById('emailActivity').checked = settings.emailActivity;
    }
    if (settings.emailWeekly !== undefined) {
        document.getElementById('emailWeekly').checked = settings.emailWeekly;
    }
    if (settings.pushNotifications !== undefined) {
        document.getElementById('pushNotifications').checked = settings.pushNotifications;
    }
    if (settings.messageNotifications !== undefined) {
        document.getElementById('messageNotifications').checked = settings.messageNotifications;
    }
    if (settings.meetingReminders !== undefined) {
        document.getElementById('meetingReminders').checked = settings.meetingReminders;
    }
    
    // Privacy settings
    if (settings.profileVisibility) {
        document.getElementById('profileVisibility').value = settings.profileVisibility;
    }
    if (settings.showOnlineStatus !== undefined) {
        document.getElementById('showOnlineStatus').checked = settings.showOnlineStatus;
    }
    if (settings.showActivityStatus !== undefined) {
        document.getElementById('showActivityStatus').checked = settings.showActivityStatus;
    }
    if (settings.usageAnalytics !== undefined) {
        document.getElementById('usageAnalytics').checked = settings.usageAnalytics;
    }
    if (settings.personalization !== undefined) {
        document.getElementById('personalization').checked = settings.personalization;
    }
    
    // Appearance settings
    if (settings.colorTheme) {
        document.getElementById('colorTheme').value = settings.colorTheme;
        changeTheme(settings.colorTheme);
    }
    if (settings.accentColor) {
        document.getElementById('accentColor').value = settings.accentColor;
        changeAccentColor(settings.accentColor);
    }
    if (settings.fontSize) {
        document.getElementById('fontSize').value = settings.fontSize;
        changeFontSize(settings.fontSize);
    }
    if (settings.compactMode !== undefined) {
        document.getElementById('compactMode').checked = settings.compactMode;
        toggleCompactMode(settings.compactMode);
    }
    if (settings.sidebarWidth) {
        document.getElementById('sidebarWidth').value = settings.sidebarWidth;
        changeSidebarWidth(settings.sidebarWidth);
    }
    
    // Workspace settings
    if (settings.defaultWorkspaceType) {
        document.getElementById('defaultWorkspaceType').value = settings.defaultWorkspaceType;
    }
    if (settings.autoJoinWorkspaces !== undefined) {
        document.getElementById('autoJoinWorkspaces').checked = settings.autoJoinWorkspaces;
    }
    if (settings.showArchived !== undefined) {
        document.getElementById('showArchived').checked = settings.showArchived;
    }
    if (settings.defaultPermissions) {
        document.getElementById('defaultPermissions').value = settings.defaultPermissions;
    }
    if (settings.requireApproval !== undefined) {
        document.getElementById('requireApproval').checked = settings.requireApproval;
    }
    
    // Security settings
    if (settings.twoFactorAuth !== undefined) {
        document.getElementById('twoFactorAuth').checked = settings.twoFactorAuth;
    }
    if (settings.autoLogout) {
        document.getElementById('autoLogout').value = settings.autoLogout;
    }
    if (settings.loginNotifications !== undefined) {
        document.getElementById('loginNotifications').checked = settings.loginNotifications;
    }
    if (settings.suspiciousDetection !== undefined) {
        document.getElementById('suspiciousDetection').checked = settings.suspiciousDetection;
    }
}

// Save all settings
function saveAllSettings() {
    const settings = {
        // Account settings
        username: document.getElementById('usernameSetting').value,
        email: document.getElementById('emailSetting').value,
        phone: document.getElementById('phoneSetting').value,
        
        // Notification settings
        emailInvitations: document.getElementById('emailInvitations').checked,
        emailActivity: document.getElementById('emailActivity').checked,
        emailWeekly: document.getElementById('emailWeekly').checked,
        pushNotifications: document.getElementById('pushNotifications').checked,
        messageNotifications: document.getElementById('messageNotifications').checked,
        meetingReminders: document.getElementById('meetingReminders').checked,
        
        // Privacy settings
        profileVisibility: document.getElementById('profileVisibility').value,
        showOnlineStatus: document.getElementById('showOnlineStatus').checked,
        showActivityStatus: document.getElementById('showActivityStatus').checked,
        usageAnalytics: document.getElementById('usageAnalytics').checked,
        personalization: document.getElementById('personalization').checked,
        
        // Appearance settings
        colorTheme: document.getElementById('colorTheme').value,
        accentColor: document.getElementById('accentColor').value,
        fontSize: document.getElementById('fontSize').value,
        compactMode: document.getElementById('compactMode').checked,
        sidebarWidth: document.getElementById('sidebarWidth').value,
        
        // Workspace settings
        defaultWorkspaceType: document.getElementById('defaultWorkspaceType').value,
        autoJoinWorkspaces: document.getElementById('autoJoinWorkspaces').checked,
        showArchived: document.getElementById('showArchived').checked,
        defaultPermissions: document.getElementById('defaultPermissions').value,
        requireApproval: document.getElementById('requireApproval').checked,
        
        // Security settings
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        autoLogout: document.getElementById('autoLogout').value,
        loginNotifications: document.getElementById('loginNotifications').checked,
        suspiciousDetection: document.getElementById('suspiciousDetection').checked
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Update current user info if changed
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.email !== settings.email || currentUser.name !== settings.username) {
        currentUser.email = settings.email;
        currentUser.name = settings.username;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateSidebarUser();
        updateWorkspacesUserInfo(currentUser);
    }
    
    showNotification('Settings saved successfully!', 'success');
}

// Reset settings to defaults
function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
        localStorage.removeItem('userSettings');
        location.reload();
    }
}

// Theme functions
function changeTheme(theme) {
    const body = document.body;
    
    switch(theme) {
        case 'dark':
            body.classList.add('dark-mode');
            break;
        case 'light':
            body.classList.remove('dark-mode');
            break;
        case 'auto':
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
            break;
    }
}

function changeAccentColor(color) {
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Update elements with primary color
    const elements = document.querySelectorAll('.btn-primary, .stat-icon, .activity-icon');
    elements.forEach(el => {
        el.style.backgroundColor = color;
    });
}

function changeFontSize(size) {
    const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
        'extra-large': '20px'
    };
    
    document.documentElement.style.fontSize = sizes[size] || '16px';
}

function toggleCompactMode(enabled) {
    if (enabled) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
}

function changeSidebarWidth(width) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.width = width + 'px';
    }
}

// Account functions
function updateUsername() {
    const newUsername = document.getElementById('usernameSetting').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (newUsername && newUsername !== currentUser.name) {
        currentUser.name = newUsername;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateSidebarUser();
        updateWorkspacesUserInfo(currentUser);
        showNotification('Username updated successfully!', 'success');
    }
}

function updateEmail() {
    const newEmail = document.getElementById('emailSetting').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (newEmail && newEmail !== currentUser.email) {
        currentUser.email = newEmail;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateSidebarUser();
        updateWorkspacesUserInfo(currentUser);
        showNotification('Email updated successfully!', 'success');
    }
}

function updatePhone() {
    const newPhone = document.getElementById('phoneSetting').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (newPhone !== currentUser.phone) {
        currentUser.phone = newPhone;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Phone number updated successfully!', 'success');
    }
}

function manageSubscription() {
    alert('Subscription management would open a payment portal. This is a demo version.');
}

function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            // Clear all user data
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userSettings');
            localStorage.removeItem('workspaces');
            
            alert('Account deleted successfully. You will be redirected to the home page.');
            window.location.href = 'index.html';
        }
    }
}

// Password functions
function showPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
}

function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long!', 'error');
        return;
    }
    
    // In a real application, this would validate with the server
    closeModal('passwordModal');
    showNotification('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Sessions functions
function showSessionsModal() {
    const sessionsList = document.getElementById('sessionsList');
    const sessions = generateMockSessions();
    
    sessionsList.innerHTML = sessions.map(session => `
        <div class="session-item">
            <div class="session-info">
                <h4>${session.device}</h4>
                <p>${session.browser} • ${session.location}</p>
                <p>Last active: ${session.lastActive}</p>
            </div>
            <div class="session-actions">
                ${session.current ? '<span class="current-session">Current</span>' : 
                  '<button class="btn btn-danger btn-sm" onclick="revokeSession(\'' + session.id + '\')">Revoke</button>'}
            </div>
        </div>
    `).join('');
    
    document.getElementById('sessionsModal').style.display = 'block';
}

function generateMockSessions() {
    return [
        {
            id: '1',
            device: 'Windows PC',
            browser: 'Chrome 120',
            location: 'San Francisco, CA',
            lastActive: '2 minutes ago',
            current: true
        },
        {
            id: '2',
            device: 'iPhone 14',
            browser: 'Safari 17',
            location: 'San Francisco, CA',
            lastActive: '1 hour ago',
            current: false
        },
        {
            id: '3',
            device: 'MacBook Pro',
            browser: 'Firefox 121',
            location: 'New York, NY',
            lastActive: '3 days ago',
            current: false
        }
    ];
}

function revokeSession(sessionId) {
    if (confirm('Are you sure you want to revoke this session?')) {
        showNotification('Session revoked successfully!', 'success');
        showSessionsModal(); // Refresh the sessions list
    }
}

function revokeAllSessions() {
    if (confirm('Are you sure you want to revoke all other sessions? You will be logged out everywhere except this device.')) {
        showNotification('All other sessions revoked successfully!', 'success');
        showSessionsModal(); // Refresh the sessions list
    }
}

// Helper functions
function updateSidebarUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userNameElement = document.getElementById('sidebarUserName');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'Guest User';
    }
}

function updateWorkspacesUserInfo(updatedUser) {
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    
    workspaces.forEach(workspace => {
        if (workspace.members) {
            workspace.members = workspace.members.map(member => 
                member.email === updatedUser.email 
                    ? { ...member, name: updatedUser.name }
                    : member
            );
        }
    });
    
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#6366f1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add settings page specific styles
const settingsStyles = document.createElement('style');
settingsStyles.textContent = `
    .settings-content {
        display: flex;
        gap: 2rem;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .settings-nav {
        min-width: 250px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 1rem;
    }
    
    .settings-nav-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border: none;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        color: #4a5568;
        margin-bottom: 0.5rem;
    }
    
    .settings-nav-btn:hover {
        background: #f7fafc;
    }
    
    .settings-nav-btn.active {
        background: #6366f1;
        color: white;
    }
    
    .settings-nav-btn i {
        width: 16px;
    }
    
    .settings-body {
        flex: 1;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 2rem;
    }
    
    .settings-section {
        display: none;
    }
    
    .settings-section.active {
        display: block;
    }
    
    .settings-section h2 {
        margin: 0 0 2rem 0;
        color: #2d3748;
        font-size: 1.5rem;
    }
    
    .setting-group {
        margin-bottom: 2rem;
    }
    
    .setting-group h3 {
        margin: 0 0 1rem 0;
        color: #4a5568;
        font-size: 1.125rem;
    }
    
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .setting-item:last-child {
        border-bottom: none;
    }
    
    .setting-info label {
        display: block;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
    }
    
    .setting-info p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .setting-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .setting-control input[type="text"],
    .setting-control input[type="email"],
    .setting-control input[type="tel"],
    .setting-control select {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.875rem;
    }
    
    .setting-control input[type="range"] {
        width: 120px;
    }
    
    .setting-item.danger {
        border-top: 2px solid #f56565;
        padding-top: 1.5rem;
        margin-top: 1rem;
    }
    
    .settings-footer {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 2rem;
        border-top: 1px solid #e2e8f0;
        margin-top: 2rem;
    }
    
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
    }
    
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #cbd5e0;
        transition: .4s;
        border-radius: 24px;
    }
    
    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    
    input:checked + .slider {
        background-color: #6366f1;
    }
    
    input:checked + .slider:before {
        transform: translateX(26px);
    }
    
    .color-picker-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .color-picker-group input[type="color"] {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }
    
    .sessions-list {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .session-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    
    .session-info h4 {
        margin: 0 0 0.25rem 0;
        color: #2d3748;
    }
    
    .session-info p {
        margin: 0 0 0.25rem 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .current-session {
        color: #48bb78;
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
        .settings-content {
            flex-direction: column;
        }
        
        .settings-nav {
            min-width: auto;
        }
        
        .settings-nav-btn {
            justify-content: center;
        }
        
        .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }
        
        .setting-control {
            width: 100%;
            justify-content: flex-end;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(settingsStyles);
