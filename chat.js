// Chat Page JavaScript
let chats = [];
let currentChat = null;
let currentUser = null;
let selectedChatType = 'direct';
let selectedContacts = [];
let selectedFiles = [];
let typingTimer = null;

// Initialize chat page
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeChat();
    loadChats();
    setupEventListeners();
});

// Load user data
function loadUserData() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    } else {
        window.location.href = 'index.html';
    }
}

// Initialize chat
function initializeChat() {
    // Initialize emojis
    initializeEmojis();
    
    // Setup drag and drop for file upload
    setupDragAndDrop();
}

// Setup event listeners
function setupEventListeners() {
    // Message input resize
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.chat-sidebar')) {
            document.querySelectorAll('.workspace-menu-dropdown').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Load chats
function loadChats() {
    // Load from localStorage or create sample chats
    const storedChats = localStorage.getItem('chats');
    if (storedChats) {
        chats = JSON.parse(storedChats);
    } else {
        // Create sample chats
        chats = [
            {
                id: 'chat_1',
                type: 'direct',
                name: 'Alice Johnson',
                avatar: 'A',
                lastMessage: 'Hey! How are you doing?',
                time: '2 min ago',
                unread: 2,
                online: true,
                messages: [
                    { id: 1, sender: 'Alice Johnson', content: 'Hi there!', time: '10:00 AM', sent: false },
                    { id: 2, sender: currentUser?.username || 'You', content: 'Hello Alice!', time: '10:05 AM', sent: true },
                    { id: 3, sender: 'Alice Johnson', content: 'Hey! How are you doing?', time: '10:10 AM', sent: false }
                ]
            },
            {
                id: 'chat_2',
                type: 'group',
                name: 'Design Team',
                avatar: 'D',
                lastMessage: 'John: The new designs look great!',
                time: '1 hour ago',
                unread: 0,
                online: false,
                participants: ['Alice Johnson', 'Bob Smith', 'Carol White'],
                messages: [
                    { id: 1, sender: 'Bob Smith', content: 'Check out the new mockups', time: '9:00 AM', sent: false },
                    { id: 2, sender: 'Carol White', content: 'They look amazing!', time: '9:15 AM', sent: false },
                    { id: 3, sender: currentUser?.username || 'You', content: 'Great work everyone!', time: '9:30 AM', sent: true },
                    { id: 4, sender: 'John Doe', content: 'The new designs look great!', time: '9:45 AM', sent: false }
                ]
            },
            {
                id: 'chat_3',
                type: 'direct',
                name: 'Bob Smith',
                avatar: 'B',
                lastMessage: 'Sure, let\'s discuss tomorrow',
                time: '3 hours ago',
                unread: 0,
                online: false,
                messages: [
                    { id: 1, sender: 'Bob Smith', content: 'Can we schedule a meeting?', time: '8:00 AM', sent: false },
                    { id: 2, sender: currentUser?.username || 'You', content: 'Sure, let\'s discuss tomorrow', time: '8:30 AM', sent: true }
                ]
            }
        ];
        saveChats();
    }
    
    displayChats();
}

// Display chats
function displayChats(filteredChats = null) {
    const chatList = document.getElementById('chatList');
    const chatsToShow = filteredChats || chats;
    
    if (chatsToShow.length === 0) {
        chatList.innerHTML = '<div class="empty-state"><p>No conversations found</p></div>';
        return;
    }
    
    chatList.innerHTML = chatsToShow.map(chat => `
        <div class="chat-item ${currentChat?.id === chat.id ? 'active' : ''}" onclick="openChat('${chat.id}')">
            <div class="chat-avatar">
                ${chat.avatar}
                ${chat.online ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="chat-info">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-message">${chat.lastMessage}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${chat.time}</div>
                ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Open chat
function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChat = chat;
    chat.unread = 0;
    saveChats();
    
    // Update UI
    displayChats();
    updateChatHeader();
    displayMessages();
    enableChatActions();
    
    // Update participants list
    updateParticipantsList();
    
    // Mark messages as read
    markMessagesAsRead();
}

// Update chat header
function updateChatHeader() {
    if (!currentChat) return;
    
    const headerInfo = document.querySelector('.chat-info');
    headerInfo.innerHTML = `
        <div class="chat-avatar">
            ${currentChat.avatar}
            ${currentChat.online ? '<div class="online-indicator"></div>' : ''}
        </div>
        <div class="chat-details">
            <h3>${currentChat.name}</h3>
            <p>${currentChat.type === 'group' ? `${currentChat.participants?.length || 0} members` : (currentChat.online ? 'Online' : 'Offline')}</p>
        </div>
    `;
}

// Display messages
function displayMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!currentChat || !currentChat.messages || currentChat.messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-chat"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }
    
    messagesContainer.innerHTML = currentChat.messages.map(message => `
        <div class="message ${message.sent ? 'sent' : 'received'}">
            <div class="message-avatar">${message.sender.charAt(0).toUpperCase()}</div>
            <div class="message-content">
                <div class="message-bubble">${message.content}</div>
                <div class="message-info">
                    <span>${message.time}</span>
                    ${message.sent ? `
                        <div class="message-status ${message.read ? 'read' : ''}">
                            <i class="fas ${message.read ? 'fa-check-double' : 'fa-check'}"></i>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Enable chat actions
function enableChatActions() {
    document.querySelectorAll('.chat-actions button').forEach(btn => {
        btn.disabled = false;
    });
    document.getElementById('chatInputContainer').style.display = 'block';
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentChat) return;
    
    const message = {
        id: Date.now(),
        sender: currentUser?.username || 'You',
        content: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        read: false
    };
    
    currentChat.messages.push(message);
    currentChat.lastMessage = content;
    currentChat.time = 'Just now';
    
    saveChats();
    displayChats();
    displayMessages();
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Simulate message being read after 2 seconds
    setTimeout(() => {
        message.read = true;
        displayMessages();
    }, 2000);
    
    // Simulate reply after 3 seconds
    simulateReply();
}

// Handle message keypress
function handleMessageKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Simulate reply
function simulateReply() {
    if (!currentChat || currentChat.type === 'direct') {
        const replies = [
            'That sounds great!',
            'I agree with you.',
            'Let me think about it.',
            'Sure, we can do that.',
            'Thanks for letting me know!'
        ];
        
        setTimeout(() => {
            const reply = {
                id: Date.now(),
                sender: currentChat.name,
                content: replies[Math.floor(Math.random() * replies.length)],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sent: false
            };
            
            currentChat.messages.push(reply);
            currentChat.lastMessage = reply.content;
            currentChat.time = 'Just now';
            
            saveChats();
            displayChats();
            displayMessages();
        }, 3000);
    }
}

// Create new chat
function createNewChat() {
    document.getElementById('newChatModal').style.display = 'block';
    loadContacts();
}

// Load contacts
function loadContacts() {
    const contacts = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: 'A', online: true },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: 'B', online: false },
        { id: 3, name: 'Carol White', email: 'carol@example.com', avatar: 'C', online: true },
        { id: 4, name: 'David Brown', email: 'david@example.com', avatar: 'D', online: false },
        { id: 5, name: 'Emma Davis', email: 'emma@example.com', avatar: 'E', online: true }
    ];
    
    const contactList = document.getElementById('contactList');
    const groupContactList = document.getElementById('groupContactList');
    
    contactList.innerHTML = contacts.map(contact => `
        <div class="contact-item" onclick="toggleContactSelection(this, '${contact.name}', '${contact.avatar}')">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.email}</p>
            </div>
        </div>
    `).join('');
    
    groupContactList.innerHTML = contacts.map(contact => `
        <div class="contact-item" onclick="toggleGroupContactSelection(this, '${contact.name}', '${contact.avatar}')">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.email}</p>
            </div>
        </div>
    `).join('');
}

// Select chat type
function selectChatType(type) {
    selectedChatType = type;
    
    // Update UI
    document.querySelectorAll('.chat-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    // Show/hide forms
    document.getElementById('directChatForm').style.display = type === 'direct' ? 'block' : 'none';
    document.getElementById('groupChatForm').style.display = type === 'group' ? 'block' : 'none';
}

// Toggle contact selection
function toggleContactSelection(element, name, avatar) {
    document.querySelectorAll('#contactList .contact-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedContacts = [{ name, avatar }];
}

// Toggle group contact selection
function toggleGroupContactSelection(element, name, avatar) {
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        selectedContacts.push({ name, avatar });
    } else {
        selectedContacts = selectedContacts.filter(c => c.name !== name);
    }
}

// Create chat
function createChat() {
    if (selectedChatType === 'direct') {
        if (selectedContacts.length === 0) {
            alert('Please select a contact');
            return;
        }
        
        const contact = selectedContacts[0];
        const existingChat = chats.find(c => c.type === 'direct' && c.name === contact.name);
        
        if (existingChat) {
            openChat(existingChat.id);
        } else {
            const newChat = {
                id: 'chat_' + Date.now(),
                type: 'direct',
                name: contact.name,
                avatar: contact.avatar,
                lastMessage: 'Start a conversation',
                time: 'Just now',
                unread: 0,
                online: Math.random() > 0.5,
                messages: []
            };
            
            chats.unshift(newChat);
            saveChats();
            displayChats();
            openChat(newChat.id);
        }
    } else {
        const groupName = document.getElementById('groupName').value.trim();
        const groupDescription = document.getElementById('groupDescription').value.trim();
        
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }
        
        if (selectedContacts.length === 0) {
            alert('Please add at least one member');
            return;
        }
        
        const newChat = {
            id: 'chat_' + Date.now(),
            type: 'group',
            name: groupName,
            avatar: groupName.charAt(0).toUpperCase(),
            description: groupDescription,
            lastMessage: 'Group created',
            time: 'Just now',
            unread: 0,
            online: false,
            participants: selectedContacts.map(c => c.name),
            messages: [
                {
                    id: 1,
                    sender: 'System',
                    content: `Group "${groupName}" created`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sent: false
                }
            ]
        };
        
        chats.unshift(newChat);
        saveChats();
        displayChats();
        openChat(newChat.id);
    }
    
    closeModal('newChatModal');
    resetNewChatForm();
}

// Reset new chat form
function resetNewChatForm() {
    document.getElementById('groupName').value = '';
    document.getElementById('groupDescription').value = '';
    selectedContacts = [];
    selectedChatType = 'direct';
    selectChatType('direct');
}

// Search conversations
function searchConversations(query) {
    if (!query) {
        displayChats();
        return;
    }
    
    const filtered = chats.filter(chat => 
        chat.name.toLowerCase().includes(query.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
    
    displayChats(filtered);
}

// Filter chats
function filterChats(category) {
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filtered = chats;
    
    switch (category) {
        case 'unread':
            filtered = chats.filter(chat => chat.unread > 0);
            break;
        case 'groups':
            filtered = chats.filter(chat => chat.type === 'group');
            break;
        case 'direct':
            filtered = chats.filter(chat => chat.type === 'direct');
            break;
    }
    
    displayChats(filtered);
}

// Toggle search
function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    searchContainer.style.display = searchContainer.style.display === 'none' ? 'block' : 'none';
    
    if (searchContainer.style.display === 'block') {
        searchContainer.querySelector('input').focus();
    }
}

// Attach file
function attachFile() {
    document.getElementById('fileUploadModal').style.display = 'block';
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles = selectedFiles.concat(files);
    updateFilePreview();
    
    // Enable upload button
    document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
}

// Update file preview
function updateFilePreview() {
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        filePreview.style.display = 'none';
        return;
    }
    
    filePreview.style.display = 'block';
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-icon">
                <i class="fas fa-file"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove file
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFilePreview();
    document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload files
function uploadFiles() {
    if (selectedFiles.length === 0 || !currentChat) return;
    
    selectedFiles.forEach(file => {
        const message = {
            id: Date.now() + Math.random(),
            sender: currentUser?.username || 'You',
            content: `📎 Shared file: ${file.name}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sent: true,
            read: false,
            type: 'file',
            file: {
                name: file.name,
                size: formatFileSize(file.size)
            }
        };
        
        currentChat.messages.push(message);
    });
    
    currentChat.lastMessage = `📎 Shared ${selectedFiles.length} file(s)`;
    currentChat.time = 'Just now';
    
    saveChats();
    displayChats();
    displayMessages();
    
    closeModal('fileUploadModal');
    selectedFiles = [];
    updateFilePreview();
    
    showNotification('Files uploaded successfully!', 'success');
}

