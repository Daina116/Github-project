// Help & Support JavaScript
class HelpSupport {
    constructor() {
        this.articles = this.loadArticles();
        this.searchResults = [];
        this.currentCategory = 'all';
        this.chatMessages = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPopularArticles();
        this.initChat();
    }

    setupEventListeners() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').style.display = 'none';
            }
        });

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Initialize FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.faq-question')) {
                    this.toggleFAQ(item);
                }
            });
        });
    }

    loadArticles() {
        const savedArticles = localStorage.getItem('helpArticles');
        if (savedArticles) {
            return JSON.parse(savedArticles);
        }

        // Default articles
        const defaultArticles = [
            {
                id: 'getting-started',
                title: 'Getting Started Guide',
                category: 'getting-started',
                description: 'Learn how to get up and running with our collaborative platform',
                content: `
                    <h1>Getting Started Guide</h1>
                    <p>Welcome to our collaborative platform! This guide will help you get started quickly and make the most of all our features.</p>
                    
                    <h2>Creating Your Account</h2>
                    <p>To get started, you'll need to create an account:</p>
                    <ol>
                        <li>Visit our signup page</li>
                        <li>Enter your email and create a password</li>
                        <li>Verify your email address</li>
                        <li>Complete your profile information</li>
                    </ol>
                    
                    <h2>Setting Up Your Workspace</h2>
                    <p>Once you have an account, you can create your first workspace:</p>
                    <ol>
                        <li>Click on "Create Workspace" in the main menu</li>
                        <li>Choose a workspace name and description</li>
                        <li>Select your workspace type (team, project, etc.)</li>
                        <li>Invite team members</li>
                        <li>Configure your workspace settings</li>
                    </ol>
                    
                    <h2>Key Features Overview</h2>
                    <p>Our platform includes several powerful features:</p>
                    <ul>
                        <li><strong>Chat:</strong> Real-time messaging with team members</li>
                        <li><strong>Whiteboard:</strong> Collaborative drawing and brainstorming</li>
                        <li><strong>Documents:</strong> Rich text editing and document sharing</li>
                        <li><strong>Video Calls:</strong> HD video conferencing</li>
                        <li><strong>Tasks:</strong> Project management and task tracking</li>
                        <li><strong>Calendar:</strong> Scheduling and event management</li>
                        <li><strong>Files:</strong> Secure file storage and sharing</li>
                    </ul>
                    
                    <h2>Next Steps</h2>
                    <p>Now that you're familiar with the basics, we recommend:</p>
                    <ul>
                        <li>Exploring each feature in detail</li>
                        <li>Inviting your team members</li>
                        <li>Creating your first project</li>
                        <li>Setting up integrations with other tools</li>
                    </ul>
                    
                    <blockquote>Need more help? Contact our support team or browse our other help articles.</blockquote>
                `
            },
            {
                id: 'invite-team',
                title: 'How to Invite Team Members',
                category: 'getting-started',
                description: 'Learn how to invite and manage team members in your workspace',
                content: `
                    <h1>Inviting Team Members</h1>
                    <p>Collaboration is at the heart of our platform. Here's how to invite team members to your workspace.</p>
                    
                    <h2>Inviting Members</h2>
                    <ol>
                        <li>Navigate to the Team page</li>
                        <li>Click the "Invite Members" button</li>
                        <li>Enter email addresses of the people you want to invite</li>
                        <li>Select their role (Admin, Manager, Member, or Viewer)</li>
                        <li>Click "Send Invitations"</li>
                    </ol>
                    
                    <h2>User Roles and Permissions</h2>
                    <p>Each role has different permissions:</p>
                    <ul>
                        <li><strong>Admin:</strong> Full access to all features and settings</li>
                        <li><strong>Manager:</strong> Can manage projects and team members</li>
                        <li><strong>Member:</strong> Can participate in projects and access shared resources</li>
                        <li><strong>Viewer:</strong> Read-only access to specific content</li>
                    </ul>
                    
                    <h2>Managing Invitations</h2>
                    <p>You can manage pending invitations from the Team page:</p>
                    <ul>
                        <li>View all sent invitations</li>
                        <li>Resend invitations</li>
                        <li>Cancel pending invitations</li>
                        <li>Change roles after acceptance</li>
                    </ul>
                `
            },
            {
                id: 'file-sharing',
                title: 'File Sharing Best Practices',
                category: 'features',
                description: 'Learn how to share files effectively and securely',
                content: `
                    <h1>File Sharing Best Practices</h1>
                    <p>Effective file sharing is crucial for team collaboration. Follow these best practices to ensure smooth and secure file management.</p>
                    
                    <h2>File Organization</h2>
                    <ul>
                        <li>Use clear, descriptive file names</li>
                        <li>Create logical folder structures</li>
                        <li>Use version control for important documents</li>
                        <li>Archive old files regularly</li>
                    </ul>
                    
                    <h2>Sharing Permissions</h2>
                    <p>Set appropriate sharing permissions:</p>
                    <ul>
                        <li><strong>Private:</strong> Only you can access</li>
                        <li><strong>Team:</strong> All team members can access</li>
                        <li><strong>Public:</strong> Anyone with the link can access</li>
                        <li><strong>Custom:</strong> Specific people or groups</li>
                    </ul>
                    
                    <h2>Security Tips</h2>
                    <ul>
                        <li>Enable two-factor authentication</li>
                        <li>Use strong passwords for sensitive files</li>
                        <li>Regularly review sharing permissions</li>
                        <li>Encrypt sensitive documents</li>
                    </ul>
                `
            },
            {
                id: 'video-calls',
                title: 'Video Call Setup',
                category: 'features',
                description: 'How to set up and join video conferences',
                content: `
                    <h1>Video Call Setup</h1>
                    <p>Video calls are essential for remote collaboration. Here's how to set them up effectively.</p>
                    
                    <h2>Before the Call</h2>
                    <ul>
                        <li>Test your camera and microphone</li>
                        <li>Check your internet connection</li>
                        <li>Choose a quiet, well-lit location</li>
                        <li>Close unnecessary applications</li>
                    </ul>
                    
                    <h2>Starting a Call</h2>
                    <ol>
                        <li>Go to the Video page</li>
                        <li>Click "Start New Meeting"</li>
                        <li>Configure meeting settings</li>
                        <li>Share the meeting link</li>
                        <li>Start the meeting</li>
                    </ol>
                    
                    <h2>During the Call</h2>
                    <ul>
                        <li>Mute when not speaking</li>
                        <li>Use screen sharing for presentations</li>
                        <li>Record important meetings</li>
                        <li>Use chat for questions and links</li>
                    </ul>
                    
                    <h2>Best Practices</h2>
                    <ul>
                        <li>Join 5 minutes early</li>
                        <li>Have a clear agenda</li>
                        <li>Assign a moderator</li>
                        <li>Follow up with meeting notes</li>
                    </ul>
                `
            },
            {
                id: 'security-tips',
                title: 'Security Best Practices',
                category: 'security',
                description: 'How to keep your account and data secure',
                content: `
                    <h1>Security Best Practices</h1>
                    <p>Security is everyone's responsibility. Follow these practices to keep your account and data safe.</p>
                    
                    <h2>Account Security</h2>
                    <ul>
                        <li>Use a strong, unique password</li>
                        <li>Enable two-factor authentication</li>
                        <li>Regularly update your password</li>
                        <li>Review login activity</li>
                    </ul>
                    
                    <h2>Data Protection</h2>
                    <ul>
                        <li>Encrypt sensitive files</li>
                        <li>Use appropriate sharing permissions</li>
                        <li>Regularly backup important data</li>
                        <li>Be careful with public Wi-Fi</li>
                    </ul>
                    
                    <h2>Phishing Awareness</h2>
                    <ul>
                        <li>Verify sender email addresses</li>
                        <li>Don't click suspicious links</li>
                        <li>Report phishing attempts</li>
                        <li>Keep software updated</li>
                    </ul>
                    
                    <h2>What to Do If Compromised</h2>
                    <ol>
                        <li>Change your password immediately</li>
                        <li>Review account activity</li>
                        <li>Contact support</li>
                        <li>Inform your team</li>
                    </ol>
                `
            }
        ];

        localStorage.setItem('helpArticles', JSON.stringify(defaultArticles));
        return defaultArticles;
    }

    loadPopularArticles() {
        // Popular articles are already loaded in the HTML
        // This method can be used to dynamically update based on usage
    }

    searchHelp(query) {
        if (!query) {
            document.getElementById('searchResults').style.display = 'none';
            document.getElementById('helpContent').style.display = 'block';
            return;
        }

        query = query.toLowerCase();
        this.searchResults = this.articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query) ||
            article.category.toLowerCase().includes(query)
        );

        this.displaySearchResults();
    }

    displaySearchResults() {
        const searchResults = document.getElementById('searchResults');
        const resultsList = document.getElementById('resultsList');
        const helpContent = document.getElementById('helpContent');

        if (this.searchResults.length === 0) {
            resultsList.innerHTML = `
                <div class="no-results">
                    <p>No results found for your search.</p>
                    <p>Try different keywords or <a href="#" onclick="createTicket()">contact support</a>.</p>
                </div>
            `;
        } else {
            resultsList.innerHTML = this.searchResults.map(article => `
                <div class="result-item" onclick="viewArticle('${article.id}')">
                    <div class="result-title">${article.title}</div>
                    <div class="result-description">${article.description}</div>
                    <span class="result-category">${article.category}</span>
                </div>
            `).join('');
        }

        searchResults.style.display = 'block';
        helpContent.style.display = 'none';
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        // Update active category
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.category-item').classList.add('active');

        // Filter articles
        if (category === 'all') {
            this.searchResults = this.articles;
        } else {
            this.searchResults = this.articles.filter(article => article.category === category);
        }

        // Show filtered results
        this.displaySearchResults();
    }

    viewArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleContent').innerHTML = article.content;
        document.getElementById('articleModal').classList.add('active');
    }

    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            faqItem.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    }

    initChat() {
        // Add initial message
        this.chatMessages = [{
            type: 'support',
            sender: 'Support Agent',
            message: 'Hello! How can I help you today?',
            time: 'Just now'
        }];
    }

    sendChatMessage(message) {
        if (!message.trim()) return;

        // Add user message
        this.chatMessages.push({
            type: 'user',
            sender: 'You',
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Add support response (simulated)
        setTimeout(() => {
            const responses = [
                "I understand your concern. Let me help you with that.",
                "That's a great question! Here's what I recommend...",
                "I can definitely assist you with this issue.",
                "Let me check that information for you.",
                "Thanks for reaching out! I'm here to help."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            this.chatMessages.push({
                type: 'support',
                sender: 'Support Agent',
                message: randomResponse,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            this.updateChatMessages();
        }, 1000);

        this.updateChatMessages();
    }

    updateChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = this.chatMessages.map(msg => `
            <div class="message ${msg.type}-message">
                <div class="message-avatar">
                    <i class="fas fa-${msg.type === 'support' ? 'headset' : 'user'}"></i>
                </div>
                <div class="message-content">
                    <span class="message-sender">${msg.sender}</span>
                    <span class="message-text">${msg.message}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    submitTicket(ticketData) {
        // Save ticket to localStorage (in a real app, this would be sent to a server)
        const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        const newTicket = {
            id: Date.now(),
            ...ticketData,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tickets.push(newTicket);
        localStorage.setItem('supportTickets', JSON.stringify(tickets));

        // Show confirmation
        this.showNotification('Support ticket created successfully! Ticket ID: ' + newTicket.id);
        return newTicket;
    }

    scheduleCall(callData) {
        // Save call to localStorage
        const calls = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
        const newCall = {
            id: Date.now(),
            ...callData,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        calls.push(newCall);
        localStorage.setItem('scheduledCalls', JSON.stringify(calls));

        // Show confirmation
        this.showNotification('Support call scheduled successfully!');
        return newCall;
    }

    playTutorial(tutorialId) {
        // In a real app, this would open a video player
        this.showNotification(`Playing tutorial: ${tutorialId}`);
    }

    openForum() {
        // In a real app, this would navigate to the forum
        this.showNotification('Opening community forum...');
    }

    likeArticle() {
        // Save article like
        const likes = JSON.parse(localStorage.getItem('articleLikes') || '{}');
        const currentArticle = document.getElementById('articleTitle').textContent;
        
        likes[currentArticle] = (likes[currentArticle] || 0) + 1;
        localStorage.setItem('articleLikes', JSON.stringify(likes));

        this.showNotification('Thanks for your feedback!');
    }

    shareArticle() {
        // Copy article link to clipboard
        const articleUrl = window.location.href;
        navigator.clipboard.writeText(articleUrl).then(() => {
            this.showNotification('Article link copied to clipboard!');
        });
    }

    printArticle() {
        window.print();
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Global functions
let helpSupport;

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function searchHelp() {
    const searchInput = document.getElementById('helpSearch');
    helpSupport.searchHelp(searchInput.value);
}

function filterByCategory(category) {
    helpSupport.filterByCategory(category);
}

function viewArticle(articleId) {
    helpSupport.viewArticle(articleId);
}

function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    helpSupport.toggleFAQ(faqItem);
}

function startLiveChat() {
    document.getElementById('liveChatModal').classList.add('active');
}

function createTicket() {
    document.getElementById('ticketModal').classList.add('active');
}

function scheduleCall() {
    document.getElementById('scheduleCallModal').classList.add('active');
}

function playTutorial(tutorialId) {
    helpSupport.playTutorial(tutorialId);
}

function openForum() {
    helpSupport.openForum();
}

function likeArticle() {
    helpSupport.likeArticle();
}

function shareArticle() {
    helpSupport.shareArticle();
}

function printArticle() {
    helpSupport.printArticle();
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message) {
        helpSupport.sendChatMessage(message);
        chatInput.value = '';
    }
}

function submitTicket() {
    const ticketData = {
        subject: document.getElementById('ticketSubject').value,
        category: document.getElementById('ticketCategory').value,
        priority: document.getElementById('ticketPriority').value,
        description: document.getElementById('ticketDescription').value,
        attachments: document.getElementById('ticketAttachments').files
    };

    // Validate required fields
    if (!ticketData.subject || !ticketData.description) {
        helpSupport.showNotification('Please fill in all required fields');
        return;
    }

    helpSupport.submitTicket(ticketData);
    closeModal('ticketModal');
    
    // Reset form
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketDescription').value = '';
    document.getElementById('ticketAttachments').value = '';
}

function scheduleSupportCall() {
    const callData = {
        date: document.getElementById('callDate').value,
        time: document.getElementById('callTime').value,
        type: document.getElementById('callType').value,
        topic: document.getElementById('callTopic').value,
        notes: document.getElementById('callNotes').value
    };

    // Validate required fields
    if (!callData.date || !callData.topic) {
        helpSupport.showNotification('Please fill in all required fields');
        return;
    }

    helpSupport.scheduleCall(callData);
    closeModal('scheduleCallModal');
    
    // Reset form
    document.getElementById('callDate').value = '';
    document.getElementById('callTopic').value = '';
    document.getElementById('callNotes').value = '';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function logout() {
    // Clear user session
    localStorage.removeItem('userSession');
    window.location.href = 'index.html';
}

// Initialize help support when page loads
document.addEventListener('DOMContentLoaded', () => {
    helpSupport = new HelpSupport();
    
    // Set minimum date for call scheduling to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('callDate').min = today;
});
