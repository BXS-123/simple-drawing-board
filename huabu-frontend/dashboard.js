/**
 * 用户仪表盘相关功能
 */
// 初始化仪表盘
function initDashboard() {
    console.log('初始化用户仪表盘...');
    // 检查用户是否已登录
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    // 显示用户信息
    displayUserInfo();
    // 加载用户统计信息（异步）
    loadUserStats();
    // 加载最近作品（异步）
    loadRecentWorks();
    // 绑定事件监听器
    bindEventListeners();
    console.log('用户仪表盘初始化完成！');
}
// 显示用户信息
function displayUserInfo() {
    const username = getCurrentUser();
    const usernameDisplay = document.getElementById('usernameDisplay');
    const userAvatar = document.getElementById('userAvatar');
    if (usernameDisplay) {
        usernameDisplay.textContent = `欢迎，${username}！`;
    }
    // 设置用户头像（使用用户名首字母）
    if (userAvatar && username) {
        userAvatar.textContent = username.charAt(0).toUpperCase();
        // 根据用户名生成颜色（简单的哈希算法）
        const colors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#ff9800', '#795548', '#607d8b'];
        const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorIndex = hash % colors.length;
        userAvatar.style.backgroundColor = colors[colorIndex];
    }
}
// 加载用户统计信息
async function loadUserStats() {
    const username = getCurrentUser();
    const works = await getUserWorks(username);
    // 计算作品数量
    const totalWorks = document.getElementById('totalWorks');
    if (totalWorks) {
        totalWorks.textContent = Object.keys(works).length;
    }
    // 计算总创作时间（基于每个作品的实际创作时间）
    const totalDrawingTime = document.getElementById('totalDrawingTime');
    if (totalDrawingTime) {
        let totalMinutes = 0;
        const workList = Object.values(works);
        workList.forEach(work => {
            // 优先使用作品的drawingTime属性（实际创作时间）
            if (work.drawingTime) {
                // drawingTime是以毫秒为单位的时间戳差
                const durationMinutes = Math.floor(work.drawingTime / (1000 * 60));
                totalMinutes += Math.max(1, durationMinutes); // 至少记录1分钟
            } else if (work.lastEditTime && work.createdAt) {
                // 如果没有drawingTime，回退到原来的计算方式
                const createTime = new Date(work.createdAt).getTime();
                const editTime = work.lastEditTime;
                const durationMinutes = Math.floor((editTime - createTime) / (1000 * 60));
                totalMinutes += Math.max(1, durationMinutes); // 至少记录1分钟
            } else if (work.createdAt) {
                // 如果没有lastEditTime，使用当前时间减去创建时间
                const createTime = new Date(work.createdAt).getTime();
                const currentTime = Date.now();
                const durationMinutes = Math.floor((currentTime - createTime) / (1000 * 60));
                totalMinutes += Math.max(1, Math.min(durationMinutes, 60)); // 限制在60分钟内
            } else {
                // 如果什么时间都没有，默认给5分钟
                totalMinutes += 5;
            }
        });
        // 直接显示计算结果，没有作品时显示0
        totalDrawingTime.textContent = totalMinutes;
    }
    // 计算存储空间使用（简化处理）
    const storageUsed = document.getElementById('storageUsed');
    if (storageUsed) {
        // 估算每个作品约100KB
        const storageKB = Object.keys(works).length * 100;
        const storageMB = (storageKB / 1024).toFixed(2);
        storageUsed.textContent = `${storageMB} MB`;
    }
}
// 加载最近作品
async function loadRecentWorks() {
    const username = getCurrentUser();
    const works = await getUserWorks(username);
    // 缓存作品数据供其他地方使用
    window._cachedWorks = works;
    const recentWorksGrid = document.getElementById('recentWorksGrid');
    const noRecentWorks = document.getElementById('noRecentWorks');
    if (!recentWorksGrid || !noRecentWorks) {
        return;
    }
    // 清空作品列表
    recentWorksGrid.innerHTML = '';
    // 将作品对象转换为数组并排序（按更新时间降序）
    const worksArray = Object.values(works).sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
    });
    // 获取最近的5个作品
    const recentWorks = worksArray.slice(0, 5);
    if (recentWorks.length === 0) {
        // 没有作品，显示提示信息
        noRecentWorks.style.display = 'block';
        recentWorksGrid.appendChild(noRecentWorks);
    } else {
        // 隐藏提示信息
        noRecentWorks.style.display = 'none';
        // 添加最近作品到页面
        recentWorks.forEach(work => {
            const workItem = createWorkItem(work);
            recentWorksGrid.appendChild(workItem);
        });
    }
}
// 创建作品项元素
function createWorkItem(work) {
    const workItem = document.createElement('div');
    workItem.className = 'work-item';
    // 格式化日期
    const updateDate = new Date(work.updatedAt || work.createdAt);
    const formattedDate = `${updateDate.getFullYear()}-${String(updateDate.getMonth() + 1).padStart(2, '0')}-${String(updateDate.getDate()).padStart(2, '0')}`;
    // 创建缩略图
    let thumbnail = work.thumbnail;
    if (!thumbnail) {
        // 如果没有缩略图，使用默认的占位符
        thumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7nq6/ljJbpgqHnqIvkuI3lmag8L3RleHQ+PC9zdmc+';
    }
    workItem.innerHTML = `
        <div class="work-preview">
            <img src="${thumbnail}" alt="${work.title}">
        </div>
        <div class="work-info">
            <div class="work-title">${work.title}</div>
            <div class="work-meta">更新于 ${formattedDate}</div>
            <div class="work-actions">
                <button class="work-action-btn edit-btn" data-id="${work.id}">
                    <i class="fas fa-edit"></i>
                    <span>编辑</span>
                </button>
                <button class="work-action-btn view-btn" data-id="${work.id}">
                    <i class="fas fa-eye"></i>
                    <span>查看</span>
                </button>
            </div>
        </div>
    `;
    // 添加点击事件监听
    const editBtn = workItem.querySelector('.edit-btn');
    const viewBtn = workItem.querySelector('.view-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            editWork(work.id);
        });
    }
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            viewWork(work.id);
        });
    }
    return workItem;
}
// 绑定事件监听器
function bindEventListeners() {
    // 新建作品按钮
    const newWorkBtn = document.getElementById('newWorkBtn');
    if (newWorkBtn) {
        newWorkBtn.addEventListener('click', createNewWork);
    }
    // 个人中心按钮
    const userCenterBtn = document.getElementById('userCenterBtn');
    if (userCenterBtn) {
        userCenterBtn.addEventListener('click', () => {
            window.location.href = 'user-center.html';
        });
    }

    // 快捷操作按钮
    const actionNewCanvas = document.getElementById('actionNewCanvas');
    if (actionNewCanvas) {
        actionNewCanvas.addEventListener('click', createNewWork);
    }
    const actionImport = document.getElementById('actionImport');
    if (actionImport) {
        actionImport.addEventListener('click', () => {
            // 创建一个隐藏的文件输入元素
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            // 添加文件选择事件处理
            fileInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    // 检查文件大小，限制为5MB以内
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (file.size > maxSize) {
                        alert('图片文件过大，请选择5MB以内的图片');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        // 使用localStorage存储图片数据，避免URL参数过长
                        try {
                            localStorage.setItem('importedImageData', event.target.result);
                            localStorage.setItem('importedImageName', file.name);
                            // 跳转到编辑页面，只传递导入标记
                            window.location.href = 'index.html?import=true';
                        } catch (error) {
                            console.error('存储图片数据失败:', error);
                            alert('图片数据过大，无法导入');
                        }
                    };
                    reader.onerror = function() {
                        alert('读取图片文件失败');
                    };
                    reader.readAsDataURL(file);
                }
            });
            // 将元素添加到body并触发点击
            document.body.appendChild(fileInput);
            fileInput.click();
            // 移除元素
            document.body.removeChild(fileInput);
        });
    }
    const actionManage = document.getElementById('actionManage');
    if (actionManage) {
        actionManage.addEventListener('click', () => {
            window.location.href = 'my-works.html';
        });
    }
}
// 创建新作品 - 修改为在编辑完成后再保存
function createNewWork() {
    // 直接跳转到空白画布页面，不预先保存
    window.location.href = 'index.html';
}
// 编辑作品
function editWork(workId) {
    window.location.href = `index.html?workId=${workId}`;
}
// 查看作品
function viewWork(workId) {
    // 这里可以实现一个预览模式，目前先跳转到编辑页面
    window.location.href = `index.html?workId=${workId}&viewMode=true`;
}



// 当DOM加载完成后初始化仪表盘
document.addEventListener('DOMContentLoaded', initDashboard);