// Setup drag and drop
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        selectedFiles = selectedFiles.concat(files);
        updateFilePreview();
        document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
    });
}

// Insert emoji
function insertEmoji() {
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
}

// Initialize emojis
function initializeEmojis() {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🙏'];
    
    const emojiGrid = document.querySelector('.emoji-grid');
    emojiGrid.innerHTML = emojis.map(emoji => `
        <div class="emoji-item" onclick="insertEmojiToInput('${emoji}')">${emoji}</div>
    `).join('');
}

// Insert emoji to input
function insertEmojiToInput(emoji) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value += emoji;
    messageInput.focus();
    closeEmojiPicker();
}

// Close emoji picker
function closeEmojiPicker() {
    document.getElementById('emojiPicker').style.display = 'none';
}

// Format text
function formatText() {
    alert('Text formatting options would appear here (bold, italic, underline, etc.)');
}

// Share location
function shareLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const message = {
                    id: Date.now(),
                    sender: currentUser?.username || 'You',
                    content: `📍 Location shared: ${position.coords.latitude}, ${position.coords.longitude}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sent: true,
                    read: false,
                    type: 'location'
                };
                
                currentChat.messages.push(message);
                currentChat.lastMessage = '📍 Location shared';
                currentChat.time = 'Just now';
                
                saveChats();
                displayChats();
                displayMessages();
                
                showNotification('Location shared successfully!', 'success');
            },
            (error) => {
                showNotification('Unable to share location', 'error');
            }
        );
    } else {
        showNotification('Geolocation is not supported', 'error');
    }
}

// Start poll
function startPoll() {
    document.getElementById('pollModal').style.display = 'block';
}

// Add poll option
function addPollOption() {
    const pollOptions = document.getElementById('pollOptions');
    const optionCount = pollOptions.children.length + 1;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'poll-option';
    optionDiv.innerHTML = `
        <input type="text" placeholder="Option ${optionCount}">
        <button class="btn btn-icon" onclick="removePollOption(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    pollOptions.appendChild(optionDiv);
}

