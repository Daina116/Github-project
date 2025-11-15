// Help Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeHelp();
});

function initializeHelp() {
    updateSidebarUser();
    setupSearch();
    setupAccordion();
    loadHelpContent();
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('helpSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            performHelpSearch(query);
        });
    }
}

// Perform help search
function performHelpSearch(query) {
    const helpSections = document.querySelectorAll('.help-section');
    const searchResults = document.getElementById('searchResults');
    
    if (query.length < 2) {
        searchResults.style.display = 'none';
        helpSections.forEach(section => section.style.display = 'block');
        return;
    }
    
    searchResults.style.display = 'block';
    let results = [];
    
    // Search through all help content
    helpSections.forEach(section => {
        const title = section.querySelector('h3').textContent.toLowerCase();
        const content = section.textContent.toLowerCase();
        
        if (title.includes(query) || content.includes(query)) {
            results.push({
                title: section.querySelector('h3').textContent,
                section: section.id,
                excerpt: getSearchExcerpt(content, query)
            });
        }
    });
    
    // Display search results
    if (results.length > 0) {
        searchResults.innerHTML = `
            <h4>Search Results (${results.length})</h4>
            ${results.map(result => `
                <div class="search-result-item" onclick="scrollToSection('${result.section}')">
                    <h5>${highlightSearchTerm(result.title, query)}</h5>
                    <p>${highlightSearchTerm(result.excerpt, query)}</p>
                </div>
            `).join('')}
        `;
        
        // Hide all sections when searching
        helpSections.forEach(section => section.style.display = 'none');
    } else {
        searchResults.innerHTML = `
            <h4>Search Results</h4>
            <p>No results found for "${query}". Try different keywords or browse the sections below.</p>
        `;
    }
}

// Get search excerpt
function getSearchExcerpt(content, query, maxLength = 150) {
    const index = content.indexOf(query);
    if (index === -1) return content.substring(0, maxLength) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    let excerpt = content.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    return excerpt;
}

// Highlight search term
function highlightSearchTerm(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Hide search results
        document.getElementById('searchResults').style.display = 'none';
        
        // Clear search
        document.getElementById('helpSearch').value = '';
        
        // Show all sections
        document.querySelectorAll('.help-section').forEach(sec => sec.style.display = 'block');
    }
}

// Setup accordion for FAQ
function setupAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isOpen = answer.style.display === 'block';
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.querySelector('.faq-answer').style.display = 'none';
                faqItem.querySelector('.faq-question i').className = 'fas fa-chevron-down';
            });
            
            // Open clicked item if it wasn't open
            if (!isOpen) {
                answer.style.display = 'block';
                question.querySelector('i').className = 'fas fa-chevron-up';
            }
        });
    });
}

// Load help content dynamically
function loadHelpContent() {
    // This could be loaded from an API in a real application
    // For now, content is already in the HTML
}

// Quick help functions
function showGettingStarted() {
    scrollToSection('getting-started');
}

function showWorkspacesHelp() {
    scrollToSection('workspaces');
}

function showCollaborationHelp() {
    scrollToSection('collaboration');
}

function showFeaturesHelp() {
    scrollToSection('features');
}

function showTroubleshootingHelp() {
    scrollToSection('troubleshooting');
}

function showFAQ() {
    scrollToSection('faq');
}

// Contact support
function showSupportModal() {
    document.getElementById('supportModal').style.display = 'block';
}

function handleSupportSubmit(event) {
    event.preventDefault();
    
    const subject = document.getElementById('supportSubject').value;
    const message = document.getElementById('supportMessage').value;
    const priority = document.getElementById('supportPriority').value;
    
    // In a real application, this would send to a support system
    console.log('Support request:', { subject, message, priority });
    
    closeModal('supportModal');
    showNotification('Support request submitted successfully! We\'ll get back to you soon.', 'success');
    
    // Clear form
    document.getElementById('supportSubject').value = '';
    document.getElementById('supportMessage').value = '';
    document.getElementById('supportPriority').value = 'normal';
}

// Live chat
function startLiveChat() {
    alert('Live chat would open a chat widget. This is a demo version.');
}

