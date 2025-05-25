let selectedComponents = [];

async function displayRequests(user) {
    const requestsList = document.getElementById('requestsList');
    if (!requestsList) {
        showNotification('So‘rovlar ro‘yxati topilmadi', 'error');
        return;
    }
    try {
        const requests = await apiRequest('/service-request');
        console.log(requests)
        requestsList.innerHTML = requests.length === 0 ? `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-inbox text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">So‘rovlar Topilmadi</h3>
                <p class="text-gray-400 mb-6">${user.role === 'user' ? 'Siz hali hech qanday xizmat so‘rovini yubormadingiz.' : 'Hali hech qanday so‘rov yo‘q.'}</p>
                ${user.role === 'user' ? `
                    <a href="create-request.html" class="gradient-primary px-6 py-3 rounded-xl text-white font-medium hover:shadow-lg transition-all">
                        Birinchi So‘rovni Yaratish
                    </a>
                ` : ''}
            </div>
        ` : requests.map(request => `
            <div class="bg-dark rounded-xl p-6 border border-gray-800 shadow-sm hover:shadow-md transition-all">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <h3 class="text-2xl font-semibold text-white mb-2">${request.device_model || 'Noma‘lum Uskuna'}</h3>
                        <p class="text-gray-300 text-sm">${user.role === 'user' ? (request.issue_type || 'Turi ko‘rsatilmagan') : `${(request.owner?.firstname || 'Noma‘lum')} ${(request.owner?.lastname || '')} - ${request.owner?.email || ''}`}</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="px-4 py-1 text-sm font-semibold uppercase rounded-lg ${getStatusColor(request.status)}">
                            ${request.status || 'Kutilmoqda'}
                        </span>
                        ${user.role === 'user' && request.status === 'approved' ? `
                            <button onclick="showAcknowledgeModal('${request._id}')" class="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-sm hover:bg-green-600/30 transition-all flex items-center gap-2">
                                <i class="fas fa-check"></i> Tasdiqlash
                            </button>
                        ` : user.role === 'manager' && request.status === 'pending' ? `
                            <button onclick="showDetailModal('${request._id}')" class="bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/30 transition-all flex items-center gap-2">
                                <i class="fas fa-eye"></i> Ko‘rish
                            </button>
                        ` : user.role === 'master' && request.status === 'in_progress' ? `
                            <button onclick="markAsComplete('${request._id}')" class="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg text-sm hover:bg-blue-600/30 transition-all flex items-center gap-2">
                                <i class="fas fa-tools"></i> Yakunlash
                            </button>
                        ` : user.role === 'master' && request.status === 'in_review' ? `
                            <button onclick="showUpdateModal('${request._id}')" class="bg-yellow-600/20 text-yellow-400 px-4 py-2 rounded-lg text-sm hover:bg-yellow-600/30 transition-all flex items-center gap-2">
                                <i class="fas fa-edit"></i> Yangilash
                            </button>
                        ` : ''}
                    </div>
                </div>
                <p class="text-gray-300 mb-4 text-base">${request.description || 'Tavsif yo‘q'}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 ${user.role === 'user' ? '' : 'lg:grid-cols-4'} gap-4 text-sm">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-tools text-gray-400"></i>
                        <div>
                            <span class="text-gray-400 block">Muammo Joyi:</span>
                            <span class="text-white">${request.problem_area || 'Ko‘rsatilmagan'}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-map-marker-alt text-gray-400"></i>
                        <div>
                            <span class="text-gray-400 block">Manzil:</span>
                            <span class="text-white">${request.location || 'Ko‘rsatilmagan'}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-calendar-alt text-gray-400"></i>
                        <div>
                            <span class="text-gray-400 block">Yuborilgan:</span>
                            <span class="text-white">${formatDate(request.createdAt)}</span>
                        </div>
                    </div>
                    ${user.role === 'user' ? `
                        <div class="flex items-center gap-2">
                            <i class="fas fa-hashtag text-gray-400"></i>
                            <div>
                                <span class="text-gray-400 block">So‘rov ID:</span>
                                <span class="text-white">${request._id?.slice(-8) || 'N/A'}</span>
                            </div>
                        </div>
                    ` : `
                        <div class="flex items-center gap-2">
                            <i class="fas fa-exclamation-circle text-gray-400"></i>
                            <div>
                                <span class="text-gray-400 block">Muammo Turi:</span>
                                <span class="text-white">${request.issue_type || 'Ko‘rsatilmagan'}</span>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `).join('');
    } catch (error) {
        showNotification('So‘rovlar yuklanmadi', 'error');
        requestsList.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-exclamation-circle text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Xatolik</h3>
                <p class="text-gray-400">Iltimos, keyinroq urinib ko‘ring.</p>
            </div>
        `;
    }
}

async function showDetailModal(requestId) {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        showNotification('Modal topilmadi', 'error');
        return;
    }
    try {
        const requests = await apiRequest('/service-request');
        const request = requests.find(r => r._id === requestId);
        if (!request) {
            showNotification('So‘rov topilmadi', 'error');
            modalContainer.innerHTML = '';
            return;
        }
        modalContainer.innerHTML = `
            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
                <div class="bg-dark-light rounded-xl p-8 w-full max-w-2xl border border-gray-800 shadow-lg">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-white">So‘rov Tafsilotlari</h2>
                        <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="text-gray-400 hover:text-white text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-6 text-sm">
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-3 border-l-2 border-primary pl-3">Uskuna Ma'lumotlari</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-laptop text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Uskuna Modeli:</span>
                                        <span class="text-white font-medium">${request.device_model || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-exclamation-circle text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Muammo Turi:</span>
                                        <span class="text-white font-medium">${request.issue_type || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-tools text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Muammo Joyi:</span>
                                        <span class="text-white font-medium">${request.problem_area || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-map-marker-alt text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Manzil:</span>
                                        <span class="text-white font-medium">${request.location || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-3 border-l-2 border-primary pl-3">Foydalanuvchi Ma'lumotlari</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-user text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Ism:</span>
                                        <span class="text-white font-medium">${request.owner?.firstname || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-user text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Familiya:</span>
                                        <span class="text-white font-medium">${request.owner?.lastname || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-envelope text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Email:</span>
                                        <span class="text-white font-medium">${request.owner?.email || 'Ko‘rsatilmagan'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-3 border-l-2 border-primary pl-3">So‘rov Holati</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-calendar-alt text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Yuborilgan:</span>
                                        <span class="text-white font-medium">${formatDate(request.createdAt)}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-info-circle text-gray-400"></i>
                                    <div>
                                        <span class="text-gray-400 block">Holati:</span>
                                        <span class="text-white font-medium">${request.status || 'Kutilmoqda'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-dark/50 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-white mb-3">Tavsif</h3>
                            <p class="text-gray-200 text-base">${request.description || 'Tavsif yo‘q'}</p>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-4 mt-8">
                        <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="bg-gray-600/20 text-gray-400 px-6 py-3 rounded-lg text-sm hover:bg-gray-600/30 transition-all flex items-center gap-2">
                            <i class="fas fa-times"></i> Yopish
                        </button>
                        ${request.status !== 'approved' ? `
                            <button id="approveBtn" class="bg-green-600/20 text-green-400 px-6 py-3 rounded-lg text-sm hover:bg-green-600/30 transition-all flex items-center gap-2">
                                <i class="fas fa-check"></i> Texnik ga yuborish
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        if (request.status !== 'approved') {
            document.getElementById('approveBtn').addEventListener('click', async () => {
                try {
                    await apiRequest(`/service/send/${request._id}`, {
                        method: 'POST'
                    });
                    showNotification('So‘rov muvaffaqiyatli texnik ga yuborildi', 'success');
                    modalContainer.innerHTML = '';
                    await displayRequests({ role: 'manager' });
                } catch (error) {
                    showNotification(error.message || 'So‘rovni yuborishda xatolik', 'error');
                }
            });
        }
    } catch (error) {
        showNotification('So‘rov tafsilotlari yuklanmadi', 'error');
        modalContainer.innerHTML = '';
    }
}

