document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const registerTimeDisplay = document.getElementById('registerTimeDisplay');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const passwordError = document.getElementById('passwordError');
    const passwordSuccess = document.getElementById('passwordSuccess');
    const deleteError = document.getElementById('deleteError');
    const deleteSuccess = document.getElementById('deleteSuccess');

    displayUserInfo();

    backBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });

    changePasswordBtn.addEventListener('click', function() {
        handleChangePassword();
    });

    deleteAccountBtn.addEventListener('click', function() {
        handleDeleteAccount();
    });
});

async function displayUserInfo() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const registerTimeDisplay = document.getElementById('registerTimeDisplay');
    const username = window.getCurrentUser();
    
    if (!username) {
        if (usernameDisplay) {
            usernameDisplay.textContent = '未登录';
        }
        return;
    }
    
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
    
    try {
        const result = await window.getUserInfo();
        if (result.success && result.data && result.data.createdAt) {
            const registerDate = new Date(result.data.createdAt);
            registerTimeDisplay.textContent = formatDate(registerDate);
        } else {
            registerTimeDisplay.textContent = '未知';
        }
    } catch (error) {
        console.error('读取用户信息失败:', error);
        registerTimeDisplay.textContent = '获取失败';
    }
}

async function handleChangePassword() {
    const username = window.getCurrentUser();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const passwordError = document.getElementById('passwordError');
    const passwordSuccess = document.getElementById('passwordSuccess');

    passwordError.style.display = 'none';
    passwordSuccess.style.display = 'none';

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showCustomModal('错误', '请填写完整信息', 'error');
        return;
    }
    if (newPassword !== confirmNewPassword) {
        showCustomModal('错误', '两次输入的新密码不一致', 'error');
        return;
    }
    if (newPassword.length < 6) {
        showCustomModal('错误', '新密码长度至少为6位', 'error');
        return;
    }

    const result = await window.changePassword(username, currentPassword, newPassword);
    if (result.success) {
        showCustomModal('成功', result.message, 'success');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    } else {
        showCustomModal('错误', result.message, 'error');
    }
}

function handleDeleteAccount() {
    showConfirmModal(
        '警告',
        '账号注销后，您的所有作品和数据将被永久删除，无法恢复！\n\n确定要继续吗？',
        async function() {
            showConfirmModal(
                '最后确认',
                '这是最后的确认！一旦注销，数据将无法恢复！\n\n您确定要注销账号吗？',
                async function() {
                    const username = window.getCurrentUser();
                    const result = await window.deleteAccount(username);
                    if (result.success) {
                        showCustomModal('成功', '账号注销成功，即将跳转到登录页面...', 'success');
                        setTimeout(function() {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        showCustomModal('错误', result.message, 'error');
                    }
                },
                function() {
                    showCustomModal('提示', '已取消注销操作', 'info');
                }
            );
        },
        function() {
            showCustomModal('提示', '已取消注销操作', 'info');
        }
    );
}

function formatDate(date) {
    if (isNaN(date.getTime())) {
        return '未知';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

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