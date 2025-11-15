// Profile Page JavaScript
let currentUser = null;
let notifications = [];

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeProfile();
    loadNotifications();
});

// Load user data from localStorage
function loadUserData() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateProfileDisplay();
    } else {
        // Redirect to home if not logged in
        window.location.href = 'index.html';
    }
}

// Initialize profile page
function initializeProfile() {
    loadWorkspaces();
    loadActivity();
    updateNotificationCount();
}

// Update profile display
function updateProfileDisplay() {
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.username || 'John Doe';
        document.getElementById('profileEmail').textContent = currentUser.email || 'john.doe@example.com';
        document.getElementById('fullName').textContent = currentUser.username || 'John Doe';
        document.getElementById('userEmail').textContent = currentUser.email || 'john.doe@example.com';
        
        // Update edit form values
        document.getElementById('editFullName').value = currentUser.username || 'John Doe';
        document.getElementById('editEmail').value = currentUser.email || 'john.doe@example.com';
    }
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and panes
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab and pane
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load tab-specific data
    if (tabName === 'workspaces') {
        loadWorkspaces();
    } else if (tabName === 'activity') {
        loadActivity();
    }
}

// Load workspaces
function loadWorkspaces() {
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const grid = document.getElementById('workspacesGrid');
    
    if (workspaces.length === 0) {
        grid.innerHTML = '<p>No workspaces found. Create your first workspace!</p>';
        return;
    }
    
    grid.innerHTML = workspaces.map(workspace => `
        <div class="workspace-card" onclick="openWorkspace('${workspace.id}')">
            <h3>${workspace.name}</h3>
            <p>${workspace.description}</p>
            <div class="workspace-meta">
                <span>${workspace.participants?.length || 1} participants</span>
                <span>${workspace.type}</span>
            </div>
        </div>
    `).join('');
}

