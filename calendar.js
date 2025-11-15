// Calendar JavaScript
let events = [];
let currentView = 'month';
let currentDate = new Date();
let selectedEventId = null;
let attendees = [];
let activeCalendars = ['personal', 'work', 'team'];

// Initialize calendar
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    renderCalendar();
    updateTodayInfo();
    updateUpcomingEvents();
    setupEventListeners();
});

// Load events from localStorage
function loadEvents() {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    } else {
        // Create default events
        events = [
            {
                id: 'event1',
                title: 'Team Meeting',
                calendar: 'work',
                startDate: '2024-11-15T09:00:00',
                endDate: '2024-11-15T10:00:00',
                location: 'Conference Room A',
                videoCall: 'https://meet.example.com/team-meeting',
                description: 'Weekly team sync to discuss project progress',
                reminder: 15,
                repeat: 'weekly',
                attendees: ['john.doe@example.com', 'jane.smith@example.com'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'event2',
                title: 'Project Review',
                calendar: 'work',
                startDate: '2024-11-15T14:00:00',
                endDate: '2024-11-15T15:30:00',
                location: 'Main Office',
                description: 'Quarterly project review with stakeholders',
                reminder: 60,
                attendees: ['manager@example.com'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'event3',
                title: 'Client Presentation',
                calendar: 'work',
                startDate: '2024-11-18T10:00:00',
                endDate: '2024-11-18T11:30:00',
                location: 'Client Office',
                description: 'Present new project proposal to client',
                reminder: 30,
                attendees: ['client@example.com'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'event4',
                title: 'Sprint Planning',
                calendar: 'team',
                startDate: '2024-11-20T15:00:00',
                endDate: '2024-11-20T17:00:00',
                location: 'Virtual',
                videoCall: 'https://meet.example.com/sprint-planning',
                description: 'Plan next sprint tasks and goals',
                reminder: 15,
                attendees: ['team@example.com'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'event5',
                title: 'Birthday Party',
                calendar: 'personal',
                startDate: '2024-11-22T18:00:00',
                endDate: '2024-11-22T22:00:00',
                location: 'Home',
                description: 'Friend\'s birthday celebration',
                reminder: 1440,
                attendees: ['friend@example.com'],
                createdAt: new Date().toISOString()
            }
        ];
        saveEvents();
    }
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    updateTodayInfo();
    updateUpcomingEvents();
}

// Setup event listeners
function setupEventListeners() {
    // Handle search
    document.getElementById('eventSearch').addEventListener('input', searchEvents);
    
    // Handle form submission
    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createEvent();
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

// Render calendar based on current view
function renderCalendar() {
    switch (currentView) {
        case 'month':
            renderMonthView();
            break;
        case 'week':
            renderWeekView();
            break;
        case 'day':
            renderDayView();
            break;
        case 'agenda':
            renderAgendaView();
            break;
    }
    
    updateViewTitle();
}

// Update view title
function updateViewTitle() {
    const titleElement = document.getElementById('currentViewTitle');
    
    switch (currentView) {
        case 'month':
            titleElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            break;
        case 'week':
            const weekStart = getWeekStart(currentDate);
            const weekEnd = getWeekEnd(currentDate);
            titleElement.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
            break;
        case 'day':
            titleElement.textContent = currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            break;
        case 'agenda':
            titleElement.textContent = 'Agenda';
            break;
    }
}

// Month View
function renderMonthView() {
    const grid = document.getElementById('monthGrid');
    grid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dayElement = createDayElement(new Date(year, month - 1, day), true);
        grid.appendChild(dayElement);
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(new Date(year, month, day), false);
        grid.appendChild(dayElement);
    }
    
    // Add next month days to fill grid
    const totalCells = grid.children.length - 7; // Subtract headers
    const remainingCells = 35 - totalCells; // 5 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(new Date(year, month + 1, day), true);
        grid.appendChild(dayElement);
    }
}

function createDayElement(date, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);
    
    // Add events for this day
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'calendar-day-events';
        
        dayEvents.slice(0, 3).forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `calendar-event ${event.calendar}`;
            eventElement.textContent = event.title;
            eventElement.onclick = (e) => {
                e.stopPropagation();
                showEventDetails(event.id);
            };
            eventsContainer.appendChild(eventElement);
        });
        
        if (dayEvents.length > 3) {
            const moreElement = document.createElement('div');
            moreElement.className = 'calendar-event';
            moreElement.textContent = `+${dayEvents.length - 3} more`;
            eventsContainer.appendChild(moreElement);
        }
        
        dayElement.appendChild(eventsContainer);
    }
    
    dayElement.onclick = () => showCreateEventModal(date);
    
    return dayElement;
}