// Remove poll option
function removePollOption(button) {
    const option = button.parentElement;
    const pollOptions = document.getElementById('pollOptions');
    
    if (pollOptions.children.length > 2) {
        option.remove();
    } else {
        alert('A poll must have at least 2 options');
    }
}

// Create poll
function createPoll() {
    const question = document.getElementById('pollQuestion').value.trim();
    const options = Array.from(document.querySelectorAll('#pollOptions input'))
        .map(input => input.value.trim())
        .filter(value => value);
    
    if (!question || options.length < 2) {
        alert('Please enter a question and at least 2 options');
        return;
    }
    
    const pollMessage = {
        id: Date.now(),
        sender: currentUser?.username || 'You',
        content: `📊 Poll: ${question}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        read: false,
        type: 'poll',
        poll: {
            question: question,
            options: options,
            votes: options.map(() => 0),
            totalVotes: 0
        }
    };
    
    currentChat.messages.push(pollMessage);
    currentChat.lastMessage = '📊 Poll created';
    currentChat.time = 'Just now';
    
    saveChats();
    displayChats();
    displayMessages();
    
    closeModal('pollModal');
    resetPollForm();
    
    showNotification('Poll created successfully!', 'success');
}

// Reset poll form
function resetPollForm() {
    document.getElementById('pollQuestion').value = '';
    document.getElementById('pollOptions').innerHTML = `
        <div class="poll-option">
            <input type="text" placeholder="Option 1">
            <button class="btn btn-icon" onclick="removePollOption(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="poll-option">
            <input type="text" placeholder="Option 2">
            <button class="btn btn-icon" onclick="removePollOption(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.getElementById('allowMultiple').checked = false;
    document.getElementById('anonymousPoll').checked = false;
}

// Start video call
function startVideoCall() {
    if (!currentChat) return;
    
    showNotification(`Starting video call with ${currentChat.name}...`, 'info');
    
    setTimeout(() => {
        window.location.href = 'video.html?chat=' + currentChat.id;
    }, 1000);
}

// Start voice call
function startVoiceCall() {
    if (!currentChat) return;
    
    showNotification(`Starting voice call with ${currentChat.name}...`, 'info');
    
    setTimeout(() => {
        window.location.href = 'video.html?chat=' + currentChat.id + '&voice=true';
    }, 1000);
}

// Show chat info
function showChatInfo() {
    if (!currentChat) return;
    
    document.getElementById('chatInfoPanel').style.display = 'block';
    updateParticipantsList();
    loadSharedMedia();
}

// Close chat info
function closeChatInfo() {
    document.getElementById('chatInfoPanel').style.display = 'none';
}

// Update participants list
function updateParticipantsList() {
    if (!currentChat) return;
    
    const participantsList = document.getElementById('participantsList');
    
    if (currentChat.type === 'direct') {
        participantsList.innerHTML = `
            <div class="participant-item">
                <div class="participant-avatar">${currentChat.avatar}</div>
                <div class="participant-info">
                    <div class="participant-name">${currentChat.name}</div>
                    <div class="participant-role">${currentChat.online ? 'Online' : 'Offline'}</div>
                </div>
            </div>
        `;
    } else {
        const participants = (currentChat.participants || []).map(name => ({
            name: name,
            avatar: name.charAt(0).toUpperCase(),
            role: 'Member'
        }));
        
        participantsList.innerHTML = participants.map(participant => `
            <div class="participant-item">
                <div class="participant-avatar">${participant.avatar}</div>
                <div class="participant-info">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-role">${participant.role}</div>
                </div>
            </div>
        `).join('');
    }
}

// Load shared media
function loadSharedMedia() {
    const mediaGrid = document.getElementById('mediaGrid');
    
    // For demo purposes, show placeholder media
    mediaGrid.innerHTML = `
        <div class="media-item">
            <img src="https://picsum.photos/seed/media1/100/100.jpg" alt="Shared media">
        </div>
        <div class="media-item">
            <img src="https://picsum.photos/seed/media2/100/100.jpg" alt="Shared media">
        </div>
        <div class="media-item">
            <img src="https://picsum.photos/seed/media3/100/100.jpg" alt="Shared media">
        </div>
    `;
}

// Add participant
function addParticipant() {
    if (currentChat.type === 'direct') {
        alert('Cannot add participants to direct messages');
        return;
    }
    
    showNotification('Participant addition feature coming soon!', 'info');
}

// Toggle mute
function toggleMute() {
    const muted = document.getElementById('muteNotifications').checked;
    showNotification(muted ? 'Notifications muted' : 'Notifications enabled', 'info');
}

// Toggle pin
function togglePin() {
    const pinned = document.getElementById('pinChat').checked;
    showNotification(pinned ? 'Chat pinned' : 'Chat unpinned', 'info');
}

// Leave chat
function leaveChat() {
    if (!currentChat) return;
    
    if (confirm(`Are you sure you want to leave "${currentChat.name}"?`)) {
        chats = chats.filter(c => c.id !== currentChat.id);
        saveChats();
        
        currentChat = null;
        displayChats();
        
        // Reset chat area
        document.getElementById('chatMessages').innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-comments"></i>
                <h3>Select a conversation</h3>
                <p>Choose a chat to start messaging</p>
                <button class="btn btn-primary" onclick="createNewChat()">
                    <i class="fas fa-plus"></i> Start New Chat
                </button>
            </div>
        `;
        
        document.getElementById('chatInputContainer').style.display = 'none';
        document.querySelectorAll('.chat-actions button').forEach(btn => {
            btn.disabled = true;
        });
        
        closeChatInfo();
        showNotification('Left chat successfully', 'success');
    }
}

// Mark messages as read
function markMessagesAsRead() {
    if (!currentChat) return;
    
    currentChat.messages.forEach(message => {
        if (!message.sent) {
            message.read = true;
        }
    });
    
    saveChats();
}

// Save chats
function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
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
    
    // Close emoji picker when clicking outside
    if (!event.target.closest('.emoji-picker') && !event.target.closest('.btn-icon')) {
        closeEmojiPicker();
    }
}
