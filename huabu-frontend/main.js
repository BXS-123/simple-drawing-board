// 简易画板工具 - 主要功能实现
if (typeof state === 'undefined') {
    console.warn('app.js中的state对象尚未加载，创建临时state对象以防止应用崩溃');
    window.state = {
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
        canvasBgColor: '#FFFFFF'
    };
}
// DOM 元素 - 使用app.js中已声明的canvas、ctx和其他DOM变量
let lineWidthPicker, opacityPicker, lineCapPicker;
// 初始化函数
function init() {
    console.log('初始化画板工具...');
    // 检查是否已登录
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法初始化画板');
        return;
    }
    // 确保state对象已经正确初始化
    if (!state) {
        console.warn('state对象尚未初始化，创建临时state对象...');
        state = {
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
            canvasBgColor: '#FFFFFF'
        };
    }
    // 如果画布尺寸为0，则设置默认大小
    if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = 800;
        canvas.height = 600;
        clearCanvas();
    }
    // 获取线帽选择器（其他DOM元素已从window对象获取）
    lineCapPicker = document.getElementById('lineCap');
    // 初始化工具栏事件监听
    initToolbarEvents();
    // 初始化画布事件监听
    initCanvasEvents();
    // 初始化控制面板事件监听
    initControlPanelEvents();
    // 设置键盘快捷键
    initKeyboardShortcuts();
    // 保存初始状态
    saveState();
    console.log('画板工具初始化完成!');
}
// 初始化工具栏事件监听
function initToolbarEvents() {
    // 工具选择按钮
    const tools = ['brush', 'eraser', 'rectangle', 'circle', 'line', 'triangle', 'text'];
    tools.forEach(tool => {
        const button = document.querySelector(`.tool-item[data-tool="${tool}"]`);
        if (button) {
            button.addEventListener('click', () => setCurrentTool(tool));
        }
    });
    // 最近使用的颜色点击事件
    const colorSwatches = document.querySelectorAll('.color-swatch');
    if (colorSwatches) {
        colorSwatches.forEach(swatch => {
            if (swatch) {
                swatch.addEventListener('click', () => {
                    state.currentColor = swatch.getAttribute('data-color');
                    if (colorPicker) {
                        colorPicker.value = state.currentColor;
                    }
                });
            }
        });
    }
}
// 初始化画布事件监听
function initCanvasEvents() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法绑定事件监听器');
        return;
    }
    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    // 触摸事件（移动设备支持）
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    // 缩放事件
    canvas.addEventListener('wheel', handleZoom, { passive: false });
    // 鼠标位置显示
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / state.zoom);
        const y = Math.floor((e.clientY - rect.top) / state.zoom);
        const mousePositionEl = document.getElementById('mousePosition');
        if (mousePositionEl) {
            mousePositionEl.textContent = `鼠标位置: ${x}, ${y}`;
        }
    });
}
// 初始化控制面板事件监听
function initControlPanelEvents() {
    // 颜色选择器
    if (colorPicker) {
        colorPicker.addEventListener('input', () => {
            state.currentColor = colorPicker.value;
        });
    }
    // 线宽选择器
    if (lineWidthPicker && lineWidthValue) {
        lineWidthPicker.addEventListener('input', () => {
            state.currentWidth = parseInt(lineWidthPicker.value);
            lineWidthValue.textContent = `${state.currentWidth}px`;
        });
        // 初始化显示
        lineWidthValue.textContent = `${state.currentWidth}px`;
    }
    // 透明度选择器
    if (opacityPicker && opacityValue) {
        opacityPicker.addEventListener('input', () => {
            state.currentOpacity = parseFloat(opacityPicker.value);
            opacityValue.textContent = `${Math.round(state.currentOpacity * 100)}%`;
        });
        // 初始化显示
        opacityValue.textContent = `${Math.round(state.currentOpacity * 100)}%`;
    }
    // 笔触样式
    if (lineCapPicker) {
        lineCapPicker.addEventListener('change', () => {
            // 这里可以根据需要更新笔触样式
        });
    }
    // 菜单事件监听 - 检查元素是否存在再添加监听器
    const clearCanvasEl = document.getElementById('clearCanvas');
    const saveImageEl = document.getElementById('saveImage');
    const saveWorkEl = document.getElementById('saveWork');
    const exitEditEl = document.getElementById('exitEdit');
    const undoBtnEl = document.getElementById('undoBtn');
    const redoBtnEl = document.getElementById('redoBtn');
    const newCanvasEl = document.getElementById('newCanvas');
    const newCanvasModalEl = document.getElementById('newCanvasModal');
    if (clearCanvasEl) clearCanvasEl.addEventListener('click', clearCanvas);
    if (saveImageEl) saveImageEl.addEventListener('click', saveImage);
    if (saveWorkEl) saveWorkEl.addEventListener('click', saveCurrentWork);
    if (exitEditEl) exitEditEl.addEventListener('click', exitEdit);
    if (undoBtnEl) undoBtnEl.addEventListener('click', undo);
    if (redoBtnEl) redoBtnEl.addEventListener('click', redo);
    if (newCanvasEl && newCanvasModalEl) {
        newCanvasEl.addEventListener('click', () => {
            newCanvasModalEl.style.display = 'flex';
        });
    }
    // 视图菜单事件 - 检查元素是否存在再添加监听器
    const zoomInEl = document.getElementById('zoomIn');
    const zoomOutEl = document.getElementById('zoomOut');
    const resetZoomEl = document.getElementById('resetZoom');
    if (zoomInEl) {
        zoomInEl.addEventListener('click', () => {
            state.zoom = Math.min(5, state.zoom + 0.1);
            updateZoom();
        });
    }
    if (zoomOutEl) {
        zoomOutEl.addEventListener('click', () => {
            state.zoom = Math.max(0.1, state.zoom - 0.1);
            updateZoom();
        });
    }
    if (resetZoomEl) {
        resetZoomEl.addEventListener('click', () => {
            state.zoom = 1;
            updateZoom();
        });
    }
    // 状态栏按钮事件
    const showGridBtnEl = document.getElementById('showGridBtn');
    const fullscreenBtnEl = document.getElementById('fullscreenBtn');
    if (showGridBtnEl) {
        showGridBtnEl.addEventListener('click', function() {
            toggleGrid();
        });
    }
    if (fullscreenBtnEl) {
        fullscreenBtnEl.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log(`全屏请求错误: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }
    // 模态框事件
    initModalEvents();
}
// 初始化模态框事件
function initModalEvents() {
    // 关闭模态框函数
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    // 新建画布模态框
    const newCanvasModal = document.getElementById('newCanvasModal');
    if (newCanvasModal) {
        const closeBtn = newCanvasModal.querySelector('.close-modal');
        const cancelBtn = newCanvasModal.querySelector('.btn-cancel');
        const confirmBtn = newCanvasModal.querySelector('.btn-confirm');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal('newCanvasModal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('newCanvasModal'));
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const widthEl = document.getElementById('canvasWidth');
                const heightEl = document.getElementById('canvasHeight');
                const bgColorEl = document.getElementById('canvasBgColor');
                if (widthEl && heightEl && bgColorEl) {
                    const width = parseInt(widthEl.value);
                    const height = parseInt(heightEl.value);
                    const bgColor = bgColorEl.value;
                    createNewCanvas(width, height, bgColor);
                    closeModal('newCanvasModal');
                }
            });
        }
    }
    // 文字模态框
    const textModal = document.getElementById('textModal');
    if (textModal) {
        const closeBtn = textModal.querySelector('.close-modal');
        const cancelBtn = textModal.querySelector('.btn-cancel');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal('textModal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('textModal'));
    }
    // 关于模态框
    const aboutModal = document.getElementById('aboutModal');
    const aboutLink = document.getElementById('about');
    if (aboutModal) {
        const closeBtn = aboutModal.querySelector('.close-modal');
        const confirmBtn = aboutModal.querySelector('.btn-confirm');
        if (aboutLink) {
            aboutLink.addEventListener('click', () => {
                aboutModal.style.display = 'flex';
            });
        }
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal('aboutModal'));
        if (confirmBtn) confirmBtn.addEventListener('click', () => closeModal('aboutModal'));
    }
    // 帮助模态框
    const helpModal = document.getElementById('helpModal');
    const helpDocLink = document.getElementById('helpDoc');
    if (helpModal) {
        const closeBtn = helpModal.querySelector('.close-modal');
        const confirmBtn = helpModal.querySelector('.btn-confirm');
        if (helpDocLink) {
            helpDocLink.addEventListener('click', () => {
                helpModal.style.display = 'flex';
            });
        }
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal('helpModal'));
        if (confirmBtn) confirmBtn.addEventListener('click', () => closeModal('helpModal'));
    }
}
// 更新缩放
function updateZoom() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法更新缩放');
        return;
    }
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.transformOrigin = 'center';
    document.getElementById('zoomLevel').textContent = `缩放: ${Math.round(state.zoom * 100)}%`;
}
// 初始化键盘快捷键
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 撤销/重做
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        // 保存图片
        else if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
            e.preventDefault();
            saveImage();
        }
        // 保存作品
        else if (e.ctrlKey && e.shiftKey && e.key === 's') {
            e.preventDefault();
            saveCurrentWork();
        }
        // 新建画布
        else if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('newCanvasModal').style.display = 'flex';
        }
        // 清空画布
        else if (e.ctrlKey && e.shiftKey && e.key === 'x') {
            e.preventDefault();
            clearCanvas();
        }
        // 退出编辑
        else if (e.ctrlKey && e.key === 'q') {
            e.preventDefault();
            exitEdit();
        }
        // 工具选择快捷键
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
}
// 设置当前工具
function setCurrentTool(tool) {
    // 清除所有工具按钮的活动状态
    const toolButtons = document.querySelectorAll('.tool-item');
    toolButtons.forEach(button => {
        button.classList.remove('active');
    });
    // 设置当前工具按钮为活动状态
    const currentToolButton = document.querySelector(`.tool-item[data-tool="${tool}"]`);
    if (currentToolButton) {
        currentToolButton.classList.add('active');
    }
    // 更新状态
    state.currentTool = tool;
    // 更新当前工具显示
    const currentToolIcon = document.querySelector('.current-tool-icon i');
    const currentToolName = document.querySelector('.current-tool-name');
    // 工具图标映射
    const toolIcons = {
        brush: 'fa-paint-brush',
        eraser: 'fa-eraser',
        rectangle: 'fa-square',
        circle: 'fa-circle',
        line: 'fa-minus',
        triangle: 'fa-caret-up',
        text: 'fa-font'
    };
    // 工具名称映射
    const toolNames = {
        brush: '画笔',
        eraser: '橡皮擦',
        rectangle: '矩形',
        circle: '圆形',
        line: '直线',
        triangle: '三角形',
        text: '文字'
    };
    if (currentToolIcon && currentToolName) {
        // 移除所有图标类
        const iconClasses = Array.from(currentToolIcon.classList);
        iconClasses.forEach(cls => {
            if (cls.startsWith('fa-') && cls !== 'fas') {
                currentToolIcon.classList.remove(cls);
            }
        });
        // 添加新图标类
        if (toolIcons[tool]) {
            currentToolIcon.classList.add(toolIcons[tool]);
        }
        // 更新工具名称
        currentToolName.textContent = toolNames[tool] || tool;
    }
    // 设置光标样式
    setCanvasCursor(tool);
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
// 开始绘制
function startDrawing(e) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法开始绘制');
        return;
    }
    // 获取相对于画布的坐标
    const rect = canvas.getBoundingClientRect();
    state.lastX = (e.clientX - rect.left) / state.zoom;
    state.lastY = (e.clientY - rect.top) / state.zoom;
    state.isDrawing = true;
    // 如果是文本工具，显示文本输入对话框
    if (state.currentTool === 'text') {
        const textModal = document.getElementById('textModal');
        textModal.style.display = 'flex';
        // 保存当前点击位置，用于添加文本
        textModal.dataset.x = state.lastX;
        textModal.dataset.y = state.lastY;
        // 文本确认按钮事件
        const confirmBtn = textModal.querySelector('.btn-confirm');
        // 移除之前的事件监听器（避免重复）
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', () => {
            const textContent = document.getElementById('textContent').value;
            const fontFamily = document.getElementById('fontFamily').value;
            const fontSize = document.getElementById('fontSize').value;
            const fontStyle = document.getElementById('fontStyle').value;
            if (textContent) {
                drawText(textContent, parseFloat(textModal.dataset.x), parseFloat(textModal.dataset.y), fontFamily, fontSize, fontStyle);
                saveState();
                // 清空文本输入框
                document.getElementById('textContent').value = '';
            }
            textModal.style.display = 'none';
        });
        state.isDrawing = false;
    }
}
// 绘制
function draw(e) {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法进行绘制');
        return;
    }
    if (!state.isDrawing) return;
    // 获取相对于画布的坐标
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    // 设置绘制属性
    ctx.lineJoin = 'round';
    ctx.lineCap = lineCapPicker ? lineCapPicker.value : 'round';
    ctx.lineWidth = state.currentWidth;
    switch (state.currentTool) {
        case 'brush':
            ctx.strokeStyle = state.currentColor;
            ctx.globalAlpha = state.currentOpacity;
            drawBrush(x, y);
            break;
        case 'eraser':
            ctx.strokeStyle = state.canvasBgColor;
            ctx.globalAlpha = 1;
            drawBrush(x, y);
            break;
        case 'line':
            // 清除画布并重新绘制
            clearCanvas(false);
            ctx.strokeStyle = state.currentColor;
            ctx.globalAlpha = state.currentOpacity;
            // 绘制直线
                drawLine(x, y);
            break;
        case 'rectangle':
            // 清除画布并重新绘制
                clearCanvas(false);
                ctx.strokeStyle = state.currentColor;
                ctx.globalAlpha = state.currentOpacity;
                drawRectangle(x, y);
                break;
        case 'circle':
            // 清除画布并重新绘制
            clearCanvas(false);
            ctx.strokeStyle = state.currentColor;
            ctx.globalAlpha = state.currentOpacity;
            drawCircle(x, y);
            break;
        case 'triangle':
            // 清除画布并重新绘制
            clearCanvas(false);
            ctx.strokeStyle = state.currentColor;
            ctx.globalAlpha = state.currentOpacity;
            drawTriangle(x, y);
            break;
    }
}
// 停止绘制
function stopDrawing() {
    if (state.isDrawing) {
        state.isDrawing = false;
        // 对所有工具都保存状态
        saveState();
    }
}
// 绘制笔触
function drawBrush(x, y) {
    // 确保ctx变量已经正确初始化
    if (!ctx) {
        console.warn('ctx变量尚未初始化，无法绘制笔触');
        return;
    }
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    // 更新最后坐标
    state.lastX = x;
    state.lastY = y;
}
// 绘制直线
function drawLine(x, y) {
    // 确保ctx变量已经正确初始化
    if (!ctx) {
        console.warn('ctx变量尚未初始化，无法绘制直线');
        return;
    }
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}
// 绘制矩形
function drawRectangle(x, y) {
    // 确保ctx变量已经正确初始化
    if (!ctx) {
        console.warn('ctx变量尚未初始化，无法绘制矩形');
        return;
    }
    const width = x - state.lastX;
    const height = y - state.lastY;
    ctx.beginPath();
    ctx.rect(state.lastX, state.lastY, width, height);
    ctx.stroke();
}
// 绘制圆形
function drawCircle(x, y) {
    // 确保ctx变量已经正确初始化
    if (!ctx) {
        console.warn('ctx变量尚未初始化，无法绘制圆形');
        return;
    }
    const radius = Math.sqrt(Math.pow(x - state.lastX, 2) + Math.pow(y - state.lastY, 2));
    ctx.beginPath();
    ctx.arc(state.lastX, state.lastY, radius, 0, Math.PI * 2);
    ctx.stroke();
}
// 绘制三角形
function drawTriangle(x, y) {
    // 确保ctx变量已经正确初始化
    if (!ctx) {
        console.warn('ctx变量尚未初始化，无法绘制三角形');
        return;
    }
    const width = x - state.lastX;
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.lineTo(state.lastX - width, y);
    ctx.closePath();
    ctx.stroke();
}
// 绘制文本
function drawText(text, x, y, fontFamily = 'Arial', fontSize = '24', fontStyle = 'normal') {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法绘制文本');
        return;
    }
    ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = state.currentColor;
    ctx.globalAlpha = state.currentOpacity;
    ctx.fillText(text, x, y);
}
// 清空画布
function clearCanvas(shouldSaveState = true) {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法清空画布');
        return;
    }
    // 清除主画布
    ctx.fillStyle = state.canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 保存状态
    if (shouldSaveState) {
        saveState();
    }
}
// 保存图像
function saveImage() {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法保存图像');
        return;
    }
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`;
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.click();
}
// 创建新画布
function createNewCanvas(width, height, bgColor) {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法创建新画布');
        return;
    }
    // 尝试将宽度和高度转换为数字类型
    const w = Number(width);
    const h = Number(height);
    // 验证画布尺寸
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        console.warn('无效的画布尺寸，width和height必须为正数', { width, height, w, h });
        return;
    }
    // 保存当前状态
    saveState();
    // 更新画布尺寸和背景色
    canvas.width = w;
    canvas.height = h;
    state.canvasBgColor = bgColor;
    // 更新画布大小显示
    const canvasSizeElement = document.getElementById('canvasSize');
    if (canvasSizeElement) {
        canvasSizeElement.textContent = `画布大小: ${w}x${h}`;
    }
    // 清除画布
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    // 保存新状态
    saveState();
}
// 保存当前状态（用于撤销/重做）
function saveState() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法保存状态');
        return;
    }
    // 确保canvas尺寸有效
    if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn('canvas尺寸无效，无法保存状态');
        return;
    }
    // 保存当前画布状态
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // 如果在历史记录中间添加了新状态，删除后面的历史记录
    if (state.historyIndex < state.canvasHistory.length - 1) {
        state.canvasHistory = state.canvasHistory.slice(0, state.historyIndex + 1);
    }
    // 添加新状态到历史记录
    state.canvasHistory.push(imageData);
    state.historyIndex = state.canvasHistory.length - 1;
    // 限制历史记录长度
    const MAX_HISTORY = 50;
    if (state.canvasHistory.length > MAX_HISTORY) {
        state.canvasHistory.shift();
        state.historyIndex--;
    }
}
// 撤销
function undo() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法撤销操作');
        return;
    }
    if (state.historyIndex > 0) {
        state.historyIndex--;
        ctx.putImageData(state.canvasHistory[state.historyIndex], 0, 0);
    }
}
// 重做
function redo() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法重做操作');
        return;
    }
    if (state.historyIndex < state.canvasHistory.length - 1) {
        state.historyIndex++;
        ctx.putImageData(state.canvasHistory[state.historyIndex], 0, 0);
    }
}
// 处理触摸事件
function handleTouchStart(e) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法处理触摸开始事件');
        return;
    }
    if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
}
function handleTouchMove(e) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法处理触摸移动事件');
        return;
    }
    if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
}
function handleTouchEnd(e) {
    // 确保canvas变量已经正确初始化
    if (!canvas) {
        console.warn('canvas变量尚未初始化，无法处理触摸结束事件');
        return;
    }
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
}
// 处理缩放事件
function handleZoom(e) {
    e.preventDefault();
    // 计算新的缩放比例
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, state.zoom + delta));
    if (newZoom !== state.zoom) {
        state.zoom = newZoom;
        updateZoom();
    }
}
// 从URL加载作品
function loadWorkFromUrl() {
    // 确保canvas和ctx变量已经正确初始化
    if (!canvas || !ctx) {
        console.warn('canvas或ctx变量尚未初始化，无法从URL加载作品');
        return;
    }
    const workId = getWorkIdFromUrl();
    if (workId) {
        const username = getCurrentUser();
        const work = getWork(username, workId);
        if (work) {
            // 设置画布尺寸
            canvas.width = work.canvasWidth || 800;
            canvas.height = work.canvasHeight || 600;
            // 更新画布大小显示
            document.getElementById('canvasSize').textContent = `画布大小: ${canvas.width}x${canvas.height}`;
            // 清空画布并设置背景色
            ctx.fillStyle = state.canvasBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 加载画布数据
            if (work.canvasData) {
                const image = new Image();
                image.onload = function() {
                    ctx.drawImage(image, 0, 0);
                    saveState();
                };
                image.src = work.canvasData;
            }
        }
    }
}
async function saveCurrentWork() {
    try {
        console.log('开始保存作品...');
        const username = getCurrentUser();
        if (!username) {
            alert('请先登录后再保存作品');
            return;
        }
        const urlWorkId = getWorkIdFromUrl();
        const currentWorkId = state && state.currentWorkId ? state.currentWorkId : urlWorkId;
        if (!currentWorkId) {
            alert('无法保存作品：作品ID不存在');
            console.error('无法保存作品：作品ID不存在');
            return;
        }
        console.log('正在保存作品，ID:', currentWorkId, '用户:', username);
        if (!canvas) {
            alert('画布对象不存在，无法保存作品');
            console.error('画布对象不存在');
            return;
        }
        if (canvas.width === 0 || canvas.height === 0) {
            alert('画布尺寸无效，无法保存作品');
            console.error('画布尺寸无效:', canvas.width, 'x', canvas.height);
            return;
        }
        const title = state && state.currentWorkTitle ? state.currentWorkTitle : '未命名作品';
        console.log('使用作品名称:', title);
        const canvasData = canvas.toDataURL('image/png');
        const thumbnail = createThumbnail(canvasData);
        const workData = {
            id: currentWorkId,
            title: title || '未命名作品',
            thumbnail: thumbnail,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            canvasData: canvasData,
            drawingTime: window.currentDrawingTime || 0
        };
        const result = await saveWork(username, currentWorkId, workData);
        if (result.success) {
            if (result.data && result.data.id) {
                if (state) {
                    state.currentWorkId = result.data.id;
                }
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('workId', result.data.id);
                history.replaceState({}, '', window.location.pathname + '?' + urlParams.toString());
            }
            alert('作品保存成功！');
            console.log('作品保存成功:', result.data ? result.data.id : currentWorkId);
        } else {
            alert('作品保存失败：' + result.message);
            console.error('保存作品失败:', result.message);
        }
    } catch (error) {
        console.error('保存作品时发生异常:', error);
        alert('保存作品时发生异常: ' + error.message);
    }
}
// 创建缩略图
function createThumbnail(canvasData) {
    // 创建临时canvas用于生成缩略图
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    // 设置缩略图尺寸
    const maxWidth = 300;
    const maxHeight = 200;
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    tempCanvas.width = canvas.width * ratio;
    tempCanvas.height = canvas.height * ratio;
    // 绘制原图到临时canvas
    const image = new Image();
    image.src = canvasData;
    // 由于是同步函数，这里直接返回原数据作为缩略图（实际项目中应该等待image.onload后绘制）
    // 简化版本，实际项目中应该使用异步处理
    return canvasData;
}
function exitEdit() {
    const exitConfirmModal = document.getElementById('exitConfirmModal');
    if (!exitConfirmModal) {
        handleExitWithoutSave();
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
    };
    
    const handleConfirm = async () => {
        try {
            closeModal();
            console.log('用户选择保存作品后再退出');
            await saveCurrentWork();
            console.log('正在跳转到用户仪表盘页面...');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('退出编辑时出错:', error);
            alert('退出编辑时出错: ' + error.message);
        }
    };
    
    const handleExitWithoutSave = () => {
        console.log('正在跳转到用户仪表盘页面...');
        window.location.href = 'dashboard.html';
    };
    
    cancelBtn.addEventListener('click', handleCancel);
    confirmBtn.addEventListener('click', handleConfirm);
    closeBtn.addEventListener('click', handleCancel);
}
// 当文档加载完成后初始化画板
function initMain() {
    // 从外部的checkAppReady函数确保window.canvas已存在
    // 不再需要这里的警告和重试逻辑
    // 将window对象中的变量赋值给局部变量，方便使用
    canvas = window.canvas;
    ctx = window.ctx || canvas.getContext('2d');
    // 如果state对象未初始化，创建临时state对象以防止应用崩溃
    if (!window.state) {
        console.warn('app.js中的state对象尚未初始化，创建临时state对象...');
        state = {
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
            gradientEndColor: '#FFFFFF',
            gradientType: 'linear'
        };
        state.tempCtx = state.tempCanvas.getContext('2d');
    } else {
        state = window.state;
    }
    colorPicker = window.colorPicker;
    lineWidth = window.lineWidth;
    lineWidthValue = window.lineWidthValue;
    opacity = window.opacity;
    opacityValue = window.opacityValue;
    lineCap = window.lineCap;
    // 检查是否已登录
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    // 获取工具选择器和控制面板元素
    colorPicker = document.getElementById('colorPicker');
    lineWidthPicker = document.getElementById('lineWidth');
    opacityPicker = document.getElementById('opacity');
    lineCapPicker = document.getElementById('lineCap');
    lineWidthValue = document.getElementById('lineWidthValue');
    opacityValue = document.getElementById('opacityValue');
    // 初始化画笔工具
    initBrushTool();
    // 初始化橡皮擦工具
    initEraserTool();
    // 初始化形状工具
    initShapeTools();
    // 初始化文本工具
    initTextTool();
    // 初始化历史记录
    initHistory();
    // 初始化缩放功能
    initZoom();
    // 初始化键盘快捷键
    initKeyboardShortcuts();
    // 初始化撤销/重做功能
    initUndoRedo();
    // 初始化画布网格显示
    initGrid();
    // 初始化模态框
    initModals();
    // 初始化右键菜单
    initContextMenu();
    console.log('画板工具初始化完成！');
}
// 使用window.load事件确保所有资源都加载完成后再初始化main.js中的功能
window.addEventListener('load', function() {
    // 使用轮询方式确保app.js的核心变量已初始化
    const checkAppReady = function() {
        if (window.canvas && window.ctx && window.state) {
            console.log('app.js核心变量已初始化，开始初始化main.js功能');
            // 将window对象中的变量赋值给局部变量，方便使用
            canvas = window.canvas;
            ctx = window.ctx;
            state = window.state;
            colorPicker = window.colorPicker;
            lineWidthPicker = window.lineWidth;
            opacityPicker = window.opacity;
            lineWidthValue = window.lineWidthValue;
            opacityValue = window.opacityValue;
            // 先尝试从URL加载作品
            loadWorkFromUrl();
            // 再初始化main.js中的功能
            init();
        } else {
            // 继续等待，减少警告频率
            console.log('等待app.js核心变量初始化...');
            setTimeout(checkAppReady, 100);
        }
    };
    // 开始检查
    checkAppReady();
});
// 导出常用函数供外部调用
window.setCurrentTool = setCurrentTool;
window.clearCanvas = clearCanvas;
window.saveImage = saveImage;
window.undo = undo;
window.redo = redo;
window.saveCurrentWork = saveCurrentWork;
window.exitEdit = exitEdit;
