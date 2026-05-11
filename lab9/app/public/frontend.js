const API_URL = '/api/v1'; // Adjusted to use the base inside public or local

// For consistency with app.js routes:
const API_USERS = '/api/users';
const API_VIDEOS = '/api/videos';

// State Management
let currentUser = null;
let currentVideos = [];
let currentPage = 1;
const limit = 6;

// Elements
const authNav = document.getElementById('auth-nav');
const authSection = document.getElementById('auth-section');
const videoSection = document.getElementById('video-section');
const videoList = document.getElementById('video-list');
const videoDetailSection = document.getElementById('video-detail-section');
const videoContent = document.getElementById('video-content');
const commentList = document.getElementById('comment-list');
const addCommentForm = document.getElementById('add-comment-form');
const commentLoginMsg = document.getElementById('comment-login-msg');
const btnCreateVideo = document.getElementById('btn-create-video');
const videoModal = document.getElementById('video-modal');

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadVideos();
    setupEventListeners();
});

function setupEventListeners() {
    // Auth links
    document.addEventListener('click', (e) => {
        if (e.target.id === 'link-login' || e.target.id === 'link-login-nav') {
            e.preventDefault();
            renderAuthForm('login');
        }
        if (e.target.id === 'link-signup') {
            e.preventDefault();
            renderAuthForm('signup');
        }
    });

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadVideos();
        }
    });
    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        loadVideos();
    });

    // Filtering & Sorting
    document.getElementById('filter-title').addEventListener('input', debounce(() => {
        currentPage = 1;
        loadVideos();
    }, 500));

    document.getElementById('sort-order').addEventListener('change', () => {
        currentPage = 1;
        loadVideos();
    });

    // Modal
    btnCreateVideo.addEventListener('click', () => videoModal.classList.remove('hidden'));
    document.getElementById('btn-close-modal').addEventListener('click', () => videoModal.classList.add('hidden'));

    // Create Video
    document.getElementById('create-video-form').addEventListener('submit', handleCreateVideo);

    // Back button
    document.getElementById('btn-back').addEventListener('click', () => {
        videoDetailSection.classList.add('hidden');
        videoSection.classList.remove('hidden');
    });

    // Submit Comment
    document.getElementById('btn-submit-comment').addEventListener('click', handleSubmitComment);
}

// Authentication Functions
function checkAuth() {
    const token = localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
        currentUser = user;
        renderUserNav();
        btnCreateVideo.classList.remove('hidden');
    } else {
        renderAuthNav();
    }
}

function renderAuthNav() {
    authNav.innerHTML = `<button class="btn btn-secondary" id="link-login-nav">Login</button>`;
}

function renderUserNav() {
    authNav.innerHTML = `
        <div class="user-badge">
            <span class="user-name">Hi, ${currentUser.name}</span>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    location.reload();
}

async function renderAuthForm(type) {
    videoSection.classList.add('hidden');
    videoDetailSection.classList.add('hidden');
    authSection.classList.remove('hidden');

    authSection.innerHTML = `
        <h3>${type === 'login' ? 'Login to your account' : 'Create an account'}</h3>
        <form id="auth-form" class="mt-1">
            ${type === 'signup' ? `
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="auth-name" required>
            </div>` : ''}
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="auth-email" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="auth-password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary w-100">${type === 'login' ? 'Login' : 'Sign Up'}</button>
            <p class="mt-1 text-center" style="margin-top: 1rem">
                ${type === 'login' ? 
                    `Don't have an account? <a href="#" id="link-signup">Sign up</a>` : 
                    `Already have an account? <a href="#" id="link-login">Login</a>`}
            </p>
        </form>
        <button class="btn btn-link" onclick="closeAuth()">Cancel</button>
    `;

    document.getElementById('auth-form').addEventListener('submit', (e) => handleAuth(e, type));
}

function closeAuth() {
    authSection.classList.add('hidden');
    videoSection.classList.remove('hidden');
}

async function handleAuth(e, type) {
    e.preventDefault();
    const data = {
        email: document.getElementById('auth-email').value,
        password: document.getElementById('auth-password').value
    };
    if (type === 'signup') data.name = document.getElementById('auth-name').value;

    const endpoint = type === 'signup' ? '/signup' : '/login';
    
    try {
        const res = await fetch(`${API_USERS}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            localStorage.setItem('jwt', result.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert('Authentication failed');
    }
}

