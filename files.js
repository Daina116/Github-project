// File Storage JavaScript
let files = [];
let folders = [];
let currentFolder = 'root';
let currentView = 'grid';
let selectedFiles = [];
let selectMode = false;
let shareEmails = [];
let currentFileId = null;

// Initialize file storage
document.addEventListener('DOMContentLoaded', function() {
    loadFiles();
    renderFiles();
    updateStorageInfo();
    updateCategoryCounts();
    setupEventListeners();
});

// Load files from localStorage
function loadFiles() {
    const savedFiles = localStorage.getItem('files');
    const savedFolders = localStorage.getItem('folders');
    
    if (savedFiles) {
        files = JSON.parse(savedFiles);
    } else {
        // Create default files
        files = [
            {
                id: 'file1',
                name: 'Project Proposal.pdf',
                type: 'pdf',
                size: 2621440,
                modified: new Date('2024-11-15T10:30:00').toISOString(),
                created: new Date('2024-11-10T14:15:00').toISOString(),
                folder: 'root',
                owner: 'John Doe',
                starred: false,
                shared: false
            },
            {
                id: 'file2',
                name: 'Budget Spreadsheet.xlsx',
                type: 'spreadsheet',
                size: 524288,
                modified: new Date('2024-11-14T16:45:00').toISOString(),
                created: new Date('2024-11-08T09:30:00').toISOString(),
                folder: 'root',
                owner: 'Jane Smith',
                starred: true,
                shared: true
            },
            {
                id: 'file3',
                name: 'Team Photo.jpg',
                type: 'image',
                size: 1048576,
                modified: new Date('2024-11-13T11:20:00').toISOString(),
                created: new Date('2024-11-05T13:45:00').toISOString(),
                folder: 'root',
                owner: 'Mike Johnson',
                starred: false,
                shared: false
            },
            {
                id: 'file4',
                name: 'Presentation.pptx',
                type: 'presentation',
                size: 3145728,
                modified: new Date('2024-11-12T15:30:00').toISOString(),
                created: new Date('2024-11-01T10:00:00').toISOString(),
                folder: 'root',
                owner: 'Sarah Wilson',
                starred: true,
                shared: true
            },
            {
                id: 'file5',
                name: 'Meeting Recording.mp4',
                type: 'video',
                size: 10485760,
                modified: new Date('2024-11-11T17:00:00').toISOString(),
                created: new Date('2024-11-11T09:00:00').toISOString(),
                folder: 'root',
                owner: 'Tom Brown',
                starred: false,
                shared: false
            },
            {
                id: 'file6',
                name: 'Report.docx',
                type: 'document',
                size: 1572864,
                modified: new Date('2024-11-10T14:30:00').toISOString(),
                created: new Date('2024-11-09T11:15:00').toISOString(),
                folder: 'root',
                owner: 'Emily Davis',
                starred: false,
                shared: true
            }
        ];
        saveFiles();
    }
    
    if (savedFolders) {
        folders = JSON.parse(savedFolders);
    } else {
        // Create default folders
        folders = [
            {
                id: 'folder1',
                name: 'Documents',
                parent: 'root',
                created: new Date('2024-11-01T10:00:00').toISOString(),
                modified: new Date('2024-11-15T10:30:00').toISOString(),
                owner: 'John Doe',
                shared: false
            },
            {
                id: 'folder2',
                name: 'Images',
                parent: 'root',
                created: new Date('2024-11-02T14:30:00').toISOString(),
                modified: new Date('2024-11-14T16:45:00').toISOString(),
                owner: 'Jane Smith',
                shared: true
            },
            {
                id: 'folder3',
                name: 'Projects',
                parent: 'root',
                created: new Date('2024-11-03T09:15:00').toISOString(),
                modified: new Date('2024-11-13T11:20:00').toISOString(),
                owner: 'Mike Johnson',
                shared: false
            }
        ];
        saveFolders();
    }
}

// Save files to localStorage
function saveFiles() {
    localStorage.setItem('files', JSON.stringify(files));
    updateStorageInfo();
    updateCategoryCounts();
}

// Save folders to localStorage
function saveFolders() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

