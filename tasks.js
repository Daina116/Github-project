// Task Management JavaScript
let tasks = [];
let currentView = 'kanban';
let draggedTask = null;
let currentTaskId = null;
let comments = {};

// Initialize task management
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    initializeKanban();
    setupEventListeners();
    updateStatistics();
});

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Create default tasks
        tasks = [
            {
                id: 'task1',
                title: 'Design new landing page',
                description: 'Create a modern and responsive landing page design',
                status: 'todo',
                priority: 'high',
                assignee: 'user1',
                dueDate: getDateAfterDays(3),
                labels: ['feature', 'urgent'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task2',
                title: 'Fix navigation bug',
                description: 'Navigation menu not working on mobile devices',
                status: 'in-progress',
                priority: 'medium',
                assignee: 'me',
                dueDate: getDateAfterDays(1),
                labels: ['bug'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task3',
                title: 'Update documentation',
                description: 'Update API documentation with new endpoints',
                status: 'review',
                priority: 'low',
                assignee: 'user2',
                dueDate: getDateAfterDays(7),
                labels: ['enhancement'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task4',
                title: 'Implement user authentication',
                description: 'Add login and registration functionality',
                status: 'done',
                priority: 'high',
                assignee: 'user1',
                dueDate: getDateAfterDays(-1),
                labels: ['feature'],
                createdAt: new Date().toISOString()
            }
        ];
        saveTasks();
    }
    
    renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStatistics();
}

// Initialize Kanban board
function initializeKanban() {
    renderKanbanBoard();
}

// Setup event listeners
function setupEventListeners() {
    // Handle search
    document.getElementById('taskSearch').addEventListener('input', searchTasks);
    
    // Handle filters
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('assigneeFilter').addEventListener('change', filterTasks);
    document.getElementById('dueDateFilter').addEventListener('change', filterTasks);
    
    // Handle label filters
    document.querySelectorAll('.label-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterTasks);
    });
}

// Render tasks based on current view
function renderTasks() {
    switch (currentView) {
        case 'kanban':
            renderKanbanBoard();
            break;
        case 'list':
            renderListView();
            break;
        case 'calendar':
            renderCalendarView();
            break;
        case 'timeline':
            renderTimelineView();
            break;
    }
}

// Kanban Board Functions
function renderKanbanBoard() {
    const columns = ['todo', 'in-progress', 'review', 'done'];
    
    columns.forEach(status => {
        const column = document.querySelector(`[data-status="${status}"]`);
        const content = column.querySelector('.column-content');
        const count = column.querySelector('.column-count');
        
        // Clear existing tasks
        content.innerHTML = '';
        
        // Get tasks for this column
        const columnTasks = tasks.filter(task => task.status === status);
        
        // Update count
        count.textContent = columnTasks.length;
        
        // Add tasks to column
        columnTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            content.appendChild(taskCard);
        });
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('click', () => showTaskDetails(task.id));
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    const assigneeInfo = getAssigneeInfo(task.assignee);
    
    card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
            <div class="task-assignee">
                <div class="task-assignee-avatar" style="background: ${assigneeInfo.color}">
                    ${assigneeInfo.initial}
                </div>
                <span>${assigneeInfo.name}</span>
            </div>
            <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                <i class="fas fa-calendar"></i>
                ${task.dueDate ? formatDate(task.dueDate) : 'No due date'}
            </div>
        </div>
        <div class="task-priority ${task.priority}">${task.priority}</div>
        ${task.labels && task.labels.length > 0 ? `
            <div class="task-labels">
                ${task.labels.map(label => `<span class="label-tag ${label}">${label}</span>`).join('')}
            </div>
        ` : ''}
        <div class="task-actions">
            <button class="btn-icon" onclick="editTask('${task.id}', event)" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="deleteTask('${task.id}', event)" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Drag and Drop Functions
function handleDragStart(e) {
    draggedTask = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDrop(e, newStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedTask) {
        const taskId = draggedTask.dataset.taskId;
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            task.status = newStatus;
            saveTasks();
            renderTasks();
            showNotification(`Task moved to ${newStatus.replace('-', ' ')}`, 'success');
        }
        
        draggedTask = null;
    }
}

