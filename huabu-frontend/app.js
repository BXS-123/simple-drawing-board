// 画板应用主文件
let canvas, ctx;
let colorPicker, lineWidth, lineWidthValue, opacity, opacityValue, lineCap;
let mousePosition, canvasSize, zoomLevel;
let currentToolIcon, currentToolName;
let modals, modalButtons, menuButtons, menuItems, toolItems, recentColors;
let textInputs, canvasInputs;
// 创作计时器相关变量
let startTime = 0;
let timerInterval = null;
let currentDrawingTime = 0;
let isTimerRunning = false;
// 应用状态
const state = {
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    currentTool: 'brush',
    currentColor: '#000000',
    currentWidth: 5,
    currentOpacity: 1,
    currentLineCap: 'round',
    zoom: 1,
    showGrid: false,
    darkMode: false,
    canvasHistory: [],
    historyIndex: -1,
    textPosition: { x: 0, y: 0 },
    shapeStart: { x: 0, y: 0 },
    tempCanvas: document.createElement('canvas'),
    tempCtx: null,
    canvasBgColor: '#FFFFFF',
    recentColorList: ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
    currentWorkTitle: '',
    currentWorkId: null,
    // 用于高级功能
    gradientEndColor: '#FFFFFF',
    gradientType: 'linear'
};
// 初始化临时画布
state.tempCtx = state.tempCanvas.getContext('2d');
// 工具图标映射
const toolIcons = {
    brush: 'paint-brush',
    eraser: 'eraser',
    rectangle: 'square',
    circle: 'circle',
    line: 'minus',
    triangle: 'caret-up',
    text: 'font'
};
// 初始化画布
function initCanvas(width = 800, height = 600, bgColor = '#FFFFFF') {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法初始化画布');
        return;
    }
    canvas.width = width;
    canvas.height = height;
    state.tempCanvas.width = width;
    state.tempCanvas.height = height;
    state.canvasBgColor = bgColor;
    // 设置画布背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 更新状态栏
    canvasSize.textContent = `画布大小: ${width}x${height}`;
    // 清空历史记录
    state.canvasHistory = [];
    state.historyIndex = -1;
    // 保存初始状态
    saveState();
}
// 保存当前画布状态到历史记录
function saveState() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法保存状态');
        return;
    }
    // 移除当前状态之后的所有历史记录（如果有的话）
    if (state.historyIndex < state.canvasHistory.length - 1) {
        state.canvasHistory = state.canvasHistory.slice(0, state.historyIndex + 1);
    }
    // 创建画布状态的副本
    const canvasData = canvas.toDataURL('image/png');
    state.canvasHistory.push(canvasData);
    state.historyIndex = state.canvasHistory.length - 1;
    // 更新撤销/重做按钮状态
    updateHistoryButtons();
}
// 更新撤销/重做按钮状态
function updateHistoryButtons() {
    menuItems.undoBtn.classList.toggle('disabled', state.historyIndex <= 0);
    menuItems.redoBtn.classList.toggle('disabled', state.historyIndex >= state.canvasHistory.length - 1);
}
// 撤销操作
function undo() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法撤销操作');
        return;
    }
    if (state.historyIndex > 0) {
        state.historyIndex--;
        const canvasData = state.canvasHistory[state.historyIndex];
        const img = new Image();
        img.src = canvasData;
        img.onload = function() {
            ctx.fillStyle = state.canvasBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        updateHistoryButtons();
    }
}
// 重做操作
function redo() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法重做操作');
        return;
    }
    if (state.historyIndex < state.canvasHistory.length - 1) {
        state.historyIndex++;
        const canvasData = state.canvasHistory[state.historyIndex];
        const img = new Image();
        img.src = canvasData;
        img.onload = function() {
            ctx.fillStyle = state.canvasBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        updateHistoryButtons();
    }
}
// 设置当前工具
function setCurrentTool(tool) {
    state.currentTool = tool;
    // 更新当前工具显示
    currentToolIcon.className = `fas fa-${toolIcons[tool]}`;
    currentToolName.textContent = getToolName(tool);
    // 更新工具选择状态
    toolItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tool === tool);
    });
    // 设置鼠标光标
    setCanvasCursor(tool);
}
// 获取工具名称
function getToolName(tool) {
    const toolNames = {
        brush: '画笔',
        eraser: '橡皮擦',
        rectangle: '矩形',
        circle: '圆形',
        line: '直线',
        triangle: '三角形',
        text: '文字'
    };
    return toolNames[tool] || tool;
}
// 设置画布光标样式
function setCanvasCursor(tool) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法设置光标样式');
        return;
    }
    const cursorStyles = {
        brush: 'crosshair',
        eraser: 'url("data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"%3E%3C/path%3E%3Cpath d="M2 2l7.586 7.586"%3E%3C/path%3E%3Ccircle cx="11" cy="11" r="2"%3E%3C/circle%3E%3C/svg%3E") 0 24, auto',
        rectangle: 'crosshair',
        circle: 'crosshair',
        line: 'crosshair',
        triangle: 'crosshair',
        text: 'text'
    };
    canvas.style.cursor = cursorStyles[tool] || 'crosshair';
}
// 开始绘图
function startDrawing(e) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法开始绘图');
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    state.isDrawing = true;
    state.lastX = x;
    state.lastY = y;
    state.shapeStart = { x, y };
    // 对于文本工具，显示文本输入模态框
    if (state.currentTool === 'text') {
        state.textPosition = { x, y };
        showModal('text');
        textInputs.content.focus();
        state.isDrawing = false;
    }
    // 对于形状工具，保存当前状态
    if (state.currentTool !== 'brush' && state.currentTool !== 'eraser' && state.currentTool !== 'text') {
        // 清空临时画布
        state.tempCtx.clearRect(0, 0, state.tempCanvas.width, state.tempCanvas.height);
        // 复制主画布到临时画布
        state.tempCtx.drawImage(canvas, 0, 0);
    }
    console.log(`开始绘图: ${state.currentTool} at (${x}, ${y})`);
}
// 绘制
function draw(e) {
    if (!state.isDrawing) return;
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法绘制');
        state.isDrawing = false;
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    ctx.lineJoin = 'round';
    ctx.lineCap = state.currentLineCap;
    ctx.lineWidth = state.currentWidth;
    ctx.globalAlpha = state.currentOpacity;
    if (state.currentTool === 'brush') {
        ctx.strokeStyle = state.currentColor;
        ctx.beginPath();
        ctx.moveTo(state.lastX, state.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        state.lastX = x;
        state.lastY = y;
    } else if (state.currentTool === 'eraser') {
        ctx.strokeStyle = state.canvasBgColor;
        ctx.beginPath();
        ctx.moveTo(state.lastX, state.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        state.lastX = x;
        state.lastY = y;
    } else if (state.currentTool === 'rectangle') {
        // 绘制矩形预览
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(state.tempCanvas, 0, 0);
        ctx.strokeStyle = state.currentColor;
        ctx.beginPath();
        ctx.rect(
            Math.min(state.shapeStart.x, x),
            Math.min(state.shapeStart.y, y),
            Math.abs(x - state.shapeStart.x),
            Math.abs(y - state.shapeStart.y)
        );
        ctx.stroke();
    } else if (state.currentTool === 'circle') {
        // 绘制圆形预览
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(state.tempCanvas, 0, 0);
        ctx.strokeStyle = state.currentColor;
        const radius = Math.sqrt(
            Math.pow(x - state.shapeStart.x, 2) + Math.pow(y - state.shapeStart.y, 2)
        );
        ctx.beginPath();
        ctx.arc(state.shapeStart.x, state.shapeStart.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (state.currentTool === 'line') {
        // 绘制直线预览
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(state.tempCanvas, 0, 0);
        ctx.strokeStyle = state.currentColor;
        ctx.beginPath();
        ctx.moveTo(state.shapeStart.x, state.shapeStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (state.currentTool === 'triangle') {
        // 绘制三角形预览
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(state.tempCanvas, 0, 0);
        ctx.strokeStyle = state.currentColor;
        ctx.beginPath();
        ctx.moveTo(state.shapeStart.x, Math.min(state.shapeStart.y, y));
        ctx.lineTo(
            state.shapeStart.x - (x - state.shapeStart.x),
            Math.max(state.shapeStart.y, y)
        );
        ctx.lineTo(x, Math.max(state.shapeStart.y, y));
        ctx.closePath();
        ctx.stroke();
    }
}
// 结束绘图
function stopDrawing() {
    if (!state.isDrawing) return;
    state.isDrawing = false;
    // 对于形状工具，保存最终状态
    if (state.currentTool !== 'brush' && state.currentTool !== 'eraser' && state.currentTool !== 'text') {
        saveState();
    }
    console.log(`停止绘图: ${state.currentTool}`);
}
// 清空画布
function clearCanvas() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法清空画布');
        return;
    }
    if (confirm('确定要清空画布吗？')) {
        ctx.fillStyle = state.canvasBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
        console.log('画布已清空');
    }
}
// 保存图片
function saveImage() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法保存图片');
        return;
    }
    const link = document.createElement('a');
    link.download = `drawing_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    console.log('图片已保存');
}
// 放大画布
function zoomIn() {
    state.zoom = Math.min(state.zoom + 0.1, 5);
    updateZoom();
    console.log(`放大画布: ${state.zoom}`);
}
// 缩小画布
function zoomOut() {
    state.zoom = Math.max(state.zoom - 0.1, 0.1);
    updateZoom();
    console.log(`缩小画布: ${state.zoom}`);
}
// 重置缩放
function resetZoom() {
    state.zoom = 1;
    updateZoom();
    console.log('重置缩放');
}
// 更新缩放显示
function updateZoom() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法更新缩放');
        return;
    }
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.transformOrigin = 'center center';
    zoomLevel.textContent = `缩放: ${Math.round(state.zoom * 100)}%`;
    // 调整画布容器的滚动
    const canvasContainer = canvas.parentElement;
    const rect = canvasContainer.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    if (canvasRect.width > rect.width || canvasRect.height > rect.height) {
        canvasContainer.scrollTop = (canvas.height * state.zoom - rect.height) / 2;
        canvasContainer.scrollLeft = (canvas.width * state.zoom - rect.width) / 2;
    }
}
// 切换网格显示
function toggleGrid() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法切换网格显示');
        return;
    }
    state.showGrid = !state.showGrid;
    // 检查canvasContainer是否存在
    const canvasContainer = canvas.parentElement;
    if (canvasContainer) {
        canvasContainer.classList.toggle('grid-background', state.showGrid);
    }
    // 检查menuItems.showGridBtn是否存在
    if (menuItems && menuItems.showGridBtn) {
        menuItems.showGridBtn.classList.toggle('active', state.showGrid);
    }
    console.log(`网格显示已${state.showGrid ? '启用' : '禁用'}`);
}
// 切换深色模式
function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);
    menuItems.darkModeBtn.classList.toggle('active', state.darkMode);
    // 如果是深色模式，切换按钮图标和文本
    if (state.darkMode) {
        menuItems.darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> 浅色模式';
    } else {
        menuItems.darkModeBtn.innerHTML = '<i class="fas fa-moon"></i> 深色模式';
    }
    console.log(`深色模式已${state.darkMode ? '启用' : '禁用'}`);
}
// 切换全屏
function toggleFullscreen() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法切换全屏');
        return;
    }
    // 检查canvasContainer是否存在
    const canvasContainer = canvas.parentElement;
    if (!canvasContainer) {
        console.warn('canvasContainer不存在，无法切换全屏');
        return;
    }
    if (!document.fullscreenElement) {
        if (canvasContainer.requestFullscreen) {
            canvasContainer.requestFullscreen();
        } else if (canvasContainer.mozRequestFullScreen) {
            canvasContainer.mozRequestFullScreen();
        } else if (canvasContainer.webkitRequestFullscreen) {
            canvasContainer.webkitRequestFullscreen();
        } else if (canvasContainer.msRequestFullscreen) {
            canvasContainer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}
// 显示模态框
function showModal(modalName) {
    if (modals[modalName]) {
        modals[modalName].classList.add('show');
        console.log(`显示模态框: ${modalName}`);
    }
}
// 隐藏模态框
function hideModal(modalName) {
    if (modals[modalName]) {
        modals[modalName].classList.remove('show');
        console.log(`隐藏模态框: ${modalName}`);
    }
}
// 添加文字到画布
function addText() {
    // 确保ctx变量已经正确初始化
    if (!ctx) {
        console.warn('ctx变量尚未初始化，无法添加文字');
        return;
    }
    const content = textInputs.content.value;
    if (!content.trim()) return;
    const fontFamily = textInputs.fontFamily.value;
    const fontSize = textInputs.fontSize.value;
    const fontStyle = textInputs.fontStyle.value;
    ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = state.currentColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(content, state.textPosition.x, state.textPosition.y);
    // 清空输入并关闭模态框
    textInputs.content.value = '';
    hideModal('text');
    // 保存状态
    saveState();
    console.log(`添加文字: ${content}`);
}
// 创建新画布
function createNewCanvas() {
    const width = parseInt(canvasInputs.width.value);
    const height = parseInt(canvasInputs.height.value);
    const bgColor = canvasInputs.bgColor.value;
    if (width && height && width > 0 && height > 0) {
        initCanvas(width, height, bgColor);
        hideModal('newCanvas');
    } else {
        alert('请输入有效的画布尺寸');
    }
}
// 更新最近使用的颜色
function updateRecentColors(color) {
    // 如果颜色已存在，移除它
    const colorIndex = state.recentColorList.indexOf(color);
    if (colorIndex !== -1) {
        state.recentColorList.splice(colorIndex, 1);
    }
    // 添加新颜色到开头
    state.recentColorList.unshift(color);
    // 保持列表长度为5
    if (state.recentColorList.length > 5) {
        state.recentColorList.pop();
    }
    // 更新UI
    recentColors.forEach((swatch, index) => {
        if (state.recentColorList[index]) {
            swatch.style.backgroundColor = state.recentColorList[index];
            swatch.setAttribute('data-color', state.recentColorList[index]);
        }
    });
}
// 更新鼠标位置
function updateMousePosition(e) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法更新鼠标位置');
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / state.zoom);
    const y = Math.round((e.clientY - rect.top) / state.zoom);
    mousePosition.textContent = `鼠标位置: ${x}, ${y}`;
}
// 绑定事件监听器
function bindEventListeners() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法绑定事件监听器');
        return;
    }
    // 画布事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDrawing);
    document.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mousemove', updateMousePosition);
    // 添加双击画布切换网格显示事件
    canvas.addEventListener('dblclick', (e) => {
        // 确保双击事件不与绘图冲突
        if (!state.isDrawing) {
            toggleGrid();
        }
    });
    // 颜色选择器事件
    colorPicker.addEventListener('input', (e) => {
        state.currentColor = e.target.value;
        updateRecentColors(e.target.value);
    });
    // 画笔粗细事件
    lineWidth.addEventListener('input', (e) => {
        state.currentWidth = parseInt(e.target.value);
        lineWidthValue.textContent = `${state.currentWidth}px`;
    });
    // 透明度事件
    opacity.addEventListener('input', (e) => {
        state.currentOpacity = parseFloat(e.target.value);
        opacityValue.textContent = `${Math.round(state.currentOpacity * 100)}%`;
    });
    // 笔触样式事件
    lineCap.addEventListener('change', (e) => {
        state.currentLineCap = e.target.value;
    });
    // 工具选择事件
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            setCurrentTool(item.dataset.tool);
        });
    });
    // 最近使用的颜色事件
    recentColors.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            const color = e.target.getAttribute('data-color');
            state.currentColor = color;
            colorPicker.value = color;
        });
    });
    // 菜单项事件
    menuItems.newCanvas.addEventListener('click', () => showModal('newCanvas'));
    menuItems.saveImage.addEventListener('click', saveImage);
    // 改进保存作品功能，添加更健壮的延迟重试机制
    menuItems.saveWork.addEventListener('click', function handleSaveWork() {
        const maxRetries = 3; // 最大重试次数
        let currentRetry = 0;
        function attemptSave() {
            if (window.saveCurrentWork && typeof window.saveCurrentWork === 'function') {
                try {
                    window.saveCurrentWork();
                } catch (error) {
                    console.error('保存作品时出错:', error);
                    alert('保存失败: ' + error.message);
                }
            } else {
                currentRetry++;
                if (currentRetry <= maxRetries) {
                    // 如果函数未加载完成，短暂延迟后重试
                    console.log(`保存功能尚未就绪，正在重试 (${currentRetry}/${maxRetries})...`);
                    setTimeout(attemptSave, currentRetry * 200); // 递增延迟时间
                } else {
                    console.error('保存作品功能加载超时');
                    alert('保存功能暂不可用，请稍后再试');
                }
            }
        }
        // 开始尝试保存
        attemptSave();
    });
    // 改进退出编辑功能，添加延迟重试机制
    menuItems.exitEdit.addEventListener('click', function handleExitEdit() {
        if (window.exitEdit && typeof window.exitEdit === 'function') {
            try {
                window.exitEdit();
            } catch (error) {
                console.error('退出编辑时出错:', error);
                alert('退出失败: ' + error.message);
            }
        } else {
            // 如果函数未加载完成，短暂延迟后重试
            setTimeout(() => {
                if (window.exitEdit && typeof window.exitEdit === 'function') {
                    try {
                        window.exitEdit();
                    } catch (error) {
                        console.error('退出编辑时出错:', error);
                        alert('退出失败: ' + error.message);
                    }
                } else {
                    console.error('退出编辑功能未加载完成');
                    alert('退出功能暂不可用，请稍后再试');
                }
            }, 100);
        }
    });
    menuItems.undoBtn.addEventListener('click', undo);
    menuItems.redoBtn.addEventListener('click', redo);
    menuItems.clearCanvas.addEventListener('click', clearCanvas);
    menuItems.zoomIn.addEventListener('click', zoomIn);
    menuItems.zoomOut.addEventListener('click', zoomOut);
    menuItems.resetZoom.addEventListener('click', resetZoom);
    menuItems.about.addEventListener('click', () => showModal('about'));
    menuItems.helpDoc.addEventListener('click', () => showModal('help'));
    menuItems.showGridBtn.addEventListener('click', toggleGrid);
    menuItems.fullscreenBtn.addEventListener('click', toggleFullscreen);
    menuItems.darkModeBtn.addEventListener('click', toggleDarkMode);
    // 模态框按钮事件
    // 新建画布模态框
    modalButtons.newCanvas.confirm.addEventListener('click', () => createNewCanvas());
    modalButtons.newCanvas.cancel.addEventListener('click', () => hideModal('newCanvas'));
    modalButtons.newCanvas.close.addEventListener('click', () => hideModal('newCanvas'));
    // 文本输入模态框
    modalButtons.text.confirm.addEventListener('click', addText);
    modalButtons.text.cancel.addEventListener('click', () => hideModal('text'));
    modalButtons.text.close.addEventListener('click', () => hideModal('text'));
    // 关于模态框
    modalButtons.about.confirm.addEventListener('click', () => hideModal('about'));
    modalButtons.about.close.addEventListener('click', () => hideModal('about'));
    // 帮助模态框
    modalButtons.help.confirm.addEventListener('click', () => hideModal('help'));
    modalButtons.help.close.addEventListener('click', () => hideModal('help'));
    // 快捷键事件
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z 撤销
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        // Ctrl+Y 重做
        else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        // Ctrl+S 保存
        else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveImage();
        }
        // Ctrl+N 新建画布
        else if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            showModal('newCanvas');
        }
        // Ctrl+Shift+X 清空画布
        else if (e.ctrlKey && e.shiftKey && e.key === 'x') {
            e.preventDefault();
            clearCanvas();
        }
        // 工具快捷键
        else if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    setCurrentTool('brush');
                    break;
                case 'e':
                    setCurrentTool('eraser');
                    break;
                case 'r':
                    setCurrentTool('rectangle');
                    break;
                case 'c':
                    setCurrentTool('circle');
                    break;
                case 'l':
                    setCurrentTool('line');
                    break;
                case 't':
                    setCurrentTool('text');
                    break;
            }
        }
    });
    // 全屏事件
    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = !!document.fullscreenElement;
        menuItems.fullscreenBtn.innerHTML = isFullscreen ?
            '<i class="fas fa-compress"></i> 退出全屏' :
            '<i class="fas fa-expand"></i> 全屏';
    });
}
// 初始化应用
function initApp() {
    // 获取DOM元素引用
    canvas = document.getElementById('drawingCanvas');
    // 检查画布元素是否存在
    if (!canvas) {
        console.error('未找到画布元素！');
        return;
    }
    ctx = canvas.getContext('2d');
    // 检查是否获取到画布上下文
    if (!ctx) {
        console.error('无法获取画布上下文！');
        return;
    }
    colorPicker = document.getElementById('colorPicker');
    lineWidth = document.getElementById('lineWidth');
    lineWidthValue = document.getElementById('lineWidthValue');
    opacity = document.getElementById('opacity');
    opacityValue = document.getElementById('opacityValue');
    lineCap = document.getElementById('lineCap');
    mousePosition = document.getElementById('mousePosition');
    canvasSize = document.getElementById('canvasSize');
    zoomLevel = document.getElementById('zoomLevel');
    currentToolIcon = document.querySelector('.current-tool-icon i');
    currentToolName = document.querySelector('.current-tool-name');
    // 模态框相关元素
    modals = {
        newCanvas: document.getElementById('newCanvasModal'),
        text: document.getElementById('textModal'),
        about: document.getElementById('aboutModal'),
        help: document.getElementById('helpModal')
    };
    modalButtons = {
        newCanvas: {
            confirm: modals.newCanvas?.querySelector('.btn-confirm'),
            cancel: modals.newCanvas?.querySelector('.btn-cancel'),
            close: modals.newCanvas?.querySelector('.close-modal')
        },
        text: {
            confirm: modals.text?.querySelector('.btn-confirm'),
            cancel: modals.text?.querySelector('.btn-cancel'),
            close: modals.text?.querySelector('.close-modal')
        },
        about: {
            confirm: modals.about?.querySelector('.btn-confirm'),
            close: modals.about?.querySelector('.close-modal')
        },
        help: {
            confirm: modals.help?.querySelector('.btn-confirm'),
            close: modals.help?.querySelector('.close-modal')
        }
    };
    // 菜单按钮
    menuButtons = {
        file: document.getElementById('fileMenuBtn'),
        tool: document.getElementById('toolMenuBtn'),
        edit: document.getElementById('editMenuBtn'),
        view: document.getElementById('viewMenuBtn'),
        help: document.getElementById('helpMenuBtn')
    };
    // 菜单项
    menuItems = {
        newCanvas: document.getElementById('newCanvas'),
        saveImage: document.getElementById('saveImage'),
        saveWork: document.getElementById('saveWork'),
        exitEdit: document.getElementById('exitEdit'),
        undoBtn: document.getElementById('undoBtn'),
        redoBtn: document.getElementById('redoBtn'),
        clearCanvas: document.getElementById('clearCanvas'),
        zoomIn: document.getElementById('zoomIn'),
        zoomOut: document.getElementById('zoomOut'),
        resetZoom: document.getElementById('resetZoom'),
        about: document.getElementById('about'),
        helpDoc: document.getElementById('helpDoc'),
        showGridBtn: document.getElementById('showGridBtn'),
        fullscreenBtn: document.getElementById('fullscreenBtn'),
        darkModeBtn: document.getElementById('darkModeBtn')
    };
    // 工具项
    toolItems = document.querySelectorAll('.tool-item');
    recentColors = document.querySelectorAll('.color-swatch');
    // 文本工具相关输入
    textInputs = {
        content: document.getElementById('textContent'),
        fontFamily: document.getElementById('fontFamily'),
        fontSize: document.getElementById('fontSize'),
        fontStyle: document.getElementById('fontStyle')
    };
    // 新建画布相关输入
    canvasInputs = {
        width: document.getElementById('canvasWidth'),
        height: document.getElementById('canvasHeight'),
        bgColor: document.getElementById('canvasBgColor')
    };
    // 初始化画布
    initCanvas();
    // 设置默认工具
    setCurrentTool('brush');
    // 绑定事件监听器
    bindEventListeners();
    // 初始化计时器
    initTimer();
    // 检查URL中是否有作品ID，如果有则加载作品
    loadWorkFromUrl();
    // 更新状态栏显示
    lineWidthValue.textContent = `${state.currentWidth}px`;
    opacityValue.textContent = `${Math.round(state.currentOpacity * 100)}%`;
    zoomLevel.textContent = `缩放: ${Math.round(state.zoom * 100)}%`;
    // 将必要的函数和变量暴露到window对象上供其他脚本使用（在变量初始化后）
    window.canvas = canvas;
    window.ctx = ctx;
    window.state = state;
    window.toggleGrid = toggleGrid;
    window.toggleDarkMode = toggleDarkMode;
    // 添加保存当前作品的函数实现
    async function performSaveWork(workTitle) {
        const username = window.getCurrentUser();
        const urlWorkId = window.getWorkIdFromUrl ? window.getWorkIdFromUrl() : null;
        const currentWorkId = state.currentWorkId || urlWorkId;
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width = 300;
        thumbnailCanvas.height = 200;
        const scale = Math.min(thumbnailCanvas.width / canvas.width, thumbnailCanvas.height / canvas.height);
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const offsetX = (thumbnailCanvas.width - scaledWidth) / 2;
        const offsetY = (thumbnailCanvas.height - scaledHeight) / 2;
        thumbnailCtx.fillStyle = '#f0f0f0';
        thumbnailCtx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnailCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, offsetX, offsetY, scaledWidth, scaledHeight);
        const thumbnailData = thumbnailCanvas.toDataURL('image/png');
        const workData = {
            id: currentWorkId || 'work_' + Date.now(),
            title: workTitle,
            thumbnail: thumbnailData,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            canvasData: canvas.toDataURL('image/png'),
            lastEditTime: Date.now(),
            drawingTime: currentDrawingTime
        };
        const result = await window.saveWork(username, currentWorkId, workData);
        if (result && result.success) {
            state.currentWorkTitle = workTitle;
            if (result.data && result.data.id) {
                state.currentWorkId = result.data.id;
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('workId', result.data.id);
                history.replaceState({}, '', window.location.pathname + '?' + urlParams.toString());
            }
            console.log('作品保存成功:', result.data ? result.data.id : workData.id);
        } else {
            throw new Error(result && result.message ? result.message : '保存失败');
        }
    }

    window.saveCurrentWork = async function() {
        try {
            if (window.getCurrentUser && window.saveWork && typeof window.getCurrentUser === 'function' && typeof window.saveWork === 'function') {
                const username = window.getCurrentUser();
                if (!username) {
                    console.error('无法获取当前用户');
                    window.showToast('请先登录', 'warning');
                    return;
                }
                const saveWorkModal = document.getElementById('saveWorkModal');
                if (!saveWorkModal) {
                    throw new Error('保存作品模态框未找到');
                }
                const titleInput = document.getElementById('workTitleInput');
                const cancelBtn = saveWorkModal.querySelector('.btn-cancel');
                const confirmBtn = saveWorkModal.querySelector('.btn-confirm');
                const closeBtn = saveWorkModal.querySelector('.close-modal');
                saveWorkModal.style.display = 'flex';
                titleInput.value = state.currentWorkTitle || '未命名作品';
                titleInput.focus();
                async function handleSave() {
                    const workTitle = titleInput.value.trim() || '未命名作品';
                    hideSaveModal();
                    await performSaveWork(workTitle);
                    window.showToast('作品保存成功！', 'success');
                }
                function hideSaveModal() {
                    saveWorkModal.style.display = 'none';
                    cancelBtn.removeEventListener('click', handleCancel);
                    confirmBtn.removeEventListener('click', handleSave);
                    closeBtn.removeEventListener('click', handleCancel);
                }
                function handleCancel() {
                    hideSaveModal();
                }
                cancelBtn.addEventListener('click', handleCancel);
                confirmBtn.addEventListener('click', handleSave);
                closeBtn.addEventListener('click', handleCancel);
            } else {
                throw new Error('保存功能依赖的函数不可用');
            }
        } catch (error) {
            console.error('保存作品时出错:', error);
            window.showToast('保存失败: ' + error.message, 'error');
        }
    };
    window.exitEdit = async function() {
        try {
            await stopTimer(true);
            
            const exitConfirmModal = document.getElementById('exitConfirmModal');
            if (!exitConfirmModal) {
                window.location.href = 'dashboard.html';
                return;
            }
            
            exitConfirmModal.style.display = 'flex';
            
            const cancelBtn = exitConfirmModal.querySelector('.btn-cancel');
            const confirmBtn = exitConfirmModal.querySelector('.btn-confirm');
            const closeBtn = exitConfirmModal.querySelector('.close-modal');
            
            const closeModal = () => {
                exitConfirmModal.style.display = 'none';
                cancelBtn.removeEventListener('click', handleCancel);
                confirmBtn.removeEventListener('click', handleConfirm);
                closeBtn.removeEventListener('click', handleCancel);
            };
            
            const handleCancel = () => {
                closeModal();
                console.log('用户选择不保存，直接退出');
                window.location.href = 'dashboard.html';
            };
            
            const handleConfirm = async () => {
                try {
                    closeModal();
                    console.log('用户选择保存作品后再退出');
                    const workTitle = state.currentWorkTitle || '未命名作品';
                    await performSaveWork(workTitle);
                    console.log('正在跳转到用户仪表盘页面...');
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    console.error('退出编辑时出错:', error);
                    window.showToast('退出编辑时出错: ' + error.message, 'error');
                }
            };
            
            cancelBtn.addEventListener('click', handleCancel);
            confirmBtn.addEventListener('click', handleConfirm);
            closeBtn.addEventListener('click', handleCancel);
        } catch (error) {
            console.error('退出编辑时出错:', error);
            alert('退出失败: ' + error.message);
        }
    };
    console.log('简易画板应用已成功初始化！所有核心功能应该可以正常使用了。');
}
// 初始化计时器
async function initTimer() {
    currentDrawingTime = 0;
    const workId = getWorkIdFromUrl();
    const username = window.getCurrentUser ? window.getCurrentUser() : null;
    if (username && workId && window.getWork && typeof window.getWork === 'function') {
        try {
            const work = await window.getWork(username, workId);
            if (work && work.drawingTime) {
                currentDrawingTime = work.drawingTime;
            }
        } catch (error) {
            console.error('加载作品创作时间时出错:', error);
        }
    }
    startTimer();
}
// 启动计时器
function startTimer() {
    if (!isTimerRunning) {
        startTime = Date.now() - currentDrawingTime;
        timerInterval = setInterval(function() {
            currentDrawingTime = Date.now() - startTime;
        }, 1000); // 每秒更新一次
        isTimerRunning = true;
    }
}
// 停止计时器
async function stopTimer(skipSave = false) {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (!skipSave) {
            const workId = state.currentWorkId || getWorkIdFromUrl();
            const username = window.getCurrentUser ? window.getCurrentUser() : null;
            if (username && workId && window.getCurrentUser && window.saveWork && typeof window.saveWork === 'function') {
                try {
                    let workData = null;
                    if (window.getWork && typeof window.getWork === 'function') {
                        workData = await window.getWork(username, workId);
                    }
                    if (workData) {
                        workData.drawingTime = currentDrawingTime;
                        await window.saveWork(username, workId, workData);
                        updateTotalDrawingTime();
                    }
                } catch (error) {
                    console.error('保存创作时间时出错:', error);
                }
            }
        }
    }
}
// 更新总创作时间
function updateTotalDrawingTime() {
    try {
        // 这个函数会在dashboard页面加载时调用，这里主要是为了确保时间被保存
        console.log('创作时间已保存:', Math.round(currentDrawingTime / 60000), '分钟');
    } catch (error) {
        console.error('更新总创作时间时出错:', error);
    }
}
// 从URL获取作品ID
function getWorkIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('workId');
}
// 从URL加载作品
async function loadWorkFromUrl() {
    try {
        const workId = getWorkIdFromUrl();
        if (workId) {
            if (window.getCurrentUser && window.getWork && typeof window.getCurrentUser === 'function' && typeof window.getWork === 'function') {
                const username = window.getCurrentUser();
                const work = await window.getWork(username, workId);
                if (work && work.canvasData) {
                    loadCanvasData(work);
                    state.currentWorkTitle = work.title || '';
                    document.title = `${work.title || '未命名作品'} - 简易画板`;
                    console.log('成功加载作品:', workId, work.title);
                } else {
                    console.warn('未找到指定的作品:', workId);
                }
            } else {
                console.warn('加载作品功能依赖的函数不可用');
            }
        }
    } catch (error) {
        console.error('加载作品时出错:', error);
        alert('加载作品失败: ' + error.message);
    }
}
// 加载画布数据
function loadCanvasData(work) {
    try {
        // 确保canvas和ctx变量已经正确初始化
        if (!canvas || !ctx) {
            console.warn('canvas或ctx变量尚未初始化，无法加载画布数据');
            return;
        }
        // 调整画布大小
        canvas.width = work.canvasWidth || 800;
        canvas.height = work.canvasHeight || 600;
        state.tempCanvas.width = canvas.width;
        state.tempCanvas.height = canvas.height;
        // 加载画布数据
        const img = new Image();
        img.src = work.canvasData;
        img.onload = function() {
            // 清空画布并绘制作品
            ctx.fillStyle = state.canvasBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            // 更新状态栏
            canvasSize.textContent = `画布大小: ${canvas.width}x${canvas.height}`;
            // 保存初始状态
            saveState();
        };
        img.onerror = function() {
            console.error('无法加载画布数据');
            alert('无法加载作品数据');
        };
    } catch (error) {
        console.error('加载画布数据时出错:', error);
        alert('加载画布数据失败: ' + error.message);
    }
}
// 当页面加载完成后初始化应用
window.addEventListener('load', initApp);
