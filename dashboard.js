// Dashboard JavaScript

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    updateDashboardStats();
    loadRecentActivity();
    loadRecentWorkspaces();
    loadUpcomingEvents();
    loadRecentFiles();
    loadNotifications();
    updateSidebarUser();
}

// Update dashboard statistics
function updateDashboardStats() {
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    document.getElementById('workspaceCount').textContent = workspaces.length;
    document.getElementById('collaboratorCount').textContent = 
        workspaces.reduce((total, ws) => total + (ws.members ? ws.members.length : 0), 0);
    document.getElementById('documentCount').textContent = 
        workspaces.reduce((total, ws) => total + (ws.documents ? ws.documents.length : 0), 0);
    document.getElementById('taskCount').textContent = 
        workspaces.reduce((total, ws) => total + (ws.tasks ? ws.tasks.filter(t => !t.completed).length : 0), 0);
}

// Load recent activity
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    const activities = generateMockActivities();
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.color}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Generate mock activities
function generateMockActivities() {
    return [
        {
            icon: 'fa-plus',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            title: 'New Workspace Created',
            description: 'You created "Marketing Team" workspace',
            time: '2 hours ago'
        },
        {
            icon: 'fa-user-plus',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            title: 'New Member Joined',
            description: 'Sarah Johnson joined "Project Alpha"',
            time: '4 hours ago'
        },
        {
            icon: 'fa-file-alt',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            title: 'Document Updated',
            description: 'John Smith updated "Q4 Report"',
            time: '6 hours ago'
        },
        {
            icon: 'fa-check-circle',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            title: 'Task Completed',
            description: 'Mike Davis completed "Design Review"',
            time: '8 hours ago'
        },
        {
            icon: 'fa-video',
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            title: 'Meeting Scheduled',
            description: 'Team meeting scheduled for tomorrow',
            time: '1 day ago'
        }
    ];
}

// Load recent workspaces
function loadRecentWorkspaces() {
    const workspaceList = document.getElementById('recentWorkspaces');
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const recentWorkspaces = workspaces.slice(0, 3);
    
    if (recentWorkspaces.length === 0) {
        workspaceList.innerHTML = '<p style="text-align: center; color: #718096;">No recent workspaces</p>';
        return;
    }
    
    workspaceList.innerHTML = recentWorkspaces.map(workspace => `
        <div class="workspace-item" onclick="openWorkspace('${workspace.id}')">
            <div class="workspace-icon">
                <i class="fas ${workspace.icon || 'fa-briefcase'}"></i>
            </div>
            <div class="workspace-info">
                <h4>${workspace.name}</h4>
                <p>${workspace.description || 'No description'}</p>
            </div>
            <div class="workspace-members">
                <div class="member-avatars">
                    ${(workspace.members || []).slice(0, 3).map((member, index) => `
                        <div class="member-avatar" style="background: ${getAvatarColor(index)}">
                            ${member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    `).join('')}
                </div>
                <span class="member-count">+${(workspace.members || []).length}</span>
            </div>
        </div>
    `).join('');
}

// Load upcoming events
function loadUpcomingEvents() {
    const eventsList = document.getElementById('eventsList');
    const events = generateMockEvents();
    
    eventsList.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-date">
                <div class="day">${event.day}</div>
                <div class="month">${event.month}</div>
            </div>
            <div class="event-info">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                <div class="event-time">${event.time}</div>
            </div>
        </div>
    `).join('');
}

// Generate mock events
function generateMockEvents() {
    const events = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + i + 1);
        
        events.push({
            day: eventDate.getDate(),
            month: eventDate.toLocaleDateString('en-US', { month: 'short' }),
            title: i === 0 ? 'Team Standup' : i === 1 ? 'Project Review' : 'Client Meeting',
            description: i === 0 ? 'Daily team sync' : i === 1 ? 'Q4 project review' : 'Project presentation',
            time: i === 0 ? '9:00 AM' : i === 1 ? '2:00 PM' : '10:00 AM'
        });
    }
    
    return events;
}

// Load recent files
function loadRecentFiles() {
    const filesList = document.getElementById('filesList');
    const files = generateMockFiles();
    
    filesList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-icon ${file.type}">
                <i class="fas ${file.icon}"></i>
            </div>
            <div class="file-info">
                <h4>${file.name}</h4>
                <p>${file.workspace}</p>
            </div>
            <div class="file-size">${file.size}</div>
        </div>
    `).join('');
}