// Week View
function renderWeekView() {
    const grid = document.getElementById('weekGrid');
    grid.innerHTML = '';
    
    // Add time header
    const timeHeader = document.createElement('div');
    timeHeader.className = 'week-time-header';
    grid.appendChild(timeHeader);
    
    // Add day headers
    const weekStart = getWeekStart(currentDate);
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        
        const header = document.createElement('div');
        header.className = 'week-day-header';
        header.innerHTML = `
            <div>${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div>${date.getDate()}</div>
        `;
        grid.appendChild(header);
    }
    
    // Add time slots
    for (let hour = 0; hour < 24; hour++) {
        // Time slot
        const timeSlot = document.createElement('div');
        timeSlot.className = 'week-time-slot';
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        grid.appendChild(timeSlot);
        
        // Day slots
        for (let day = 0; day < 7; day++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + day);
            date.setHours(hour, 0, 0, 0);
            
            const daySlot = document.createElement('div');
            daySlot.className = 'week-day-slot';
            daySlot.onclick = () => showCreateEventModal(date);
            
            // Add events for this time slot
            const slotEvents = getEventsForDateTime(date, hour);
            slotEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'week-event';
                eventElement.textContent = event.title;
                eventElement.onclick = (e) => {
                    e.stopPropagation();
                    showEventDetails(event.id);
                };
                daySlot.appendChild(eventElement);
            });
            
            grid.appendChild(daySlot);
        }
    }
}

// Day View
function renderDayView() {
    const grid = document.getElementById('dayGrid');
    grid.innerHTML = '';
    
    // Add time slots
    for (let hour = 0; hour < 24; hour++) {
        // Time slot
        const timeSlot = document.createElement('div');
        timeSlot.className = 'day-time-slot';
        timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        grid.appendChild(timeSlot);
        
        // Content slot
        const date = new Date(currentDate);
        date.setHours(hour, 0, 0, 0);
        
        const contentSlot = document.createElement('div');
        contentSlot.className = 'day-content-slot';
        contentSlot.onclick = () => showCreateEventModal(date);
        
        // Add events for this time slot
        const slotEvents = getEventsForDateTime(date, hour);
        slotEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'day-event';
            eventElement.innerHTML = `
                <div>${event.title}</div>
                <div style="font-size: 0.8rem; opacity: 0.8;">
                    ${formatTime(event.startDate)} - ${formatTime(event.endDate)}
                </div>
            `;
            eventElement.onclick = (e) => {
                e.stopPropagation();
                showEventDetails(event.id);
            };
            contentSlot.appendChild(eventElement);
        });
        
        grid.appendChild(contentSlot);
    }
}

