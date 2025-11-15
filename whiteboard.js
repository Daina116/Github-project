// Whiteboard Page JavaScript
let canvas, ctx;
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentSize = 3;
let currentZoom = 1;
let showGrid = false;
let layers = [];
let currentLayer = 0;
let history = [];
let historyStep = -1;
let textPosition = null;

// Initialize whiteboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas();
    setupEventListeners();
    initializeLayers();
    loadSavedWhiteboard();
});

// Initialize canvas
function initializeCanvas() {
    canvas = document.getElementById('whiteboardCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Set initial drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear canvas
    clearCanvas();
}

// Resize canvas
function resizeCanvas() {
    const container = document.querySelector('.canvas-wrapper');
    const rect = container.getBoundingClientRect();
    
    // Save current canvas content
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Resize canvas
    canvas.width = Math.min(rect.width - 40, 1200);
    canvas.height = Math.min(rect.height - 40, 800);
    
    // Restore canvas content
    ctx.putImageData(imageData, 0, 0);
    
    // Apply zoom
    applyZoom();
}

// Setup event listeners
function setupEventListeners() {
    // Tool selection
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTool(this.dataset.tool);
        });
    });
    
    // Color selection
    document.getElementById('colorPicker').addEventListener('change', function() {
        currentColor = this.value;
    });
    
    document.querySelectorAll('.color-preset').forEach(btn => {
        btn.addEventListener('click', function() {
            currentColor = this.dataset.color;
            document.getElementById('colorPicker').value = currentColor;
        });
    });
    
    // Size control
    document.getElementById('brushSize').addEventListener('input', function() {
        currentSize = parseInt(this.value);
        document.getElementById('sizeValue').textContent = currentSize;
    });
    
    // Canvas drawing events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Initialize layers
function initializeLayers() {
    layers = [
        {
            id: 0,
            name: 'Layer 1',
            visible: true,
            data: null
        }
    ];
    currentLayer = 0;
    updateLayersList();
}

// Select tool
function selectTool(tool) {
    currentTool = tool;
    
    // Update UI
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    // Update cursor
    updateCursor();
    
    // Handle text tool
    if (tool === 'text') {
        canvas.style.cursor = 'text';
    } else {
        canvas.style.cursor = getCursorForTool(tool);
    }
}

// Get cursor for tool
function getCursorForTool(tool) {
    switch (tool) {
        case 'pen': return 'crosshair';
        case 'eraser': return 'grab';
        case 'line':
        case 'rectangle':
        case 'circle':
        case 'arrow': return 'crosshair';
        case 'select': return 'move';
        default: return 'crosshair';
    }
}

// Update cursor
function updateCursor() {
    if (currentTool === 'eraser') {
        canvas.style.cursor = 'grab';
    } else if (currentTool === 'select') {
        canvas.style.cursor = 'move';
    } else if (currentTool === 'text') {
        canvas.style.cursor = 'text';
    } else {
        canvas.style.cursor = 'crosshair';
    }
}

// Start drawing
function startDrawing(e) {
    if (currentTool === 'text') {
        handleTextTool(e);
        return;
    }
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Save state for undo
    saveState();
}

// Draw
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;
    
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    
    switch (currentTool) {
        case 'pen':
        case 'eraser':
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'line':
            drawLine(x, y);
            break;
        case 'rectangle':
            drawRectangle(x, y);
            break;
        case 'circle':
            drawCircle(x, y);
            break;
        case 'arrow':
            drawArrow(x, y);
            break;
    }
}

// Stop drawing
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveToLayer();
    }
}

// Handle touch events
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Handle keyboard shortcuts
function handleKeyboard(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 's':
                e.preventDefault();
                saveWhiteboard();
                break;
            case 'e':
                e.preventDefault();
                exportImage();
                break;
        }
    }
    
    // Tool shortcuts
    switch (e.key) {
        case 'p': selectTool('pen'); break;
        case 'e': selectTool('eraser'); break;
        case 'l': selectTool('line'); break;
        case 'r': selectTool('rectangle'); break;
        case 'c': selectTool('circle'); break;
        case 'a': selectTool('arrow'); break;
        case 't': selectTool('text'); break;
        case 'v': selectTool('select'); break;
        case 'Delete': clearCanvas(); break;
    }
}

