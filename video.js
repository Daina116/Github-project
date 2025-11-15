// Video Conference JavaScript
let localStream = null;
let remoteStreams = new Map();
let peerConnections = new Map();
let isMuted = false;
let isVideoOff = false;
let isScreenSharing = false;
let isRecording = false;
let meetingTimer = null;
let meetingStartTime = null;
let whiteboardContext = null;
let isDrawing = false;
let currentTool = 'pen';

// Initialize video conference
document.addEventListener('DOMContentLoaded', function() {
    initializeVideo();
    setupEventListeners();
    startMeetingTimer();
    initializeWhiteboard();
});

// Initialize video
async function initializeVideo() {
    try {
        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Display local video
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;
        
        // Initialize audio monitoring
        monitorAudioLevel();
        
        showNotification('Camera and microphone connected', 'success');
    } catch (error) {
        console.error('Error accessing media devices:', error);
        showNotification('Failed to access camera/microphone', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Handle page visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pause video when page is hidden
            pauseVideo();
        } else {
            // Resume video when page is visible
            resumeVideo();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        adjustVideoLayout();
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close modals
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'v':
                    e.preventDefault();
                    toggleVideo();
                    break;
                case 's':
                    e.preventDefault();
                    toggleScreenShare();
                    break;
                case 'r':
                    e.preventDefault();
                    toggleRecording();
                    break;
                case 'w':
                    e.preventDefault();
                    toggleWhiteboard();
                    break;
            }
        }
    });
}

// Meeting timer
function startMeetingTimer() {
    meetingStartTime = new Date();
    meetingTimer = setInterval(updateMeetingTimer, 1000);
}

function updateMeetingTimer() {
    if (meetingStartTime) {
        const now = new Date();
        const diff = now - meetingStartTime;
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('meetingTimer').textContent = timeString;
    }
}

// Audio/Video controls
function toggleMute() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        
        isMuted = !isMuted;
        updateMuteButton();
        updateLocalStatus();
        
        showNotification(isMuted ? 'Microphone muted' : 'Microphone unmuted', 'info');
    }
}

function toggleVideo() {
    if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        
        isVideoOff = !isVideoOff;
        updateVideoButton();
        updateLocalStatus();
        
        showNotification(isVideoOff ? 'Camera turned off' : 'Camera turned on', 'info');
    }
}

function toggleScreenShare() {
    if (isScreenSharing) {
        stopScreenShare();
    } else {
        startScreenShare();
    }
}

async function startScreenShare() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });
        
        // Replace video track with screen share
        const videoTracks = screenStream.getVideoTracks();
        if (videoTracks.length > 0) {
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = screenStream;
            
            isScreenSharing = true;
            updateShareButton();
            
            // Handle screen share end
            videoTracks[0].addEventListener('ended', stopScreenShare);
            
            showNotification('Screen sharing started', 'success');
        }
    } catch (error) {
        console.error('Error starting screen share:', error);
        showNotification('Failed to start screen sharing', 'error');
    }
}

function stopScreenShare() {
    if (localStream) {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;
        
        isScreenSharing = false;
        updateShareButton();
        
        showNotification('Screen sharing stopped', 'info');
    }
}

// Recording functions
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        showRecordingModal();
    }
}

function showRecordingModal() {
    document.getElementById('recordingModal').classList.add('active');
}

function startRecording() {
    closeModal('recordingModal');
    
    // In a real app, this would start actual recording
    isRecording = true;
    updateRecordButton();
    
    showNotification('Recording started', 'success');
    
    // Add recording indicator to UI
    document.body.classList.add('recording');
}

function stopRecording() {
    isRecording = false;
    updateRecordButton();
    
    showNotification('Recording stopped', 'info');
    
    // Remove recording indicator
    document.body.classList.remove('recording');
}

// UI update functions
function updateMuteButton() {
    const micButton = document.getElementById('micButton');
    const micIcon = document.getElementById('micIcon');
    
    if (isMuted) {
        micButton.classList.add('danger');
        micIcon.classList.remove('fa-microphone');
        micIcon.classList.add('fa-microphone-slash');
    } else {
        micButton.classList.remove('danger');
        micIcon.classList.remove('fa-microphone-slash');
        micIcon.classList.add('fa-microphone');
    }
}