// Setup event listeners
function setupEventListeners() {
    // Handle search
    document.getElementById('fileSearch').addEventListener('input', searchFiles);
    
    // Handle drag and drop
    const uploadArea = document.getElementById('uploadArea');
    const mainContent = document.querySelector('.main-content');
    
    mainContent.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.display = 'flex';
    });
    
    mainContent.addEventListener('dragleave', (e) => {
        if (e.target === mainContent) {
            uploadArea.style.display = 'none';
        }
    });
    
    mainContent.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.display = 'none';
        handleFileDrop(e);
    });
    
    // Handle share type change
    document.querySelectorAll('input[name="shareType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'link') {
                document.getElementById('shareLinkSection').style.display = 'block';
                document.getElementById('shareEmailSection').style.display = 'none';
            } else {
                document.getElementById('shareLinkSection').style.display = 'none';
                document.getElementById('shareEmailSection').style.display = 'block';
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
        
        // Close user dropdown when clicking outside
        const dropdown = document.getElementById('userDropdown');
        if (dropdown.style.display === 'block' && !event.target.closest('.user-menu')) {
            dropdown.style.display = 'none';
        }
    });
}

// Render files based on current view
function renderFiles() {
    const container = document.getElementById('filesContainer');
    container.innerHTML = '';
    
    let items = [];
    
    // Add folders
    const currentFolders = folders.filter(folder => folder.parent === currentFolder);
    currentFolders.forEach(folder => {
        items.push({
            type: 'folder',
            data: folder
        });
    });
    
    // Add files
    const currentFiles = files.filter(file => file.folder === currentFolder);
    currentFiles.forEach(file => {
        items.push({
            type: 'file',
            data: file
        });
    });
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>This folder is empty</h3>
                <p>Upload files or create folders to get started</p>
                <button class="btn btn-primary" onclick="showUploadModal()">
                    <i class="fas fa-upload"></i> Upload Files
                </button>
            </div>
        `;
        return;
    }
    
    if (currentView === 'grid') {
        renderGridView(items);
    } else {
        renderListView(items);
    }
}

// Render grid view
function renderGridView(items) {
    const container = document.getElementById('filesContainer');
    const grid = document.createElement('div');
    grid.className = 'files-grid';
    
    items.forEach(item => {
        const element = createGridItem(item);
        grid.appendChild(element);
    });
    
    container.appendChild(grid);
}

// Create grid item
function createGridItem(item) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    if (selectMode) {
        div.classList.add('select-mode');
    }
    
    if (selectedFiles.includes(item.data.id)) {
        div.classList.add('selected');
    }
    
    div.onclick = () => handleItemClick(item);
    
    // Checkbox for select mode
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'file-checkbox';
    checkbox.checked = selectedFiles.includes(item.data.id);
    checkbox.onclick = (e) => {
        e.stopPropagation();
        toggleFileSelection(item.data.id);
    };
    div.appendChild(checkbox);
    
    // Icon
    const icon = document.createElement('i');
    icon.className = `file-icon ${item.type === 'folder' ? 'folder' : getFileIconClass(item.data.type)}`;
    if (item.type === 'folder') {
        icon.className = 'fas fa-folder file-icon folder';
    } else {
        icon.className = `fas ${getFileIconClass(item.data.type)} file-icon ${item.data.type}`;
    }
    div.appendChild(icon);
    
    // Star
    const star = document.createElement('i');
    star.className = 'fas fa-star file-star';
    if (item.data.starred) {
        star.classList.add('starred');
    }
    star.onclick = (e) => {
        e.stopPropagation();
        toggleStar(item.data.id);
    };
    div.appendChild(star);
    
    // Name
    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = item.data.name;
    div.appendChild(name);
    
    if (item.type === 'file') {
        // Size
        const size = document.createElement('div');
        size.className = 'file-size';
        size.textContent = formatFileSize(item.data.size);
        div.appendChild(size);
        
        // Date
        const date = document.createElement('div');
        date.className = 'file-date';
        date.textContent = formatDate(item.data.modified);
        div.appendChild(date);
    }
    
    return div;
}

// Render list view
function renderListView(items) {
    const container = document.getElementById('filesContainer');
    const list = document.createElement('div');
    list.className = 'files-list';
    
    items.forEach(item => {
        const element = createListItem(item);
        list.appendChild(element);
    });
    
    container.appendChild(list);
}

// Create list item
function createListItem(item) {
    const div = document.createElement('div');
    div.className = 'file-list-item';
    
    if (selectedFiles.includes(item.data.id)) {
        div.classList.add('selected');
    }
    
    div.onclick = () => handleItemClick(item);
    
    // Icon
    const icon = document.createElement('i');
    icon.className = `file-list-icon ${item.type === 'folder' ? 'fas fa-folder' : getFileIconClass(item.data.type)}`;
    div.appendChild(icon);
    
    // Info
    const info = document.createElement('div');
    info.className = 'file-list-info';
    
    // Name
    const name = document.createElement('div');
    name.className = 'file-list-name';
    name.textContent = item.data.name;
    info.appendChild(name);
    
    if (item.type === 'file') {
        // Size
        const size = document.createElement('div');
        size.className = 'file-list-size';
        size.textContent = formatFileSize(item.data.size);
        info.appendChild(size);
        
        // Date
        const date = document.createElement('div');
        date.className = 'file-list-date';
        date.textContent = formatDate(item.data.modified);
        info.appendChild(date);
        
        // Type
        const type = document.createElement('div');
        type.className = 'file-list-type';
        type.textContent = getFileTypeLabel(item.data.type);
        info.appendChild(type);
    }
    
    div.appendChild(info);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'file-list-actions';
    
    if (item.type === 'file') {
        // Download
        const download = document.createElement('button');
        download.className = 'btn-icon';
        download.innerHTML = '<i class="fas fa-download"></i>';
        download.title = 'Download';
        download.onclick = (e) => {
            e.stopPropagation();
            downloadFile(item.data.id);
        };
        actions.appendChild(download);
    }
    
    // Share
    const share = document.createElement('button');
    share.className = 'btn-icon';
    share.innerHTML = '<i class="fas fa-share"></i>';
    share.title = 'Share';
    share.onclick = (e) => {
        e.stopPropagation();
        shareFile(item.data.id);
    };
    actions.appendChild(share);
    
    // Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteFile(item.data.id);
    };
    actions.appendChild(deleteBtn);
    
    div.appendChild(actions);
    
    return div;
}

// Handle item click
function handleItemClick(item) {
    if (selectMode) {
        toggleFileSelection(item.data.id);
    } else {
        if (item.type === 'folder') {
            navigateToFolder(item.data.id);
        } else {
            showFileDetails(item.data.id);
        }
    }
}

// Toggle file selection
function toggleFileSelection(fileId) {
    const index = selectedFiles.indexOf(fileId);
    if (index > -1) {
        selectedFiles.splice(index, 1);
    } else {
        selectedFiles.push(fileId);
    }
    renderFiles();
}

// Toggle star
function toggleStar(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        file.starred = !file.starred;
        saveFiles();
        renderFiles();
    }
}

// Show file details
function showFileDetails(fileId) {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    currentFileId = fileId;
    
    // Update modal content
    document.getElementById('fileDetailsTitle').textContent = file.name;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileType').textContent = getFileTypeLabel(file.type);
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileModified').textContent = formatDate(file.modified);
    document.getElementById('fileCreated').textContent = formatDate(file.created);
    document.getElementById('fileOwner').textContent = file.owner;
    
    // Update preview
    const preview = document.getElementById('filePreview');
    if (file.type === 'image') {
        preview.innerHTML = '<i class="fas fa-image"></i>';
    } else {
        const iconClass = getFileIconClass(file.type);
        preview.innerHTML = `<i class="fas ${iconClass}"></i>`;
    }
    
    // Show modal
    document.getElementById('fileDetailsModal').classList.add('active');
}

// Download file
function downloadFile(fileId = null) {
    const id = fileId || currentFileId;
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    // Simulate download
    showNotification(`Downloading ${file.name}...`, 'info');
    
    setTimeout(() => {
        showNotification(`${file.name} downloaded successfully!`, 'success');
    }, 2000);
}

// Share file
function shareFile(fileId = null) {
    const id = fileId || currentFileId;
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    currentFileId = id;
    
    // Generate share link
    const shareLink = `https://files.example.com/share/${generateShareId()}`;
    document.getElementById('shareLinkInput').value = shareLink;
    
    // Reset form
    document.querySelectorAll('input[name="shareType"][value="link"]').forEach(radio => {
        radio.checked = true;
    });
    document.getElementById('shareLinkSection').style.display = 'block';
    document.getElementById('shareEmailSection').style.display = 'none';
    
    shareEmails = [];
    updateEmailList();
    
    // Show modal
    document.getElementById('shareModal').classList.add('active');
}

