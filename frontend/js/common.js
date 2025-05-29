const API_BASE_URL = 'https://abdulloh-service.robohouse.tech/api';


async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (response.status === 401) {
            showNotification('Autentifikatsiya muvaffaqiyatsiz. Iltimos, qayta kiring.', 'error');
            window.location.href = '/';
        }
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP xatosi! holat: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('API So‘rov Xatosi:', error);
        throw error;
    }
}


function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notif => notif.remove());
    const notification = document.createElement('div');
    notification.className = `notification-toast fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-2xl max-w-sm transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-600 text-white' : 
        type === 'error' ? 'bg-red-600 text-white' : 
        'bg-primary text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            } mr-3"></i>
            <span class="flex-1">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}


function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'completed': return 'bg-green-600 text-white';
        case 'in_progress': return 'bg-blue-600 text-white';
        case 'pending': return 'bg-yellow-600 text-white';
        default: return 'bg-gray-600 text-white';
    }
}



function renderSidebar(role, activePage) {
    const sidebarContent = document.getElementById('sidebarContent');
    const links = {
        user: [
            { href: 'dashboard.html', icon: 'fa-tachometer-alt', text: 'Boshqaruv Paneli' },
            { href: 'create-request.html', icon: 'fa-plus-circle', text: 'So‘rov Yaratish' },
            { href: 'profile.html', icon: 'fa-user', text: 'Profil' }
        ],
        manager: [
            { href: 'dashboard.html', icon: 'fa-tachometer-alt', text: 'Boshqaruv Paneli' },
            { href: 'staff.html', icon: 'fa-users', text: 'Xodimlar' },
            { href: 'components.html', icon: 'fa-cogs', text: 'Komponentlar' },
            { href: 'profile.html', icon: 'fa-user', text: 'Profil' },
            { href: 'create-request.html', icon: 'fa-plus-circle', text: 'So‘rov Yaratish' },
        ],
        master: [
            { href: 'dashboard.html', icon: 'fa-tachometer-alt', text: 'Boshqaruv Paneli' },
            { href: 'components.html', icon: 'fa-cogs', text: 'Komponentlar' },
            { href: 'profile.html', icon: 'fa-user', text: 'Profil' },
            { href: 'create-request.html', icon: 'fa-plus-circle', text: 'So‘rov Yaratish' },
        ]
    };

    console.log(links[role][0].href.split('.')[0]);

    console.log(activePage)

    sidebarContent.innerHTML = `
        <div class="space-y-2">
            ${links[role].map(link => `
                <a href="${link.href}" class="sidebar-link flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-dark-lighter rounded-xl transition-all ${activePage === link.href.split('.')[0] ? 'active' : ''}">
                    <i class="fas ${link.icon} mr-3"></i>
                    <span>${link.text}</span>
                </a>
            `).join('')}
        </div>
    `;
}


function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });
}


async function logout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
        window.location.href = 'index.html';
    } catch (error) {
        showNotification('Chiqishda xatolik yuz berdi', 'error');
    }
}


async function initPage(page) {
    try {
        const user = await apiRequest('/auth/current-user');
        const role = user.role || 'user';
        const userWelcome = document.getElementById('userWelcome');
        const userRole = document.getElementById('userRole');

        if (user?.isLegalEntity) {
            userRole.textContent = `${role} (Yuridik shaxs)`;
        }
        else{
            userRole.textContent = role;
        }

        if (userWelcome ) {
            userWelcome.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        
        renderSidebar(role, page);
        setupSidebarToggle();
        return user;
    } catch (error) {
        console.error('initPage xatosi:', error);
        throw error;
    }
}



tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                dark: '#0f172a',
                'dark-light': '#1e293b',
                'dark-lighter': '#334155'
            }
        }
    }
}