// Load activity
function loadActivity() {
    const activities = [
        {
            type: 'document',
            icon: 'fa-file-alt',
            title: 'Updated document',
            description: 'Modified "Project Requirements" in "Project Alpha"',
            time: '2 hours ago'
        },
        {
            type: 'message',
            icon: 'fa-comments',
            title: 'Posted message',
            description: 'In "Design Team" workspace',
            time: '4 hours ago'
        },
        {
            type: 'task',
            icon: 'fa-tasks',
            title: 'Completed task',
            description: '"Fix login bug" marked as done',
            time: '1 day ago'
        },
        {
            type: 'workspace',
            icon: 'fa-users',
            title: 'Joined workspace',
            description: 'Added to "Marketing Team"',
            time: '2 days ago'
        },
        {
            type: 'document',
            icon: 'fa-file-alt',
            title: 'Created document',
            description: 'New "Meeting Notes" in "Team Standup"',
            time: '3 days ago'
        }
    ];
    
    const timeline = document.getElementById('activityTimeline');
    timeline.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${activity.title}</strong> - ${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Filter activity
function filterActivity(type) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter logic would go here
    console.log('Filtering activity by:', type);
}

// Edit profile
function editProfile() {
    document.getElementById('editProfileModal').style.display = 'block';
}

// Save profile changes
function saveProfileChanges(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const location = document.getElementById('editLocation').value;
    const department = document.getElementById('editDepartment').value;
    const role = document.getElementById('editRole').value;
    const bio = document.getElementById('editBio').value;
    
    // Update user data
    if (currentUser) {
        currentUser.username = fullName;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.location = location;
        currentUser.department = department;
        currentUser.role = role;
        currentUser.bio = bio;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        closeModal('editProfileModal');
        
        showNotification('Profile updated successfully!', 'success');
    }
}

// Change avatar
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatarImage').src = e.target.result;
                if (currentUser) {
                    currentUser.avatar = e.target.result;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Share profile
function shareProfile() {
    const profileUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Profile - CollabSpace',
            text: 'Check out my profile on CollabSpace',
            url: profileUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(profileUrl).then(() => {
            showNotification('Profile link copied to clipboard!', 'success');
        });
    }
}

// Create new workspace
function createNewWorkspace() {
    window.location.href = 'index.html?action=create';
}

// Invite team member
function inviteTeamMember() {
    const email = prompt('Enter email address to invite:');
    if (email) {
        // Simulate sending invitation
        showNotification(`Invitation sent to ${email}!`, 'success');
        
        // Add to notifications
        addNotification({
            type: 'invitation_sent',
            title: 'Invitation Sent',
            message: `You invited ${email} to join your workspace`,
            time: new Date().toISOString()
        });
    }
}

// View activity
function viewActivity() {
    switchTab('activity');
    document.querySelector('[onclick="switchTab(\'activity\')"]').click();
}

// Open settings
function openSettings() {
    switchTab('settings');
    document.querySelector('[onclick="switchTab(\'settings\')"]').click();
}

// Export data
function exportData() {
    const userData = {
        profile: currentUser,
        workspaces: JSON.parse(localStorage.getItem('workspaces') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `collabspace-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

// Delete account
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            // Clear all user data
            localStorage.removeItem('currentUser');
            localStorage.removeItem('workspaces');
            localStorage.removeItem('settings');
            
            showNotification('Account deleted successfully. Redirecting...', 'info');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

// Save settings
function saveSettings() {
    const settings = {
        language: document.getElementById('languageSelect').value,
        timezone: document.getElementById('timezoneSelect').value,
        dateFormat: document.getElementById('dateFormatSelect').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        desktopNotifications: document.getElementById('desktopNotifications').checked,
        messageSounds: document.getElementById('messageSounds').checked,
        theme: document.getElementById('themeSelect').value,
        fontSize: document.getElementById('fontSizeSelect').value
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// Reset settings
function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        localStorage.removeItem('settings');
        
        // Reset form values
        document.getElementById('languageSelect').value = 'en';
        document.getElementById('timezoneSelect').value = 'PST';
        document.getElementById('dateFormatSelect').value = 'MM/DD/YYYY';
        document.getElementById('emailNotifications').checked = true;
        document.getElementById('desktopNotifications').checked = true;
        document.getElementById('messageSounds').checked = false;
        document.getElementById('themeSelect').value = 'light';
        document.getElementById('fontSizeSelect').value = 'medium';
        
        showNotification('Settings reset to default!', 'info');
    }
}

// Update password
function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // Simulate password update
    showNotification('Password updated successfully!', 'success');
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Enable 2FA
function enable2FA() {
    alert('Two-factor authentication setup would open here with QR code and backup codes');
    showNotification('2FA setup initiated. Check your email for instructions.', 'info');
}

// Terminate session
function terminateSession(sessionId) {
    if (confirm('Are you sure you want to terminate this session?')) {
        showNotification(`Session terminated: ${sessionId}`, 'success');
        
        // If terminating current session, log out
        if (sessionId === 'current') {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
}

// Add skill
function addSkill() {
    const skill = prompt('Enter a new skill:');
    if (skill) {
        const skillsContainer = document.querySelector('.skills-container');
        const addButton = skillsContainer.querySelector('.skill-add');
        
        const newSkill = document.createElement('div');
        newSkill.className = 'skill-tag';
        newSkill.textContent = skill;
        newSkill.onclick = function() {
            if (confirm(`Remove skill: ${skill}?`)) {
                newSkill.remove();
            }
        };
        
        skillsContainer.insertBefore(newSkill, addButton);
        showNotification(`Skill added: ${skill}`, 'success');
    }
}

// Open workspace
function openWorkspace(workspaceId) {
    window.location.href = `index.html?workspace=${workspaceId}`;
}

// Notifications
function showNotifications() {
    document.getElementById('notificationsModal').style.display = 'block';
    markNotificationsAsRead();
}

function loadNotifications() {
    notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    updateNotificationCount();
}

function addNotification(notification) {
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationCount();
}

function updateNotificationCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationCount');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function markNotificationsAsRead() {
    notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationCount();
    
    // Update UI
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
}

function acceptInvitation(workspaceType) {
    showNotification(`Accepted invitation to ${workspaceType} workspace!`, 'success');
    
    // Remove notification
    const notificationItem = event.target.closest('.notification-item');
    notificationItem.remove();
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show notification (toast)
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            .toast-success { background: var(--success); }
            .toast-error { background: var(--danger); }
            .toast-info { background: var(--primary-color); }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