// Confirm share
function confirmShare() {
    const shareType = document.querySelector('input[name="shareType"]:checked').value;
    
    if (shareType === 'email' && shareEmails.length === 0) {
        showNotification('Please add at least one email address', 'error');
        return;
    }
    
    // Mark file as shared
    const file = files.find(f => f.id === currentFileId);
    if (file) {
        file.shared = true;
        saveFiles();
    }
    
    closeModal('shareModal');
    showNotification('File shared successfully!', 'success');
}

// Copy share link
function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    input.select();
    document.execCommand('copy');
    showNotification('Link copied to clipboard!', 'success');
}

// Add share email
function addShareEmail() {
    const input = document.getElementById('shareEmailInput');
    const email = input.value.trim();
    
    if (!email) return;
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (shareEmails.includes(email)) {
        showNotification('This email is already added', 'error');
        return;
    }
    
    shareEmails.push(email);
    input.value = '';
    updateEmailList();
}

// Update email list
function updateEmailList() {
    const list = document.getElementById('emailList');
    list.innerHTML = '';
    
    shareEmails.forEach(email => {
        const item = document.createElement('div');
        item.className = 'email-item';
        item.innerHTML = `
            <span>${email}</span>
            <span class="remove" onclick="removeShareEmail('${email}')">&times;</span>
        `;
        list.appendChild(item);
    });
}