// Video Functions
async function loadVideos() {
    const title = document.getElementById('filter-title').value;
    const sort = document.getElementById('sort-order').value;
    
    let url = `${API_VIDEOS}?page=${currentPage}&limit=${limit}&sort=${sort}`;
    if (title) url += `&title[regex]=${title}&title[options]=i`;

    try {
        const res = await fetch(url);
        const result = await res.json();
        
        if (result.status === 'success') {
            currentVideos = result.data.videos;
            renderVideos();
            updatePagination(result.results);
        }
    } catch (err) {
        console.error('Error loading videos', err);
    }
}

function renderVideos() {
    videoList.innerHTML = '';
    if (currentVideos.length === 0) {
        videoList.innerHTML = '<p class="info-msg">No videos found.</p>';
        return;
    }

    currentVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-card-body">
                <h3 class="video-card-title">${video.title}</h3>
                <p>${video.description ? video.description.substring(0, 80) + '...' : 'No description.'}</p>
                <div class="video-card-meta">
                    <span>By: ${video.user ? video.user.name : 'Unknown'}</span>
                    <span>${new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        card.onclick = () => showVideoDetail(video);
        videoList.appendChild(card);
    });
}

function updatePagination(results) {
    document.getElementById('page-info').innerText = `Page ${currentPage}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = results < limit;
}

async function handleCreateVideo(e) {
    e.preventDefault();
    const token = localStorage.getItem('jwt');
    const data = {
        title: document.getElementById('video-title').value,
        description: document.getElementById('video-desc').value
    };

    try {
        const res = await fetch(API_VIDEOS, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            videoModal.classList.add('hidden');
            document.getElementById('create-video-form').reset();
            loadVideos();
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert('Failed to create video');
    }
}

// Video Detail and Comments
let activeVideoId = null;

async function showVideoDetail(video) {
    activeVideoId = video._id;
    videoSection.classList.add('hidden');
    videoDetailSection.classList.remove('hidden');

    videoContent.innerHTML = `
        <h2 style="margin-bottom: 0.5rem">${video.title}</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem">Posted by ${video.user ? video.user.name : 'Unknown'} on ${new Date(video.createdAt).toLocaleString()}</p>
        <div style="background: #eee; height: 300px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem">
            <span style="font-size: 3rem">📺</span>
        </div>
        <p>${video.description || 'No description provided.'}</p>
    `;

    if (currentUser) {
        addCommentForm.classList.remove('hidden');
        commentLoginMsg.classList.add('hidden');
    } else {
        addCommentForm.classList.add('hidden');
        commentLoginMsg.classList.remove('hidden');
    }

    loadComments();
}

async function loadComments() {
    try {
        const res = await fetch(`${API_VIDEOS}/${activeVideoId}/comments`);
        const result = await res.json();
        
        if (result.status === 'success') {
            renderComments(result.data.comments);
        }
    } catch (err) {
        console.error('Error loading comments', err);
    }
}

function renderComments(comments) {
    commentList.innerHTML = '';
    if (comments.length === 0) {
        commentList.innerHTML = '<p class="info-msg" style="margin: 1rem 0">No comments yet. Be the first!</p>';
        return;
    }

    comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `
            <div class="comment-user">${comment.user ? comment.user.name : 'Unknown'} <span class="comment-date">• ${new Date(comment.createdAt).toLocaleDateString()}</span></div>
            <div class="comment-text">${comment.text}</div>
        `;
        commentList.appendChild(div);
    });
}

async function handleSubmitComment() {
    const text = document.getElementById('comment-text').value;
    if (!text) return;

    const token = localStorage.getItem('jwt');
    try {
        const res = await fetch(`${API_VIDEOS}/${activeVideoId}/comments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            document.getElementById('comment-text').value = '';
            loadComments();
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert('Failed to post comment');
    }
}

// Helpers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
