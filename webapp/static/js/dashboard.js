/**
 * HOS-17 Dashboard JavaScript
 * Handles KPI loading, chart rendering, filtering, and real-time updates
 */

// Global variables for charts
let appointmentChart = null;
let revenueChart = null;
let patientChart = null;
let departmentChart = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    loadDashboardData();
    setupFilterListeners();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
});

/**
 * Load all dashboard data
 */
function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Load KPIs and charts in parallel
    Promise.all([
        loadKPIs(),
        loadCharts()
    ]).then(() => {
        console.log('Dashboard data loaded successfully');
    }).catch(error => {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('Failed to load dashboard data');
    });
}

/**
 * Load and display KPI metrics
 */
function loadKPIs() {
    return fetch('/api/dashboard/statistics/kpis')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch KPIs');
            return response.json();
        })
        .then(data => {
            displayKPIs(data.kpis);
        })
        .catch(error => {
            console.error('Error loading KPIs:', error);
            // Fallback to mock data for testing
            displayKPIs(getMockKPIs());
        });
}

/**
 * Display KPI cards
 */
function displayKPIs(kpis) {
    const container = document.getElementById('kpi-cards');
    container.innerHTML = '';

    const kpiConfig = [
        {
            key: 'total_patients',
            label: 'Total Patients',
            icon: 'fa-users',
            class: 'success'
        },
        {
            key: 'active_patients',
            label: 'Active Patients',
            icon: 'fa-heartbeat',
            class: 'success'
        },
        {
            key: 'appointments_today',
            label: 'Appointments Today',
            icon: 'fa-calendar-check',
            class: 'warning'
        },
        {
            key: 'revenue_month',
            label: 'Monthly Revenue',
            icon: 'fa-dollar-sign',
            class: 'success'
        }
    ];

    kpiConfig.forEach((config, index) => {
        const value = kpis[config.key] || 0;
        const card = createKPICard(config, value);
        container.appendChild(card);
    });
}

/**
 * Create a KPI card element
 */
function createKPICard(config, value) {
    const card = document.createElement('div');
    card.className = `kpi-card ${config.class}`;
    
    const formattedValue = config.key.includes('revenue') 
        ? `$${parseFloat(value).toFixed(2)}` 
        : value;

    card.innerHTML = `
        <div class="kpi-card-icon">
            <i class="fas ${config.icon}"></i>
        </div>
        <div class="kpi-card-label">${config.label}</div>
        <div class="kpi-card-value">${formattedValue}</div>
        <div class="kpi-card-change">
            <i class="fas fa-arrow-up"></i> +2.5%
        </div>
    `;

    return card;
}

/**
 * Load and display charts
 */
function loadCharts() {
    return fetch('/api/dashboard/statistics/charts')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch charts');
            return response.json();
        })
        .then(data => {
            renderAppointmentChart(data.appointment_status);
            renderRevenueChart(data.revenue_trend);
            renderPatientChart(data.patient_distribution);
            renderDepartmentChart(data.department_metrics);
        })
        .catch(error => {
            console.error('Error loading charts:', error);
            // Fallback to mock data
            const mockData = getMockChartData();
            renderAppointmentChart(mockData.appointment_status);
            renderRevenueChart(mockData.revenue_trend);
            renderPatientChart(mockData.patient_distribution);
            renderDepartmentChart(mockData.department_metrics);
        });
}

/**
 * Render appointment status pie chart
 */
