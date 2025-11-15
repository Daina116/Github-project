// Workspace Management JavaScript
let workspaces = [];
let currentStep = 1;
let selectedTemplate = 'blank';
let invitedMembers = [];
let currentFilter = 'all';

// Initialize workspace page
document.addEventListener('DOMContentLoaded', function() {
    loadWorkspaces();
    initializeWorkspacePage();
    updateStats();
    loadRecentActivity();
});

// Initialize workspace page
function initializeWorkspacePage() {
    // Set up event listeners
    document.getElementById('workspaceCreationForm').addEventListener('submit', createWorkspace);
    
    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
    }
}

// Load workspaces from localStorage
function loadWorkspaces() {
    workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    displayWorkspaces();
    updateCategoryCounts();
}

// Display workspaces
function displayWorkspaces(filteredWorkspaces = null) {
    const workspacesToShow = filteredWorkspaces || workspaces;
    const gridView = document.getElementById('workspaceGrid');
    const listView = document.getElementById('workspaceList');
    const tableBody = document.getElementById('workspaceTableBody');
    
    if (workspacesToShow.length === 0) {
        gridView.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No workspaces found</p><button class="btn btn-primary" onclick="showCreateWorkspaceModal()">Create Your First Workspace</button></div>';
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No workspaces found</td></tr>';
        return;
    }
    
    // Grid view
    gridView.innerHTML = workspacesToShow.map(workspace => `
        <div class="workspace-card" onclick="openWorkspace('${workspace.id}')">
            <div class="workspace-card-header">
                <span class="workspace-type ${workspace.type}">${workspace.type}</span>
                <div class="workspace-menu">
                    <button class="workspace-menu-btn" onclick="toggleWorkspaceMenu(event, '${workspace.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="workspace-menu-dropdown" id="menu-${workspace.id}">
                        <button onclick="editWorkspace('${workspace.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="duplicateWorkspace('${workspace.id}')"><i class="fas fa-copy"></i> Duplicate</button>
                        <button onclick="archiveWorkspace('${workspace.id}')"><i class="fas fa-archive"></i> Archive</button>
                        <button onclick="deleteWorkspace('${workspace.id}')"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
            <h3>${workspace.name}</h3>
            <p>${workspace.description || 'No description'}</p>
            <div class="workspace-meta">
                <div class="workspace-members">
                    <div class="member-avatars">
                        ${(workspace.participants || []).slice(0, 3).map((member, index) => `
                            <div class="member-avatar" style="z-index: ${3-index};">${member.charAt(0).toUpperCase()}</div>
                        `).join('')}
                    </div>
                    <span>${workspace.participants?.length || 1} members</span>
                </div>
                <div class="workspace-status">
                    <span class="status-dot ${workspace.active ? 'active' : 'inactive'}"></span>
                    <span>${workspace.active ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // List view
    tableBody.innerHTML = workspacesToShow.map(workspace => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-folder" style="color: var(--primary-color);"></i>
                    <div>
                        <div style="font-weight: 500;">${workspace.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${workspace.description || 'No description'}</div>
                    </div>
                </div>
            </td>
            <td><span class="workspace-type ${workspace.type}">${workspace.type}</span></td>
            <td>${workspace.participants?.length || 1}</td>
            <td>${new Date(workspace.createdAt).toLocaleDateString()}</td>
            <td>${workspace.lastActivity ? formatTimeAgo(new Date(workspace.lastActivity)) : 'Never'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="openWorkspace('${workspace.id}')" title="Open">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="btn-icon" onclick="editWorkspace('${workspace.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteWorkspace('${workspace.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalWorkspaces').textContent = workspaces.length;
    
    const totalMembers = workspaces.reduce((sum, ws) => sum + (ws.participants?.length || 1), 0);
    document.getElementById('totalMembers').textContent = totalMembers;
    
    const activeCount = workspaces.filter(ws => ws.active).length;
    document.getElementById('activeWorkspaces').textContent = activeCount;
    
    const recentActivity = workspaces.filter(ws => {
        if (!ws.lastActivity) return false;
        const activityDate = new Date(ws.lastActivity);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate > weekAgo;
    }).length;
    document.getElementById('recentActivity').textContent = recentActivity;
}

// Update category counts
function updateCategoryCounts() {
    const counts = {
        all: workspaces.length,
        team: workspaces.filter(ws => ws.type === 'team').length,
        project: workspaces.filter(ws => ws.type === 'project').length,
        meeting: workspaces.filter(ws => ws.type === 'meeting').length,
        personal: workspaces.filter(ws => ws.type === 'personal').length
    };
    
    Object.keys(counts).forEach(category => {
        const element = document.getElementById(`${category}Count`);
        if (element) {
            element.textContent = counts[category];
        }
    });
}

// Load recent activity
function loadRecentActivity() {
    const activities = [
        { type: 'workspace_created', workspace: 'Design Team', time: '2 hours ago' },
        { type: 'member_joined', workspace: 'Project Alpha', member: 'John Doe', time: '4 hours ago' },
        { type: 'document_updated', workspace: 'Marketing', time: '6 hours ago' },
        { type: 'task_completed', workspace: 'Development', time: '1 day ago' },
        { type: 'video_call', workspace: 'Sales Meeting', time: '2 days ago' }
    ];
    
    const feed = document.getElementById('recentActivityFeed');
    feed.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <p>${getActivityText(activity)}</p>
            <span class="activity-time">${activity.time}</span>
        </div>
    `).join('');
}

