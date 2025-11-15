// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    loadProfileData();
    updateProfileStats();
    loadUserWorkspaces();
    initializeActivityChart();
    updateSidebarUser();
}

// Load profile data
function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Update profile information
    document.getElementById('profileName').textContent = currentUser.name || 'John Doe';
    document.getElementById('profileEmail').textContent = currentUser.email || 'john.doe@example.com';
    document.getElementById('fullName').textContent = currentUser.name || 'John Doe';
    document.getElementById('email').textContent = currentUser.email || 'john.doe@example.com';
    document.getElementById('phone').textContent = currentUser.phone || '+1 234 567 8900';
    document.getElementById('location').textContent = currentUser.location || 'San Francisco, CA';
    document.getElementById('timezone').textContent = currentUser.timezone || 'PST (UTC-8)';
    document.getElementById('language').textContent = currentUser.language || 'English';
    
    // Professional information
    document.getElementById('jobTitle').textContent = currentUser.jobTitle || 'Product Manager';
    document.getElementById('company').textContent = currentUser.company || 'Tech Corp';
    document.getElementById('department').textContent = currentUser.department || 'Product';
    
    // Skills
    const skills = currentUser.skills || ['Project Management', 'Agile', 'Scrum', 'Product Strategy'];
    const skillsContainer = document.getElementById('skills');
    skillsContainer.innerHTML = skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    // Join date
    const joinDate = currentUser.joinDate || new Date('2024-11-01');
    document.getElementById('joinDate').textContent = joinDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
    });
}

// Update profile statistics
function updateProfileStats() {
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Calculate user's workspaces
    const userWorkspaces = workspaces.filter(ws => 
        ws.owner === currentUser.id || 
        (ws.members && ws.members.some(m => m.email === currentUser.email))
    );
    
    document.getElementById('totalWorkspaces').textContent = userWorkspaces.length;
    
    // Calculate total collaborators
    const totalCollaborators = new Set();
    userWorkspaces.forEach(workspace => {
        if (workspace.members) {
            workspace.members.forEach(member => {
                if (member.email !== currentUser.email) {
                    totalCollaborators.add(member.email);
                }
            });
        }
    });
    document.getElementById('totalCollaborators').textContent = totalCollaborators.size;
    
    // Calculate total projects (workspaces of type 'project')
    const projectWorkspaces = userWorkspaces.filter(ws => ws.type === 'project');
    document.getElementById('totalProjects').textContent = projectWorkspaces.length;
}