async function showUpdateModal(requestId) {
    selectedComponents = [];
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        showNotification('Modal topilmadi', 'error');
        return;
    }
    try {
        const components = await apiRequest('/components');
        modalContainer.innerHTML = `
            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div class="bg-dark-light rounded-xl p-6 w-full max-w-md border border-gray-800">
                    <div class="flex justify-between mb-4">
                        <h2 class="text-xl font-bold text-white">So‘rovni Yakunlash</h2>
                        <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="updateRequestForm" class="space-y-4">
                        <div>
                            <label for="price" class="block text-sm text-gray-300">Narx (UZS)</label>
                            <input type="number" id="price" name="price" required min="0"
                                class="w-full p-2 bg-dark border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600">
                        </div>
                        <div>
                            <label for="finishedAt" class="block text-sm text-gray-300">Tugash Vaqti</label>
                            <input type="datetime-local" id="finishedAt" name="finishedAt" required
                                class="w-full p-2 bg-dark border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600">
                        </div>
                        <div>
                            <label for="components" class="block text-sm text-gray-300">Komponentlar</label>
                            <select id="components" class="w-full p-2 bg-dark border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600">
                                <option value="">Tanlang</option>
                                ${components.map(c => `<option value="${c._id}" data-quantity="${c.quantity}">${c.name} ($${c.price}, ${c.quantity} dona)</option>`).join('')}
                            </select>
                            <input type="number" id="componentQuantity" placeholder="Miqdor" min="1"
                                class="w-full p-2 bg-dark border border-gray-700 rounded-lg text-white mt-2 focus:ring-2 focus:ring-blue-600">
                            <button type="button" id="addComponentBtn" class="bg-blue-600 text-white px-4 py-1 rounded-lg mt-2">Qo‘shish</button>
                            <div id="selectedComponents" class="mt-2 space-y-2"></div>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 py-2 rounded-lg text-white font-semibold">
                            Yakunlash
                        </button>
                    </form>
                </div>
            </div>
        `;
        const select = document.getElementById('components');
        const quantityInput = document.getElementById('componentQuantity');
        const selectedContainer = document.getElementById('selectedComponents');

        function renderComponents() {
            selectedContainer.innerHTML = selectedComponents.map((c, i) => `
                <div class="flex justify-between bg-dark p-2 rounded-lg">
                    <span>${c.name} (x${c.quantity})</span>
                    <button type="button" onclick="removeComponent(${i})" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        window.removeComponent = function(i) {
            selectedComponents.splice(i, 1);
            renderComponents();
        };

        document.getElementById('addComponentBtn').addEventListener('click', () => {
            const componentId = select.value;
            const quantity = parseInt(quantityInput.value);
            const maxQuantity = parseInt(select.selectedOptions[0]?.dataset.quantity || 0);
            if (!componentId || !quantity || quantity < 1) {
                showNotification('Komponent va miqdor tanlang', 'error');
                return;
            }
            if (quantity > maxQuantity) {
                showNotification('Omborda yetarli miqdor yo‘q', 'error');
                return;
            }
            if (selectedComponents.some(c => c.id === componentId)) {
                showNotification('Bu komponent allaqachon qo‘shilgan', 'error');
                return;
            }
            const component = components.find(c => c._id === componentId);
            selectedComponents.push({ id: componentId, name: component.name, quantity });
            renderComponents();
            select.value = '';
            quantityInput.value = '';
        });

        document.getElementById('updateRequestForm').addEventListener('submit', async e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updateData = {
                requestId,
                price: parseFloat(formData.get('price')),
                finishedAt: new Date(formData.get('finishedAt')).toISOString(),
                components: selectedComponents.map(c => ({
                    componentId: c.id,
                    quantity: c.quantity
                }))
            };
            try {
                await apiRequest('/service-request/update', {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });
                showNotification('So‘rov muvaffaqiyatli yakunlandi', 'success');
                modalContainer.innerHTML = '';
                await displayRequests({ role: 'master' });
            } catch (error) {
                showNotification(error.message || 'So‘rovni yakunlashda xatolik', 'error');
            }
        });
    } catch (error) {
        showNotification('Komponentlar yuklanmadi', 'error');
        modalContainer.innerHTML = '';
    }
}

async function showAcknowledgeModal(requestId) {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        showNotification('Modal topilmadi', 'error');
        return;
    }
    modalContainer.innerHTML = `
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div class="bg-dark-light rounded-xl p-6 w-full max-w-sm border border-gray-800">
                <div class="flex justify-between mb-4">
                    <h2 class="text-xl font-bold text-white">So‘rovni Tasdiqlash</h2>
                    <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-gray-300 mb-4">Ushbu so‘rovni tasdiqlashni xohlaysizmi?</p>
                <div class="flex justify-end space-x-4">
                    <button onclick="document.getElementById('modalContainer').innerHTML = ''" class="bg-gray-600/20 text-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-600/30 transition-all">
                        Bekor qilish
                    </button>
                    <button id="confirmAcknowledgeBtn" class="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-sm hover:bg-green-600/30 transition-all">
                        Tasdiqlash
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('confirmAcknowledgeBtn').addEventListener('click', async () => {
        try {
            await apiRequest('/service-request/status/update', {
                method: 'PUT',
                body: JSON.stringify({ requestId })
            });
            showNotification('So‘rov muvaffaqiyatli tasdiqlandi', 'success');
            modalContainer.innerHTML = '';
            await displayRequests({ role: 'user' });
        } catch (error) {
            showNotification(error.message || 'So‘rovni tasdiqlashda xatolik', 'error');
        }
    });
}

async function markAsComplete(requestId){
    try {
        await apiRequest('/service-request/complete', {
            method: 'PUT',
            body: JSON.stringify({ requestId })
        });
        showNotification('So‘rov muvaffaqiyatli yakunlandi', 'success');
        await displayRequests({ role: 'master' });
    } catch (error) {
        showNotification(error.message || 'So‘rovni yakunlashda xatolik', 'error');
    }
}