// Get activity text
function getActivityText(activity) {
    switch (activity.type) {
        case 'workspace_created':
            return `Created workspace "${activity.workspace}"`;
        case 'member_joined':
            return `${activity.member} joined "${activity.workspace}"`;
        case 'document_updated':
            return `Document updated in "${activity.workspace}"`;
        case 'task_completed':
            return `Task completed in "${activity.workspace}"`;
        case 'video_call':
            return `Video call in "${activity.workspace}"`;
        default:
            return 'Activity in workspace';
    }
}

// Search workspaces
function searchWorkspaces() {
    const query = document.getElementById('workspaceSearch').value.toLowerCase();
    const filtered = workspaces.filter(ws => 
        ws.name.toLowerCase().includes(query) || 
        (ws.description && ws.description.toLowerCase().includes(query))
    );
    displayWorkspaces(filtered);
}

// Filter workspaces
function filterWorkspaces() {
    const checkboxes = document.querySelectorAll('#filterMenu input[type="checkbox"]:checked');
    const types = Array.from(checkboxes).map(cb => cb.value);
    
    if (types.length === 0) {
        displayWorkspaces();
    } else {
        const filtered = workspaces.filter(ws => types.includes(ws.type));
        displayWorkspaces(filtered);
    }
}

// Toggle filter dropdown
function toggleFilterDropdown() {
    const menu = document.getElementById('filterMenu');
    menu.classList.toggle('show');
}

// Filter by category
function filterByCategory(category) {
    // Update active category
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.category-item').classList.add('active');
    
    currentFilter = category;
    
    if (category === 'all') {
        displayWorkspaces();
    } else {
        const filtered = workspaces.filter(ws => ws.type === category);
        displayWorkspaces(filtered);
    }
}

// Toggle view
function toggleView() {
    const gridView = document.getElementById('workspaceGrid');
    const listView = document.getElementById('workspaceList');
    const viewIcon = document.getElementById('viewIcon');
    const viewText = document.getElementById('viewText');
    
    if (gridView.style.display === 'none') {
        gridView.style.display = 'grid';
        listView.style.display = 'none';
        viewIcon.className = 'fas fa-th';
        viewText.textContent = 'Grid View';
    } else {
        gridView.style.display = 'none';
        listView.style.display = 'block';
        viewIcon.className = 'fas fa-list';
        viewText.textContent = 'List View';
    }
}