// Agenda View
function renderAgendaView() {
    const agendaList = document.getElementById('agendaList');
    agendaList.innerHTML = '';
    
    // Get events for the next 30 days
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 30);
    
    const agendaEvents = events
        .filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= currentDate && eventDate <= endDate;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    // Group events by day
    const eventsByDay = {};
    agendaEvents.forEach(event => {
        const date = new Date(event.startDate).toDateString();
        if (!eventsByDay[date]) {
            eventsByDay[date] = [];
        }
        eventsByDay[date].push(event);
    });
    
    // Render events
    Object.keys(eventsByDay).forEach(dateString => {
        const date = new Date(dateString);
        const dayEvents = eventsByDay[dateString];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'agenda-day';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'agenda-day-header';
        dayHeader.textContent = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        dayElement.appendChild(dayHeader);
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'agenda-event';
            eventElement.onclick = () => showEventDetails(event.id);
            
            eventElement.innerHTML = `
                <div class="agenda-event-time">${formatTime(event.startDate)} - ${formatTime(event.endDate)}</div>
                <div class="agenda-event-content">
                    <div class="agenda-event-title">${event.title}</div>
                    <div class="agenda-event-details">
                        ${event.location ? `📍 ${event.location}` : ''}
                        ${event.videoCall ? `📹 Video call` : ''}
                    </div>
                </div>
            `;
            
            dayElement.appendChild(eventElement);
        });
        
        agendaList.appendChild(dayElement);
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
    document.getElementById('monthView').style.display = 'none';
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('dayView').style.display = 'none';
    document.getElementById('agendaView').style.display = 'none';
    
    // Show current view
    switch (view) {
        case 'month':
            document.getElementById('monthView').style.display = 'block';
            break;
        case 'week':
            document.getElementById('weekView').style.display = 'block';
            break;
        case 'day':
            document.getElementById('dayView').style.display = 'block';
            break;
        case 'agenda':
            document.getElementById('agendaView').style.display = 'block';
            break;
    }
    
    renderCalendar();
}

// Navigation Functions
function previousView() {
    switch (currentView) {
        case 'month':
            currentDate.setMonth(currentDate.getMonth() - 1);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() - 7);
            break;
        case 'day':
            currentDate.setDate(currentDate.getDate() - 1);
            break;
        case 'agenda':
            currentDate.setDate(currentDate.getDate() - 7);
            break;
    }
    renderCalendar();
}

function nextView() {
    switch (currentView) {
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
        case 'day':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
        case 'agenda':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
    }
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

// Event Management Functions
function showCreateEventModal(date = null) {
    document.getElementById('createEventModal').classList.add('active');
    
    // Reset form
    document.getElementById('eventForm').reset();
    attendees = [];
    updateAttendeesList();
    
    // Set default date/time
    if (date) {
        const startDate = new Date(date);
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(10, 0, 0, 0);
        
        document.getElementById('eventStartDate').value = formatDateTimeLocal(startDate);
        document.getElementById('eventEndDate').value = formatDateTimeLocal(endDate);
    } else {
        const now = new Date();
        const start = new Date(now);
        start.setHours(now.getHours() + 1, 0, 0, 0);
        const end = new Date(now);
        end.setHours(now.getHours() + 2, 0, 0, 0);
        
        document.getElementById('eventStartDate').value = formatDateTimeLocal(start);
        document.getElementById('eventEndDate').value = formatDateTimeLocal(end);
    }
}

function createEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const calendar = document.getElementById('eventCalendar').value;
    const startDate = document.getElementById('eventStartDate').value;
    const endDate = document.getElementById('eventEndDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const videoCall = document.getElementById('eventVideoCall').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const reminder = document.getElementById('eventReminder').value;
    const repeat = document.getElementById('eventRepeat').value;
    
    if (!title || !startDate || !endDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        showNotification('End time must be after start time', 'error');
        return;
    }
    
    const newEvent = {
        id: 'event' + Date.now(),
        title,
        calendar,
        startDate,
        endDate,
        location,
        videoCall,
        description,
        reminder: reminder ? parseInt(reminder) : null,
        repeat: repeat !== 'none' ? repeat : null,
        attendees: [...attendees],
        createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    saveEvents();
    renderCalendar();
    
    closeModal('createEventModal');
    showNotification('Event created successfully!', 'success');
}

function showEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    selectedEventId = eventId;
    
    // Update modal content
    document.getElementById('eventDetailsTitle').textContent = event.title;
    document.getElementById('eventCalendarType').textContent = event.calendar.charAt(0).toUpperCase() + event.calendar.slice(1);
    document.getElementById('eventStartDateTime').textContent = formatDateTime(event.startDate);
    document.getElementById('eventEndDateTime').textContent = formatDateTime(event.endDate);
    document.getElementById('eventLocationText').textContent = event.location || 'No location';
    
    const videoCallLink = document.getElementById('eventVideoCallLink');
    if (event.videoCall) {
        videoCallLink.href = event.videoCall;
        videoCallLink.style.display = 'block';
    } else {
        videoCallLink.style.display = 'none';
    }
    
    document.getElementById('eventDescriptionText').textContent = event.description || 'No description';
    
    // Update attendees list
    const attendeesList = document.getElementById('eventAttendeesList');
    attendeesList.innerHTML = '';
    
    if (event.attendees && event.attendees.length > 0) {
        event.attendees.forEach(email => {
            const attendeeCard = document.createElement('div');
            attendeeCard.className = 'attendee-card';
            attendeeCard.innerHTML = `
                <div class="attendee-avatar">${getInitials(email)}</div>
                <div class="attendee-info">
                    <div class="attendee-name">${email.split('@')[0]}</div>
                    <div class="attendee-email">${email}</div>
                </div>
            `;
            attendeesList.appendChild(attendeeCard);
        });
    } else {
        attendeesList.innerHTML = '<p>No attendees</p>';
    }
    
    // Show modal
    document.getElementById('eventDetailsModal').classList.add('active');
}

function editEvent() {
    const event = events.find(e => e.id === selectedEventId);
    if (!event) return;
    
    closeModal('eventDetailsModal');
    showCreateEventModal();
    
    // Fill form with event data
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventCalendar').value = event.calendar;
    document.getElementById('eventStartDate').value = event.startDate;
    document.getElementById('eventEndDate').value = event.endDate;
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventVideoCall').value = event.videoCall || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventReminder').value = event.reminder || '';
    document.getElementById('eventRepeat').value = event.repeat || 'none';
    
    attendees = event.attendees || [];
    updateAttendeesList();
}

