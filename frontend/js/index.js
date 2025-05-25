function showAuthModal(mode = 'login') {
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');

    authModal.classList.remove('hidden');
    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authTitle.textContent = 'Kirish';
        authSwitchText.textContent = 'Hisobingiz yo\'qmi?';
        authSwitchBtn.textContent = 'Ro\'yxatdan o\'tish';
        authSwitchBtn.onclick = () => showAuthModal('register');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authTitle.textContent = 'Ro\'yxatdan o\'tish';
        authSwitchText.textContent = 'Hisobingiz bormi?';
        authSwitchBtn.textContent = 'Kirish';
        authSwitchBtn.onclick = () => showAuthModal('login');
    }
}

function hideAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

async function login(email, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        showNotification(data.message || 'Muvaffaqiyatli kirish qildingiz', 'success');
        hideAuthModal();
        window.location.href = 'dashboard.html';
    } catch (error) {
        showNotification(error.message || 'Kirish muvaffaqiyatsiz', 'error');
    }
}

async function register(userData) {
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        showNotification(data.message || 'Hisob muvaffaqiyatli yaratildi', 'success');
        hideAuthModal();
        window.location.href = 'dashboard.html';
    } catch (error) {
        showNotification(error.message || 'Ro\'yxatdan o\'tish muvaffaqiyatsiz', 'error');
    }
}

async function createServiceRequest(requestData) {
    try {
        const data = await apiRequest('/service/create', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        showNotification(data.message || 'Xizmat so‘rovi muvaffaqiyatli yuborildi! 24 soat ichida siz bilan bog‘lanamiz.', 'success');
        document.getElementById('serviceRequestForm').reset();
    } catch (error) {
        showNotification(error.message || 'Xizmat so‘rovini yuborishda xatolik', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileMenuClose.addEventListener('click', toggleMobileMenu);


    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            await login(email, password);
        });
    }


    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            await register(userData);
        });
    }


    const serviceRequestForm = document.getElementById('serviceRequestForm');
    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const submitText = document.getElementById('submitText');
            const submitLoader = document.getElementById('submitLoader');
            submitButton.disabled = true;
            submitText.textContent = 'Yuborilmoqda...';
            submitLoader.classList.remove('hidden');
            const formData = new FormData(this);
            await createServiceRequest(Object.fromEntries(formData));
            submitButton.disabled = false;
            submitText.textContent = 'Ta\'mirlash So\'rovini Yuborish';
            submitLoader.classList.add('hidden');
        });
    }


    document.getElementById('authModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideAuthModal();
        }
    });
});