// Toggle workspace menu
function toggleWorkspaceMenu(event, workspaceId) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${workspaceId}`);
    
    // Close all other menus
    document.querySelectorAll('.workspace-menu-dropdown').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    
    menu.classList.toggle('show');
}

// Show create workspace modal
function showCreateWorkspaceModal() {
    document.getElementById('createWorkspaceModal').style.display = 'block';
    resetCreationForm();
}

// Join workspace
function joinWorkspace() {
    document.getElementById('joinWorkspaceModal').style.display = 'block';
}

// Import workspace
function importWorkspace() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedWorkspace = JSON.parse(e.target.result);
                    importedWorkspace.id = 'ws_' + Date.now();
                    importedWorkspace.createdAt = new Date().toISOString();
                    importedWorkspace.imported = true;
                    
                    workspaces.push(importedWorkspace);
                    localStorage.setItem('workspaces', JSON.stringify(workspaces));
                    
                    loadWorkspaces();
                    updateStats();
                    showNotification('Workspace imported successfully!', 'success');
                } catch (error) {
                    showNotification('Invalid workspace file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Show templates
function showTemplates() {
    alert('Template gallery would open here with pre-built workspace templates');
}

// Workspace creation steps
function nextStep() {
    if (currentStep < 3) {
        // Validate current step
        if (!validateStep(currentStep)) {
            return;
        }
        
        currentStep++;
        updateStepDisplay();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });
    
    document.querySelectorAll('.step-label').forEach((label, index) => {
        label.classList.toggle('active', index + 1 === currentStep);
    });
    
    // Update step content
    document.querySelectorAll('.creation-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });
    
    // Update buttons
    document.getElementById('prevBtn').style.display = currentStep > 1 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display = currentStep < 3 ? 'block' : 'none';
    document.getElementById('createBtn').style.display = currentStep === 3 ? 'block' : 'none';
}

function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('workspaceName').value;
        const type = document.getElementById('workspaceType').value;
        
        if (!name || !type) {
            showNotification('Please fill in required fields', 'error');
            return false;
        }
    }
    return true;
}

function selectTemplate(template) {
    selectedTemplate = template;
    
    // Update UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.template-card').classList.add('selected');
}

function sendInvites() {
    const emails = document.getElementById('memberEmails').value;
    const role = document.getElementById('memberRole').value;
    const message = document.getElementById('inviteMessage').value;
    
    if (!emails) {
        showNotification('Please enter email addresses', 'error');
        return;
    }
    
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    
    emailList.forEach(email => {
        invitedMembers.push({
            email: email,
            role: role,
            status: 'pending',
            message: message
        });
    });
    
    updateInvitedMembersList();
    
    // Clear form
    document.getElementById('memberEmails').value = '';
    document.getElementById('memberRole').value = 'member';
    document.getElementById('inviteMessage').value = '';
    
    showNotification(`Invitations sent to ${emailList.length} members`, 'success');
}

function updateInvitedMembersList() {
    const container = document.getElementById('invitedMembers');
    container.innerHTML = invitedMembers.map((member, index) => `
        <div class="invited-member">
            <div class="member-info">
                <div class="member-avatar">${member.email.charAt(0).toUpperCase()}</div>
                <div class="member-details">
                    <h5>${member.email}</h5>
                    <p>Role: ${member.role} • Status: ${member.status}</p>
                </div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="removeInvitedMember(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeInvitedMember(index) {
    invitedMembers.splice(index, 1);
    updateInvitedMembersList();
}

// Create workspace
function createWorkspace(event) {
    event.preventDefault();
    
    const workspace = {
        id: 'ws_' + Date.now(),
        name: document.getElementById('workspaceName').value,
        type: document.getElementById('workspaceType').value,
        description: document.getElementById('workspaceDescription').value,
        category: document.getElementById('workspaceCategory').value,
        visibility: document.getElementById('workspaceVisibility').value,
        template: selectedTemplate,
        invitedMembers: invitedMembers,
        settings: {
            guestAccess: document.getElementById('guestAccess').checked,
            fileSharing: document.getElementById('fileSharing').checked,
            enableChat: document.getElementById('enableChat').checked,
            enableVideo: document.getElementById('enableVideo').checked,
            autoSave: document.getElementById('autoSave').checked,
            notifications: document.getElementById('notifications').checked
        },
        participants: [JSON.parse(localStorage.getItem('currentUser')).username],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        active: true
    };
    
    workspaces.push(workspace);
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
    
    // Add to activity log
    addActivityLog('workspace_created', workspace.name);
    
    closeModal('createWorkspaceModal');
    loadWorkspaces();
    updateStats();
    
    showNotification('Workspace created successfully!', 'success');
    
    // Open the new workspace
    setTimeout(() => {
        openWorkspace(workspace.id);
    }, 1000);
}

