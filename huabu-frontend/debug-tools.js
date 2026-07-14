// 调试工具脚本 - 增强版
// 简化的调试工具 - 仅保留函数状态检查功能，不创建任何UI元素
// 此文件仅用于开发环境调试，不会影响生产环境功能
// 验证核心功能函数状态
function checkCoreFunctions() {
    console.log('调试工具：检查核心功能函数状态');
    try {
        // 检查函数是否存在
        const checkResults = {
            'saveCurrentWork': typeof window.saveCurrentWork === 'function',
            'exitEdit': typeof window.exitEdit === 'function',
            'getWorkIdFromUrl': typeof window.getWorkIdFromUrl === 'function',
            'getCurrentUser': typeof window.getCurrentUser === 'function'
        };
        // 输出检查结果
        console.log('--- 功能函数检查结果 ---');
        Object.entries(checkResults).forEach(([funcName, isAvailable]) => {
            console.log(`${funcName}: ${isAvailable ? '✓ 可用' : '✗ 不可用'}`);
        });
        return checkResults;
    } catch (e) {
        console.error('调试工具检查时出错:', e);
        return null;
    }
}
// 开发时可在控制台手动调用此函数进行测试
window.checkCoreFunctions = checkCoreFunctions;