// Video tutorials
function watchVideoTutorial(topic) {
    alert(`Video tutorial for "${topic}" would open in a modal or new tab. This is a demo version.`);
}

// Interactive guide
function startInteractiveGuide() {
    alert('Interactive guide would start with step-by-step tooltips. This is a demo version.');
}

// Keyboard shortcuts
function showKeyboardShortcuts() {
    const shortcuts = {
        'Navigation': [
            'Ctrl + / - Show keyboard shortcuts',
            'Ctrl + K - Quick search',
            'Ctrl + N - New workspace',
            'Ctrl + I - Invite users',
            'Ctrl + , - Open settings'
        ],
        'Workspace': [
            'Tab - Switch between tabs',
            'Ctrl + S - Save current work',
            'Ctrl + Z - Undo',
            'Ctrl + Y - Redo',
            'Ctrl + F - Find in workspace'
        ],
        'Whiteboard': [
            'W - Select whiteboard tool',
            'T - Text tool',
            'R - Rectangle tool',
            'C - Circle tool',
            'L - Line tool',
            'E - Eraser tool',
            'Delete - Delete selected item'
        ],
        'Video Call': [
            'Space - Mute/unmute microphone',
            'V - Toggle video',
            'S - Share screen',
            'R - Raise/lower hand',
            'Esc - Leave call'
        ]
    };
    
    let shortcutsHTML = '<h4>Keyboard Shortcuts</h4>';
    
    Object.entries(shortcuts).forEach(([category, items]) => {
        shortcutsHTML += `<h5>${category}</h5><ul>`;
        items.forEach(item => {
            shortcutsHTML += `<li>${item}</li>`;
        });
        shortcutsHTML += '</ul>';
    });
    
    alert(shortcutsHTML);
}

// System status
function checkSystemStatus() {
    const status = {
        'API Services': 'Operational',
        'Database': 'Operational',
        'Video Calling': 'Operational',
        'File Storage': 'Operational',
        'Email Services': 'Degraded Performance',
        'Authentication': 'Operational'
    };
    
    let statusHTML = '<h4>System Status</h4><ul>';
    
    Object.entries(status).forEach(([service, status]) => {
        const statusColor = status === 'Operational' ? '#48bb78' : 
                           status === 'Degraded Performance' ? '#f6ad55' : '#f56565';
        statusHTML += `<li style="color: ${statusColor}">${service}: ${status}</li>`;
    });
    
    statusHTML += '</ul><p style="margin-top: 1rem; font-size: 0.875rem; color: #718096;">Last updated: ' + new Date().toLocaleString() + '</p>';
    
    alert(statusHTML);
}

// Report bug
function reportBug() {
    const bugReport = `
Bug Report Form
================

Please provide the following information:

1. What were you doing when the bug occurred?
2. What did you expect to happen?
3. What actually happened?
4. Can you reproduce this bug? If so, how?
5. Browser and version:
6. Operating system:
7. Any error messages you saw:

In a real application, this would open a bug reporting form.
    `;
    
    alert(bugReport);
}

// Feature request
function requestFeature() {
    const featureRequest = `
Feature Request Form
===================

Please describe the feature you'd like to see:

1. Feature title:
2. Detailed description:
3. Why would this feature be useful?
4. How would you like it to work?
5. Any examples or references:

In a real application, this would open a feature request form.
    `;
    
    alert(featureRequest);
}

// Documentation links
function openDocumentation(page) {
    const docs = {
        'api': 'API Documentation - REST endpoints, authentication, examples',
        'integrations': 'Integrations Guide - Connect with third-party services',
        'admin': 'Admin Guide - User management, workspace administration',
        'billing': 'Billing Documentation - Plans, pricing, invoices'
    };
    
    alert(docs[page] || 'Documentation would open in a new tab.');
}

// Community resources
function openCommunity(resource) {
    const resources = {
        'forum': 'Community Forum - Ask questions, share knowledge',
        'blog': 'Blog - Tips, tutorials, product updates',
        'webinars': 'Webinars - Live training sessions and demos',
        'examples': 'Example Workspaces - Templates and use cases'
    };
    
    alert(resources[resource] || 'Community resource would open in a new tab.');
}

