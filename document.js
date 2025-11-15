// Document Editor JavaScript
let currentDocument = null;
let documents = [];
let comments = [];
let undoStack = [];
let redoStack = [];
let autoSaveTimer = null;

// Initialize document editor
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    loadDocuments();
    loadRecentDocuments();
    setupAutoSave();
    setupKeyboardShortcuts();
});

// Initialize editor
function initializeEditor() {
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('documentTitle');
    
    // Set initial content
    if (!editor.innerHTML.trim()) {
        editor.innerHTML = '<h1>Start typing your document...</h1><p>Your content goes here. Use the toolbar above to format your text.</p>';
    }
    
    // Save initial state
    saveState();
    
    // Handle title change
    titleInput.addEventListener('input', function() {
        if (currentDocument) {
            currentDocument.title = this.value;
            updateDocumentList();
            saveDocuments();
        }
    });
    
    // Handle content change
    editor.addEventListener('input', function() {
        saveState();
        if (currentDocument) {
            currentDocument.content = this.innerHTML;
            currentDocument.lastModified = new Date().toISOString();
        }
    });
}

// Load documents
function loadDocuments() {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
        documents = JSON.parse(savedDocuments);
    } else {
        // Create default document
        currentDocument = {
            id: 'doc1',
            title: 'Untitled Document',
            content: '<h1>Start typing your document...</h1><p>Your content goes here. Use the toolbar above to format your text.</p>',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        documents = [currentDocument];
        saveDocuments();
    }
    
    updateDocumentList();
    if (documents.length > 0 && !currentDocument) {
        loadDocument(documents[0].id);
    }
}

// Load recent documents
function loadRecentDocuments() {
    const recentList = document.getElementById('recentList');
    const recentDocs = documents
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5);
    
    recentList.innerHTML = recentDocs.map(doc => `
        <div class="recent-item" onclick="loadDocument('${doc.id}')">
            <i class="fas fa-file-alt"></i>
            <span>${doc.title}</span>
            <span class="recent-time">${formatTime(doc.lastModified)}</span>
        </div>
    `).join('');
}

