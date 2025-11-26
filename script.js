// Global variables
let facultyData = [];
let charts = {};

// Sample data (will be replaced when CSV is uploaded)
const sampleData = [
    {
        Name: "Dr. Rajesh Kumar", Designation: "Professor", Department: "Computer Science and Engineering",
        "Domain Category": "AI & ML", "Primary Domain": "machine learning",
        "No. of Journal Publications": 45, "No. of Conference Publications": 32, "Book/Chapter": 5,
        "Research Projects - Completed": 8, "Research Projects - Ongoing": 3,
        "Total Publications": 82, Total_Projects: 11
    },
    {
        Name: "Dr. Priya Sharma", Designation: "Associate Professor", Department: "Electronics & Communication Engineering",
        "Domain Category": "Signal Processing & Control", "Primary Domain": "signal processing",
        "No. of Journal Publications": 38, "No. of Conference Publications": 28, "Book/Chapter": 3,
        "Research Projects - Completed": 6, "Research Projects - Ongoing": 2,
        "Total Publications": 69, Total_Projects: 8
    },
    {
        Name: "Dr. Amit Singh", Designation: "Professor", Department: "Mechanical Engineering",
        "Domain Category": "Mechanical & Manufacturing", "Primary Domain": "manufacturing",
        "No. of Journal Publications": 52, "No. of Conference Publications": 35, "Book/Chapter": 7,
        "Research Projects - Completed": 10, "Research Projects - Ongoing": 4,
        "Total Publications": 94, Total_Projects: 14
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    facultyData = [...sampleData];
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupEventListeners();
    updateFilters();
    renderOverview();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const view = e.target.dataset.view;
            showView(view);
        });
    });

    // File upload
    const csvFile = document.getElementById('csvFile');
    const uploadArea = document.getElementById('uploadArea');
    
    if (csvFile) {
        csvFile.addEventListener('change', handleFileSelect);
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                parseCSV(file);
            }
        });
    }

    // Filters
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('deptFilter')?.addEventListener('change', applyFilters);
    document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);

    // Modal close
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('deptDetailModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'deptDetailModal') closeModal();
    });
}

// Show specific view
function showView(view) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    const filterSection = document.getElementById('filters-section');
    
    switch(view) {
        case 'overview':
            filterSection.style.display = 'block';
            document.getElementById('overview-section').style.display = 'block';
            renderOverview();
            break;
        case 'faculty':
            filterSection.style.display = 'block';
            document.getElementById('faculty-section').style.display = 'block';
            renderFaculty();
            break;
        case 'departments':
            filterSection.style.display = 'none';
            document.getElementById('departments-section').style.display = 'block';
            renderDepartments();
            break;
        case 'upload':
            filterSection.style.display = 'none';
            document.getElementById('upload-section').style.display = 'block';
            break;
    }
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) parseCSV(file);
}

// Parse CSV file
function parseCSV(file) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = 'Parsing CSV file...';
    statusDiv.className = 'upload-status';
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            if (results.data && results.data.length > 0) {
                facultyData = results.data;
                statusDiv.textContent = `✓ Successfully loaded ${facultyData.length} faculty records!`;
                statusDiv.className = 'upload-status success';
                
                setTimeout(() => {
                    updateFilters();
                    showView('overview');
                    document.querySelector('[data-view="overview"]').click();
                }, 1500);
            } else {
                statusDiv.textContent = '✗ Error: No data found in CSV file';
                statusDiv.className = 'upload-status error';
            }
        },
        error: (error) => {
            statusDiv.textContent = `✗ Error parsing CSV: ${error.message}`;
            statusDiv.className = 'upload-status error';
        }
    });
}