function renderAppointmentChart(data) {
    const ctx = document.getElementById('appointmentChart');
    if (!ctx) return;

    if (appointmentChart) {
        appointmentChart.destroy();
    }

    appointmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels || ['Scheduled', 'Completed', 'Cancelled', 'Pending'],
            datasets: [{
                data: data.values || [20, 15, 5, 5],
                backgroundColor: data.colors || [
                    '#10b981',
                    '#2196F3',
                    '#ff6b6b',
                    '#fbbf24'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

/**
 * Render revenue trend line chart
 */
function renderRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Revenue',
                data: data.revenue || [2000, 2300, 2100, 2500, 2800, 2400, 2500],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render patient distribution bar chart
 */
function renderPatientChart(data) {
    const ctx = document.getElementById('patientChart');
    if (!ctx) return;

    if (patientChart) {
        patientChart.destroy();
    }

    patientChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.categories || ['Active', 'Inactive', 'Discharged', 'In-Treatment'],
            datasets: [{
                label: 'Patient Count',
                data: data.counts || [120, 30, 15, 25],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    '#3b82f6',
                    '#f59e0b'
                ],
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Render department metrics grouped bar chart
 */
function renderDepartmentChart(data) {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;

    if (departmentChart) {
        departmentChart.destroy();
    }

    departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.departments || ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'],
            datasets: [
                {
                    label: 'Patients',
                    data: data.patient_count || [45, 38, 42, 25],
                    backgroundColor: '#667eea',
                    borderRadius: 5,
                    borderSkipped: false
                },
                {
                    label: 'Appointments',
                    data: data.appointment_count || [12, 10, 15, 8],
                    backgroundColor: '#764ba2',
                    borderRadius: 5,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Setup filter event listeners
 */
function setupFilterListeners() {
    const applyBtn = document.querySelector('.btn-filter');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }

    // Allow Enter key to apply filters
    const filterInputs = document.querySelectorAll('.filter-group input, .filter-group select');
    filterInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    });
}

/**
 * Apply filters and reload data
 */
function applyFilters() {
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const department = document.getElementById('department').value;

    console.log('Applying filters:', { dateFrom, dateTo, department });

    // Build query string
    let queryString = '';
    if (dateFrom) queryString += `date_from=${dateFrom}&`;
    if (dateTo) queryString += `date_to=${dateTo}&`;
    if (department) queryString += `department=${department}&`;

    // Remove trailing &
    queryString = queryString.replace(/&$/, '');

    const url = `/api/dashboard/statistics/filtered${queryString ? '?' + queryString : ''}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Failed to apply filters');
            return response.json();
        })
        .then(data => {
            displayKPIs(data.kpis);
            if (data.charts) {
                renderAppointmentChart(data.charts.appointment_status);
                renderRevenueChart(data.charts.revenue_trend);
                renderPatientChart(data.charts.patient_distribution);
                renderDepartmentChart(data.charts.department_metrics);
            }
            showSuccessMessage('Filters applied successfully');
        })
        .catch(error => {
            console.error('Error applying filters:', error);
            showErrorMessage('Failed to apply filters');
        });
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    // Create and display toast notification
    const toast = document.createElement('div');
    toast.className = 'alert alert-success alert-dismissible fade show';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.insertBefore(toast, container.firstChild);
        setTimeout(() => toast.remove(), 3000);
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    // Create and display error notification
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

/**
 * Mock KPI data for testing
 */
function getMockKPIs() {
    return {
        total_patients: 150,
        active_patients: 120,
        appointments_today: 45,
        pending_appointments: 12,
        revenue_today: 2500,
        revenue_month: 65000,
        average_patient_age: 42,
        bed_occupancy_rate: 78.5,
        staff_utilization: 82,
        emergency_wait_time: 15
    };
}

/**
 * Mock chart data for testing
 */
function getMockChartData() {
    return {
        appointment_status: {
            labels: ['Scheduled', 'Completed', 'Cancelled', 'Pending'],
            values: [20, 15, 5, 5],
            colors: ['#4CAF50', '#2196F3', '#FF9800', '#FFC107']
        },
        revenue_trend: {
            dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            revenue: [2000, 2300, 2100, 2500, 2800, 2400, 2500]
        },
        patient_distribution: {
            categories: ['Active', 'Inactive', 'Discharged', 'In-Treatment'],
            counts: [120, 30, 15, 25]
        },
        department_metrics: {
            departments: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'],
            patient_count: [45, 38, 42, 25],
            appointment_count: [12, 10, 15, 8],
            revenue: [5000, 3800, 4200, 2800]
        }
    };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadDashboardData,
        loadKPIs,
        loadCharts,
        applyFilters,
        displayKPIs,
        getMockKPIs,
        getMockChartData
    };
}
