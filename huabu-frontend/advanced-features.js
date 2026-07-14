class LayerManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.layers = [];
        this.activeLayerIndex = 0;
        this.layerPanel = null;
    }

    init() {
    
        this.createLayerPanel();
        this.createLayer('背景层');
    }
    createLayerPanel() {

        this.layerPanel = document.getElementById('layerPanel');
        if (!this.layerPanel) {
    
            const container = document.createElement('div');
            container.id = 'layerPanel';
            container.className = 'tool-panel';
            container.style.display = 'none';
            container.innerHTML = `
                <div class="panel-header">
                    <h3>图层</h3>
                    <button id="closeLayerPanel" class="close-btn">&times;</button>
                </div>
                <div class="layers-container"></div>
                <div class="layer-controls">
                    <button id="addLayerBtn" class="btn-sm">+</button>
                    <button id="deleteLayerBtn" class="btn-sm">-</button>
                    <button id="duplicateLayerBtn" class="btn-sm">⧉</button>
                    <button id="moveLayerUpBtn" class="btn-sm">↑</button>
                    <button id="moveLayerDownBtn" class="btn-sm">↓</button>
                </div>
            `;
            document.body.appendChild(container);
            this.layerPanel = container;

            document.getElementById('closeLayerPanel').addEventListener('click', () => {
                this.layerPanel.style.display = 'none';
            });
            document.getElementById('addLayerBtn').addEventListener('click', () => {
                this.createLayer(`图层${this.layers.length + 1}`);
            });
            document.getElementById('deleteLayerBtn').addEventListener('click', () => {
                this.deleteLayer(this.activeLayerIndex);
            });
            document.getElementById('duplicateLayerBtn').addEventListener('click', () => {
                this.duplicateLayer(this.activeLayerIndex);
            });
            document.getElementById('moveLayerUpBtn').addEventListener('click', () => {
                this.moveLayerUp(this.activeLayerIndex);
            });
            document.getElementById('moveLayerDownBtn').addEventListener('click', () => {
                this.moveLayerDown(this.activeLayerIndex);
            });
        }
    }

    createLayer(name) {

        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = this.canvas.width;
        layerCanvas.height = this.canvas.height;
        const layerCtx = layerCanvas.getContext('2d');

        const layer = {
            name,
            canvas: layerCanvas,
            ctx: layerCtx,
            visible: true,
            opacity: 1.0
        };

        this.layers.push(layer);
        this.activeLayerIndex = this.layers.length - 1;

        this.updateLayerPanel();

        this.renderAllLayers();

        return layer;
    }

    deleteLayer(index) {

        if (this.layers.length <= 1) {
            alert('至少需要保留一个图层！');
            return;
        }

        this.layers.splice(index, 1);

        if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = this.layers.length - 1;
        }

        this.updateLayerPanel();

        this.renderAllLayers();
    }

    duplicateLayer(index) {
        const originalLayer = this.layers[index];
        const newLayer = this.createLayer(`${originalLayer.name} 副本`);

        newLayer.ctx.drawImage(originalLayer.canvas, 0, 0);
        newLayer.opacity = originalLayer.opacity;
        newLayer.visible = originalLayer.visible;

        this.renderAllLayers();
    }

    moveLayerUp(index) {
        if (index < this.layers.length - 1) {
    
            const temp = this.layers[index];
            this.layers[index] = this.layers[index + 1];
            this.layers[index + 1] = temp;
    
            this.activeLayerIndex = index + 1;
    
            this.updateLayerPanel();
    
            this.renderAllLayers();
        }
    }

    moveLayerDown(index) {
        if (index > 0) {
    
            const temp = this.layers[index];
            this.layers[index] = this.layers[index - 1];
            this.layers[index - 1] = temp;
    
            this.activeLayerIndex = index - 1;
    
            this.updateLayerPanel();
    
            this.renderAllLayers();
        }
    }

    setLayerVisibility(index, visible) {
        this.layers[index].visible = visible;
        this.renderAllLayers();
    }

    setLayerOpacity(index, opacity) {
        this.layers[index].opacity = opacity;
        this.renderAllLayers();
    }

    setActiveLayer(index) {
        this.activeLayerIndex = index;
        this.updateLayerPanel();
    }

    getActiveLayerContext() {
        return this.layers[this.activeLayerIndex].ctx;
    }

    getActiveLayer() {
        return this.layers[this.activeLayerIndex];
    }

    renderAllLayers() {

        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.visible) {
                this.ctx.globalAlpha = layer.opacity;
                this.ctx.drawImage(layer.canvas, 0, 0);
                this.ctx.globalAlpha = 1.0;
            }
        }
    }

    updateLayerPanel() {
        const container = this.layerPanel.querySelector('.layers-container');
        container.innerHTML = '';

        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const layerElement = document.createElement('div');
            layerElement.className = `layer-item ${i === this.activeLayerIndex ? 'active' : ''}`;
            layerElement.innerHTML = `
                <input type="checkbox" class="layer-visibility" ${layer.visible ? 'checked' : ''}>
                <input type="text" class="layer-name" value="${layer.name}" size="10">
                <input type="range" class="layer-opacity" min="0" max="1" step="0.1" value="${layer.opacity}">
            `;

            layerElement.querySelector('.layer-visibility').addEventListener('change', (e) => {
                this.setLayerVisibility(i, e.target.checked);
            });
            layerElement.querySelector('.layer-name').addEventListener('change', (e) => {
                layer.name = e.target.value;
            });
            layerElement.querySelector('.layer-opacity').addEventListener('input', (e) => {
                this.setLayerOpacity(i, parseFloat(e.target.value));
            });
            layerElement.addEventListener('click', (e) => {

                if (!e.target.classList.contains('layer-visibility') && 
                    !e.target.classList.contains('layer-name') && 
                    !e.target.classList.contains('layer-opacity')) {
                    this.setActiveLayer(i);
                }
            });
            container.appendChild(layerElement);
        }
    }

    showLayerPanel() {
        if (this.layerPanel) {
            this.layerPanel.style.display = 'block';
        }
    }

    resizeLayers(width, height) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');

            tempCtx.fillStyle = state.canvasBgColor;
            tempCtx.fillRect(0, 0, width, height);

            tempCtx.drawImage(layer.canvas, 0, 0);

            layer.canvas.width = width;
            layer.canvas.height = height;
            layer.ctx.drawImage(tempCanvas, 0, 0);
        }

        this.renderAllLayers();
    }

    mergeAllLayers() {

        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = this.canvas.width;
        mergedCanvas.height = this.canvas.height;
        const mergedCtx = mergedCanvas.getContext('2d');

        mergedCtx.fillStyle = state.canvasBgColor;
        mergedCtx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.visible) {
                mergedCtx.globalAlpha = layer.opacity;
                mergedCtx.drawImage(layer.canvas, 0, 0);
                mergedCtx.globalAlpha = 1.0;
            }
        }

        this.layers = [];
        this.activeLayerIndex = 0;
        const newLayer = this.createLayer('合并图层');

        newLayer.ctx.drawImage(mergedCanvas, 0, 0);

        this.updateLayerPanel();

        this.renderAllLayers();
    }
}

class FilterManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.filterPanel = null;
    }

    init() {

        this.createFilterPanel();
    }

    createFilterPanel() {

        this.filterPanel = document.getElementById('filterPanel');
        if (!this.filterPanel) {
    
            const container = document.createElement('div');
            container.id = 'filterPanel';
            container.className = 'tool-panel';
            container.style.display = 'none';
            container.innerHTML = `
                <div class="panel-header">
                    <h3>滤镜</h3>
                    <button id="closeFilterPanel" class="close-btn">&times;</button>
                </div>
                <div class="filters-container">
                    <button class="filter-btn" data-filter="grayscale">灰度</button>
                    <button class="filter-btn" data-filter="invert">反色</button>
                    <button class="filter-btn" data-filter="blur">模糊</button>
                    <button class="filter-btn" data-filter="sharpen">锐化</button>
                    <button class="filter-btn" data-filter="brightness">亮度</button>
                    <button class="filter-btn" data-filter="contrast">对比度</button>
                    <button class="filter-btn" data-filter="saturation">饱和度</button>
                    <button class="filter-btn" data-filter="hue-rotate">色相旋转</button>
                    <button class="filter-btn" data-filter="sepia">复古</button>
                    <button class="filter-btn" data-filter="emboss">浮雕</button>
                    <button class="filter-btn" data-filter="pixelate">像素化</button>
                    <button class="filter-btn" data-filter="edge-detect">边缘检测</button>
                    <button class="filter-btn" data-filter="cold">冷色调</button>
                    <button class="filter-btn" data-filter="warm">暖色调</button>
                    <button class="filter-btn" data-filter="watercolor">水彩效果</button>
                </div>
                <div class="filter-controls">
                    <button id="resetFilterBtn" class="btn">重置滤镜</button>
                    <button id="applyFilterBtn" class="btn">应用滤镜</button>
                </div>
            `;
            document.body.appendChild(container);
            this.filterPanel = container;

            document.getElementById('closeFilterPanel').addEventListener('click', () => {
                this.filterPanel.style.display = 'none';
            });
            document.getElementById('resetFilterBtn').addEventListener('click', () => {

                if (typeof layerManager !== 'undefined') {

                }
            });
            document.getElementById('applyFilterBtn').addEventListener('click', () => {

                saveState();
                this.filterPanel.style.display = 'none';
            });
            
            const filterButtons = this.filterPanel.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filterType = button.getAttribute('data-filter');
                    this.applyFilter(filterType);
                });
            });
        }
    }

    applyFilter(filterType) {

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        switch (filterType) {
            case 'grayscale':
                this.grayscaleFilter(data);
                break;
            case 'invert':
                this.invertFilter(data);
                break;
            case 'blur':
                this.blurFilter(imageData);
                break;
            case 'sharpen':
                this.sharpenFilter(imageData);
                break;
            case 'brightness':
                this.brightnessFilter(data, 1.2);
                break;
            case 'contrast':
                this.contrastFilter(data, 1.2);
                break;
            case 'saturation':
                this.saturationFilter(data, 1.5);
                break;
            case 'hue-rotate':
                this.hueRotateFilter(data, 90);
                break;
            case 'sepia':
                this.sepiaFilter(data);
                break;
            case 'emboss':
                this.embossFilter(imageData);
                break;
            case 'pixelate':
                this.pixelateFilter(imageData, 10);
                break;
            case 'edge-detect':
                this.edgeDetectFilter(imageData);
                break;
            case 'cold':
                this.coldFilter(data);
                break;
            case 'warm':
                this.warmFilter(data);
                break;
            case 'watercolor':
                this.watercolorFilter(imageData);
                break;
        }

        if (filterType !== 'blur' && filterType !== 'sharpen' && filterType !== 'emboss' && filterType !== 'pixelate' && filterType !== 'edge-detect' && filterType !== 'watercolor') {
            this.ctx.putImageData(imageData, 0, 0);
        }
    }

    grayscaleFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    invertFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    blurFilter(imageData) {

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(imageData, 0, 0);

        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.filter = 'blur(3px)';
        this.ctx.drawImage(tempCanvas, 0, 0);

        this.ctx.filter = 'none';
    }

    sharpenFilter(imageData) {

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(imageData, 0, 0);

        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.filter = 'contrast(1.2) brightness(1.1)';
        this.ctx.drawImage(tempCanvas, 0, 0);

        this.ctx.filter = 'none';
    }

    brightnessFilter(data, factor) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);
            data[i + 1] = Math.min(255, data[i + 1] * factor);
            data[i + 2] = Math.min(255, data[i + 2] * factor);
        }
    }

    contrastFilter(data, factor) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, (data[i] - 128) * factor + 128);
            data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128);
            data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128);
        }
    }

    saturationFilter(data, factor) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray + (data[i] - gray) * factor;
            data[i + 1] = gray + (data[i + 1] - gray) * factor;
            data[i + 2] = gray + (data[i + 2] - gray) * factor;
        }
    }

    hueRotateFilter(data, degrees) {
        const radians = degrees * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Math.min(255, (r * (0.213 + cos * 0.787 - sin * 0.213)) +
                                   (g * (0.715 - cos * 0.715 - sin * 0.715)) +
                                   (b * (0.072 - cos * 0.072 + sin * 0.928)));
            data[i + 1] = Math.min(255, (r * (0.213 - cos * 0.213 + sin * 0.143)) +
                                   (g * (0.715 + cos * 0.285 + sin * 0.140)) +
                                   (b * (0.072 - cos * 0.072 - sin * 0.283)));
            data[i + 2] = Math.min(255, (r * (0.213 - cos * 0.213 - sin * 0.787)) +
                                   (g * (0.715 - cos * 0.715 + sin * 0.715)) +
                                   (b * (0.072 + cos * 0.928 + sin * 0.072)));
        }
    }

    sepiaFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));     // R
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); // G
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131)); // B
        }
    }

    embossFilter(imageData) {

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(imageData, 0, 0);

        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.filter = 'contrast(1.2) brightness(0.9) grayscale(1)';
        this.ctx.drawImage(tempCanvas, 0, 0);

        this.ctx.filter = 'none';
    }

    pixelateFilter(imageData, pixelSize) {

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width / pixelSize;
        tempCanvas.height = this.canvas.height / pixelSize;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(this.canvas, 0, 0, tempCanvas.width, tempCanvas.height);

        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
    }

    edgeDetectFilter(imageData) {

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(imageData, 0, 0);

        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.filter = 'contrast(1.5) brightness(1.1) grayscale(1)';
        this.ctx.drawImage(tempCanvas, 0, 0);

        this.ctx.filter = 'none';
    }

    coldFilter(data) {
        for (let i = 0; i < data.length; i += 4) {

            data[i] = Math.max(0, data[i] * 0.9);     // R
            data[i + 1] = data[i + 1];                 // G
            data[i + 2] = Math.min(255, data[i + 2] * 1.1); // B
        }
    }

    warmFilter(data) {
        for (let i = 0; i < data.length; i += 4) {

            data[i] = Math.min(255, data[i] * 1.1);     // R
            data[i + 1] = data[i + 1];                  // G
            data[i + 2] = Math.max(0, data[i + 2] * 0.9); // B
        }
    }

    watercolorFilter(imageData) {

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.putImageData(imageData, 0, 0);
        this.ctx.fillStyle = state.canvasBgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.filter = 'blur(1px) contrast(0.95) brightness(1.05)';
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.ctx.filter = 'none';
    }
    showFilterPanel() {
        if (this.filterPanel) {
            this.filterPanel.style.display = 'block';
        }
    }
}
class ExtendedDrawingTools {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isSelecting = false;
        this.draggingSelection = false;
        this.selectionRect = { x: 0, y: 0, width: 0, height: 0 };
        this.selectedImageData = null;
        this.dragOffset = { x: 0, y: 0 };
    }
    init() {
        this.addToolButtons();
    
        this.bindSelectionEvents();
    }
    addToolButtons() {
        if (!document.querySelector('.extended-tools')) {
            const toolsContainer = document.createElement('div');
            toolsContainer.className = 'tool-group extended-tools';
            toolsContainer.innerHTML = `
                <button id="fillTool" class="tool-btn" title="填充工具">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button id="sprayTool" class="tool-btn" title="喷枪工具">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6V2" stroke="currentColor" stroke-width="2"/>
                        <path d="M19 12H23" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 22V18" stroke="currentColor" stroke-width="2"/>
                        <path d="M2 12H6" stroke="currentColor" stroke-width="2"/>
                        <path d="M17.66 6.34L15.83 4.51" stroke="currentColor" stroke-width="2"/>
                        <path d="M17.66 17.66L15.83 19.49" stroke="currentColor" stroke-width="2"/>
                        <path d="M8.17 4.51L6.34 6.34" stroke="currentColor" stroke-width="2"/>
                        <path d="M8.17 19.49L6.34 17.66" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button id="selectTool" class="tool-btn" title="选择工具">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 3V9H3" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 15V21H15" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 21V15H21" stroke="currentColor" stroke-width="2"/>
                        <path d="M3 9V21H9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button id="gradientTool" class="tool-btn" title="渐变工具">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/>
                        <path d="M7 7L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            `;
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.appendChild(toolsContainer);
            }
            document.getElementById('fillTool').addEventListener('click', () => {
                this.setCurrentTool('fill');
            });
            document.getElementById('sprayTool').addEventListener('click', () => {
                this.setCurrentTool('spray');
            });
            document.getElementById('selectTool').addEventListener('click', () => {
                this.setCurrentTool('select');
                this.toggleSelectionMode();
            });
            document.getElementById('gradientTool').addEventListener('click', () => {
                this.setCurrentTool('gradient');
                this.showGradientDialog();
            });
        }
    }

    setCurrentTool(tool) {

        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            button.classList.remove('active');
        });

        const currentToolButton = document.getElementById(tool + 'Tool');
        if (currentToolButton) {
            currentToolButton.classList.add('active');
        }

        state.currentTool = tool;
    }

    toggleSelectionMode() {
        this.isSelecting = true;
        this.draggingSelection = false;
        this.selectedImageData = null;
        this.canvas.style.cursor = 'crosshair';
    }
    bindSelectionEvents() {

        const originalStartDrawing = startDrawing;
        startDrawing = function(e) {
            if (state.currentTool === 'select') {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.zoom;
                const y = (e.clientY - rect.top) / state.zoom;

                if (extendedTools.selectedImageData && 
                    x >= extendedTools.selectionRect.x && 
                    x <= extendedTools.selectionRect.x + extendedTools.selectionRect.width && 
                    y >= extendedTools.selectionRect.y && 
                    y <= extendedTools.selectionRect.y + extendedTools.selectionRect.height) {

                    extendedTools.draggingSelection = true;
                    extendedTools.dragOffset.x = x - extendedTools.selectionRect.x;
                    extendedTools.dragOffset.y = y - extendedTools.selectionRect.y;
                    canvas.style.cursor = 'move';
                } else {

                    extendedTools.clearSelection();
                    extendedTools.isSelecting = true;
                    extendedTools.selectionRect = { x, y, width: 0, height: 0 };
                    canvas.style.cursor = 'crosshair';
                }
            } else if (state.currentTool === 'fill') {
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) / state.zoom);
                const y = Math.floor((e.clientY - rect.top) / state.zoom);
                
                extendedTools.floodFill(x, y, state.currentColor);
            } else if (state.currentTool === 'gradient') {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.zoom;
                const y = (e.clientY - rect.top) / state.zoom;
                state.isDrawing = true;
                state.lastX = x;
                state.lastY = y;
            } else {
                
                originalStartDrawing(e);
            }
        };

        const originalDraw = draw;
        draw = function(e) {
            if (state.currentTool === 'select' && extendedTools.isSelecting) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.zoom;
                const y = (e.clientY - rect.top) / state.zoom;

                extendedTools.selectionRect.width = x - extendedTools.selectionRect.x;
                extendedTools.selectionRect.height = y - extendedTools.selectionRect.y;

                if (typeof layerManager !== 'undefined') {
                    layerManager.renderAllLayers();
                }

                ctx.strokeStyle = '#1a73e8';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(
                    Math.min(extendedTools.selectionRect.x, extendedTools.selectionRect.x + extendedTools.selectionRect.width),
                    Math.min(extendedTools.selectionRect.y, extendedTools.selectionRect.y + extendedTools.selectionRect.height),
                    Math.abs(extendedTools.selectionRect.width),
                    Math.abs(extendedTools.selectionRect.height)
                );
                ctx.setLineDash([]);
            } else if (state.currentTool === 'select' && extendedTools.draggingSelection) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.zoom;
                const y = (e.clientY - rect.top) / state.zoom;

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');

                if (typeof layerManager !== 'undefined') {
                    layerManager.renderAllLayers();
                    tempCtx.drawImage(canvas, 0, 0);
                }

                extendedTools.selectionRect.x = x - extendedTools.dragOffset.x;
                extendedTools.selectionRect.y = y - extendedTools.dragOffset.y;

                if (typeof layerManager !== 'undefined') {
                    layerManager.renderAllLayers();
                }

                if (extendedTools.selectedImageData) {
                    ctx.putImageData(extendedTools.selectedImageData, extendedTools.selectionRect.x, extendedTools.selectionRect.y);
                }

                ctx.strokeStyle = '#1a73e8';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(
                    extendedTools.selectionRect.x,
                    extendedTools.selectionRect.y,
                    extendedTools.selectionRect.width,
                    extendedTools.selectionRect.height
                );
                ctx.setLineDash([]);
            } else if (state.currentTool === 'spray' && state.isDrawing) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.zoom;
                const y = (e.clientY - rect.top) / state.zoom;

                let currentCtx = ctx;
                if (typeof layerManager !== 'undefined') {

                }

                currentCtx.fillStyle = state.currentColor;
                currentCtx.globalAlpha = state.currentOpacity;

                const radius = state.currentWidth / 2;
                const density = 10;
                for (let i = 0; i < density; i++) {

                    const offsetX = (Math.random() - 0.5) * radius * 2;
                    const offsetY = (Math.random() - 0.5) * radius * 2;
                    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

                    if (distance <= radius) {
                        const opacity = state.currentOpacity * (1 - distance / radius);
                        currentCtx.globalAlpha = opacity;
                        const dotSize = Math.random() * 2 + 1;
                        currentCtx.beginPath();
                        currentCtx.arc(x + offsetX, y + offsetY, dotSize / 2, 0, Math.PI * 2);
                        currentCtx.fill();
                    }
                }

                currentCtx.globalAlpha = state.currentOpacity;
            } else if (state.currentTool === 'gradient' && state.isDrawing) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / state.zoom;
                const y = (e.clientY - rect.top) / state.zoom;

                if (typeof layerManager !== 'undefined') {
                    layerManager.renderAllLayers();
                }

                const gradient = ctx.createLinearGradient(state.lastX, state.lastY, x, y);
                gradient.addColorStop(0, state.currentColor);
                gradient.addColorStop(1, state.gradientEndColor || '#FFFFFF');

                ctx.globalAlpha = state.currentOpacity;
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    Math.min(state.lastX, x),
                    Math.min(state.lastY, y),
                    Math.abs(x - state.lastX),
                    Math.abs(y - state.lastY)
                );
            } else {

                originalDraw(e);
            }
        };

        const originalStopDrawing = stopDrawing;
        stopDrawing = function() {
            if (state.currentTool === 'select') {
                if (extendedTools.isSelecting) {
                    extendedTools.isSelecting = false;

                    const width = Math.abs(extendedTools.selectionRect.width);
                    const height = Math.abs(extendedTools.selectionRect.height);

                    const x = Math.min(extendedTools.selectionRect.x, extendedTools.selectionRect.x + extendedTools.selectionRect.width);
                    const y = Math.min(extendedTools.selectionRect.y, extendedTools.selectionRect.y + extendedTools.selectionRect.height);

                    extendedTools.selectionRect.x = x;
                    extendedTools.selectionRect.y = y;
                    extendedTools.selectionRect.width = width;
                    extendedTools.selectionRect.height = height;

                    extendedTools.selectedImageData = ctx.getImageData(
                        x, y, width, height
                    );

                    ctx.strokeStyle = '#1a73e8';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(x, y, width, height);
                    ctx.setLineDash([]);
                } else if (extendedTools.draggingSelection) {
                    extendedTools.draggingSelection = false;
                    canvas.style.cursor = 'default';

                    saveState();
                }
            } else if (state.currentTool === 'gradient' && state.isDrawing) {
                state.isDrawing = false;

                saveState();
            } else {
                originalStopDrawing();
            }
        };
    }

    clearSelection() {
        if (typeof layerManager !== 'undefined') {
            layerManager.renderAllLayers();
        }
        this.selectedImageData = null;
        this.selectionRect = { x: 0, y: 0, width: 0, height: 0 };
    }

    floodFill(x, y, fillColor) {

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const fillRGB = this.hexToRgb(fillColor);

        const startIndex = (y * canvas.width + x) * 4;
        const targetR = data[startIndex];
        const targetG = data[startIndex + 1];
        const targetB = data[startIndex + 2];

        if (targetR === fillRGB.r && targetG === fillRGB.g && targetB === fillRGB.b) {
            return;
        }

        const queue = [{ x, y }];
        const visited = new Set();
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            const index = (y * canvas.width + x) * 4;

            const key = `${x},${y}`;
            if (visited.has(key)) {
                continue;
            }

            visited.add(key);

            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                continue;
            }

            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            if (r === targetR && g === targetG && b === targetB) {

                data[index] = fillRGB.r;
                data[index + 1] = fillRGB.g;
                data[index + 2] = fillRGB.b;

                queue.push({ x: x + 1, y });
                queue.push({ x: x - 1, y });
                queue.push({ x, y: y + 1 });
                queue.push({ x, y: y - 1 });
            }
        }
        ctx.putImageData(imageData, 0, 0);
        saveState();
    }
    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }
    showGradientDialog() {
        let gradientDialog = document.getElementById('gradientDialog');
        if (!gradientDialog) {
            gradientDialog = document.createElement('div');
            gradientDialog.id = 'gradientDialog';
            gradientDialog.className = 'modal';
            gradientDialog.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>渐变设置</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="gradientStartColor">起始颜色:</label>
                            <input type="color" id="gradientStartColor" value="${state.currentColor}">
                        </div>
                        <div class="form-group">
                            <label for="gradientEndColor">结束颜色:</label>
                            <input type="color" id="gradientEndColor" value="#FFFFFF">
                        </div>
                        <div class="form-group">
                            <label for="gradientType">渐变类型:</label>
                            <select id="gradientType">
                                <option value="linear">线性渐变</option>
                                <option value="radial">径向渐变</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-cancel">取消</button>
                        <button class="btn btn-confirm">确定</button>
                    </div>
                </div>
            `;
            document.body.appendChild(gradientDialog);
            const closeBtn = gradientDialog.querySelector('.close-modal');
            const cancelBtn = gradientDialog.querySelector('.btn-cancel');
            const confirmBtn = gradientDialog.querySelector('.btn-confirm');
            closeBtn.addEventListener('click', () => {
                gradientDialog.classList.remove('show');
            });
            cancelBtn.addEventListener('click', () => {
                gradientDialog.classList.remove('show');
            });
            confirmBtn.addEventListener('click', () => {
                const startColor = document.getElementById('gradientStartColor').value;
                const endColor = document.getElementById('gradientEndColor').value;
                const gradientType = document.getElementById('gradientType').value;
                    state.currentColor = startColor;
                state.gradientEndColor = endColor;
                state.gradientType = gradientType;
                colorPicker.value = startColor;
                gradientDialog.classList.remove('show');
            });
        }
        document.getElementById('gradientStartColor').value = state.currentColor;
        gradientDialog.classList.add('show');
    }
}
class TemplateManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.templates = [
            { name: '空白画布', width: 800, height: 600, bgColor: '#FFFFFF' },
            { name: 'A4 横向', width: 2480, height: 3508, bgColor: '#FFFFFF' },
            { name: 'A4 纵向', width: 3508, height: 2480, bgColor: '#FFFFFF' },
            { name: '正方形', width: 1000, height: 1000, bgColor: '#FFFFFF' },
            { name: '社交媒体封面', width: 1200, height: 630, bgColor: '#FFFFFF' },
            { name: '演示文稿幻灯片', width: 1920, height: 1080, bgColor: '#FFFFFF' },
            { name: '手机壁纸', width: 1080, height: 1920, bgColor: '#FFFFFF' },
            { name: 'Logo设计', width: 800, height: 800, bgColor: '#FFFFFF' },
            { name: '网页横幅', width: 1200, height: 300, bgColor: '#FFFFFF' },
            { name: 'Instagram帖子', width: 1080, height: 1080, bgColor: '#FFFFFF' }
        ];
        this.templatePanel = null;
    }
    init() {
        this.createTemplatePanel();
    }
    createTemplatePanel() {
        this.templatePanel = document.getElementById('templatePanel');
        if (!this.templatePanel) {
            const container = document.createElement('div');
            container.id = 'templatePanel';
            container.className = 'tool-panel';
            container.style.display = 'none';
            container.innerHTML = `
                <div class="panel-header">
                    <h3>模板</h3>
                    <button id="closeTemplatePanel" class="close-btn">&times;</button>
                </div>
                <div class="templates-container">
                </div>
                <div class="template-controls">
                    <button id="customTemplateBtn" class="btn">自定义尺寸</button>
                </div>
            `;
            document.body.appendChild(container);
            this.templatePanel = container;
            document.getElementById('closeTemplatePanel').addEventListener('click', () => {
                this.templatePanel.style.display = 'none';
            });
            document.getElementById('customTemplateBtn').addEventListener('click', () => {
                this.showCustomTemplateDialog();
            });
            this.generateTemplatePreviews();
        }
    }
    generateTemplatePreviews() {
        const container = this.templatePanel.querySelector('.templates-container');
        container.innerHTML = '';
        this.templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.innerHTML = `
                <div class="template-preview" style="background-color: ${template.bgColor};">
                    <div class="template-dimensions">${template.width} × ${template.height}</div>
                </div>
                <div class="template-name">${template.name}</div>
            `;
            const previewRatio = 150 / Math.max(template.width, template.height);
            const previewWidth = template.width * previewRatio;
            const previewHeight = template.height * previewRatio;
            const previewElement = templateItem.querySelector('.template-preview');
            previewElement.style.width = `${previewWidth}px`;
            previewElement.style.height = `${previewHeight}px`;
            templateItem.addEventListener('click', () => {
                this.applyTemplate(template);
            });
            container.appendChild(templateItem);
        });
    }
    applyTemplate(template) {
        saveState();
        this.canvas.width = template.width;
        this.canvas.height = template.height;
        state.canvasBgColor = template.bgColor;
        if (typeof layerManager !== 'undefined') {
            layerManager.resizeLayers(template.width, template.height);
        } else {
            this.ctx.fillStyle = template.bgColor;
            this.ctx.fillRect(0, 0, template.width, template.height);
        }
        this.templatePanel.style.display = 'none';
    }
    showCustomTemplateDialog() {
        let customTemplateDialog = document.getElementById('customTemplateDialog');
        if (!customTemplateDialog) {
            customTemplateDialog = document.createElement('div');
            customTemplateDialog.id = 'customTemplateDialog';
            customTemplateDialog.className = 'modal';
            customTemplateDialog.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>自定义画布尺寸</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="customWidth">宽度 (像素):</label>
                            <input type="number" id="customWidth" min="100" max="10000" value="800">
                        </div>
                        <div class="form-group">
                            <label for="customHeight">高度 (像素):</label>
                            <input type="number" id="customHeight" min="100" max="10000" value="600">
                        </div>
                        <div class="form-group">
                            <label for="customBgColor">背景颜色:</label>
                            <input type="color" id="customBgColor" value="#FFFFFF">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-cancel">取消</button>
                        <button class="btn btn-confirm">确定</button>
                    </div>
                </div>
            `;
            document.body.appendChild(customTemplateDialog);
            const closeBtn = customTemplateDialog.querySelector('.close-modal');
            const cancelBtn = customTemplateDialog.querySelector('.btn-cancel');
            const confirmBtn = customTemplateDialog.querySelector('.btn-confirm');
            closeBtn.addEventListener('click', () => {
                customTemplateDialog.classList.remove('show');
            });
            cancelBtn.addEventListener('click', () => {
                customTemplateDialog.classList.remove('show');
            });
            confirmBtn.addEventListener('click', () => {
                const width = parseInt(document.getElementById('customWidth').value);
                const height = parseInt(document.getElementById('customHeight').value);
                const bgColor = document.getElementById('customBgColor').value;
                const customTemplate = {
                    name: `自定义 ${width}×${height}`,
                    width,
                    height,
                    bgColor
                };
                this.applyTemplate(customTemplate);
                customTemplateDialog.classList.remove('show');
            });
        }
        customTemplateDialog.classList.add('show');
    }
    showTemplatePanel() {
        if (this.templatePanel) {
            this.templatePanel.style.display = 'block';
        }
    }
}
window.LayerManager = LayerManager;
window.FilterManager = FilterManager;
window.ExtendedDrawingTools = ExtendedDrawingTools;
window.TemplateManager = TemplateManager;