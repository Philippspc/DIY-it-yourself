// --- 1. DATA STORAGE ---
let diyDatabase = JSON.parse(localStorage.getItem('diy_data')) || [
    { id: 1, title: "Garden Bed", content: "https://youtube.com/watch?v=diy-garden", type: "extern" }
];
let allUsers = JSON.parse(localStorage.getItem('diy_all_users')) || [
    { name: "Admin", bio: "Creator of DIY it yourself.", pfp: "", pass: "1234" }
];
let currentUser = JSON.parse(localStorage.getItem('diy_current_session')) || null;

// --- 2. BACKEND CONFIGURATION ---
// REPLACE THIS URL with your actual Render URL (e.g., https://my-backend.onrender.com)
const BACKEND_URL = "https://DEIN-PROJEKTNAME.onrender.com/ask-ai";

// --- 3. NAVIGATION & UI ---
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

// --- 4. AUTHENTICATION ---
function toggleLogin() {
    const modal = document.getElementById('login-modal');
    modal.style.display = (modal.style.display === 'none') ? 'flex' : 'none';
}

function performLogin() {
    const name = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    if (!name || !pass) return alert("Please fill all fields!");

    let foundUser = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (foundUser && foundUser.pass === pass) { 
        currentUser = foundUser; 
    } 
    else if (!foundUser) {
        // Simple registration logic
        currentUser = { name: name, bio: "New maker in the community.", pfp: "", pass: pass };
        allUsers.push(currentUser);
        localStorage.setItem('diy_all_users', JSON.stringify(allUsers));
    } else { 
        return alert("Wrong password!"); 
    }

    localStorage.setItem('diy_current_session', JSON.stringify(currentUser));
    location.reload();
}

function logout() { 
    localStorage.removeItem('diy_current_session'); 
    location.reload(); 
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

function saveProfile() {
    currentUser.bio = document.getElementById('edit-bio').value || currentUser.bio;
    const idx = allUsers.findIndex(u => u.name === currentUser.name);
    if (idx !== -1) allUsers[idx] = currentUser;
    localStorage.setItem('diy_all_users', JSON.stringify(allUsers));
    localStorage.setItem('diy_current_session', JSON.stringify(currentUser));
    updateProfileUI();
    alert("Profile saved!");
}

function openPfpDialog() {
    const p = prompt("Enter Image URL for your profile picture:");
    if (p) { 
        currentUser.pfp = p; 
        saveProfile(); 
        location.reload(); 
    }
}

// --- 5. SEARCH & AI BRAIN ---
function handleSearch() {
    const q = document.getElementById('search-input').value.trim();
    if (q) { 
        showSection('app-content'); 
        renderResults(q.toLowerCase()); 
    }
}

async function askAI(query) {
    const container = document.getElementById('results-container');
    const aiCard = document.createElement('div');
    aiCard.className = "video-card";
    aiCard.style.gridColumn = "1 / -1";
    aiCard.style.background = "rgba(118, 176, 65, 0.1)";
    aiCard.innerHTML = `
        <div style="padding:20px;">
            <h3>🤖 AI is thinking...</h3>
            <p>Asking the Global Maker Brain for "${query}"...</p>
        </div>`;
    container.appendChild(aiCard);

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            aiCard.innerHTML = `
                <div style="padding:20px;">
                    <h3 style="color:var(--leaf-green); display:flex; align-items:center; gap:10px;">
                        <span>🤖</span> AI Guide: ${query}
                    </h3>
                    <div style="text-align:left; margin-top:15px; line-height:1.6; font-size:0.95rem;">
                        ${aiText.replace(/\n/g, '<br>')}
                    </div>
                    <p style="font-size:0.7rem; margin-top:20px; opacity:0.5;">Verified AI instructions via DIY-Backend</p>
                </div>`;
        } else {
            throw new Error("Invalid response");
        }
    } catch (error) {
        aiCard.innerHTML = `
            <div style="padding:20px;">
                <h3>🤖 AI is warming up...</h3>
                <p>Free servers sleep after 15 mins. It takes ~30s to wake up. Please wait and click search again.</p>
                <button onclick="handleSearch()" style="margin-top:10px; font-size:0.8rem; background:var(--bright-lime); color:black;">Retry Search</button>
            </div>`;
    }
}

function renderResults(query) {
    const container = document.getElementById('results-container');
    container.innerHTML = "";
    
    // Filter Users and Posts from Local DB
    const users = allUsers.filter(u => u.name.toLowerCase().includes(query));
    const posts = diyDatabase.filter(p => p.title.toLowerCase().includes(query));

    // Show found Users
    users.forEach(u => {
        container.innerHTML += `
            <div class="video-card" style="border:2px solid var(--bright-lime); padding:20px; text-align:center;">
                <div style="width:60px; height:60px; margin:0 auto; border-radius:50%; background-image:url('${u.pfp}'); background-size:cover; border:2px solid var(--bright-lime); background-color:#eee;"></div>
                <h3 style="margin-top:10px;">${u.name}</h3>
                <p style="font-size:0.8rem;">${u.bio}</p>
            </div>`;
    });

    // Show found Projects
    posts.forEach(p => {
        container.innerHTML += `
            <div class="video-card" style="padding:15px;">
                <h3 style="margin:0;">${p.title}</h3>
                <p style="font-size:0.85rem; color:#666; margin-top:10px;">${p.content}</p>
            </div>`;
    });

    // IF nothing found in Database -> Ask the AI
    if (posts.length === 0) {
        askAI(query);
    }
}

// --- 6. UPLOAD ---
function uploadPost() {
    const t = prompt("Project Title:");
    const c = prompt("Description or URL:");
    if (t && c) {
        diyDatabase.push({ id: Date.now(), title: t, content: c, type: "intern" });
        localStorage.setItem('diy_data', JSON.stringify(diyDatabase));
        location.reload();
    }
}

// Initial Check
if(currentUser) updateProfileUI();
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
