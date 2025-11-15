// Team Management JavaScript
let currentTeam = 'all';
let currentView = 'grid';
let teamMembers = [];
let pendingInvitations = [];
let selectedMembers = [];
let selectedTeamColor = '#007bff';

// Initialize the team management page
document.addEventListener('DOMContentLoaded', function() {
    loadTeamMembers();
    loadPendingInvitations();
    loadRecentActivity();
    updateTeamCounts();
    updateStats();
    renderTeamMembers();
});

// Load team members from localStorage
function loadTeamMembers() {
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
        teamMembers = JSON.parse(savedMembers);
    } else {
        // Initialize with sample data
        teamMembers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'Senior Developer',
                team: 'dev',
                position: 'Team Lead',
                status: 'online',
                joinedDate: '2024-01-15',
                lastActive: '2024-11-15T10:30:00',
                phone: '+1 234 567 8900',
                location: 'New York, USA',
                department: 'Engineering',
                reportsTo: 'Sarah Wilson',
                avatar: null,
                isAdmin: true,
                permissions: {
                    createProjects: true,
                    manageTeam: true,
                    viewReports: true,
                    manageSettings: true
                },
                emailNotifications: true
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: 'UI/UX Designer',
                team: 'design',
                position: 'Senior Designer',
                status: 'online',
                joinedDate: '2024-02-20',
                lastActive: '2024-11-15T09:45:00',
                phone: '+1 234 567 8901',
                location: 'San Francisco, USA',
                department: 'Design',
                reportsTo: 'Mike Johnson',
                avatar: null,
                isAdmin: false,
                permissions: {
                    createProjects: true,
                    manageTeam: false,
                    viewReports: true,
                    manageSettings: false
                },
                emailNotifications: true
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                role: 'Marketing Manager',
                team: 'marketing',
                position: 'Team Lead',
                status: 'busy',
                joinedDate: '2024-03-10',
                lastActive: '2024-11-15T11:00:00',
                phone: '+1 234 567 8902',
                location: 'Chicago, USA',
                department: 'Marketing',
                reportsTo: 'Sarah Wilson',
                avatar: null,
                isAdmin: true,
                permissions: {
                    createProjects: true,
                    manageTeam: true,
                    viewReports: true,
                    manageSettings: false
                },
                emailNotifications: true
            },
            {
                id: 4,
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                role: 'CEO',
                team: 'admin',
                position: 'Chief Executive',
                status: 'online',
                joinedDate: '2023-12-01',
                lastActive: '2024-11-15T10:15:00',
                phone: '+1 234 567 8903',
                location: 'Boston, USA',
                department: 'Executive',
                reportsTo: null,
                avatar: null,
                isAdmin: true,
                permissions: {
                    createProjects: true,
                    manageTeam: true,
                    viewReports: true,
                    manageSettings: true
                },
                emailNotifications: true
            },
            {
                id: 5,
                name: 'Tom Brown',
                email: 'tom.brown@example.com',
                role: 'Sales Representative',
                team: 'sales',
                position: 'Sales Rep',
                status: 'offline',
                joinedDate: '2024-04-15',
                lastActive: '2024-11-14T16:30:00',
                phone: '+1 234 567 8904',
                location: 'Los Angeles, USA',
                department: 'Sales',
                reportsTo: 'Mike Johnson',
                avatar: null,
                isAdmin: false,
                permissions: {
                    createProjects: false,
                    manageTeam: false,
                    viewReports: true,
                    manageSettings: false
                },
                emailNotifications: true
            },
            {
                id: 6,
                name: 'Emily Davis',
                email: 'emily.davis@example.com',
                role: 'Frontend Developer',
                team: 'dev',
                position: 'Developer',
                status: 'online',
                joinedDate: '2024-05-20',
                lastActive: '2024-11-15T10:00:00',
                phone: '+1 234 567 8905',
                location: 'Seattle, USA',
                department: 'Engineering',
                reportsTo: 'John Doe',
                avatar: null,
                isAdmin: false,
                permissions: {
                    createProjects: true,
                    manageTeam: false,
                    viewReports: true,
                    manageSettings: false
                },
                emailNotifications: true
            }
        ];
        saveTeamMembers();
    }
}