// Generate mock files
function generateMockFiles() {
    return [
        {
            name: 'Q4_Report.pdf',
            workspace: 'Marketing Team',
            size: '2.4 MB',
            type: 'pdf',
            icon: 'fa-file-pdf'
        },
        {
            name: 'Budget_2024.xlsx',
            workspace: 'Finance',
            size: '1.8 MB',
            type: 'xls',
            icon: 'fa-file-excel'
        },
        {
            name: 'Presentation.pptx',
            workspace: 'Project Alpha',
            size: '5.2 MB',
            type: 'doc',
            icon: 'fa-file-powerpoint'
        },
        {
            name: 'Logo_Design.png',
            workspace: 'Design Team',
            size: '856 KB',
            type: 'img',
            icon: 'fa-file-image'
        }
    ];
}

// Load notifications
function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    const notifications = generateMockNotifications();
    
    notificationsList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.unread ? 'unread' : ''}">
            <div class="notification-icon" style="background: ${notification.color}">
                <i class="fas ${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
            </div>
            <div class="notification-time">${notification.time}</div>
        </div>
    `).join('');
}

// Generate mock notifications
function generateMockNotifications() {
    return [
        {
            icon: 'fa-user-plus',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            title: 'New Invitation',
            message: 'You\'ve been invited to join "Design Team"',
            time: '5 min ago',
            unread: true
        },
        {
            icon: 'fa-comment',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            title: 'New Message',
            message: 'Sarah: "Can you review the latest mockups?"',
            time: '1 hour ago',
            unread: true
        },
        {
            icon: 'fa-calendar',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            title: 'Meeting Reminder',
            message: 'Team standup in 30 minutes',
            time: '2 hours ago',
            unread: true
        },
        {
            icon: 'fa-check-circle',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            title: 'Task Completed',
            message: 'Mike completed "Design Review" task',
            time: '4 hours ago',
            unread: false
        }
    ];
}

// Update sidebar user information
function updateSidebarUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userNameElement = document.getElementById('sidebarUserName');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'Guest User';
    }
}

// Show notifications panel
function showNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.add('active');
}

// Hide notifications panel
function hideNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.remove('active');
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Quick action functions
function createNewWorkspace() {
    const modal = document.getElementById('workspaceModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function inviteUsers() {
    const modal = document.getElementById('inviteModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function startVideoCall() {
    alert('Video call feature would be implemented with WebRTC. This is a demo version.');
}

function shareFiles() {
    alert('File sharing feature would open a file picker. This is a demo version.');
}

function scheduleMeeting() {
    alert('Meeting scheduler would open a calendar interface. This is a demo version.');
}

function openWhiteboard() {
    alert('Whiteboard would open in a new tab or modal. This is a demo version.');
}

function createTask() {
    alert('Task creation form would open. This is a demo version.');
}

// View all functions
function viewAllActivity() {
    alert('Activity page would show all recent activities. This is a demo version.');
}

function viewAllWorkspaces() {
    window.location.href = 'index.html';
}

function viewCalendar() {
    alert('Calendar view would open. This is a demo version.');
}

function viewAllFiles() {
    alert('Files page would show all files. This is a demo version.');
}

// Open workspace
function openWorkspace(workspaceId) {
    localStorage.setItem('currentWorkspaceId', workspaceId);
    window.location.href = 'index.html';
}

// Handle workspace submission
function handleWorkspaceSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('workspaceName').value;
    const description = document.getElementById('workspaceDescription').value;
    const type = document.getElementById('workspaceType').value;
    const template = document.getElementById('workspaceTemplate').value;
    
    const workspace = {
        id: Date.now().toString(),
        name,
        description,
        type,
        template,
        createdAt: new Date().toISOString(),
        members: [],
        documents: [],
        tasks: [],
        messages: []
    };
    
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    workspaces.push(workspace);
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
    
    closeModal('workspaceModal');
    updateDashboardStats();
    loadRecentWorkspaces();
    
    showNotification('Workspace created successfully!', 'success');
}

// Handle invite submission
function handleInviteSubmit(event) {
    event.preventDefault();
    
    const emails = document.getElementById('inviteEmails').value;
    const message = document.getElementById('inviteMessage').value;
    
    // In a real application, this would send invitations
    console.log('Invitations sent:', emails, message);
    
    closeModal('inviteModal');
    showNotification('Invitations sent successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Helper function to get avatar color
function getAvatarColor(index) {
    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
        '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'
    ];
    return colors[index % colors.length];
}

// Close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Sign out function
function signOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentWorkspaceId');
    window.location.href = 'index.html';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                performSearch(query);
            }
        });
    }
});

function performSearch(query) {
    // In a real application, this would search across workspaces, users, and files
    console.log('Searching for:', query);
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }
});