// Draw line
function drawLine(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    ctx.beginPath();
    ctx.moveTo(ctx.startX || x, ctx.startY || y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    ctx.startX = x;
    ctx.startY = y;
}

// Draw rectangle
function drawRectangle(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    const startX = ctx.startX || x;
    const startY = ctx.startY || y;
    
    ctx.beginPath();
    ctx.rect(startX, startY, x - startX, y - startY);
    ctx.stroke();
    
    ctx.startX = x;
    ctx.startY = y;
}

// Draw circle
function drawCircle(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    const startX = ctx.startX || x;
    const startY = ctx.startY || y;
    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.startX = x;
    ctx.startY = y;
}

// Draw arrow
function drawArrow(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    const startX = ctx.startX || x;
    const startY = ctx.startY || y;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(y - startY, x - startX);
    const arrowLength = 15;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowLength * Math.cos(angle - Math.PI / 6), y - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowLength * Math.cos(angle + Math.PI / 6), y - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    
    ctx.startX = x;
    ctx.startY = y;
}

// Handle text tool
function handleTextTool(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / currentZoom;
    const y = (e.clientY - rect.top) / currentZoom;
    
    textPosition = { x, y };
    document.getElementById('textModal').style.display = 'block';
    document.getElementById('textInput').focus();
}

// Add text
function addText() {
    const text = document.getElementById('textInput').value.trim();
    const fontSize = parseInt(document.getElementById('fontSize').value);
    
    if (!text || !textPosition) return;
    
    saveState();
    
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = currentColor;
    ctx.fillText(text, textPosition.x, textPosition.y);
    
    closeModal('textModal');
    document.getElementById('textInput').value = '';
    textPosition = null;
    
    saveToLayer();
}

// Undo
function undo() {
    if (historyStep > 0) {
        historyStep--;
        const imageData = history[historyStep];
        ctx.putImageData(imageData, 0, 0);
        saveToLayer();
    }
}

// Redo
function redo() {
    if (historyStep < history.length - 1) {
        historyStep++;
        const imageData = history[historyStep];
        ctx.putImageData(imageData, 0, 0);
        saveToLayer();
    }
}

// Save state
function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Limit history size
    if (history.length > 50) {
        history.shift();
        historyStep--;
    }
}

// Clear canvas
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        history = [];
        historyStep = -1;
        saveState();
        saveToLayer();
    }
}

// Zoom functions
function zoomIn() {
    currentZoom = Math.min(currentZoom * 1.2, 3);
    applyZoom();
}

function zoomOut() {
    currentZoom = Math.max(currentZoom / 1.2, 0.5);
    applyZoom();
}

function resetZoom() {
    currentZoom = 1;
    applyZoom();
}

// Apply zoom
function applyZoom() {
    canvas.style.transform = `scale(${currentZoom})`;
}

// Toggle grid
function toggleGrid() {
    showGrid = !showGrid;
    const gridOverlay = document.getElementById('gridOverlay');
    gridOverlay.classList.toggle('active', showGrid);
}

// Save whiteboard
function saveWhiteboard() {
    const whiteboardData = {
        canvasData: canvas.toDataURL(),
        layers: layers,
        currentLayer: currentLayer,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('whiteboardData', JSON.stringify(whiteboardData));
    showNotification('Whiteboard saved successfully!', 'success');
}

// Load saved whiteboard
function loadSavedWhiteboard() {
    const savedData = localStorage.getItem('whiteboardData');
    if (savedData) {
        try {
            const whiteboardData = JSON.parse(savedData);
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                saveState();
            };
            img.src = whiteboardData.canvasData;
            
            if (whiteboardData.layers) {
                layers = whiteboardData.layers;
                currentLayer = whiteboardData.currentLayer || 0;
                updateLayersList();
            }
        } catch (error) {
            console.error('Error loading saved whiteboard:', error);
        }
    }
}

// Export image
function exportImage() {
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showNotification('Image exported successfully!', 'success');
}

// Share whiteboard
function shareWhiteboard() {
    document.getElementById('shareModal').style.display = 'block';
}

// Copy share link
function copyShareLink() {
    const shareLink = `${window.location.origin}/whiteboard.html?id=${Date.now()}`;
    navigator.clipboard.writeText(shareLink).then(() => {
        showNotification('Share link copied to clipboard!', 'success');
    });
}

// Show email invite
function showEmailInvite() {
    closeModal('shareModal');
    document.getElementById('emailInviteModal').style.display = 'block';
}

// Send invitation
function sendInvitation() {
    const emails = document.getElementById('emailAddresses').value.trim();
    const message = document.getElementById('emailMessage').value.trim();
    
    if (!emails) {
        alert('Please enter at least one email address');
        return;
    }
    
    // In a real app, this would send an actual email
    showNotification('Invitation sent successfully!', 'success');
    closeModal('emailInviteModal');
    
    // Clear form
    document.getElementById('emailAddresses').value = '';
    document.getElementById('emailMessage').value = '';
}