function deleteEvent() {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== selectedEventId);
        saveEvents();
        renderCalendar();
        
        closeModal('eventDetailsModal');
        showNotification('Event deleted successfully!', 'success');
    }
}

// Attendee Management
function addAttendee() {
    const emailInput = document.getElementById('eventAttendees');
    const email = emailInput.value.trim();
    
    if (!email) return;
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (attendees.includes(email)) {
        showNotification('This attendee is already added', 'error');
        return;
    }
    
    attendees.push(email);
    emailInput.value = '';
    updateAttendeesList();
}

function updateAttendeesList() {
    const attendeesList = document.getElementById('attendeesList');
    attendeesList.innerHTML = '';
    
    attendees.forEach(email => {
        const tag = document.createElement('div');
        tag.className = 'attendee-tag';
        tag.innerHTML = `
            ${email}
            <span class="remove" onclick="removeAttendee('${email}')">&times;</span>
        `;
        attendeesList.appendChild(tag);
    });
}

function removeAttendee(email) {
    attendees = attendees.filter(e => e !== email);
    updateAttendeesList();
}

// Calendar Management
function toggleCalendar(calendarType) {
    const index = activeCalendars.indexOf(calendarType);
    if (index > -1) {
        activeCalendars.splice(index, 1);
    } else {
        activeCalendars.push(calendarType);
    }
    renderCalendar();
}

// Search Functions
function searchEvents() {
    const searchTerm = document.getElementById('eventSearch').value.toLowerCase();
    
    if (!searchTerm) {
        renderCalendar();
        return;
    }
    
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        (event.description && event.description.toLowerCase().includes(searchTerm)) ||
        (event.location && event.location.toLowerCase().includes(searchTerm))
    );
    
    // Render filtered events (simplified for now)
    renderFilteredEvents(filteredEvents);
}

function renderFilteredEvents(filteredEvents) {
    // This is a simplified version - in a real app, you'd want to filter by date range
    showNotification(`Found ${filteredEvents.length} events matching "${document.getElementById('eventSearch').value}"`, 'info');
}

