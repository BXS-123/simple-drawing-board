const API_BASE_URL = '/api';

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
}

function setCurrentUser(username) {
    localStorage.setItem('currentUser', username);
}

function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

function isLoggedIn() {
    return getAuthToken() !== null;
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            setAuthToken(data.data.token);
            setCurrentUser(data.data.username);
            return true;
        }
        return false;
    } catch (error) {
        console.error('登录失败:', error);
        return false;
    }
}

async function register(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('注册失败:', error);
        return { success: false, message: '注册失败: ' + error.message };
    }
}

function logout() {
    removeAuthToken();
    removeCurrentUser();
}

async function saveWork(username, workId, workData) {
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, message: '请先登录' };
        }

        const payload = {
            title: workData.title,
            canvas_data: workData.canvasData || workData.canvas_data,
            thumbnail: workData.thumbnail,
            canvas_width: workData.canvasWidth || workData.canvas_width,
            canvas_height: workData.canvasHeight || workData.canvas_height,
            drawing_time: workData.drawingTime || workData.drawing_time || 0
        };

        let response;
        if (workId && workId.toString().match(/^\d+$/)) {
            response = await fetch(`${API_BASE_URL}/works/${workId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/works`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('保存作品时出错:', error);
        return { success: false, message: '保存作品时出错: ' + error.message };
    }
}

async function getUserWorks(username) {
    try {
        const token = getAuthToken();
        if (!token) {
            return {};
        }

        const response = await fetch(`${API_BASE_URL}/works`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            const works = {};
            data.data.forEach(work => {
                works[work.id] = transformWorkFromBackend(work);
            });
            return works;
        }
        return {};
    } catch (error) {
        console.error('获取作品列表失败:', error);
        return {};
    }
}

async function getWork(username, workId) {
    try {
        const token = getAuthToken();
        if (!token) {
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/works/${workId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            return transformWorkFromBackend(data.data);
        }
        return null;
    } catch (error) {
        console.error('获取作品失败:', error);
        return null;
    }
}

function getWorkIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('workId');
}