// Update filter options
function updateFilters() {
    const departments = ['All', ...new Set(facultyData.map(f => f.Department).filter(Boolean))];
    const categories = ['All', ...new Set(facultyData.map(f => f['Domain Category']).filter(Boolean))];
    
    const deptFilter = document.getElementById('deptFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (deptFilter) {
        deptFilter.innerHTML = departments.map(d => `<option value="${d}">${d}</option>`).join('');
    }
    
    if (categoryFilter) {
        categoryFilter.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

// Apply filters
function applyFilters() {
    const currentView = document.querySelector('.nav-btn.active').dataset.view;
    if (currentView === 'overview') {
        renderOverview();
    } else if (currentView === 'faculty') {
        renderFaculty();
    }
}

// Get filtered data
function getFilteredData() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedDept = document.getElementById('deptFilter')?.value || 'All';
    const selectedCategory = document.getElementById('categoryFilter')?.value || 'All';
    
    return facultyData.filter(prof => {
        const matchesSearch = !searchTerm || (prof.Name && prof.Name.toLowerCase().includes(searchTerm));
        const matchesDept = selectedDept === 'All' || prof.Department === selectedDept;
        const matchesCategory = selectedCategory === 'All' || prof['Domain Category'] === selectedCategory;
        return matchesSearch && matchesDept && matchesCategory;
    });
}

// Render Overview
function renderOverview() {
    const filtered = getFilteredData();
    
    // Update stats
    const totalFaculty = filtered.length;
    const totalPublications = filtered.reduce((sum, f) => sum + (f['Total Publications'] || 0), 0);
    const totalProjects = filtered.reduce((sum, f) => sum + (f.Total_Projects || 0), 0);
    const avgPublications = totalFaculty > 0 ? Math.round(totalPublications / totalFaculty) : 0;
    
    document.getElementById('totalFaculty').textContent = totalFaculty;
    document.getElementById('totalPublications').textContent = totalPublications;
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('avgPublications').textContent = avgPublications;
    
    // Render charts
    renderDepartmentChart(filtered);
    renderDomainChart(filtered);
    renderScatterChart(filtered);
    renderTopPerformersTable(filtered);
}

// Render Department Chart
function renderDepartmentChart(data) {
    const deptData = {};
    data.forEach(prof => {
        const dept = prof.Department || 'Unknown';
        if (!deptData[dept]) {
            deptData[dept] = 0;
        }
        deptData[dept] += prof['Total Publications'] || 0;
    });
    
    const sortedDepts = Object.entries(deptData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx = document.getElementById('deptChart');
    if (charts.deptChart) charts.deptChart.destroy();
    
    charts.deptChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDepts.map(d => d[0]),
            datasets: [{
                label: 'Publications',
                data: sortedDepts.map(d => d[1]),
                backgroundColor: 'rgba(78, 205, 196, 0.8)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    titleColor: '#4ECDC4',
                    bodyColor: '#E5E7EB',
                    borderColor: '#4ECDC4',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF', maxRotation: 45, minRotation: 45 },
                    grid: { color: 'rgba(107, 114, 128, 0.1)' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(107, 114, 128, 0.1)' }
                }
            }
        }
    });
}

// Render Domain Chart
function renderDomainChart(data) {
    const domainData = {};
    data.forEach(prof => {
        const domain = prof['Domain Category'] || 'Other';
        domainData[domain] = (domainData[domain] || 0) + 1;
    });
    
    const colors = ['#4ECDC4', '#F4A541', '#FF6B6B', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];
    
    const ctx = document.getElementById('domainChart');
    if (charts.domainChart) charts.domainChart.destroy();
    
    charts.domainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(domainData),
            datasets: [{
                data: Object.values(domainData),
                backgroundColor: colors,
                borderColor: '#1a2332',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#E5E7EB', padding: 15 }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    titleColor: '#4ECDC4',
                    bodyColor: '#E5E7EB',
                    borderColor: '#4ECDC4',
                    borderWidth: 1
                }
            }
        }
    });
}

// Render Scatter Chart
function renderScatterChart(data) {
    const scatterData = data.map(prof => ({
        x: prof.Total_Projects || 0,
        y: prof['Total Publications'] || 0,
        label: prof.Name
    }));
    
    const ctx = document.getElementById('scatterChart');
    if (charts.scatterChart) charts.scatterChart.destroy();
    
    charts.scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Faculty',
                data: scatterData,
                backgroundColor: 'rgba(78, 205, 196, 0.6)',
                borderColor: 'rgba(78, 205, 196, 1)',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    titleColor: '#4ECDC4',
                    bodyColor: '#E5E7EB',
                    borderColor: '#4ECDC4',
                    borderWidth: 1,
                    callbacks: {
                        title: (context) => context[0].raw.label,
                        label: (context) => `Publications: ${context.parsed.y}, Projects: ${context.parsed.x}`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Total Projects', color: '#9CA3AF' },
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(107, 114, 128, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Total Publications', color: '#9CA3AF' },
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(107, 114, 128, 0.1)' }
                }
            }
        }
    });
}

