document.addEventListener('DOMContentLoaded', function() {
    const currentUsername = document.getElementById('currentUsername');
    const worksGrid = document.getElementById('worksGrid');
    const noWorks = document.getElementById('noWorks');
    const newWorkBtn = document.getElementById('newWorkBtn');
    const userCenterBtn = document.getElementById('userCenterBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUsername) {
        currentUsername.textContent = '欢迎，' + getCurrentUser() + '！';
    }

    loadUserWorks();

    if (newWorkBtn) {
        newWorkBtn.addEventListener('click', function() {
            window.location.href = `index.html?new=true`;
        });
    }

    if (userCenterBtn) {
        userCenterBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }

});

async function loadUserWorks() {
    const username = getCurrentUser();
    const works = await getUserWorks(username);
    const worksGrid = document.getElementById('worksGrid');
    const noWorks = document.getElementById('noWorks');

    if (!worksGrid || !noWorks) {
        return;
    }

    worksGrid.innerHTML = '';

    const workIds = Object.keys(works);
    if (workIds.length === 0) {
        noWorks.style.display = 'block';
    } else {
        noWorks.style.display = 'none';
        workIds.forEach(workId => {
            const work = works[workId];
            const workItem = createWorkItem(work);
            worksGrid.appendChild(workItem);
        });
    }
}

function createWorkItem(work) {
    const workItem = document.createElement('div');
    workItem.className = 'work-item';

    const createdAt = new Date(work.createdAt);
    const updatedAt = new Date(work.updatedAt);
    const formattedCreatedAt = formatDate(createdAt);
    const formattedUpdatedAt = formatDate(updatedAt);

    let thumbnailHtml = '<div class="work-preview"><i class="fas fa-image"></i></div>';
    if (work.thumbnail) {
        thumbnailHtml = `<div class="work-preview"><img src="${work.thumbnail}" alt="${work.title}"></div>`;
    }

    workItem.innerHTML = `
        ${thumbnailHtml}
        <div class="work-info">
            <h3 class="work-title">${work.title}</h3>
            <div class="work-meta">
                <div>创建于：${formattedCreatedAt}</div>
                <div>更新于：${formattedUpdatedAt}</div>
            </div>
            <div class="work-actions">
                <button class="btn-action btn-edit" data-id="${work.id}">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="btn-action btn-delete" data-id="${work.id}">
                    <i class="fas fa-trash-alt"></i> 删除
                </button>
            </div>
        </div>
    `;

    const editBtn = workItem.querySelector('.btn-edit');
    editBtn.addEventListener('click', function() {
        const workId = this.getAttribute('data-id');
        window.location.href = `index.html?workId=${workId}`;
    });

    const deleteBtn = workItem.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', async function() {
        const workId = this.getAttribute('data-id');
        showConfirmModal(
            '删除作品',
            '确定要删除这个作品吗？删除后将无法恢复。',
            async function() {
                const result = await deleteWork(getCurrentUser(), workId);
                if (result.success) {
                    loadUserWorks();
                } else {
                    showCustomModal('错误', result.message, 'error');
                }
            },
            function() {
                // 取消操作，不做任何处理
            }
        );
    });

    return workItem;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getWorkIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('workId');
}

