let diyDatabase = JSON.parse(localStorage.getItem('diy_data')) || [
    { id: 1, title: "Garden Bed", content: "Classic wooden structure.", type: "intern" }
];
let allUsers = JSON.parse(localStorage.getItem('diy_all_users')) || [
    { name: "Admin", bio: "Creator.", pfp: "", pass: "1234" }
];
let currentUser = JSON.parse(localStorage.getItem('diy_current_session')) || null;

// HIER KOMMT DEINE VERCEL URL REIN (später)
const BACKEND_URL = "https://DEIN-PROJEKT.vercel.app/api/ask";

function showSection(id) {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
}

function handleProfileClick() {
    if (currentUser) { updateProfileUI(); showSection('profile'); } 
    else { toggleLogin(); }
}

function toggleLogin() {
    const m = document.getElementById('login-modal');
    m.style.display = (m.style.display === 'none') ? 'flex' : 'none';
}

function performLogin() {
    const name = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    if (!name || !pass) return alert("Please enter name and password!");

    let user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (user) {
        // PASSWORT CHECK
        if (user.pass === pass) {
            currentUser = user;
            localStorage.setItem('diy_current_session', JSON.stringify(currentUser));
            location.reload();
        } else {
            alert("Wrong password! Access denied.");
        }
    } else {
        // REGISTER NEW USER
        currentUser = { name: name, bio: "New maker.", pfp: "", pass: pass };
        allUsers.push(currentUser);
        localStorage.setItem('diy_all_users', JSON.stringify(allUsers));
        localStorage.setItem('diy_current_session', JSON.stringify(currentUser));
        location.reload();
    }
}

function logout() { localStorage.removeItem('diy_current_session'); location.reload(); }

function updateProfileUI() {
    if (!currentUser) return;
    document.getElementById('profile-name-display').innerText = currentUser.name;
    document.getElementById('profile-bio-display').innerText = currentUser.bio;
    document.getElementById('login-btn').innerText = currentUser.name;
    if (currentUser.pfp) document.getElementById('pfp-display').style.backgroundImage = `url('${currentUser.pfp}')`;
}

function handleSearch() {
    const q = document.getElementById('search-input').value.trim();
    if (q) { showSection('app-content'); renderResults(q.toLowerCase()); }
}

function renderResults(query) {
    const container = document.getElementById('results-container');
    container.innerHTML = "";
    const posts = diyDatabase.filter(p => p.title.toLowerCase().includes(query));

    posts.forEach(p => {
        container.innerHTML += `<div class="video-card"><h3>${p.title}</h3><p>${p.content}</p></div>`;
    });

    if (posts.length === 0) askAI(query);
}

async function askAI(query) {
    const container = document.getElementById('results-container');
    const aiCard = document.createElement('div');
    aiCard.className = "video-card";
    aiCard.style.gridColumn = "1/-1";
    aiCard.innerHTML = "<h3>🤖 AI is thinking...</h3>";
    container.appendChild(aiCard);

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            body: JSON.stringify({ query: query })
        });
        const data = await response.json();
        aiCard.innerHTML = `<h3>🤖 AI Guide: ${query}</h3><p>${data.text}</p>`;
    } catch (e) {
        aiCard.innerHTML = "<h3>🤖 AI connection pending...</h3><p>Please search again in a moment.</p>";
    }
}

function uploadPost() {
    const t = prompt("Title:");
    const c = prompt("Content:");
    if (t && c) {
        diyDatabase.push({ id: Date.now(), title: t, content: c, type: "intern" });
        localStorage.setItem('diy_data', JSON.stringify(diyDatabase));
        location.reload();
    }
}

if(currentUser) updateProfileUI();