// Remove share email
function removeShareEmail(email) {
    shareEmails = shareEmails.filter(e => e !== email);
    updateEmailList();
}

// Rename file
function renameFile() {
    const file = files.find(f => f.id === currentFileId);
    if (!file) return;
    
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
        file.name = newName;
        file.modified = new Date().toISOString();
        saveFiles();
        renderFiles();
        closeModal('fileDetailsModal');
        showNotification('File renamed successfully!', 'success');
    }
}

// Delete file
function deleteFile(fileId = null) {
    const id = fileId || currentFileId;
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
        files = files.filter(f => f.id !== id);
        saveFiles();
        renderFiles();
        
        if (fileId === null) {
            closeModal('fileDetailsModal');
        }
        
        showNotification('File deleted successfully!', 'success');
    }
}

// Create new folder
function createNewFolder() {
    const name = prompt('Enter folder name:');
    if (name) {
        const newFolder = {
            id: 'folder' + Date.now(),
            name: name,
            parent: currentFolder,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            owner: 'Current User',
            shared: false
        };
        
        folders.push(newFolder);
        saveFolders();
        renderFiles();
        showNotification('Folder created successfully!', 'success');
    }
}

// Navigate to folder
function navigateToFolder(folderId) {
    currentFolder = folderId;
    
    // Update breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb');
    if (folderId === 'root') {
        document.getElementById('currentFolderName').textContent = 'Root';
    } else {
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            document.getElementById('currentFolderName').textContent = folder.name;
        }
    }
    
    renderFiles();
}

// View management
function setView(view) {
    currentView = view;
    
    // Update view buttons
    document.querySelectorAll('.view-toggle .btn-icon').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.btn-icon').classList.add('active');
    
    renderFiles();
}

// Sort files
function sortFiles() {
    const sortBy = document.getElementById('sortSelect').value;
    
    files.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return new Date(b.modified) - new Date(a.modified);
            case 'size':
                return b.size - a.size;
            case 'type':
                return a.type.localeCompare(b.type);
            default:
                return 0;
        }
    });
    
    renderFiles();
}

// Search files
function searchFiles() {
    const searchTerm = document.getElementById('fileSearch').value.toLowerCase();
    
    if (!searchTerm) {
        renderFiles();
        return;
    }
    
    const container = document.getElementById('filesContainer');
    container.innerHTML = '';
    
    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm) &&
        file.folder === currentFolder
    );
    
    const filteredFolders = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm) &&
        folder.parent === currentFolder
    );
    
    let items = [];
    
    // Add folders
    filteredFolders.forEach(folder => {
        items.push({
            type: 'folder',
            data: folder
        });
    });
    
    // Add files
    filteredFiles.forEach(file => {
        items.push({
            type: 'file',
            data: file
        });
    });
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No files found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }
    
    if (currentView === 'grid') {
        renderGridView(items);
    } else {
        renderListView(items);
    }
}

// Toggle select mode
function toggleSelectMode() {
    selectMode = !selectMode;
    selectedFiles = [];
    renderFiles();
    
    if (selectMode) {
        showNotification('Select mode enabled. Click files to select them.', 'info');
    } else {
        showNotification('Select mode disabled.', 'info');
    }
}

// Refresh files
function refreshFiles() {
    renderFiles();
    showNotification('Files refreshed!', 'info');
}

// Upload functions
function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        startUploadProcess(files);
    }
}

function handleModalFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        closeModal('uploadModal');
        startUploadProcess(files);
    }
}

function handleFileDrop(event) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        startUploadProcess(files);
    }
}

function startUploadProcess(fileList) {
    const modal = document.getElementById('uploadProgressModal');
    const progressList = document.getElementById('uploadProgressList');
    
    modal.classList.add('active');
    progressList.innerHTML = '';
    
    Array.from(fileList).forEach(file => {
        const progressItem = createUploadProgressItem(file);
        progressList.appendChild(progressItem);
        
        // Simulate upload progress
        simulateUpload(file, progressItem);
    });
}

function createUploadProgressItem(file) {
    const div = document.createElement('div');
    div.className = 'upload-progress-item';
    
    const icon = document.createElement('i');
    icon.className = `fas ${getFileIconClass(getFileType(file.name))} upload-progress-icon`;
    div.appendChild(icon);
    
    const info = document.createElement('div');
    info.className = 'upload-progress-info';
    
    const name = document.createElement('div');
    name.className = 'upload-progress-name';
    name.textContent = file.name;
    info.appendChild(name);
    
    const progressBar = document.createElement('div');
    progressBar.className = 'upload-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'upload-progress-fill';
    progressFill.style.width = '0%';
    progressBar.appendChild(progressFill);
    
    info.appendChild(progressBar);
    
    const status = document.createElement('div');
    status.className = 'upload-progress-status';
    status.textContent = 'Uploading...';
    info.appendChild(status);
    
    div.appendChild(info);
    
    return div;
}

function simulateUpload(file, progressItem) {
    let progress = 0;
    const progressFill = progressItem.querySelector('.upload-progress-fill');
    const status = progressItem.querySelector('.upload-progress-status');
    
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        
        if (progress === 100) {
            clearInterval(interval);
            status.textContent = 'Upload complete!';
            
            // Add file to storage
            const newFile = {
                id: 'file' + Date.now() + Math.random(),
                name: file.name,
                type: getFileType(file.name),
                size: file.size,
                modified: new Date().toISOString(),
                created: new Date().toISOString(),
                folder: currentFolder,
                owner: 'Current User',
                starred: false,
                shared: false
            };
            
            files.push(newFile);
            saveFiles();
            renderFiles();
        }
    }, 200);
}

// Update storage info
function updateStorageInfo() {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 10 * 1024 * 1024 * 1024; // 10 GB
    const usedPercentage = (totalSize / maxSize) * 100;
    
    document.getElementById('storageUsed').style.width = usedPercentage + '%';
    document.getElementById('storageUsedText').textContent = formatFileSize(totalSize);
}

// Update category counts
function updateCategoryCounts() {
    const categories = {
        image: 0,
        document: 0,
        video: 0,
        audio: 0,
        archive: 0
    };
    
    files.forEach(file => {
        if (categories.hasOwnProperty(file.type)) {
            categories[file.type]++;
        }
    });
    
    document.getElementById('imageCount').textContent = categories.image;
    document.getElementById('docCount').textContent = categories.document;
    document.getElementById('videoCount').textContent = categories.video;
    document.getElementById('audioCount').textContent = categories.audio;
    document.getElementById('archiveCount').textContent = categories.archive;
}

// Utility functions
function getFileIconClass(type) {
    const iconMap = {
        'pdf': 'fa-file-pdf',
        'document': 'fa-file-word',
        'spreadsheet': 'fa-file-excel',
        'presentation': 'fa-file-powerpoint',
        'image': 'fa-file-image',
        'video': 'fa-file-video',
        'audio': 'fa-file-audio',
        'archive': 'fa-file-archive',
        'folder': 'fa-folder'
    };
    return iconMap[type] || 'fa-file';
}

function getFileTypeLabel(type) {
    const labels = {
        'pdf': 'PDF Document',
        'document': 'Word Document',
        'spreadsheet': 'Excel Spreadsheet',
        'presentation': 'PowerPoint',
        'image': 'Image',
        'video': 'Video',
        'audio': 'Audio',
        'archive': 'Archive'
    };
    return labels[type] || 'File';
}

function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'document',
        'docx': 'document',
        'xls': 'spreadsheet',
        'xlsx': 'spreadsheet',
        'ppt': 'presentation',
        'pptx': 'presentation',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'mp3': 'audio',
        'wav': 'audio',
        'flac': 'audio',
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive'
    };
    return typeMap[extension] || 'document';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function generateShareId() {
    return Math.random().toString(36).substring(2, 15);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
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
