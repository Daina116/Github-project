// Global state
let currentUser = null;
let currentWorkspace = null;
let workspaces = [];
let participants = [];
let messages = [];
let drawingTool = 'pen';
let isDrawing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    updateUI();
});

// Load stored data from localStorage
function loadStoredData() {
    const storedUser = localStorage.getItem('currentUser');
    const storedWorkspaces = localStorage.getItem('workspaces');
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    if (storedWorkspaces) {
        workspaces = JSON.parse(storedWorkspaces);
        displayWorkspaces();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
}

// Update UI based on current state
function updateUI() {
    if (currentUser) {
        document.querySelector('.nav').innerHTML = `
            <div class="user-info">
                <span>Welcome, ${currentUser.username}</span>
                <button class="btn btn-secondary" onclick="signOut()">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        `;
        document.getElementById('activeWorkspaces').style.display = 'block';
    }
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    
    currentUser = {
        username: username,
        email: email,
        id: Date.now().toString()
    };
    
    saveData();
    updateUI();
    closeModal('loginModal');
    
    // Add sample workspaces for demo
    if (workspaces.length === 0) {
        addSampleWorkspaces();
    }
}

// Sign out
function signOut() {
    currentUser = null;
    currentWorkspace = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

// Create workspace
function createWorkspace() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    document.getElementById('workspaceModalTitle').textContent = 'Create Workspace';
    document.getElementById('workspaceModal').style.display = 'block';
}

// Join workspace
function joinWorkspace() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    // For demo, create a sample workspace to join
    const workspace = {
        id: Date.now().toString(),
        name: 'Team Project',
        description: 'Collaborative project workspace',
        type: 'project',
        createdBy: 'demo-user',
        participants: [currentUser, { username: 'Alice', id: '2' }, { username: 'Bob', id: '3' }],
        createdAt: new Date().toISOString()
    };
    
    workspaces.push(workspace);
    saveData();
    displayWorkspaces();
    openWorkspace(workspace);
}

// Handle workspace submission
function handleWorkspaceSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('workspaceName').value;
    const description = document.getElementById('workspaceDescription').value;
    const type = document.getElementById('workspaceType').value;
    
    const workspace = {
        id: Date.now().toString(),
        name: name,
        description: description,
        type: type,
        createdBy: currentUser.username,
        participants: [currentUser],
        createdAt: new Date().toISOString()
    };
    
    workspaces.push(workspace);
    saveData();
    displayWorkspaces();
    closeModal('workspaceModal');
    openWorkspace(workspace);
    
    // Reset form
    document.getElementById('workspaceName').value = '';
    document.getElementById('workspaceDescription').value = '';
}