// Render Top Performers Table
function renderTopPerformersTable(data) {
    const sorted = [...data].sort((a, b) => (b['Total Publications'] || 0) - (a['Total Publications'] || 0)).slice(0, 20);
    const tbody = document.getElementById('topPerformersTable');
    
    tbody.innerHTML = sorted.map((prof, idx) => {
        const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
                <td style="color: white; font-weight: 600;">${prof.Name || 'N/A'}</td>
                <td style="color: #D1D5DB; font-size: 13px;">${(prof.Department || 'N/A').substring(0, 30)}...</td>
                <td><span class="domain-badge">${prof['Domain Category'] || 'N/A'}</span></td>
                <td style="text-align: right; color: #4ECDC4; font-weight: 700;">${prof['Total Publications'] || 0}</td>
                <td style="text-align: right; color: #D1D5DB;">${prof.Total_Projects || 0}</td>
            </tr>
        `;
    }).join('');
}

// Render Faculty Cards
function renderFaculty() {
    const filtered = getFilteredData();
    const grid = document.getElementById('facultyGrid');
    
    grid.innerHTML = filtered.map(prof => `
        <div class="faculty-card">
            <div class="faculty-header">
                <div>
                    <div class="faculty-name">${prof.Name || 'N/A'}</div>
                    <div class="faculty-designation">${prof.Designation || 'N/A'}</div>
                </div>
                <div class="faculty-pubs-badge">${prof['Total Publications'] || 0} Pubs</div>
            </div>
            <div class="faculty-info">
                <div class="faculty-info-row">
                    <span class="faculty-info-label">Department:</span>
                    <span class="faculty-info-value">${(prof.Department || 'N/A').substring(0, 25)}...</span>
                </div>
                <div class="faculty-info-row">
                    <span class="faculty-info-label">Domain:</span>
                    <span class="faculty-info-value" style="color: #4ECDC4;">${prof['Domain Category'] || 'N/A'}</span>
                </div>
            </div>
            <div class="faculty-stats">
                <div class="faculty-stat">
                    <div class="faculty-stat-value stat-journals">${prof['No. of Journal Publications'] || 0}</div>
                    <div class="faculty-stat-label">Journals</div>
                </div>
                <div class="faculty-stat">
                    <div class="faculty-stat-value stat-conferences">${prof['No. of Conference Publications'] || 0}</div>
                    <div class="faculty-stat-label">Conferences</div>
                </div>
                <div class="faculty-stat">
                    <div class="faculty-stat-value stat-books">${prof['Book/Chapter'] || 0}</div>
                    <div class="faculty-stat-label">Books</div>
                </div>
                <div class="faculty-stat">
                    <div class="faculty-stat-value stat-projects">${prof.Total_Projects || 0}</div>
                    <div class="faculty-stat-label">Projects</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render Departments
function renderDepartments() {
    const deptStats = {};
    
    facultyData.forEach(prof => {
        const dept = prof.Department || 'Unknown';
        if (!deptStats[dept]) {
            deptStats[dept] = {
                faculty: 0,
                publications: 0,
                projects: 0,
                domains: new Set()
            };
        }
        deptStats[dept].faculty++;
        deptStats[dept].publications += prof['Total Publications'] || 0;
        deptStats[dept].projects += prof.Total_Projects || 0;
        if (prof['Domain Category']) deptStats[dept].domains.add(prof['Domain Category']);
    });
    
    const grid = document.getElementById('departmentsGrid');
    grid.innerHTML = Object.entries(deptStats).map(([dept, stats]) => `
        <div class="dept-card" onclick="showDepartmentDetail('${dept}')">
            <div class="dept-name">${dept}</div>
            <div class="dept-stats-grid">
                <div class="dept-stat">
                    <div class="dept-stat-value">${stats.faculty}</div>
                    <div class="dept-stat-label">Faculty</div>
                </div>
                <div class="dept-stat">
                    <div class="dept-stat-value">${stats.publications}</div>
                    <div class="dept-stat-label">Publications</div>
                </div>
                <div class="dept-stat">
                    <div class="dept-stat-value">${stats.projects}</div>
                    <div class="dept-stat-label">Projects</div>
                </div>
                <div class="dept-stat">
                    <div class="dept-stat-value">${stats.domains.size}</div>
                    <div class="dept-stat-label">Domains</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Show Department Detail Modal
function showDepartmentDetail(deptName) {
    const deptData = facultyData.filter(f => f.Department === deptName);
    
    document.getElementById('modalDeptName').textContent = deptName;
    document.getElementById('deptDetailModal').classList.add('active');
    
    // Domain distribution
    const domainData = {};
    deptData.forEach(prof => {
        const domain = prof['Domain Category'] || 'Other';
        domainData[domain] = (domainData[domain] || 0) + 1;
    });
    
    const colors = ['#4ECDC4', '#F4A541', '#FF6B6B', '#95E1D3', '#F38181', '#AA96DA'];
    const modalDomainCtx = document.getElementById('modalDomainChart');
    if (charts.modalDomain) charts.modalDomain.destroy();
    
    charts.modalDomain = new Chart(modalDomainCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(domainData),
            datasets: [{
                data: Object.values(domainData),
                backgroundColor: colors,
                borderColor: '#1a2332',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E5E7EB' } }
            }
        }
    });
    
    // Publication type distribution
    const pubTypes = {
        'Journals': deptData.reduce((sum, f) => sum + (f['No. of Journal Publications'] || 0), 0),
        'Conferences': deptData.reduce((sum, f) => sum + (f['No. of Conference Publications'] || 0), 0),
        'Books': deptData.reduce((sum, f) => sum + (f['Book/Chapter'] || 0), 0)
    };
    
    const modalPubTypeCtx = document.getElementById('modalPubTypeChart');
    if (charts.modalPubType) charts.modalPubType.destroy();
    
    charts.modalPubType = new Chart(modalPubTypeCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(pubTypes),
            datasets: [{
                data: Object.values(pubTypes),
                backgroundColor: ['#44A8FF', '#A855F7', '#F4A541'],
                borderColor: '#1a2332',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#E5E7EB' } }
            }
        }
    });
    
    // Top 5 faculty
    const top5 = [...deptData].sort((a, b) => (b['Total Publications'] || 0) - (a['Total Publications'] || 0)).slice(0, 5);
    
    const modalTopFacultyCtx = document.getElementById('modalTopFacultyChart');
    if (charts.modalTopFaculty) charts.modalTopFaculty.destroy();
    
    charts.modalTopFaculty = new Chart(modalTopFacultyCtx, {
        type: 'bar',
        data: {
            labels: top5.map(f => (f.Name || 'N/A').substring(0, 20)),
            datasets: [{
                label: 'Publications',
                data: top5.map(f => f['Total Publications'] || 0),
                backgroundColor: 'rgba(78, 205, 196, 0.8)',
                borderColor: '#4ECDC4',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(107, 114, 128, 0.1)' } },
                y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(107, 114, 128, 0.1)' } }
            }
        }
    });
    
    // Publications vs Projects scatter
    const scatterData = deptData.map(prof => ({
        x: prof.Total_Projects || 0,
        y: prof['Total Publications'] || 0
    }));
    
    const modalScatterCtx = document.getElementById('modalScatterChart');
    if (charts.modalScatter) charts.modalScatter.destroy();
    
    charts.modalScatter = new Chart(modalScatterCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                data: scatterData,
                backgroundColor: 'rgba(78, 205, 196, 0.6)',
                borderColor: '#4ECDC4',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    title: { display: true, text: 'Projects', color: '#9CA3AF' },
                    ticks: { color: '#9CA3AF' }, 
                    grid: { color: 'rgba(107, 114, 128, 0.1)' } 
                },
                y: { 
                    title: { display: true, text: 'Publications', color: '#9CA3AF' },
                    ticks: { color: '#9CA3AF' }, 
                    grid: { color: 'rgba(107, 114, 128, 0.1)' } 
                }
            }
        }
    });
    
    // Faculty table
    const modalFacultyTable = document.getElementById('modalFacultyTable');
    modalFacultyTable.innerHTML = deptData.map(prof => `
        <tr>
            <td style="color: white; font-weight: 600;">${prof.Name || 'N/A'}</td>
            <td>${prof.Designation || 'N/A'}</td>
            <td><span class="domain-badge">${prof['Domain Category'] || 'N/A'}</span></td>
            <td style="text-align: center;">${prof['No. of Journal Publications'] || 0}</td>
            <td style="text-align: center;">${prof['No. of Conference Publications'] || 0}</td>
            <td style="text-align: center;">${prof['Book/Chapter'] || 0}</td>
            <td style="text-align: center;">${prof.Total_Projects || 0}</td>
            <td style="text-align: center; color: #4ECDC4; font-weight: 700;">${prof['Total Publications'] || 0}</td>
        </tr>
    `).join('');
}

// Close modal
function closeModal() {
    document.getElementById('deptDetailModal').classList.remove('active');
}