function updateVideoButton() {
    const cameraButton = document.getElementById('cameraButton');
    const videoIcon = document.getElementById('videoIcon');
    
    if (isVideoOff) {
        cameraButton.classList.add('danger');
        videoIcon.classList.remove('fa-video');
        videoIcon.classList.add('fa-video-slash');
    } else {
        cameraButton.classList.remove('danger');
        videoIcon.classList.remove('fa-video-slash');
        videoIcon.classList.add('fa-video');
    }
}

function updateShareButton() {
    const shareButton = document.getElementById('shareButton');
    
    if (isScreenSharing) {
        shareButton.classList.add('active');
        shareButton.style.background = 'var(--success)';
    } else {
        shareButton.classList.remove('active');
        shareButton.style.background = '';
    }
}

function updateRecordButton() {
    const recordButton = document.getElementById('recordButton');
    
    if (isRecording) {
        recordButton.classList.add('active', 'danger');
    } else {
        recordButton.classList.remove('active', 'danger');
    }
}

function updateLocalStatus() {
    const localStatus = document.getElementById('localStatus');
    localStatus.innerHTML = `
        <i class="fas fa-microphone${isMuted ? '-slash muted' : ''}"></i>
        <i class="fas fa-video${isVideoOff ? '-slash muted' : ''}"></i>
    `;
}

// Audio monitoring
function monitorAudioLevel() {
    if (localStream) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(localStream);
        
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        function updateAudioLevel() {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const percentage = (average / 255) * 100;
            
            const audioFill = document.getElementById('audioFill');
            if (audioFill) {
                audioFill.style.width = `${Math.max(5, percentage)}%`;
            }
            
            requestAnimationFrame(updateAudioLevel);
        }
        
        updateAudioLevel();
    }
}