// Display workspaces
function displayWorkspaces() {
    const grid = document.getElementById('workspaceGrid');
    grid.innerHTML = '';
    
    workspaces.forEach(workspace => {
        const card = document.createElement('div');
        card.className = 'workspace-card';
        card.onclick = () => openWorkspace(workspace);
        
        const participantsHtml = workspace.participants.slice(0, 3).map(p => 
            `<div class="participant-avatar">${p.username[0].toUpperCase()}</div>`
        ).join('');
        
        card.innerHTML = `
            <h3>${workspace.name}</h3>
            <p>${workspace.description}</p>
            <div class="workspace-meta">
                <div class="participants">
                    ${participantsHtml}
                    ${workspace.participants.length > 3 ? `<span>+${workspace.participants.length - 3}</span>` : ''}
                </div>
                <span>${workspace.type}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Open workspace
function openWorkspace(workspace) {
    currentWorkspace = workspace;
    participants = workspace.participants || [];
    messages = [];
    
    document.getElementById('workspaceTitle').textContent = workspace.name;
    document.getElementById('workspaceView').style.display = 'flex';
    
    updateParticipants();
    initializeWorkspace();
}

// Exit workspace
function exitWorkspace() {
    document.getElementById('workspaceView').style.display = 'none';
    currentWorkspace = null;
}

// Update participants list
function updateParticipants() {
    const list = document.getElementById('participantsList');
    list.innerHTML = '';
    
    participants.forEach(participant => {
        const div = document.createElement('div');
        div.className = 'participant';
        div.innerHTML = `
            <div class="participant-avatar">${participant.username[0].toUpperCase()}</div>
            <div class="participant-info">
                <div class="participant-name">${participant.username}</div>
                <div class="participant-status">Online</div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Initialize workspace features
function initializeWorkspace() {
    initializeWhiteboard();
    initializeChat();
    initializeTasks();
}

// Whiteboard functions
function initializeWhiteboard() {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    function startDrawing(e) {
        drawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function draw(e) {
        if (!drawing) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        
        if (drawingTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = document.getElementById('colorPicker').value;
            ctx.lineWidth = 2;
        } else if (drawingTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 20;
        }
        
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function stopDrawing() {
        drawing = false;
    }
}

function setDrawingTool(tool) {
    drawingTool = tool;
}

function clearWhiteboard() {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Chat functions
function initializeChat() {
    // Add welcome message
    addMessage('System', 'Welcome to the workspace chat!', true);
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(currentUser.username, message);
        input.value = '';
        
        // Simulate response from other participant
        setTimeout(() => {
            const otherUser = participants.find(p => p.id !== currentUser.id);
            if (otherUser) {
                const responses = [
                    'Great idea!',
                    'I agree with that approach.',
                    'Let me think about this...',
                    'That sounds good to me.',
                    'Can you elaborate on that?'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(otherUser.username, randomResponse);
            }
        }, 1000 + Math.random() * 2000);
    }
}

function addMessage(author, text, isSystem = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    if (isSystem) {
        messageDiv.innerHTML = `
            <div class="chat-message-author" style="color: var(--text-secondary)">${author}</div>
            <div class="chat-message-text" style="font-style: italic">${text}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="chat-message-author">${author}</div>
            <div class="chat-message-text">${text}</div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Document editor functions
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('documentContent').focus();
}

// Video call functions (simulated)
function toggleVideo() {
    alert('Video calling would require WebRTC integration. This is a demo placeholder.');
}

function toggleAudio() {
    alert('Audio calling would require WebRTC integration. This is a demo placeholder.');
}

function shareScreen() {
    alert('Screen sharing would require WebRTC integration. This is a demo placeholder.');
}

// Task management functions
function initializeTasks() {
    // Add drag and drop functionality to task cards
    const taskCards = document.querySelectorAll('.task-card');
    const taskLists = document.querySelectorAll('.task-list');
    
    taskCards.forEach(card => {
        card.draggable = true;
        
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', '');
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });
    
    taskLists.forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            if (draggingCard && list !== draggingCard.parentNode) {
                list.appendChild(draggingCard);
            }
        });
    });
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and panes
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab and pane
    event.target.closest('.tab-btn').classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Invite users function
function inviteUsers() {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    alert(`Share this invite code with others: ${inviteCode}\n\nIn a real application, this would generate a shareable link.`);
}

// Add sample workspaces for demo
function addSampleWorkspaces() {
    const sampleWorkspaces = [
        {
            id: '1',
            name: 'Design Team',
            description: 'Collaborative design workspace',
            type: 'team',
            createdBy: 'demo-user',
            participants: [
                { username: 'You', id: currentUser?.id || '1' },
                { username: 'Sarah', id: '2' },
                { username: 'Mike', id: '3' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Project Alpha',
            description: 'Main project development workspace',
            type: 'project',
            createdBy: 'demo-user',
            participants: [
                { username: 'You', id: currentUser?.id || '1' },
                { username: 'Alex', id: '4' },
                { username: 'Jordan', id: '5' },
                { username: 'Taylor', id: '6' }
            ],
            createdAt: new Date().toISOString()
        }
    ];
    
    workspaces = sampleWorkspaces;
    saveData();
    displayWorkspaces();
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