// Save team members to localStorage
function saveTeamMembers() {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
}

// Load pending invitations
function loadPendingInvitations() {
    const savedInvitations = localStorage.getItem('pendingInvitations');
    if (savedInvitations) {
        pendingInvitations = JSON.parse(savedInvitations);
    } else {
        pendingInvitations = [];
        savePendingInvitations();
    }
}

// Save pending invitations
function savePendingInvitations() {
    localStorage.setItem('pendingInvitations', JSON.stringify(pendingInvitations));
}

// Load recent activity
function loadRecentActivity() {
    const savedActivity = localStorage.getItem('teamActivity');
    if (savedActivity) {
        const activities = JSON.parse(savedActivity);
        renderActivity(activities.slice(0, 5)); // Show last 5 activities
    }
}

// Render activity in sidebar
function renderActivity(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="text-muted">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="fas ${activity.icon} ${activity.color}"></i>
            <div class="activity-content">
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Update team counts
function updateTeamCounts() {
    const counts = {
        all: teamMembers.length,
        dev: teamMembers.filter(m => m.team === 'dev').length,
        design: teamMembers.filter(m => m.team === 'design').length,
        marketing: teamMembers.filter(m => m.team === 'marketing').length,
        sales: teamMembers.filter(m => m.team === 'sales').length
    };
    
    document.getElementById('allMembersCount').textContent = counts.all;
    document.getElementById('devTeamCount').textContent = counts.dev;
    document.getElementById('designTeamCount').textContent = counts.design;
    document.getElementById('marketingTeamCount').textContent = counts.marketing;
    document.getElementById('salesTeamCount').textContent = counts.sales;
}

// Update statistics
function updateStats() {
    const onlineMembers = teamMembers.filter(m => m.status === 'online').length;
    const adminMembers = teamMembers.filter(m => m.isAdmin).length;
    
    document.getElementById('totalMembers').textContent = teamMembers.length;
    document.getElementById('onlineMembers').textContent = onlineMembers;
    document.getElementById('adminMembers').textContent = adminMembers;
    document.getElementById('pendingInvites').textContent = pendingInvitations.length;
}

// Render team members
function renderTeamMembers() {
    const container = document.getElementById('membersContainer');
    if (!container) return;
    
    let filteredMembers = getFilteredMembers();
    
    if (filteredMembers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No team members found</h3>
                <p>Try adjusting your filters or invite new members</p>
                <button class="btn btn-primary" onclick="showInviteModal()">
                    <i class="fas fa-user-plus"></i> Invite Member
                </button>
            </div>
        `;
        return;
    }
    
    if (currentView === 'grid') {
        container.innerHTML = `
            <div class="members-grid">
                ${filteredMembers.map(member => createMemberCard(member)).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="members-list">
                ${filteredMembers.map(member => createMemberListItem(member)).join('')}
            </div>
        `;
    }
}

// Get filtered members based on current team and filters
function getFilteredMembers() {
    let filtered = teamMembers;
    
    // Filter by team
    if (currentTeam !== 'all') {
        filtered = filtered.filter(m => m.team === currentTeam);
    }
    
    // Apply sidebar filters
    if (document.getElementById('filterOnline').checked) {
        filtered = filtered.filter(m => m.status === 'online');
    }
    
    if (document.getElementById('filterAvailable').checked) {
        filtered = filtered.filter(m => m.status !== 'busy');
    }
    
    if (document.getElementById('filterAdmin').checked) {
        filtered = filtered.filter(m => m.isAdmin);
    }
    
    return filtered;
}

// Create member card for grid view
function createMemberCard(member) {
    return `
        <div class="member-card" onclick="showMemberDetails(${member.id})">
            <div class="member-avatar">
                ${member.avatar ? `<img src="${member.avatar}" alt="${member.name}">` : '<i class="fas fa-user"></i>'}
            </div>
            <h3 class="member-name">${member.name}</h3>
            <p class="member-role">${member.role}</p>
            <span class="member-team">${getTeamName(member.team)}</span>
            <div class="member-status">
                <span class="status-indicator ${member.status}"></span>
                <span>${capitalizeFirst(member.status)}</span>
            </div>
            <div class="member-actions">
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); messageMember(${member.id})">
                    <i class="fas fa-envelope"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); callMember(${member.id})">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editMember(${member.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}

// Create member list item for list view
function createMemberListItem(member) {
    return `
        <div class="member-list-item" onclick="showMemberDetails(${member.id})">
            <div class="member-list-avatar">
                ${member.avatar ? `<img src="${member.avatar}" alt="${member.name}">` : '<i class="fas fa-user"></i>'}
            </div>
            <div class="member-list-info">
                <div class="member-list-name">${member.name}</div>
                <div class="member-list-role">${member.role}</div>
                <div class="member-list-details">
                    <span class="member-team">${getTeamName(member.team)}</span>
                    <span class="status-indicator ${member.status}"></span>
                    <span>${capitalizeFirst(member.status)}</span>
                    <span><i class="fas fa-envelope"></i> ${member.email}</span>
                </div>
            </div>
            <div class="member-list-actions">
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); messageMember(${member.id})">
                    <i class="fas fa-envelope"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); callMember(${member.id})">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editMember(${member.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}

// Get team display name
function getTeamName(team) {
    const teamNames = {
        'dev': 'Development',
        'design': 'Design',
        'marketing': 'Marketing',
        'sales': 'Sales',
        'admin': 'Admin'
    };
    return teamNames[team] || team;
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Select team
function selectTeam(team) {
    currentTeam = team;
    
    // Update active state in sidebar
    document.querySelectorAll('.team-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.team-item').classList.add('active');
    
    renderTeamMembers();
}

// Filter members
function filterMembers() {
    renderTeamMembers();
}

// Search members
function searchMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const container = document.getElementById('membersContainer');
    
    if (!container) return;
    
    let filteredMembers = getFilteredMembers();
    
    if (searchTerm) {
        filteredMembers = filteredMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.role.toLowerCase().includes(searchTerm) ||
            getTeamName(member.team).toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredMembers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No members found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }
    
    if (currentView === 'grid') {
        container.innerHTML = `
            <div class="members-grid">
                ${filteredMembers.map(member => createMemberCard(member)).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="members-list">
                ${filteredMembers.map(member => createMemberListItem(member)).join('')}
            </div>
        `;
    }
}

// Sort members
function sortMembers() {
    const sortBy = document.getElementById('sortSelect').value;
    let sortedMembers = [...getFilteredMembers()];
    
    switch (sortBy) {
        case 'name':
            sortedMembers.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'role':
            sortedMembers.sort((a, b) => a.role.localeCompare(b.role));
            break;
        case 'team':
            sortedMembers.sort((a, b) => a.team.localeCompare(b.team));
            break;
        case 'status':
            sortedMembers.sort((a, b) => a.status.localeCompare(b.status));
            break;
        case 'joined':
            sortedMembers.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
            break;
    }
    
    renderSortedMembers(sortedMembers);
}

// Render sorted members
function renderSortedMembers(sortedMembers) {
    const container = document.getElementById('membersContainer');
    if (!container) return;
    
    if (currentView === 'grid') {
        container.innerHTML = `
            <div class="members-grid">
                ${sortedMembers.map(member => createMemberCard(member)).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="members-list">
                ${sortedMembers.map(member => createMemberListItem(member)).join('')}
            </div>
        `;
    }
}

// Toggle view
function toggleView() {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    const viewIcon = document.getElementById('viewIcon');
    
    if (currentView === 'grid') {
        viewIcon.className = 'fas fa-th';
    } else {
        viewIcon.className = 'fas fa-list';
    }
    
    renderTeamMembers();
}

// Export members
function exportMembers() {
    const csvContent = generateTeamCSV();
    downloadFile('team-members.csv', csvContent, 'text/csv');
    showNotification('Team members exported successfully', 'success');
}

// Generate team CSV
function generateTeamCSV() {
    const headers = ['Name', 'Email', 'Role', 'Team', 'Status', 'Joined Date', 'Phone', 'Location', 'Department'];
    const rows = teamMembers.map(member => [
        member.name,
        member.email,
        member.role,
        getTeamName(member.team),
        member.status,
        member.joinedDate,
        member.phone,
        member.location,
        member.department
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Download file
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Refresh team
function refreshTeam() {
    loadTeamMembers();
    loadPendingInvitations();
    loadRecentActivity();
    updateTeamCounts();
    updateStats();
    renderTeamMembers();
    showNotification('Team data refreshed', 'success');
}

// Show invite modal
function showInviteModal() {
    document.getElementById('inviteModal').classList.add('active');
}

// Show create team modal
function showCreateTeamModal() {
    document.getElementById('createTeamModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Send invitation
function sendInvitation() {
    const email = document.getElementById('inviteEmail').value;
    const name = document.getElementById('inviteName').value;
    const role = document.getElementById('inviteRole').value;
    const team = document.getElementById('inviteTeam').value;
    const message = document.getElementById('inviteMessage').value;
    
    if (!email || !validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const invitation = {
        id: Date.now(),
        email,
        name,
        role,
        team,
        message,
        sentDate: new Date().toISOString(),
        status: 'pending'
    };
    
    pendingInvitations.push(invitation);
    savePendingInvitations();
    
    // Add activity
    addActivity('user-plus', 'text-success', `Invitation sent to ${name || email}`);
    
    // Clear form
    document.getElementById('inviteEmail').value = '';
    document.getElementById('inviteName').value = '';
    document.getElementById('inviteMessage').value = '';
    
    closeModal('inviteModal');
    updateStats();
    showNotification('Invitation sent successfully', 'success');
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Select team color
function selectTeamColor(color) {
    selectedTeamColor = color;
    document.getElementById('teamColor').value = color;
    
    // Update selected state
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

// Search members for team creation
function searchMembersForTeam(searchTerm) {
    // This would typically search through existing members
    // For now, we'll just show a message
    console.log('Searching for:', searchTerm);
}

// Create team
function createTeam() {
    const teamName = document.getElementById('teamName').value;
    const teamDescription = document.getElementById('teamDescription').value;
    
    if (!teamName) {
        showNotification('Please enter a team name', 'error');
        return;
    }
    
    // Add activity
    addActivity('plus', 'text-primary', `New team "${teamName}" created`);
    
    // Clear form
    document.getElementById('teamName').value = '';
    document.getElementById('teamDescription').value = '';
    
    closeModal('createTeamModal');
    showNotification('Team created successfully', 'success');
}

// Show member details
function showMemberDetails(memberId) {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Update modal content
    document.getElementById('memberDetailsTitle').textContent = member.name;
    document.getElementById('memberName').textContent = member.name;
    document.getElementById('memberRole').textContent = member.role;
    document.getElementById('memberEmail').textContent = member.email;
    document.getElementById('memberTeam').textContent = getTeamName(member.team);
    document.getElementById('memberRoleBadge').textContent = member.position;
    document.getElementById('memberJoinedDate').textContent = formatDate(member.joinedDate);
    document.getElementById('memberLastActive').textContent = formatLastActive(member.lastActive);
    document.getElementById('memberPhone').textContent = member.phone;
    document.getElementById('memberLocation').textContent = member.location;
    document.getElementById('memberDepartment').textContent = member.department;
    document.getElementById('memberReportsTo').textContent = member.reportsTo || 'None';
    document.getElementById('memberStatusText').textContent = capitalizeFirst(member.status);
    
    // Update status indicator
    const statusIndicator = document.querySelector('.member-avatar-section .status-indicator');
    statusIndicator.className = `status-indicator ${member.status}`;
    
    // Update permissions
    document.getElementById('permCreateProjects').checked = member.permissions.createProjects;
    document.getElementById('permManageTeam').checked = member.permissions.manageTeam;
    document.getElementById('permViewReports').checked = member.permissions.viewReports;
    document.getElementById('permManageSettings').checked = member.permissions.manageSettings;
    
    // Update settings
    document.getElementById('changeRoleSelect').value = member.position.toLowerCase();
    document.getElementById('changeTeamSelect').value = member.team;
    document.getElementById('emailNotifications').checked = member.emailNotifications;
    
    // Load member activity
    loadMemberActivity(memberId);
    
    // Store current member ID for save operations
    window.currentMemberId = memberId;
    
    // Show modal
    document.getElementById('memberDetailsModal').classList.add('active');
}

// Load member activity
function loadMemberActivity(memberId) {
    const timeline = document.getElementById('memberActivityTimeline');
    if (!timeline) return;
    
    // Sample activity data
    const activities = [
        { title: 'Joined the team', time: 'Nov 1, 2024' },
        { title: 'Completed project "Website Redesign"', time: 'Nov 10, 2024' },
        { title: 'Attended team meeting', time: 'Nov 12, 2024' },
        { title: 'Submitted code review', time: 'Nov 14, 2024' },
        { title: 'Updated profile information', time: 'Nov 15, 2024' }
    ];
    
    timeline.innerHTML = activities.map(activity => `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-title">${activity.title}</div>
                <div class="timeline-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Switch member tab
function switchMemberTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.member-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.member-tab-content .tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Save member changes
function saveMemberChanges() {
    const memberId = window.currentMemberId;
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Update permissions
    member.permissions.createProjects = document.getElementById('permCreateProjects').checked;
    member.permissions.manageTeam = document.getElementById('permManageTeam').checked;
    member.permissions.viewReports = document.getElementById('permViewReports').checked;
    member.permissions.manageSettings = document.getElementById('permManageSettings').checked;
    
    // Update settings
    const newRole = document.getElementById('changeRoleSelect').value;
    const newTeam = document.getElementById('changeTeamSelect').value;
    
    if (newRole !== member.position.toLowerCase()) {
        member.position = newRole.charAt(0).toUpperCase() + newRole.slice(1);
        addActivity('user-edit', 'text-warning', `${member.name} role changed to ${member.position}`);
    }
    
    if (newTeam !== member.team) {
        member.team = newTeam;
        addActivity('user-edit', 'text-warning', `${member.name} moved to ${getTeamName(newTeam)} team`);
    }
    
    member.emailNotifications = document.getElementById('emailNotifications').checked;
    
    saveTeamMembers();
    updateTeamCounts();
    renderTeamMembers();
    
    closeModal('memberDetailsModal');
    showNotification('Member changes saved successfully', 'success');
}

// Remove member
function removeMember() {
    const memberId = window.currentMemberId;
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
        teamMembers = teamMembers.filter(m => m.id !== memberId);
        saveTeamMembers();
        
        addActivity('user-minus', 'text-danger', `${member.name} removed from team`);
        
        updateTeamCounts();
        updateStats();
        renderTeamMembers();
        
        closeModal('memberDetailsModal');
        showNotification('Member removed successfully', 'success');
    }
}

// Message member
function messageMember(memberId) {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Redirect to chat page or open messaging modal
    window.location.href = `chat.html?user=${member.email}`;
}

// Call member
function callMember(memberId) {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Redirect to video call page
    window.location.href = `video.html?call=${member.email}`;
}

// Edit member
function editMember(memberId) {
    showMemberDetails(memberId);
}

// Add activity
function addActivity(icon, color, text) {
    const activities = JSON.parse(localStorage.getItem('teamActivity') || '[]');
    
    activities.unshift({
        icon,
        color,
        text,
        time: 'Just now',
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.pop();
    }
    
    localStorage.setItem('teamActivity', JSON.stringify(activities));
    renderActivity(activities.slice(0, 5));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format last active
function formatLastActive(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return formatDate(dateString);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle user menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.user-menu')) {
        document.getElementById('userDropdown').style.display = 'none';
    }
});

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        document.getElementById('memberSearch').focus();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