// Show embed code
function showEmbedCode() {
    closeModal('shareModal');
    
    const embedCode = `<iframe src="${window.location.origin}/whiteboard.html?id=${Date.now()}" width="800" height="600" frameborder="0"></iframe>`;
    document.getElementById('embedCode').value = embedCode;
    document.getElementById('embedModal').style.display = 'block';
}

// Copy embed code
function copyEmbedCode() {
    const embedCode = document.getElementById('embedCode');
    embedCode.select();
    document.execCommand('copy');
    showNotification('Embed code copied to clipboard!', 'success');
}

// Layer management
function addLayer() {
    const newLayer = {
        id: layers.length,
        name: `Layer ${layers.length + 1}`,
        visible: true,
        data: null
    };
    
    layers.push(newLayer);
    currentLayer = newLayer.id;
    updateLayersList();
    showNotification('Layer added successfully!', 'success');
}

function toggleLayerVisibility(layerId) {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
        layer.visible = !layer.visible;
        updateLayersList();
        redrawCanvas();
    }
}

function deleteLayer(layerId) {
    if (layers.length <= 1) {
        alert('Cannot delete the last layer');
        return;
    }
    
    if (confirm('Are you sure you want to delete this layer?')) {
        layers = layers.filter(l => l.id !== layerId);
        if (currentLayer === layerId) {
            currentLayer = layers[0].id;
        }
        updateLayersList();
        redrawCanvas();
        showNotification('Layer deleted successfully!', 'success');
    }
}

