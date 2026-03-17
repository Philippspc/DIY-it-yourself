// --- 1. DATA STORAGE ---
let diyDatabase = JSON.parse(localStorage.getItem('diy_data')) || [
    { id: 1, title: "Build a Garden Bed", content: "https://youtube.com/watch?v=diy-garden", likes: 0, dislikes: 0, type: "extern", image: "" }
];

let allUsers = JSON.parse(localStorage.getItem('diy_all_users')) || [
    { name: "Admin", bio: "Creator of this app.", pfp: "", pass: "1234" }
];

let currentUser = JSON.parse(localStorage.getItem('diy_current_session')) || null;

// --- 2. NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'flex';
}

function handleProfileClick() {
    if (currentUser) {
        updateProfileUI();
        showSection('profile');
    } else {
        toggleLogin();
    }
}

// --- 3. LOGIN & AUTH ---
function toggleLogin() {
    const modal = document.getElementById('login-modal');
    modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'flex' : 'none';
}

function performLogin() {
    const name = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();

    if (!name || !pass) return alert("Please fill all fields!");

    let foundUser = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (foundUser) {
        if (foundUser.pass === pass) {
            currentUser = foundUser;
        } else {
            return alert("Wrong password!");
        }
    } else {
        currentUser = { name: name, bio: "New maker in the house.", pfp: "", pass: pass };
        allUsers.push(currentUser);
        localStorage.setItem('diy_all_users', JSON.stringify(allUsers));
    }

    localStorage.setItem('diy_current_session', JSON.stringify(currentUser));
    location.reload();
}

function logout() {
    localStorage.removeItem('diy_current_session');
    location.reload();
}

// --- 4. PROFILE EDIT ---
function openPfpDialog() {
    const newPfp = prompt("Enter Image URL for your profile picture:");
    if (newPfp !== null) {
        currentUser.pfp = newPfp;
        saveToGlobalUsers();
        updateProfileUI();
    }
}

function saveProfile() {
    currentUser.bio = document.getElementById('edit-bio').value || currentUser.bio;
    saveToGlobalUsers();
    alert("Profile Updated!");
    updateProfileUI();
}

function saveToGlobalUsers() {
    const idx = allUsers.findIndex(u => u.name === currentUser.name);
    if (idx !== -1) allUsers[idx] = currentUser;
    localStorage.setItem('diy_all_users', JSON.stringify(allUsers));
    localStorage.setItem('diy_current_session', JSON.stringify(currentUser));
}

function updateProfileUI() {
    if (!currentUser) return;
    document.getElementById('profile-name-display').innerText = currentUser.name;
    document.getElementById('profile-bio-display').innerText = currentUser.bio;
    document.getElementById('login-btn').innerText = "Profile: " + currentUser.name;
    const pfp = document.getElementById('pfp-display');
    if (currentUser.pfp) {
        pfp.style.backgroundImage = `url('${currentUser.pfp}')`;
        pfp.innerText = "";
    }
}

// --- 5. SEARCH LOGIC ---
function handleSearch() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    if (query.length < 1) return;
    showSection('app-content');
    renderResults(query);
}

function renderResults(query) {
    const container = document.getElementById('results-container');
    container.innerHTML = "";
    
    // Search Users
    const usersFound = allUsers.filter(u => u.name.toLowerCase().includes(query));
    usersFound.forEach(user => {
        container.innerHTML += `
            <div class="video-card" style="border: 2px solid var(--bright-lime); background: #f0f7f0;">
                <div style="padding: 20px; text-align: center;">
                    <div style="width: 60px; height: 60px; margin: 0 auto; border-radius: 50%; background: #eee; background-image: url('${user.pfp}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center;">
                        ${!user.pfp ? '👤' : ''}
                    </div>
                    <h3>${user.name}</h3>
                    <p style="font-size: 0.8rem;">${user.bio}</p>
                </div>
            </div>`;
    });

    // Search Projects
    const postsFound = diyDatabase.filter(p => p.title.toLowerCase().includes(query));
    postsFound.forEach(item => {
        const isExtern = item.type === "extern";
        container.innerHTML += `
            <div class="video-card">
                <div onclick="${isExtern ? `window.open('${item.content}', '_blank')` : ''}" style="cursor: pointer; padding: 15px;">
                    <h3>${item.title}</h3>
                    <p style="font-size: 0.85rem; color: #666;">${item.content}</p>
                </div>
            </div>`;
    });
}

function uploadPost() {
    const title = prompt("Project Title:");
    const content = prompt("Description or URL:");
    if (title && content) {
        diyDatabase.push({ id: Date.now(), title, content, likes: 0, dislikes: 0, type: "intern" });
        localStorage.setItem('diy_data', JSON.stringify(diyDatabase));
        location.reload();
    }
}

if(currentUser) updateProfileUI();