// Load user's workspaces
function loadUserWorkspaces() {
    const workspaceGrid = document.getElementById('userWorkspaces');
    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const userWorkspaces = workspaces.filter(ws => 
        ws.owner === currentUser.id || 
        (ws.members && ws.members.some(m => m.email === currentUser.email))
    ).slice(0, 6);
    
    if (userWorkspaces.length === 0) {
        workspaceGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #718096;">No workspaces found</p>';
        return;
    }
    
    workspaceGrid.innerHTML = userWorkspaces.map(workspace => `
        <div class="workspace-card" onclick="openWorkspace('${workspace.id}')">
            <div class="workspace-card-header">
                <div class="workspace-icon">
                    <i class="fas ${workspace.icon || 'fa-briefcase'}"></i>
                </div>
                <div class="workspace-type">${workspace.type || 'team'}</div>
            </div>
            <div class="workspace-card-body">
                <h4>${workspace.name}</h4>
                <p>${workspace.description || 'No description available'}</p>
                <div class="workspace-stats">
                    <span><i class="fas fa-users"></i> ${(workspace.members || []).length}</span>
                    <span><i class="fas fa-tasks"></i> ${(workspace.tasks || []).length}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize activity chart
function initializeActivityChart() {
    const canvas = document.getElementById('activityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Generate mock activity data
    const data = generateActivityData();
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw chart
    drawActivityChart(ctx, data, width, height);
}

function generateActivityData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        day,
        activity: Math.floor(Math.random() * 10) + 1
    }));
}

function drawActivityChart(ctx, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length * 0.6;
    const spacing = chartWidth / data.length;
    
    // Find max activity for scaling
    const maxActivity = Math.max(...data.map(d => d.activity));
    
    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw bars
    data.forEach((item, index) => {
        const barHeight = (item.activity / maxActivity) * chartHeight;
        const x = padding + index * spacing + (spacing - barWidth) / 2;
        const y = height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw day label
        ctx.fillStyle = '#718096';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.day, x + barWidth / 2, height - padding + 20);
        
        // Draw activity value
        ctx.fillStyle = '#2d3748';
        ctx.fillText(item.activity, x + barWidth / 2, y - 5);
    });
    
    // Draw title
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Weekly Activity', width / 2, 20);
}

// Edit profile
function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Populate edit form
    document.getElementById('editFullName').value = currentUser.name || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editLocation').value = currentUser.location || '';
    document.getElementById('editJobTitle').value = currentUser.jobTitle || '';
    document.getElementById('editCompany').value = currentUser.company || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editSkills').value = (currentUser.skills || []).join(', ');
    
    // Show modal
    document.getElementById('editProfileModal').style.display = 'block';
}

// Handle profile update
function handleProfileUpdate(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Update user data
    const updatedUser = {
        ...currentUser,
        name: document.getElementById('editFullName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        location: document.getElementById('editLocation').value,
        jobTitle: document.getElementById('editJobTitle').value,
        company: document.getElementById('editCompany').value,
        bio: document.getElementById('editBio').value,
        skills: document.getElementById('editSkills').value
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0)
    };
    
    // Save updated user
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update workspaces with new user info
    updateWorkspacesUserInfo(updatedUser);
    
    // Close modal
    closeModal('editProfileModal');
    
    // Reload profile data
    loadProfileData();
    
    // Show success notification
    showNotification('Profile updated successfully!', 'success');
}

// Update user info in all workspaces
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

// Change avatar
function changeAvatar() {
    // In a real application, this would open a file picker
    alert('Avatar upload would open a file picker. This is a demo version.');
}

// Open workspace
function openWorkspace(workspaceId) {
    localStorage.setItem('currentWorkspaceId', workspaceId);
    window.location.href = 'index.html';
}

// Show notification
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

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update sidebar user
function updateSidebarUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userNameElement = document.getElementById('sidebarUserName');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'Guest User';
    }
}

// Add profile page specific styles
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .profile-content {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
        margin-bottom: 2rem;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .avatar-container {
        position: relative;
        display: inline-block;
    }
    
    .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        color: white;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .avatar-upload {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #6366f1;
        color: white;
        border: 3px solid white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
    }
    
    .avatar-upload:hover {
        background: #4f46e5;
    }
    
    .profile-info h2 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }
    
    .profile-info p {
        margin: 0 0 1rem 0;
        color: #718096;
    }
    
    .profile-badges {
        display: flex;
        gap: 0.5rem;
    }
    
    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .badge.premium {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
    }
    
    .badge.verified {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
    }
    
    .profile-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        text-align: center;
    }
    
    .stat-item h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
        color: #2d3748;
    }
    
    .stat-item p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .profile-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
        .profile-grid {
            grid-template-columns: 1fr;
        }
        
        .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .profile-stats {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    .profile-section {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
    }
    
    .profile-section h3 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
    }
    
    .info-grid {
        display: grid;
        gap: 1rem;
    }
    
    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f7fafc;
        border-radius: 8px;
    }
    
    .info-item label {
        font-weight: 600;
        color: #4a5568;
    }
    
    .info-item span {
        color: #2d3748;
    }
    
    .skills-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .skill-tag {
        padding: 0.25rem 0.75rem;
        background: #edf2f7;
        color: #4a5568;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .activity-chart {
        margin: 2rem 0;
        text-align: center;
    }
    
    .workspace-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
    }
    
    .workspace-card {
        background: #f7fafc;
        border-radius: 8px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .workspace-card:hover {
        background: #edf2f7;
        transform: translateY(-2px);
    }
    
    .workspace-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .workspace-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .workspace-type {
        font-size: 0.75rem;
        color: #718096;
        text-transform: uppercase;
        font-weight: 600;
    }
    
    .workspace-card h4 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }
    
    .workspace-card p {
        margin: 0 0 1rem 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .workspace-stats {
        display: flex;
        gap: 1rem;
        font-size: 0.75rem;
        color: #718096;
    }
    
    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .achievement-card {
        background: #f7fafc;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.2s ease;
    }
    
    .achievement-card:hover {
        background: #edf2f7;
        transform: translateY(-2px);
    }
    
    .achievement-card i {
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .achievement-card h4 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }
    
    .achievement-card p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
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
document.head.appendChild(profileStyles);