function updateLayersList() {
    const container = document.getElementById('layersContainer');
    container.innerHTML = layers.map(layer => `
        <div class="layer-item ${layer.id === currentLayer ? 'active' : ''}" data-layer="${layer.id}">
            <div class="layer-info">
                <i class="fas fa-layer-group"></i>
                <span>${layer.name}</span>
            </div>
            <div class="layer-actions">
                <button class="btn-icon" onclick="toggleLayerVisibility(${layer.id})" title="Toggle Visibility">
                    <i class="fas fa-${layer.visible ? 'eye' : 'eye-slash'}"></i>
                </button>
                <button class="btn-icon" onclick="deleteLayer(${layer.id})" title="Delete Layer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for layer selection
    container.querySelectorAll('.layer-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.layer-actions')) {
                currentLayer = parseInt(this.dataset.layer);
                updateLayersList();
            }
        });
    });
}

function saveToLayer() {
    const layer = layers.find(l => l.id === currentLayer);
    if (layer) {
        layer.data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    layers.forEach(layer => {
        if (layer.visible && layer.data) {
            ctx.putImageData(layer.data, 0, 0);
        }
    });
}

// Insert shapes
function insertShape(shape) {
    saveState();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.beginPath();
    
    switch (shape) {
        case 'star':
            drawStar(centerX, centerY, 5, 50, 25);
            break;
        case 'heart':
            drawHeart(centerX, centerY, 50);
            break;
        case 'triangle':
            drawTriangle(centerX, centerY, 50);
            break;
        case 'hexagon':
            drawHexagon(centerX, centerY, 50);
            break;
        case 'diamond':
            drawDiamond(centerX, centerY, 50);
            break;
    }
    
    ctx.stroke();
    saveToLayer();
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
}

function drawHeart(cx, cy, size) {
    const width = size * 2;
    const height = size * 2;
    
    ctx.moveTo(cx, cy + height / 4);
    ctx.quadraticCurveTo(cx, cy, cx - width / 4, cy);
    ctx.quadraticCurveTo(cx - width / 2, cy, cx - width / 2, cy + height / 4);
    ctx.quadraticCurveTo(cx - width / 2, cy + height / 2, cx, cy + height * 0.75);
    ctx.quadraticCurveTo(cx + width / 2, cy + height / 2, cx + width / 2, cy + height / 4);
    ctx.quadraticCurveTo(cx + width / 2, cy, cx + width / 4, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + height / 4);
}

function drawTriangle(cx, cy, size) {
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.lineTo(cx + size, cy + size);
    ctx.closePath();
}

function drawHexagon(cx, cy, size) {
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
}

function drawDiamond(cx, cy, size) {
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
}

// Load templates
function loadTemplate(template) {
    if (!confirm(`Load ${template} template? This will clear the current canvas.`)) {
        return;
    }
    
    clearCanvas();
    saveState();
    
    switch (template) {
        case 'flowchart':
            drawFlowchartTemplate();
            break;
        case 'mindmap':
            drawMindmapTemplate();
            break;
        case 'wireframe':
            drawWireframeTemplate();
            break;
        case 'diagram':
            drawDiagramTemplate();
            break;
    }
    
    saveToLayer();
    showNotification(`${template.charAt(0).toUpperCase() + template.slice(1)} template loaded!`, 'success');
}

function drawFlowchartTemplate() {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    
    // Start node
    ctx.strokeRect(200, 50, 120, 60);
    ctx.fillText('Start', 240, 85);
    
    // Process nodes
    ctx.strokeRect(200, 150, 120, 60);
    ctx.fillText('Process 1', 230, 185);
    
    ctx.strokeRect(200, 250, 120, 60);
    ctx.fillText('Process 2', 230, 285);
    
    // Decision node
    ctx.beginPath();
    ctx.moveTo(260, 350);
    ctx.lineTo(320, 390);
    ctx.lineTo(260, 430);
    ctx.lineTo(200, 390);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText('Decision?', 225, 395);
    
    // End node
    ctx.strokeRect(200, 480, 120, 60);
    ctx.fillText('End', 245, 515);
    
    // Connectors
    ctx.beginPath();
    ctx.moveTo(260, 110);
    ctx.lineTo(260, 150);
    ctx.moveTo(260, 210);
    ctx.lineTo(260, 250);
    ctx.moveTo(260, 310);
    ctx.lineTo(260, 350);
    ctx.moveTo(260, 430);
    ctx.lineTo(260, 480);
    ctx.stroke();
}

function drawMindmapTemplate() {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    
    // Central node
    ctx.beginPath();
    ctx.arc(400, 300, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText('Main Idea', 370, 305);
    
    // Branch nodes
    const branches = [
        { x: 550, y: 200, label: 'Branch 1' },
        { x: 550, y: 300, label: 'Branch 2' },
        { x: 550, y: 400, label: 'Branch 3' },
        { x: 250, y: 200, label: 'Branch 4' },
        { x: 250, y: 300, label: 'Branch 5' },
        { x: 250, y: 400, label: 'Branch 6' }
    ];
    
    branches.forEach(branch => {
        // Connect line
        ctx.beginPath();
        ctx.moveTo(400, 300);
        ctx.lineTo(branch.x, branch.y);
        ctx.stroke();
        
        // Branch node
        ctx.beginPath();
        ctx.arc(branch.x, branch.y, 30, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(branch.label, branch.x - 25, branch.y + 5);
    });
}

function drawWireframeTemplate() {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1;
    
    // Header
    ctx.strokeRect(50, 50, 700, 80);
    ctx.strokeRect(70, 70, 100, 40);
    ctx.strokeRect(200, 70, 400, 40);
    ctx.strokeRect(620, 70, 110, 40);
    
    // Navigation
    ctx.strokeRect(50, 140, 700, 60);
    for (let i = 0; i < 5; i++) {
        ctx.strokeRect(70 + i * 140, 155, 120, 30);
    }
    
    // Main content
    ctx.strokeRect(50, 210, 450, 400);
    ctx.strokeRect(70, 230, 410, 50);
    ctx.strokeRect(70, 290, 410, 300);
    
    // Sidebar
    ctx.strokeRect(520, 210, 230, 400);
    for (let i = 0; i < 4; i++) {
        ctx.strokeRect(540, 230 + i * 90, 190, 70);
    }
}

function drawDiagramTemplate() {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    
    // Bar chart
    const bars = [150, 250, 180, 320, 200];
    const labels = ['A', 'B', 'C', 'D', 'E'];
    
    bars.forEach((height, index) => {
        const x = 200 + index * 80;
        const y = 400 - height;
        
        ctx.strokeRect(x, y, 60, height);
        ctx.fillText(labels[index], x + 25, 420);
        ctx.fillText(height.toString(), x + 20, y - 10);
    });
    
    // Axes
    ctx.beginPath();
    ctx.moveTo(180, 400);
    ctx.lineTo(620, 400);
    ctx.moveTo(180, 100);
    ctx.lineTo(180, 400);
    ctx.stroke();
}

// Invite collaborator
function inviteCollaborator() {
    const email = prompt('Enter email address to invite:');
    if (email) {
        // Add to collaborators list
        const collaboratorsList = document.getElementById('collaboratorsList');
        const newCollaborator = document.createElement('div');
        newCollaborator.className = 'collaborator-item';
        newCollaborator.innerHTML = `
            <div class="collaborator-avatar" style="background: ${getRandomColor()}">${email.charAt(0).toUpperCase()}</div>
            <div class="collaborator-info">
                <span>${email}</span>
                <div class="cursor-indicator" style="background: ${getRandomColor()};"></div>
            </div>
        `;
        collaboratorsList.appendChild(newCollaborator);
        
        showNotification(`Invitation sent to ${email}!`, 'success');
    }
}

// Get random color
function getRandomColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
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
}
