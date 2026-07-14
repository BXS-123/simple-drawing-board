// 导入图片处理工具
// 当页面加载时检查URL参数并处理图片导入
(function() {
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 检查是否已登录
        if (window.isLoggedIn && typeof window.isLoggedIn === 'function' && !isLoggedIn()) {
            // 如果未登录，不处理导入
            return;
        }
        // 解析URL参数
        const urlParams = new URLSearchParams(window.location.search);
        // 检查是否有导入图片参数
        const importImage = urlParams.get('import') === 'true';
        // 处理图片导入
        if (importImage) {
            // 从localStorage中获取图片数据
            const imageData = localStorage.getItem('importedImageData');
            if (imageData) {
                // 延迟执行，确保画布已初始化
                setTimeout(() => importImageToCanvas(imageData), 500);
                // 清理localStorage中的数据
                setTimeout(() => {
                    localStorage.removeItem('importedImageData');
                    localStorage.removeItem('importedImageName');
                }, 1000);
            } else {
                console.error('未找到导入的图片数据');
                alert('导入图片失败，请重试');
            }
        }
    });
    // 导入图片到画布
    function importImageToCanvas(imageData) {
        try {
            // 确保canvas和ctx已初始化
            const canvas = window.canvas;
            const ctx = window.ctx;
            if (!canvas || !ctx) {
                console.error('画布未初始化');
                alert('画布初始化失败，无法导入图片');
                return;
            }
            // 创建图像对象
            const img = new Image();
            // 设置图像加载完成后的处理函数
            img.onload = function() {
                // 调整画布尺寸以匹配图像大小
                canvas.width = img.width;
                canvas.height = img.height;
                // 如果有临时画布，也调整其尺寸
                if (window.state && window.state.tempCanvas) {
                    window.state.tempCanvas.width = img.width;
                    window.state.tempCanvas.height = img.height;
                }
                // 清空画布并绘制图像
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // 更新状态栏显示
                const canvasSize = document.getElementById('canvasSize');
                if (canvasSize) {
                    canvasSize.textContent = `画布大小: ${canvas.width}x${canvas.height}`;
                }
                // 保存状态
                if (typeof window.saveState === 'function') {
                    window.saveState();
                }
                console.log('图片导入成功，尺寸:', canvas.width, 'x', canvas.height);
            };
            // 设置图像加载错误处理函数
            img.onerror = function() {
                console.error('无法加载图像数据');
                alert('导入图片失败，请检查图片格式是否支持');
            };
            // 设置图像源
            img.src = imageData;
        } catch (error) {
            console.error('导入图片时出错:', error);
            alert('导入图片时出错: ' + error.message);
        }
    }
})();