// Update document list
function updateDocumentList() {
    const documentList = document.getElementById('documentList');
    documentList.innerHTML = documents.map(doc => `
        <div class="document-item ${currentDocument && currentDocument.id === doc.id ? 'active' : ''}" onclick="loadDocument('${doc.id}')">
            <i class="fas fa-file-alt"></i>
            <span>${doc.title}</span>
            <div class="document-actions">
                <button class="btn-icon" onclick="renameDocument('${doc.id}', event)" title="Rename">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteDocument('${doc.id}', event)" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load document
function loadDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        currentDocument = doc;
        document.getElementById('editor').innerHTML = doc.content;
        document.getElementById('documentTitle').value = doc.title;
        updateDocumentList();
        loadRecentDocuments();
        loadComments(docId);
    }
}

// Create new document
function createNewDocument() {
    const newDoc = {
        id: 'doc' + Date.now(),
        title: 'Untitled Document',
        content: '<h1>Untitled Document</h1><p>Start typing...</p>',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    documents.push(newDoc);
    saveDocuments();
    loadDocument(newDoc.id);
    showNotification('New document created!', 'success');
}

// Rename document
function renameDocument(docId, event) {
    event.stopPropagation();
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        const newName = prompt('Enter new document name:', doc.title);
        if (newName && newName.trim()) {
            doc.title = newName.trim();
            doc.lastModified = new Date().toISOString();
            saveDocuments();
            updateDocumentList();
            loadRecentDocuments();
            if (currentDocument && currentDocument.id === docId) {
                document.getElementById('documentTitle').value = newName;
            }
            showNotification('Document renamed!', 'success');
        }
    }
}

// Delete document
function deleteDocument(docId, event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
        documents = documents.filter(d => d.id !== docId);
        saveDocuments();
        updateDocumentList();
        loadRecentDocuments();
        
        if (currentDocument && currentDocument.id === docId) {
            if (documents.length > 0) {
                loadDocument(documents[0].id);
            } else {
                createNewDocument();
            }
        }
        showNotification('Document deleted!', 'success');
    }
}

// Save documents
function saveDocuments() {
    localStorage.setItem('documents', JSON.stringify(documents));
}

// Load template
function loadTemplate(templateType) {
    const templates = {
        blank: '<h1>Untitled Document</h1><p>Start typing your content here...</p>',
        letter: `<h1>Your Name</h1>
<p>Your Address</p>
<p>City, State, ZIP Code</p>
<p>Date: ${new Date().toLocaleDateString()}</p>
<br>
<h2>Recipient Name</h2>
<p>Recipient Address</p>
<p>City, State, ZIP Code</p>
<br>
<p>Dear [Recipient Name],</p>
<p>Your letter content goes here...</p>
<p>Sincerely,</p>
<p>Your Name</p>`,
        resume: `<h1>Your Name</h1>
<p>Email: your.email@example.com | Phone: (123) 456-7890</p>
<br>
<h2>Professional Summary</h2>
<p>Your professional summary goes here...</p>
<br>
<h2>Experience</h2>
<h3>Job Title - Company Name</h3>
<p><em>Start Date - End Date</em></p>
<ul>
<li>Responsibility 1</li>
<li>Responsibility 2</li>
<li>Responsibility 3</li>
</ul>
<br>
<h2>Education</h2>
<h3>Degree - University Name</h3>
<p><em>Graduation Year</em></p>
<br>
<h2>Skills</h2>
<ul>
<li>Skill 1</li>
<li>Skill 2</li>
<li>Skill 3</li>
</ul>`,
        report: `<h1>Report Title</h1>
<p>Date: ${new Date().toLocaleDateString()}</p>
<p>Author: Your Name</p>
<br>
<h2>Executive Summary</h2>
<p>Executive summary goes here...</p>
<br>
<h2>Introduction</h2>
<p>Introduction goes here...</p>
<br>
<h2>Methodology</h2>
<p>Methodology goes here...</p>
<br>
<h2>Findings</h2>
<p>Findings go here...</p>
<br>
<h2>Conclusion</h2>
<p>Conclusion goes here...</p>
<br>
<h2>Recommendations</h2>
<p>Recommendations go here...</p>`,
        essay: `<h1>Essay Title</h1>
<p>By: Your Name</p>
<br>
<h2>Introduction</h2>
<p>Start your essay with an engaging introduction that presents your main argument or thesis statement...</p>
<br>
<h2>Body Paragraph 1</h2>
<p>Develop your first main point with supporting evidence and examples...</p>
<br>
<h2>Body Paragraph 2</h2>
<p>Develop your second main point with supporting evidence and examples...</p>
<br>
<h2>Body Paragraph 3</h2>
<p>Develop your third main point with supporting evidence and examples...</p>
<br>
<h2>Conclusion</h2>
<p>Summarize your main points and restate your thesis in a compelling way...</p>`
    };
    
    const content = templates[templateType] || templates.blank;
    document.getElementById('editor').innerHTML = content;
    
    if (currentDocument) {
        currentDocument.content = content;
        currentDocument.lastModified = new Date().toISOString();
        saveDocuments();
    }
    
    saveState();
    showNotification(`${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template loaded!`, 'success');
}

// Text formatting functions
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('editor').focus();
}

function changeFontFamily(font) {
    document.execCommand('fontName', false, font);
    document.getElementById('editor').focus();
}

function changeFontSize(size) {
    document.execCommand('fontSize', false, size);
    document.getElementById('editor').focus();
}

function changeTextColor(color) {
    document.execCommand('foreColor', false, color);
    document.getElementById('editor').focus();
}

function changeBgColor(color) {
    document.execCommand('hiliteColor', false, color);
    document.getElementById('editor').focus();
}

// Insert functions
function insertLink() {
    document.getElementById('linkModal').style.display = 'block';
    document.getElementById('linkText').focus();
}

function insertLinkConfirm() {
    const text = document.getElementById('linkText').value;
    const url = document.getElementById('linkUrl').value;
    
    if (text && url) {
        document.execCommand('createLink', false, url);
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
        closeModal('linkModal');
        showNotification('Link inserted!', 'success');
    }
}

function insertImage() {
    document.getElementById('imageModal').style.display = 'block';
    document.getElementById('imageUrl').focus();
}

function insertImageConfirm() {
    const url = document.getElementById('imageUrl').value;
    const alt = document.getElementById('imageAlt').value;
    
    if (url) {
        const img = `<img src="${url}" alt="${alt || 'Image'}" style="max-width: 100%; height: auto;">`;
        document.execCommand('insertHTML', false, img);
        closeModal('imageModal');
        showNotification('Image inserted!', 'success');
    }
}

function insertTable() {
    document.getElementById('tableModal').style.display = 'block';
    document.getElementById('tableRows').focus();
}

function insertTableConfirm() {
    const rows = parseInt(document.getElementById('tableRows').value);
    const cols = parseInt(document.getElementById('tableCols').value);
    
    if (rows && cols) {
        let table = '<table style="width: 100%; border-collapse: collapse;">';
        
        // Create header row
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
            table += '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">Header ' + (j + 1) + '</th>';
        }
        table += '</tr>';
        
        // Create data rows
        for (let i = 0; i < rows - 1; i++) {
            table += '<tr>';
            for (let j = 0; j < cols; j++) {
                table += '<td style="border: 1px solid #ddd; padding: 8px;">Cell ' + (i + 1) + '-' + (j + 1) + '</td>';
            }
            table += '</tr>';
        }
        
        table += '</table>';
        
        document.execCommand('insertHTML', false, table);
        closeModal('tableModal');
        showNotification('Table inserted!', 'success');
    }
}

function insertCode() {
    const selection = window.getSelection().toString();
    const code = selection || 'Your code here';
    const codeBlock = `<pre style="background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;"><code>${code}</code></pre>`;
    document.execCommand('insertHTML', false, codeBlock);
    document.getElementById('editor').focus();
}

function insertQuote() {
    const selection = window.getSelection().toString();
    const quote = selection || 'Your quote here...';
    const quoteBlock = `<blockquote style="border-left: 4px solid #007bff; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #666;">${quote}</blockquote>`;
    document.execCommand('insertHTML', false, quoteBlock);
    document.getElementById('editor').focus();
}

function insertHorizontalRule() {
    document.execCommand('insertHTML', false, '<hr style="margin: 2rem 0;">');
    document.getElementById('editor').focus();
}

// Undo/Redo functions
function undo() {
    if (undoStack.length > 0) {
        const currentState = document.getElementById('editor').innerHTML;
        redoStack.push(currentState);
        
        const previousState = undoStack.pop();
        document.getElementById('editor').innerHTML = previousState;
        
        if (currentDocument) {
            currentDocument.content = previousState;
        }
    }
}

function redo() {
    if (redoStack.length > 0) {
        const currentState = document.getElementById('editor').innerHTML;
        undoStack.push(currentState);
        
        const nextState = redoStack.pop();
        document.getElementById('editor').innerHTML = nextState;
        
        if (currentDocument) {
            currentDocument.content = nextState;
        }
    }
}

function saveState() {
    const currentState = document.getElementById('editor').innerHTML;
    undoStack.push(currentState);
    redoStack = [];
    
    // Limit stack size
    if (undoStack.length > 50) {
        undoStack.shift();
    }
}

// Auto-save
function setupAutoSave() {
    let saveTimeout;
    document.getElementById('editor').addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveDocument();
        }, 2000);
    });
}

// Save document
function saveDocument() {
    if (currentDocument) {
        currentDocument.content = document.getElementById('editor').innerHTML;
        currentDocument.lastModified = new Date().toISOString();
        saveDocuments();
        showNotification('Document saved!', 'success');
    }
}

// Export document
function exportDocument() {
    const content = document.getElementById('editor').innerHTML;
    const title = document.getElementById('documentTitle').value || 'Untitled Document';
    
    // Create a temporary element to hold the content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    
    // Convert to plain text for export
    const textContent = tempElement.innerText || tempElement.textContent;
    
    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Document exported!', 'success');
}

// Share document
function shareDocument() {
    document.getElementById('shareModal').style.display = 'block';
}

function copyShareLink() {
    const shareLink = `${window.location.origin}/document.html?id=${currentDocument ? currentDocument.id : Date.now()}`;
    navigator.clipboard.writeText(shareLink).then(() => {
        showNotification('Share link copied to clipboard!', 'success');
    });
}

function showEmailInvite() {
    closeModal('shareModal');
    document.getElementById('emailInviteModal').style.display = 'block';
}

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

function showEmbedCode() {
    closeModal('shareModal');
    
    const embedCode = `<iframe src="${window.location.origin}/document.html?id=${currentDocument ? currentDocument.id : Date.now()}" width="800" height="600" frameborder="0"></iframe>`;
    document.getElementById('embedCode').value = embedCode;
    document.getElementById('embedModal').style.display = 'block';
}

function copyEmbedCode() {
    const embedCode = document.getElementById('embedCode');
    embedCode.select();
    document.execCommand('copy');
    showNotification('Embed code copied to clipboard!', 'success');
}

// Comments functions
function toggleComments() {
    const panel = document.getElementById('commentsPanel');
    const currentDisplay = panel.style.display;
    panel.style.display = currentDisplay === 'none' ? 'flex' : 'none';
}

function loadComments(docId) {
    const savedComments = localStorage.getItem(`comments_${docId}`);
    if (savedComments) {
        comments = JSON.parse(savedComments);
    } else {
        comments = [];
    }
    updateCommentsList();
}

function updateCommentsList() {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${formatTime(comment.timestamp)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

function addComment() {
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) return;
    
    const comment = {
        id: Date.now(),
        author: 'Daina116',
        content: commentText,
        timestamp: new Date().toISOString()
    };
    
    comments.push(comment);
    
    if (currentDocument) {
        localStorage.setItem(`comments_${currentDocument.id}`, JSON.stringify(comments));
    }
    
    updateCommentsList();
    document.getElementById('commentText').value = '';
    showNotification('Comment added!', 'success');
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    saveDocument();
                    break;
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    exportDocument();
                    break;
            }
        }
    });
}

// Handle paste
function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
}

// Handle key up
function handleKeyUp() {
    // Auto-save logic is handled in setupAutoSave
}

// Utility functions
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
    
    return date.toLocaleDateString();
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Toggle user menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
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
    
    // Close user dropdown when clicking outside
    const dropdown = document.getElementById('userDropdown');
    if (dropdown.style.display === 'block' && !event.target.closest('.user-menu')) {
        dropdown.style.display = 'none';
    }
}
