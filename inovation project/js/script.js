/**
 * Community Help Platform - Main JavaScript File
 * Contains all application logic, utilities, and class definitions
 */

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Displays a toast notification with the given message
 * @param {string} message - The message to display in the toast
 */
function showAlert(message) {
    document.getElementById("toastMsg").innerText = message;
    var toast = new bootstrap.Toast(document.getElementById('liveToast'));
    toast.show();
}

/**
 * Redirects to the specified page
 * @param {string} page - The page URL to redirect to
 */
function redirect(page) {
    window.location.href = page;
}

/**
 * Toggles dark mode on the body element
 */
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

/**
 * Gets the badge name based on user points
 * @param {number} points - The user's current points
 * @returns {string} The badge name
 */
function getBadge(points) {
    if (points >= 50) return 'Hero';
    if (points >= 10) return 'Helper';
    return 'Beginner';
}

// ==========================================
// LOCAL STORAGE UTILITIES
// ==========================================

/**
 * Gets data from localStorage with fallback to empty array
 * @param {string} key - The localStorage key
 * @returns {Array} Parsed data or empty array
 */
function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * Saves data to localStorage
 * @param {string} key - The localStorage key
 * @param {any} data - The data to save
 */
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Updates user points and saves to storage
 * @param {number} pointsToAdd - Points to add to current user
 */
function updateUserPoints(pointsToAdd) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    currentUser.points = (currentUser.points || 0) + pointsToAdd;

    const users = getFromStorage('users');
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) {
        users[index] = currentUser;
        saveToStorage('users', users);
        saveToStorage('currentUser', currentUser);
    }

    return currentUser.points;
}

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Handles user login process
 */
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    if (!email || !password) {
        errorMsg.textContent = 'Please enter email and password.';
        errorMsg.style.display = 'block';
        return;
    }

    const users = getFromStorage('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        saveToStorage('currentUser', user);
        localStorage.setItem('isLoggedIn', 'true');
        redirect('index.html');
    } else {
        errorMsg.textContent = 'Invalid email or password.';
        errorMsg.style.display = 'block';
    }
}

/**
 * Shows registration message on the registration page
 */
function showRegisterMessage(message, isSuccess = true) {
    const messageEl = document.getElementById('registerMsg');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.className = isSuccess ? 'text-success mt-2' : 'text-danger mt-2';
    messageEl.style.display = 'block';
}

/**
 * Handles user registration process
 */
function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const location = document.getElementById('regLocation').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value.trim();

    if (!name || !email || !phone || !location || role === 'Select Role' || !password) {
        showRegisterMessage('Please fill in all fields.', false);
        return;
    }

    const users = getFromStorage('users');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showRegisterMessage('Email already registered.', false);
        return;
    }

    users.push({ name, email, phone, location, role, password, points: 0 });
    saveToStorage('users', users);
    showRegisterMessage('Registration successful! Redirecting to login...', true);

    setTimeout(() => {
        redirect('login.html');
    }, 1200);
}

/**
 * Returns whether the user is currently logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Redirects unauthorized pages back to login
 */
function protectPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!isLoggedIn() || !currentUser) {
        localStorage.removeItem('currentUser');
        localStorage.setItem('isLoggedIn', 'false');
        redirect('login.html');
    }
}

/**
 * Logs out the current user and redirects to login
 */
function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.setItem('isLoggedIn', 'false');
    redirect('login.html');
}

// ==========================================
// DASHBOARD FUNCTIONS
// ==========================================

/**
 * Updates dashboard statistics
 */
function updateStats() {
    // Blood requests stats
    const bloodRequests = getFromStorage('bloodRequests');
    const totalBlood = bloodRequests.length;
    const criticalBlood = bloodRequests.filter(r => r.urgency === 'Critical').length;
    document.getElementById('bloodStats').textContent = `Total: ${totalBlood} | Critical: ${criticalBlood}`;

    // Lost & Found posts
    const lostPosts = getFromStorage('lostFoundPosts');
    document.getElementById('lostStats').textContent = `Total Posts: ${lostPosts.length}`;

    // Volunteers (users with role 'Volunteer')
    const users = getFromStorage('users');
    const totalVolunteers = users.filter(u => u.role === 'Volunteer').length;
    document.getElementById('volunteerStats').textContent = `Total Volunteers: ${totalVolunteers}`;
}

// ==========================================
// USER ACTION FUNCTIONS
// ==========================================

/**
 * Handles blood donation action
 */
function donateBlood() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showAlert('Please login to donate blood.');
        return;
    }

    const newPoints = updateUserPoints(10);
    showAlert(`Thank you for donating! You earned 10 points. Badge: ${getBadge(newPoints)}`);
}

