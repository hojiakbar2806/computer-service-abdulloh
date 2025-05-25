document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await initPage('components');
        if (!['manager', 'master'].includes(user.role)) {
            showNotification('Bu sahifaga faqat menejerlar va ustalar kira oladi', 'error');
            window.location.href = 'index.html';
            return;
        }
        await displayComponentsList();
    } catch (error) {
        console.error('Komponentlar sahifasi yuklashda xato:', error);
        showNotification('Sahifa yuklashda xatolik yuz berdi', 'error');
        window.location.href = 'index.html';
    }
});

async function displayComponentsList() {
    const componentsList = document.getElementById('componentsList');
    if (!componentsList) {
        console.error('componentsList elementi topilmadi');
        showNotification('Sahifa yuklashda xatolik', 'error');
        return;
    }
    try {
        const data = await apiRequest('/components');
        componentsList.innerHTML = data.length === 0 ? `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-boxes text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Komponentlar Topilmadi</h3>
                <p class="text-gray-400">Hali hech qanday komponent qo'shilmagan.</p>
            </div>
        ` : `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-gray-400">
                            <th class="p-4">Nomi</th>
                            <th class="p-4">Narxi (USD)</th>
                            <th class="p-4">Miqdori</th>
                            <th class="p-4">Qo'shilgan Sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(component => `
                            <tr class="border-t border-gray-800 hover:bg-dark-lighter">
                                <td class="p-4">${component.name || 'N/A'}</td>
                                <td class="p-4">$${component.price || 0}</td>
                                <td class="p-4">${component.quantity || 0}</td>
                                <td class="p-4">${formatDate(component.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Komponentlarni yuklashda xato:', error);
        showNotification('Komponentlarni yuklashda xatolik yuz berdi', 'error');
        componentsList.innerHTML = `
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

function showCreateComponent() {
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
                    <h2 class="text-2xl font-bold text-white">Yangi Komponent Qo'shish</h2>
                    <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="addComponentForm" class="space-y-6">
                    <div class="space-y-2">
                        <label for="name" class="block text-sm font-medium text-gray-300">Nomi *</label>
                        <input type="text" id="name" name="name" required
                            placeholder="Komponent nomini kiriting"
                            class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    </div>
                    <div class="space-y-2">
                        <label for="price" class="block text-sm font-medium text-gray-300">Narxi (USD) *</label>
                        <input type="number" id="price" name="price" required min="0" step="0.01"
                            placeholder="Narxni kiriting"
                            class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    </div>
                    <div class="space-y-2">
                        <label for="quantity" class="block text-sm font-medium text-gray-300">Miqdori *</label>
                        <input type="number" id="quantity" name="quantity" required min="0"
                            placeholder="Miqdorni kiriting"
                            class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    </div>
                    <div class="space-y-2">
                        <label for="dashboardDescription" class="block text-sm font-medium text-gray-300">Muammo Tavsifi
                            *</label>
                        <textarea id="dashboardDescription" name="description" rows="4" required
                            placeholder="Muammoni batafsil tariflang..."
                            class="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="gradient-primary px-8 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all inline-flex items-center">
                            <span id="submitText">Komponent Qo'shish</span>
                            <i id="submitLoader" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('addComponentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('button[type="submit"]');
        const submitText = document.getElementById('submitText');
        const submitLoader = document.getElementById('submitLoader');
        submitButton.disabled = true;
        submitText.textContent = "Qo'shilmoqda...";
        submitLoader.classList.remove('hidden');
        const formData = new FormData(this);
        try {
            await apiRequest('/components', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData))
            });
            showNotification('Komponent muvaffaqiyatli qo‘shildi', 'success');
            modalContainer.innerHTML = '';
            await displayComponentsList();
        } catch (error) {
            showNotification(error.message || 'Komponent qo‘shishda xatolik', 'error');
        } finally {
            submitButton.disabled = false;
            submitText.textContent = 'Komponent Qo‘shish';
            submitLoader.classList.add('hidden');
        }
    });
}