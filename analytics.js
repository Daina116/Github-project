// Analytics Dashboard JavaScript
class AnalyticsDashboard {
    constructor() {
        this.currentDateRange = 30;
        this.currentFilters = {
            users: true,
            projects: true,
            tasks: true,
            files: true,
            meetings: true
        };
        this.charts = {};
        this.reports = [];
        this.init();
    }

    init() {
        this.loadData();
        this.initializeCharts();
        this.updateOverviewStats();
        this.renderTopPerformers();
        this.renderActivityFeed();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    loadData() {
        // Load analytics data from localStorage
        const savedData = localStorage.getItem('analyticsData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.analyticsData = data;
        } else {
            // Initialize with sample data
            this.analyticsData = this.generateSampleData();
            this.saveData();
        }

        // Load reports
        const savedReports = localStorage.getItem('analyticsReports');
        if (savedReports) {
            this.reports = JSON.parse(savedReports);
        } else {
            this.reports = this.generateSampleReports();
            this.saveReports();
        }
    }

    saveData() {
        localStorage.setItem('analyticsData', JSON.stringify(this.analyticsData));
    }

    saveReports() {
        localStorage.setItem('analyticsReports', JSON.stringify(this.reports));
    }

    generateSampleData() {
        const now = Date.now();
        const days = this.currentDateRange;
        
        return {
            users: {
                total: 1247,
                active: 892,
                daily: Array.from({length: days}, (_, i) => ({
                    date: new Date(now - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    active: Math.floor(Math.random() * 200) + 700,
                    new: Math.floor(Math.random() * 20) + 5
                })),
                growth: 12.5
            },
            projects: {
                total: 156,
                completed: 89,
                inProgress: 45,
                onHold: 22,
                timeline: Array.from({length: days}, (_, i) => ({
                    date: new Date(now - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    created: Math.floor(Math.random() * 5) + 1,
                    completed: Math.floor(Math.random() * 3) + 0
                }))
            },
            tasks: {
                total: 3421,
                completed: 2891,
                inProgress: 430,
                todo: 100,
                daily: Array.from({length: days}, (_, i) => ({
                    date: new Date(now - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    completed: Math.floor(Math.random() * 50) + 80,
                    created: Math.floor(Math.random() * 30) + 40
                }))
            },
            files: {
                total: 8456,
                uploaded: 1245,
                shared: 3421,
                daily: Array.from({length: days}, (_, i) => ({
                    date: new Date(now - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    uploaded: Math.floor(Math.random() * 30) + 20,
                    shared: Math.floor(Math.random() * 40) + 30
                }))
            },
            meetings: {
                total: 892,
                completed: 845,
                scheduled: 47,
                daily: Array.from({length: days}, (_, i) => ({
                    date: new Date(now - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    meetings: Math.floor(Math.random() * 10) + 5
                }))
            },
            performance: {
                serverResponse: 245,
                uptime: 99.9,
                errorRate: 0.02,
                loadTime: 1.2
            },
            features: {
                chat: 85,
                video: 72,
                files: 68,
                tasks: 90,
                calendar: 45,
                whiteboard: 38
            },
            devices: {
                desktop: 65,
                mobile: 25,
                tablet: 10
            }
        };
    }

    generateSampleReports() {
        return [
            {
                id: 'monthly-performance',
                name: 'Monthly Performance Report',
                type: 'performance',
                date: '2024-11-01',
                format: 'pdf',
                sections: ['overview', 'user-analytics', 'project-statistics']
            },
            {
                id: 'user-engagement',
                name: 'User Engagement Analysis',
                type: 'engagement',
                date: '2024-10-28',
                format: 'excel',
                sections: ['overview', 'user-analytics', 'performance-metrics']
            },
            {
                id: 'project-status',
                name: 'Project Status Summary',
                type: 'projects',
                date: '2024-10-25',
                format: 'csv',
                sections: ['overview', 'project-statistics', 'financial-data']
            }
        ];
    }

    initializeCharts() {
        this.createUserActivityChart();
        this.createProjectProgressChart();
        this.createUserGrowthChart();
        this.createUserRetentionChart();
        this.createProjectTimelineChart();
        this.createTeamPerformanceChart();
        this.createResourceUsageChart();
    }

    createUserActivityChart() {
        const ctx = document.getElementById('userActivityChart');
        if (!ctx) return;

        const data = this.analyticsData.users.daily;
        const labels = data.map(d => this.formatDate(d.date));
        const activeUsers = data.map(d => d.active);
        const newUsers = data.map(d => d.new);

        // Simple chart implementation using CSS
        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="simple-chart">
                <div class="chart-legend">
                    <span class="legend-item">
                        <span class="legend-color" style="background: #007bff;"></span>
                        Active Users
                    </span>
                    <span class="legend-item">
                        <span class="legend-color" style="background: #28a745;"></span>
                        New Users
                    </span>
                </div>
                <div class="chart-bars">
                    ${data.map(d => `
                        <div class="bar-group">
                            <div class="bar" style="height: ${(d.active / 1000) * 100}%; background: #007bff;" title="Active: ${d.active}"></div>
                            <div class="bar" style="height: ${(d.new / 30) * 100}%; background: #28a745;" title="New: ${d.new}"></div>
                        </div>
                    `).join('')}
                </div>
                <div class="chart-labels">
                    ${labels.map(label => `<span class="label">${label}</span>`).join('')}
                </div>
            </div>
        `;
    }

    createProjectProgressChart() {
        const ctx = document.getElementById('projectProgressChart');
        if (!ctx) return;

        const data = this.analyticsData.projects.timeline;
        const labels = data.map(d => this.formatDate(d.date));
        const created = data.map(d => d.created);
        const completed = data.map(d => d.completed);

        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="simple-chart">
                <div class="chart-legend">
                    <span class="legend-item">
                        <span class="legend-color" style="background: #ffc107;"></span>
                        Created
                    </span>
                    <span class="legend-item">
                        <span class="legend-color" style="background: #28a745;"></span>
                        Completed
                    </span>
                </div>
                <div class="chart-bars">
                    ${data.map(d => `
                        <div class="bar-group">
                            <div class="bar" style="height: ${(d.created / 6) * 100}%; background: #ffc107;" title="Created: ${d.created}"></div>
                            <div class="bar" style="height: ${(d.completed / 4) * 100}%; background: #28a745;" title="Completed: ${d.completed}"></div>
                        </div>
                    `).join('')}
                </div>
                <div class="chart-labels">
                    ${labels.map(label => `<span class="label">${label}</span>`).join('')}
                </div>
            </div>
        `;
    }

    createUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        const data = this.analyticsData.users.daily;
        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="growth-chart">
                <div class="growth-line">
                    ${data.map((d, i) => {
                        const height = (d.active / 1000) * 100;
                        const prevHeight = i > 0 ? (data[i-1].active / 1000) * 100 : height;
                        return `
                            <div class="growth-point" style="left: ${(i / data.length) * 100}%; bottom: ${height}%;" title="${d.date}: ${d.active} users">
                                <div class="growth-bar" style="height: ${height}px;"></div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    createUserRetentionChart() {
        const ctx = document.getElementById('userRetentionChart');
        if (!ctx) return;

        const retentionData = [
            { day: 'Day 1', rate: 100 },
            { day: 'Day 7', rate: 85 },
            { day: 'Day 30', rate: 68 },
            { day: 'Day 90', rate: 45 },
            { day: 'Day 180', rate: 32 },
            { day: 'Day 365', rate: 25 }
        ];

        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="retention-chart">
                <div class="retention-bars">
                    ${retentionData.map(d => `
                        <div class="retention-bar-container">
                            <div class="retention-bar" style="height: ${d.rate}%;">
                                <span class="retention-value">${d.rate}%</span>
                            </div>
                            <span class="retention-label">${d.day}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createProjectTimelineChart() {
        const ctx = document.getElementById('projectTimelineChart');
        if (!ctx) return;

        const data = this.analyticsData.projects.timeline;
        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="timeline-chart">
                <div class="timeline-bars">
                    ${data.map(d => `
                        <div class="timeline-bar-container">
                            <div class="timeline-bar created" style="height: ${(d.created / 6) * 100}%;" title="Created: ${d.created}"></div>
                            <div class="timeline-bar completed" style="height: ${(d.completed / 4) * 100}%;" title="Completed: ${d.completed}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createTeamPerformanceChart() {
        const ctx = document.getElementById('teamPerformanceChart');
        if (!ctx) return;

        const teams = [
            { name: 'Team A', score: 95 },
            { name: 'Team B', score: 88 },
            { name: 'Team C', score: 82 },
            { name: 'Team D', score: 78 },
            { name: 'Team E', score: 71 }
        ];

        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="team-performance-chart">
                <div class="team-bars">
                    ${teams.map(team => `
                        <div class="team-bar-container">
                            <div class="team-info">
                                <span class="team-name">${team.name}</span>
                                <span class="team-score">${team.score}</span>
                            </div>
                            <div class="team-bar" style="width: ${team.score}%;"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createResourceUsageChart() {
        const ctx = document.getElementById('resourceUsageChart');
        if (!ctx) return;

        const resources = [
            { name: 'CPU', usage: 65 },
            { name: 'Memory', usage: 78 },
            { name: 'Storage', usage: 45 },
            { name: 'Network', usage: 32 }
        ];

        const chartContainer = ctx.parentElement;
        chartContainer.innerHTML = `
            <div class="resource-chart">
                <div class="resource-bars">
                    ${resources.map(resource => `
                        <div class="resource-bar-container">
                            <span class="resource-name">${resource.name}</span>
                            <div class="resource-bar-wrapper">
                                <div class="resource-bar" style="width: ${resource.usage}%;"></div>
                                <span class="resource-usage">${resource.usage}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateOverviewStats() {
        // Update overview stats
        document.getElementById('totalUsers').textContent = this.analyticsData.users.total.toLocaleString();
        document.getElementById('activeProjects').textContent = this.analyticsData.projects.inProgress;
        document.getElementById('totalHours').textContent = '12,456';
        document.getElementById('growthRate').textContent = `${this.analyticsData.users.growth}%`;

        // Update main stats cards
        document.getElementById('activeUsersCount').textContent = this.analyticsData.users.active.toLocaleString();
        document.getElementById('projectsCompletedCount').textContent = this.analyticsData.projects.completed;
        document.getElementById('tasksDoneCount').textContent = this.analyticsData.tasks.completed.toLocaleString();
        document.getElementById('filesSharedCount').textContent = this.analyticsData.files.shared.toLocaleString();

        // Update detailed metrics
        document.getElementById('dailyActiveUsers').textContent = this.analyticsData.users.daily[this.analyticsData.users.daily.length - 1].active.toLocaleString();
        document.getElementById('weeklyActiveUsers').textContent = Math.floor(this.analyticsData.users.active * 0.8).toLocaleString();
        document.getElementById('monthlyActiveUsers').textContent = this.analyticsData.users.active.toLocaleString();
        document.getElementById('avgSessionTime').textContent = '45 min';

        // Update project stats
        document.getElementById('totalProjects').textContent = this.analyticsData.projects.total;
        document.getElementById('completedProjects').textContent = this.analyticsData.projects.completed;
        document.getElementById('inProgressProjects').textContent = this.analyticsData.projects.inProgress;
        document.getElementById('onHoldProjects').textContent = this.analyticsData.projects.onHold;
    }

    renderTopPerformers() {
        const performers = [
            { name: 'John Doe', score: 95, avatar: 'fa-user' },
            { name: 'Jane Smith', score: 88, avatar: 'fa-user' },
            { name: 'Mike Johnson', score: 82, avatar: 'fa-user' },
            { name: 'Sarah Williams', score: 78, avatar: 'fa-user' },
            { name: 'Tom Brown', score: 75, avatar: 'fa-user' }
        ];

        const container = document.getElementById('topPerformers');
        container.innerHTML = performers.map(performer => `
            <div class="performer-item">
                <div class="performer-avatar">
                    <i class="fas ${performer.avatar}"></i>
                </div>
                <div class="performer-info">
                    <span class="performer-name">${performer.name}</span>
                    <span class="performer-score">${performer.score} points</span>
                </div>
            </div>
        `).join('');
    }

    renderActivityFeed() {
        const activities = [
            { type: 'user-plus', text: 'New user registered', time: '2 hours ago', color: 'success' },
            { type: 'tasks', text: 'Project milestone completed', time: '5 hours ago', color: 'primary' },
            { type: 'video', text: 'Team meeting ended', time: '1 day ago', color: 'info' },
            { type: 'file-upload', text: 'Large file uploaded', time: '2 days ago', color: 'warning' },
            { type: 'project-diagram', text: 'New project created', time: '3 days ago', color: 'success' }
        ];

        const container = document.getElementById('activityFeed');
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${activity.type} text-${activity.color}"></i>
                <div class="activity-content">
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    renderReportsList() {
        const container = document.getElementById('reportsList');
        if (!container) return;

        container.innerHTML = this.reports.map(report => `
            <div class="report-item">
                <div class="report-info">
                    <h4>${report.name}</h4>
                    <p>Generated on ${this.formatDate(report.date)}</p>
                </div>
                <div class="report-actions">
                    <button class="btn btn-sm btn-secondary" onclick="analytics.viewReport('${report.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="analytics.downloadReport('${report.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Date range selector
        document.getElementById('dateRange').addEventListener('change', (e) => {
            this.currentDateRange = parseInt(e.target.value);
            this.updateDateRange();
        });

        // Filter checkboxes
        ['users', 'projects', 'tasks', 'files', 'meetings'].forEach(filter => {
            const checkbox = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.currentFilters[filter] = e.target.checked;
                    this.applyFilters();
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').style.display = 'none';
            }
        });
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // Update every 30 seconds
    }

    updateRealTimeData() {
        // Update active users
        const activeUsers = document.getElementById('activeUsersCount');
        if (activeUsers) {
            const current = parseInt(activeUsers.textContent.replace(/,/g, ''));
            const change = Math.floor(Math.random() * 20) - 10;
            activeUsers.textContent = (current + change).toLocaleString();
        }

        // Update activity feed
        this.addNewActivity();
    }

    addNewActivity() {
        const activities = [
            { type: 'user', text: 'User logged in', color: 'info' },
            { type: 'file', text: 'File shared', color: 'success' },
            { type: 'comment', text: 'New comment added', color: 'primary' },
            { type: 'task', text: 'Task completed', color: 'success' }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        const container = document.getElementById('activityFeed');
        if (container) {
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
                <i class="fas fa-${activity.type} text-${activity.color}"></i>
                <div class="activity-content">
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">Just now</span>
                </div>
            `;
            container.insertBefore(newActivity, container.firstChild);
            
            // Remove oldest activity if more than 5
            while (container.children.length > 5) {
                container.removeChild(container.lastChild);
            }
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    applyFilters() {
        // Apply filters to charts and data
        this.initializeCharts();
        this.showNotification('Filters applied successfully', 'success');
    }

    updateDateRange() {
        // Regenerate data for new date range
        this.analyticsData = this.generateSampleData();
        this.saveData();
        this.initializeCharts();
        this.updateOverviewStats();
        this.showNotification('Date range updated', 'success');
    }

    switchAnalyticsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Initialize charts for the specific tab if needed
        if (tabName === 'users') {
            this.createUserGrowthChart();
            this.createUserRetentionChart();
        } else if (tabName === 'projects') {
            this.createProjectTimelineChart();
            this.createTeamPerformanceChart();
        } else if (tabName === 'performance') {
            this.createResourceUsageChart();
        } else if (tabName === 'reports') {
            this.renderReportsList();
        }
    }

    refreshChart(chartType) {
        this.showNotification('Chart refreshed', 'success');
        // In a real application, this would fetch fresh data
        this.initializeCharts();
    }

    downloadChart(chartType) {
        this.showNotification('Chart downloaded', 'success');
        // In a real application, this would download the chart as an image
    }

    exportReport() {
        this.showNotification('Report exported successfully', 'success');
        // In a real application, this would generate and download a comprehensive report
    }

    generateReport() {
        document.getElementById('generateReportModal').classList.add('active');
    }

    createReport() {
        const reportName = document.getElementById('reportName').value;
        const reportType = document.getElementById('reportType').value;
        const reportFormat = document.getElementById('reportFormat').value;
        const dateRange = document.getElementById('reportDateRange').value;

        if (!reportName) {
            this.showNotification('Please enter a report name', 'error');
            return;
        }

        const newReport = {
            id: reportName.toLowerCase().replace(/\s+/g, '-'),
            name: reportName,
            type: reportType,
            date: new Date().toISOString().split('T')[0],
            format: reportFormat,
            dateRange: dateRange
        };

        this.reports.unshift(newReport);
        this.saveReports();
        this.renderReportsList();
        this.closeModal('generateReportModal');
        this.showNotification('Report generated successfully', 'success');

        // Clear form
        document.getElementById('reportName').value = '';
        document.getElementById('reportType').value = 'performance';
        document.getElementById('reportFormat').value = 'pdf';
        document.getElementById('reportDateRange').value = '30';
    }

    viewReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            this.showNotification(`Viewing report: ${report.name}`, 'info');
            // In a real application, this would open the report viewer
        }
    }

    downloadReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            this.showNotification(`Downloading report: ${report.name}`, 'success');
            // In a real application, this would download the report file
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

// Global functions for HTML onclick handlers
let analytics;

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function updateDateRange() {
    analytics.updateDateRange();
}

function applyFilters() {
    analytics.applyFilters();
}

function switchAnalyticsTab(tabName) {
    analytics.switchAnalyticsTab(tabName);
}

function refreshChart(chartType) {
    analytics.refreshChart(chartType);
}

function downloadChart(chartType) {
    analytics.downloadChart(chartType);
}

function exportReport() {
    analytics.exportReport();
}

function generateReport() {
    analytics.generateReport();
}

function createReport() {
    analytics.createReport();
}

function viewReport(reportId) {
    analytics.viewReport(reportId);
}

function downloadReport(reportId) {
    analytics.downloadReport(reportId);
}

function closeModal(modalId) {
    analytics.closeModal(modalId);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize analytics dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    analytics = new AnalyticsDashboard();
});

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 3000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notification-success {
    background: #28a745;
}

.notification-error {
    background: #dc3545;
}

.notification-info {
    background: #17a2b8;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
}

.notification-close:hover {
    opacity: 0.8;
}

/* Simple Chart Styles */
.simple-chart {
    padding: 1rem;
}

.chart-legend {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    height: 200px;
    margin-bottom: 0.5rem;
}

.bar-group {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 100%;
}

.bar {
    flex: 1;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
    transition: height 0.3s ease;
}

.chart-labels {
    display: flex;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #666;
    overflow-x: auto;
}

.label {
    flex: 1;
    text-align: center;
    min-width: 30px;
}

/* Growth Chart Styles */
.growth-chart {
    position: relative;
    height: 200px;
    padding: 1rem;
}

.growth-line {
    position: relative;
    height: 100%;
}

.growth-point {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #007bff;
    border-radius: 50%;
    transform: translateX(-50%);
}

.growth-bar {
    position: absolute;
    width: 2px;
    background: #007bff;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

/* Retention Chart Styles */
.retention-chart {
    padding: 1rem;
}

.retention-bars {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    height: 200px;
}

.retention-bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
}

.retention-bar {
    flex: 1;
    width: 40px;
    background: linear-gradient(to top, #007bff, #0056b3);
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0.5rem;
    min-height: 20px;
}

.retention-value {
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
}

.retention-label {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #666;
    text-align: center;
}

/* Timeline Chart Styles */
.timeline-chart {
    padding: 1rem;
}

.timeline-bars {
    display: flex;
    gap: 0.5rem;
    height: 150px;
    align-items: flex-end;
}

.timeline-bar-container {
    flex: 1;
    display: flex;
    gap: 2px;
    height: 100%;
    align-items: flex-end;
}

.timeline-bar {
    flex: 1;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
}

.timeline-bar.created {
    background: #ffc107;
}

.timeline-bar.completed {
    background: #28a745;
}

/* Team Performance Chart Styles */
.team-performance-chart {
    padding: 1rem;
}

.team-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.team-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.team-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.team-name {
    font-weight: 500;
    color: #333;
}

.team-score {
    font-weight: 600;
    color: #007bff;
}

.team-bar {
    height: 8px;
    background: linear-gradient(to right, #007bff, #0056b3);
    border-radius: 4px;
}

/* Resource Chart Styles */
.resource-chart {
    padding: 1rem;
}

.resource-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.resource-bar-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.resource-name {
    min-width: 80px;
    font-weight: 500;
    color: #333;
}

.resource-bar-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.resource-bar {
    height: 8px;
    background: linear-gradient(to right, #28a745, #20c997);
    border-radius: 4px;
}

.resource-usage {
    font-weight: 600;
    color: #28a745;
    min-width: 40px;
    text-align: right;
}
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
