document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await initPage('staff');
        if (user.role !== 'manager') {
            showNotification('Bu sahifaga faqat menejerlar kira oladi', 'error');
            window.location.href = 'index.html';
            return;
        }
        await displayStaffList();
    } catch (error) {
        console.error('Staff sahifasi yuklashda xato:', error);
        showNotification('Sahifa yuklashda xatolik yuz berdi', 'error');
        window.location.href = 'index.html';
    }
});

async function displayStaffList() {
    const staffList = document.getElementById('staffList');
    if (!staffList) {
        console.error('staffList elementi topilmadi');
        showNotification('Sahifa yuklashda xatolik', 'error');
        return;
    }
    try {
        const data = await apiRequest('/users');
        staffList.innerHTML = data.length === 0 ? `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-users text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Xodimlar Topilmadi</h3>
                <p class="text-gray-400">Hali hech qanday xodim qo'shilmagan.</p>
            </div>
        ` : `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-gray-400">
                            <th class="p-4">Ism</th>
                            <th class="p-4">Email</th>
                            <th class="p-4">Rol</th>
                            <th class="p-4">Qo'shilgan Sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(member => `
                            <tr class="border-t border-gray-800 hover:bg-dark-lighter">
                                <td class="p-4">${member.firstName || ''} ${member.lastName || ''}</td>
                                <td class="p-4">${member.email || 'N/A'}</td>
                                <td class="p-4">${member.role?.charAt(0).toUpperCase() + member.role?.slice(1) || 'N/A'}</td>
                                <td class="p-4">${formatDate(member.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Xodimlarni yuklashda xato:', error);
        showNotification('Xodimlarni yuklashda xatolik yuz berdi', 'error');
        staffList.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-exclamation-circle text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Ma'lumotlarni Yuklashda Xatolik</h3>
                <p class="text-gray-400">Iltimos, keyinroq qayta urinib ko'ring.</p>
            </div>
        `;
    }
}

function showCreateStaff() {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        console.error('modalContainer elementi topilmadi');
        showNotification('Sahifa yuklashda xatolik', 'error');
        return;
    }
    modalContainer.innerHTML = `
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div class="bg-dark-light rounded-2xl p-8 max-w-lg w-full border border-gray-800">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">Yangi Xodim Qo'shish</h2>
                    <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="addStaffForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label for="firstName" class="block text-sm font-medium text-gray-300">Ism *</label>
                            <input type="text" id="firstName" name="firstName" required
                                placeholder="Ismni kiriting"
                                class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                        </div>
                        <div class="space-y-2">
                            <label for="lastName" class="block text-sm font-medium text-gray-300">Familiya *</label>
                            <input type="text" id="lastName" name="lastName" required
                                placeholder="Familiyani kiriting"
                                class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label for="email" class="block text-sm font-medium text-gray-300">Email *</label>
                            <input type="email" id="email" name="email" required
                                placeholder="Email manzilini kiriting"
                                class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                        </div>
                        <div class="space-y-2">
                            <label for="role" class="block text-sm font-medium text-gray-300">Rol *</label>
                            <select id="role" name="role" required
                                class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                <option value="">Rol tanlang</option>
                                <option value="manager">Menejer</option>
                                <option value="master">Usta</option>
                            </select>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label for="password" class="block text-sm font-medium text-gray-300">Parol *</label>
                        <input type="password" id="password" name="password" required
                            placeholder="Parolni kiriting"
                            class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="gradient-primary px-8 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all inline-flex items-center">
                            <span id="submitText">Xodim Qo'shish</span>
                            <i id="submitLoader" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('addStaffForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('button[type="submit"]');
        const submitText = document.getElementById('submitText');
        const submitLoader = document.getElementById('submitLoader');
        submitButton.disabled = true;
        submitText.textContent = 'Yuborilmoqda...';
        submitLoader.classList.remove('hidden');
        const formData = new FormData(this);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            role: formData.get('role'),
            password: formData.get('password')
        };
        await addStaff(userData);
        submitButton.disabled = false;
        submitText.textContent = 'Xodim Qo\'shish';
        submitLoader.classList.add('hidden');
    });
}