async function deleteWork(username, workId) {
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, message: '请先登录' };
        }

        const response = await fetch(`${API_BASE_URL}/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('删除作品失败:', error);
        return { success: false, message: '删除作品失败: ' + error.message };
    }
}

function transformWorkFromBackend(work) {
    return {
        id: work.id,
        title: work.title,
        thumbnail: work.thumbnail,
        canvasWidth: work.canvas_width,
        canvasHeight: work.canvas_height,
        canvasData: work.canvas_data,
        drawingTime: work.drawing_time || 0,
        createdAt: work.createdAt,
        updatedAt: work.updatedAt
    };
}

document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.pathname.includes('login.html')) {
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('loginError');
        if (loginBtn) {
            loginBtn.addEventListener('click', async function() {
                const username = usernameInput.value.trim();
                const password = passwordInput.value;
                if (!username || !password) {
                    loginError.textContent = '请输入用户名和密码';
                    loginError.style.display = 'block';
                    return;
                }
                const result = await login(username, password);
                if (result) {
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.textContent = '用户名或密码错误';
                    loginError.style.display = 'block';
                }
            });
        }
    }

    if (window.location.pathname.includes('register.html')) {
        const registerBtn = document.getElementById('registerBtn');
        const newUsername = document.getElementById('newUsername');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const registerError = document.getElementById('registerError');
        const registerSuccess = document.getElementById('registerSuccess');
        if (registerBtn) {
            registerBtn.addEventListener('click', async function() {
                const username = newUsername.value.trim();
                const password = newPassword.value;
                const confirmPass = confirmPassword.value;
                registerError.style.display = 'none';
                registerSuccess.style.display = 'none';
                if (!username || !password) {
                    registerError.textContent = '请填写完整信息';
                    registerError.style.display = 'block';
                    return;
                }
                if (password !== confirmPass) {
                    registerError.textContent = '两次输入的密码不一致';
                    registerError.style.display = 'block';
                    return;
                }
                const result = await register(username, password);
                if (result.success) {
                    registerSuccess.textContent = result.message;
                    registerSuccess.style.display = 'block';
                    newUsername.value = '';
                    newPassword.value = '';
                    confirmPassword.value = '';
                    setTimeout(function() {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    registerError.textContent = result.message;
                    registerError.style.display = 'block';
                }
            });
        }
    }

    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html') && 
        !isLoggedIn()) {
        window.location.href = 'login.html';
    }
});

async function loadWorkFromUrl() {
    try {
        const workId = getWorkIdFromUrl();
        const currentUser = getCurrentUser();
        if (workId && currentUser) {
            const work = await getWork(currentUser, workId);
            if (work) {
                console.log('加载作品成功:', work.title);
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = work.canvasWidth || 800;
                tempCanvas.height = work.canvasHeight || 600;
                const img = new Image();
                img.onload = function() {
                    if (window.canvas && window.ctx) {
                        window.canvas.width = tempCanvas.width;
                        window.canvas.height = tempCanvas.height;
                        window.ctx.drawImage(img, 0, 0);
                        if (window.state) {
                            window.state.canvasBgColor = work.backgroundColor || '#FFFFFF';
                        }
                    }
                };
                img.src = work.canvasData;
                return true;
            } else {
                console.warn('未找到指定的作品');
            }
        }
        return false;
    } catch (error) {
        console.error('加载作品时出错:', error);
        return false;
    }
}

async function changePassword(username, oldPassword, newPassword) {
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, message: '请先登录' };
        }

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('修改密码失败:', error);
        return { success: false, message: '修改密码失败: ' + error.message };
    }
}

async function getUserInfo() {
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, message: '请先登录' };
        }

        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return { success: false, message: '获取用户信息失败: ' + error.message };
    }
}

async function deleteAccount(username) {
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, message: '请先登录' };
        }

        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            logout();
        }
        return data;
    } catch (error) {
        console.error('注销账号失败:', error);
        return { success: false, message: '注销账号失败: ' + error.message };
    }
}

window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.login = login;
window.register = register;
window.logout = logout;
window.saveWork = saveWork;
window.getUserWorks = getUserWorks;
window.getWork = getWork;
window.getWorkIdFromUrl = getWorkIdFromUrl;
window.deleteWork = deleteWork;
window.changePassword = changePassword;
window.deleteAccount = deleteAccount;
window.getUserInfo = getUserInfo;
window.loadWorkFromUrl = loadWorkFromUrl;
window.showConfirmModal = showConfirmModal;
window.showCustomModal = showCustomModal;

function showCustomModal(title, message, type) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay modal-' + type;
    modal.innerHTML = `
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h3>${title}</h3>
                <button class="custom-modal-close">&times;</button>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-footer">
                <button class="custom-modal-btn ${type === 'success' ? 'btn-success' : type === 'error' ? 'btn-error' : 'btn-primary'}">确定</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.custom-modal-close');
    const confirmBtn = modal.querySelector('.custom-modal-btn');

    function closeModal() {
        modal.remove();
    }

    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
    });
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showConfirmModal(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay modal-warning';
    modal.innerHTML = `
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h3>${title}</h3>
                <button class="custom-modal-close">&times;</button>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-footer">
                <button class="custom-modal-btn btn-cancel">取消</button>
                <button class="custom-modal-btn btn-error">确定</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.custom-modal-close');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-error');

    function closeModal() {
        modal.remove();
    }

    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
        if (onCancel) onCancel();
    });

    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
        if (onCancel) onCancel();
    });

    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
        if (onConfirm) onConfirm();
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    });
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = 'true';
        logoutBtn.addEventListener('click', function() {
            showConfirmModal(
                '退出登录',
                '确定要退出登录吗？退出后将返回登录页面。',
                function() {
                    logout();
                    window.location.href = 'login.html';
                },
                function() {
                }
            );
        });
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

window.showToast = showToast;

document.addEventListener('DOMContentLoaded', function() {
    setupLogoutButton();
});