// Chat functions
function toggleChat() {
    const chatPanel = document.getElementById('chatPanel');
    const chatButton = document.getElementById('chatButton');
    
    chatPanel.classList.toggle('active');
    chatButton.classList.toggle('active');
    
    // Close other panels
    if (chatPanel.classList.contains('active')) {
        closeOtherPanels('chatPanel');
        document.getElementById('chatInput').focus();
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message) {
        addChatMessage('You', message);
        chatInput.value = '';
        
        // In a real app, this would send the message to other participants
        showNotification('Message sent', 'success');
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function addChatMessage(author, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
        <div class="message-avatar">${author.charAt(0).toUpperCase()}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${author}</span>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-text">${message}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Update chat badge
    updateChatBadge();
}

function updateChatBadge() {
    const chatBadge = document.getElementById('chatBadge');
    const chatPanel = document.getElementById('chatPanel');
    
    if (!chatPanel.classList.contains('active')) {
        const currentCount = parseInt(chatBadge.textContent) || 0;
        chatBadge.textContent = currentCount + 1;
        chatBadge.style.display = 'flex';
    }
}

// Participants functions
function toggleParticipants() {
    const participantsPanel = document.getElementById('participantsPanel');
    const participantsButton = document.getElementById('participantsButton');
    
    participantsPanel.classList.toggle('active');
    participantsButton.classList.toggle('active');
    
    // Close other panels
    if (participantsPanel.classList.contains('active')) {
        closeOtherPanels('participantsPanel');
    }
}

function addParticipant(name, isHost = false) {
    const participantsList = document.getElementById('participantsList');
    const participantElement = document.createElement('div');
    participantElement.className = 'participant-item';
    participantElement.innerHTML = `
        <div class="participant-avatar">${name.charAt(0).toUpperCase()}</div>
        <div class="participant-info">
            <span class="participant-name">${name}${isHost ? ' (Host)' : ''}</span>
            <span class="participant-status">
                <i class="fas fa-microphone"></i>
                <i class="fas fa-video"></i>
            </span>
        </div>
        <div class="participant-actions">
            <button class="btn-icon" title="Mute" onclick="muteParticipant('${name}')">
                <i class="fas fa-microphone-slash"></i>
            </button>
            <button class="btn-icon" title="Remove" onclick="removeParticipant('${name}')">
                <i class="fas fa-user-times"></i>
            </button>
        </div>
    `;
    
    participantsList.appendChild(participantElement);
    updateParticipantsBadge();
}

function muteParticipant(name) {
    showNotification(`Muted ${name}`, 'info');
}

function removeParticipant(name) {
    if (confirm(`Are you sure you want to remove ${name} from the meeting?`)) {
        const participantsList = document.getElementById('participantsList');
        const participants = participantsList.querySelectorAll('.participant-item');
        
        participants.forEach(participant => {
            if (participant.querySelector('.participant-name').textContent.includes(name)) {
                participant.remove();
            }
        });
        
        updateParticipantsBadge();
        showNotification(`${name} removed from meeting`, 'info');
    }
}

function updateParticipantsBadge() {
    const participantsBadge = document.getElementById('participantsBadge');
    const participantsList = document.getElementById('participantsList');
    const count = participantsList.querySelectorAll('.participant-item').length;
    
    participantsBadge.textContent = count;
    participantsBadge.style.display = count > 0 ? 'flex' : 'none';
}

// Whiteboard functions
function toggleWhiteboard() {
    const whiteboardPanel = document.getElementById('whiteboardPanel');
    const whiteboardButton = document.getElementById('whiteboardButton');
    
    whiteboardPanel.classList.toggle('active');
    whiteboardButton.classList.toggle('active');
    
    // Close other panels
    if (whiteboardPanel.classList.contains('active')) {
        closeOtherPanels('whiteboardPanel');
        initializeWhiteboard();
    }
}

function initializeWhiteboard() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (canvas && !whiteboardContext) {
        whiteboardContext = canvas.getContext('2d');
        
        // Set canvas size
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Set default styles
        whiteboardContext.lineWidth = 2;
        whiteboardContext.lineCap = 'round';
        whiteboardContext.strokeStyle = '#000000';
        
        // Add drawing event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', handleTouch);
        canvas.addEventListener('touchmove', handleTouch);
        canvas.addEventListener('touchend', stopDrawing);
    }
}

function startDrawing(e) {
    if (currentTool === 'pen' || currentTool === 'eraser') {
        isDrawing = true;
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        whiteboardContext.beginPath();
        whiteboardContext.moveTo(x, y);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'pen') {
        whiteboardContext.globalCompositeOperation = 'source-over';
        whiteboardContext.strokeStyle = '#000000';
        whiteboardContext.lineWidth = 2;
    } else if (currentTool === 'eraser') {
        whiteboardContext.globalCompositeOperation = 'destination-out';
        whiteboardContext.lineWidth = 20;
    }
    
    whiteboardContext.lineTo(x, y);
    whiteboardContext.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
}

function selectWhiteboardTool(tool) {
    currentTool = tool;
    
    // Update tool buttons
    document.querySelectorAll('.whiteboard-tools .btn-icon').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tool === 'pen') {
        document.querySelector('.whiteboard-tools .btn-icon:nth-child(1)').classList.add('active');
    } else if (tool === 'eraser') {
        document.querySelector('.whiteboard-tools .btn-icon:nth-child(2)').classList.add('active');
    } else if (tool === 'text') {
        document.querySelector('.whiteboard-tools .btn-icon:nth-child(3)').classList.add('active');
        // Add text functionality
        addTextToWhiteboard();
    }
}

function addTextToWhiteboard() {
    const text = prompt('Enter text:');
    if (text) {
        whiteboardContext.font = '16px Arial';
        whiteboardContext.fillStyle = '#000000';
        whiteboardContext.fillText(text, 50, 50);
    }
}

function clearWhiteboard() {
    const canvas = document.getElementById('whiteboardCanvas');
    if (canvas && whiteboardContext) {
        whiteboardContext.clearRect(0, 0, canvas.width, canvas.height);
        showNotification('Whiteboard cleared', 'info');
    }
}

// Settings functions
function toggleSettings() {
    document.getElementById('settingsModal').classList.add('active');
    loadDevices();
}

async function loadDevices() {
    try {
        // Get available devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const cameraSelect = document.getElementById('cameraSelect');
        const microphoneSelect = document.getElementById('microphoneSelect');
        const speakerSelect = document.getElementById('speakerSelect');
        
        // Clear existing options
        cameraSelect.innerHTML = '';
        microphoneSelect.innerHTML = '';
        speakerSelect.innerHTML = '';
        
        // Populate camera options
        devices.filter(device => device.kind === 'videoinput').forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        });
        
        // Populate microphone options
        devices.filter(device => device.kind === 'audioinput').forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Microphone ${microphoneSelect.length + 1}`;
            microphoneSelect.appendChild(option);
        });
        
        // Populate speaker options
        devices.filter(device => device.kind === 'audiooutput').forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Speaker ${speakerSelect.length + 1}`;
            speakerSelect.appendChild(option);
        });
        
        // Start camera preview
        startCameraPreview();
        
    } catch (error) {
        console.error('Error loading devices:', error);
        showNotification('Failed to load devices', 'error');
    }
}

