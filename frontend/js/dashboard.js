document.addEventListener('DOMContentLoaded', async () => {
    try {
      const user = await initPage('dashboard');
      await displayRequests(user);
      let stats = { total_requests: 0, pending_requests: 0, in_progress_requests: 0, completed_requests: 0 };
      try {
        stats = await apiRequest('/stats/requests');
      } catch (error) {
        console.log('Request stats fetch failed:', error);
        showNotification('So‘rov statistikasi yuklanmadi', 'error');
      }
      await displayDashboard(user, stats);
    } catch (error) {
      console.log(error);
      showNotification('Sahifa yuklashda xatolik', 'error');
    }
  });



async function displayDashboard(user, stats) {
    const dashboardContent = document.getElementById('dashboardContent');
    const chartContainer = document.getElementById('chartContainer');
    if (!dashboardContent || !chartContainer) {
      showNotification('Dashboard elementi topilmadi', 'error');
      return;
    }
  
    dashboardContent.innerHTML = `
      <div class="bg-dark-light rounded-xl p-6 glass-effect hover-glow">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-white">Jami So'rovlar</h3>
            <p class="text-3xl font-bold text-primary mt-2">${stats.total_requests || 0}</p>
          </div>
          <div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <i class="fas fa-clipboard-list text-primary text-xl"></i>
          </div>
        </div>
      </div>
      <div class="bg-dark-light rounded-xl p-6 glass-effect hover-glow">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-white">Kutilmoqda</h3>
            <p class="text-3xl font-bold text-yellow-400 mt-2">${stats.pending_requests || 0}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
            <i class="fas fa-hourglass-half text-yellow-400 text-xl"></i>
          </div>
        </div>
      </div>
      <div class="bg-dark-light rounded-xl p-6 glass-effect hover-glow">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-white">Jarayonda</h3>
            <p class="text-3xl font-bold text-blue-400 mt-2">${stats.in_progress_requests || 0}</p>
          </div>
          <div class="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
            <i class="fas fa-cogs text-blue-400 text-xl"></i>
          </div>
        </div>
      </div>
      <div class="bg-dark-light rounded-xl p-6 glass-effect hover-glow">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-white">Yakunlangan</h3>
            <p class="text-3xl font-bold text-green-400 mt-2">${stats.completed_requests || 0}</p>
          </div>
          <div class="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
            <i class="fas fa-check-circle text-green-400 text-xl"></i>
          </div>
        </div>
      </div>
    `;
  
    if (user.role === 'manager') {
      try {
        const [locations, registrations] = await Promise.all([
          apiRequest('/stats/locations'),
          apiRequest('/stats/visitors'),
        ]);
  
        const registrationData = registrations || [
          { date: "2025-05-01", count: 10 },
          { date: "2025-05-02", count: 15 },
          { date: "2025-05-03", count: 30 },
          { date: "2025-05-04", count: 20 },
          { date: "2025-05-05", count: 25 }
        ];
        const locationData = locations || [
          { source: "Sergili", count: 200 },
          { source: "Shayhontoxur", count: 120 },
          { source: "Chilonzor", count: 90 },
        ];
  
        chartContainer.innerHTML = `
          <div class="bg-dark-light rounded-xl p-6 glass-effect">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i class="fas fa-chart-line"></i> Ro‘yxatdan O‘tganlar
            </h3>
            <canvas id="registrationChart"></canvas>
          </div>
          <div class="bg-dark-light rounded-xl p-6 glass-effect">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i class="fas fa-globe"></i> Tashrif Joylari
            </h3>
            <canvas id="visitorChart"></canvas>
          </div>
        `;
  
        new Chart(document.getElementById('registrationChart'), {
          type: "line",
          data: {
            labels: registrationData.map(d => d.date),
            datasets: [{
              label: "Ro'yxatdan O'tganlar",
              data: registrationData.map(d => d.count),
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: registrationData.map(d => d.count > 25 ? "#ef4444" : "#6366f1"),
              pointBorderColor: registrationData.map(d => d.count > 25 ? "#ef4444" : "#6366f1"),
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { mode: "index", intersect: false }
            },
            scales: {
              x: { 
                title: { display: true, text: "Sana", color: "#e5e7eb" },
                ticks: { color: "#e5e7eb" }
              },
              y: { 
                title: { display: true, text: "Ro'yxatdan O'tganlar", color: "#e5e7eb" },
                ticks: { color: "#e5e7eb" },
                beginAtZero: true
              }
            }
          }
        });
  
        new Chart(document.getElementById('visitorChart'), {
          type: "bar",
          data: {
            labels: locationData.map(d => d.source),
            datasets: [{
              label: "Murojatlar",
              data: locationData.map(d => d.count),
              backgroundColor: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
              borderColor: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { mode: "index", intersect: false }
            },
            scales: {
              x: { 
                title: { display: true, text: "Manzillar", color: "#e5e7eb" },
                ticks: { color: "#e5e7eb" }
              },
              y: { 
                title: { display: true, text: "Murojatlar", color: "#e5e7eb" },
                ticks: { color: "#e5e7eb" },
                beginAtZero: true
              }
            }
          }
        });
      } catch (error) {
        console.log(error);
        showNotification('Statistika yuklanmadi', 'error');
        chartContainer.innerHTML = '';
      }
    } else {
      chartContainer.innerHTML = '';
    }
  }
  