// Join with code
function joinWithCode() {
    const code = document.getElementById('inviteCode').value;
    
    if (!code) {
        showNotification('Please enter an invite code', 'error');
        return;
    }
    
    // Simulate joining with code
    showNotification('Successfully joined workspace!', 'success');
    closeModal('joinWorkspaceModal');
    
    // Add to workspaces
    const newWorkspace = {
        id: 'ws_' + Date.now(),
        name: 'Joined Workspace',
        type: 'team',
        description: 'Joined via invite code',
        participants: [JSON.parse(localStorage.getItem('currentUser')).username],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        active: true
    };
    
    workspaces.push(newWorkspace);
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
    loadWorkspaces();
    updateStats();
}

// Request invite
function requestInvite() {
    const email = document.getElementById('joinEmail').value;
    
    if (!email) {
        showNotification('Please enter your email', 'error');
        return;
    }
    
    showNotification('Invite request sent! Check your email.', 'success');
    closeModal('joinWorkspaceModal');
}

// Open workspace
function openWorkspace(workspaceId) {
    window.location.href = `index.html?workspace=${workspaceId}`;
}

// Edit workspace
function editWorkspace(workspaceId) {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
        // Populate edit form and show modal
        document.getElementById('workspaceName').value = workspace.name;
        document.getElementById('workspaceType').value = workspace.type;
        document.getElementById('workspaceDescription').value = workspace.description || '';
        
        showCreateWorkspaceModal();
    }
}

// Duplicate workspace
function duplicateWorkspace(workspaceId) {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
        const duplicated = {
            ...workspace,
            id: 'ws_' + Date.now(),
            name: workspace.name + ' (Copy)',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        
        workspaces.push(duplicated);
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        
        loadWorkspaces();
        updateStats();
        showNotification('Workspace duplicated successfully!', 'success');
    }
}

// Archive workspace
function archiveWorkspace(workspaceId) {
    if (confirm('Are you sure you want to archive this workspace?')) {
        const workspace = workspaces.find(ws => ws.id === workspaceId);
        if (workspace) {
            workspace.archived = true;
            workspace.active = false;
            
            localStorage.setItem('workspaces', JSON.stringify(workspaces));
            loadWorkspaces();
            updateStats();
            showNotification('Workspace archived', 'success');
        }
    }
}

// Delete workspace
function deleteWorkspace(workspaceId) {
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
        workspaces = workspaces.filter(ws => ws.id !== workspaceId);
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        
        loadWorkspaces();
        updateStats();
        showNotification('Workspace deleted', 'success');
    }
}

// Reset creation form
function resetCreationForm() {
    document.getElementById('workspaceCreationForm').reset();
    currentStep = 1;
    selectedTemplate = 'blank';
    invitedMembers = [];
    updateStepDisplay();
    updateInvitedMembersList();
    
    // Reset template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Add activity log
function addActivityLog(type, details) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift({
        type: type,
        details: details,
        timestamp: new Date().toISOString(),
        user: JSON.parse(localStorage.getItem('currentUser')).username
    });
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.pop();
    }
    
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
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
    
    // Close filter dropdown when clicking outside
    if (!event.target.closest('.filter-dropdown')) {
        document.getElementById('filterMenu').classList.remove('show');
    }
    
    // Close workspace menus when clicking outside
    if (!event.target.closest('.workspace-menu')) {
        document.querySelectorAll('.workspace-menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
}