async function startCameraPreview() {
    try {
        const cameraSelect = document.getElementById('cameraSelect');
        const selectedCamera = cameraSelect.value;
        
        const constraints = {
            video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
            audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const preview = document.getElementById('cameraPreview');
        preview.srcObject = stream;
        
    } catch (error) {
        console.error('Error starting camera preview:', error);
    }
}

function saveSettings() {
    // In a real app, this would save settings to server
    showNotification('Settings saved successfully', 'success');
    closeModal('settingsModal');
}

// Invite functions
function showInviteModal() {
    document.getElementById('inviteModal').classList.add('active');
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    showNotification('Share link copied to clipboard', 'success');
}

function copyMeetingLink() {
    const link = `${window.location.origin}/video.html?id=123-456-789`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Meeting link copied to clipboard', 'success');
    });
}

function copyMeetingId() {
    const meetingId = document.getElementById('meetingIdDisplay').textContent;
    navigator.clipboard.writeText(meetingId).then(() => {
        showNotification('Meeting ID copied to clipboard', 'success');
    });
}

function sendEmailInvite() {
    const email = document.getElementById('emailInvite').value.trim();
    if (email) {
        // In a real app, this would send actual email
        showNotification(`Invitation sent to ${email}`, 'success');
        document.getElementById('emailInvite').value = '';
    } else {
        showNotification('Please enter a valid email address', 'error');
    }
}

// Meeting functions
function raiseHand() {
    const handButton = document.getElementById('handButton');
    handButton.classList.toggle('active');
    
    if (handButton.classList.contains('active')) {
        showNotification('Hand raised', 'info');
        // In a real app, this would notify other participants
    } else {
        showNotification('Hand lowered', 'info');
    }
}

function leaveMeeting() {
    if (confirm('Are you sure you want to leave the meeting?')) {
        // Stop all streams
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        // Clear timer
        if (meetingTimer) {
            clearInterval(meetingTimer);
        }
        
        // Redirect to home
        window.location.href = 'index.html';
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Utility functions
function closeOtherPanels(exceptPanel) {
    const panels = ['chatPanel', 'participantsPanel', 'whiteboardPanel'];
    panels.forEach(panel => {
        if (panel !== exceptPanel) {
            document.getElementById(panel).classList.remove('active');
            document.getElementById(panel.replace('Panel', 'Button')).classList.remove('active');
        }
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clean up resources
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        if (meetingTimer) {
            clearInterval(meetingTimer);
        }
        
        // Redirect to login/home
        window.location.href = 'index.html';
    }
}

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
                top: 80px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
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

// Video layout adjustment
function adjustVideoLayout() {
    const videoGrid = document.getElementById('videoGrid');
    const videos = videoGrid.querySelectorAll('.video-item');
    const count = videos.length;
    
    // Adjust grid layout based on number of videos
    if (count === 1) {
        videoGrid.style.gridTemplateColumns = '1fr';
    } else if (count === 2) {
        videoGrid.style.gridTemplateColumns = '1fr 1fr';
    } else if (count <= 4) {
        videoGrid.style.gridTemplateColumns = '1fr 1fr';
    } else if (count <= 9) {
        videoGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
    } else {
        videoGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    }
}

// Pause/Resume video when page is hidden/visible
function pauseVideo() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (track.kind === 'video') {
                track.enabled = false;
            }
        });
    }
}

function resumeVideo() {
    if (localStream && !isVideoOff) {
        localStream.getTracks().forEach(track => {
            if (track.kind === 'video') {
                track.enabled = true;
            }
        });
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
    
    // Close user dropdown when clicking outside
    const dropdown = document.getElementById('userDropdown');
    if (dropdown.style.display === 'block' && !event.target.closest('.user-menu')) {
        dropdown.style.display = 'none';
    }
}

// Simulate participants joining (for demo purposes)
setTimeout(() => {
    addParticipant('John Doe');
}, 5000);

setTimeout(() => {
    addParticipant('Jane Smith');
}, 10000);

setTimeout(() => {
    addChatMessage('John Doe', 'Hello everyone!');
}, 15000);

setTimeout(() => {
    addChatMessage('Jane Smith', 'Hi John! How are you?');
}, 20000);