// Utility Functions
function getEventsForDate(date) {
    return events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === date.toDateString() && 
               activeCalendars.includes(event.calendar);
    });
}

function getEventsForDateTime(date, hour) {
    return events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(date);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        
        return eventStart < slotEnd && eventEnd > slotStart && 
               activeCalendars.includes(event.calendar);
    });
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitials(email) {
    const name = email.split('@')[0];
    const parts = name.split('.');
    if (parts.length >= 2) {
        return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Update Sidebar Information
function updateTodayInfo() {
    const today = new Date();
    const todayDateElement = document.getElementById('todayDate');
    todayDateElement.textContent = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const todayEvents = getEventsForDate(today);
    const todayEventsElement = document.getElementById('todayEvents');
    
    if (todayEvents.length === 0) {
        todayEventsElement.innerHTML = '<p>No events today</p>';
    } else {
        todayEventsElement.innerHTML = '';
        todayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.onclick = () => showEventDetails(event.id);
            
            eventElement.innerHTML = `
                <div class="event-time">${formatTime(event.startDate)}</div>
                <div class="event-title">${event.title}</div>
            `;
            
            todayEventsElement.appendChild(eventElement);
        });
    }
}

function updateUpcomingEvents() {
    const today = new Date();
    const upcomingDate = new Date(today);
    upcomingDate.setDate(today.getDate() + 7);
    
    const upcomingEvents = events
        .filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate > today && eventDate <= upcomingDate && 
                   activeCalendars.includes(event.calendar);
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);
    
    const upcomingEventsElement = document.getElementById('upcomingEvents');
    
    if (upcomingEvents.length === 0) {
        upcomingEventsElement.innerHTML = '<p>No upcoming events</p>';
    } else {
        upcomingEventsElement.innerHTML = '';
        upcomingEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.onclick = () => showEventDetails(event.id);
            
            const eventDate = new Date(event.startDate);
            
            eventElement.innerHTML = `
                <div class="event-date">${formatDate(eventDate)}</div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${formatTime(event.startDate)}</div>
                </div>
            `;
            
            upcomingEventsElement.appendChild(eventElement);
        });
    }
}

// Mini Calendar Functions
function toggleMiniCalendar() {
    const miniCalendar = document.getElementById('miniCalendar');
    miniCalendar.style.display = miniCalendar.style.display === 'none' ? 'block' : 'none';
    
    if (miniCalendar.style.display === 'block') {
        renderMiniCalendar();
    }
}

function renderMiniCalendar() {
    const grid = document.getElementById('miniCalendarGrid');
    const title = document.getElementById('miniCalendarTitle');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    title.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    grid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'mini-calendar-day';
        header.style.fontWeight = 'bold';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dayElement = document.createElement('div');
        dayElement.className = 'mini-calendar-day other-month';
        dayElement.textContent = day;
        grid.appendChild(dayElement);
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'mini-calendar-day';
        
        const date = new Date(year, month, day);
        if (date.toDateString() === new Date().toDateString()) {
            dayElement.classList.add('today');
        }
        
        dayElement.textContent = day;
        dayElement.onclick = () => {
            currentDate = date;
            renderCalendar();
            toggleMiniCalendar();
        };
        
        grid.appendChild(dayElement);
    }
    
    // Add next month days to fill grid
    const totalCells = grid.children.length - 7; // Subtract headers
    const remainingCells = 35 - totalCells; // 5 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'mini-calendar-day other-month';
        dayElement.textContent = day;
        grid.appendChild(dayElement);
    }
}

function previousMiniMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderMiniCalendar();
}

function nextMiniMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderMiniCalendar();
}

// Toolbar Functions
function printCalendar() {
    window.print();
}

function exportCalendar() {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'calendar-events.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Calendar exported successfully!', 'success');
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

// Add calendar event styles dynamically
if (!document.querySelector('#calendar-event-styles')) {
    const style = document.createElement('style');
    style.id = 'calendar-event-styles';
    style.textContent = `
        .calendar-event {
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .calendar-event:hover {
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);
}