// List View Functions
function renderListView() {
    const tbody = document.getElementById('taskTableBody');
    tbody.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" value="${task.id}"></td>
            <td class="task-title-cell">
                <div>
                    <strong>${task.title}</strong>
                    ${task.labels && task.labels.length > 0 ? `
                        <div class="task-labels">
                            ${task.labels.map(label => `<span class="label-tag ${label}">${label}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </td>
            <td class="assignee-cell">
                ${getAssigneeDisplay(task.assignee)}
            </td>
            <td>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </td>
            <td>
                <span class="status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
            </td>
            <td>
                ${task.dueDate ? formatDate(task.dueDate) : 'No due date'}
            </td>
            <td>
                ${task.labels && task.labels.length > 0 ? task.labels.map(label => 
                    `<span class="label-tag ${label}">${label}</span>`
                ).join('') : 'None'}
            </td>
            <td>
                <div class="task-actions">
                    <button class="btn-icon" onclick="showTaskDetails('${task.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editTask('${task.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Calendar View Functions
function renderCalendarView() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonth = document.getElementById('currentMonth');
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    currentMonth.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Get tasks for this day
        const dayTasks = tasks.filter(task => task.dueDate === dateString);
        
        dayElement.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            ${dayTasks.length > 0 ? `
                <div class="calendar-day-tasks">
                    ${dayTasks.slice(0, 3).map(task => `
                        <div class="calendar-task" onclick="showTaskDetails('${task.id}')">
                            ${task.title}
                        </div>
                    `).join('')}
                    ${dayTasks.length > 3 ? `<div class="calendar-task">+${dayTasks.length - 3} more</div>` : ''}
                </div>
            ` : ''}
        `;
        
        calendarGrid.appendChild(dayElement);
    }
}

// Timeline View Functions
function renderTimelineView() {
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = '';
    
    // Sort tasks by due date
    const sortedTasks = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    // Group tasks by date
    const groupedTasks = {};
    sortedTasks.forEach(task => {
        const date = task.dueDate || 'no-date';
        if (!groupedTasks[date]) {
            groupedTasks[date] = [];
        }
        groupedTasks[date].push(task);
    });
    
    // Render timeline
    Object.keys(groupedTasks).forEach(date => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'timeline-group';
        
        const dateHeader = document.createElement('div');
        dateHeader.className = 'timeline-date';
        dateHeader.textContent = date === 'no-date' ? 'No Due Date' : formatDate(date);
        
        dateGroup.appendChild(dateHeader);
        
        groupedTasks[date].forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'timeline-item';
            
            const taskContent = document.createElement('div');
            taskContent.className = 'timeline-content-item';
            taskContent.onclick = () => showTaskDetails(task.id);
            
            const assigneeInfo = getAssigneeInfo(task.assignee);
            
            taskContent.innerHTML = `
                <div class="timeline-task-title">${task.title}</div>
                <div class="timeline-task-meta">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <span>•</span>
                    <span>${assigneeInfo.name}</span>
                    <span>•</span>
                    <span class="status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                </div>
            `;
            
            taskItem.appendChild(taskContent);
            dateGroup.appendChild(taskItem);
        });
        
        timelineContent.appendChild(dateGroup);
    });
}

// View Management
function setView(view) {
    currentView = view;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Hide all views
    document.getElementById('kanbanBoard').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'none';
    document.getElementById('timelineView').style.display = 'none';
    
    // Show current view
    switch (view) {
        case 'kanban':
            document.getElementById('kanbanBoard').style.display = 'flex';
            break;
        case 'list':
            document.getElementById('listView').style.display = 'block';
            break;
        case 'calendar':
            document.getElementById('calendarView').style.display = 'block';
            break;
        case 'timeline':
            document.getElementById('timelineView').style.display = 'block';
            break;
    }
    
    renderTasks();
}

// Task Management Functions
function showCreateTaskModal() {
    document.getElementById('createTaskModal').classList.add('active');
    // Reset form
    document.getElementById('taskForm').reset();
}

function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const assignee = document.getElementById('taskAssignee').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!title) {
        showNotification('Please enter a task title', 'error');
        return;
    }
    
    // Get selected labels
    const labels = [];
    document.querySelectorAll('input[name="taskLabels"]:checked').forEach(checkbox => {
        labels.push(checkbox.value);
    });
    
    const newTask = {
        id: 'task' + Date.now(),
        title,
        description,
        status: 'todo',
        priority,
        assignee,
        dueDate,
        labels,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    closeModal('createTaskModal');
    showNotification('Task created successfully!', 'success');
}

function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTaskId = taskId;
    
    // Update modal content
    document.getElementById('taskDetailsTitle').textContent = task.title;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskAssignee').value = task.assignee;
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskDescriptionText').textContent = task.description || 'No description provided';
    
    // Load comments
    loadComments(taskId);
    
    // Show modal
    document.getElementById('taskDetailsModal').classList.add('active');
}

function loadComments(taskId) {
    const savedComments = localStorage.getItem(`comments_${taskId}`);
    const commentsList = document.getElementById('commentsList');
    
    if (savedComments) {
        comments[taskId] = JSON.parse(savedComments);
    } else {
        comments[taskId] = [];
    }
    
    commentsList.innerHTML = comments[taskId].map(comment => `
        <div class="comment">
            <div class="comment-author">
                ${comment.author}
                <span class="comment-time">${formatTime(comment.timestamp)}</span>
            </div>
            <div class="comment-text">${comment.content}</div>
        </div>
    `).join('');
}

function addComment() {
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) return;
    
    if (!comments[currentTaskId]) {
        comments[currentTaskId] = [];
    }
    
    const comment = {
        id: Date.now(),
        author: 'Daina116',
        content: commentText,
        timestamp: new Date().toISOString()
    };
    
    comments[currentTaskId].push(comment);
    localStorage.setItem(`comments_${currentTaskId}`, JSON.stringify(comments[currentTaskId]));
    
    loadComments(currentTaskId);
    document.getElementById('commentText').value = '';
    
    showNotification('Comment added!', 'success');
}

function updateTaskStatus() {
    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        task.status = document.getElementById('taskStatus').value;
        saveTasks();
        renderTasks();
        showNotification('Task status updated!', 'success');
    }
}

function updateTaskPriority() {
    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        task.priority = document.getElementById('taskPriority').value;
        saveTasks();
        renderTasks();
        showNotification('Task priority updated!', 'success');
    }
}

function updateTaskAssignee() {
    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        task.assignee = document.getElementById('taskAssignee').value;
        saveTasks();
        renderTasks();
        showNotification('Task assignee updated!', 'success');
    }
}

function updateTaskDueDate() {
    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        task.dueDate = document.getElementById('taskDueDate').value;
        saveTasks();
        renderTasks();
        showNotification('Task due date updated!', 'success');
    }
}

function editTask(taskId, event) {
    event.stopPropagation();
    showTaskDetails(taskId);
}

function deleteTask(taskId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        
        if (document.getElementById('taskDetailsModal').classList.contains('active')) {
            closeModal('taskDetailsModal');
        }
        
        showNotification('Task deleted successfully!', 'success');
    }
}

function addTaskToColumn(status) {
    // Set default status and show create modal
    showCreateTaskModal();
    // In a real app, you might pre-fill the status
}

// Filter and Search Functions
function filterTasks() {
    renderTasks();
}

function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Priority filter
    const priorityFilter = document.getElementById('priorityFilter').value;
    if (priorityFilter) {
        filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter) {
        filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Assignee filter
    const assigneeFilter = document.getElementById('assigneeFilter').value;
    if (assigneeFilter) {
        if (assigneeFilter === 'me') {
            filtered = filtered.filter(task => task.assignee === 'me');
        } else if (assigneeFilter === 'unassigned') {
            filtered = filtered.filter(task => !task.assignee);
        } else {
            filtered = filtered.filter(task => task.assignee === assigneeFilter);
        }
    }
    
    // Due date filter
    const dueDateFilter = document.getElementById('dueDateFilter').value;
    if (dueDateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            switch (dueDateFilter) {
                case 'overdue':
                    return dueDate < today;
                case 'today':
                    return dueDate.getTime() === today.getTime();
                case 'week':
                    const weekFromNow = new Date(today);
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return dueDate >= today && dueDate <= weekFromNow;
                case 'month':
                    const monthFromNow = new Date(today);
                    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                    return dueDate >= today && dueDate <= monthFromNow;
                default:
                    return true;
            }
        });
    }
    
    // Label filter
    const selectedLabels = [];
    document.querySelectorAll('.label-options input[type="checkbox"]:checked').forEach(checkbox => {
        selectedLabels.push(checkbox.value);
    });
    
    if (selectedLabels.length > 0) {
        filtered = filtered.filter(task => {
            if (!task.labels) return false;
            return selectedLabels.some(label => task.labels.includes(label));
        });
    }
    
    return filtered;
}

function searchTasks() {
    const searchTerm = document.getElementById('taskSearch').value.toLowerCase();
    
    if (!searchTerm) {
        renderTasks();
        return;
    }
    
    const filtered = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
    );
    
    // Render filtered tasks
    if (currentView === 'kanban') {
        renderFilteredKanban(filtered);
    } else {
        renderFilteredTasks(filtered);
    }
}

function renderFilteredKanban(filtered) {
    const columns = ['todo', 'in-progress', 'review', 'done'];
    
    columns.forEach(status => {
        const column = document.querySelector(`[data-status="${status}"]`);
        const content = column.querySelector('.column-content');
        const count = column.querySelector('.column-count');
        
        content.innerHTML = '';
        
        const columnTasks = filtered.filter(task => task.status === status);
        count.textContent = columnTasks.length;
        
        columnTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            content.appendChild(taskCard);
        });
    });
}

function renderFilteredTasks(filtered) {
    switch (currentView) {
        case 'list':
            renderFilteredList(filtered);
            break;
        case 'calendar':
            // Calendar view doesn't support filtering well
            showNotification('Calendar view does not support search', 'info');
            break;
        case 'timeline':
            renderFilteredTimeline(filtered);
            break;
    }
}

function renderFilteredList(filtered) {
    const tbody = document.getElementById('taskTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" value="${task.id}"></td>
            <td class="task-title-cell">
                <div>
                    <strong>${task.title}</strong>
                    ${task.labels && task.labels.length > 0 ? `
                        <div class="task-labels">
                            ${task.labels.map(label => `<span class="label-tag ${label}">${label}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </td>
            <td class="assignee-cell">
                ${getAssigneeDisplay(task.assignee)}
            </td>
            <td>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </td>
            <td>
                <span class="status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
            </td>
            <td>
                ${task.dueDate ? formatDate(task.dueDate) : 'No due date'}
            </td>
            <td>
                ${task.labels && task.labels.length > 0 ? task.labels.map(label => 
                    `<span class="label-tag ${label}">${label}</span>`
                ).join('') : 'None'}
            </td>
            <td>
                <div class="task-actions">
                    <button class="btn-icon" onclick="showTaskDetails('${task.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editTask('${task.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderFilteredTimeline(filtered) {
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = '';
    
    const sortedTasks = filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    const groupedTasks = {};
    sortedTasks.forEach(task => {
        const date = task.dueDate || 'no-date';
        if (!groupedTasks[date]) {
            groupedTasks[date] = [];
        }
        groupedTasks[date].push(task);
    });
    
    Object.keys(groupedTasks).forEach(date => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'timeline-group';
        
        const dateHeader = document.createElement('div');
        dateHeader.className = 'timeline-date';
        dateHeader.textContent = date === 'no-date' ? 'No Due Date' : formatDate(date);
        
        dateGroup.appendChild(dateHeader);
        
        groupedTasks[date].forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'timeline-item';
            
            const taskContent = document.createElement('div');
            taskContent.className = 'timeline-content-item';
            taskContent.onclick = () => showTaskDetails(task.id);
            
            const assigneeInfo = getAssigneeInfo(task.assignee);
            
            taskContent.innerHTML = `
                <div class="timeline-task-title">${task.title}</div>
                <div class="timeline-task-meta">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <span>•</span>
                    <span>${assigneeInfo.name}</span>
                    <span>•</span>
                    <span class="status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                </div>
            `;
            
            taskItem.appendChild(taskContent);
            dateGroup.appendChild(taskItem);
        });
        
        timelineContent.appendChild(dateGroup);
    });
}

// Statistics Functions
function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const overdueTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'done') return false;
        return new Date(task.dueDate) < new Date();
    }).length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;
}

// Utility Functions
function getAssigneeInfo(assignee) {
    const assignees = {
        'me': { name: 'Me', initial: 'Y', color: '#007bff' },
        'user1': { name: 'John Doe', initial: 'J', color: '#28a745' },
        'user2': { name: 'Jane Smith', initial: 'J', color: '#dc3545' }
    };
    
    return assignees[assignee] || { name: 'Unassigned', initial: 'U', color: '#6c757d' };
}

function getAssigneeDisplay(assignee) {
    const info = getAssigneeInfo(assignee);
    return `
        <div class="task-assignee">
            <div class="task-assignee-avatar" style="background: ${info.color}">
                ${info.initial}
            </div>
            <span>${info.name}</span>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    
    return date.toLocaleDateString();
}

function getDateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Calendar Navigation
function previousMonth() {
    // In a real app, this would navigate to previous month
    showNotification('Previous month navigation', 'info');
}

function nextMonth() {
    // In a real app, this would navigate to next month
    showNotification('Next month navigation', 'info');
}

// Toolbar Functions
function toggleGrouping() {
    showNotification('Toggle grouping', 'info');
}

function toggleSorting() {
    showNotification('Toggle sorting', 'info');
}

function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tasks.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Tasks exported successfully!', 'success');
}

function refreshTasks() {
    loadTasks();
    showNotification('Tasks refreshed!', 'success');
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#taskTableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// Modal Functions
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

// Add status badge styles
if (!document.querySelector('#status-badge-styles')) {
    const style = document.createElement('style');
    style.id = 'status-badge-styles';
    style.textContent = `
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: capitalize;
        }
        .status-badge.todo {
            background: #e3f2fd;
            color: #1565c0;
        }
        .status-badge.in-progress {
            background: #fff3e0;
            color: #ef6c00;
        }
        .status-badge.review {
            background: #f3e5f5;
            color: #7b1fa2;
        }
        .status-badge.done {
            background: #e8f5e8;
            color: #2e7d32;
        }
    `;
    document.head.appendChild(style);
}