// Helper functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

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

function updateSidebarUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userNameElement = document.getElementById('sidebarUserName');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'Guest User';
    }
}

// Add help page specific styles
const helpStyles = document.createElement('style');
helpStyles.textContent = `
    .help-content {
        padding: 2rem;
        max-width: 1000px;
        margin: 0 auto;
    }
    
    .help-header {
        text-align: center;
        margin-bottom: 3rem;
    }
    
    .help-header h2 {
        margin: 0 0 1rem 0;
        color: #2d3748;
        font-size: 2rem;
    }
    
    .help-header p {
        margin: 0;
        color: #718096;
        font-size: 1.125rem;
    }
    
    .help-search {
        max-width: 600px;
        margin: 0 auto 3rem auto;
        position: relative;
    }
    
    .search-input {
        width: 100%;
        padding: 1rem 3rem 1rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }
    
    .search-input:focus {
        outline: none;
        border-color: #6366f1;
    }
    
    .search-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #718096;
    }
    
    .quick-help {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
    
    .quick-help-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .quick-help-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .quick-help-card i {
        font-size: 2.5rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .quick-help-card h3 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }
    
    .quick-help-card p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .help-sections {
        margin-bottom: 3rem;
    }
    
    .help-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .help-section h3 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.5rem;
    }
    
    .help-section h4 {
        margin: 2rem 0 1rem 0;
        color: #4a5568;
        font-size: 1.125rem;
    }
    
    .help-section p {
        margin: 0 0 1rem 0;
        color: #718096;
        line-height: 1.6;
    }
    
    .help-section ul {
        margin: 0 0 1rem 0;
        padding-left: 1.5rem;
        color: #718096;
    }
    
    .help-section li {
        margin-bottom: 0.5rem;
    }
    
    .help-section code {
        background: #f7fafc;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: #2d3748;
    }
    
    .faq-item {
        border-bottom: 1px solid #e2e8f0;
        padding: 1rem 0;
    }
    
    .faq-item:last-child {
        border-bottom: none;
    }
    
    .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0;
    }
    
    .faq-question i {
        color: #718096;
        transition: transform 0.2s ease;
    }
    
    .faq-answer {
        display: none;
        color: #718096;
        line-height: 1.6;
        margin-top: 1rem;
    }
    
    .search-results {
        background: #f7fafc;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        display: none;
    }
    
    .search-results h4 {
        margin: 0 0 1rem 0;
        color: #2d3748;
    }
    
    .search-result-item {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .search-result-item:hover {
        background: #edf2f7;
    }
    
    .search-result-item h5 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }
    
    .search-result-item p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
    }
    
    .search-result-item mark {
        background: #fef3c7;
        color: #2d3748;
        padding: 0.125rem 0.25rem;
        border-radius: 2px;
    }
    
    .contact-support {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 3rem;
        text-align: center;
        color: white;
        margin-bottom: 3rem;
    }
    
    .contact-support h3 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
    }
    
    .contact-support p {
        margin: 0 0 2rem 0;
        opacity: 0.9;
    }
    
    .support-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .btn-white {
        background: white;
        color: #6366f1;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-white:hover {
        background: #f7fafc;
        transform: translateY(-1px);
    }
    
    .btn-outline-white {
        background: transparent;
        color: white;
        border: 2px solid white;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-outline-white:hover {
        background: white;
        color: #6366f1;
    }
    
    .resource-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .resource-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #718096;
        text-decoration: none;
        transition: color 0.2s ease;
    }
    
    .resource-link:hover {
        color: #6366f1;
    }
    
    @media (max-width: 768px) {
        .help-content {
            padding: 1rem;
        }
        
        .quick-help {
            grid-template-columns: 1fr;
        }
        
        .support-buttons {
            flex-direction: column;
            align-items: center;
        }
        
        .resource-links {
            grid-template-columns: 1fr;
        }
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
document.head.appendChild(helpStyles);