/**
 * Handles joining volunteer event action
 */
function joinEvent() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showAlert('Please login to join events.');
        return;
    }

    const newPoints = updateUserPoints(5);
    showAlert(`You joined this event! You earned 5 points. Badge: ${getBadge(newPoints)}`);
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================

/**
 * Updates navbar based on authentication state
 */
function updateNavbar() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (isLoggedIn && currentUser) {
        authButtons.innerHTML = `
            <span class="navbar-text me-3 text-light">
                Welcome, ${currentUser.name} (${getBadge(currentUser.points || 0)})
            </span>
            <button class="btn btn-outline-danger btn-sm" id="logoutBtn">Logout</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-outline-light btn-sm">Login</a>
            <a href="register.html" class="btn btn-primary btn-sm">Register</a>
        `;
    }
}

// ==========================================
// CLASS DEFINITIONS
// ==========================================

/**
 * Manages blood donation requests
 */
class BloodRequestManager {
    constructor() {
        this.requests = getFromStorage('bloodRequests');
        this.init();
    }

    init() {
        this.displayRequests();
        document.getElementById('submitBtn').addEventListener('click', (e) => this.handleSubmit(e));
        document.getElementById('locationFilter').addEventListener('input', (e) => {
            this.displayRequests(e.target.value.trim());
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const bloodGroup = document.getElementById('bloodGroup').value.trim();
        const hospital = document.getElementById('hospital').value.trim();
        const location = document.getElementById('location').value.trim();
        const contact = document.getElementById('contact').value.trim();
        const notes = document.getElementById('notes').value.trim();
        let urgency = document.getElementById('urgency').value;

        if (!bloodGroup || !hospital || !location || !contact || urgency === 'Urgency Level') {
            this.showToast('danger', 'Please fill in all fields.');
            return;
        }

        // Smart urgency detection
        const textToAnalyze = `${hospital} ${location} ${notes}`.toLowerCase();
        const detectedUrgency = this.detectUrgency(textToAnalyze);
        if (detectedUrgency !== 'Normal') {
            urgency = detectedUrgency;
        }

        const request = { bloodGroup, hospital, location, contact, notes, urgency };
        this.requests.push(request);
        this.saveRequests();
        this.clearForm();
        this.displayRequests(document.getElementById('locationFilter').value.trim());
        this.showToast('success', 'Request submitted successfully!');
        if (urgency === 'Critical') {
            setTimeout(() => this.showToast('danger', '🚨 Critical blood request added! Urgent attention needed.'), 1000);
        }
    }

    saveRequests() {
        saveToStorage('bloodRequests', this.requests);
    }

    clearForm() {
        document.getElementById('bloodGroup').value = '';
        document.getElementById('hospital').value = '';
        document.getElementById('location').value = '';
        document.getElementById('contact').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('urgency').selectedIndex = 0;
    }

    displayRequests(filter = '') {
        const container = document.getElementById('requestsContainer');
        container.innerHTML = '';
        const filtered = filter ? this.requests.filter(r => r.location.toLowerCase().includes(filter.toLowerCase())) : this.requests;
        filtered.forEach((request, index) => {
            const card = this.createCard(request, index);
            container.appendChild(card);
        });
    }

    createCard(request, index) {
        const card = document.createElement('div');
        card.className = 'glass-card p-4 mb-3';

        const urgencyClass = this.getUrgencyClass(request.urgency);

        card.innerHTML = `
            <h5 class="fw-bold">${request.bloodGroup} Needed at ${request.hospital}</h5>
            <p>
                <i class="fa-solid fa-location-dot"></i>
                ${request.location} |
                <span class="${urgencyClass} fw-bold">Urgency: ${request.urgency}</span>
            </p>
            <p>Contact: ${request.contact}</p>
            ${request.notes ? `<p>Notes: ${request.notes}</p>` : ''}
            <button class="btn btn-primary w-100 rounded-pill" onclick="donateBlood()">
                ❤️ I Can Donate
            </button>
        `;
        return card;
    }

    getUrgencyClass(urgency) {
        switch (urgency) {
            case 'Critical': return 'text-danger';
            case 'Urgent': return 'text-warning';
            case 'Normal': return 'text-success';
            default: return 'text-secondary';
        }
    }

    detectUrgency(text) {
        if (text.includes('urgent') || text.includes('immediately') || text.includes('emergency')) {
            return 'Critical';
        } else if (text.includes('soon')) {
            return 'Urgent';
        } else {
            return 'Normal';
        }
    }

    showToast(type = 'success', message) {
        const toastEl = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastMsg');
        toastBody.textContent = message;
        toastEl.classList.remove('text-bg-success', 'text-bg-warning', 'text-bg-danger');
        toastEl.classList.add(`text-bg-${type}`);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

/**
 * Manages lost and found posts
 */
class LostFoundManager {
    constructor() {
        this.posts = getFromStorage('lostFoundPosts');
        this.init();
    }

    init() {
        this.displayPosts();
        document.getElementById('submitPost').addEventListener('click', (e) => this.handleSubmit(e));
        document.getElementById('imageUpload').addEventListener('change', (e) => this.previewImage(e));
    }

    previewImage(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('imagePreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const item = document.getElementById('itemName').value.trim();
        const description = document.getElementById('description').value.trim();
        const location = document.getElementById('lfLocation').value.trim();
        const date = document.getElementById('date').value;
        const image = document.getElementById('imagePreview').src || '';

            if (!item || !description || !location || !date) {
            this.showToast('danger', 'Please fill in all fields.');
            return;
        }

        const post = { item, description, location, date, image };
        this.posts.push(post);
        this.savePosts();
        this.clearForm();
        this.displayPosts();
        this.showToast('success', 'Lost & Found post added successfully!');
    }

    savePosts() {
        saveToStorage('lostFoundPosts', this.posts);
    }

    clearForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('description').value = '';
        document.getElementById('lfLocation').value = '';
        document.getElementById('date').value = '';
        document.getElementById('imageUpload').value = '';
        document.getElementById('imagePreview').style.display = 'none';
    }

    displayPosts() {
        const container = document.getElementById('postsContainer');
        container.innerHTML = '';
        this.posts.forEach((post) => {
            const card = this.createCard(post);
            container.appendChild(card);
        });
    }

    createCard(post) {
        const card = document.createElement('div');
        card.className = 'glass-card p-4 mb-3';
        card.innerHTML = `
            <h5 class="fw-bold">${post.item}</h5>
            <p>${post.description}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${post.location} | 📅 ${post.date}</p>
            ${post.image ? `<img src="${post.image}" style="max-width:100%; height:200px; object-fit:cover; margin-bottom:10px;" />` : ''}
            <button class="btn btn-primary w-100 rounded-pill">This Might Be Mine</button>
        `;
        return card;
    }

    showToast(type = 'success', message) {
        const toastEl = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastMsg');
        toastBody.textContent = message;
        toastEl.classList.remove('text-bg-success', 'text-bg-warning', 'text-bg-danger');
        toastEl.classList.add(`text-bg-${type}`);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

/**
 * Manages volunteer events
 */
class VolunteerEventManager {
    constructor() {
        this.events = getFromStorage('volunteerEvents');
        this.init();
    }

    init() {
        this.displayEvents();
        document.getElementById('postEvent').addEventListener('click', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value.trim();
        const type = document.getElementById('eventType').value.trim();
        const date = document.getElementById('eventDate').value;
        const location = document.getElementById('eventLocation').value.trim();
        const volunteersNeeded = document.getElementById('volunteersNeeded').value.trim();

        if (!title || !type || !date || !location || !volunteersNeeded) {
            this.showToast('danger', 'Please fill in all fields.');
            return;
        }

        const event = { title, type, date, location, volunteersNeeded };
        this.events.push(event);
        this.saveEvents();
        this.clearForm();
        this.displayEvents();
        this.showToast('success', 'Event posted successfully!');
    }

    saveEvents() {
        saveToStorage('volunteerEvents', this.events);
    }

    clearForm() {
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventType').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('volunteersNeeded').value = '';
    }

    displayEvents() {
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';
        this.events.forEach((event) => {
            const card = this.createCard(event);
            container.appendChild(card);
        });
    }

    createCard(event) {
        const card = document.createElement('div');
        card.className = 'glass-card p-4 mb-3';
        card.innerHTML = `
            <h5 class="fw-bold">${event.title}</h5>
            <p><strong>Type:</strong> ${event.type}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${event.location} | 📅 ${event.date}</p>
            <p><strong>Volunteers Needed:</strong> ${event.volunteersNeeded}</p>
            <button class="btn btn-primary w-100 rounded-pill" onclick="joinEvent()">
                Join Event
            </button>
        `;
        return card;
    }

    showToast(type = 'success', message) {
        const toastEl = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastMsg');
        toastBody.textContent = message;
        toastEl.classList.remove('text-bg-success', 'text-bg-warning', 'text-bg-danger');
        toastEl.classList.add(`text-bg-${type}`);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}
